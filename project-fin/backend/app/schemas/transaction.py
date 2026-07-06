from uuid import UUID
from datetime import datetime, date
from typing import Optional, List
from app.schemas.base import CamelModel, Decimal

class TransactionInstallmentResponse(CamelModel):
    id: UUID
    installment_number: int
    total_installments: int
    value: Decimal
    due_date: date
    status: str
    created_at: datetime
    updated_at: datetime

class TransactionRequest(CamelModel):
    account_id: Optional[UUID] = None
    destination_account_id: Optional[UUID] = None
    category_id: Optional[UUID] = None
    credit_card_id: Optional[UUID] = None
    value: Decimal
    date: date
    type: str  # REVENUE, EXPENSE, TRANSFER
    description: str
    notes: Optional[str] = None
    attachments_url: Optional[str] = None
    tags: Optional[str] = None
    installments_count: Optional[int] = None
    effective: Optional[bool] = True
    effective_date: Optional[date] = None
    due_date: Optional[date] = None
    recurrence_type: Optional[str] = None
    start_installment: Optional[int] = None
    periodicity: Optional[str] = None
    value_type: Optional[str] = None

class TransactionResponse(CamelModel):
    id: UUID
    account_id: Optional[UUID] = None
    destination_account_id: Optional[UUID] = None
    category_id: Optional[UUID] = None
    credit_card_id: Optional[UUID] = None
    value: Decimal
    date: date
    type: str
    description: str
    notes: Optional[str] = None
    attachments_url: Optional[str] = None
    tags: Optional[str] = None
    effective: bool
    effective_date: Optional[date] = None
    due_date: Optional[date] = None
    installments: Optional[List[TransactionInstallmentResponse]] = None
    created_at: datetime
    updated_at: datetime
