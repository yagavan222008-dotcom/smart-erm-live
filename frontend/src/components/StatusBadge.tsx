import React from 'react';
import { TriageLevel, PatientStatus, BedStatus } from '../types';

interface TriageBadgeProps {
  level: TriageLevel | string;
  size?: 'sm' | 'md' | 'lg';
}

export const TriageBadge: React.FC<TriageBadgeProps> = ({ level, size = 'sm' }) => {
  let bg = 'bg-gray-100 text-gray-800 border-gray-300';
  let dot = 'bg-gray-500';

  switch (level) {
    case 'Critical':
      bg = 'bg-[#FBF0F0] text-[#A83232] border-[#F2D6D6]';
      dot = 'bg-[#A83232]';
      break;
    case 'High':
      bg = 'bg-[#FCF3EC] text-[#B86635] border-[#F5DEC7]';
      dot = 'bg-[#B86635]';
      break;
    case 'Moderate':
      bg = 'bg-[#FCF8ED] text-[#B18A37] border-[#F4E8C1]';
      dot = 'bg-[#B18A37]';
      break;
    case 'Low':
      bg = 'bg-[#EFF5F1] text-[#66816B] border-[#D1E3D6]';
      dot = 'bg-[#66816B]';
      break;
  }

  const sizeClass = size === 'lg' ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[11px]';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded border ${bg} ${sizeClass} tracking-wide`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} shrink-0`} />
      {level}
    </span>
  );
};

export const PatientStatusBadge: React.FC<{ status: PatientStatus | string }> = ({ status }) => {
  let badgeStyle = 'bg-gray-100 text-gray-700 border-gray-200';

  if (status === 'Waiting') {
    badgeStyle = 'bg-amber-50 text-amber-800 border-amber-200';
  } else if (status === 'Under Treatment') {
    badgeStyle = 'bg-blue-50 text-blue-800 border-blue-200';
  } else if (status === 'Treatment Completed') {
    badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  } else if (status === 'Discharged') {
    badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';
  } else if (status === 'Cancelled') {
    badgeStyle = 'bg-red-50 text-red-700 border-red-200';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded border ${badgeStyle}`}>
      {status}
    </span>
  );
};

export const BedStatusBadge: React.FC<{ status: BedStatus | string }> = ({ status }) => {
  let badgeStyle = 'bg-gray-100 text-gray-700 border-gray-200';

  if (status === 'Available') {
    badgeStyle = 'bg-[#EFF5F1] text-[#345B49] border-[#D1E3D6]';
  } else if (status === 'Occupied') {
    badgeStyle = 'bg-[#FCF3EC] text-[#B86635] border-[#F5DEC7]';
  } else if (status === 'Cleaning / Maintenance') {
    badgeStyle = 'bg-amber-50 text-amber-800 border-amber-200';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded border ${badgeStyle}`}>
      {status}
    </span>
  );
};
