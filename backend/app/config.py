import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    APP_NAME: str = "ORBITAL TWIN"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/orbital_twin.db")
    
    # NASA SMAP/MSL Dataset path
    NASA_DATA_PATH: str = os.getenv(
        "NASA_DATA_PATH", 
        str(BASE_DIR / "spacecraft-digital-twin-data" / "01_nasa_smap_msl")
    )
    
    # Grok AI Configuration
    GROK_API_KEY: str = os.getenv("GROK_API_KEY", "")
    GROK_MODEL: str = os.getenv("GROK_MODEL", "grok-beta")
    GROK_BASE_URL: str = os.getenv("GROK_BASE_URL", "https://api.x.ai/v1")
    
    # Models directory
    MODELS_DIR: str = str(BASE_DIR / "models")
    
    # Simulation settings
    SIMULATION_TICK_SECONDS: float = 1.0
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
