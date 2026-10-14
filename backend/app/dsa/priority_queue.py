"""
Priority Queue implementation using a Binary Min-Heap.
Designed for Emergency Room Triage Patient Scheduling.

Triage Urgency Numeric Mapping:
- Critical = 1
- High     = 2
- Moderate = 3
- Low      = 4

Secondary comparison: Arrival sequence (monotonically increasing integer)
to guarantee First-In-First-Out (FIFO) ordering for patients of equal urgency.

Time Complexities:
- Insertion:   O(log n)
- Extract Min: O(log n)
- Peek:        O(1)
- Size / IsEmpty: O(1)
- Get Sorted Order (non-destructive): O(n log n)
"""

from typing import List, Optional, Dict, Any
from dataclasses import dataclass, field
from datetime import datetime


@dataclass(order=True)
class QueueItem:
    """
    Element stored in the Min-Heap.
    Comparison is performed sequentially by (priority, arrival_seq).
    """
    priority: int
    arrival_seq: int
    patient_id: str = field(compare=False)
    patient_name: str = field(compare=False)
    age: int = field(compare=False)
    triage_level: str = field(compare=False)
    complaint: str = field(compare=False)
    arrival_time: str = field(compare=False)
    status: str = field(compare=False, default="Waiting")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "patient_id": self.patient_id,
            "patient_name": self.patient_name,
            "age": self.age,
            "priority": self.priority,
            "triage_level": self.triage_level,
            "arrival_seq": self.arrival_seq,
            "complaint": self.complaint,
            "arrival_time": self.arrival_time,
            "status": self.status,
        }


class PriorityQueue:
    """
    Binary Min-Heap implementation for Emergency Triage Queue.
    Maintains items where root is always the highest priority patient.
    """

    TRIAGE_PRIORITY_MAP = {
        "Critical": 1,
        "High": 2,
        "Moderate": 3,
        "Low": 4
    }

    def __init__(self):
        self._heap: List[QueueItem] = []
        self._operation_log: List[Dict[str, Any]] = []

    def __len__(self) -> int:
        return len(self._heap)

    def is_empty(self) -> bool:
        return len(self._heap) == 0

    @classmethod
    def get_priority_level(cls, triage_level: str) -> int:
        return cls.TRIAGE_PRIORITY_MAP.get(triage_level, 4)

    def push(self, item: QueueItem) -> None:
        """
        Insert a new patient item into the min-heap.
        Time Complexity: O(log n)
        Appends to the end and bubbles (sifts) up until heap property is restored.
        """
        self._heap.append(item)
        idx = len(self._heap) - 1
        self._sift_up(idx)
        self._log_operation("PUSH", f"Inserted patient {item.patient_name} (ID: {item.patient_id}, Priority: {item.priority}, Seq: {item.arrival_seq})")

    def pop(self) -> Optional[QueueItem]:
        """
        Extract the highest priority patient (root of the min-heap).
        Time Complexity: O(log n)
        Swaps root with last element, pops last, and sifts root down.
        """
        if self.is_empty():
            return None

        if len(self._heap) == 1:
            extracted = self._heap.pop()
            self._log_operation("POP", f"Extracted single root patient {extracted.patient_name} (ID: {extracted.patient_id})")
            return extracted

        root = self._heap[0]
        # Replace root with last element
        self._heap[0] = self._heap.pop()
        self._sift_down(0)
        self._log_operation("POP", f"Extracted root patient {root.patient_name} (ID: {root.patient_id}, Urgency: {root.triage_level})")
        return root

    def peek(self) -> Optional[QueueItem]:
        """
        Inspect the highest priority patient without removing.
        Time Complexity: O(1)
        """
        if self.is_empty():
            return None
        return self._heap[0]

    def remove_by_patient_id(self, patient_id: str) -> Optional[QueueItem]:
        """
        Remove a patient from the queue if they are cancelled or assigned.
        Time Complexity: O(n) to find + O(log n) to reheapify.
        """
        target_idx = -1
        for i, item in enumerate(self._heap):
            if item.patient_id == patient_id:
                target_idx = i
                break

        if target_idx == -1:
            return None

        removed_item = self._heap[target_idx]
        last_item = self._heap.pop()

        if target_idx < len(self._heap):
            self._heap[target_idx] = last_item
            parent = (target_idx - 1) // 2
            if target_idx > 0 and self._heap[target_idx] < self._heap[parent]:
                self._sift_up(target_idx)
            else:
                self._sift_down(target_idx)

        self._log_operation("REMOVE", f"Removed patient {removed_item.patient_name} (ID: {patient_id}) from queue")
        return removed_item

    def get_ordered_list(self) -> List[QueueItem]:
        """
        Return the patients ordered by priority (1 to 4) and arrival sequence.
        Non-destructive: builds a copy and extracts until empty.
        Time Complexity: O(n log n)
        """
        copy_pq = PriorityQueue()
        copy_pq._heap = list(self._heap)
        ordered: List[QueueItem] = []
        while not copy_pq.is_empty():
            item = copy_pq.pop()
            if item:
                ordered.append(item)
        return ordered

    def _sift_up(self, index: int) -> None:
        """
        Bubble up the element at index to restore min-heap property.
        """
        parent_idx = (index - 1) // 2
        while index > 0 and self._heap[index] < self._heap[parent_idx]:
            self._heap[index], self._heap[parent_idx] = self._heap[parent_idx], self._heap[index]
            index = parent_idx
            parent_idx = (index - 1) // 2

    def _sift_down(self, index: int) -> None:
        """
        Sift down the element at index to restore min-heap property.
        """
        size = len(self._heap)
        smallest = index

        while True:
            left_child = 2 * index + 1
            right_child = 2 * index + 2

            if left_child < size and self._heap[left_child] < self._heap[smallest]:
                smallest = left_child

            if right_child < size and self._heap[right_child] < self._heap[smallest]:
                smallest = right_child

            if smallest != index:
                self._heap[index], self._heap[smallest] = self._heap[smallest], self._heap[index]
                index = smallest
            else:
                break

    def _log_operation(self, op_type: str, details: str) -> None:
        self._operation_log.append({
            "timestamp": datetime.now().isoformat(),
            "operation": op_type,
            "details": details,
            "heap_size": len(self._heap)
        })
        # Keep last 50 operation traces for viva / demonstration
        if len(self._operation_log) > 50:
            self._operation_log.pop(0)

    def get_heap_state(self) -> Dict[str, Any]:
        """
        Returns full array representation and tree metadata for visualization.
        """
        return {
            "size": len(self._heap),
            "heap_array": [item.to_dict() for item in self._heap],
            "ordered_queue": [item.to_dict() for item in self.get_ordered_list()],
            "recent_operations": self._operation_log[-10:]
        }
