import datetime
from decimal import Decimal, ROUND_HALF_UP
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List
from app.database.connection import get_db
from app.api.deps import get_current_user
from app.models.models import User, Transaction, TransactionInstallment, Account
from app.schemas.transaction import TransactionRequest, TransactionResponse, TransactionInstallmentResponse
from app.repositories.base import transaction_repo, account_repo, category_repo
from app.services.audit import AuditLogService

router = APIRouter(prefix="/transactions", tags=["transactions"])

def add_months(sourcedate: datetime.date, months: int) -> datetime.date:
    month = sourcedate.month - 1 + months
    year = sourcedate.year + month // 12
    month = month % 12 + 1
    day = min(sourcedate.day, [31,
        29 if (year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)) else 28,
        31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month-1])
    return datetime.date(year, month, day)

def get_account_or_throw(db: Session, account_id: UUID, user_id: UUID) -> Account:
    account = account_repo.find_by_id_and_user_id(db, account_id, user_id)
    if not account:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Conta não encontrada"
        )
    return account

def validate_category(db: Session, category_id: UUID, user_id: UUID):
    if category_id:
        category = category_repo.find_by_id_and_user_id_or_system(db, category_id, user_id)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Categoria não encontrada"
            )

def apply_transaction_balances(db: Session, transaction: Transaction):
    if not getattr(transaction, "effective", True):
        return

    if transaction.credit_card_id is not None:
        return

    value = transaction.value
    if transaction.type == "REVENUE":
        if transaction.account_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Conta de destino é obrigatória para receitas"
            )
        account = get_account_or_throw(db, transaction.account_id, transaction.user_id)
        account.balance_current += value
        db.add(account)
    elif transaction.type == "EXPENSE":
        if transaction.account_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Conta de origem é obrigatória para despesas"
            )
        account = get_account_or_throw(db, transaction.account_id, transaction.user_id)
        account.balance_current -= value
        db.add(account)
    elif transaction.type == "TRANSFER":
        if transaction.account_id is None or transaction.destination_account_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Contas de origem e destino são obrigatórias para transferências"
            )
        if transaction.account_id == transaction.destination_account_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A conta de origem e destino não podem ser as mesmas"
            )
        source = get_account_or_throw(db, transaction.account_id, transaction.user_id)
        dest = get_account_or_throw(db, transaction.destination_account_id, transaction.user_id)
        source.balance_current -= value
        dest.balance_current += value
        db.add(source)
        db.add(dest)

def reverse_transaction_balances(db: Session, transaction: Transaction):
    if not getattr(transaction, "effective", True):
        return

    if transaction.credit_card_id is not None:
        return

    value = transaction.value
    if transaction.type == "REVENUE":
        if transaction.account_id is not None:
            account = get_account_or_throw(db, transaction.account_id, transaction.user_id)
            account.balance_current -= value
            db.add(account)
    elif transaction.type == "EXPENSE":
        if transaction.account_id is not None:
            account = get_account_or_throw(db, transaction.account_id, transaction.user_id)
            account.balance_current += value
            db.add(account)
    elif transaction.type == "TRANSFER":
        if transaction.account_id is not None and transaction.destination_account_id is not None:
            source = get_account_or_throw(db, transaction.account_id, transaction.user_id)
            dest = get_account_or_throw(db, transaction.destination_account_id, transaction.user_id)
            source.balance_current += value
            dest.balance_current -= value
            db.add(source)
            db.add(dest)

def build_transaction_response(transaction: Transaction, db: Session) -> TransactionResponse:
    installments = db.query(TransactionInstallment).filter(
        TransactionInstallment.transaction_id == transaction.id
    ).order_by(TransactionInstallment.installment_number).all()
    
    inst_resps = []
    for inst in installments:
        inst_resps.append(
            TransactionInstallmentResponse(
                id=inst.id,
                installment_number=inst.installment_number,
                total_installments=inst.total_installments,
                value=inst.value,
                due_date=inst.due_date,
                status=inst.status,
                created_at=inst.created_at,
                updated_at=inst.updated_at
            )
        )
    
    return TransactionResponse(
        id=transaction.id,
        account_id=transaction.account_id,
        destination_account_id=transaction.destination_account_id,
        category_id=transaction.category_id,
        credit_card_id=transaction.credit_card_id,
        value=transaction.value,
        date=transaction.date,
        type=transaction.type,
        description=transaction.description,
        notes=transaction.notes,
        attachments_url=transaction.attachments_url,
        tags=transaction.tags,
        effective=transaction.effective,
        effective_date=transaction.effective_date,
        due_date=transaction.due_date,
        installments=inst_resps if inst_resps else None,
        created_at=transaction.created_at,
        updated_at=transaction.updated_at
    )

