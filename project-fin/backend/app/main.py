from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.connection import engine, Base
from app.api import (
    auth, accounts, cards, categories, transactions,
    budgets, goals, investments, reports
)

# Create database tables automatically if they don't exist
Base.metadata.create_all(bind=engine)

# Dynamic DB Migration: Add effective_date and due_date columns if not present (SQLite handles ALTER TABLE ADD COLUMN)
from sqlalchemy import text
with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE transactions ADD COLUMN effective_date DATE"))
        conn.commit()
    except Exception:
        pass
with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE transactions ADD COLUMN due_date DATE"))
        conn.commit()
    except Exception:
        pass

# Seed default user felipe@test.com if it doesn't exist
from app.database.connection import SessionLocal
from app.repositories.base import user_repo, category_repo
from app.core.security import hash_password, generate_totp_secret

db = SessionLocal()
try:
    if not user_repo.exists_by_email(db, "felipe@test.com"):
        mfa_secret = generate_totp_secret()
        user_data = {
            "full_name": "Felipe Padrão",
            "email": "felipe@test.com",
            "password_hash": hash_password("123456"),
            "mfa_enabled": False,
            "mfa_secret": mfa_secret
        }
        user = user_repo.create(db, obj_in=user_data)
        
        # Seed default categories and subcategories for new user
        from app.database.seeding import seed_user_categories
        seed_user_categories(db, user.id)
finally:
    db.close()


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend migrated from Spring Boot to Python FastAPI",
    version="1.0.0"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Main router for /api/v1 prefix
api_router = APIRouter(prefix=settings.API_V1_STR)

api_router.include_router(auth.router)
api_router.include_router(accounts.router)
api_router.include_router(cards.router)
api_router.include_router(categories.router)
api_router.include_router(transactions.router)
api_router.include_router(budgets.router)
api_router.include_router(goals.router)
api_router.include_router(investments.router)
api_router.include_router(reports.router)

app.include_router(api_router)

@app.get("/")
def read_root():
    return {"message": "FinControl API is running smoothly!"}
