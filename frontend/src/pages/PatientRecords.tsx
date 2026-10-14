import React, { useState, useEffect } from 'react';
import {
  FolderOpen,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Clock,
  Calendar,
  X,
  Stethoscope,
  Bed,
  FileText,
  User,
  History as HistoryIcon,
  Binary,
} from 'lucide-react';
import { api } from '../services/api';
import { Patient, AuditEvent } from '../types';
import { TriageBadge, PatientStatusBadge } from '../components/StatusBadge';

interface PatientRecordsProps {
  initialPatientId?: string | null;
  onClearInitialPatientId?: () => void;
}

export const PatientRecords: React.FC<PatientRecordsProps> = ({
  initialPatientId,
  onClearInitialPatientId,
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [triageFilter, setTriageFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Selected patient for detail modal/drawer
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientHistory, setPatientHistory] = useState<AuditEvent[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const data = await api.getPatients(searchTerm, triageFilter, statusFilter);
      setPatients(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [searchTerm, triageFilter, statusFilter]);

  // Handle initial patient opened from elsewhere (e.g. Overview or QuickSearch)
  useEffect(() => {
    if (initialPatientId) {
      openPatientDetails(initialPatientId);
      if (onClearInitialPatientId) onClearInitialPatientId();
    }
  }, [initialPatientId]);

  const openPatientDetails = async (patientId: string) => {
    setHistoryLoading(true);
    try {
      const pt = await api.getPatient(patientId);
      setSelectedPatient(pt);
      const events = await api.getPatientHistory(patientId);
      setPatientHistory(events);
    } catch (err: any) {
      alert(`Could not load patient: ${err.message}`);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Search Controls */}
      <div className="bg-white p-4 rounded border border-ermDivider flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search census by Patient ID, Name, or symptoms..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-ermDivider rounded bg-white"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Triage filter */}
          <div className="flex items-center gap-1 text-gray-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Triage:</span>
          </div>
          <select
            value={triageFilter}
            onChange={(e) => setTriageFilter(e.target.value)}
            className="px-2 py-1 text-xs border border-ermDivider rounded bg-white text-gray-700"
          >
            <option value="All">All Urgencies</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Moderate">Moderate</option>
            <option value="Low">Low</option>
          </select>

          {/* Status filter */}
          <div className="flex items-center gap-1 text-gray-500 ml-2">
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2 py-1 text-xs border border-ermDivider rounded bg-white text-gray-700"
          >
            <option value="All">All Statuses</option>
            <option value="Waiting">Waiting</option>
            <option value="Under Treatment">Under Treatment</option>
            <option value="Treatment Completed">Treatment Completed</option>
            <option value="Discharged">Discharged</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <button
            onClick={fetchPatients}
            className="p-1.5 text-gray-500 hover:text-gray-700 border border-ermDivider rounded bg-white hover:bg-gray-50 ml-1 transition-colors"
            title="Refresh records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded border border-ermDivider overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF9F6] border-b border-ermDivider text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                <th className="py-3 px-4">Patient ID</th>
                <th className="py-3 px-4">Patient Name & Age</th>
                <th className="py-3 px-3">Triage</th>
                <th className="py-3 px-3">Lifecycle Status</th>
                <th className="py-3 px-4">Presenting Complaint</th>
                <th className="py-3 px-3">Arrival Date/Time</th>
                <th className="py-3 px-3">Resource Allocation</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && patients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-gray-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-ermBrand mb-2" />
                    Querying patient census records...
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-gray-400">
                    No patient records found matching active query filters.
                  </td>
                </tr>
              ) : (
                patients.map((p) => (
                  <tr key={p.id} className="table-row-hover">
                    <td className="py-3 px-4 font-mono font-semibold text-ermBrand whitespace-nowrap">
                      {p.id}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div
                        onClick={() => openPatientDetails(p.id)}
                        className="font-medium text-ermText hover:underline cursor-pointer"
                      >
                        {p.full_name}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {p.age} years old ({p.gender})
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <TriageBadge level={p.triage_level} />
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <PatientStatusBadge status={p.status} />
                    </td>
                    <td className="py-3 px-4 text-gray-600 max-w-xs truncate" title={p.complaint}>
                      {p.complaint}
                    </td>
                    <td className="py-3 px-3 text-gray-500 whitespace-nowrap font-mono text-[11px]">
                      {new Date(p.arrival_time).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-3 text-gray-600 whitespace-nowrap text-[11px]">
                      {p.doctor_id || p.bed_id ? (
                        <span>
                          {p.doctor_id ? `Doc: ${p.doctor_id}` : ''}
                          {p.doctor_id && p.bed_id ? ' · ' : ''}
                          {p.bed_id ? `Bed: ${p.bed_id}` : ''}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => openPatientDetails(p.id)}
                        className="px-2.5 py-1 text-[11px] font-medium text-ermText hover:text-ermBrand border border-ermDivider rounded hover:bg-gray-50 transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View File</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-[#FAF9F6] border-t border-ermDivider text-[11px] text-gray-500 flex justify-between items-center">
          <span>Total {patients.length} records returned from SQLite store</span>
          <span className="font-mono text-[10px] text-gray-400">
            Search Complexity: Average O(1) via Separate Chaining Hash Table
          </span>
        </div>
      </div>

      {/* FULL PATIENT DETAIL DRAWER / MODAL */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-ermDivider shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-ermDivider flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-ermBrandLight text-ermBrand flex items-center justify-center font-bold font-mono text-sm">
                  PT
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-ermBrand">
                      {selectedPatient.id}
                    </span>
                    <TriageBadge level={selectedPatient.triage_level} />
                    <PatientStatusBadge status={selectedPatient.status} />
                  </div>
                  <h3 className="text-sm font-semibold text-ermText mt-0.5">
                    {selectedPatient.full_name} ({selectedPatient.age}y, {selectedPatient.gender})
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedPatient(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {/* Demographics & Admission details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF9F6] p-3.5 rounded border border-ermDivider">
                <div>
                  <span className="text-[10px] text-gray-400 block uppercase font-semibold">Contact</span>
                  <span className="font-medium text-ermText">{selectedPatient.contact_number || 'None provided'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block uppercase font-semibold">Arrival Sequence</span>
                  <span className="font-medium text-ermText font-mono">#{selectedPatient.arrival_seq} (FIFO order)</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block uppercase font-semibold">Arrival Time</span>
                  <span className="font-medium text-ermText font-mono">
                    {new Date(selectedPatient.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block uppercase font-semibold">Assigned Bed</span>
                  <span className="font-medium text-ermText">{selectedPatient.bed_id || 'Unassigned'}</span>
                </div>
              </div>

              {/* Presenting Complaint & Clinical Notes */}
              <div>
                <h4 className="text-xs font-semibold text-ermText uppercase tracking-wider mb-2">
                  Clinical Intake Presentation
                </h4>
                <div className="p-3 bg-white rounded border border-ermDivider space-y-2">
                  <div>
                    <span className="text-gray-400 block text-[11px]">Chief Complaint:</span>
                    <p className="text-gray-800 font-medium">{selectedPatient.complaint}</p>
                  </div>
                  {selectedPatient.triage_notes && (
                    <div>
                      <span className="text-gray-400 block text-[11px]">Triage Observations:</span>
                      <p className="text-gray-700">{selectedPatient.triage_notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Treatment & Discharge Notes (if applicable) */}
              {(selectedPatient.treatment_notes || selectedPatient.discharge_notes || selectedPatient.cancellation_reason) && (
                <div>
                  <h4 className="text-xs font-semibold text-ermText uppercase tracking-wider mb-2">
                    Episode Summary & Outcomes
                  </h4>
                  <div className="p-3 bg-white rounded border border-ermDivider space-y-2">
                    {selectedPatient.treatment_notes && (
                      <div>
                        <span className="text-gray-400 block text-[11px]">Treatment Delivered:</span>
                        <p className="text-gray-800">{selectedPatient.treatment_notes}</p>
                      </div>
                    )}
                    {selectedPatient.discharge_notes && (
                      <div>
                        <span className="text-gray-400 block text-[11px]">Discharge Summary:</span>
                        <p className="text-gray-800">{selectedPatient.discharge_notes}</p>
                      </div>
                    )}
                    {selectedPatient.cancellation_reason && (
                      <div>
                        <span className="text-red-500 block text-[11px]">Cancellation Audit Reason:</span>
                        <p className="text-red-700">{selectedPatient.cancellation_reason}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Audit Event Timeline */}
              <div>
                <h4 className="text-xs font-semibold text-ermText uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Audit Timeline ({patientHistory.length} Recorded Events)</span>
                  <span className="text-[10px] text-gray-400 font-normal">Linked List History Chain</span>
                </h4>

                {historyLoading ? (
                  <div className="py-4 text-center text-xs text-gray-400">Loading audit trail...</div>
                ) : patientHistory.length === 0 ? (
                  <div className="p-4 bg-gray-50 border border-ermDivider rounded text-gray-400 text-center">
                    No historical events logged yet for this patient.
                  </div>
                ) : (
                  <div className="space-y-2 border-l-2 border-ermDivider pl-3 ml-1.5">
                    {patientHistory.map((evt) => (
                      <div key={evt.id} className="relative pb-2">
                        <div className="w-2 h-2 rounded-full bg-ermBrand absolute -left-[17px] top-1" />
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-ermText">{evt.event_type.replace(/_/g, ' ')}</span>
                          <span className="text-gray-400 font-mono">
                            {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 mt-0.5">{evt.details}</p>
                        <span className="text-[10px] text-gray-400">Staff: {evt.responsible_staff}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-[#FAF9F6] border-t border-ermDivider flex items-center justify-between shrink-0">
              <span className="text-[11px] text-gray-400">
                Authoritative SQLite record · Synced with in-memory DSA structures
              </span>
              <button
                onClick={() => setSelectedPatient(null)}
                className="px-4 py-1.5 text-xs font-semibold text-ermText bg-white hover:bg-gray-100 border border-ermDivider rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
