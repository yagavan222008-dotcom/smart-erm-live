import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  CheckCircle,
  Save,
  Building,
  User,
  AlertTriangle,
  X,
} from 'lucide-react';
import { api } from '../services/api';

interface SettingsProps {
  onSettingsSaved: (facility: string, staff: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({ onSettingsSaved }) => {
  const [facilityName, setFacilityName] = useState('Metropolitan Central Emergency Center');
  const [staffName, setStaffName] = useState('Dr. Eleanor Vance (Triage Lead)');
  const [isSaving, setIsSaving] = useState(false);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  // Reset Confirmation Modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const s = await api.getSettings();
        if (s.FACILITY_NAME) setFacilityName(s.FACILITY_NAME);
        if (s.CURRENT_STAFF) setStaffName(s.CURRENT_STAFF);
      } catch (err) {
        console.error(err);
      }
    };
    loadSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateSettings(facilityName, staffName);
      onSettingsSaved(facilityName, staffName);
      setBannerNotice('System settings saved successfully.');
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetData = async () => {
    setIsResetting(true);
    try {
      await api.seedDemoData(true);
      setShowResetModal(false);
      setBannerNotice('Database reset and repopulated with fresh clinical demo scenario.');
      window.location.reload();
    } catch (err: any) {
      alert(`Reset error: ${err.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
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

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="bg-white rounded border border-ermDivider p-6 space-y-6">
        <div>
          <h3 className="text-xs font-semibold text-ermText uppercase tracking-wider pb-2 border-b border-ermDivider mb-4">
            Facility & Staff Profile
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ermText mb-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-ermBrand" />
                <span>Emergency Department Facility Name</span>
              </label>
              <input
                type="text"
                value={facilityName}
                onChange={(e) => setFacilityName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-ermDivider rounded bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ermText mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-ermBrand" />
                <span>Active Operating Staff Identity (Audited)</span>
              </label>
              <input
                type="text"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-ermDivider rounded bg-white"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                This staff name will be stamped on all triage overrides, admissions, and discharges in the persistent audit trail.
              </span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-ermDivider flex items-center justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-ermBrand hover:bg-ermBrandHover rounded transition-colors shadow-xs disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>

      {/* Demo Data Management Card */}
      <div className="bg-white rounded border border-ermDivider p-6 space-y-4">
        <h3 className="text-xs font-semibold text-ermText uppercase tracking-wider pb-2 border-b border-ermDivider">
          Demo Data & Simulation Reset Tools
        </h3>

        <p className="text-xs text-gray-600 leading-relaxed">
          Use these options for viva demonstrations to reload standard patients, available doctors, and emergency beds across all urgency classes.
        </p>

        <div className="pt-2 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Database & Seed Fresh Scenario</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-ermDivider shadow-xl w-full max-w-md overflow-hidden animate-in fade-in duration-200">
            <div className="px-5 py-4 border-b border-ermDivider flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="text-sm font-semibold text-red-900">Confirm Database Reset</h3>
              </div>
              <button onClick={() => setShowResetModal(false)} className="text-gray-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-gray-600">
              <p>
                Are you sure you want to reset the SQLite database? This will clear all existing test records and restore the default demo census, doctors, beds, and min-heap state.
              </p>

              <div className="pt-3 border-t border-ermDivider flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 border border-ermDivider rounded"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isResetting}
                  onClick={handleResetData}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded transition-colors disabled:opacity-50"
                >
                  {isResetting ? 'Resetting...' : 'Yes, Reset Database'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
