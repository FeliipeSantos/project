import datetime
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List
from calendar import monthrange

from app.database.connection import get_db
from app.api.deps import get_current_user
from app.models.models import User, Budget, Transaction, Category
from app.schemas.budget import BudgetRequest, BudgetResponse
from app.repositories.base import budget_repo, category_repo
from app.services.audit import AuditLogService

router = APIRouter(prefix="/budgets", tags=["budgets"])

def calculate_current_value(db: Session, user_id: UUID, category_id: UUID, month: int, year: int) -> Decimal:
    start_date = datetime.date(year, month, 1)
    last_day = monthrange(year, month)[1]
    end_date = datetime.date(year, month, last_day)
    
    total = db.query(func.sum(Transaction.value)).filter(
        Transaction.user_id == user_id,
        Transaction.category_id == category_id,
        Transaction.type == "EXPENSE",
        Transaction.date >= start_date,
        Transaction.date <= end_date
    ).scalar()
    
    return total or Decimal("0.00")

def build_budget_response(db: Session, budget: Budget, user_id: UUID) -> BudgetResponse:
    category = db.query(Category).filter(Category.id == budget.category_id).first()
    category_name = category.name if category else "Sem Categoria"
    
    curr_val = calculate_current_value(db, user_id, budget.category_id, budget.month, budget.year)
    
    return BudgetResponse(
        id=budget.id,
        category_id=budget.category_id,
        category_name=category_name,
        limit_value=budget.limit_value,
        current_value=curr_val,
        month=budget.month,
        year=budget.year,
        created_at=budget.created_at,
        updated_at=budget.updated_at
    )

def validate_category(db: Session, category_id: UUID, user_id: UUID):
    category = category_repo.find_by_id_and_user_id_or_system(db, category_id, user_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Categoria não encontrada"
        )

@router.post("", response_model=BudgetResponse)
def create_budget(
    request: BudgetRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    validate_category(db, request.category_id, current_user.id)
    
    existing = budget_repo.find_by_user_and_category_and_date(
        db, current_user.id, request.category_id, request.month, request.year
    )
    
    is_update = existing is not None
    if is_update:
        # Update existing limit value
        obj_in = {"limit_value": request.limit_value}
        budget = budget_repo.update(db, db_obj=existing, obj_in=obj_in)
    else:
        obj_in = {
            "user_id": current_user.id,
            "category_id": request.category_id,
            "limit_value": request.limit_value,
            "month": request.month,
            "year": request.year
        }
        budget = budget_repo.create(db, obj_in=obj_in)
        
    response = build_budget_response(db, budget, current_user.id)
    AuditLogService.log_event(
        current_user.id, 
        "UPDATE" if is_update else "CREATE", 
        "BUDGET", 
        budget.id, 
        None, 
        response
    )
    return response

@router.get("", response_model=List[BudgetResponse])
def list_budgets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    budgets = budget_repo.find_by_user_id(db, current_user.id)
    return [build_budget_response(db, b, current_user.id) for b in budgets]

@router.get("/{id}", response_model=BudgetResponse)
def get_budget(
    id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    budget = budget_repo.find_by_id_and_user_id(db, id, current_user.id)
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Orçamento não encontrado"
        )
    return build_budget_response(db, budget, current_user.id)

@router.put("/{id}", response_model=BudgetResponse)
def update_budget(
    id: UUID,
    request: BudgetRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    budget = budget_repo.find_by_id_and_user_id(db, id, current_user.id)
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Orçamento não encontrado"
        )
        
    validate_category(db, request.category_id, current_user.id)
    before = build_budget_response(db, budget, current_user.id)
    
    obj_in = {
        "category_id": request.category_id,
        "limit_value": request.limit_value,
        "month": request.month,
        "year": request.year
    }
    
    updated_budget = budget_repo.update(db, db_obj=budget, obj_in=obj_in)
    after = build_budget_response(db, updated_budget, current_user.id)
    AuditLogService.log_event(current_user.id, "UPDATE", "BUDGET", updated_budget.id, before, after)
    return after

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(
    id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    budget = budget_repo.find_by_id_and_user_id(db, id, current_user.id)
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Orçamento não encontrado"
        )
    before = build_budget_response(db, budget, current_user.id)
    budget_repo.remove(db, id=id)
    AuditLogService.log_event(current_user.id, "DELETE", "BUDGET", id, before, None)
