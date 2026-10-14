import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.database import Base, get_db
from app.services.dsa_manager import dsa_manager

import os
TEST_DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "test_smart_erm.db"))
TEST_DATABASE_URL = f"sqlite:///{TEST_DB_PATH}"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    # Seed doctors and beds in test db
    from app.services.seed_service import SeedService
    db = TestingSessionLocal()
    SeedService.seed_initial_data(db, force_reset=True)
    db.close()
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"


def test_dashboard_summary(client):
    response = client.get("/api/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_registered_today" in data
    assert "patients_waiting" in data
    assert "urgency_distribution" in data


def test_triage_queue_min_heap_priority_ordering(client):
    # Register Low urgency patient
    resp_low = client.post("/api/patients", json={
        "full_name": "Test Low Urgency",
        "age": 28,
        "gender": "Male",
        "complaint": "Mild headache",
        "triage_level": "Low"
    })
    assert resp_low.status_code == 200
    low_id = resp_low.json()["id"]

    # Register Critical urgency patient AFTER the low urgency patient
    resp_crit = client.post("/api/patients", json={
        "full_name": "Test Critical Urgency",
        "age": 62,
        "gender": "Female",
        "complaint": "Severe acute crushing chest pain",
        "triage_level": "Critical"
    })
    assert resp_crit.status_code == 200
    crit_id = resp_crit.json()["id"]

    # Verify queue ordering: Critical patient MUST be at position 1, ahead of low urgency!
    queue_resp = client.get("/api/queue")
    assert queue_resp.status_code == 200
    queue = queue_resp.json()

    # Find the positions of both patients
    crit_pos = next(item["queue_position"] for item in queue if item["patient_id"] == crit_id)
    low_pos = next(item["queue_position"] for item in queue if item["patient_id"] == low_id)

    assert crit_pos < low_pos, f"Critical patient pos {crit_pos} must be higher priority than low patient pos {low_pos}"


def test_patient_search_and_retrieval(client):
    # Search for registered patient
    search_resp = client.get("/api/patients/search?q=Test+Critical")
    assert search_resp.status_code == 200
    results = search_resp.json()
    assert len(results) >= 1
    assert any("Test Critical" in p["full_name"] for p in results)


def test_staff_override_triage_reclassification(client):
    # Register moderate patient
    reg = client.post("/api/patients", json={
        "full_name": "Override Patient",
        "age": 45,
        "gender": "Female",
        "complaint": "Abdominal discomfort",
        "triage_level": "Moderate"
    }).json()

    # Override to Critical with audited reason
    override_resp = client.post(f"/api/patients/{reg['id']}/triage", json={
        "triage_level": "Critical",
        "reason": "Patient vitals decompensated; BP dropping sharply",
        "responsible_staff": "Dr. Eleanor Vance"
    })
    assert override_resp.status_code == 200
    updated = override_resp.json()
    assert updated["triage_level"] == "Critical"


def test_treatment_workflow_and_resource_locking(client):
    # 1. Register a fresh patient for treatment
    reg = client.post("/api/patients", json={
        "full_name": "Trauma Patient Workflow",
        "age": 35,
        "gender": "Male",
        "complaint": "Compound femur fracture",
        "triage_level": "Critical"
    }).json()
    pt_id = reg["id"]

    # 2. Get available doctor and bed
    docs = client.get("/api/doctors?available_only=true").json()
    beds = client.get("/api/beds?status=Available").json()

    assert len(docs) > 0, "Needs available doctors"
    assert len(beds) > 0, "Needs available beds"

    doc_id = docs[0]["id"]
    bed_id = beds[0]["id"]

    # 3. Start Treatment
    start_resp = client.post(f"/api/patients/{pt_id}/start-treatment", json={
        "doctor_id": doc_id,
        "bed_id": bed_id,
        "initial_assessment": "Splint applied, morphine IV given",
        "responsible_staff": "Dr. Eleanor Vance"
    })
    assert start_resp.status_code == 200
    assert start_resp.json()["status"] == "Under Treatment"

    # Patient should now NOT be in waiting queue
    queue = client.get("/api/queue").json()
    assert not any(item["patient_id"] == pt_id for item in queue)

    # 4. PREVENT DOUBLE ALLOCATION: Attempt to assign the SAME doctor to another patient must FAIL
    reg2 = client.post("/api/patients", json={
        "full_name": "Another Patient",
        "age": 50,
        "gender": "Female",
        "complaint": "Laceration",
        "triage_level": "High"
    }).json()

    double_doc_resp = client.post(f"/api/patients/{reg2['id']}/start-treatment", json={
        "doctor_id": doc_id,
        "bed_id": None
    })
    assert double_doc_resp.status_code == 400
    assert "occupied" in double_doc_resp.json()["detail"].lower()

    # 5. Complete treatment
    comp_resp = client.post(f"/api/patients/{pt_id}/complete-treatment", json={
        "treatment_notes": "Fracture stabilized, sent for surgical prep",
        "interventions": "Splinting, analgesia, labs",
        "responsible_staff": "Dr. Eleanor Vance"
    })
    assert comp_resp.status_code == 200
    assert comp_resp.json()["status"] == "Treatment Completed"

    # Doctor is now released and available again!
    docs_after = client.get("/api/doctors?available_only=true").json()
    assert any(d["id"] == doc_id for d in docs_after)

    # 6. Discharge patient
    dis_resp = client.post(f"/api/patients/{pt_id}/discharge", json={
        "discharge_notes": "Admitted to surgical inpatient ward",
        "responsible_staff": "Dr. Eleanor Vance"
    })
    assert dis_resp.status_code == 200
    assert dis_resp.json()["status"] == "Discharged"

    # Bed is now released and available!
    beds_after = client.get("/api/beds?status=Available").json()
    assert any(b["id"] == bed_id for b in beds_after)


def test_dsa_visualizer_endpoints(client):
    # Verify heap inspection endpoint
    heap_resp = client.get("/api/dsa/heap")
    assert heap_resp.status_code == 200
    heap_data = heap_resp.json()
    assert "heap_array" in heap_data
    assert "ordered_queue" in heap_data

    # Verify hash table inspection endpoint
    ht_resp = client.get("/api/dsa/hash-table")
    assert ht_resp.status_code == 200
    ht_data = ht_resp.json()
    assert "buckets" in ht_data
    assert "load_factor" in ht_data

    # Verify linked list inspection endpoint
    ll_resp = client.get("/api/dsa/linked-list")
    assert ll_resp.status_code == 200
    ll_data = ll_resp.json()
    assert "nodes" in ll_data

    # Verify merge sort endpoint
    sort_resp = client.post("/api/dsa/sort?sort_key=age")
    assert sort_resp.status_code == 200
    sort_data = sort_resp.json()
    assert sort_data["algorithm"] == "Merge Sort"
    assert len(sort_data["sorted_items"]) > 0


def test_audit_history_and_csv_export(client):
    # Verify persistent audit history
    hist_resp = client.get("/api/history")
    assert hist_resp.status_code == 200
    events = hist_resp.json()
    assert len(events) > 0

    # Verify CSV export
    csv_resp = client.get("/api/reports/export")
    assert csv_resp.status_code == 200
    assert "text/csv" in csv_resp.headers["content-type"]
    assert "Patient ID,Full Name,Age" in csv_resp.text
