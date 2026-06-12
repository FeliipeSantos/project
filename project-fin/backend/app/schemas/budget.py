from uuid import UUID
from datetime import datetime
from app.schemas.base import CamelModel, Decimal

class BudgetRequest(CamelModel):
    category_id: UUID
    limit_value: Decimal
    month: int
    year: int

class BudgetResponse(CamelModel):
    id: UUID
    category_id: UUID
    category_name: str
    limit_value: Decimal
    current_value: Decimal
    month: int
    year: int
    created_at: datetime
    updated_at: datetime
