from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.audit import AuditEvent
from app.schemas.audit import AuditEventResponse

router = APIRouter()


@router.get("/history", response_model=List[AuditEventResponse])
def get_audit_history(
    event_type: Optional[str] = None,
    patient_id: Optional[str] = None,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    q = db.query(AuditEvent)
    if event_type and event_type != "All":
        q = q.filter(AuditEvent.event_type == event_type)
    if patient_id:
        q = q.filter(AuditEvent.patient_id == patient_id)

    return q.order_by(AuditEvent.timestamp.desc()).offset(offset).limit(limit).all()


@router.get("/patients/{patient_id}/history", response_model=List[AuditEventResponse])
def get_patient_audit_history(
    patient_id: str,
    db: Session = Depends(get_db)
):
    return db.query(AuditEvent).filter(
        AuditEvent.patient_id == patient_id
    ).order_by(AuditEvent.timestamp.desc()).all()
