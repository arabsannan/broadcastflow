"""
Owns the single, persistent Selenium session used to drive WhatsApp Web.

Design notes (read this before you touch WhatsApp DOM selectors):

1. WhatsApp Web has no unauthenticated API — this drives the real web
   app in a real browser. There is no way around the one-time QR scan
   on first login; that's a WhatsApp constraint, not a bug in this code.
2. Instead of clicking the search box and typing a number (fragile,
   depends on WhatsApp's current DOM), we use WhatsApp's own
   "click to chat" deep link: `web.whatsapp.com/send?phone=<number>`.
   This opens the right conversation directly and is far less brittle.
3. This is a module-level singleton (`get_session()`), not a class you
   instantiate per-request — there should only ever be one browser tab
   logged into one WhatsApp account for the app's lifetime.
4. WhatsApp regularly changes CSS class names, which is why the
   selectors below prefer stable `aria-label`/`data-testid`-style
   attributes over class names. Even so, expect to need to update these
   if WhatsApp ships a redesign — that's worth a line in your README,
   not something to hide.
"""

import time
import urllib.parse
from typing import Optional

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from app.core.config import settings

WHATSAPP_BASE_URL = "https://web.whatsapp.com"
LOGIN_TIMEOUT_SECONDS = 60
MESSAGE_BOX_TIMEOUT_SECONDS = 20


class WhatsAppSendError(Exception):
    """Raised when a message could not be delivered to a contact."""


class WhatsAppSession:
    def __init__(self) -> None:
        self._driver: Optional[webdriver.Chrome] = None

    def start(self) -> None:
        """Open Chrome and navigate to WhatsApp Web. Idempotent."""
        if self._driver is not None:
            return

        options = webdriver.ChromeOptions()
        if settings.chrome_profile_path:
            options.add_argument(f"user-data-dir={settings.chrome_profile_path}")
        if settings.whatsapp_headless:
            options.add_argument("--headless=new")
        options.add_argument("--start-maximized")

        self._driver = webdriver.Chrome(options=options)
        self._driver.get(WHATSAPP_BASE_URL)

    def is_connected(self) -> bool:
        """True once WhatsApp Web has finished loading a logged-in session."""
        if self._driver is None:
            return False
        try:
            # The chat list pane only exists once you're past the QR screen.
            self._driver.find_element(By.XPATH, "//div[@aria-label='Chat list']")
            return True
        except Exception:  # noqa: BLE001
            return False

    def wait_for_login(self, timeout: int = LOGIN_TIMEOUT_SECONDS) -> bool:
        """Block until the user has scanned the QR code, or timeout."""
        if self._driver is None:
            self.start()
        try:
            WebDriverWait(self._driver, timeout).until(
                EC.presence_of_element_located((By.XPATH, "//div[@aria-label='Chat list']"))
            )
            return True
        except Exception:  # noqa: BLE001
            return False

    def send_message(self, phone: str, message: str) -> None:
        """Open a chat via the click-to-chat deep link and send `message`."""
        if self._driver is None:
            raise WhatsAppSendError("WhatsApp session not started")

        encoded_message = urllib.parse.quote(message)
        url = f"{WHATSAPP_BASE_URL}/send?phone={phone}&text={encoded_message}"
        self._driver.get(url)

        self._dismiss_continue_to_chat_popup()

        try:
            message_box = WebDriverWait(self._driver, MESSAGE_BOX_TIMEOUT_SECONDS).until(
                EC.presence_of_element_located(
                      (By.XPATH, "//div[@data-testid='conversation-compose-box-input']")
                )
            )
        except Exception as exc:  # noqa: BLE001
            raise WhatsAppSendError(
                f"Could not open chat for {phone} (invalid number, or not on WhatsApp)"
            ) from exc

        time.sleep(1)  # let the pre-filled text box settle before sending
        message_box.send_keys(Keys.ENTER)
        time.sleep(settings.message_delay_seconds)

    def _dismiss_continue_to_chat_popup(self) -> None:
        """
        For numbers that aren't already in your device's contacts, WhatsApp
        Web shows a "Continue to Chat" confirmation button before opening
        the conversation. Click it if it appears; do nothing if it doesn't
        (e.g. the number IS a saved contact, so the chat opens directly).
        """
        try:
            continue_button = WebDriverWait(self._driver, 5).until(
                EC.element_to_be_clickable(
                    (By.XPATH, "//a[contains(text(), 'Continue to Chat')]")
                )
            )
            continue_button.click()
        except Exception:  # noqa: BLE001 - popup didn't appear, that's fine
            pass

    def quit(self) -> None:
        if self._driver is not None:
            self._driver.quit()
            self._driver = None


_session: Optional[WhatsAppSession] = None


def get_session() -> WhatsAppSession:
    global _session
    if _session is None:
        _session = WhatsAppSession()
    return _session