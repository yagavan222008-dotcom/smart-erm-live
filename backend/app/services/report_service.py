import csv
import io
from datetime import datetime, date, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.patient import Patient
from app.models.bed import Bed
from app.models.doctor import Doctor
from app.models.treatment import Treatment
from app.services.dsa_manager import dsa_manager


class ReportService:
    @staticmethod
    def get_dashboard_summary(db: Session) -> Dict[str, Any]:
        today_start = datetime.combine(date.today(), datetime.min.time())

        # Patients counts
        total_registered_today = db.query(Patient).filter(Patient.created_at >= today_start).count()
        patients_waiting = db.query(Patient).filter(Patient.status == "Waiting").count()
        patients_under_treatment = db.query(Patient).filter(Patient.status == "Under Treatment").count()
        critical_waiting = db.query(Patient).filter(
            Patient.status == "Waiting",
            Patient.triage_level == "Critical"
        ).count()

        completed_today = db.query(Patient).filter(
            Patient.status.in_(["Treatment Completed", "Discharged"]),
            Patient.treatment_end_time >= today_start
        ).count()

        discharged_today = db.query(Patient).filter(
            Patient.status == "Discharged",
            Patient.discharge_time >= today_start
        ).count()

        # Bed metrics
        total_beds = db.query(Bed).count()
        available_beds = db.query(Bed).filter(Bed.status == "Available").count()

        # Urgency distribution
        urgency_counts = {"Critical": 0, "High": 0, "Moderate": 0, "Low": 0}
        urgency_rows = db.query(Patient.triage_level, func.count(Patient.id)).group_by(Patient.triage_level).all()
        for level, count in urgency_rows:
            if level in urgency_counts:
                urgency_counts[level] = count

        # Bed status breakdown
        bed_status = {"Available": 0, "Occupied": 0, "Cleaning / Maintenance": 0}
        bed_rows = db.query(Bed.status, func.count(Bed.id)).group_by(Bed.status).all()
        for b_stat, count in bed_rows:
            if b_stat in bed_status:
                bed_status[b_stat] = count

        # Calculate average waiting duration for waiting patients
        waiting_patients = db.query(Patient).filter(Patient.status == "Waiting").all()
        now = datetime.now()
        total_wait_minutes = 0.0
        if waiting_patients:
            for p in waiting_patients:
                wait_sec = (now - p.arrival_time).total_seconds()
                total_wait_minutes += max(0, wait_sec / 60.0)
            avg_wait_minutes = round(total_wait_minutes / len(waiting_patients), 1)
        else:
            avg_wait_minutes = 0.0

        # Calculate average treatment duration for completed treatments today or overall
        completed_treatments = db.query(Treatment).filter(
            Treatment.status == "Completed",
            Treatment.end_time != None
        ).all()
        total_treat_minutes = 0.0
        if completed_treatments:
            for t in completed_treatments:
                dur_sec = (t.end_time - t.start_time).total_seconds()
                total_treat_minutes += max(0, dur_sec / 60.0)
            avg_treat_minutes = round(total_treat_minutes / len(completed_treatments), 1)
        else:
            avg_treat_minutes = 0.0

        # Arrivals by hour today or last 24h
        arrivals_timeline = []
        for i in range(12, -1, -2):
            slot_time = now - timedelta(hours=i)
            slot_label = slot_time.strftime("%H:00")
            count = db.query(Patient).filter(
                Patient.arrival_time >= slot_time - timedelta(hours=2),
                Patient.arrival_time < slot_time
            ).count()
            arrivals_timeline.append({"time": slot_label, "arrivals": count})

        # Recent patient registrations (top 5)
        recent_patients = db.query(Patient).order_by(Patient.created_at.desc()).limit(5).all()
        recent_list = [
            {
                "id": p.id,
                "name": p.full_name,
                "triage_level": p.triage_level,
                "status": p.status,
                "time": p.arrival_time.strftime("%H:%M"),
                "complaint": p.complaint
            }
            for p in recent_patients
        ]

        # Top 5 items from the real binary min-heap queue preview
        ordered_queue = dsa_manager.priority_queue.get_ordered_list()
        queue_preview = [
            {
                "position": idx + 1,
                "patient_id": item.patient_id,
                "name": item.patient_name,
                "triage_level": item.triage_level,
                "priority": item.priority,
                "complaint": item.complaint,
                "arrival_time": item.arrival_time
            }
            for idx, item in enumerate(ordered_queue[:5])
        ]

        return {
            "total_registered_today": total_registered_today,
            "patients_waiting": patients_waiting,
            "patients_under_treatment": patients_under_treatment,
            "critical_waiting": critical_waiting,
            "available_beds": available_beds,
            "total_beds": total_beds,
            "completed_today": completed_today,
            "discharged_today": discharged_today,
            "avg_wait_time_minutes": avg_wait_minutes,
            "avg_treatment_time_minutes": avg_treat_minutes,
            "urgency_distribution": urgency_counts,
            "bed_status_breakdown": bed_status,
            "arrivals_timeline": arrivals_timeline,
            "recent_registrations": recent_list,
            "priority_queue_preview": queue_preview
        }

    @staticmethod
    def generate_csv_report(db: Session) -> str:
        patients = db.query(Patient).order_by(Patient.arrival_seq.asc()).all()
        output = io.StringIO()
        writer = csv.writer(output)

        # Header row
        writer.writerow([
            "Patient ID",
            "Full Name",
            "Age",
            "Gender",
            "Triage Urgency",
            "Arrival Sequence",
            "Arrival Time",
            "Status",
            "Assigned Doctor",
            "Assigned Bed",
            "Complaint",
            "Treatment Start",
            "Treatment End",
            "Discharge Time"
        ])

        for p in patients:
            writer.writerow([
                p.id,
                p.full_name,
                p.age,
                p.gender,
                p.triage_level,
                p.arrival_seq,
                p.arrival_time.isoformat() if p.arrival_time else "",
                p.status,
                p.doctor_id or "Unassigned",
                p.bed_id or "Unassigned",
                p.complaint,
                p.treatment_start_time.isoformat() if p.treatment_start_time else "",
                p.treatment_end_time.isoformat() if p.treatment_end_time else "",
                p.discharge_time.isoformat() if p.discharge_time else ""
            ])

        return output.getvalue()
