from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    department = Column(String(100), nullable=False)
    is_available = Column(Boolean, default=True, nullable=False)
    current_patient_id = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.now, nullable=False)

    patients = relationship("Patient", back_populates="doctor", foreign_keys="Patient.doctor_id")
    treatments = relationship("Treatment", back_populates="doctor")
