from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class DoctorCreate(BaseModel):
    id: Optional[str] = None
    name: str = Field(..., min_length=2, max_length=120)
    department: str = Field(..., min_length=2, max_length=100)
    is_available: bool = True


class DoctorResponse(BaseModel):
    id: str
    name: str
    department: str
    is_available: bool
    current_patient_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class BedCreate(BaseModel):
    id: Optional[str] = None
    label: str = Field(..., min_length=2, max_length=80)
    section: str = Field(..., min_length=2, max_length=80)
    status: str = Field("Available", description="Available, Occupied, Cleaning / Maintenance")


class BedResponse(BaseModel):
    id: str
    label: str
    section: str
    status: str
    current_patient_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ResourceAssignmentRequest(BaseModel):
    doctor_id: Optional[str] = None
    bed_id: Optional[str] = None
    notes: Optional[str] = None
    responsible_staff: Optional[str] = None
