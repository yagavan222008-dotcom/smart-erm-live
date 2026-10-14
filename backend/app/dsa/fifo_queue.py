"""
First-In-First-Out (FIFO) Queue Implementation.
Used for intake processing, administrative registration desk, and reception workflow.

Time Complexities:
- Enqueue:  O(1)
- Dequeue:  O(1)
- Peek:     O(1)
- Is Empty: O(1)
- Size:     O(1)
"""

from typing import Any, Optional, List, Dict
from collections import deque


class FifoQueue:
    """
    Standard FIFO Queue using a doubly-linked ring buffer (collections.deque).
    Provides guaranteed O(1) amortized enqueue and dequeue operations.
    """

    def __init__(self):
        self._items = deque()
        self._history: List[Dict[str, Any]] = []

    def __len__(self) -> int:
        return len(self._items)

    def is_empty(self) -> bool:
        return len(self._items) == 0

    def enqueue(self, item: Any) -> None:
        """
        Add an element to the rear of the queue.
        Time Complexity: O(1)
        """
        self._items.append(item)
        self._record("ENQUEUE", item)

    def dequeue(self) -> Optional[Any]:
        """
        Remove and return the front element of the queue.
        Time Complexity: O(1)
        """
        if self.is_empty():
            return None
        item = self._items.popleft()
        self._record("DEQUEUE", item)
        return item

    def peek(self) -> Optional[Any]:
        """
        Return the front element without removing it.
        Time Complexity: O(1)
        """
        if self.is_empty():
            return None
        return self._items[0]

    def to_list(self) -> List[Any]:
        return list(self._items)

    def _record(self, action: str, item: Any) -> None:
        self._history.append({
            "action": action,
            "item": str(item) if not isinstance(item, dict) else item.get("name", str(item)),
            "remaining": len(self._items)
        })
        if len(self._history) > 30:
            self._history.pop(0)

    def get_state(self) -> Dict[str, Any]:
        return {
            "size": len(self._items),
            "front": self.peek(),
            "items": list(self._items),
            "recent_actions": self._history[-10:]
        }
