import React, { useState, useEffect } from 'react';
import {
  Users,
  Clock,
  HeartPulse,
  Activity,
  Bed,
  CheckCircle2,
  ArrowUpRight,
  RefreshCw,
  PlusCircle,
  AlertTriangle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { api } from '../services/api';
import { DashboardSummary } from '../types';
import { TriageBadge, PatientStatusBadge } from '../components/StatusBadge';
import { NavTab } from '../components/Navigation';

interface OverviewProps {
  onNavigate: (tab: NavTab) => void;
  onSelectPatientId: (id: string) => void;
}

export const Overview: React.FC<OverviewProps> = ({ onNavigate, onSelectPatientId }) => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const summary = await api.getDashboardSummary();
      setData(summary);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 15000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading && !data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[500px]">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <RefreshCw className="w-5 h-5 animate-spin text-ermBrand" />
          <span>Loading live emergency census...</span>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
          Failed to load operational data: {error}
          <button
            onClick={fetchMetrics}
            className="ml-4 underline font-medium text-red-900"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const urgencyBarData = data
    ? [
        { name: 'Critical', count: data.urgency_distribution['Critical'] || 0, color: '#A83232' },
        { name: 'High', count: data.urgency_distribution['High'] || 0, color: '#B86635' },
        { name: 'Moderate', count: data.urgency_distribution['Moderate'] || 0, color: '#B18A37' },
        { name: 'Low', count: data.urgency_distribution['Low'] || 0, color: '#66816B' },
      ]
    : [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Quick Action & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded border border-ermDivider">
        <div>
          <h2 className="text-sm font-semibold text-ermText">
            Emergency Department Operations Overview
          </h2>
          <p className="text-xs text-ermMuted">
            Live metrics calculated from SQLite persistent records and Binary Min-Heap scheduler.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('registration')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-ermBrand hover:bg-ermBrandHover rounded transition-colors shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Register Patient</span>
          </button>
          <button
            onClick={() => onNavigate('triage-queue')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-ermText bg-white hover:bg-gray-100 border border-ermDivider rounded transition-colors"
          >
            <span>Open Triage Queue</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={fetchMetrics}
            className="p-1.5 text-gray-500 hover:text-gray-700 border border-ermDivider rounded bg-white hover:bg-gray-50 transition-colors"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (6 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Today */}
        <div className="bg-white p-3.5 rounded border border-ermDivider">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wide">Registered Today</span>
            <Users className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-ermText">
            {data?.total_registered_today ?? 0}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">Cumulative 24h intake</div>
        </div>

        {/* Patients Waiting */}
        <div className="bg-white p-3.5 rounded border border-ermDivider">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wide">In Waiting Queue</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700">
            {data?.patients_waiting ?? 0}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">Avg wait: {data?.avg_wait_time_minutes ?? 0} min</div>
        </div>

        {/* Critical Waiting */}
        <div className="bg-white p-3.5 rounded border border-ermDivider border-l-4 border-l-[#A83232]">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wide text-[#A83232]">
              Critical Urgency
            </span>
            <AlertTriangle className="w-4 h-4 text-[#A83232]" />
          </div>
          <div className="text-2xl font-bold text-[#A83232]">
            {data?.critical_waiting ?? 0}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">Immediate care priority</div>
        </div>

        {/* Receiving Treatment */}
        <div className="bg-white p-3.5 rounded border border-ermDivider">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wide">Under Treatment</span>
            <HeartPulse className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-700">
            {data?.patients_under_treatment ?? 0}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">Active treatment bays</div>
        </div>

        {/* Available Beds */}
        <div className="bg-white p-3.5 rounded border border-ermDivider">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wide">Available Beds</span>
            <Bed className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">
            {data?.available_beds ?? 0} <span className="text-xs text-gray-400 font-normal">/ {data?.total_beds ?? 0}</span>
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">
            {data?.total_beds ? Math.round(((data.total_beds - data.available_beds) / data.total_beds) * 100) : 0}% capacity
          </div>
        </div>

        {/* Discharged Today */}
        <div className="bg-white p-3.5 rounded border border-ermDivider">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wide">Completed / Out</span>
            <CheckCircle2 className="w-4 h-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {data?.completed_today ?? 0}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">{data?.discharged_today ?? 0} discharged home</div>
        </div>
      </div>

      {/* Operational Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Arrivals Timeline Area Chart */}
        <div className="lg:col-span-2 bg-white p-4 rounded border border-ermDivider">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-semibold text-ermText uppercase tracking-wide">
                Patient Intake Trend (Last 12 Hours)
              </h3>
              <p className="text-[11px] text-ermMuted">Volume distribution by 2-hour arrival intervals</p>
            </div>
            <Activity className="w-4 h-4 text-gray-400" />
          </div>

          <div className="h-56 w-full">
            {data?.arrivals_timeline && data.arrivals_timeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.arrivals_timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="arrivalsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#345B49" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#345B49" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E3DC" />
                  <XAxis dataKey="time" stroke="#6B7268" fontSize={10} tickLine={false} />
                  <YAxis stroke="#6B7268" fontSize={10} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E5E3DC',
                      borderRadius: '6px',
                      fontSize: '11px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="arrivals"
                    stroke="#345B49"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#arrivalsGrad)"
                    name="Patient Arrivals"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                No arrival data logged for interval
              </div>
            )}
          </div>
        </div>

        {/* Triage Urgency Distribution */}
        <div className="bg-white p-4 rounded border border-ermDivider flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold text-ermText uppercase tracking-wide mb-1">
              Census Triage Breakdown
            </h3>
            <p className="text-[11px] text-ermMuted mb-3">All patients registered across urgency categories</p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={urgencyBarData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <XAxis type="number" stroke="#6B7268" fontSize={10} tickLine={false} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" stroke="#6B7268" fontSize={10} tickLine={false} width={65} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E5E3DC',
                      borderRadius: '6px',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {urgencyBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-ermDivider grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-gray-400">Avg Treatment: </span>
              <span className="font-semibold text-ermText">{data?.avg_treatment_time_minutes ?? 0}m</span>
            </div>
            <div>
              <span className="text-gray-400">Bed Occupancy: </span>
              <span className="font-semibold text-ermText">
                {data?.total_beds ? Math.round(((data.total_beds - data.available_beds) / data.total_beds) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Split: Binary Min-Heap Priority Queue Preview + Recent Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Min-Heap Queue Preview */}
        <div className="bg-white rounded border border-ermDivider overflow-hidden">
          <div className="p-4 border-b border-ermDivider flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-ermText uppercase tracking-wide">
                Active Priority Queue (Top 5 Root Positions)
              </h3>
              <p className="text-[11px] text-ermMuted">Order maintained strictly by Binary Min-Heap</p>
            </div>
            <button
              onClick={() => onNavigate('triage-queue')}
              className="text-xs font-medium text-ermBrand hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {data?.priority_queue_preview && data.priority_queue_preview.length > 0 ? (
              data.priority_queue_preview.map((item) => (
                <div
                  key={item.patient_id}
                  onClick={() => onSelectPatientId(item.patient_id)}
                  className="p-3 hover:bg-[#F9F8F5] cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-[10px] font-bold font-mono">
                      #{item.position}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-ermBrand">
                          {item.patient_id}
                        </span>
                        <span className="text-xs font-medium text-ermText">{item.name}</span>
                      </div>
                      <div className="text-[11px] text-gray-500 line-clamp-1 max-w-sm">
                        {item.complaint}
                      </div>
                    </div>
                  </div>

                  <TriageBadge level={item.triage_level} />
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-gray-400">
                Triage waiting queue is currently clear. No patients waiting.
              </div>
            )}
          </div>
        </div>

        {/* Recent Registrations Table */}
        <div className="bg-white rounded border border-ermDivider overflow-hidden">
          <div className="p-4 border-b border-ermDivider flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-ermText uppercase tracking-wide">
                Recent Patient Arrivals
              </h3>
              <p className="text-[11px] text-ermMuted">Latest intake records in SQLite database</p>
            </div>
            <button
              onClick={() => onNavigate('patient-records')}
              className="text-xs font-medium text-ermBrand hover:underline flex items-center gap-1"
            >
              <span>All Records</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {data?.recent_registrations && data.recent_registrations.length > 0 ? (
              data.recent_registrations.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectPatientId(p.id)}
                  className="p-3 hover:bg-[#F9F8F5] cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-gray-700">{p.id}</span>
                      <span className="text-xs font-medium text-ermText">{p.name}</span>
                      <span className="text-[10px] text-gray-400 font-mono">{p.time}</span>
                    </div>
                    <div className="text-[11px] text-gray-500 line-clamp-1 max-w-sm">
                      {p.complaint}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <TriageBadge level={p.triage_level} />
                    <PatientStatusBadge status={p.status} />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-gray-400">
                No recent arrivals recorded today.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
