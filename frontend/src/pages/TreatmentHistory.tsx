import React, { useState, useEffect } from 'react';
import {
  History as HistoryIcon,
  Filter,
  RefreshCw,
  Search,
  Calendar,
  User,
  ShieldCheck,
  Binary,
} from 'lucide-react';
import { api } from '../services/api';
import { AuditEvent } from '../types';

interface TreatmentHistoryProps {
  onSelectPatientId: (id: string) => void;
}

export const TreatmentHistory: React.FC<TreatmentHistoryProps> = ({ onSelectPatientId }) => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [eventTypeFilter, setEventTypeFilter] = useState('All');
  const [patientIdFilter, setPatientIdFilter] = useState('');

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const data = await api.getHistory(
        eventTypeFilter !== 'All' ? eventTypeFilter : undefined,
        patientIdFilter.trim() || undefined
      );
      setEvents(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [eventTypeFilter, patientIdFilter]);

  const getEventBadge = (type: string) => {
    let color = 'bg-gray-100 text-gray-800 border-gray-200';
    if (type.includes('REGISTERED')) color = 'bg-blue-50 text-blue-800 border-blue-200';
    if (type.includes('OVERRIDE')) color = 'bg-amber-50 text-amber-800 border-amber-200';
    if (type.includes('TREATMENT_STARTED')) color = 'bg-purple-50 text-purple-800 border-purple-200';
    if (type.includes('TREATMENT_COMPLETED')) color = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (type.includes('DISCHARGED')) color = 'bg-slate-100 text-slate-800 border-slate-200';
    if (type.includes('CANCELLED')) color = 'bg-red-50 text-red-800 border-red-200';

    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide border ${color}`}>
        {type.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Educational Banner */}
      <div className="bg-[#FAF9F5] border border-ermDivider rounded p-4 flex items-start gap-3 text-xs text-ermMuted">
        <Binary className="w-5 h-5 text-ermBrand shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-ermText uppercase tracking-wide">
            Persistent Audit Log & DSA Linked List Stream
          </span>
          <p className="text-[11px] leading-relaxed mt-0.5">
            Every clinical event, triage override, resource assignment, and queue re-heapification is immutably stored in SQLite and mirrored into an in-memory <strong>Singly Linked List</strong> with head and tail pointers (O(1) append). Ordinary users cannot silently alter historical records.
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded border border-ermDivider flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Patient ID Search */}
        <div className="flex-1 max-w-xs relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={patientIdFilter}
            onChange={(e) => setPatientIdFilter(e.target.value)}
            placeholder="Filter by Patient ID (e.g. PT-2026-0001)..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-ermDivider rounded bg-white font-mono"
          />
        </div>

        {/* Event Type Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Event Type:</span>
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-ermDivider rounded bg-white text-gray-700"
          >
            <option value="All">All Audit Events</option>
            <option value="PATIENT_REGISTERED">Patient Registered</option>
            <option value="STAFF_OVERRIDE_TRIAGE">Staff Override Triage</option>
            <option value="TREATMENT_STARTED">Treatment Started</option>
            <option value="TREATMENT_COMPLETED">Treatment Completed</option>
            <option value="PATIENT_DISCHARGED">Patient Discharged</option>
            <option value="PATIENT_CANCELLED">Patient Cancelled</option>
            <option value="DOCTOR_ADDED">Doctor Added</option>
            <option value="BED_ADDED">Bed Added</option>
          </select>

          <button
            onClick={fetchHistory}
            className="p-1.5 text-gray-500 hover:text-gray-700 border border-ermDivider rounded bg-white hover:bg-gray-50 transition-colors"
            title="Refresh history"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Events Timeline List */}
      <div className="bg-white rounded border border-ermDivider overflow-hidden shadow-xs">
        <div className="p-4 border-b border-ermDivider flex items-center justify-between bg-white">
          <h3 className="text-xs font-semibold text-ermText uppercase tracking-wider">
            Chronological Audit Events ({events.length})
          </h3>
          <span className="text-[11px] text-gray-400 font-mono">
            Most recent events first (Monotonic order)
          </span>
        </div>

        {isLoading && events.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-400">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-ermBrand mb-2" />
            Loading treatment history records...
          </div>
        ) : events.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-400">
            No audit records match the current filter.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {events.map((evt) => (
              <div key={evt.id} className="p-4 hover:bg-[#FAF9F6] transition-colors space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {getEventBadge(evt.event_type)}
                    {evt.patient_id && (
                      <button
                        onClick={() => onSelectPatientId(evt.patient_id!)}
                        className="font-mono text-xs font-semibold text-ermBrand hover:underline"
                      >
                        {evt.patient_id}
                      </button>
                    )}
                    <span className="font-mono text-[10px] text-gray-400">{evt.event_id}</span>
                  </div>

                  <span className="text-[11px] text-gray-500 font-mono">
                    {new Date(evt.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>

                <p className="text-xs text-ermText leading-relaxed">{evt.details}</p>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400 pt-1">
                  <span>
                    Staff: <strong className="text-gray-600 font-medium">{evt.responsible_staff}</strong>
                  </span>

                  {evt.reason && (
                    <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Reason: {evt.reason}
                    </span>
                  )}

                  {evt.previous_value && evt.new_value && (
                    <span className="font-mono text-[10px] text-gray-500">
                      [{evt.previous_value} → {evt.new_value}]
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
