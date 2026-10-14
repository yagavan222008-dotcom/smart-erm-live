from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db
from app.services.dsa_manager import dsa_manager

router = APIRouter()


@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"error: {str(e)}"

    return {
        "status": "healthy",
        "app_name": "SMART ERM — Smart Emergency Room Manager",
        "database": db_status,
        "dsa_priority_queue_size": len(dsa_manager.priority_queue),
        "dsa_hash_table_size": dsa_manager.patient_hash_table.size,
        "dsa_linked_list_size": len(dsa_manager.event_linked_list),
        "system_time": None
    }
