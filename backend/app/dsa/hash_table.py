"""
Hash Table with Separate Chaining for Fast Patient Lookup.
Demonstrates classical DSA hash table architecture with collision resolution.

Time Complexities:
- Insert:  Average O(1), Worst O(n)
- Search:  Average O(1), Worst O(n)
- Delete:  Average O(1), Worst O(n)
- Update:  Average O(1), Worst O(n)
"""

from typing import Any, List, Optional, Tuple, Dict


class HashNode:
    """Entry node storing key-value pair and link for separate chaining."""
    def __init__(self, key: str, value: Any):
        self.key: str = key
        self.value: Any = value
        self.next: Optional['HashNode'] = None


class HashTable:
    """
    Hash Table with fixed bucket count and separate chaining.
    Keys: Patient ID (string, e.g. "PT-2026-0001")
    Values: Patient dictionary/record
    """

    def __init__(self, capacity: int = 16):
        self.capacity = capacity
        self.size = 0
        self.buckets: List[Optional[HashNode]] = [None] * self.capacity
        self.collision_count = 0
        self.operation_history: List[Dict[str, Any]] = []

    def _hash(self, key: str) -> int:
        """
        Custom polynomial rolling hash function.
        hash = sum(ord(char) * p^i) % capacity
        """
        p = 31
        hash_val = 0
        p_pow = 1
        for char in key:
            hash_val = (hash_val + ord(char) * p_pow) % self.capacity
            p_pow = (p_pow * p) % self.capacity
        return hash_val

    def insert(self, key: str, value: Any) -> None:
        """
        Insert or update a key-value pair.
        """
        index = self._hash(key)
        head = self.buckets[index]

        # Check if key already exists (update)
        curr = head
        while curr:
            if curr.key == key:
                curr.value = value
                self._record_op("UPDATE", key, index, "Updated existing key")
                return
            curr = curr.next

        # Key does not exist; insert new node at head of chain
        new_node = HashNode(key, value)
        if head is not None:
            self.collision_count += 1
            new_node.next = head
            self.buckets[index] = new_node
            self._record_op("COLLISION_INSERT", key, index, f"Chained collision at bucket index {index}")
        else:
            self.buckets[index] = new_node
            self._record_op("INSERT", key, index, f"Direct inserted at bucket index {index}")

        self.size += 1

        # Check load factor
        if (self.size / self.capacity) > 0.75:
            self._resize(self.capacity * 2)

    def search(self, key: str) -> Optional[Any]:
        """
        Search for a key and return the associated value.
        """
        index = self._hash(key)
        curr = self.buckets[index]
        steps = 0
        while curr:
            steps += 1
            if curr.key == key:
                self._record_op("SEARCH_HIT", key, index, f"Found after {steps} step(s)")
                return curr.value
            curr = curr.next

        self._record_op("SEARCH_MISS", key, index, f"Key not found in bucket {index}")
        return None

    def delete(self, key: str) -> bool:
        """
        Delete a key-value pair by key.
        Returns True if deleted, False if not found.
        """
        index = self._hash(key)
        curr = self.buckets[index]
        prev: Optional[HashNode] = None

        while curr:
            if curr.key == key:
                if prev is None:
                    self.buckets[index] = curr.next
                else:
                    prev.next = curr.next
                self.size -= 1
                self._record_op("DELETE", key, index, f"Deleted key from bucket {index}")
                return True
            prev = curr
            curr = curr.next

        self._record_op("DELETE_FAIL", key, index, "Key not found for deletion")
        return False

    def _resize(self, new_capacity: int) -> None:
        """Double table capacity and rehash all keys when load factor exceeds threshold."""
        old_buckets = self.buckets
        self.capacity = new_capacity
        self.buckets = [None] * new_capacity
        self.size = 0
        self.collision_count = 0

        for head in old_buckets:
            curr = head
            while curr:
                self.insert(curr.key, curr.value)
                curr = curr.next

        self._record_op("RESIZE", "ALL", 0, f"Resized hash table capacity to {new_capacity}")

    def _record_op(self, op_type: str, key: str, bucket: int, message: str) -> None:
        self.operation_history.append({
            "operation": op_type,
            "key": key,
            "bucket_index": bucket,
            "message": message,
            "current_size": self.size,
            "load_factor": round(self.size / self.capacity, 3)
        })
        if len(self.operation_history) > 30:
            self.operation_history.pop(0)

    def get_structure_visual(self) -> Dict[str, Any]:
        """
        Visual representation of buckets and chained nodes for DSA demonstration page.
        """
        visual_buckets = []
        for i, head in enumerate(self.buckets):
            chain = []
            curr = head
            while curr:
                val_summary = curr.value.get("name", "Patient") if isinstance(curr.value, dict) else str(curr.value)
                chain.append({"key": curr.key, "summary": val_summary})
                curr = curr.next
            visual_buckets.append({
                "bucket_index": i,
                "chain_length": len(chain),
                "nodes": chain
            })

        return {
            "capacity": self.capacity,
            "size": self.size,
            "load_factor": round(self.size / self.capacity, 3) if self.capacity > 0 else 0,
            "collision_count": self.collision_count,
            "buckets": visual_buckets,
            "recent_operations": self.operation_history[-10:]
        }
