import {
  Patient,
  PatientQueueItem,
  Doctor,
  Bed,
  AuditEvent,
  DashboardSummary,
  DsaHeapState,
  DsaHashTableState,
  DsaLinkedListState,
  DsaFifoQueueState
} from '../types';

const API_BASE = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorDetail = 'Network response was not ok';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errorDetail;
    } catch {
      errorDetail = response.statusText;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Health
  getHealth: () => request<{ status: string; database: string }>('/health'),

  // Dashboard
  getDashboardSummary: () => request<DashboardSummary>('/dashboard/summary'),

  // Queue
  getQueue: (triageFilter?: string, search?: string) => {
    const params = new URLSearchParams();
    if (triageFilter && triageFilter !== 'All') params.append('triage_filter', triageFilter);
    if (search) params.append('search', search);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request<PatientQueueItem[]>(`/queue${qs}`);
  },
  getNextPatient: () => request<{ has_patient: boolean; patient: any }>('/queue/next'),
  syncQueue: () => request<{ status: string; synced_count: number }>('/queue/sync', { method: 'POST' }),

  // Patients
  registerPatient: (data: {
    full_name: string;
    age: number;
    gender: string;
    contact_number?: string;
    complaint: string;
    triage_level: string;
    triage_notes?: string;
  }) => request<Patient>('/patients', { method: 'POST', body: JSON.stringify(data) }),

  getPatients: (query?: string, triageLevel?: string, status?: string) => {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (triageLevel && triageLevel !== 'All') params.append('triage_level', triageLevel);
    if (status && status !== 'All') params.append('status', status);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request<Patient[]>(`/patients${qs}`);
  },

  getPatient: (id: string) => request<Patient>(`/patients/${id}`),

  updateTriage: (id: string, triageLevel: string, reason: string, staff?: string) =>
    request<Patient>(`/patients/${id}/triage`, {
      method: 'POST',
      body: JSON.stringify({ triage_level: triageLevel, reason, responsible_staff: staff })
    }),

  // Treatments
  startTreatment: (id: string, doctorId?: string, bedId?: string, initialAssessment?: string, staff?: string) =>
    request<Patient>(`/patients/${id}/start-treatment`, {
      method: 'POST',
      body: JSON.stringify({
        doctor_id: doctorId || null,
        bed_id: bedId || null,
        initial_assessment: initialAssessment || null,
        responsible_staff: staff
      })
    }),

  completeTreatment: (id: string, treatmentNotes?: string, interventions?: string, staff?: string) =>
    request<Patient>(`/patients/${id}/complete-treatment`, {
      method: 'POST',
      body: JSON.stringify({
        treatment_notes: treatmentNotes || null,
        interventions: interventions || null,
        responsible_staff: staff
      })
    }),

  dischargePatient: (id: string, dischargeNotes?: string, staff?: string) =>
    request<Patient>(`/patients/${id}/discharge`, {
      method: 'POST',
      body: JSON.stringify({ discharge_notes: dischargeNotes || null, responsible_staff: staff })
    }),

  cancelPatient: (id: string, reason: string, staff?: string) =>
    request<Patient>(`/patients/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason, responsible_staff: staff })
    }),

  // Resources
  getDoctors: (availableOnly = false) =>
    request<Doctor[]>(`/doctors${availableOnly ? '?available_only=true' : ''}`),

  createDoctor: (data: { name: string; department: string; is_available?: boolean }) =>
    request<Doctor>('/doctors', { method: 'POST', body: JSON.stringify(data) }),

  getBeds: (status?: string) =>
    request<Bed[]>(`/beds${status && status !== 'All' ? `?status=${encodeURIComponent(status)}` : ''}`),

  createBed: (data: { label: string; section: string; status?: string }) =>
    request<Bed>('/beds', { method: 'POST', body: JSON.stringify(data) }),

  updateBedStatus: (bedId: string, newStatus: string) =>
    request<Bed>(`/beds/${bedId}/status?new_status=${encodeURIComponent(newStatus)}`, { method: 'PUT' }),

  // History & Audit
  getHistory: (eventType?: string, patientId?: string) => {
    const params = new URLSearchParams();
    if (eventType && eventType !== 'All') params.append('event_type', eventType);
    if (patientId) params.append('patient_id', patientId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request<AuditEvent[]>(`/history${qs}`);
  },

  getPatientHistory: (patientId: string) =>
    request<AuditEvent[]>(`/patients/${patientId}/history`),

  // Reports
  getReportsSummary: () => request<DashboardSummary>('/reports/summary'),
  getExportCsvUrl: () => `${API_BASE}/reports/export`,

  // DSA State Visualizers
  getDsaHeap: () => request<DsaHeapState>('/dsa/heap'),
  getDsaHashTable: () => request<DsaHashTableState>('/dsa/hash-table'),
  getDsaLinkedList: () => request<DsaLinkedListState>('/dsa/linked-list'),
  getDsaFifoQueue: () => request<DsaFifoQueueState>('/dsa/fifo-queue'),
  runMergeSort: (sortKey: string = 'age', reverse: boolean = false) =>
    request<any>(`/dsa/sort?sort_key=${sortKey}&reverse=${reverse}`, { method: 'POST' }),

  // Settings
  getSettings: () => request<Record<string, string>>('/settings'),
  updateSettings: (facilityName: string, staffName: string) =>
    request<any>('/settings', {
      method: 'POST',
      body: JSON.stringify({ facility_name: facilityName, staff_name: staffName })
    }),
  seedDemoData: (forceReset = false) =>
    request<any>(`/seed?force_reset=${forceReset}`, { method: 'POST' })
};
