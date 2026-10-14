import React, { useState, useEffect } from 'react';
import { Search, Activity, User, ShieldCheck } from 'lucide-react';
import { NavTab } from './Navigation';

interface HeaderProps {
  currentTab: NavTab;
  onOpenSearch: () => void;
  staffName: string;
  facilityName: string;
  isBackendConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenSearch,
  staffName,
  facilityName,
  isBackendConnected,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const titles: Record<NavTab, { title: string; subtitle: string }> = {
    overview: {
      title: 'Operations Dashboard',
      subtitle: 'Real-time emergency department capacity, queue analytics, and live census',
    },
    registration: {
      title: 'Patient Intake & Registration',
      subtitle: 'Record clinical observations, assign triage classification, and enqueue into heap',
    },
    'triage-queue': {
      title: 'Active Triage Priority Queue',
      subtitle: 'Monitored priority queue scheduled strictly by Binary Min-Heap with FIFO tie resolution',
    },
    'treatment-room': {
      title: 'Treatment Room Workflow',
      subtitle: 'Active care episodes, doctor allocation, bed management, and clinical procedures',
    },
    'doctors-beds': {
      title: 'Doctors & Bed Allocation',
      subtitle: 'Resource availability tracking and prevention of clinical double-allocation',
    },
    'patient-records': {
      title: 'Patient Census & Records',
      subtitle: 'Comprehensive patient directory with educational O(1) hash table lookup',
    },
    history: {
      title: 'Treatment History & Audit Log',
      subtitle: 'Immutable record of staff overrides, triage transitions, and treatment events',
    },
    reports: {
      title: 'Operational Reports & Analytics',
      subtitle: 'Aggregated emergency metrics, wait times, bed utilization, and CSV data export',
    },
    'dsa-lab': {
      title: 'DSA Interactive Demonstration Lab',
      subtitle: 'Live visualizer for Min-Heap, Hash Table, Singly Linked List, and Merge Sort',
    },
    settings: {
      title: 'System Configuration',
      subtitle: 'Emergency department profiles, demo staff settings, and data reset tools',
    },
  };

  const { title, subtitle } = titles[currentTab] || {
    title: 'Smart ERM',
    subtitle: 'Emergency Room Management',
  };

  return (
    <header className="h-16 bg-white border-b border-ermDivider px-6 flex items-center justify-between shrink-0 select-none">
      {/* Title & Subtitle */}
      <div className="flex flex-col">
        <h1 className="text-base font-semibold text-ermText leading-tight">{title}</h1>
        <p className="text-[11px] text-ermMuted leading-tight">{subtitle}</p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Quick Search Shortcut */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-500 bg-[#F7F6F2] hover:bg-gray-200 border border-ermDivider rounded transition-colors"
          title="Search patient by ID or Name"
        >
          <Search className="w-3.5 h-3.5 text-gray-500" />
          <span>Search patient...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-white border border-gray-300 rounded text-gray-600">
            Ctrl+K
          </kbd>
        </button>

        {/* Live Clock */}
        <div className="hidden md:flex flex-col text-right">
          <span className="text-xs font-semibold text-ermText font-mono tracking-tight">{currentTime}</span>
          <span className="text-[10px] text-gray-500">{currentDate}</span>
        </div>

        {/* Database Status Indicator */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium border ${
            isBackendConnected
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
          title={isBackendConnected ? 'Backend & SQLite Connected' : 'Backend Disconnected'}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isBackendConnected ? 'bg-emerald-600 animate-pulse' : 'bg-red-600'
            }`}
          />
          <span className="hidden sm:inline">
            {isBackendConnected ? 'DB Active' : 'Offline'}
          </span>
        </div>

        {/* Demo Staff Profile */}
        <div className="flex items-center gap-2 pl-3 border-l border-ermDivider">
          <div className="w-7 h-7 rounded-full bg-ermBrandLight text-ermBrand flex items-center justify-center font-medium text-xs border border-ermDivider">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-medium text-ermText leading-tight">{staffName}</span>
            <span className="text-[10px] text-ermMuted leading-tight">{facilityName}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
