from datetime import datetime
from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base


class Bed(Base):
    __tablename__ = "beds"

    id = Column(String(50), primary_key=True, index=True)
    label = Column(String(80), nullable=False)
    section = Column(String(80), nullable=False)  # Resuscitation, Trauma, Observation, Fast Track
    status = Column(String(40), default="Available", nullable=False)  # Available, Occupied, Cleaning / Maintenance
    current_patient_id = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.now, nullable=False)

    patients = relationship("Patient", back_populates="bed", foreign_keys="Patient.bed_id")
    treatments = relationship("Treatment", back_populates="bed")
