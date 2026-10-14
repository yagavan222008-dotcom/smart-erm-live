import os
from pydantic import BaseModel


class Settings(BaseModel):
    APP_NAME: str = "SMART ERM — Smart Emergency Room Manager"
    API_V1_STR: str = "/api"
    # Persistent SQLite database location in data/ directory
    BASE_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
    DATA_DIR: str = os.path.join(BASE_DIR, "data")
    DB_PATH: str = os.path.join(DATA_DIR, "smart_erm.db")
    DATABASE_URL: str = f"sqlite:///{os.path.join(DATA_DIR, 'smart_erm.db')}"

    # Demo credentials and facility info
    FACILITY_NAME: str = "Metropolitan Central Emergency Center"
    DEMO_STAFF: str = "Dr. Eleanor Vance (ER Triage Officer)"
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]


settings = Settings()
