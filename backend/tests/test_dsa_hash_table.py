import pytest
from app.dsa.hash_table import HashTable


def test_hash_table_basic_operations():
    ht = HashTable(capacity=8)
    assert ht.size == 0

    # Insert items
    ht.insert("PT-1001", {"name": "Alice", "age": 29})
    ht.insert("PT-1002", {"name": "Bob", "age": 42})

    assert ht.size == 2
    assert ht.search("PT-1001") == {"name": "Alice", "age": 29}
    assert ht.search("PT-1002") == {"name": "Bob", "age": 42}
    assert ht.search("PT-9999") is None


def test_hash_table_update_existing_key():
    ht = HashTable(capacity=8)
    ht.insert("PT-1001", {"status": "Waiting"})
    ht.insert("PT-1001", {"status": "Under Treatment"})

    assert ht.size == 1
    assert ht.search("PT-1001") == {"status": "Under Treatment"}


def test_hash_table_deletion():
    ht = HashTable(capacity=8)
    ht.insert("PT-1001", "Record 1")
    ht.insert("PT-1002", "Record 2")

    assert ht.delete("PT-1001") is True
    assert ht.size == 1
    assert ht.search("PT-1001") is None
    assert ht.search("PT-1002") == "Record 2"

    # Delete non-existent
    assert ht.delete("NON_EXIST") is False


def test_hash_table_collisions_and_resize():
    # Force small capacity to verify separate chaining and automatic resizing
    ht = HashTable(capacity=4)
    for i in range(10):
        ht.insert(f"KEY_{i}", f"VALUE_{i}")

    assert ht.size == 10
    # Capacity must have doubled to accommodate items
    assert ht.capacity >= 8
    for i in range(10):
        assert ht.search(f"KEY_{i}") == f"VALUE_{i}"
