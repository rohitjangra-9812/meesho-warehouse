import React, { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api.ts';
import { Briefcase, Building2, Phone, Mail, Calendar, Camera, Activity, AlertTriangle, IndianRupee, Users, ArrowUpRight, ArrowDownRight, Clock, ShieldCheck, DoorClosed, CheckCircle2 } from 'lucide-react';

interface Leader {
  id: number;
  name: string;
  role: string;
  mobile: string;
  email: string;
  officeLocation: string;
  responsibilities: string;
  dateOfJoining: string;
}

interface DashboardData {
  financial: {
    totalBalance: number;
    dailyRevenue: number;
    operationalEx: number;
  };
  dockDoors: { id: number; doorNumber: string; status: string; currentVehicleId: number | null }[];
  workforce: {
    present: number;
    total: number;
  };
  alerts: { id: number; type: string; message: string }[];
  recentLogs: { id: number; action: string; timestamp: string; userName: string }[];
}

export function ManagementScreen() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const cameras = [
    { 
      id: 1, 
      name: 'Main Dock (Gate 1)', 
      description: 'Incoming carrier vehicle staging',
      videoUrl: 'https://www.youtube.com/embed/c9Jy5yk0_lQ?autoplay=1&mute=1&controls=0&loop=1&playlist=c9Jy5yk0_lQ&playsinline=1'
    },
    { 
      id: 2, 
      name: 'Dispatch Zone (Gate 2)', 
      description: 'Outbound courier handovers',
      videoUrl: 'https://www.youtube.com/embed/_nm1Yb8sxxY?autoplay=1&mute=1&controls=0&loop=1&playlist=_nm1Yb8sxxY&playsinline=1'
    },
    { 
      id: 3, 
      name: 'Inventory Aisle (Zone A)', 
      description: 'High-density shelving racks',
      videoUrl: 'https://www.youtube.com/embed/ODM8ZHx8w3g?autoplay=1&mute=1&controls=0&loop=1&playlist=ODM8ZHx8w3g&playsinline=1'
    },
    { 
      id: 4, 
      name: 'Quality Check (QC Area)', 
      description: 'Return inspection & scanning',
      videoUrl: 'https://www.youtube.com/embed/Cs6cbu1BDxo?autoplay=1&mute=1&controls=0&loop=1&playlist=Cs6cbu1BDxo&playsinline=1'
    }
  ];
  const [activeCamera, setActiveCamera] = useState(cameras[0]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [managementData, dashboardData] = await Promise.all([
        fetchApi('/management'),
        fetchApi('/management/dashboard')
      ]);
      setLeaders(managementData);
      setDashboard(dashboardData);
    } catch (err) {
      console.error('Failed to load management data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // refresh dashboard every 30s
    return () => clearInterval(interval);
    window.addEventListener('auto-refresh', fetchData);
  return () => window.removeEventListener('auto-refresh', fetchData);
}, []);

  const handleSeed = async () => {
    try {
      setLoading(true);
      await fetchApi('/management/seed', { method: 'POST' });
      await fetchData();
      alert("Successfully seeded management directory!");
    } catch (err) {
      alert("Failed to seed management directory");
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <Briefcase className="text-indigo-600 h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Executive Dashboard & Management</h2>
            <p className="text-sm text-gray-500">Warehouse Operations & Leadership Directory</p>
          </div>
        </div>
        <button 
          onClick={handleSeed}
          disabled={loading}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          Seed Directory
        </button>
      </div>

      {dashboard && (
        <div className="space-y-6">
          {/* Executive KPI & Financial Summary Widget */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Treasury Bank Balance</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(dashboard.financial.totalBalance)}</h3>
                </div>
                <div className="bg-green-100 p-2 rounded-lg">
                  <IndianRupee className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                <span>+2.4% from yesterday</span>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Daily Revenue Generation</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(dashboard.financial.dailyRevenue)}</h3>
                </div>
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-blue-600">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                <span>Active fulfillment running</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Operational Expenditures</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(dashboard.financial.operationalEx)}</h3>
                </div>
                <div className="bg-orange-100 p-2 rounded-lg">
                  <ArrowDownRight className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-orange-600">
                <span>Within acceptable limit</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              {/* Real-Time Facility CCTV & Dock Gate Feed */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-gray-500" />
                    Live Facility & Dock Feeds
                  </h3>
                  <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                    LIVE
                  </span>
                </div>
                <div className="p-4">
                  {/* Active Stream Viewer (CCTV Mode) */}
                  <div className="mb-4 bg-black rounded-lg overflow-hidden relative aspect-video flex items-center justify-center">
                    {/* CCTV Scanlines & Vignette Overlay */}
                    <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(rgba(255,255,255,0.03)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-70"></div>
                    <div className="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_80px_rgba(0,0,0,0.9)]"></div>
                    
                    <div className="absolute top-3 left-3 flex flex-col gap-1 z-20">
                      <div className="bg-black/60 text-green-400 font-mono text-xs px-2 py-1 rounded backdrop-blur-sm uppercase tracking-wider">
                        CAM 0{activeCamera.id} - {activeCamera.name}
                      </div>
                      <div className="bg-black/60 text-green-400 font-mono text-[10px] px-2 py-1 rounded backdrop-blur-sm tracking-widest">
                        {new Date().toISOString().replace('T', ' ').substring(0, 19)}
                      </div>
                    </div>
                    
                    {/* Dynamically keying the iframe so changing activeCamera forces a re-render */}
                    <iframe 
                      key={activeCamera.id}
                      src={activeCamera.videoUrl} 
                      className="w-full h-full object-cover pointer-events-none scale-105 filter grayscale contrast-125 brightness-75 sepia-[.3] hue-rotate-[180deg] mix-blend-screen opacity-90"
                      allow="autoplay; encrypted-media"
                      frameBorder="0"
                    />
                    
                    <div className="absolute top-3 right-3 flex items-center space-x-2 z-20 bg-black/50 px-2 py-1 rounded">
                      <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                      <span className="text-[10px] font-mono text-red-500 font-bold tracking-widest animate-pulse">REC</span>
                    </div>
                  </div>

                  {/* Camera Selector Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {cameras.map((cam) => (
                      <button
                        key={cam.id}
                        onClick={() => setActiveCamera(cam)}
                        className={`p-3 text-left rounded-lg border transition-all ${
                          activeCamera.id === cam.id 
                            ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-semibold text-sm text-gray-900">{cam.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{cam.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Audit Trail & Activity Logs Viewer */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-gray-500" />
                    Recent Activity Logs
                  </h3>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    {dashboard.recentLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                        <div className="bg-gray-100 p-2 rounded-full mt-1">
                          <Activity className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{log.action}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                            <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                              {log.userName || 'System'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {dashboard.recentLogs.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No recent activity found.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Live Exception & Alert Center */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-gray-500" />
                    Live Exception Center
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  {dashboard.alerts.map((alert) => (
                    <div key={alert.id} className={`p-3 rounded-lg flex items-start gap-3 border ${
                      alert.type === 'error' ? 'bg-red-50 border-red-100 text-red-800' :
                      alert.type === 'warning' ? 'bg-orange-50 border-orange-100 text-orange-800' :
                      'bg-blue-50 border-blue-100 text-blue-800'
                    }`}>
                      <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                        alert.type === 'error' ? 'text-red-500' :
                        alert.type === 'warning' ? 'text-orange-500' :
                        'text-blue-500'
                      }`} />
                      <p className="text-sm font-medium">{alert.message}</p>
                    </div>
                  ))}
                  {dashboard.alerts.length === 0 && (
                    <div className="p-4 text-center bg-gray-50 rounded-lg border border-gray-100">
                      <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">All systems operating normally.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Automated Shift & Attendance Audit */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-gray-500" />
                    Workforce Overview
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-3xl font-bold text-gray-900">{dashboard.workforce.present}</p>
                      <p className="text-sm font-medium text-gray-500">Currently Present</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-gray-900">{dashboard.workforce.total}</p>
                      <p className="text-sm font-medium text-gray-500">Total Active</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full transition-all" 
                      style={{ width: `${dashboard.workforce.total > 0 ? (dashboard.workforce.present / dashboard.workforce.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {dashboard.workforce.total > 0 ? Math.round((dashboard.workforce.present / dashboard.workforce.total) * 100) : 0}% Attendance Rate
                  </p>
                </div>
              </div>

              {/* Dock Status Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <DoorClosed className="w-5 h-5 text-gray-500" />
                    Dock Utilization
                  </h3>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Available</span>
                      <span className="font-medium text-green-600">{dashboard.dockDoors.filter(d => d.status === 'Available').length} Doors</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Occupied</span>
                      <span className="font-medium text-orange-600">{dashboard.dockDoors.filter(d => d.status === 'Occupied').length} Doors</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Maintenance</span>
                      <span className="font-medium text-red-600">{dashboard.dockDoors.filter(d => d.status === 'Maintenance').length} Doors</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leadership Directory Section */}
      <h3 className="text-lg font-bold text-gray-900 pt-4">Leadership Directory</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leaders.map(leader => (
          <div key={leader.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">{leader.name}</h3>
              <p className="text-sm font-semibold text-indigo-600 mt-1">{leader.role}</p>
            </div>
            
            <div className="space-y-3 mb-6 flex-1">
              {leader.dateOfJoining && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span className="text-sm text-gray-700">Appointed: <span className="font-medium">{new Date(leader.dateOfJoining).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></span>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                <span className="text-sm text-gray-700 font-medium">{leader.mobile}</span>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                <span className="text-sm text-gray-700">{leader.email}</span>
              </div>
              <div className="flex items-start gap-3">
                <Building2 className="w-4 h-4 text-gray-400 mt-0.5" />
                <span className="text-sm text-gray-700">{leader.officeLocation}</span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 mt-auto">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Responsibilities</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{leader.responsibilities}</p>
            </div>
          </div>
        ))}
        {leaders.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-200">
            No management records found.
          </div>
        )}
      </div>
    </div>
  );
}
