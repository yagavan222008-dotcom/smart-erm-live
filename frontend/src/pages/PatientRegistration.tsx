import React, { useState } from 'react';
import {
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { api } from '../services/api';
import { Patient, TriageLevel } from '../types';
import { TriageBadge } from '../components/StatusBadge';
import { NavTab } from '../components/Navigation';

interface PatientRegistrationProps {
  onNavigate: (tab: NavTab) => void;
  onSelectPatientId: (id: string) => void;
}

export const PatientRegistration: React.FC<PatientRegistrationProps> = ({
  onNavigate,
  onSelectPatientId,
}) => {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState('Male');
  const [contactNumber, setContactNumber] = useState('');
  const [complaint, setComplaint] = useState('');
  const [triageLevel, setTriageLevel] = useState<TriageLevel>('Moderate');
  const [triageNotes, setTriageNotes] = useState('');
  const [initialObservations, setInitialObservations] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registeredPatient, setRegisteredPatient] = useState<Patient | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 2) {
      errs.fullName = 'Patient full name is required (min 2 characters)';
    }

    const ageNum = parseInt(age, 10);
    if (!age || isNaN(ageNum) || ageNum < 0 || ageNum > 130) {
      errs.age = 'Valid age between 0 and 130 is required';
    }

    if (!complaint.trim() || complaint.trim().length < 3) {
      errs.complaint = 'Presenting complaint/symptoms are required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});
    try {
      const patient = await api.registerPatient({
        full_name: fullName.trim(),
        age: parseInt(age, 10),
        gender,
        contact_number: contactNumber.trim() || undefined,
        complaint: complaint.trim(),
        triage_level: triageLevel,
        triage_notes: triageNotes.trim() || undefined,
      });

      setRegisteredPatient(patient);
      // Reset form fields
      setFullName('');
      setAge('');
      setContactNumber('');
      setComplaint('');
      setTriageNotes('');
      setInitialObservations('');
    } catch (err: any) {
      setErrors({ form: err.message || 'Registration failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Demo Presets for easy viva demonstration
  const applyPreset = (preset: {
    name: string;
    age: string;
    gender: string;
    triage: TriageLevel;
    complaint: string;
    notes: string;
  }) => {
    setFullName(preset.name);
    setAge(preset.age);
    setGender(preset.gender);
    setTriageLevel(preset.triage);
    setComplaint(preset.complaint);
    setTriageNotes(preset.notes);
    setErrors({});
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Demo Quick Load Toolbar for Faculty Viva */}
      <div className="bg-white p-3.5 rounded border border-ermDivider flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-ermText">
          <Sparkles className="w-4 h-4 text-ermBrand" />
          <span>Demo Intake Scenarios (One-Click Viva Presets):</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              applyPreset({
                name: 'Samuel Vance',
                age: '61',
                gender: 'Male',
                triage: 'Critical',
                complaint: 'Crushing retrosternal chest pain, radiating to left jaw with cold sweats',
                notes: 'BP 85/55 mmHg, pulse 115, SpO2 91%. Suspected STEMI.',
              })
            }
            className="px-2.5 py-1 text-[11px] font-medium bg-[#FBF0F0] text-[#A83232] border border-[#F2D6D6] rounded hover:bg-red-100 transition-colors"
          >
            Critical (Cardiac)
          </button>
          <button
            type="button"
            onClick={() =>
              applyPreset({
                name: 'Natasha Romanov',
                age: '38',
                gender: 'Female',
                triage: 'High',
                complaint: 'High velocity motor collision; severe blunt abdominal trauma and guarding',
                notes: 'Alert, severe pain on palpation of RUQ. Fast ultrasound indicated.',
              })
            }
            className="px-2.5 py-1 text-[11px] font-medium bg-[#FCF3EC] text-[#B86635] border border-[#F5DEC7] rounded hover:bg-orange-100 transition-colors"
          >
            High (Trauma)
          </button>
          <button
            type="button"
            onClick={() =>
              applyPreset({
                name: 'Lucas Campbell',
                age: '24',
                gender: 'Male',
                triage: 'Moderate',
                complaint: 'Deep forearm laceration from broken glass, hemostasis achieved with compression',
                notes: 'Tetanus up to date. Requires exploration and suturing.',
              })
            }
            className="px-2.5 py-1 text-[11px] font-medium bg-[#FCF8ED] text-[#B18A37] border border-[#F4E8C1] rounded hover:bg-amber-100 transition-colors"
          >
            Moderate (Laceration)
          </button>
          <button
            type="button"
            onClick={() =>
              applyPreset({
                name: 'Hannah Abbott',
                age: '29',
                gender: 'Female',
                triage: 'Low',
                complaint: 'Mild sore throat and low-grade pyrexia for 2 days, ambulatory',
                notes: 'Vitals stable. Suitable for fast-track consultation.',
              })
            }
            className="px-2.5 py-1 text-[11px] font-medium bg-[#EFF5F1] text-[#66816B] border border-[#D1E3D6] rounded hover:bg-green-100 transition-colors"
          >
            Low (Minor)
          </button>
        </div>
      </div>

      {/* Confirmation Card if Patient just registered */}
      {registeredPatient && (
        <div className="bg-emerald-50 border border-emerald-300 rounded p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-emerald-900">
                Patient Successfully Registered & Queued in Min-Heap!
              </div>
              <p className="text-xs text-emerald-800 mt-0.5">
                Assigned ID <strong className="font-mono">{registeredPatient.id}</strong> (Arrival Sequence #{registeredPatient.arrival_seq}).
                Automatically enqueued according to urgency level.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <TriageBadge level={registeredPatient.triage_level} />
                <span className="text-[11px] text-emerald-700 font-medium">
                  {registeredPatient.full_name} ({registeredPatient.age}y, {registeredPatient.gender})
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('triage-queue')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-ermBrand hover:bg-ermBrandHover rounded transition-colors shadow-xs"
            >
              <span>View in Triage Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setRegisteredPatient(null)}
              className="px-2.5 py-1.5 text-xs text-emerald-800 hover:text-emerald-900 font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded border border-ermDivider p-6 space-y-6">
        {errors.form && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errors.form}</span>
          </div>
        )}

        {/* Section 1: Demographics */}
        <div>
          <h3 className="text-xs font-semibold text-ermText uppercase tracking-wider pb-2 border-b border-ermDivider mb-4">
            1. Patient Demographics & Identification
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Full Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-ermText mb-1">
                Full Legal Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Johnathan Doe"
                className={`w-full px-3 py-2 text-xs border rounded bg-white ${
                  errors.fullName ? 'border-red-500' : 'border-ermDivider'
                }`}
              />
              {errors.fullName && (
                <span className="text-[10px] text-red-600 mt-1 block">{errors.fullName}</span>
              )}
            </div>

            {/* Age */}
            <div>
              <label className="block text-xs font-medium text-ermText mb-1">
                Age (Years) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="130"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 45"
                className={`w-full px-3 py-2 text-xs border rounded bg-white ${
                  errors.age ? 'border-red-500' : 'border-ermDivider'
                }`}
              />
              {errors.age && (
                <span className="text-[10px] text-red-600 mt-1 block">{errors.age}</span>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-medium text-ermText mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-ermDivider rounded bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            {/* Contact Number */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-ermText mb-1">
                Contact Phone Number (Optional)
              </label>
              <input
                type="text"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="e.g. +1 (555) 019-2831"
                className="w-full px-3 py-2 text-xs border border-ermDivider rounded bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Clinical Urgency / Triage Level */}
        <div>
          <h3 className="text-xs font-semibold text-ermText uppercase tracking-wider pb-2 border-b border-ermDivider mb-4">
            2. Staff-Entered Triage Urgency Level
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
            {/* Critical */}
            <div
              onClick={() => setTriageLevel('Critical')}
              className={`p-3.5 rounded border cursor-pointer transition-all flex flex-col justify-between ${
                triageLevel === 'Critical'
                  ? 'bg-[#FBF0F0] border-[#A83232] shadow-xs ring-1 ring-[#A83232]'
                  : 'bg-white border-ermDivider hover:border-gray-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-[#A83232]">Critical (Priority 1)</span>
                <span className="w-2 h-2 rounded-full bg-[#A83232]" />
              </div>
              <p className="text-[11px] text-gray-600">
                Immediate life threat (respiratory failure, cardiac arrest, active stroke, major trauma).
              </p>
            </div>

            {/* High */}
            <div
              onClick={() => setTriageLevel('High')}
              className={`p-3.5 rounded border cursor-pointer transition-all flex flex-col justify-between ${
                triageLevel === 'High'
                  ? 'bg-[#FCF3EC] border-[#B86635] shadow-xs ring-1 ring-[#B86635]'
                  : 'bg-white border-ermDivider hover:border-gray-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-[#B86635]">High (Priority 2)</span>
                <span className="w-2 h-2 rounded-full bg-[#B86635]" />
              </div>
              <p className="text-[11px] text-gray-600">
                Severe pain, acute fractures, continuous high pyrexia, altered sensorium.
              </p>
            </div>

            {/* Moderate */}
            <div
              onClick={() => setTriageLevel('Moderate')}
              className={`p-3.5 rounded border cursor-pointer transition-all flex flex-col justify-between ${
                triageLevel === 'Moderate'
                  ? 'bg-[#FCF8ED] border-[#B18A37] shadow-xs ring-1 ring-[#B18A37]'
                  : 'bg-white border-ermDivider hover:border-gray-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-[#B18A37]">Moderate (Priority 3)</span>
                <span className="w-2 h-2 rounded-full bg-[#B18A37]" />
              </div>
              <p className="text-[11px] text-gray-600">
                Stable vitals, lacerations requiring stitches, sprains, moderate infection.
              </p>
            </div>

            {/* Low */}
            <div
              onClick={() => setTriageLevel('Low')}
              className={`p-3.5 rounded border cursor-pointer transition-all flex flex-col justify-between ${
                triageLevel === 'Low'
                  ? 'bg-[#EFF5F1] border-[#66816B] shadow-xs ring-1 ring-[#66816B]'
                  : 'bg-white border-ermDivider hover:border-gray-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-[#66816B]">Low (Priority 4)</span>
                <span className="w-2 h-2 rounded-full bg-[#66816B]" />
              </div>
              <p className="text-[11px] text-gray-600">
                Minor rash, minor abrasions, prescription renewal, chronic non-acute symptoms.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Complaint & Initial Observations */}
        <div>
          <h3 className="text-xs font-semibold text-ermText uppercase tracking-wider pb-2 border-b border-ermDivider mb-4">
            3. Clinical Complaint & Vitals Observation
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ermText mb-1">
                Presenting Complaint / Symptoms <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                placeholder="Describe chief complaint, onset duration, and symptoms reported by patient or paramedics..."
                className={`w-full px-3 py-2 text-xs border rounded bg-white ${
                  errors.complaint ? 'border-red-500' : 'border-ermDivider'
                }`}
              />
              {errors.complaint && (
                <span className="text-[10px] text-red-600 mt-1 block">{errors.complaint}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-ermText mb-1">
                Triage Clinical Notes & Objective Observations (Optional)
              </label>
              <textarea
                rows={2}
                value={triageNotes}
                onChange={(e) => setTriageNotes(e.target.value)}
                placeholder="Vital signs (BP, HR, SpO2, Temp), allergies, relevant prior medical history..."
                className="w-full px-3 py-2 text-xs border border-ermDivider rounded bg-white"
              />
            </div>
          </div>
        </div>

        {/* Clinical Disclaimer */}
        <div className="flex items-center gap-2 p-3 bg-[#FBFBF9] border border-ermDivider rounded text-[11px] text-gray-600">
          <ShieldCheck className="w-4 h-4 text-ermBrand shrink-0" />
          <span>
            Clinical Note: Triage urgency level is determined by clinical staff evaluation and entered manually.
            The Binary Min-Heap algorithm strictly schedules queue ordering by urgency (1..4) with FIFO arrival tie-breaking.
          </span>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-ermDivider">
          <button
            type="button"
            onClick={() => {
              setFullName('');
              setAge('');
              setContactNumber('');
              setComplaint('');
              setTriageNotes('');
              setErrors({});
            }}
            className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 bg-white border border-ermDivider rounded hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Form</span>
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-ermBrand hover:bg-ermBrandHover rounded transition-colors shadow-xs disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isSubmitting ? 'Registering...' : 'Register & Enqueue Patient'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
