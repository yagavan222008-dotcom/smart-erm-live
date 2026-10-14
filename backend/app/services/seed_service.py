from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.bed import Bed
from app.models.treatment import Treatment
from app.models.audit import AuditEvent
from app.models.setting import ApplicationSetting
from app.services.dsa_manager import dsa_manager
from app.dsa.priority_queue import QueueItem, PriorityQueue


class SeedService:
    @staticmethod
    def seed_initial_data(db: Session, force_reset: bool = False) -> dict:
        if force_reset:
            # Delete in reverse foreign key order
            db.query(Treatment).delete()
            db.query(Patient).delete()
            db.query(Doctor).delete()
            db.query(Bed).delete()
            db.query(AuditEvent).delete()
            db.query(ApplicationSetting).delete()
            db.commit()

        # Check if already seeded
        if db.query(Doctor).count() > 0 and not force_reset:
            return {"status": "skipped", "message": "Database already contains operational data"}

        now = datetime.now()

        # 1. Seed Doctors
        doctors_data = [
            {"id": "DOC-101", "name": "Dr. Eleanor Vance", "department": "Emergency Medicine & Trauma", "is_available": True},
            {"id": "DOC-102", "name": "Dr. Marcus Reed", "department": "Acute Cardiology", "is_available": True},
            {"id": "DOC-103", "name": "Dr. Aisha Patel", "department": "Pediatric Emergency", "is_available": True},
            {"id": "DOC-104", "name": "Dr. Liam O'Connor", "department": "Orthopedics & Minor Trauma", "is_available": True},
            {"id": "DOC-105", "name": "Dr. Sofia Chen", "department": "Critical Care Medicine", "is_available": True},
        ]
        for doc_item in doctors_data:
            db.add(Doctor(
                id=doc_item["id"],
                name=doc_item["name"],
                department=doc_item["department"],
                is_available=doc_item["is_available"],
                created_at=now
            ))

        # 2. Seed Beds
        beds_data = [
            {"id": "BED-01", "label": "Resuscitation Bay 1", "section": "Resuscitation", "status": "Available"},
            {"id": "BED-02", "label": "Trauma Bay 2", "section": "Trauma", "status": "Available"},
            {"id": "BED-03", "label": "Acute Care Bed 3", "section": "Acute Care", "status": "Available"},
            {"id": "BED-04", "label": "Acute Care Bed 4", "section": "Acute Care", "status": "Available"},
            {"id": "BED-05", "label": "Observation Bed 5", "section": "Observation", "status": "Available"},
            {"id": "BED-06", "label": "Observation Bed 6", "section": "Observation", "status": "Available"},
            {"id": "BED-07", "label": "Fast Track Bay 7", "section": "Fast Track", "status": "Available"},
            {"id": "BED-08", "label": "Fast Track Bay 8", "section": "Fast Track", "status": "Available"},
        ]
        for bed_item in beds_data:
            db.add(Bed(
                id=bed_item["id"],
                label=bed_item["label"],
                section=bed_item["section"],
                status=bed_item["status"],
                created_at=now
            ))

        # 3. Seed Application Settings
        db.add(ApplicationSetting(key="FACILITY_NAME", value="Metropolitan Central Emergency Center", description="Hospital Name"))
        db.add(ApplicationSetting(key="CURRENT_STAFF", value="Dr. Eleanor Vance (Triage Lead)", description="Demo active staff"))
        db.add(ApplicationSetting(key="QUEUE_POLICY", value="Binary Min-Heap with FIFO Tie Breaking", description="Active scheduling policy"))

        db.commit()

        # 4. Seed Patients with varying triage levels and arrival sequences
        # Notice: P1 is Low, P2 is High, P3 is Critical, P4 is Moderate, P5 is Critical, P6 is High
        patients_seed = [
            {
                "id": "PT-2026-0001",
                "full_name": "James Mitchell",
                "age": 58,
                "gender": "Male",
                "contact_number": "555-0192",
                "complaint": "Acute chest pressure radiating to left arm and diaphoresis",
                "triage_level": "Critical",
                "arrival_seq": 1,
                "arrival_offset": 45,  # minutes ago
                "status": "Waiting"
            },
            {
                "id": "PT-2026-0002",
                "full_name": "Elena Rostova",
                "age": 34,
                "gender": "Female",
                "contact_number": "555-0144",
                "complaint": "Severe respiratory distress with audible stridor and wheezing",
                "triage_level": "Critical",
                "arrival_seq": 2,
                "arrival_offset": 40,
                "status": "Waiting"
            },
            {
                "id": "PT-2026-0003",
                "full_name": "Robert Tanaka",
                "age": 42,
                "gender": "Male",
                "contact_number": "555-0187",
                "complaint": "Open forearm fracture following road accident, active bleeding",
                "triage_level": "High",
                "arrival_seq": 3,
                "arrival_offset": 35,
                "status": "Waiting"
            },
            {
                "id": "PT-2026-0004",
                "full_name": "Grace Holloway",
                "age": 67,
                "gender": "Female",
                "contact_number": "555-0201",
                "complaint": "Sudden onset dysphasia and right-sided hemiparesis for 30 minutes",
                "triage_level": "Critical",
                "arrival_seq": 4,
                "arrival_offset": 25,
                "status": "Waiting"
            },
            {
                "id": "PT-2026-0005",
                "full_name": "Carlos Gomez",
                "age": 24,
                "gender": "Male",
                "contact_number": "555-0112",
                "complaint": "High grade fever (103°F) and right lower quadrant abdominal tenderness",
                "triage_level": "High",
                "arrival_seq": 5,
                "arrival_offset": 20,
                "status": "Waiting"
            },
            {
                "id": "PT-2026-0006",
                "full_name": "Sarah Jenkins",
                "age": 29,
                "gender": "Female",
                "contact_number": "555-0320",
                "complaint": "Moderate laceration on palm requiring sutures, bleeding controlled",
                "triage_level": "Moderate",
                "arrival_seq": 6,
                "arrival_offset": 15,
                "status": "Waiting"
            },
            {
                "id": "PT-2026-0007",
                "full_name": "Arthur Pendelton",
                "age": 73,
                "gender": "Male",
                "contact_number": "555-0450",
                "complaint": "Chronic lower back discomfort, medication refill inquiry",
                "triage_level": "Low",
                "arrival_seq": 7,
                "arrival_offset": 10,
                "status": "Waiting"
            },
            {
                "id": "PT-2026-0008",
                "full_name": "Maya Lin",
                "age": 19,
                "gender": "Female",
                "contact_number": "555-0988",
                "complaint": "Sprained ankle during athletic training, mild edema",
                "triage_level": "Moderate",
                "arrival_seq": 8,
                "arrival_offset": 5,
                "status": "Waiting"
            }
        ]

        for p_data in patients_seed:
            arr_time = now - timedelta(minutes=p_data["arrival_offset"])
            patient = Patient(
                id=p_data["id"],
                full_name=p_data["full_name"],
                age=p_data["age"],
                gender=p_data["gender"],
                contact_number=p_data["contact_number"],
                complaint=p_data["complaint"],
                arrival_time=arr_time,
                arrival_seq=p_data["arrival_seq"],
                triage_level=p_data["triage_level"],
                status=p_data["status"],
                created_at=arr_time,
                updated_at=arr_time
            )
            db.add(patient)

        # Also seed 1 patient currently Under Treatment and 1 Discharged for rich initial visuals
        treated_pt = Patient(
            id="PT-2026-0009",
            full_name="David Miller",
            age=51,
            gender="Male",
            contact_number="555-0551",
            complaint="Acute hypertensive crisis with headache",
            arrival_time=now - timedelta(minutes=70),
            arrival_seq=9,
            triage_level="High",
            status="Under Treatment",
            doctor_id="DOC-102",
            bed_id="BED-03",
            treatment_start_time=now - timedelta(minutes=30),
            created_at=now - timedelta(minutes=70),
            updated_at=now - timedelta(minutes=30)
        )
        db.add(treated_pt)

        # Update doc and bed for the patient under treatment
        doc_reed = db.query(Doctor).filter(Doctor.id == "DOC-102").first()
        if doc_reed:
            doc_reed.is_available = False
            doc_reed.current_patient_id = treated_pt.id

        bed_acute = db.query(Bed).filter(Bed.id == "BED-03").first()
        if bed_acute:
            bed_acute.status = "Occupied"
            bed_acute.current_patient_id = treated_pt.id

        # Seed treatment record
        db.add(Treatment(
            id="TRT-INIT-001",
            patient_id=treated_pt.id,
            doctor_id="DOC-102",
            bed_id="BED-03",
            status="In Progress",
            start_time=now - timedelta(minutes=30),
            initial_assessment="BP 195/110 mmHg, IV antihypertensive labetalol administered"
        ))

        # Seed completed & discharged patient
        discharged_pt = Patient(
            id="PT-2026-0010",
            full_name="Sophia Martinez",
            age=27,
            gender="Female",
            contact_number="555-0774",
            complaint="Mild allergic reaction to bee sting",
            arrival_time=now - timedelta(minutes=120),
            arrival_seq=10,
            triage_level="Moderate",
            status="Discharged",
            treatment_start_time=now - timedelta(minutes=90),
            treatment_end_time=now - timedelta(minutes=35),
            discharge_time=now - timedelta(minutes=25),
            treatment_notes="Antihistamine administered; observed for 45 min; stable",
            discharge_notes="Discharged home with oral antihistamine prescription",
            created_at=now - timedelta(minutes=120),
            updated_at=now - timedelta(minutes=25)
        )
        db.add(discharged_pt)

        # Add initial audit events
        db.add(AuditEvent(
            event_id="EVT-INIT-001",
            event_type="SYSTEM_INITIALIZED",
            patient_id=None,
            responsible_staff="System Administrator",
            details="Emergency Room Database and Priority Heap initialized with demo configuration",
            timestamp=now - timedelta(minutes=130)
        ))

        db.commit()

        # Rebuild DSA in-memory structures from DB
        waiting_list = db.query(Patient).filter(Patient.status == "Waiting").all()
        dsa_manager.rebuild_queue_from_db(waiting_list)

        all_patients = db.query(Patient).all()
        for p in all_patients:
            dsa_manager.sync_patient_to_hash_table({
                "id": p.id,
                "name": p.full_name,
                "age": p.age,
                "triage_level": p.triage_level,
                "status": p.status,
                "arrival_time": p.arrival_time.isoformat()
            })

        return {"status": "success", "message": "Demo data successfully seeded"}
