export type TriageLevel = 'Critical' | 'High' | 'Moderate' | 'Low';
export type PatientStatus = 'Waiting' | 'Under Treatment' | 'Treatment Completed' | 'Discharged' | 'Cancelled';
export type BedStatus = 'Available' | 'Occupied' | 'Cleaning / Maintenance';

export interface Patient {
  id: string;
  full_name: string;
  age: number;
  gender: string;
  contact_number?: string;
  complaint: string;
  arrival_time: string;
  arrival_seq: number;
  triage_level: TriageLevel;
  triage_notes?: string;
  status: PatientStatus;
  doctor_id?: string;
  bed_id?: string;
  treatment_start_time?: string;
  treatment_end_time?: string;
  discharge_time?: string;
  treatment_notes?: string;
  discharge_notes?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface PatientQueueItem {
  queue_position: number;
  patient_id: string;
  patient_name: string;
  age: number;
  triage_level: TriageLevel;
  priority_numeric: number;
  complaint: string;
  arrival_time: string;
  arrival_seq: number;
  waiting_seconds: number;
  status: PatientStatus;
  assigned_doctor?: string;
  assigned_bed?: string;
}

export interface Doctor {
  id: string;
  name: string;
  department: string;
  is_available: boolean;
  current_patient_id?: string;
  created_at: string;
}

export interface Bed {
  id: string;
  label: string;
  section: string;
  status: BedStatus;
  current_patient_id?: string;
  created_at: string;
}

export interface Treatment {
  id: string;
  patient_id: string;
  doctor_id?: string;
  bed_id?: string;
  status: 'In Progress' | 'Completed';
  start_time: string;
  end_time?: string;
  initial_assessment?: string;
  interventions?: string;
  notes?: string;
  created_at: string;
}

export interface AuditEvent {
  id: number;
  event_id: string;
  event_type: string;
  patient_id?: string;
  responsible_staff: string;
  previous_value?: string;
  new_value?: string;
  reason?: string;
  details: string;
  timestamp: string;
}

export interface DashboardSummary {
  total_registered_today: number;
  patients_waiting: number;
  patients_under_treatment: number;
  critical_waiting: number;
  available_beds: number;
  total_beds: number;
  completed_today: number;
  discharged_today: number;
  avg_wait_time_minutes: number;
  avg_treatment_time_minutes: number;
  urgency_distribution: Record<string, number>;
  bed_status_breakdown: Record<string, number>;
  arrivals_timeline: Array<{ time: string; arrivals: number }>;
  recent_registrations: Array<{
    id: string;
    name: string;
    triage_level: TriageLevel;
    status: string;
    time: string;
    complaint: string;
  }>;
  priority_queue_preview: Array<{
    position: number;
    patient_id: string;
    name: string;
    triage_level: TriageLevel;
    priority: number;
    complaint: string;
    arrival_time: string;
  }>;
}

export interface DsaHeapState {
  structure_name: string;
  size: number;
  peek_root?: any;
  heap_array: any[];
  ordered_queue: any[];
  recent_operations: Array<{
    timestamp: string;
    operation: string;
    details: string;
    heap_size: number;
  }>;
  time_complexities: Record<string, string>;
}

export interface DsaHashTableState {
  structure_name: string;
  capacity: number;
  size: number;
  load_factor: number;
  collision_count: number;
  buckets: Array<{
    bucket_index: number;
    chain_length: number;
    nodes: Array<{ key: string; summary: string }>;
  }>;
  recent_operations: any[];
  time_complexities: Record<string, string>;
}

export interface DsaLinkedListState {
  structure_name: string;
  size: number;
  head?: any;
  tail?: any;
  nodes: any[];
  time_complexities: Record<string, string>;
}

export interface DsaFifoQueueState {
  size: number;
  front?: any;
  items: any[];
  recent_actions: any[];
}
