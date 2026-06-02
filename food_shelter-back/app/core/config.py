from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "RecipeBox"
    VERSION: str = "0.1.0"
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432

    OPENROUTER_API_KEY: Optional[str] = None
    OPENROUTER_MODEL: str = "qwen/qwen3-next-80b-a3b-instruct:free"
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    OPENROUTER_MAX_TOKENS: int = 900
    OPENROUTER_TEMPERATURE: float = 0.7
    OPENROUTER_TIMEOUT_SECONDS: float = 30.0
    OPENROUTER_SITE_URL: Optional[str] = None
    OPENROUTER_APP_NAME: str = "RecipeBox"

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    class Config:
        env_file = ".env"


settings = Settings()
