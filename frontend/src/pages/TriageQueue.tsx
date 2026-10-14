import React, { useState, useEffect } from 'react';
import {
  ListOrdered,
  RefreshCw,
  Search,
  Filter,
  Play,
  ArrowUpDown,
  AlertOctagon,
  Trash2,
  Clock,
  CheckCircle,
  Eye,
  ShieldAlert,
  Stethoscope,
  X,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../services/api';
import { PatientQueueItem, Doctor, Bed, TriageLevel } from '../types';
import { TriageBadge, PatientStatusBadge } from '../components/StatusBadge';
import { NavTab } from '../components/Navigation';

interface TriageQueueProps {
  onNavigate: (tab: NavTab) => void;
  onSelectPatientId: (id: string) => void;
}

export const TriageQueue: React.FC<TriageQueueProps> = ({
  onNavigate,
  onSelectPatientId,
}) => {
  const [queue, setQueue] = useState<PatientQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [triageFilter, setTriageFilter] = useState('All');

  // Next Patient from Min-Heap
  const [nextPatient, setNextPatient] = useState<any | null>(null);

  // Modals
  const [treatmentModalItem, setTreatmentModalItem] = useState<PatientQueueItem | null>(null);
  const [overrideModalItem, setOverrideModalItem] = useState<PatientQueueItem | null>(null);
  const [cancelModalItem, setCancelModalItem] = useState<PatientQueueItem | null>(null);

  // Available resources for treatment modal
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedBedId, setSelectedBedId] = useState('');
  const [initialAssessment, setInitialAssessment] = useState('');

  // Override form fields
  const [newTriageLevel, setNewTriageLevel] = useState<TriageLevel>('Critical');
  const [overrideReason, setOverrideReason] = useState('');

  // Cancel form fields
  const [cancelReason, setCancelReason] = useState('');

  const [actionLoading, setActionLoading] = useState(false);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  const fetchQueueData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await api.getQueue(triageFilter, searchTerm);
      setQueue(items);

      const next = await api.getNextPatient();
      setNextPatient(next.has_patient ? next.patient : null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch triage queue');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueueData();
    const interval = setInterval(fetchQueueData, 10000);
    return () => clearInterval(interval);
  }, [triageFilter, searchTerm]);

  // Load resources when opening Treatment Modal
  const openTreatmentModal = async (item: PatientQueueItem) => {
    setTreatmentModalItem(item);
    try {
      const [availableDocs, availableBeds] = await Promise.all([
        api.getDoctors(true),
        api.getBeds('Available'),
      ]);
      setDoctors(availableDocs);
      setBeds(availableBeds);
      setSelectedDoctorId(availableDocs.length > 0 ? availableDocs[0].id : '');
      setSelectedBedId(availableBeds.length > 0 ? availableBeds[0].id : '');
      setInitialAssessment('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!treatmentModalItem) return;

    setActionLoading(true);
    try {
      await api.startTreatment(
        treatmentModalItem.patient_id,
        selectedDoctorId || undefined,
        selectedBedId || undefined,
        initialAssessment || undefined
      );

      setTreatmentModalItem(null);
      setBannerNotice(`Treatment started for ${treatmentModalItem.patient_name}. Patient moved to Treatment Room.`);
      fetchQueueData();
    } catch (err: any) {
      alert(`Error starting treatment: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOverrideTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideModalItem || !overrideReason.trim()) return;

    setActionLoading(true);
    try {
      await api.updateTriage(
        overrideModalItem.patient_id,
        newTriageLevel,
        overrideReason.trim()
      );

      setOverrideModalItem(null);
      setOverrideReason('');
      setBannerNotice(`Triage urgency updated to '${newTriageLevel}' for ${overrideModalItem.patient_name}. Min-Heap queue reordered.`);
      fetchQueueData();
    } catch (err: any) {
      alert(`Error overriding triage: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelModalItem || !cancelReason.trim()) return;

    setActionLoading(true);
    try {
      await api.cancelPatient(cancelModalItem.patient_id, cancelReason.trim());
      setCancelModalItem(null);
      setCancelReason('');
      setBannerNotice(`Patient ${cancelModalItem.patient_name} removed from active waiting queue.`);
      fetchQueueData();
    } catch (err: any) {
      alert(`Error removing patient: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSyncHeap = async () => {
    setIsLoading(true);
    try {
      const res = await api.syncQueue();
      setBannerNotice(`Priority queue min-heap resynced with SQLite (${res.synced_count} waiting patients).`);
      fetchQueueData();
    } catch (err: any) {
      alert(`Sync failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatWaitTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      return `${hours}h ${mins % 60}m`;
    }
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Educational Clinical Safety Notice Banner */}
      <div className="bg-[#FAF9F5] border border-amber-300 rounded p-4 flex items-start gap-3 text-xs text-amber-900">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-amber-950 uppercase tracking-wide">
            Clinical Governance & Educational Simulation Notice
          </span>
          <p className="text-[11px] leading-relaxed text-amber-900">
            This queue is scheduled strictly using an educational <strong>Binary Min-Heap Priority Queue</strong> (Critical = 1, High = 2, Moderate = 3, Low = 4) with monotonically increasing arrival sequence numbers to preserve FIFO on ties. Urgency levels are staff-confirmed classifications. All staff overrides and queue recalculations are immutably audited.
          </p>
        </div>
      </div>

      {bannerNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{bannerNotice}</span>
          </div>
          <button onClick={() => setBannerNotice(null)} className="text-emerald-900 font-bold ml-2">
            ×
          </button>
        </div>
      )}

      {/* Top Banner: Next Patient in Min-Heap (Root Inspection) */}
      {nextPatient && (
        <div className="bg-white rounded border border-ermDivider p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-ermBrand">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded bg-ermBrandLight text-ermBrand flex items-center justify-center font-bold font-mono text-sm shrink-0">
              #1
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Min-Heap Root Patient (Highest Scheduled Priority)
                </span>
                <TriageBadge level={nextPatient.triage_level} />
              </div>
              <div className="text-sm font-semibold text-ermText mt-0.5">
                {nextPatient.patient_name} <span className="text-xs text-gray-400 font-normal font-mono">({nextPatient.patient_id})</span>
              </div>
              <div className="text-xs text-gray-600 line-clamp-1 mt-0.5">
                {nextPatient.complaint}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                const item = queue.find((q) => q.patient_id === nextPatient.patient_id);
                if (item) openTreatmentModal(item);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-ermBrand hover:bg-ermBrandHover rounded transition-colors shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Admit to Treatment</span>
            </button>
          </div>
        </div>
      )}

      {/* Queue Toolbar: Search, Triage Filter, Sync Heap */}
      <div className="bg-white p-4 rounded border border-ermDivider flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter queue by patient name, ID, or complaint..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-ermDivider rounded bg-white"
            />
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Urgency:</span>
          </div>

          {(['All', 'Critical', 'High', 'Moderate', 'Low'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setTriageFilter(lvl)}
              className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                triageFilter === lvl
                  ? 'bg-ermBrand text-white border-ermBrand font-medium'
                  : 'bg-white text-gray-600 border-ermDivider hover:bg-gray-50'
              }`}
            >
              {lvl}
            </button>
          ))}

          <button
            onClick={handleSyncHeap}
            title="Rebuild Heap from SQLite"
            className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-gray-700 bg-[#F7F6F2] hover:bg-gray-200 border border-ermDivider rounded transition-colors ml-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Heap</span>
          </button>
        </div>
      </div>

      {/* Primary Triage Queue Table */}
      <div className="bg-white rounded border border-ermDivider overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF9F6] border-b border-ermDivider text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                <th className="py-3 px-3 w-16 text-center">Pos</th>
                <th className="py-3 px-3">Patient ID</th>
                <th className="py-3 px-4">Patient Name & Demographics</th>
                <th className="py-3 px-3">Triage Urgency</th>
                <th className="py-3 px-4">Presenting Complaint</th>
                <th className="py-3 px-3">Arrival Time</th>
                <th className="py-3 px-3">Waiting Elapsed</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && queue.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-gray-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-ermBrand mb-2" />
                    Calculating priority min-heap queue...
                  </td>
                </tr>
              ) : queue.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-gray-400">
                    No waiting patients matching active filters.
                  </td>
                </tr>
              ) : (
                queue.map((item) => {
                  const isRoot = item.queue_position === 1;
                  const isCrit = item.triage_level === 'Critical';

                  return (
                    <tr
                      key={item.patient_id}
                      className={`table-row-hover transition-colors ${
                        isCrit ? 'bg-[#FCF9F9]' : ''
                      }`}
                    >
                      {/* Queue Position */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded font-mono text-xs font-bold ${
                            isRoot
                              ? 'bg-ermBrand text-white'
                              : isCrit
                              ? 'bg-[#FBF0F0] text-[#A83232] border border-[#F2D6D6]'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          #{item.queue_position}
                        </span>
                      </td>

                      {/* Patient ID */}
                      <td className="py-3 px-3 font-mono font-semibold text-ermBrand whitespace-nowrap">
                        {item.patient_id}
                      </td>

                      {/* Patient Name */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div
                          onClick={() => onSelectPatientId(item.patient_id)}
                          className="font-medium text-ermText hover:underline cursor-pointer"
                        >
                          {item.patient_name}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {item.age} years old
                        </div>
                      </td>

                      {/* Triage Urgency */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <TriageBadge level={item.triage_level} />
                      </td>

                      {/* Presenting Complaint */}
                      <td className="py-3 px-4 text-gray-600 max-w-xs truncate" title={item.complaint}>
                        {item.complaint}
                      </td>

                      {/* Arrival Time */}
                      <td className="py-3 px-3 text-gray-500 whitespace-nowrap font-mono text-[11px]">
                        {new Date(item.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      {/* Elapsed Waiting Duration */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="flex items-center gap-1 font-mono text-gray-700 text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {formatWaitTime(item.waiting_seconds)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Admit / Start Treatment */}
                          <button
                            onClick={() => openTreatmentModal(item)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-white bg-ermBrand hover:bg-ermBrandHover rounded transition-colors flex items-center gap-1 shadow-xs"
                            title="Assign doctor/bed and begin treatment"
                          >
                            <Play className="w-3 h-3 fill-white" />
                            <span>Admit</span>
                          </button>

                          {/* Staff Override / Reprioritize */}
                          <button
                            onClick={() => {
                              setOverrideModalItem(item);
                              setNewTriageLevel(item.triage_level);
                              setOverrideReason('');
                            }}
                            className="p-1 text-gray-500 hover:text-ermBrand border border-ermDivider rounded hover:bg-gray-100 transition-colors"
                            title="Staff override triage level"
                          >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Patient Details */}
                          <button
                            onClick={() => onSelectPatientId(item.patient_id)}
                            className="p-1 text-gray-500 hover:text-gray-800 border border-ermDivider rounded hover:bg-gray-100 transition-colors"
                            title="View patient history and profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Cancel / Remove */}
                          <button
                            onClick={() => {
                              setCancelModalItem(item);
                              setCancelReason('');
                            }}
                            className="p-1 text-gray-400 hover:text-red-700 border border-ermDivider rounded hover:bg-red-50 transition-colors"
                            title="Cancel patient with required audit reason"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3 bg-[#FAF9F6] border-t border-ermDivider text-[11px] text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>
            Displaying {queue.length} waiting patient(s) organized by Binary Min-Heap Priority Queue.
          </span>
          <span className="font-mono text-[10px] text-gray-400">
            Complexity: Insertion O(log n) | Extract O(log n) | Peek O(1)
          </span>
        </div>
      </div>

      {/* MODAL 1: Admit to Treatment (Doctor & Bed Assignment) */}
      {treatmentModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-ermDivider shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in duration-200">
            <div className="px-5 py-4 border-b border-ermDivider flex items-center justify-between bg-white">
              <div>
                <h3 className="text-sm font-semibold text-ermText">
                  Admit Patient to Treatment Room
                </h3>
                <p className="text-xs text-ermMuted">
                  Assign available clinical resources to begin treatment episode
                </p>
              </div>
              <button
                onClick={() => setTreatmentModalItem(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStartTreatment} className="p-5 space-y-4">
              {/* Patient Banner */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-ermText">{treatmentModalItem.patient_name}</span>
                  <span className="text-gray-500 ml-2 font-mono">({treatmentModalItem.patient_id})</span>
                  <p className="text-[11px] text-gray-600 line-clamp-1 mt-0.5">
                    {treatmentModalItem.complaint}
                  </p>
                </div>
                <TriageBadge level={treatmentModalItem.triage_level} />
              </div>

              {/* Doctor Assignment */}
              <div>
                <label className="block text-xs font-medium text-ermText mb-1">
                  Assign Attending Doctor
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-ermDivider rounded bg-white"
                >
                  <option value="">-- No doctor assigned immediately --</option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} ({doc.department}) - Available
                    </option>
                  ))}
                </select>
                {doctors.length === 0 && (
                  <span className="text-[10px] text-amber-700 block mt-1">
                    Notice: All doctors currently occupied. You may still admit or allocate once released.
                  </span>
                )}
              </div>

              {/* Bed Assignment */}
              <div>
                <label className="block text-xs font-medium text-ermText mb-1">
                  Assign Emergency Bed / Bay
                </label>
                <select
                  value={selectedBedId}
                  onChange={(e) => setSelectedBedId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-ermDivider rounded bg-white"
                >
                  <option value="">-- No bed assigned immediately --</option>
                  {beds.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label} ({b.section}) - Available
                    </option>
                  ))}
                </select>
                {beds.length === 0 && (
                  <span className="text-[10px] text-amber-700 block mt-1">
                    Notice: No beds currently available. Patient will be admitted to holding area.
                  </span>
                )}
              </div>

              {/* Initial Assessment */}
              <div>
                <label className="block text-xs font-medium text-ermText mb-1">
                  Initial Assessment & Orders
                </label>
                <textarea
                  rows={2}
                  value={initialAssessment}
                  onChange={(e) => setInitialAssessment(e.target.value)}
                  placeholder="Immediate clinical orders, IV line, initial medication..."
                  className="w-full px-3 py-2 text-xs border border-ermDivider rounded bg-white"
                />
              </div>

              <div className="pt-3 border-t border-ermDivider flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTreatmentModalItem(null)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 border border-ermDivider rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-ermBrand hover:bg-ermBrandHover rounded transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Starting Treatment...' : 'Confirm & Start Treatment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Staff Override / Triage Reprioritization */}
      {overrideModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-ermDivider shadow-xl w-full max-w-md overflow-hidden animate-in fade-in duration-200">
            <div className="px-5 py-4 border-b border-ermDivider flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-ermText">
                  Staff Override: Triage Reprioritization
                </h3>
                <p className="text-xs text-ermMuted">
                  Reclassify urgency level with mandatory audit log reason
                </p>
              </div>
              <button
                onClick={() => setOverrideModalItem(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleOverrideTriage} className="p-5 space-y-4">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-ermText">{overrideModalItem.patient_name}</span>
                  <span className="font-mono text-gray-500">{overrideModalItem.patient_id}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                  <span>Current Urgency:</span>
                  <TriageBadge level={overrideModalItem.triage_level} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-ermText mb-1">
                  New Triage Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={newTriageLevel}
                  onChange={(e) => setNewTriageLevel(e.target.value as TriageLevel)}
                  className="w-full px-3 py-2 text-xs border border-ermDivider rounded bg-white"
                >
                  <option value="Critical">Critical (Priority 1)</option>
                  <option value="High">High (Priority 2)</option>
                  <option value="Moderate">Moderate (Priority 3)</option>
                  <option value="Low">Low (Priority 4)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-ermText mb-1">
                  Clinical Override Justification <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Detail physiological changes, altered vitals, or clinical reasoning for reprioritization..."
                  className="w-full px-3 py-2 text-xs border border-ermDivider rounded bg-white"
                />
              </div>

              <div className="pt-3 border-t border-ermDivider flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOverrideModalItem(null)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 border border-ermDivider rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !overrideReason.trim()}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-ermBrand hover:bg-ermBrandHover rounded transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Updating...' : 'Confirm Override & Re-heapify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Cancel Patient from Queue */}
      {cancelModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-ermDivider shadow-xl w-full max-w-md overflow-hidden animate-in fade-in duration-200">
            <div className="px-5 py-4 border-b border-ermDivider flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="text-sm font-semibold text-red-900">
                  Cancel Patient From Waiting Queue
                </h3>
              </div>
              <button
                onClick={() => setCancelModalItem(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCancelPatient} className="p-5 space-y-4">
              <p className="text-xs text-gray-600">
                Are you sure you want to remove <strong>{cancelModalItem.patient_name}</strong> from the emergency queue? This action will remove the patient from the Min-Heap and record an audited cancellation event.
              </p>

              <div>
                <label className="block text-xs font-medium text-ermText mb-1">
                  Cancellation Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Left without being seen (LWBS), transferred to trauma center..."
                  className="w-full px-3 py-2 text-xs border border-ermDivider rounded bg-white"
                />
              </div>

              <div className="pt-3 border-t border-ermDivider flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCancelModalItem(null)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 border border-ermDivider rounded"
                >
                  Keep in Queue
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !cancelReason.trim()}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
