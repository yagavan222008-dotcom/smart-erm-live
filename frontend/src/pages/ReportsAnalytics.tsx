import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  RefreshCw,
  Clock,
  Bed,
  Users,
  CheckCircle2,
  Calendar,
  FileSpreadsheet,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { api } from '../services/api';
import { DashboardSummary } from '../types';

export const ReportsAnalytics: React.FC = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await api.getReportsSummary();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const urgencyPieData = data
    ? [
        { name: 'Critical', value: data.urgency_distribution['Critical'] || 0, color: '#A83232' },
        { name: 'High', value: data.urgency_distribution['High'] || 0, color: '#B86635' },
        { name: 'Moderate', value: data.urgency_distribution['Moderate'] || 0, color: '#B18A37' },
        { name: 'Low', value: data.urgency_distribution['Low'] || 0, color: '#66816B' },
      ].filter((item) => item.value > 0)
    : [];

  const bedBarData = data
    ? [
        { name: 'Available', count: data.bed_status_breakdown['Available'] || 0, fill: '#345B49' },
        { name: 'Occupied', count: data.bed_status_breakdown['Occupied'] || 0, fill: '#B86635' },
        { name: 'Cleaning', count: data.bed_status_breakdown['Cleaning / Maintenance'] || 0, fill: '#B18A37' },
      ]
    : [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header & Export Toolbar */}
      <div className="bg-white p-4 rounded border border-ermDivider flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-ermText">
            Emergency Operational Analytics & Compliance Reports
          </h2>
          <p className="text-xs text-ermMuted">
            Aggregated clinical metrics derived from SQLite historical events and timestamps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={api.getExportCsvUrl()}
            download="smart_erm_patient_report.csv"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-ermBrand hover:bg-ermBrandHover rounded transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Dataset</span>
          </a>

          <button
            onClick={fetchReports}
            className="p-1.5 text-gray-500 hover:text-gray-700 border border-ermDivider rounded bg-white hover:bg-gray-50 transition-colors"
            title="Refresh reports"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded border border-ermDivider">
          <div className="text-[11px] font-semibold text-gray-400 uppercase">Average Queue Wait Time</div>
          <div className="text-2xl font-bold text-ermText mt-1">
            {data?.avg_wait_time_minutes ?? 0} <span className="text-xs font-normal text-gray-500">min</span>
          </div>
          <div className="text-[11px] text-gray-400 mt-1">Based on exact arrival timestamps</div>
        </div>

        <div className="bg-white p-4 rounded border border-ermDivider">
          <div className="text-[11px] font-semibold text-gray-400 uppercase">Average Treatment Time</div>
          <div className="text-2xl font-bold text-ermText mt-1">
            {data?.avg_treatment_time_minutes ?? 0} <span className="text-xs font-normal text-gray-500">min</span>
          </div>
          <div className="text-[11px] text-gray-400 mt-1">Episode duration start to complete</div>
        </div>

        <div className="bg-white p-4 rounded border border-ermDivider">
          <div className="text-[11px] font-semibold text-gray-400 uppercase">Bed Capacity Utilization</div>
          <div className="text-2xl font-bold text-ermText mt-1">
            {data?.total_beds
              ? Math.round(((data.total_beds - data.available_beds) / data.total_beds) * 100)
              : 0}
            %
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            {data?.total_beds ? data.total_beds - data.available_beds : 0} of {data?.total_beds ?? 0} beds in use
          </div>
        </div>

        <div className="bg-white p-4 rounded border border-ermDivider">
          <div className="text-[11px] font-semibold text-gray-400 uppercase">Discharge Throughput</div>
          <div className="text-2xl font-bold text-ermText mt-1">
            {data?.discharged_today ?? 0} <span className="text-xs font-normal text-gray-500">patients</span>
          </div>
          <div className="text-[11px] text-gray-400 mt-1">Successful care delivery today</div>
        </div>
      </div>

      {/* Two Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Triage Urgency Distribution Pie */}
        <div className="bg-white p-5 rounded border border-ermDivider space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-ermDivider">
            <h3 className="text-xs font-semibold text-ermText uppercase tracking-wider">
              Triage Urgency Census Share
            </h3>
            <span className="text-[11px] text-gray-400">Total volume</span>
          </div>

          <div className="h-64 w-full">
            {urgencyPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={urgencyPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {urgencyPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E5E3DC',
                      borderRadius: '6px',
                      fontSize: '11px',
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                No patient data registered yet.
              </div>
            )}
          </div>
        </div>

        {/* Bed Status Breakdown Bar Chart */}
        <div className="bg-white p-5 rounded border border-ermDivider space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-ermDivider">
            <h3 className="text-xs font-semibold text-ermText uppercase tracking-wider">
              Emergency Bay & Bed Inventory Status
            </h3>
            <span className="text-[11px] text-gray-400">{data?.total_beds ?? 0} total beds</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bedBarData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E3DC" />
                <XAxis dataKey="name" stroke="#6B7268" fontSize={11} tickLine={false} />
                <YAxis stroke="#6B7268" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E3DC',
                    borderRadius: '6px',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Beds Count">
                  {bedBarData.map((entry, index) => (
                    <Cell key={`cell-bed-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CSV Export Preview Table */}
      <div className="bg-white rounded border border-ermDivider p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-ermBrand" />
            <h3 className="text-xs font-semibold text-ermText uppercase tracking-wider">
              Operational Dataset Export Information
            </h3>
          </div>
          <a
            href={api.getExportCsvUrl()}
            download="smart_erm_patient_report.csv"
            className="text-xs font-medium text-ermBrand hover:underline inline-flex items-center gap-1"
          >
            <span>Download CSV</span>
            <Download className="w-3.5 h-3.5" />
          </a>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">
          The CSV dataset contains comprehensive clinical auditing rows: Patient ID, Full Name, Age, Gender, Triage Urgency, Monotonic Arrival Sequence, Arrival Timestamps, Status, Doctor Allocation, Bed Allocation, and Discharge Times. Compatible with Microsoft Excel, pandas, and institutional EHR reporting tools.
        </p>
      </div>
    </div>
  );
};
