import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight, User } from 'lucide-react';
import { api } from '../services/api';
import { Patient } from '../types';
import { TriageBadge, PatientStatusBadge } from './StatusBadge';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPatient: (patient: Patient) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectPatient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      if (searchTerm.trim().length > 0) {
        setIsLoading(true);
        try {
          const res = await api.getPatients(searchTerm.trim());
          setResults(res);
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40 backdrop-blur-xs">
      <div className="bg-white w-full max-w-xl rounded-lg shadow-xl border border-ermDivider overflow-hidden flex flex-col max-h-[75vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-ermDivider gap-3 bg-white">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Patient ID (e.g. PT-2026-0001) or Name..."
            className="w-full text-sm outline-none placeholder:text-gray-400 bg-transparent"
          />
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading && (
            <div className="py-8 text-center text-xs text-gray-500">Searching directory...</div>
          )}

          {!isLoading && searchTerm && results.length === 0 && (
            <div className="py-8 text-center text-xs text-gray-500">
              No registered patients found matching "{searchTerm}"
            </div>
          )}

          {!isLoading && !searchTerm && (
            <div className="py-8 text-center text-xs text-gray-400">
              Type a patient name or ID to search immediate census records
            </div>
          )}

          <div className="divide-y divide-gray-100">
            {results.map((patient) => (
              <div
                key={patient.id}
                onClick={() => {
                  onSelectPatient(patient);
                  onClose();
                }}
                className="p-3 hover:bg-[#F9F8F5] cursor-pointer rounded transition-colors flex items-center justify-between group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-ermBrand">
                      {patient.id}
                    </span>
                    <span className="font-medium text-xs text-ermText">
                      {patient.full_name}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      ({patient.age}y, {patient.gender})
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-600 line-clamp-1 max-w-md">
                    {patient.complaint}
                  </div>
                  <div className="flex items-center gap-2 pt-0.5">
                    <TriageBadge level={patient.triage_level} />
                    <PatientStatusBadge status={patient.status} />
                  </div>
                </div>

                <div className="flex items-center text-ermBrand opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs font-medium mr-1">View</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2 bg-[#F7F6F2] border-t border-ermDivider text-[11px] text-gray-500 flex justify-between">
          <span>O(1) Hash Table lookup aided by SQLite persistent index</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
