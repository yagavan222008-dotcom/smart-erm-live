"""
Singleton DSA Manager providing live in-memory Data Structure instances:
1. PriorityQueue (Binary Min-Heap) for active triage scheduling
2. HashTable (Separate Chaining) for educational O(1) patient lookup
3. LinkedList (Singly Linked List) for in-memory treatment event stream
4. FifoQueue (Ring Buffer) for administrative intake desk
"""

from typing import Optional, List, Dict, Any
from app.dsa.priority_queue import PriorityQueue, QueueItem
from app.dsa.hash_table import HashTable
from app.dsa.linked_list import LinkedList
from app.dsa.fifo_queue import FifoQueue


class DSAManager:
    _instance: Optional['DSAManager'] = None

    def __init__(self):
        self.priority_queue = PriorityQueue()
        self.patient_hash_table = HashTable(capacity=32)
        self.event_linked_list = LinkedList()
        self.reception_fifo = FifoQueue()

    @classmethod
    def get_instance(cls) -> 'DSAManager':
        if cls._instance is None:
            cls._instance = DSAManager()
        return cls._instance

    def rebuild_queue_from_db(self, waiting_patients: List[Any]) -> None:
        """
        Reconstruct the binary min-heap from authoritative SQLite database records on startup or resync.
        Clears existing heap and pushes only 'Waiting' patients using their original priority & arrival_seq.
        """
        self.priority_queue = PriorityQueue()

        for p in waiting_patients:
            priority_val = PriorityQueue.get_priority_level(p.triage_level)
            item = QueueItem(
                priority=priority_val,
                arrival_seq=p.arrival_seq,
                patient_id=p.id,
                patient_name=p.full_name,
                age=p.age,
                triage_level=p.triage_level,
                complaint=p.complaint,
                arrival_time=p.arrival_time.isoformat() if hasattr(p.arrival_time, "isoformat") else str(p.arrival_time),
                status=p.status
            )
            self.priority_queue.push(item)

    def sync_patient_to_hash_table(self, patient_dict: Dict[str, Any]) -> None:
        """Mirror patient record into educational separate-chaining hash table."""
        self.patient_hash_table.insert(patient_dict["id"], patient_dict)

    def log_event_to_linked_list(self, event_id: str, patient_id: str, event_type: str, details: str, staff: str) -> None:
        """Record an event into the singly linked list chain."""
        self.event_linked_list.append(event_id, patient_id, event_type, details, staff)


dsa_manager = DSAManager.get_instance()
