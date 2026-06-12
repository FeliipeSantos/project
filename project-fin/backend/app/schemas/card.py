from uuid import UUID
from datetime import datetime
from app.schemas.base import CamelModel, Decimal

class CreditCardRequest(CamelModel):
    name: str
    bank: str
    brand: str
    limit_total: Decimal
    closing_day: int
    due_day: int

class CreditCardResponse(CamelModel):
    id: UUID
    name: str
    bank: str
    brand: str
    limit_total: Decimal
    limit_used: Decimal
    limit_available: Decimal
    closing_day: int
    due_day: int
    created_at: datetime
    updated_at: datetime
