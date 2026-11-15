
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Configuración general de Food Store.

    Los valores se obtienen del archivo .env
    y se validan al inicializar la aplicación.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    DATABASE_URL: str = Field(min_length=1)

    SECRET_KEY: str = Field(min_length=32)

    ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default=30,
        gt=0,
    )

    FRONTEND_ORIGIN: str = "http://localhost:5173"


# Instancia única de configuración para la aplicación.
settings = Settings()
