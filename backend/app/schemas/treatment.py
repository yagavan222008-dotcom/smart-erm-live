from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class StartTreatmentRequest(BaseModel):
    doctor_id: Optional[str] = None
    bed_id: Optional[str] = None
    initial_assessment: Optional[str] = None
    responsible_staff: Optional[str] = None


class CompleteTreatmentRequest(BaseModel):
    treatment_notes: Optional[str] = None
    interventions: Optional[str] = None
    responsible_staff: Optional[str] = None


class DischargePatientRequest(BaseModel):
    discharge_notes: Optional[str] = None
    responsible_staff: Optional[str] = None


class CancelPatientRequest(BaseModel):
    reason: str = Field(..., min_length=3, description="Mandatory cancellation reason")
    responsible_staff: Optional[str] = None


class TreatmentResponse(BaseModel):
    id: str
    patient_id: str
    doctor_id: Optional[str] = None
    bed_id: Optional[str] = None
    status: str
    start_time: datetime
    end_time: Optional[datetime] = None
    initial_assessment: Optional[str] = None
    interventions: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
