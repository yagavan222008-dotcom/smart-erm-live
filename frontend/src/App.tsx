import React, { useState, useEffect } from 'react';
import { Navigation, NavTab } from './components/Navigation';
import { Header } from './components/Header';
import { QuickSearchModal } from './components/QuickSearchModal';
import { Overview } from './pages/Overview';
import { PatientRegistration } from './pages/PatientRegistration';
import { TriageQueue } from './pages/TriageQueue';
import { TreatmentRoom } from './pages/TreatmentRoom';
import { DoctorsAndBeds } from './pages/DoctorsAndBeds';
import { PatientRecords } from './pages/PatientRecords';
import { TreatmentHistory } from './pages/TreatmentHistory';
import { ReportsAnalytics } from './pages/ReportsAnalytics';
import { DsaDemonstration } from './pages/DsaDemonstration';
import { Settings } from './pages/Settings';
import { api } from './services/api';
import { Patient } from './types';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(true);

  // Facility & Staff configuration
  const [facilityName, setFacilityName] = useState('Metropolitan Central Emergency Center');
  const [staffName, setStaffName] = useState('Dr. Eleanor Vance (Triage Lead)');

  // Queue badge counts
  const [waitingCount, setWaitingCount] = useState(0);
  const [criticalCount, setCriticalCount] = useState(0);

  // Deep-linking to a patient profile in PatientRecords page
  const [inspectedPatientId, setInspectedPatientId] = useState<string | null>(null);

  // Poll Health & Dashboard metrics for badges and connection indicator
  const checkStatus = async () => {
    try {
      const [health, summary] = await Promise.all([
        api.getHealth(),
        api.getDashboardSummary(),
      ]);
      setIsBackendConnected(health.status === 'healthy');
      setWaitingCount(summary.patients_waiting);
      setCriticalCount(summary.critical_waiting);
    } catch {
      setIsBackendConnected(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 12000);
    return () => clearInterval(interval);
  }, []);

  // Global Ctrl+K shortcut for quick patient search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectPatientFromSearch = (patient: Patient) => {
    setInspectedPatientId(patient.id);
    setCurrentTab('patient-records');
  };

  const handleSelectPatientId = (patientId: string) => {
    setInspectedPatientId(patientId);
    setCurrentTab('patient-records');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-ermBg text-ermText font-sans">
      {/* Sidebar Navigation */}
      <Navigation
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          setInspectedPatientId(null);
        }}
        waitingCount={waitingCount}
        criticalCount={criticalCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* App Top Header */}
        <Header
          currentTab={currentTab}
          onOpenSearch={() => setIsSearchOpen(true)}
          staffName={staffName}
          facilityName={facilityName}
          isBackendConnected={isBackendConnected}
        />

        {/* View Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#F7F6F2]">
          {currentTab === 'overview' && (
            <Overview
              onNavigate={(tab) => setCurrentTab(tab)}
              onSelectPatientId={handleSelectPatientId}
            />
          )}

          {currentTab === 'registration' && (
            <PatientRegistration
              onNavigate={(tab) => setCurrentTab(tab)}
              onSelectPatientId={handleSelectPatientId}
            />
          )}

          {currentTab === 'triage-queue' && (
            <TriageQueue
              onNavigate={(tab) => setCurrentTab(tab)}
              onSelectPatientId={handleSelectPatientId}
            />
          )}

          {currentTab === 'treatment-room' && (
            <TreatmentRoom
              onNavigate={(tab) => setCurrentTab(tab)}
              onSelectPatientId={handleSelectPatientId}
            />
          )}

          {currentTab === 'doctors-beds' && (
            <DoctorsAndBeds onSelectPatientId={handleSelectPatientId} />
          )}

          {currentTab === 'patient-records' && (
            <PatientRecords
              initialPatientId={inspectedPatientId}
              onClearInitialPatientId={() => setInspectedPatientId(null)}
            />
          )}

          {currentTab === 'history' && (
            <TreatmentHistory onSelectPatientId={handleSelectPatientId} />
          )}

          {currentTab === 'reports' && <ReportsAnalytics />}

          {currentTab === 'dsa-lab' && <DsaDemonstration />}

          {currentTab === 'settings' && (
            <Settings
              onSettingsSaved={(facility, staff) => {
                setFacilityName(facility);
                setStaffName(staff);
              }}
            />
          )}
        </main>
      </div>

      {/* Quick Search Modal */}
      <QuickSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectPatient={handleSelectPatientFromSearch}
      />
    </div>
  );
}

export default App;
