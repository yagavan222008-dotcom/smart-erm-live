import pytest
from app.dsa.sorting import merge_sort


def test_merge_sort_numeric_key():
    patients = [
        {"patient_id": "P3", "age": 72},
        {"patient_id": "P1", "age": 25},
        {"patient_id": "P4", "age": 45},
        {"patient_id": "P2", "age": 18},
    ]

    res = merge_sort(patients, key="age", reverse=False, trace_steps=True)
    sorted_items = res["sorted_items"]

    ages = [p["age"] for p in sorted_items]
    assert ages == [18, 25, 45, 72]
    assert len(res["steps"]) > 0


def test_merge_sort_stability_and_reverse():
    patients = [
        {"patient_id": "P1", "priority": 1, "arrival": 1},
        {"patient_id": "P2", "priority": 2, "arrival": 2},
        {"patient_id": "P3", "priority": 1, "arrival": 3},
    ]

    # Reverse sort by priority (priority 2 first, then 1)
    res = merge_sort(patients, key="priority", reverse=True)
    priorities = [p["priority"] for p in res["sorted_items"]]
    assert priorities == [2, 1, 1]

    # Preserved FIFO order for priority 1 patients (stable)
    crit_ids = [p["patient_id"] for p in res["sorted_items"] if p["priority"] == 1]
    assert crit_ids == ["P1", "P3"]
