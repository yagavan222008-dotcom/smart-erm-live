from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.patient import Patient
from app.models.treatment import Treatment
from app.schemas.patient import PatientResponse
from app.schemas.treatment import (
    StartTreatmentRequest,
    CompleteTreatmentRequest,
    DischargePatientRequest,
    CancelPatientRequest,
    TreatmentResponse
)
from app.services.treatment_service import TreatmentService

router = APIRouter()


@router.post("/patients/{patient_id}/start-treatment", response_model=PatientResponse)
def start_treatment(
    patient_id: str,
    request: StartTreatmentRequest,
    db: Session = Depends(get_db)
):
    return TreatmentService.start_treatment(db, patient_id, request)


@router.post("/patients/{patient_id}/complete-treatment", response_model=PatientResponse)
def complete_treatment(
    patient_id: str,
    request: CompleteTreatmentRequest,
    db: Session = Depends(get_db)
):
    return TreatmentService.complete_treatment(db, patient_id, request)


@router.post("/patients/{patient_id}/discharge", response_model=PatientResponse)
def discharge_patient(
    patient_id: str,
    request: DischargePatientRequest,
    db: Session = Depends(get_db)
):
    return TreatmentService.discharge_patient(db, patient_id, request)


@router.post("/patients/{patient_id}/cancel", response_model=PatientResponse)
def cancel_patient(
    patient_id: str,
    request: CancelPatientRequest,
    db: Session = Depends(get_db)
):
    return TreatmentService.cancel_patient(db, patient_id, request)


@router.get("/treatments/active", response_model=List[TreatmentResponse])
def get_active_treatments(db: Session = Depends(get_db)):
    return db.query(Treatment).filter(Treatment.status == "In Progress").all()
