import React from 'react';
import {
  LayoutDashboard,
  UserPlus,
  ListOrdered,
  Stethoscope,
  Bed,
  FolderOpen,
  History,
  BarChart3,
  Settings as SettingsIcon,
  Binary,
  ShieldAlert,
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'registration'
  | 'triage-queue'
  | 'treatment-room'
  | 'doctors-beds'
  | 'patient-records'
  | 'history'
  | 'reports'
  | 'settings'
  | 'dsa-lab';

interface NavigationProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  waitingCount: number;
  criticalCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onTabChange,
  waitingCount,
  criticalCount,
}) => {
  const navItems: Array<{
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeCritical?: boolean;
  }> = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'registration', label: 'Patient Registration', icon: UserPlus },
    {
      id: 'triage-queue',
      label: 'Triage Queue',
      icon: ListOrdered,
      badge: waitingCount,
      badgeCritical: criticalCount > 0,
    },
    { id: 'treatment-room', label: 'Treatment Room', icon: Stethoscope },
    { id: 'doctors-beds', label: 'Doctors & Beds', icon: Bed },
    { id: 'patient-records', label: 'Patient Records', icon: FolderOpen },
    { id: 'history', label: 'Treatment History', icon: History },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'dsa-lab', label: 'DSA Interactive Lab', icon: Binary },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 bg-white border-r border-ermDivider flex flex-col shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-ermDivider gap-3 bg-white">
        <div className="w-8 h-8 rounded bg-ermBrand text-white flex items-center justify-center font-bold text-sm tracking-wider">
          ER
        </div>
        <div>
          <div className="font-semibold text-xs tracking-wider uppercase text-ermBrand">SMART ERM</div>
          <div className="text-[11px] text-ermMuted leading-tight font-medium">Emergency Care Manager</div>
        </div>
      </div>

      {/* Primary Navigation Links */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
          Operations
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded transition-colors duration-150 ${
                isActive
                  ? 'bg-ermBrand text-white shadow-xs'
                  : 'text-ermText hover:bg-gray-100 hover:text-black'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-gray-500'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {typeof item.badge === 'number' && item.badge > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : item.badgeCritical
                      ? 'bg-[#FBF0F0] text-[#A83232] border border-[#F2D6D6]'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Safety Notice Footer */}
      <div className="p-3 border-t border-ermDivider bg-[#FBFBF9] text-[11px] text-ermMuted leading-relaxed">
        <div className="flex items-center gap-1.5 font-medium text-gray-700 mb-1">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Educational Simulation</span>
        </div>
        <p className="text-[10px] text-gray-500">
          Min-heap triage scheduler for DSA study. Does not replace certified clinical triage protocols.
        </p>
      </div>
    </aside>
  );
};
