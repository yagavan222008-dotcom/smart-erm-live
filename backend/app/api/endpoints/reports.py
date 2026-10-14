from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.report_service import ReportService

router = APIRouter()


@router.get("/reports/summary")
def get_reports_summary(db: Session = Depends(get_db)):
    return ReportService.get_dashboard_summary(db)


@router.get("/reports/export")
def export_csv_report(db: Session = Depends(get_db)):
    csv_content = ReportService.generate_csv_report(db)
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=smart_erm_patient_report.csv"}
    )
