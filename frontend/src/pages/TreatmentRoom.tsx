import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Bed as BedIcon,
  Clock,
  CheckCircle,
  FileText,
  UserCheck,
  RefreshCw,
  LogOut,
  X,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { api } from '../services/api';
import { Patient, Doctor, Bed } from '../types';
import { TriageBadge, PatientStatusBadge } from '../components/StatusBadge';
import { NavTab } from '../components/Navigation';

interface TreatmentRoomProps {
  onNavigate: (tab: NavTab) => void;
  onSelectPatientId: (id: string) => void;
}

export const TreatmentRoom: React.FC<TreatmentRoomProps> = ({
  onNavigate,
  onSelectPatientId,
}) => {
  const [activePatients, setActivePatients] = useState<Patient[]>([]);
  const [completedPatients, setCompletedPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Complete Treatment Modal
  const [completeModalPatient, setCompleteModalPatient] = useState<Patient | null>(null);
  const [treatmentNotes, setTreatmentNotes] = useState('');
  const [interventions, setInterventions] = useState('');

  // Discharge Modal
  const [dischargeModalPatient, setDischargeModalPatient] = useState<Patient | null>(null);
  const [dischargeNotes, setDischargeNotes] = useState('');

  const [isActionSubmitting, setIsActionSubmitting] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  const fetchTreatmentData = async () => {
    setIsLoading(true);
    try {
      const [underTreat, completed, docs, bedsList] = await Promise.all([
        api.getPatients(undefined, undefined, 'Under Treatment'),
        api.getPatients(undefined, undefined, 'Treatment Completed'),
        api.getDoctors(),
        api.getBeds(),
      ]);
      setActivePatients(underTreat);
      setCompletedPatients(completed);
      setDoctors(docs);
      setBeds(bedsList);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTreatmentData();
    const interval = setInterval(fetchTreatmentData, 15000);
    return () => clearInterval(interval);
  }, []);

  const getDoctorName = (docId?: string) => {
    if (!docId) return 'Unassigned';
    const doc = doctors.find((d) => d.id === docId);
    return doc ? doc.name : docId;
  };

  const getBedLabel = (bedId?: string) => {
    if (!bedId) return 'Unassigned';
    const bed = beds.find((b) => b.id === bedId);
    return bed ? `${bed.label} (${bed.section})` : bedId;
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeModalPatient) return;
    setIsActionSubmitting(true);
    try {
      await api.completeTreatment(
        completeModalPatient.id,
        treatmentNotes.trim() || undefined,
        interventions.trim() || undefined
      );
      setCompleteModalPatient(null);
      setTreatmentNotes('');
      setInterventions('');
      setBannerMessage(`Treatment completed for ${completeModalPatient.full_name}. Doctor released.`);
      fetchTreatmentData();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsActionSubmitting(false);
    }
  };

  const handleDischargeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dischargeModalPatient) return;
    setIsActionSubmitting(true);
    try {
      await api.dischargePatient(dischargeModalPatient.id, dischargeNotes.trim() || undefined);
      setDischargeModalPatient(null);
      setDischargeNotes('');
      setBannerMessage(`Patient ${dischargeModalPatient.full_name} successfully discharged. Bed released.`);
      fetchTreatmentData();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsActionSubmitting(false);
    }
  };

  const calculateDuration = (startTime?: string) => {
    if (!startTime) return 'N/A';
    const start = new Date(startTime).getTime();
    const now = new Date().getTime();
    const diffMins = Math.floor(Math.max(0, now - start) / (1000 * 60));
    if (diffMins >= 60) {
      return `${Math.floor(diffMins / 60)}h ${diffMins % 60}m`;
    }
    return `${diffMins} min`;
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Banner Notice */}
      {bannerMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{bannerMessage}</span>
          </div>
          <button onClick={() => setBannerMessage(null)} className="text-emerald-900 font-bold ml-2">
            ×
          </button>
        </div>
      )}

      {/* Top Header / Actions */}
      <div className="bg-white p-4 rounded border border-ermDivider flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-ermText">
            Emergency Treatment Floor
          </h2>
          <p className="text-xs text-ermMuted">
            Active care episodes, clinical monitoring, attending doctor assignments, and discharge transitions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('triage-queue')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-ermBrand hover:bg-ermBrandHover rounded transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Admit from Triage Queue</span>
          </button>
          <button
            onClick={fetchTreatmentData}
            className="p-1.5 text-gray-500 hover:text-gray-700 border border-ermDivider rounded bg-white hover:bg-gray-50 transition-colors"
            title="Refresh active treatments"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Section 1: Actively Under Treatment */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold text-ermText uppercase tracking-wider">
              Currently Under Treatment ({activePatients.length})
            </h3>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          </div>
          <span className="text-[11px] text-gray-400">
            Doctors & beds actively locked to patient care
          </span>
        </div>

        {activePatients.length === 0 ? (
          <div className="bg-white rounded border border-ermDivider p-8 text-center text-xs text-gray-400">
            No patients currently under active treatment. Admit waiting patients from the Triage Queue.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activePatients.map((patient) => (
              <div
                key={patient.id}
                className="bg-white rounded border border-ermDivider p-4 space-y-3 hover:border-gray-400 transition-colors shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-ermDivider">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-ermBrand">
                          {patient.id}
                        </span>
                        <TriageBadge level={patient.triage_level} />
                      </div>
                      <h4
                        onClick={() => onSelectPatientId(patient.id)}
                        className="text-xs font-semibold text-ermText hover:underline cursor-pointer mt-1"
                      >
                        {patient.full_name} ({patient.age}y, {patient.gender})
                      </h4>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {calculateDuration(patient.treatment_start_time)}
                      </span>
                    </div>
                  </div>

                  {/* Complaint */}
                  <p className="text-[11px] text-gray-600 line-clamp-2 my-2.5">
                    <strong>Complaint:</strong> {patient.complaint}
                  </p>

                  {/* Resources Allocated */}
                  <div className="space-y-1.5 text-[11px] bg-[#FAF9F6] p-2.5 rounded border border-ermDivider">
                    <div className="flex items-center justify-between text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-ermBrand" />
                        <span>Doctor:</span>
                      </span>
                      <span className="font-medium text-ermText">{getDoctorName(patient.doctor_id)}</span>
                    </div>

                    <div className="flex items-center justify-between text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <BedIcon className="w-3.5 h-3.5 text-ermBrand" />
                        <span>Bed / Bay:</span>
                      </span>
                      <span className="font-medium text-ermText">{getBedLabel(patient.bed_id)}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-ermDivider flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectPatientId(patient.id)}
                    className="text-[11px] text-gray-500 hover:text-gray-900 font-medium"
                  >
                    Details
                  </button>

                  <button
                    onClick={() => {
                      setCompleteModalPatient(patient);
                      setTreatmentNotes('');
                      setInterventions('');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-ermBrand hover:bg-ermBrandHover rounded transition-colors shadow-xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Complete Treatment</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Treatment Completed (Awaiting Discharge or Transfer) */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold text-ermText uppercase tracking-wider">
              Treatment Completed — Ready for Discharge ({completedPatients.length})
            </h3>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <span className="text-[11px] text-gray-400">
            Attending physician released; bed pending discharge clearance
          </span>
        </div>

        {completedPatients.length === 0 ? (
          <div className="bg-white rounded border border-ermDivider p-6 text-center text-xs text-gray-400">
            No patients currently pending discharge clearance.
          </div>
        ) : (
          <div className="bg-white rounded border border-ermDivider overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF9F6] border-b border-ermDivider text-[11px] font-semibold text-gray-600 uppercase">
                  <th className="py-2.5 px-4">Patient ID</th>
                  <th className="py-2.5 px-4">Patient Name</th>
                  <th className="py-2.5 px-4">Triage</th>
                  <th className="py-2.5 px-4">Holding Bed</th>
                  <th className="py-2.5 px-4">Treatment Notes</th>
                  <th className="py-2.5 px-4 text-right">Discharge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {completedPatients.map((patient) => (
                  <tr key={patient.id} className="table-row-hover">
                    <td className="py-3 px-4 font-mono font-semibold text-ermBrand">
                      {patient.id}
                    </td>
                    <td className="py-3 px-4 font-medium text-ermText">
                      {patient.full_name} ({patient.age}y)
                    </td>
                    <td className="py-3 px-4">
                      <TriageBadge level={patient.triage_level} />
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {getBedLabel(patient.bed_id)}
                    </td>
                    <td className="py-3 px-4 text-gray-600 max-w-xs truncate">
                      {patient.treatment_notes || 'Care delivered successfully'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setDischargeModalPatient(patient);
                          setDischargeNotes('Patient stable for home discharge. Follow up with PCP in 48-72 hours.');
                        }}
                        className="px-3 py-1 text-xs font-semibold text-white bg-slate-700 hover:bg-slate-800 rounded transition-colors inline-flex items-center gap-1.5 shadow-xs"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Discharge</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: Complete Treatment */}
      {completeModalPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-ermDivider shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in duration-200">
            <div className="px-5 py-4 border-b border-ermDivider flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-ermText">
                  Complete Clinical Treatment
                </h3>
                <p className="text-xs text-ermMuted">
                  Record procedures performed and release assigned attending doctor
                </p>
              </div>
              <button
                onClick={() => setCompleteModalPatient(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} className="p-5 space-y-4">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded text-xs flex justify-between">
                <div>
                  <span className="font-semibold text-ermText">{completeModalPatient.full_name}</span>
                  <span className="text-gray-500 font-mono ml-2">({completeModalPatient.id})</span>
                </div>
                <TriageBadge level={completeModalPatient.triage_level} />
              </div>

              <div>
                <label className="block text-xs font-medium text-ermText mb-1">
                  Interventions / Medications Administered
                </label>
                <input
                  type="text"
                  value={interventions}
                  onChange={(e) => setInterventions(e.target.value)}
                  placeholder="e.g. IV Saline 1L, Morphine 4mg IV, ECG performed, wound closure 3-0 Ethilon"
                  className="w-full px-3 py-2 text-xs border border-ermDivider rounded bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ermText mb-1">
                  Final Clinical Treatment Notes & Outcome
                </label>
                <textarea
                  rows={3}
                  value={treatmentNotes}
                  onChange={(e) => setTreatmentNotes(e.target.value)}
                  placeholder="Patient vital signs normalized, symptoms subsided, dressing applied, patient stable..."
                  className="w-full px-3 py-2 text-xs border border-ermDivider rounded bg-white"
                />
              </div>

              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-800">
                Notice: Completing treatment automatically unlocks and releases the attending doctor back into the available pool.
              </div>

              <div className="pt-3 border-t border-ermDivider flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCompleteModalPatient(null)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 border border-ermDivider rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActionSubmitting}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-ermBrand hover:bg-ermBrandHover rounded transition-colors disabled:opacity-50"
                >
                  {isActionSubmitting ? 'Saving...' : 'Mark Completed & Release Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Discharge Patient */}
      {dischargeModalPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-ermDivider shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in duration-200">
            <div className="px-5 py-4 border-b border-ermDivider flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-ermText">
                  Discharge Patient from Emergency Department
                </h3>
                <p className="text-xs text-ermMuted">
                  Record discharge orders and release emergency bed
                </p>
              </div>
              <button
                onClick={() => setDischargeModalPatient(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDischargeSubmit} className="p-5 space-y-4">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded text-xs flex justify-between">
                <div>
                  <span className="font-semibold text-ermText">{dischargeModalPatient.full_name}</span>
                  <span className="text-gray-500 font-mono ml-2">({dischargeModalPatient.id})</span>
                </div>
                <span className="text-emerald-700 font-medium">Ready for Discharge</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-ermText mb-1">
                  Discharge Summary & Patient Instructions
                </label>
                <textarea
                  rows={3}
                  value={dischargeNotes}
                  onChange={(e) => setDischargeNotes(e.target.value)}
                  placeholder="Prescriptions issued, wound care instructions, warning signs to return..."
                  className="w-full px-3 py-2 text-xs border border-ermDivider rounded bg-white"
                />
              </div>

              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-800">
                Notice: Discharging releases the occupied bed back to available inventory.
              </div>

              <div className="pt-3 border-t border-ermDivider flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDischargeModalPatient(null)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 border border-ermDivider rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActionSubmitting}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded transition-colors disabled:opacity-50"
                >
                  {isActionSubmitting ? 'Discharging...' : 'Confirm Discharge & Free Bed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