@router.post("", response_model=TransactionResponse)
def create_transaction(
    request: TransactionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from datetime import timedelta
    validate_category(db, request.category_id, current_user.id)
    
    def calculate_recurrence_date(base_date, offset, periodicity):
        periodicity = (periodicity or "mensal").lower()
        if periodicity == "semanal":
            return base_date + timedelta(weeks=offset)
        elif periodicity == "quinzenal":
            return base_date + timedelta(days=15 * offset)
        elif periodicity == "anual":
            return add_months(base_date, 12 * offset)
        else: # default to mensal
            return add_months(base_date, offset)

    # Check recurrence type
    recurrence = request.recurrence_type or "NP"
    
    if recurrence == "PARCELADA":
        installments_count = request.installments_count or 1
        start_installment = request.start_installment or 1
        periodicity = request.periodicity or "mensal"
        value_type = request.value_type or "total"
        
        # Calculate installment values for all installments
        total_val = request.value
        if value_type == "total":
            base_val = (total_val / installments_count).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            sum_vals = base_val * installments_count
            diff = total_val - sum_vals
        else:
            base_val = total_val
            diff = Decimal("0.00")
            
        created_transactions = []
        for idx, i in enumerate(range(start_installment, installments_count + 1)):
            if value_type == "total":
                inst_value = base_val + diff if i == 1 else base_val
            else:
                inst_value = base_val
                
            offset = i - start_installment
            inst_due_date = calculate_recurrence_date(request.due_date or request.date, offset, periodicity)
            desc = f"{request.description} {i}/{installments_count}"
            
            inst_effective = (request.effective if request.effective is not None else True) if offset == 0 else False
            inst_effective_date = request.effective_date if offset == 0 else None
            
            obj_in = {
                "user_id": current_user.id,
                "account_id": request.account_id,
                "destination_account_id": request.destination_account_id,
                "category_id": request.category_id,
                "credit_card_id": request.credit_card_id,
                "value": inst_value,
                "date": request.date,
                "type": request.type,
                "description": desc,
                "notes": request.notes,
                "attachments_url": request.attachments_url,
                "tags": request.tags,
                "effective": inst_effective,
                "effective_date": inst_effective_date,
                "due_date": inst_due_date
            }
            tx = Transaction(**obj_in)
            apply_transaction_balances(db, tx)
            db.add(tx)
            created_transactions.append(tx)
            
        db.commit()
        for tx in created_transactions:
            db.refresh(tx)
        transaction = created_transactions[0]

    elif recurrence == "FIXA":
        created_transactions = []
        for offset in range(12):
            inst_due_date = calculate_recurrence_date(request.due_date or request.date, offset, "mensal")
            desc = f"{request.description} [Fixa]"
            
            inst_effective = (request.effective if request.effective is not None else True) if offset == 0 else False
            inst_effective_date = request.effective_date if offset == 0 else None
            
            obj_in = {
                "user_id": current_user.id,
                "account_id": request.account_id,
                "destination_account_id": request.destination_account_id,
                "category_id": request.category_id,
                "credit_card_id": request.credit_card_id,
                "value": request.value,
                "date": request.date,
                "type": request.type,
                "description": desc,
                "notes": request.notes,
                "attachments_url": request.attachments_url,
                "tags": request.tags,
                "effective": inst_effective,
                "effective_date": inst_effective_date,
                "due_date": inst_due_date
            }
            tx = Transaction(**obj_in)
            apply_transaction_balances(db, tx)
            db.add(tx)
            created_transactions.append(tx)
            
        db.commit()
        for tx in created_transactions:
            db.refresh(tx)
        transaction = created_transactions[0]

    else:
        # Normal Non-Recurrent flow
        obj_in = {
            "user_id": current_user.id,
            "account_id": request.account_id,
            "destination_account_id": request.destination_account_id,
            "category_id": request.category_id,
            "credit_card_id": request.credit_card_id,
            "value": request.value,
            "date": request.date,
            "type": request.type,
            "description": request.description,
            "notes": request.notes,
            "attachments_url": request.attachments_url,
            "tags": request.tags,
            "effective": request.effective if request.effective is not None else True,
            "effective_date": request.effective_date,
            "due_date": request.due_date
        }
        transaction = Transaction(**obj_in)
        apply_transaction_balances(db, transaction)
        db.add(transaction)
        db.commit()
        db.refresh(transaction)
        
        # Generate installments if requested (> 1) [Legacy installments table mapping]
        if request.installments_count and request.installments_count > 1:
            count = request.installments_count
            total_value = transaction.value
            base_value = (total_value / count).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            sum_installments = base_value * count
            difference = total_value - sum_installments
            
            installments = []
            for i in range(1, count + 1):
                installment_value = base_value
                if i == 1:
                    installment_value = base_value + difference
                    
                installment = TransactionInstallment(
                    transaction_id=transaction.id,
                    installment_number=i,
                    total_installments=count,
                    value=installment_value,
                    due_date=add_months(transaction.date, i - 1),
                    status="PENDING"
                )
                installments.append(installment)
                
            db.add_all(installments)
            db.commit()
            
    response = build_transaction_response(transaction, db)
    AuditLogService.log_event(current_user.id, "CREATE", "TRANSACTION", transaction.id, None, response)
    return response

@router.get("", response_model=List[TransactionResponse])
def list_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    transactions = transaction_repo.find_by_user_id(db, current_user.id)
    return [build_transaction_response(t, db) for t in transactions]

@router.get("/{id}", response_model=TransactionResponse)
def get_transaction(
    id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    transaction = transaction_repo.find_by_id_and_user_id(db, id, current_user.id)
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transação não encontrada"
        )
    return build_transaction_response(transaction, db)

@router.put("/{id}", response_model=TransactionResponse)
def update_transaction(
    id: UUID,
    request: TransactionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    transaction = transaction_repo.find_by_id_and_user_id(db, id, current_user.id)
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transação não encontrada"
        )
        
    validate_category(db, request.category_id, current_user.id)
    before = build_transaction_response(transaction, db)
    
    # 1. Reverse the old transaction's impact on balances
    reverse_transaction_balances(db, transaction)
    
    # 2. Check if recurrence is requested in edit mode
    recurrence = request.recurrence_type or "NP"
    if recurrence in ("PARCELADA", "FIXA"):
        # Delete the old single transaction
        transaction_repo.remove(db, id=id)
        
        # Create the new recurring sequence
        from datetime import timedelta
        def calculate_recurrence_date(base_date, offset, periodicity):
            periodicity = (periodicity or "mensal").lower()
            if periodicity == "semanal":
                return base_date + timedelta(weeks=offset)
            elif periodicity == "quinzenal":
                return base_date + timedelta(days=15 * offset)
            elif periodicity == "anual":
                return add_months(base_date, 12 * offset)
            else: # default to mensal
                return add_months(base_date, offset)

        if recurrence == "PARCELADA":
            installments_count = request.installments_count or 1
            start_installment = request.start_installment or 1
            periodicity = request.periodicity or "mensal"
            value_type = request.value_type or "total"
            
            # Calculate installment values for all installments
            total_val = request.value
            if value_type == "total":
                base_val = (total_val / installments_count).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
                sum_vals = base_val * installments_count
                diff = total_val - sum_vals
            else:
                base_val = total_val
                diff = Decimal("0.00")
                
            created_transactions = []
            for idx, i in enumerate(range(start_installment, installments_count + 1)):
                if value_type == "total":
                    inst_value = base_val + diff if i == 1 else base_val
                else:
                    inst_value = base_val
                    
                offset = i - start_installment
                inst_due_date = calculate_recurrence_date(request.due_date or request.date, offset, periodicity)
                desc = f"{request.description} {i}/{installments_count}"
                
                inst_effective = (request.effective if request.effective is not None else True) if offset == 0 else False
                inst_effective_date = request.effective_date if offset == 0 else None
                
                obj_in = {
                    "user_id": current_user.id,
                    "account_id": request.account_id,
                    "destination_account_id": request.destination_account_id,
                    "category_id": request.category_id,
                    "credit_card_id": request.credit_card_id,
                    "value": inst_value,
                    "date": request.date,
                    "type": request.type,
                    "description": desc,
                    "notes": request.notes,
                    "attachments_url": request.attachments_url,
                    "tags": request.tags,
                    "effective": inst_effective,
                    "effective_date": inst_effective_date,
                    "due_date": inst_due_date
                }
                tx = Transaction(**obj_in)
                apply_transaction_balances(db, tx)
                db.add(tx)
                created_transactions.append(tx)
                
            db.commit()
            for tx in created_transactions:
                db.refresh(tx)
            transaction = created_transactions[0]

        elif recurrence == "FIXA":
            created_transactions = []
            for offset in range(12):
                inst_due_date = calculate_recurrence_date(request.due_date or request.date, offset, "mensal")
                desc = f"{request.description} [Fixa]"
                
                inst_effective = (request.effective if request.effective is not None else True) if offset == 0 else False
                inst_effective_date = request.effective_date if offset == 0 else None
                
                obj_in = {
                    "user_id": current_user.id,
                    "account_id": request.account_id,
                    "destination_account_id": request.destination_account_id,
                    "category_id": request.category_id,
                    "credit_card_id": request.credit_card_id,
                    "value": request.value,
                    "date": request.date,
                    "type": request.type,
                    "description": desc,
                    "notes": request.notes,
                    "attachments_url": request.attachments_url,
                    "tags": request.tags,
                    "effective": inst_effective,
                    "effective_date": inst_effective_date,
                    "due_date": inst_due_date
                }
                tx = Transaction(**obj_in)
                apply_transaction_balances(db, tx)
                db.add(tx)
                created_transactions.append(tx)
                
            db.commit()
            for tx in created_transactions:
                db.refresh(tx)
            transaction = created_transactions[0]

        after = build_transaction_response(transaction, db)
        AuditLogService.log_event(current_user.id, "UPDATE", "TRANSACTION", transaction.id, before, after)
        return after

    # 3. Apply the normal updated transaction's impact on balances
    transaction.account_id = request.account_id
    transaction.destination_account_id = request.destination_account_id
    transaction.category_id = request.category_id
    transaction.credit_card_id = request.credit_card_id
    transaction.value = request.value
    transaction.date = request.date
    transaction.type = request.type
    transaction.description = request.description
    transaction.notes = request.notes
    transaction.attachments_url = request.attachments_url
    transaction.tags = request.tags
    transaction.effective = request.effective if request.effective is not None else True
    transaction.effective_date = request.effective_date
    transaction.due_date = request.due_date
    
    apply_transaction_balances(db, transaction)
    
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    
    after = build_transaction_response(transaction, db)
    AuditLogService.log_event(current_user.id, "UPDATE", "TRANSACTION", transaction.id, before, after)
    return after

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    transaction = transaction_repo.find_by_id_and_user_id(db, id, current_user.id)
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transação não encontrada"
        )
        
    before = build_transaction_response(transaction, db)
    
    # Reverse balances before deleting
    reverse_transaction_balances(db, transaction)
    
    transaction_repo.remove(db, id=id)
    AuditLogService.log_event(current_user.id, "DELETE", "TRANSACTION", id, before, None)

