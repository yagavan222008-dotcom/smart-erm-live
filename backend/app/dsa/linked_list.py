"""
Singly Linked List for Tracking Treatment History and Event Timelines.
Demonstrates classical node-based dynamic memory allocation and linear traversal.

Time Complexities:
- Append:              O(1) with tail pointer, O(n) without tail pointer
- Prepend:             O(1)
- Search by Patient ID: O(n)
- Traverse / To List:  O(n)
- Delete:              O(n)
"""

from typing import Any, List, Optional, Dict
from datetime import datetime


class EventNode:
    """A node in the linked list representing a single healthcare event."""
    def __init__(self, event_id: str, patient_id: str, event_type: str, details: str, staff: str, timestamp: Optional[str] = None):
        self.event_id: str = event_id
        self.patient_id: str = patient_id
        self.event_type: str = event_type
        self.details: str = details
        self.staff: str = staff
        self.timestamp: str = timestamp or datetime.now().isoformat()
        self.next: Optional['EventNode'] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "event_id": self.event_id,
            "patient_id": self.patient_id,
            "event_type": self.event_type,
            "details": self.details,
            "staff": self.staff,
            "timestamp": self.timestamp
        }


class LinkedList:
    """
    Singly linked list with head and tail pointers.
    Maintains a sequential chain of ER events in memory.
    """

    def __init__(self):
        self.head: Optional[EventNode] = None
        self.tail: Optional[EventNode] = None
        self.size: int = 0

    def __len__(self) -> int:
        return self.size

    def is_empty(self) -> bool:
        return self.head is None

    def append(self, event_id: str, patient_id: str, event_type: str, details: str, staff: str, timestamp: Optional[str] = None) -> EventNode:
        """
        Append a new event to the end of the linked list in O(1) using the tail pointer.
        """
        new_node = EventNode(event_id, patient_id, event_type, details, staff, timestamp)
        if self.head is None:
            self.head = new_node
            self.tail = new_node
        else:
            assert self.tail is not None
            self.tail.next = new_node
            self.tail = new_node
        self.size += 1
        return new_node

    def prepend(self, event_id: str, patient_id: str, event_type: str, details: str, staff: str, timestamp: Optional[str] = None) -> EventNode:
        """
        Prepend a new event to the head of the linked list in O(1).
        """
        new_node = EventNode(event_id, patient_id, event_type, details, staff, timestamp)
        if self.head is None:
            self.head = new_node
            self.tail = new_node
        else:
            new_node.next = self.head
            self.head = new_node
        self.size += 1
        return new_node

    def search_by_patient_id(self, patient_id: str) -> List[Dict[str, Any]]:
        """
        Traverse the linked list and return all event nodes associated with the patient.
        Time Complexity: O(n)
        """
        results = []
        curr = self.head
        while curr:
            if curr.patient_id == patient_id:
                results.append(curr.to_dict())
            curr = curr.next
        return results

    def to_list(self) -> List[Dict[str, Any]]:
        """
        Linear traversal converting linked nodes into a Python list.
        Time Complexity: O(n)
        """
        elements = []
        curr = self.head
        while curr:
            elements.append(curr.to_dict())
            curr = curr.next
        return elements

    def delete_by_event_id(self, event_id: str) -> bool:
        """
        Delete a node matching the specified event_id.
        Time Complexity: O(n)
        """
        if self.head is None:
            return False

        if self.head.event_id == event_id:
            if self.head == self.tail:
                self.tail = None
            self.head = self.head.next
            self.size -= 1
            return True

        curr = self.head
        while curr.next:
            if curr.next.event_id == event_id:
                if curr.next == self.tail:
                    self.tail = curr
                curr.next = curr.next.next
                self.size -= 1
                return True
            curr = curr.next

        return False
