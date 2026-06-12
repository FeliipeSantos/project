import os

class Settings:
    PROJECT_NAME: str = "FinControl Backend"
    API_V1_STR: str = "/api/v1"
    
    JWT_SECRET: str = os.getenv(
        "JWT_SECRET", 
        "9a4f986d2b5a6c8e9d0f1e2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e"
    )
    JWT_EXPIRATION: int = int(os.getenv("JWT_EXPIRATION", 86400))  # 24 hours in seconds
    JWT_REFRESH_EXPIRATION: int = int(os.getenv("JWT_REFRESH_EXPIRATION", 604800))  # 7 days in seconds
    
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://fincontrol_user:fincontrol_secure_pass_2026@localhost:5432/fincontrol"
    )
    
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", 6379))
    REDIS_PASSWORD: str = os.getenv("REDIS_PASSWORD", "redis_secure_pass_2026")

settings = Settings()
