from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List
from app.database.connection import get_db
from app.api.deps import get_current_user
from app.models.models import User, CreditCard, Transaction
from app.schemas.card import CreditCardRequest, CreditCardResponse
from app.repositories.base import card_repo
from app.services.audit import AuditLogService

router = APIRouter(prefix="/cards", tags=["cards"])

def build_card_response(card: CreditCard, db: Session) -> CreditCardResponse:
    transactions = db.query(Transaction).filter(
        Transaction.credit_card_id == card.id,
        Transaction.type == "EXPENSE"
    ).all()
    
    limit_used = sum(t.value for t in transactions) if transactions else Decimal("0.00")
    limit_available = card.limit_total - limit_used
    
    card_dict = {
        "id": card.id,
        "name": card.name,
        "bank": card.bank,
        "brand": card.brand,
        "limit_total": card.limit_total,
        "limit_used": limit_used,
        "limit_available": limit_available,
        "closing_day": card.closing_day,
        "due_day": card.due_day,
        "created_at": card.created_at,
        "updated_at": card.updated_at
    }
    return CreditCardResponse(**card_dict)

@router.post("", response_model=CreditCardResponse)
def create_card(
    request: CreditCardRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    obj_in = {
        "user_id": current_user.id,
        "name": request.name,
        "bank": request.bank,
        "brand": request.brand,
        "limit_total": request.limit_total,
        "closing_day": request.closing_day,
        "due_day": request.due_day
    }
    card = card_repo.create(db, obj_in=obj_in)
    response = build_card_response(card, db)
    AuditLogService.log_event(current_user.id, "CREATE", "CREDIT_CARD", card.id, None, response)
    return response

@router.get("", response_model=List[CreditCardResponse])
def list_cards(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cards = card_repo.find_by_user_id(db, current_user.id)
    return [build_card_response(card, db) for card in cards]

@router.get("/{id}", response_model=CreditCardResponse)
def get_card(
    id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    card = card_repo.find_by_id_and_user_id(db, id, current_user.id)
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cartão de crédito não encontrado"
        )
    return build_card_response(card, db)

@router.put("/{id}", response_model=CreditCardResponse)
def update_card(
    id: UUID,
    request: CreditCardRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    card = card_repo.find_by_id_and_user_id(db, id, current_user.id)
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cartão de crédito não encontrado"
        )
    
    before = build_card_response(card, db)
    
    obj_in = {
        "name": request.name,
        "bank": request.bank,
        "brand": request.brand,
        "limit_total": request.limit_total,
        "closing_day": request.closing_day,
        "due_day": request.due_day
    }
    
    updated_card = card_repo.update(db, db_obj=card, obj_in=obj_in)
    after = build_card_response(updated_card, db)
    AuditLogService.log_event(current_user.id, "UPDATE", "CREDIT_CARD", updated_card.id, before, after)
    return after

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_card(
    id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    card = card_repo.find_by_id_and_user_id(db, id, current_user.id)
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cartão de crédito não encontrado"
        )
    before = build_card_response(card, db)
    card_repo.remove(db, id=id)
    AuditLogService.log_event(current_user.id, "DELETE", "CREDIT_CARD", id, before, None)
