from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.patient import Patient
from app.schemas.patient import PatientCreate, PatientResponse, PatientTriageUpdate
from app.services.patient_service import PatientService
from app.services.dsa_manager import dsa_manager

router = APIRouter()


@router.post("/patients", response_model=PatientResponse)
def register_patient(patient_in: PatientCreate, db: Session = Depends(get_db)):
    try:
        patient = PatientService.register_patient(db, patient_in)
        return patient
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/patients", response_model=List[PatientResponse])
def get_patients(
    query: Optional[str] = None,
    triage_level: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    return PatientService.search_patients(db, query, triage_level, status, limit, offset)


@router.get("/patients/search", response_model=List[PatientResponse])
def search_patients_endpoint(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db)
):
    return PatientService.search_patients(db, query=q)


@router.get("/patients/{patient_id}", response_model=PatientResponse)
def get_patient(patient_id: str, db: Session = Depends(get_db)):
    # 1. First demonstrate educational Hash Table lookup
    cached_val = dsa_manager.patient_hash_table.search(patient_id)
    # 2. Source of truth from SQLite database
    patient = PatientService.get_patient_by_id(db, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")
    return patient


@router.post("/patients/{patient_id}/triage", response_model=PatientResponse)
def update_patient_triage(
    patient_id: str,
    update_in: PatientTriageUpdate,
    db: Session = Depends(get_db)
):
    patient = PatientService.update_triage_level(db, patient_id, update_in)
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")
    return patient