@router.delete("/{id}/recurrent", status_code=status.HTTP_204_NO_CONTENT)
def delete_recurrent_transaction(
    id: UUID,
    delete_type: str,  # ONLY_CURRENT, CURRENT_AND_FUTURE, ALL
    reorganize: bool,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    transaction = transaction_repo.find_by_id_and_user_id(db, id, current_user.id)
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transação não encontrada"
        )
        
    import re
    match = re.search(r"^(.*?)\s+(\d+)/(\d+)$", transaction.description)
    if not match:
        # Not a recurrent installment transaction! Just do a standard delete
        before = build_transaction_response(transaction, db)
        reverse_transaction_balances(db, transaction)
        transaction_repo.remove(db, id=id)
        AuditLogService.log_event(current_user.id, "DELETE", "TRANSACTION", id, before, None)
        return
        
    base_desc = match.group(1)
    current_idx = int(match.group(2))
    total_count = int(match.group(3))
    
    # Find all transactions for this user of the same type and matching description pattern
    all_txs = transaction_repo.find_by_user_id(db, current_user.id)
    sequence_txs = []
    for tx in all_txs:
        if tx.type != transaction.type:
            continue
        tx_match = re.search(r"^(.*?)\s+(\d+)/(\d+)$", tx.description)
        if tx_match:
            tx_base = tx_match.group(1)
            tx_idx = int(tx_match.group(2))
            tx_total = int(tx_match.group(3))
            if tx_base == base_desc and tx_total == total_count:
                sequence_txs.append((tx, tx_idx))
                
    # Sort sequence by index
    sequence_txs.sort(key=lambda x: x[1])
    
    # Identify which transactions to delete
    txs_to_delete = []
    txs_to_keep = []
    for tx, idx in sequence_txs:
        if delete_type == "ONLY_CURRENT":
            if tx.id == id:
                txs_to_delete.append(tx)
            else:
                txs_to_keep.append((tx, idx))
        elif delete_type == "CURRENT_AND_FUTURE":
            if idx >= current_idx:
                txs_to_delete.append(tx)
            else:
                txs_to_keep.append((tx, idx))
        elif delete_type == "ALL":
            txs_to_delete.append(tx)
            
    # Reverse balances and delete targets
    for tx in txs_to_delete:
        before = build_transaction_response(tx, db)
        reverse_transaction_balances(db, tx)
        transaction_repo.remove(db, id=tx.id)
        AuditLogService.log_event(current_user.id, "DELETE", "TRANSACTION", tx.id, before, None)
        
    # Reorganize remaining sequence if reorganize is True
    if reorganize and delete_type != "ALL" and txs_to_keep:
        new_total = len(txs_to_keep)
        for new_idx, (tx, old_idx) in enumerate(txs_to_keep, 1):
            new_desc = f"{base_desc} {new_idx}/{new_total}"
            # Reverse old balance impact
            reverse_transaction_balances(db, tx)
            tx.description = new_desc
            # Apply new balance impact
            apply_transaction_balances(db, tx)
            db.add(tx)
            
    db.commit()
