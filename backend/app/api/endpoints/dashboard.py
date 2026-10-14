from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.report_service import ReportService
from app.schemas.dashboard import DashboardSummaryResponse

router = APIRouter()


@router.get("/dashboard/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(db: Session = Depends(get_db)):
    return ReportService.get_dashboard_summary(db)
