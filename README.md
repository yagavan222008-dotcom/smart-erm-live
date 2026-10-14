# SMART ERM — Smart Emergency Room Manager

A full-stack Emergency Department operations and patient scheduling application designed for university **Data Structures and Algorithms (DSA)** coursework, faculty demonstration, and academic examination.

> **Clinical Disclaimer**: SMART ERM is an educational scheduling simulation. Automated triage scores and priority queue algorithms are demonstrative and must never replace certified clinical judgment or real-world hospital triage protocols.

---

## 1. System Architecture

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React icons, Recharts.
- **Backend**: Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2.0.
- **Durable Storage**: Local persistent SQLite (`data/smart_erm.db`).
- **DSA Engine**: Native Python educational implementations of:
  - **Binary Min-Heap**: Priority Queue for emergency triage scheduling.
  - **Separate Chaining Hash Table**: $O(1)$ patient lookup by Patient ID.
  - **Singly Linked List**: Sequential in-memory treatment audit event stream.
  - **FIFO Queue**: Reception and intake desk queue.
  - **Merge Sort**: Stable divide-and-conquer record ordering with step tracing.

---

## 2. DSA Implementations & Theoretical Complexities

| Data Structure / Algorithm | Source File | Purpose in SMART ERM | Time Complexity | Space Complexity |
| :--- | :--- | :--- | :--- | :--- |
| **Binary Min-Heap (Priority Queue)** | `backend/app/dsa/priority_queue.py` | Automatically schedules waiting patients by triage urgency (Critical = 1, High = 2, Moderate = 3, Low = 4). Preserves FIFO order on ties via a monotonic arrival sequence. | **Push**: $O(\log n)$<br>**Pop (Extract Min)**: $O(\log n)$<br>**Peek**: $O(1)$ | $O(n)$ |
| **Separate Chaining Hash Table** | `backend/app/dsa/hash_table.py` | Indexes patient records by Patient ID for instantaneous census retrieval, demonstrating collision resolution via linked bucket chains and dynamic resizing. | **Search / Insert**: Average $O(1)$, Worst $O(n)$ | $O(n)$ |
| **Singly Linked List** | `backend/app/dsa/linked_list.py` | In-memory audit event stream with head and tail pointers, allowing append operations without resizing arrays. | **Append**: $O(1)$<br>**Traversal**: $O(n)$ | $O(n)$ |
| **FIFO Queue** | `backend/app/dsa/fifo_queue.py` | Front-desk patient intake and administrative processing pipeline. | **Enqueue / Dequeue**: $O(1)$ | $O(n)$ |
| **Merge Sort** | `backend/app/dsa/sorting.py` | Demonstrates stable recursive divide-and-conquer patient record sorting by age, arrival sequence, or priority with execution logs. | **All Cases**: $O(n \log n)$ | $O(n)$ |

---

## 3. Windows PowerShell Setup & Launch Instructions

### Prerequisites
- Python 3.10+
- Node.js v18+ and npm

### Step 1: Install Python Dependencies
```powershell
cd "d:\Smart Emergency Room Manager"
python -m pip install -r backend/requirements.txt
```

### Step 2: Install Frontend Dependencies
```powershell
cd "d:\Smart Emergency Room Manager\frontend"
npm install
```

### Step 3: Run the Backend Server
```powershell
cd "d:\Smart Emergency Room Manager\backend"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
- API Base URL: `http://127.0.0.1:8000`
- Interactive Swagger API Docs: `http://127.0.0.1:8000/docs`
- Health Endpoint: `http://127.0.0.1:8000/api/health`

### Step 4: Run the Frontend Dev Server
Open a second PowerShell terminal:
```powershell
cd "d:\Smart Emergency Room Manager\frontend"
npm run dev -- --host 127.0.0.1 --port 5173
```
- Application Web Interface: `http://127.0.0.1:5173/`

---

## 4. Automated Test Results

Automated unit tests and integration tests are located in `backend/tests/`.

### Run Test Suite:
```powershell
cd "d:\Smart Emergency Room Manager"
python -m pytest backend/tests -v
```

### Summary of Passing Tests (23 passed, 0 failed):
- `test_dsa_priority_queue.py`:
  - `test_priority_queue_empty_peek_and_pop` (PASSED)
  - `test_priority_queue_priority_ordering` (PASSED)
  - `test_priority_queue_fifo_for_equal_priorities` (PASSED)
  - `test_priority_queue_remove_by_patient_id` (PASSED)
  - `test_priority_queue_get_ordered_list` (PASSED)
- `test_dsa_hash_table.py`:
  - `test_hash_table_basic_operations` (PASSED)
  - `test_hash_table_update_existing_key` (PASSED)
  - `test_hash_table_deletion` (PASSED)
  - `test_hash_table_collisions_and_resize` (PASSED)
- `test_dsa_linked_list.py`:
  - `test_linked_list_append_and_traverse` (PASSED)
  - `test_linked_list_search_by_patient_id` (PASSED)
  - `test_linked_list_delete_by_event_id` (PASSED)
- `test_dsa_fifo_queue.py`:
  - `test_fifo_queue_operations` (PASSED)
- `test_dsa_sorting.py`:
  - `test_merge_sort_numeric_key` (PASSED)
  - `test_merge_sort_stability_and_reverse` (PASSED)
- `test_api_integration.py`:
  - `test_health_endpoint` (PASSED)
  - `test_dashboard_summary` (PASSED)
  - `test_triage_queue_min_heap_priority_ordering` (PASSED)
  - `test_patient_search_and_retrieval` (PASSED)
  - `test_staff_override_triage_reclassification` (PASSED)
  - `test_treatment_workflow_and_resource_locking` (PASSED)
  - `test_dsa_visualizer_endpoints` (PASSED)
  - `test_audit_history_and_csv_export` (PASSED)

---

## 5. Key Application Features

1. **Operations Dashboard**: Live census, total registered, patients waiting, critical alerts, arrivals trend graph, and bed availability.
2. **Patient Registration**: Demographics validation, staff urgency assignment, one-click demo presets, and automatic heap enqueueing.
3. **Triage Queue (Primary Feature)**: Real-time min-heap scheduled waiting list, elapsed timers, doctor/bed allocation modal, and audited staff override.
4. **Treatment Room Workflow**: State transitions (`Waiting` $\to$ `Under Treatment` $\to$ `Treatment Completed` $\to$ `Discharged`), doctor/bed locking to prevent double-allocation.
5. **Doctors & Bed Inventory**: Dynamic status tracking, creation modal, and cleaning/maintenance toggling.
6. **Patient Records**: Census search, filters, and complete profile view with audit event history.
7. **Treatment History & Audit Log**: Immutable log of registrations, triage overrides, doctor allocations, and discharges.
8. **Operational Reports & Analytics**: Average wait time calculations, bed occupancy, and CSV dataset export.
9. **DSA Interactive Lab**: Live visualization of heap arrays, bucket chains, linked lists, and merge sort execution traces.
10. **System Settings**: Configurable facility name, staff identity, and one-click database reset and re-seeding.
