from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel


from app.schemas.audit import AuditEventResponse


class DashboardSummaryResponse(BaseModel):
    total_registered_today: int
    patients_waiting: int
    patients_under_treatment: int
    critical_waiting: int
    available_beds: int
    total_beds: int
    completed_today: int
    discharged_today: int
    avg_wait_time_minutes: float
    avg_treatment_time_minutes: float
    urgency_distribution: Dict[str, int]
    bed_status_breakdown: Dict[str, int]
    arrivals_timeline: List[Dict[str, Any]]
    recent_registrations: List[Dict[str, Any]]
    priority_queue_preview: List[Dict[str, Any]]


class DsaHeapStateResponse(BaseModel):
    structure_name: str = "Binary Min-Heap"
    size: int
    peek_root: Optional[Dict[str, Any]] = None
    heap_array: List[Dict[str, Any]]
    ordered_queue: List[Dict[str, Any]]
    recent_operations: List[Dict[str, Any]]
    time_complexities: Dict[str, str] = {
        "Insertion": "O(log n)",
        "Extract Minimum": "O(log n)",
        "Peek Root": "O(1)",
        "Reheapify Up/Down": "O(log n)"
    }


class DsaHashTableResponse(BaseModel):
    structure_name: str = "Separate Chaining Hash Table"
    capacity: int
    size: int
    load_factor: float
    collision_count: int
    buckets: List[Dict[str, Any]]
    recent_operations: List[Dict[str, Any]]
    time_complexities: Dict[str, str] = {
        "Insert / Update": "Average O(1), Worst O(n)",
        "Search": "Average O(1), Worst O(n)",
        "Delete": "Average O(1), Worst O(n)"
    }


class DsaLinkedListResponse(BaseModel):
    structure_name: str = "Singly Linked List"
    size: int
    head: Optional[Dict[str, Any]] = None
    tail: Optional[Dict[str, Any]] = None
    nodes: List[Dict[str, Any]]
    time_complexities: Dict[str, str] = {
        "Append (with Tail)": "O(1)",
        "Prepend": "O(1)",
        "Search by Patient ID": "O(n)",
        "Traversal": "O(n)"
    }
