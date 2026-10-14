import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Bed as BedIcon,
  Plus,
  RefreshCw,
  UserCheck,
  UserX,
  CheckCircle,
  AlertTriangle,
  X,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { Doctor, Bed, BedStatus } from '../types';
import { BedStatusBadge } from '../components/StatusBadge';

interface DoctorsAndBedsProps {
  onSelectPatientId: (id: string) => void;
}

export const DoctorsAndBeds: React.FC<DoctorsAndBedsProps> = ({ onSelectPatientId }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add Doctor Modal
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [docName, setDocName] = useState('');
  const [docDept, setDocDept] = useState('Emergency Medicine & Trauma');

  // Add Bed Modal
  const [showAddBedModal, setShowAddBedModal] = useState(false);
  const [bedLabel, setBedLabel] = useState('');
  const [bedSection, setBedSection] = useState('Acute Care');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [docsList, bedsList] = await Promise.all([
        api.getDoctors(),
        api.getBeds(),
      ]);
      setDoctors(docsList);
      setBeds(bedsList);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;
    setIsSubmitting(true);
    try {
      await api.createDoctor({ name: docName.trim(), department: docDept });
      setShowAddDocModal(false);
      setDocName('');
      setBannerNotice(`Doctor ${docName} successfully added to hospital staff.`);
      fetchData();
    } catch (err: any) {
      alert(`Error creating doctor: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateBed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bedLabel.trim()) return;
    setIsSubmitting(true);
    try {
      await api.createBed({ label: bedLabel.trim(), section: bedSection });
      setShowAddBedModal(false);
      setBedLabel('');
      setBannerNotice(`Bed ${bedLabel} added to inventory.`);
      fetchData();
    } catch (err: any) {
      alert(`Error creating bed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBedStatus = async (bedId: string, currentStatus: string) => {
    const nextStatus: BedStatus =
      currentStatus === 'Available'
        ? 'Cleaning / Maintenance'
        : currentStatus === 'Cleaning / Maintenance'
        ? 'Available'
        : 'Available';

    try {
      await api.updateBedStatus(bedId, nextStatus);
      fetchData();
    } catch (err: any) {
      alert(`Failed to update bed status: ${err.message}`);
    }
  };

  const availableDocs = doctors.filter((d) => d.is_available).length;
  const availableBeds = beds.filter((b) => b.status === 'Available').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Banner */}
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

      {/* Resource Allocation Protocol Explainer */}
      <div className="bg-white p-4 rounded border border-ermDivider flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-ermText">
            Hospital Resource & Capacity Management
          </h2>
          <p className="text-xs text-ermMuted">
            Doctors ({availableDocs} of {doctors.length} available) · Beds ({availableBeds} of {beds.length} available). Prevents double allocation by strict database transaction locks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddDocModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-ermBrand hover:bg-ermBrandHover rounded transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Doctor</span>
          </button>

          <button
            onClick={() => setShowAddBedModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-ermText bg-white hover:bg-gray-100 border border-ermDivider rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Bed</span>
          </button>

          <button
            onClick={fetchData}
            className="p-1.5 text-gray-500 hover:text-gray-700 border border-ermDivider rounded bg-white hover:bg-gray-50 transition-colors"
            title="Refresh resources"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Two Column Layout: Doctors on left, Beds on right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DOCTORS TABLE */}
        <div className="bg-white rounded border border-ermDivider overflow-hidden shadow-xs">
          <div className="p-4 border-b border-ermDivider flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-ermBrand" />
              <h3 className="text-xs font-semibold text-ermText uppercase tracking-wider">
                Emergency Physicians ({doctors.length})
              </h3>
            </div>
            <span className="text-[11px] text-gray-500 font-mono">
              {availableDocs} Ready for Intake
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF9F6] border-b border-ermDivider text-[11px] font-semibold text-gray-600 uppercase">
                  <th className="py-2.5 px-4">Doc ID</th>
                  <th className="py-2.5 px-4">Physician Name</th>
                  <th className="py-2.5 px-4">Department / Specialty</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Patient</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {doctors.map((doc) => (
                  <tr key={doc.id} className="table-row-hover">
                    <td className="py-3 px-4 font-mono font-semibold text-gray-700">
                      {doc.id}
                    </td>
                    <td className="py-3 px-4 font-medium text-ermText">
                      {doc.name}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {doc.department}
                    </td>
                    <td className="py-3 px-4">
                      {doc.is_available ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-[#FCF3EC] text-[#B86635] border border-[#F5DEC7]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#B86635]" />
                          Treating Patient
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {doc.current_patient_id ? (
                        <button
                          onClick={() => onSelectPatientId(doc.current_patient_id!)}
                          className="font-mono text-xs font-semibold text-ermBrand hover:underline"
                        >
                          {doc.current_patient_id}
                        </button>
                      ) : (
                        <span className="text-gray-400 text-[11px]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* BEDS TABLE */}
        <div className="bg-white rounded border border-ermDivider overflow-hidden shadow-xs">
          <div className="p-4 border-b border-ermDivider flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <BedIcon className="w-4 h-4 text-ermBrand" />
              <h3 className="text-xs font-semibold text-ermText uppercase tracking-wider">
                Emergency Bay & Bed Inventory ({beds.length})
              </h3>
            </div>
            <span className="text-[11px] text-gray-500 font-mono">
              {availableBeds} Ready for Intake
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF9F6] border-b border-ermDivider text-[11px] font-semibold text-gray-600 uppercase">
                  <th className="py-2.5 px-4">Bed ID</th>
                  <th className="py-2.5 px-4">Bay Label</th>
                  <th className="py-2.5 px-4">Section</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Action / Patient</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {beds.map((b) => (
                  <tr key={b.id} className="table-row-hover">
                    <td className="py-3 px-4 font-mono font-semibold text-gray-700">
                      {b.id}
                    </td>
                    <td className="py-3 px-4 font-medium text-ermText">
                      {b.label}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {b.section}
                    </td>
                    <td className="py-3 px-4">
                      <BedStatusBadge status={b.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      {b.current_patient_id ? (
                        <button
                          onClick={() => onSelectPatientId(b.current_patient_id!)}
                          className="font-mono text-xs font-semibold text-ermBrand hover:underline"
                        >
                          {b.current_patient_id}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateBedStatus(b.id, b.status)}
                          className="text-[10px] text-gray-500 hover:text-ermBrand underline"
                          title="Toggle maintenance / cleaning state"
                        >
                          {b.status === 'Available' ? 'Mark Cleaning' : 'Mark Available'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL 1: Add Doctor */}
      {showAddDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-ermDivider shadow-xl w-full max-w-md overflow-hidden animate-in fade-in duration-200">
            <div className="px-5 py-4 border-b border-ermDivider flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ermText">Add Emergency Doctor</h3>
              <button onClick={() => setShowAddDocModal(false)} className="text-gray-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDoctor} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-ermText mb-1">Doctor Name</label>
                <input
                  type="text"
                  required
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. Dr. Arthur Pendelton, MD"
                  className="w-full px-3 py-2 text-xs border border-ermDivider rounded bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ermText mb-1">Department / Specialty</label>
                <select
                  value={docDept}
                  onChange={(e) => setDocDept(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-ermDivider rounded bg-white"
                >
                  <option value="Emergency Medicine & Trauma">Emergency Medicine & Trauma</option>
                  <option value="Acute Cardiology">Acute Cardiology</option>
                  <option value="Pediatric Emergency">Pediatric Emergency</option>
                  <option value="Orthopedics & Minor Trauma">Orthopedics & Minor Trauma</option>
                  <option value="Critical Care Medicine">Critical Care Medicine</option>
                  <option value="Neurology / Stroke Care">Neurology / Stroke Care</option>
                </select>
              </div>

              <div className="pt-3 border-t border-ermDivider flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDocModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 border border-ermDivider rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-ermBrand hover:bg-ermBrandHover rounded transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Save Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Bed */}
      {showAddBedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-ermDivider shadow-xl w-full max-w-md overflow-hidden animate-in fade-in duration-200">
            <div className="px-5 py-4 border-b border-ermDivider flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ermText">Add Emergency Bay / Bed</h3>
              <button onClick={() => setShowAddBedModal(false)} className="text-gray-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBed} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-ermText mb-1">Bay / Bed Label</label>
                <input
                  type="text"
                  required
                  value={bedLabel}
                  onChange={(e) => setBedLabel(e.target.value)}
                  placeholder="e.g. Acute Bay 9, Resuscitation Bay 3"
                  className="w-full px-3 py-2 text-xs border border-ermDivider rounded bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ermText mb-1">Clinical Section</label>
                <select
                  value={bedSection}
                  onChange={(e) => setBedSection(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-ermDivider rounded bg-white"
                >
                  <option value="Resuscitation">Resuscitation (Critical Priority)</option>
                  <option value="Trauma">Trauma Bay</option>
                  <option value="Acute Care">Acute Care</option>
                  <option value="Observation">Observation Unit</option>
                  <option value="Fast Track">Fast Track (Minor Injuries)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-ermDivider flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddBedModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 border border-ermDivider rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-ermBrand hover:bg-ermBrandHover rounded transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Save Bed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
