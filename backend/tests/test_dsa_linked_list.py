import pytest
from app.dsa.linked_list import LinkedList


def test_linked_list_append_and_traverse():
    ll = LinkedList()
    assert ll.is_empty()
    assert len(ll) == 0

    ll.append("EV-1", "PT-100", "REGISTRATION", "Patient arrived", "Nurse Sarah")
    ll.append("EV-2", "PT-100", "TRIAGE", "Triage assigned: High", "Nurse Sarah")
    ll.append("EV-3", "PT-101", "REGISTRATION", "Patient arrived", "Nurse Dave")

    assert len(ll) == 3
    assert not ll.is_empty()

    all_events = ll.to_list()
    assert len(all_events) == 3
    assert all_events[0]["event_id"] == "EV-1"
    assert all_events[2]["event_id"] == "EV-3"


def test_linked_list_search_by_patient_id():
    ll = LinkedList()
    ll.append("EV-1", "PT-100", "REGISTRATION", "Arrived", "Nurse")
    ll.append("EV-2", "PT-200", "REGISTRATION", "Arrived", "Nurse")
    ll.append("EV-3", "PT-100", "BED_ASSIGN", "Bed A1", "Doctor")

    pt_100_events = ll.search_by_patient_id("PT-100")
    assert len(pt_100_events) == 2
    assert pt_100_events[0]["event_id"] == "EV-1"
    assert pt_100_events[1]["event_id"] == "EV-3"

    pt_none_events = ll.search_by_patient_id("PT-999")
    assert len(pt_none_events) == 0


def test_linked_list_delete_by_event_id():
    ll = LinkedList()
    ll.append("EV-1", "PT-100", "E1", "Details", "Staff")
    ll.append("EV-2", "PT-100", "E2", "Details", "Staff")
    ll.append("EV-3", "PT-100", "E3", "Details", "Staff")

    assert ll.delete_by_event_id("EV-2") is True
    assert len(ll) == 2

    # Verify order
    events = ll.to_list()
    assert [e["event_id"] for e in events] == ["EV-1", "EV-3"]

    # Delete head
    assert ll.delete_by_event_id("EV-1") is True
    assert len(ll) == 1
    assert ll.head.event_id == "EV-3"

    # Delete tail
    assert ll.delete_by_event_id("EV-3") is True
    assert len(ll) == 0
    assert ll.is_empty()
