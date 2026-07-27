"""
Centralized app configuration.

Everything that varies between machines or environments (paths, delays,
feature flags) lives here and nowhere else, so no other module reaches
into `os.environ` directly.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    chrome_profile_path: str = ""
    whatsapp_headless: bool = False
    message_delay_seconds: float = 3.0
    frontend_origin: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
