from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.api.deps import get_current_user
from app.models.models import User
from app.schemas.report import DashboardReportResponse
from app.services.reports import ReportService

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/dashboard", response_model=DashboardReportResponse)
def get_dashboard_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return ReportService.get_dashboard_report(db, current_user.id)

@router.get("/export/csv")
def export_csv(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    csv_data = ReportService.export_transactions_csv(db, current_user.id)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=\"transacoes.csv\""
        }
    )

@router.get("/export/excel")
def export_excel(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    excel_bytes = ReportService.export_transactions_excel(db, current_user.id)
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": "attachment; filename=\"transacoes.xlsx\""
        }
    )

@router.get("/export/pdf")
def export_pdf(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        pdf_bytes = ReportService.export_transactions_pdf(db, current_user.id)
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=\"transacoes.pdf\""
        }
    )
