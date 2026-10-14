import pytest
from app.dsa.fifo_queue import FifoQueue


def test_fifo_queue_operations():
    q = FifoQueue()
    assert q.is_empty()
    assert len(q) == 0
    assert q.dequeue() is None
    assert q.peek() is None

    q.enqueue("Patient A")
    q.enqueue("Patient B")
    q.enqueue("Patient C")

    assert len(q) == 3
    assert not q.is_empty()
    assert q.peek() == "Patient A"

    assert q.dequeue() == "Patient A"
    assert q.dequeue() == "Patient B"
    assert q.dequeue() == "Patient C"
    assert q.is_empty()
    assert q.dequeue() is None
