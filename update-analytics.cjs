const fs = require('fs');

const content = `import React, { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api.ts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ComposedChart } from 'recharts';
import { Activity, Package, TrendingUp, AlertCircle, Clock, ScanBarcode, CheckCircle2, Download, Filter, FileText, Bell, Zap, Users, BarChart3, Database } from 'lucide-react';
import { BatchEngineWidget } from './BatchEngineWidget.tsx';

// --- Interfaces ---
interface DailyFulfillment { date: string; orders: number; returns: number; }
interface StockDistribution { district: string; stock: number; }
interface Productivity { department: string; itemsProcessed: number; }
interface ActivityLog { id: number; action: string; timestamp: string; userName: string; }
interface KPIMetrics { totalShippedUnits: number; avgDockWaitTime: number; scannerDowntime: number; }

export function AnalyticsScreen() {
  const [dailyData, setDailyData] = useState<DailyFulfillment[]>([]);
  const [stockData, setStockData] = useState<StockDistribution[]>([]);
  const [productivity, setProductivity] = useState<Productivity[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [kpis, setKpis] = useState<KPIMetrics | null>(null);
  const [hasHighTrafficAlert, setHasHighTrafficAlert] = useState(false);
  
  // --- New Feature States ---
  const [alertsEnabled, setAlertsEnabled] = useState({ delay: true, defect: false, capacity: true });
  
  // Mock Data for new widgets (keeps stable structure)
  const throughputData = Array.from({ length: 12 }).map((_, i) => ({
    time: \`\${10 + i}:00\`,
    receiving: Math.floor(Math.random() * 50) + 50,
    packing: Math.floor(Math.random() * 80) + 100,
    loading: Math.floor(Math.random() * 60) + 70,
  }));
  
  const bottleneckData = [
    { station: 'Dock 1 (Receiving)', queue: 15 },
    { station: 'Pack Station 3', queue: 45 },
    { station: 'QC Desk A', queue: 8 },
    { station: 'Loading Bay 4', queue: 28 },
  ];
  const maxQueue = [...bottleneckData].sort((a, b) => b.queue - a.queue)[0];

  const employeePickRates = [
    { name: 'Amit K.', rate: 145 },
    { name: 'Priya S.', rate: 162 },
    { name: 'Rahul V.', rate: 128 },
    { name: 'Neha M.', rate: 155 },
    { name: 'Team Avg', rate: 142 },
  ];

  const shiftUtilization = [
    { name: 'Active Picking', value: 65, fill: '#10b981' },
    { name: 'Packing', value: 20, fill: '#3b82f6' },
    { name: 'Idle/Wait', value: 10, fill: '#f59e0b' },
    { name: 'Break', value: 5, fill: '#ef4444' }
  ];

  const stockDepletion = Array.from({ length: 6 }).map((_, i) => ({
    batch: \`Batch - \${i * 30}m\`,
    incoming: Math.floor(Math.random() * 500) + 200,
    outgoing: Math.floor(Math.random() * 600) + 300,
    forecast: Math.floor(Math.random() * 400) + 150,
  }));

  const storageUtilization = [
    { name: 'High-Density Shelving', occupied: 85, free: 15 },
    { name: 'Standard Racks', occupied: 60, free: 40 },
    { name: 'HazMat Lockers', occupied: 45, free: 55 },
    { name: 'Bulk Floor', occupied: 90, free: 10 },
  ];

  useEffect(() => {
    const alertCreatedAt = new Date('2026-08-10T21:26:54-07:00').getTime();
    const twoHoursMs = 2 * 60 * 60 * 1000;
    if (Date.now() < alertCreatedAt + twoHoursMs) {
      setHasHighTrafficAlert(true);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [metricsRes, logsRes] = await Promise.all([
          fetchApi('/analytics/metrics'),
          fetchApi('/activity-logs')
        ]);
        setDailyData(metricsRes.dailyFulfillment);
        setStockData(metricsRes.stockDistribution);
        setProductivity(metricsRes.productivity);
        setKpis(metricsRes.kpis);
        setActivityLogs(logsRes);
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
    window.addEventListener('auto-refresh', loadData);
    return () => window.removeEventListener('auto-refresh', loadData);
  }, []);

  const handleExport = (type: 'csv' | 'pdf') => {
    alert(\`Exporting executive summary as \${type.toUpperCase()}...\`);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#ff7300'];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <BatchEngineWidget />

      {/* Header & Export Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <Activity className="text-indigo-600 h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Advanced Analytics & Reporting</h2>
            <p className="text-sm text-gray-500">Real-time throughput, labor performance, and predictive insights</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleExport('csv')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors">
            <FileText className="h-4 w-4 text-gray-500" />
            Export CSV
          </button>
          <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors shadow-sm">
            <Download className="h-4 w-4" />
            Executive PDF
          </button>
        </div>
      </div>

      {/* Threshold Alerts Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Bell className="h-5 w-5 text-amber-500" />
          Active Alert Thresholds:
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={alertsEnabled.delay} onChange={(e) => setAlertsEnabled(p => ({...p, delay: e.target.checked}))} className="rounded text-indigo-600 focus:ring-indigo-500" />
          <span className="text-sm text-gray-600">Order Delays > 15m</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={alertsEnabled.defect} onChange={(e) => setAlertsEnabled(p => ({...p, defect: e.target.checked}))} className="rounded text-indigo-600 focus:ring-indigo-500" />
          <span className="text-sm text-gray-600">Defect Rate > 2%</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={alertsEnabled.capacity} onChange={(e) => setAlertsEnabled(p => ({...p, capacity: e.target.checked}))} className="rounded text-indigo-600 focus:ring-indigo-500" />
          <span className="text-sm text-gray-600">Storage Capacity > 90%</span>
        </label>
      </div>

      {/* KPI Overview (Existing) */}
      {kpis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="text-green-500 h-5 w-5" />
              <h3 className="font-semibold text-gray-700">Total Shipped Units</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{kpis.totalShippedUnits.toLocaleString()}</p>
            <p className="text-sm text-green-600 flex items-center mt-1"><TrendingUp className="h-4 w-4 mr-1" /> +12% from last week</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="text-red-500 h-5 w-5" />
              <h3 className="font-semibold text-gray-700">Avg Return Rate</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {dailyData.length > 0 ? ((dailyData.reduce((acc, curr) => acc + curr.returns, 0) / dailyData.reduce((acc, curr) => acc + curr.orders, 0)) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-sm text-gray-500 mt-1">Based on last 7 days</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Database className="text-purple-500 h-5 w-5" />
              <h3 className="font-semibold text-gray-700">Highest Active Hub</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stockData.length > 0 ? stockData.reduce((prev, current) => (prev.stock > current.stock) ? prev : current).district : 'N/A'}
            </p>
            <p className="text-sm text-gray-500 mt-1">Based on current stock holding</p>
          </div>
        </div>
      )}

      {/* 1. Real-Time Throughput & Bottleneck Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2"><Zap className="h-5 w-5 text-amber-500" /> Live Throughput Velocity</h3>
            <span className="flex h-3 w-3"><span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={throughputData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                  <linearGradient id="colorPack" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                  <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient>
                </defs>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="receiving" name="Receiving" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRec)" strokeWidth={2} />
                <Area type="monotone" dataKey="packing" name="Packing" stroke="#10b981" fillOpacity={1} fill="url(#colorPack)" strokeWidth={2} />
                <Area type="monotone" dataKey="loading" name="Loading" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorLoad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2"><AlertCircle className="h-5 w-5 text-red-500" /> Active Bottlenecks</h3>
          <div className="space-y-4">
            {bottleneckData.map((station, idx) => (
              <div key={idx} className="relative">
                <div className="flex justify-between text-sm mb-1">
                  <span className={\`font-medium \${station.station === maxQueue.station ? 'text-red-600' : 'text-gray-700'}\`}>{station.station}</span>
                  <span className="text-gray-500">{station.queue} in queue</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div className={\`h-2 rounded-full \${station.station === maxQueue.station ? 'bg-red-500 animate-pulse' : 'bg-indigo-400'}\`} style={{ width: \`\${Math.min((station.queue / 50) * 100, 100)}%\` }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-lg">
            <p className="text-xs text-red-700 font-medium leading-relaxed">
              <strong>Alert:</strong> {maxQueue.station} is experiencing severe delays. Consider reallocating 2 associates from Receiving.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Labor & Workforce Productivity Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2"><Users className="h-5 w-5 text-blue-500" /> Top Pick-Rate Performance (UPH)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={employeePickRates} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <YAxis dataKey="name" type="category" width={80} axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 13, fontWeight: 500}} />
                <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="rate" name="Units/Hr" radius={[0, 4, 4, 0]} barSize={28}>
                  {employeePickRates.map((entry, index) => (
                    <Cell key={\`cell-\${index}\`} fill={entry.name === 'Team Avg' ? '#94a3b8' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2"><Clock className="h-5 w-5 text-emerald-500" /> Active Shift Utilization</h3>
          <div className="h-72 flex flex-col sm:flex-row items-center justify-center">
            <ResponsiveContainer width="100%" height="100%" className="flex-1">
              <PieChart>
                <Pie data={shiftUtilization} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={2} dataKey="value">
                  {shiftUtilization.map((entry, index) => <Cell key={\`cell-\${index}\`} fill={entry.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-3 justify-center sm:w-1/3 w-full pl-4 mt-4 sm:mt-0">
              {shiftUtilization.map((entry, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.fill }}></div>
                  <span className="text-sm font-medium text-gray-700">{entry.name}</span>
                  <span className="text-sm font-bold text-gray-900 ml-auto">{entry.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Inventory Turnover & Cost Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-indigo-500" /> Live Inventory Turnover & Forecast</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={stockDepletion} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="batch" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" />
                <Bar dataKey="incoming" name="Incoming Stock" fill="#818cf8" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="outgoing" name="Outgoing Shipments" fill="#f472b6" radius={[4, 4, 0, 0]} barSize={20} />
                <Line type="monotone" dataKey="forecast" name="Depletion Forecast" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2"><BarChart3 className="h-5 w-5 text-teal-500" /> Storage Space Utilization Breakdown</h3>
          <div className="space-y-6 mt-8">
            {storageUtilization.map((zone, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-gray-800">{zone.name}</span>
                  <div className="flex gap-4">
                    <span className="text-gray-500"><span className="text-teal-600 font-bold">{zone.occupied}%</span> Used</span>
                    <span className="text-gray-400">{zone.free}% Free</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden flex">
                  <div className="bg-teal-500 h-3" style={{ width: \`\${zone.occupied}%\` }}></div>
                  <div className="bg-gray-100 h-3" style={{ width: \`\${zone.free}%\` }}></div>
                </div>
              </div>
            ))}
            {alertsEnabled.capacity && (
              <div className="flex items-center gap-2 mt-6 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                <AlertCircle className="h-4 w-4" />
                Warning: Bulk Floor capacity is nearing the 90% threshold limit.
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
`;

fs.writeFileSync('src/components/AnalyticsScreen.tsx', content);
