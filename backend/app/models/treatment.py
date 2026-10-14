from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class Treatment(Base):
    __tablename__ = "treatments"

    id = Column(String(50), primary_key=True, index=True)
    patient_id = Column(String(50), ForeignKey("patients.id"), nullable=False, index=True)
    doctor_id = Column(String(50), ForeignKey("doctors.id"), nullable=True)
    bed_id = Column(String(50), ForeignKey("beds.id"), nullable=True)

    status = Column(String(30), default="In Progress", nullable=False)  # In Progress, Completed
    start_time = Column(DateTime, default=datetime.now, nullable=False)
    end_time = Column(DateTime, nullable=True)

    initial_assessment = Column(Text, nullable=True)
    interventions = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now, nullable=False)

    patient = relationship("Patient", back_populates="treatments")
    doctor = relationship("Doctor", back_populates="treatments")
    bed = relationship("Bed", back_populates="treatments")
