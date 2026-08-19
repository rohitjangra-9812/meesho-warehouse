const fs = require('fs');
const code = `
import React, { useEffect, useState } from 'react';
import { fetchApi } from '../lib/api.ts';
import { Activity, Package, ArrowUpRight, ArrowDownRight, Truck, LayoutGrid, List, AlertTriangle, Wrench, ShieldAlert } from 'lucide-react';

export function DashboardScreen() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'floorplan'>('list');
  const [dismissAlert, setDismissAlert] = useState(false);

  useEffect(() => {
    fetchApi('/dashboard/stats')
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { title: 'Pending Orders', value: stats?.pendingOrders || '1,204', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Throughput Today', value: stats?.throughput || '8,432', icon: Activity, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Inbound Shipments', value: stats?.inbound || '24', icon: ArrowDownRight, color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'Active Dispatches', value: stats?.dispatches || '12', icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const recentActivities = [
    { id: 1, action: 'Wave WAVE-1092 completed', zone: 'Zone A', time: '2 mins ago', status: 'success' },
    { id: 2, action: 'Inbound shipment S-992 arrived', zone: 'Dock 4', time: '15 mins ago', status: 'info' },
    { id: 3, action: 'High vibration detected on CV-02', zone: 'Main Conveyor', time: '28 mins ago', status: 'error' },
    { id: 4, action: 'Picker-7 started break', zone: 'Breakroom', time: '1 hour ago', status: 'default' },
    { id: 5, action: 'AMR-04 battery low, returning to dock', zone: 'Zone C', time: '1 hour ago', status: 'warning' },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-sm text-gray-500 mt-1">Live metrics and warehouse KPIs</p>
        </div>
        
        {/* Toggle View Buttons */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('list')}
            className={\`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors \${
              viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }\`}
          >
            <List size={16} /> List View
          </button>
          <button
            onClick={() => setViewMode('floorplan')}
            className={\`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors \${
              viewMode === 'floorplan' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }\`}
          >
            <LayoutGrid size={16} /> Floor Plan
          </button>
        </div>
      </div>

      {/* Global Maintenance Alert */}
      {!dismissAlert && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm flex items-start gap-4">
          <div className="bg-red-100 p-2 rounded-full text-red-600 mt-0.5">
            <ShieldAlert size={20} />
          </div>
          <div className="flex-1">
            <h4 className="text-red-800 font-bold">Critical Maintenance Alert: Conveyor Motor CV-02</h4>
            <p className="text-red-600 text-sm mt-1 font-medium">High frequency resonance and vibration detected in main drive shaft. Estimated time to failure: 2.4 Hours. Maintenance tech dispatch recommended immediately.</p>
          </div>
          <button 
            onClick={() => setDismissAlert(true)}
            className="text-red-400 hover:text-red-600 font-bold text-sm px-3 py-1 bg-red-100/50 rounded"
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className={\`\${card.bg} p-4 rounded-xl\`}>
                <Icon className={\`w-6 h-6 \${card.color}\`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{card.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Area based on View Mode */}
      {viewMode === 'list' ? (
        <div className="grid lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Live Activity Feed</h3>
            <div className="space-y-4 flex-1">
              {recentActivities.map(activity => (
                <div key={activity.id} className="flex items-start gap-4 p-4 border border-gray-50 bg-gray-50/50 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className={\`p-2 rounded-full \${
                    activity.status === 'success' ? 'bg-green-100 text-green-600' :
                    activity.status === 'error' ? 'bg-red-100 text-red-600' :
                    activity.status === 'warning' ? 'bg-orange-100 text-orange-600' :
                    activity.status === 'info' ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-200 text-gray-600'
                  }\`}>
                    {activity.status === 'error' ? <AlertTriangle size={16} /> :
                     activity.status === 'success' ? <Activity size={16} /> :
                     activity.status === 'warning' ? <Wrench size={16} /> :
                     <Activity size={16} />}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{activity.action}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-medium text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">{activity.zone}</span>
                      <span className="text-xs text-gray-400">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 font-semibold text-sm rounded-lg border border-gray-200 transition-colors">
              View All Logs
            </button>
          </div>
          
          <div className="bg-slate-900 text-white rounded-2xl shadow-sm p-6 flex flex-col">
            <div className="flex items-center gap-2 text-blue-400 mb-6">
              <Activity size={20} />
              <h3 className="text-lg font-bold text-white tracking-wide">System Health</h3>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">AMR Fleet Status</span>
                  <span className="text-green-400 font-bold">92% Active</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Main Conveyor Load</span>
                  <span className="text-orange-400 font-bold">85% Capacity</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Network Telemetry</span>
                  <span className="text-green-400 font-bold">99.9% Uptime</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-slate-800 rounded-xl border border-slate-700">
              <h4 className="text-sm font-bold text-slate-200 mb-2">Active Shifts</h4>
              <p className="text-2xl font-black text-white">142 <span className="text-sm font-medium text-slate-400 ml-1">Staff On-Floor</span></p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Virtual Floor Plan: Operations Map</h3>
            <div className="flex gap-4 text-xs font-semibold">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div> Optimal</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div> Warning</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-100 border border-red-500 rounded animate-pulse"></div> Critical Alert</div>
            </div>
          </div>
          
          <div className="relative w-full h-[600px] bg-slate-50 border border-slate-200 rounded-xl overflow-hidden p-6 shadow-inner">
            {/* Grid Pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-50" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
            
            {/* Receiving Dock */}
            <div className="absolute top-0 left-0 w-48 h-full bg-gray-200/50 border-r-2 border-gray-300 flex flex-col items-center justify-around py-8">
              <div className="rotate-[-90deg] whitespace-nowrap font-bold text-gray-500 tracking-widest uppercase">Receiving Docks</div>
              {[1,2,3,4].map(dock => (
                <div key={dock} className="w-full h-16 border-y border-r border-gray-400 bg-white shadow-sm flex items-center justify-center font-bold text-gray-700">Dock {dock}</div>
              ))}
            </div>

            {/* Storage Zones */}
            <div className="absolute top-12 left-64 w-64 h-48 bg-blue-50 border-2 border-blue-200 rounded-lg shadow-sm flex flex-col items-center justify-center">
              <span className="font-bold text-blue-800 text-lg">Zone A</span>
              <span className="text-xs text-blue-600 font-semibold mt-1 bg-blue-100 px-2 py-1 rounded">Fast Pick / High Velocity</span>
              <div className="mt-4 flex gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse"></div>
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              </div>
            </div>
            
            <div className="absolute top-12 left-[36rem] w-64 h-48 bg-blue-50 border-2 border-blue-200 rounded-lg shadow-sm flex flex-col items-center justify-center">
              <span className="font-bold text-blue-800 text-lg">Zone B</span>
              <span className="text-xs text-blue-600 font-semibold mt-1 bg-blue-100 px-2 py-1 rounded">Medium Velocity</span>
            </div>
            
            <div className="absolute top-72 left-64 w-64 h-48 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute top-2 right-2 text-orange-600 bg-orange-200 px-2 py-0.5 rounded text-[10px] font-bold">Congestion: 85%</div>
              <span className="font-bold text-orange-800 text-lg">Zone C</span>
              <span className="text-xs text-orange-700 font-semibold mt-1 bg-orange-100 px-2 py-1 rounded">Heavy Pallets</span>
            </div>
            
            <div className="absolute top-72 left-[36rem] w-64 h-48 bg-slate-100 border-2 border-slate-300 rounded-lg shadow-sm flex flex-col items-center justify-center">
              <span className="font-bold text-slate-700 text-lg">Zone D</span>
              <span className="text-xs text-slate-500 font-semibold mt-1 bg-slate-200 px-2 py-1 rounded">Deep Storage (Cold)</span>
            </div>

            {/* Main Conveyor Belt with Maintenance Alert */}
            <div className="absolute top-[35rem] left-64 right-64 h-16 bg-gradient-to-r from-red-100 to-red-50 border-4 border-red-500 border-dashed rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse z-10">
              <div className="flex items-center gap-3 bg-red-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg">
                <Wrench className="animate-bounce" /> 
                <span>CRITICAL MAINTENANCE: CV-02 MAIN DRIVE</span>
              </div>
            </div>
            <div className="absolute top-[35.5rem] left-[45rem] bg-slate-900 text-white text-xs p-3 rounded-lg shadow-xl z-20 font-mono w-64 pointer-events-none">
              <div className="text-red-400 font-bold mb-1">VIBRATION ANOMALY</div>
              <div className="flex justify-between"><span>Status:</span><span className="text-red-400">Failing</span></div>
              <div className="flex justify-between"><span>TTF:</span><span>2.4 Hrs</span></div>
              <div className="flex justify-between border-t border-slate-700 mt-2 pt-2"><span>Tech:</span><span className="text-yellow-400">Dispatched</span></div>
            </div>

            {/* Dispatch Dock */}
            <div className="absolute top-0 right-0 w-48 h-full bg-green-50 border-l-2 border-green-200 flex flex-col items-center justify-around py-8">
              <div className="rotate-[-90deg] whitespace-nowrap font-bold text-green-700 tracking-widest uppercase">Dispatch / Packing</div>
              <div className="flex flex-col gap-4 w-full px-4">
                {[1,2,3].map(station => (
                  <div key={station} className="w-full h-24 bg-white border-2 border-green-300 rounded-lg shadow-sm flex flex-col items-center justify-center font-bold text-green-800">
                    <Package size={20} className="mb-1 text-green-600" />
                    Pack {station}
                  </div>
                ))}
              </div>
            </div>
            
            {/* AMRs */}
            <div className="absolute top-64 left-[34rem] w-8 h-8 bg-purple-600 rounded-full shadow-lg flex items-center justify-center text-white border-2 border-white z-20 transition-all">
              <Truck size={14} />
            </div>
            <div className="absolute top-32 left-[30rem] w-8 h-8 bg-purple-600 rounded-full shadow-lg flex items-center justify-center text-white border-2 border-white z-20 transition-all">
              <Truck size={14} />
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
`;
fs.writeFileSync('src/components/DashboardScreen.tsx', code);
