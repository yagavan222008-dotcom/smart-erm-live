from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.patient import Patient
from app.services.dsa_manager import dsa_manager
from app.dsa.sorting import merge_sort
from app.schemas.dashboard import DsaHeapStateResponse, DsaHashTableResponse, DsaLinkedListResponse

router = APIRouter()


@router.get("/dsa/heap", response_model=DsaHeapStateResponse)
def get_heap_state():
    state = dsa_manager.priority_queue.get_heap_state()
    peek_item = dsa_manager.priority_queue.peek()
    return DsaHeapStateResponse(
        size=state["size"],
        peek_root=peek_item.to_dict() if peek_item else None,
        heap_array=state["heap_array"],
        ordered_queue=state["ordered_queue"],
        recent_operations=state["recent_operations"]
    )


@router.get("/dsa/hash-table", response_model=DsaHashTableResponse)
def get_hash_table_state():
    visual = dsa_manager.patient_hash_table.get_structure_visual()
    return DsaHashTableResponse(
        capacity=visual["capacity"],
        size=visual["size"],
        load_factor=visual["load_factor"],
        collision_count=visual["collision_count"],
        buckets=visual["buckets"],
        recent_operations=visual["recent_operations"]
    )


@router.get("/dsa/linked-list", response_model=DsaLinkedListResponse)
def get_linked_list_state():
    nodes = dsa_manager.event_linked_list.to_list()
    head_dict = dsa_manager.event_linked_list.head.to_dict() if dsa_manager.event_linked_list.head else None
    tail_dict = dsa_manager.event_linked_list.tail.to_dict() if dsa_manager.event_linked_list.tail else None

    return DsaLinkedListResponse(
        size=len(dsa_manager.event_linked_list),
        head=head_dict,
        tail=tail_dict,
        nodes=nodes
    )


@router.get("/dsa/fifo-queue")
def get_fifo_queue_state():
    return dsa_manager.reception_fifo.get_state()


@router.post("/dsa/sort")
def run_merge_sort_demo(
    sort_key: str = Query("age", description="Field to sort by: age, arrival_seq, priority"),
    reverse: bool = Query(False),
    db: Session = Depends(get_db)
):
    patients = db.query(Patient).all()
    data_to_sort = [
        {
            "patient_id": p.id,
            "patient_name": p.full_name,
            "age": p.age,
            "triage_level": p.triage_level,
            "arrival_seq": p.arrival_seq,
            "status": p.status
        }
        for p in patients
    ]

    result = merge_sort(data_to_sort, key=sort_key, reverse=reverse, trace_steps=True)
    return result
