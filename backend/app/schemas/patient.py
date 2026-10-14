from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, field_validator


class PatientCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=150, description="Full name of patient")
    age: int = Field(..., ge=0, le=130, description="Age in years")
    gender: str = Field(..., description="Gender (Male, Female, Other, Prefer not to say)")
    contact_number: Optional[str] = Field(None, max_length=50)
    complaint: str = Field(..., min_length=3, description="Presenting complaint/symptoms")
    triage_level: str = Field(..., description="Triage urgency (Critical, High, Moderate, Low)")
    triage_notes: Optional[str] = None
    initial_observations: Optional[str] = None

    @field_validator("triage_level")
    def validate_triage_level(cls, v):
        valid = ["Critical", "High", "Moderate", "Low"]
        if v not in valid:
            raise ValueError(f"triage_level must be one of {valid}")
        return v


class PatientTriageUpdate(BaseModel):
    triage_level: str
    reason: str = Field(..., min_length=3, description="Reason for staff override/reprioritization")
    responsible_staff: Optional[str] = None

    @field_validator("triage_level")
    def validate_triage(cls, v):
        valid = ["Critical", "High", "Moderate", "Low"]
        if v not in valid:
            raise ValueError(f"triage_level must be one of {valid}")
        return v


class PatientResponse(BaseModel):
    id: str
    full_name: str
    age: int
    gender: str
    contact_number: Optional[str] = None
    complaint: str
    arrival_time: datetime
    arrival_seq: int
    triage_level: str
    triage_notes: Optional[str] = None
    status: str
    doctor_id: Optional[str] = None
    bed_id: Optional[str] = None
    treatment_start_time: Optional[datetime] = None
    treatment_end_time: Optional[datetime] = None
    discharge_time: Optional[datetime] = None
    treatment_notes: Optional[str] = None
    discharge_notes: Optional[str] = None
    cancellation_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PatientQueueItemResponse(BaseModel):
    queue_position: int
    patient_id: str
    patient_name: str
    age: int
    triage_level: str
    priority_numeric: int
    complaint: str
    arrival_time: datetime
    arrival_seq: int
    waiting_seconds: float
    status: str
    assigned_doctor: Optional[str] = None
    assigned_bed: Optional[str] = None
