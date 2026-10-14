from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.patient import Patient
from app.schemas.patient import PatientQueueItemResponse
from app.services.dsa_manager import dsa_manager

router = APIRouter()


@router.get("/queue", response_model=List[PatientQueueItemResponse])
def get_triage_queue(
    triage_filter: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Returns the current active triage waiting list ordered by the Binary Min-Heap.
    Critical (1) -> High (2) -> Moderate (3) -> Low (4), with ties resolved by FIFO arrival_seq.
    """
    ordered_items = dsa_manager.priority_queue.get_ordered_list()
    now = datetime.now()
    results = []

    pos = 1
    for item in ordered_items:
        # Filter if requested
        if triage_filter and triage_filter != "All" and item.triage_level != triage_filter:
            continue

        if search:
            s_lower = search.strip().lower()
            if s_lower not in item.patient_name.lower() and s_lower not in item.patient_id.lower() and s_lower not in item.complaint.lower():
                continue

        try:
            arr_dt = datetime.fromisoformat(item.arrival_time)
            waiting_sec = max(0.0, (now - arr_dt).total_seconds())
        except Exception:
            arr_dt = now
            waiting_sec = 0.0

        results.append(PatientQueueItemResponse(
            queue_position=pos,
            patient_id=item.patient_id,
            patient_name=item.patient_name,
            age=item.age,
            triage_level=item.triage_level,
            priority_numeric=item.priority,
            complaint=item.complaint,
            arrival_time=arr_dt,
            arrival_seq=item.arrival_seq,
            waiting_seconds=waiting_sec,
            status=item.status
        ))
        pos += 1

    return results


@router.get("/queue/next")
def get_next_patient():
    """
    Peeks at the root of the Min-Heap to determine the next highest-priority patient to treat.
    """
    next_item = dsa_manager.priority_queue.peek()
    if not next_item:
        return {"has_patient": False, "patient": None}

    return {
        "has_patient": True,
        "patient": next_item.to_dict()
    }


@router.post("/queue/sync")
def sync_queue_with_db(db: Session = Depends(get_db)):
    """
    Explicitly reconstruct the Binary Min-Heap from SQLite database records.
    """
    waiting_patients = db.query(Patient).filter(Patient.status == "Waiting").all()
    dsa_manager.rebuild_queue_from_db(waiting_patients)
    return {
        "status": "success",
        "synced_count": len(dsa_manager.priority_queue),
        "message": "Min-heap successfully synchronized with SQLite database"
    }
