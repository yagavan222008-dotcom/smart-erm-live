import pytest
from app.dsa.priority_queue import PriorityQueue, QueueItem


def test_priority_queue_empty_peek_and_pop():
    pq = PriorityQueue()
    assert pq.is_empty()
    assert len(pq) == 0
    assert pq.peek() is None
    assert pq.pop() is None


def test_priority_queue_priority_ordering():
    pq = PriorityQueue()

    # Add Low priority first (priority = 4)
    item_low = QueueItem(priority=4, arrival_seq=1, patient_id="P1", patient_name="Low Patient",
                         age=30, triage_level="Low", complaint="Minor rash", arrival_time="10:00")
    # Add Moderate priority (priority = 3)
    item_mod = QueueItem(priority=3, arrival_seq=2, patient_id="P2", patient_name="Mod Patient",
                         age=45, triage_level="Moderate", complaint="Sprained wrist", arrival_time="10:05")
    # Add High priority (priority = 2)
    item_high = QueueItem(priority=2, arrival_seq=3, patient_id="P3", patient_name="High Patient",
                          age=60, triage_level="High", complaint="Severe asthma", arrival_time="10:10")
    # Add Critical priority (priority = 1)
    item_crit = QueueItem(priority=1, arrival_seq=4, patient_id="P4", patient_name="Crit Patient",
                          age=70, triage_level="Critical", complaint="Cardiac arrest", arrival_time="10:15")

    pq.push(item_low)
    pq.push(item_mod)
    pq.push(item_high)
    pq.push(item_crit)

    assert len(pq) == 4
    assert not pq.is_empty()

    # Peak must be Critical
    assert pq.peek().patient_id == "P4"

    # Pop order must be Critical -> High -> Moderate -> Low
    assert pq.pop().patient_id == "P4"
    assert pq.pop().patient_id == "P3"
    assert pq.pop().patient_id == "P2"
    assert pq.pop().patient_id == "P1"
    assert pq.is_empty()


def test_priority_queue_fifo_for_equal_priorities():
    pq = PriorityQueue()

    # Two Critical patients arriving at sequential arrival_seq numbers
    p1 = QueueItem(priority=1, arrival_seq=10, patient_id="P_FIRST", patient_name="First Crit",
                   age=40, triage_level="Critical", complaint="Stroke signs", arrival_time="10:00")
    p2 = QueueItem(priority=1, arrival_seq=11, patient_id="P_SECOND", patient_name="Second Crit",
                   age=50, triage_level="Critical", complaint="Severe trauma", arrival_time="10:02")
    p3 = QueueItem(priority=1, arrival_seq=12, patient_id="P_THIRD", patient_name="Third Crit",
                   age=35, triage_level="Critical", complaint="Anaphylaxis", arrival_time="10:04")

    # Push out of order to test heap maintains correct secondary ordering
    pq.push(p2)
    pq.push(p1)
    pq.push(p3)

    assert pq.pop().patient_id == "P_FIRST"
    assert pq.pop().patient_id == "P_SECOND"
    assert pq.pop().patient_id == "P_THIRD"


def test_priority_queue_remove_by_patient_id():
    pq = PriorityQueue()
    p1 = QueueItem(priority=2, arrival_seq=1, patient_id="P1", patient_name="P1",
                   age=25, triage_level="High", complaint="Cut", arrival_time="10:00")
    p2 = QueueItem(priority=1, arrival_seq=2, patient_id="P2", patient_name="P2",
                   age=30, triage_level="Critical", complaint="Bleeding", arrival_time="10:01")
    p3 = QueueItem(priority=3, arrival_seq=3, patient_id="P3", patient_name="P3",
                   age=40, triage_level="Moderate", complaint="Fever", arrival_time="10:02")

    pq.push(p1)
    pq.push(p2)
    pq.push(p3)

    removed = pq.remove_by_patient_id("P2")
    assert removed is not None
    assert removed.patient_id == "P2"
    assert len(pq) == 2

    # Now root should be p1 (High, priority 2)
    assert pq.peek().patient_id == "P1"

    # Non-existent ID removal
    assert pq.remove_by_patient_id("NON_EXISTENT") is None


def test_priority_queue_get_ordered_list():
    pq = PriorityQueue()
    p_low = QueueItem(priority=4, arrival_seq=1, patient_id="PLOW", patient_name="PL",
                      age=20, triage_level="Low", complaint="Earache", arrival_time="09:00")
    p_crit = QueueItem(priority=1, arrival_seq=2, patient_id="PCRIT", patient_name="PC",
                       age=65, triage_level="Critical", complaint="Chest pain", arrival_time="09:10")

    pq.push(p_low)
    pq.push(p_crit)

    ordered = pq.get_ordered_list()
    assert len(ordered) == 2
    assert ordered[0].patient_id == "PCRIT"
    assert ordered[1].patient_id == "PLOW"
    # Original heap length untouched
    assert len(pq) == 2
