from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(String(50), primary_key=True, index=True)
    full_name = Column(String(150), nullable=False, index=True)
    age = Column(Integer, nullable=False)
    gender = Column(String(30), nullable=False)
    contact_number = Column(String(50), nullable=True)
    complaint = Column(Text, nullable=False)
    
    # Priority & Scheduling fields
    arrival_time = Column(DateTime, default=datetime.now, nullable=False, index=True)
    arrival_seq = Column(Integer, nullable=False, index=True)
    triage_level = Column(String(20), nullable=False, index=True)  # Critical, High, Moderate, Low
    triage_notes = Column(Text, nullable=True)

    # Lifecycle Status: Waiting, Under Treatment, Treatment Completed, Discharged, Cancelled
    status = Column(String(30), default="Waiting", nullable=False, index=True)

    # Treatment and Resource references
    doctor_id = Column(String(50), ForeignKey("doctors.id"), nullable=True)
    bed_id = Column(String(50), ForeignKey("beds.id"), nullable=True)

    treatment_start_time = Column(DateTime, nullable=True)
    treatment_end_time = Column(DateTime, nullable=True)
    discharge_time = Column(DateTime, nullable=True)
    
    treatment_notes = Column(Text, nullable=True)
    discharge_notes = Column(Text, nullable=True)
    cancellation_reason = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.now, nullable=False)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now, nullable=False)

    # Relationships
    doctor = relationship("Doctor", back_populates="patients", foreign_keys=[doctor_id])
    bed = relationship("Bed", back_populates="patients", foreign_keys=[bed_id])
    treatments = relationship("Treatment", back_populates="patient", cascade="all, delete-orphan")
