import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Megaphone, 
  Sliders, 
  Users, 
  History, 
  AlertTriangle, 
  Power, 
  Pin, 
  CheckCircle2, 
  Search, 
  Plus, 
  Trash2, 
  Lock, 
  RefreshCw, 
  Radio, 
  Settings,
  ShieldAlert,
  UserCheck,
  Server,
  Cpu,
  HardDrive,
  Activity,
  Terminal,
  Play,
  Pause,
  Zap,
  Wifi,
  Database
} from 'lucide-react';

interface BroadcastItem {
  id: string;
  title: string;
  type: 'announcement' | 'sla_alert' | 'maintenance' | 'critical_order';
  target: string;
  timestamp: string;
  active: boolean;
}

interface StaffRole {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Dock Lead' | 'Picker' | 'Security';
  status: 'Active' | 'On Break' | 'Offline';
  terminal: string;
}

interface AuditEvent {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  category: 'Security' | 'Override' | 'Login' | 'Broadcast' | 'Infrastructure';
  status: 'Success' | 'Warning' | 'Critical';
}

interface ServerLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'SUCCESS' | 'ERROR';
  service: string;
  message: string;
}

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'controls' | 'broadcasts' | 'roles' | 'audit' | 'infrastructure'>('controls');
  
  // System Controls State
  const [emergencyHalt, setEmergencyHalt] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [customerApiMaintenance, setCustomerApiMaintenance] = useState(false);
  const [rateLimit, setRateLimit] = useState(2500);
  const [telemetrySpeed, setTelemetrySpeed] = useState('Standard (10s)');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Infrastructure & Server State
  const [cpuLoad, setCpuLoad] = useState(34.2);
  const [ramUsage, setRamUsage] = useState(6.2); // GB out of 16 GB
  const [activeWs, setActiveWs] = useState(1420);
  const [httpReqSec, setHttpReqSec] = useState(1850);
  const [isLogsPaused, setIsLogsPaused] = useState(false);
  const [logSearchQuery, setLogSearchQuery] = useState('');
  
  const [serverLogs, setServerLogs] = useState<ServerLog[]>([
    { id: 'LOG-881', timestamp: '08:12:45', level: 'SUCCESS', service: 'Core API', message: 'HTTP 200 GET /api/v1/warehouse/throughput - 14ms' },
    { id: 'LOG-880', timestamp: '08:12:42', level: 'INFO', service: 'WebSocket Influx', message: 'Streamed batch #9821 metrics to 1,420 connected terminals' },
    { id: 'LOG-879', timestamp: '08:12:38', level: 'WARN', service: 'Scan Gateway', message: 'Zone B Handheld scanner latency spiked to 42ms' },
    { id: 'LOG-878', timestamp: '08:12:30', level: 'SUCCESS', service: 'PostgreSQL DB', message: 'Replica sync completed. Lag: 1.4ms. Pool connections: 48/100' },
    { id: 'LOG-877', timestamp: '08:12:15', level: 'INFO', service: 'Auth Service', message: 'Token verified for admin@meesho.com (Master Clearance)' },
  ]);

  // Periodic live server stats simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setCpuLoad(prev => Number((Math.min(95, Math.max(15, prev + (Math.random() * 6 - 3)))).toFixed(1)));
      setRamUsage(prev => Number((Math.min(14, Math.max(5, prev + (Math.random() * 0.4 - 0.2)))).toFixed(1)));
      setActiveWs(prev => Math.floor(prev + (Math.random() * 20 - 10)));
      setHttpReqSec(prev => Math.floor(Math.min(5000, Math.max(500, prev + (Math.random() * 100 - 50)))));

      if (!isLogsPaused && Math.random() > 0.6) {
        const services = ['Core API', 'WebSocket Influx', 'Scan Gateway', 'PostgreSQL DB', 'Redis Cache'];
        const levels: ('INFO' | 'SUCCESS' | 'WARN')[] = ['INFO', 'SUCCESS', 'WARN'];
        const randomService = services[Math.floor(Math.random() * services.length)];
        const randomLevel = levels[Math.floor(Math.random() * levels.length)];
        const now = new Date().toTimeString().split(' ')[0];
        
        let msg = 'Routine health ping OK';
        if (randomService === 'Core API') msg = `HTTP 200 POST /api/v1/orders/dispatch - 18ms`;
        if (randomService === 'WebSocket Influx') msg = `Heartbeat acknowledged by ${Math.floor(Math.random() * 50 + 1400)} nodes`;
        if (randomService === 'Scan Gateway') msg = `Barcode scanned SKU-FASH-8812 at Zone A Dock 02`;
        if (randomService === 'PostgreSQL DB') msg = `Transaction committed in 3.2ms (Row locks: 0)`;
        if (randomService === 'Redis Cache') msg = `Cache hit ratio 99.4% (Keys: 48,120)`;

        setServerLogs(prev => [
          { id: `LOG-${Math.floor(Math.random() * 9000 + 1000)}`, timestamp: now, level: randomLevel, service: randomService, message: msg },
          ...prev.slice(0, 25)
        ]);
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [isLogsPaused]);

  // Broadcasts State
  const [broadcasts, setBroadcasts] = useState<BroadcastItem[]>([
    { id: 'BRD-01', title: '🚨 URGENT: Zone A Conveyor Belt 3 Maintenance Window Active', type: 'maintenance', target: 'All Floors', timestamp: 'Today, 08:15 AM', active: true },
    { id: 'BRD-02', title: '⭐ Priority Dispatch: Batch #9821 Express Orders Must Clear by 11:00 AM', type: 'critical_order', target: 'Dock 02 & 04', timestamp: 'Today, 07:45 AM', active: true },
    { id: 'BRD-03', title: '⚠️ SLA Warning: Delhi NCR Route Cutoff in 18 minutes', type: 'sla_alert', target: 'Outbound Dispatch', timestamp: 'Today, 08:00 AM', active: true }
  ]);
  const [newBroadcastTitle, setNewBroadcastTitle] = useState('');
  const [newBroadcastType, setNewBroadcastType] = useState<'announcement' | 'sla_alert' | 'maintenance' | 'critical_order'>('announcement');
  const [newBroadcastTarget, setNewBroadcastTarget] = useState('All Terminals');

  // Staff Roles State
  const [staff, setStaff] = useState<StaffRole[]>([
    { id: 'EMP-101', name: 'Rahul Sharma', email: 'rahul.s@meesho.com', role: 'Admin', status: 'Active', terminal: 'BLR-HQ-01' },
    { id: 'EMP-102', name: 'Priya Verma', email: 'priya.v@meesho.com', role: 'Dock Lead', status: 'Active', terminal: 'DOCK-BAY-02' },
    { id: 'EMP-103', name: 'Amit Patel', email: 'amit.p@meesho.com', role: 'Picker', status: 'On Break', terminal: 'ZONE-A-SCAN' },
    { id: 'EMP-104', name: 'Vikram Singh', email: 'vikram.s@meesho.com', role: 'Security', status: 'Active', terminal: 'GATE-01-SEC' }
  ]);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([
    { id: 'AUD-992', timestamp: 'Today, 08:05:12 AM', user: 'admin@meesho.com', action: 'Authenticated successfully via Master Token', category: 'Login', status: 'Success' },
    { id: 'AUD-991', timestamp: 'Today, 07:50:22 AM', user: 'priya.v@meesho.com', action: 'Overrode automated sorter speed limit in Zone B', category: 'Override', status: 'Warning' },
    { id: 'AUD-990', timestamp: 'Today, 07:30:10 AM', user: 'system', action: 'Automated WAF rate limit triggered for Tor IP 185.220.101.42', category: 'Security', status: 'Success' },
    { id: 'AUD-989', timestamp: 'Today, 06:15:00 AM', user: 'rahul.s@meesho.com', action: 'Pinned urgent SLA broadcast across all dashboard terminals', category: 'Broadcast', status: 'Success' }
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleToggleEmergencyHalt = () => {
    const newState = !emergencyHalt;
    setEmergencyHalt(newState);
    showToast(newState ? '🚨 EMERGENCY HALT OVERRIDE ACTIVATED ACROSS ALL DOCKS' : '✅ Emergency Halt Lifted. Normal operations resumed.');
  };

  const handleToggleMaintenance = () => {
    const newState = !maintenanceMode;
    setMaintenanceMode(newState);
    showToast(newState ? '⚠️ Warehouse Maintenance Mode Enabled' : '✅ Maintenance Mode Deactivated.');
  };

  const handlePurgeRedis = () => {
    showToast('🧹 Redis Cache successfully purged. 48,120 transient keys flushed. TTL reset.');
  };

  const handleFlushBuffers = () => {
    showToast('⚡ Temp scan buffers flushed and committed to persistent SQLite/PostgreSQL store.');
  };

  const handleGracefulRestart = () => {
    showToast('🔄 Graceful Service Restart initiated. Queuing active picking batches before recycling worker nodes.');
  };

  const handleAddBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBroadcastTitle.trim()) return;

    const newItem: BroadcastItem = {
      id: `BRD-0${broadcasts.length + 1}`,
      title: newBroadcastTitle,
      type: newBroadcastType,
      target: newBroadcastTarget,
      timestamp: 'Just now',
      active: true
    };

    setBroadcasts([newItem, ...broadcasts]);
    setNewBroadcastTitle('');
    showToast('📢 Broadcast pinned and published across all warehouse terminals instantly.');
  };

  const handleDeleteBroadcast = (id: string) => {
    setBroadcasts(broadcasts.filter(b => b.id !== id));
    showToast('🗑️ Broadcast removed from active terminal display.');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-slate-900 border-2 border-[#f43397] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center justify-between z-50 animate-bounce">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-[#f43397]" size={20} />
            <span className="text-sm font-bold">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-gray-400 hover:text-white text-xs font-bold">DISMISS</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-slate-900 to-gray-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-[#f43397]/15 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="bg-[#f43397] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm">
              <ShieldCheck size={12} /> Master Admin Session Active
            </span>
            <span className="text-xs font-mono text-gray-400">admin@meesho.com</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            WMS Enterprise Control & Command Hub
          </h1>
          <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">
            Manage global infrastructure clusters, live server telemetry, emergency overrides, staff permissions, and real-time security audit trails.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 flex-wrap">
          <div className="bg-slate-800/80 border border-slate-700 px-4 py-3 rounded-2xl flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${emergencyHalt ? 'bg-red-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
            <div>
              <p className="text-[10px] font-mono uppercase text-gray-400">System Status</p>
              <p className="text-xs font-bold text-white">{emergencyHalt ? 'EMERGENCY HALT ACTIVE' : 'All Systems Operational'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('infrastructure')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'infrastructure'
              ? 'bg-[#f43397] text-white shadow-md shadow-pink-500/20'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Server size={16} />
          <span>Server & Infrastructure Center</span>
        </button>
        <button
          onClick={() => setActiveTab('controls')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'controls'
              ? 'bg-[#f43397] text-white shadow-md shadow-pink-500/20'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Sliders size={16} />
          <span>System Controls & Overrides</span>
        </button>
        <button
          onClick={() => setActiveTab('broadcasts')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'broadcasts'
              ? 'bg-[#f43397] text-white shadow-md shadow-pink-500/20'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Megaphone size={16} />
          <span>Broadcasts ({broadcasts.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'roles'
              ? 'bg-[#f43397] text-white shadow-md shadow-pink-500/20'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Users size={16} />
          <span>User Roles & Permissions</span>
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'audit'
              ? 'bg-[#f43397] text-white shadow-md shadow-pink-500/20'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <History size={16} />
          <span>Security Audit Trail</span>
        </button>
      </div>

      {/* Tab Content: Server & Infrastructure Center */}
      {activeTab === 'infrastructure' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Section 1: Cluster Nodes & Real-Time Telemetry Gauges */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* CPU Load */}
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-pink-50 text-[#f43397] flex items-center justify-center">
                  <Cpu size={20} />
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Normal Load
                </span>
              </div>
              <div className="mt-4">
                <p className="text-xs font-bold text-gray-500 uppercase">CPU Load (4 vCPU)</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-gray-900">{cpuLoad}%</span>
                  <span className="text-xs text-gray-400 font-mono">1.82 GHz avg</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full mt-3 overflow-hidden">
                  <div className="bg-[#f43397] h-full transition-all duration-500" style={{ width: `${cpuLoad}%` }}></div>
                </div>
              </div>
            </div>

            {/* RAM Usage */}
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <HardDrive size={20} />
                </div>
                <span className="text-[10px] font-mono font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                  38.7% Used
                </span>
              </div>
              <div className="mt-4">
                <p className="text-xs font-bold text-gray-500 uppercase">RAM Utilization</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-gray-900">{ramUsage} GB</span>
                  <span className="text-xs text-gray-400 font-mono">/ 16.0 GB</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full mt-3 overflow-hidden">
                  <div className="bg-purple-600 h-full transition-all duration-500" style={{ width: `${(ramUsage / 16) * 100}%` }}></div>
                </div>
              </div>
            </div>

            {/* Network Connections */}
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Wifi size={20} />
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Live Stream
                </span>
              </div>
              <div className="mt-4">
                <p className="text-xs font-bold text-gray-500 uppercase">Active WS Sockets</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-gray-900">{activeWs.toLocaleString()}</span>
                  <span className="text-xs text-emerald-600 font-bold">↑ 12% peak</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-2 font-mono">HTTP: {httpReqSec} req/sec</p>
              </div>
            </div>

            {/* Uptime & Latency */}
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Activity size={20} />
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  99.98% SLA
                </span>
              </div>
              <div className="mt-4">
                <p className="text-xs font-bold text-gray-500 uppercase">API Response Latency</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-gray-900">24ms</span>
                  <span className="text-xs text-gray-400 font-mono">p99: 48ms</span>
                </div>
                <p className="text-[11px] text-emerald-600 font-bold mt-2">⚡ Mumbai Cloud Region</p>
              </div>
            </div>

          </div>

          {/* Cluster Nodes Status */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
              <Server size={16} className="text-[#f43397]" />
              <span>Microservice Cluster Nodes Status</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-900">Core REST API</p>
                  <p className="text-[10px] font-mono text-gray-500">v2.4.1-prod</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online - Healthy
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-900">WebSocket Influx Engine</p>
                  <p className="text-[10px] font-mono text-gray-500">Node Cluster #03</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online - Healthy
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-900">Scan Station Gateway</p>
                  <p className="text-[10px] font-mono text-gray-500">Handheld Sync</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span> Degraded (Zone B)
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-900">PostgreSQL / Redis DB</p>
                  <p className="text-[10px] font-mono text-gray-500">Primary + Replica</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online - Healthy
                </span>
              </div>

            </div>
          </div>

          {/* Section 2: Interactive Server Controls & Emergency Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Cache & Memory Flush */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Zap size={22} />
                </div>
                <h3 className="text-base font-black text-gray-900">Cache & Memory Purge</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Instantly flush Redis cache keys and temporary worker scan buffers to free up RAM during peak flash sales.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200/60 grid grid-cols-2 gap-2">
                <button
                  onClick={handlePurgeRedis}
                  className="py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors"
                >
                  Purge Redis Cache
                </button>
                <button
                  onClick={handleFlushBuffers}
                  className="py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                >
                  Flush Scan Buffers
                </button>
              </div>
            </div>

            {/* Safe Server Restart */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <RefreshCw size={22} />
                </div>
                <h3 className="text-base font-black text-gray-900">Graceful Node Restart</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Safely recycle worker cluster nodes with zero dropped pick orders by queuing active batches in persistent storage first.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200/60">
                <button
                  onClick={handleGracefulRestart}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-colors shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} />
                  <span>Execute Graceful Restart</span>
                </button>
              </div>
            </div>

            {/* Customer API Maintenance Mode & Rate Limiter */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-pink-50 text-[#f43397] flex items-center justify-center">
                    <ShieldAlert size={22} />
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customerApiMaintenance}
                      onChange={(e) => {
                        setCustomerApiMaintenance(e.target.checked);
                        showToast(e.target.checked ? '🔒 Customer-Facing API placed in read-only maintenance mode.' : '🔓 Customer API live and fully writable.');
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f43397]"></div>
                  </label>
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">API Maintenance Toggle</h3>
                  <p className="text-xs text-gray-600 leading-relaxed mt-1">
                    Put customer portal in read-only mode while keeping internal warehouse scan stations active.
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200/60">
                <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                  <span>Rate Limiter Throttler</span>
                  <span className="text-[#f43397] font-mono">{rateLimit} req/sec</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="250"
                  value={rateLimit}
                  onChange={(e) => setRateLimit(Number(e.target.value))}
                  className="w-full accent-[#f43397] cursor-pointer"
                />
              </div>
            </div>

          </div>

          {/* Section 3: Live System Logs & Environment Diagnostics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Terminal Window (Logs) */}
            <div className="lg:col-span-2 bg-slate-950 rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
              <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Terminal size={18} className="text-[#f43397]" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Live Server Console Stream</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={logSearchQuery}
                    onChange={(e) => setLogSearchQuery(e.target.value)}
                    placeholder="Filter logs..."
                    className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white placeholder-slate-500 outline-none focus:border-[#f43397]"
                  />
                  <button
                    onClick={() => setIsLogsPaused(!isLogsPaused)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      isLogsPaused ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {isLogsPaused ? <Play size={12} /> : <Pause size={12} />}
                    <span>{isLogsPaused ? 'Resume' : 'Pause'}</span>
                  </button>
                </div>
              </div>

              <div className="p-4 font-mono text-[11px] space-y-2 overflow-y-auto max-h-[340px] bg-slate-950 text-slate-300">
                {serverLogs
                  .filter(log => log.message.toLowerCase().includes(logSearchQuery.toLowerCase()) || log.service.toLowerCase().includes(logSearchQuery.toLowerCase()))
                  .map(log => (
                    <div key={log.id} className="flex items-start gap-3 hover:bg-slate-900/50 p-1 rounded transition-colors">
                      <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${
                        log.level === 'SUCCESS' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        log.level === 'WARN' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        log.level === 'ERROR' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-blue-950 text-blue-400 border border-blue-800'
                      }`}>
                        {log.level}
                      </span>
                      <span className="text-[#f43397] font-bold shrink-0">[{log.service}]</span>
                      <span className="text-slate-300 break-all">{log.message}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Server Environment Diagnostics Card */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                    <Database size={16} className="text-[#f43397]" />
                    <span>Environment Diagnostics</span>
                  </h3>
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Secure TLS 1.3
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Node.js Runtime</span>
                    <span className="font-mono font-bold text-gray-900">v20.11.0-lts (ESM)</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Cloud Region</span>
                    <span className="font-mono font-bold text-gray-900">ap-south-1 (Mumbai)</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">SSL Certificate Expiry</span>
                    <span className="font-mono font-bold text-emerald-600">89 days remaining</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">Database Replica Lag</span>
                    <span className="font-mono font-bold text-emerald-600">&lt; 1.4 ms</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500 font-medium">WAF Shield Status</span>
                    <span className="font-mono font-bold text-purple-600">Active (Zero Threats)</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500 font-medium">Container Uptime</span>
                    <span className="font-mono font-bold text-gray-900">14d 06h 22m</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => showToast('📋 Complete server diagnostics bundle exported to secure S3 vault.')}
                  className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                >
                  Export Diagnostic Dump (.zip)
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Tab Content 1: System Controls */}
      {activeTab === 'controls' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          
          {/* Emergency Halt Card */}
          <div className={`p-6 rounded-3xl border-2 transition-all flex flex-col justify-between ${
            emergencyHalt ? 'bg-red-50 border-red-500 shadow-lg shadow-red-500/10' : 'bg-white border-gray-200 shadow-sm'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${emergencyHalt ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                  <Power size={22} />
                </div>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  emergencyHalt ? 'bg-red-200 text-red-900 animate-pulse' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {emergencyHalt ? 'HALTED' : 'Normal'}
                </span>
              </div>
              <h3 className="text-base font-black text-gray-900">Emergency Conveyor Halt</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Immediately trigger an emergency stop on all sorting lines, conveyors, and automated scan stations in case of safety hazards or accidents.
              </p>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200/60">
              <button
                onClick={handleToggleEmergencyHalt}
                className={`w-full py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-md ${
                  emergencyHalt
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                    : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/30'
                }`}
              >
                <Power size={16} />
                <span>{emergencyHalt ? 'LIFT EMERGENCY HALT' : 'TRIGGER EMERGENCY HALT'}</span>
              </button>
            </div>
          </div>

          {/* Maintenance Mode Card */}
          <div className={`p-6 rounded-3xl border-2 transition-all flex flex-col justify-between ${
            maintenanceMode ? 'bg-amber-50 border-amber-500 shadow-lg shadow-amber-500/10' : 'bg-white border-gray-200 shadow-sm'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${maintenanceMode ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
                  <Settings size={22} />
                </div>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  maintenanceMode ? 'bg-amber-200 text-amber-900 animate-pulse' : 'bg-gray-100 text-gray-600'
                }`}>
                  {maintenanceMode ? 'Active' : 'Standby'}
                </span>
              </div>
              <h3 className="text-base font-black text-gray-900">Warehouse Maintenance Lock</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Enable scheduled maintenance mode to pause inbound staging while displaying banner notifications across worker handheld terminals.
              </p>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200/60">
              <button
                onClick={handleToggleMaintenance}
                className={`w-full py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-md ${
                  maintenanceMode
                    ? 'bg-gray-900 hover:bg-gray-800 text-white'
                    : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30'
                }`}
              >
                <Settings size={16} />
                <span>{maintenanceMode ? 'Disable Maintenance Mode' : 'Enable Maintenance Lock'}</span>
              </button>
            </div>
          </div>

          {/* Live Telemetry Speed Card */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-pink-100 text-[#f43397] flex items-center justify-center">
                  <RefreshCw size={22} />
                </div>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider bg-pink-100 text-[#f43397]">
                  Real-time Stream
                </span>
              </div>
              <h3 className="text-base font-black text-gray-900">Telemetry Influx Engine</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Configure background data influx frequency for order throughput, picker scan velocity, and dwell time simulations.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200/60 space-y-3">
              <select
                value={telemetrySpeed}
                onChange={(e) => {
                  setTelemetrySpeed(e.target.value);
                  showToast(`⚡ Telemetry refresh frequency updated to: ${e.target.value}`);
                }}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 outline-none focus:border-[#f43397]"
              >
                <option>Fast (5 seconds)</option>
                <option>Standard (10 seconds)</option>
                <option>Relaxed (30 seconds)</option>
                <option>Manual Only</option>
              </select>
            </div>
          </div>

        </div>
      )}

      {/* Tab Content 2: Broadcasts & Pinned Items */}
      {activeTab === 'broadcasts' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Add Broadcast Form */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
            <h3 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
              <Megaphone size={18} className="text-[#f43397]" />
              <span>Pin New Announcement or Urgent SLA Alert</span>
            </h3>

            <form onSubmit={handleAddBroadcast} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6">
                <input
                  type="text"
                  required
                  value={newBroadcastTitle}
                  onChange={e => setNewBroadcastTitle(e.target.value)}
                  placeholder="Enter alert title or priority instruction..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#f43397] outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <select
                  value={newBroadcastType}
                  onChange={e => setNewBroadcastType(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 outline-none"
                >
                  <option value="announcement">📢 Announcement</option>
                  <option value="sla_alert">⚠️ SLA Warning</option>
                  <option value="maintenance">🔧 Maintenance Window</option>
                  <option value="critical_order">⭐ Priority Order Batch</option>
                </select>
              </div>

              <div className="sm:col-span-3 flex gap-2">
                <input
                  type="text"
                  value={newBroadcastTarget}
                  onChange={e => setNewBroadcastTarget(e.target.value)}
                  placeholder="Target (e.g. Zone A)"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#f43397] hover:bg-[#d82481] text-white text-xs font-black rounded-xl shadow-md transition-all whitespace-nowrap flex items-center gap-1.5"
                >
                  <Plus size={16} />
                  <span>Pin</span>
                </button>
              </div>
            </form>
          </div>

          {/* Broadcasts List */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Active Broadcasts & Pinned Items</span>
              <span className="text-xs bg-pink-100 text-[#f43397] font-black px-2.5 py-0.5 rounded-full">
                {broadcasts.length} Active
              </span>
            </div>

            <div className="divide-y divide-gray-200">
              {broadcasts.map(b => (
                <div key={b.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-gray-50/80 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                      b.type === 'sla_alert' ? 'bg-amber-100 text-amber-700' :
                      b.type === 'maintenance' ? 'bg-blue-100 text-blue-700' :
                      b.type === 'critical_order' ? 'bg-purple-100 text-purple-700' : 'bg-pink-100 text-[#f43397]'
                    }`}>
                      <Pin size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-gray-500">{b.id}</span>
                        <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                          {b.target}
                        </span>
                        <span className="text-[11px] text-gray-400">{b.timestamp}</span>
                      </div>
                      <p className="text-sm font-bold text-gray-900 mt-1">{b.title}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <button
                      onClick={() => handleDeleteBroadcast(b.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      title="Unpin & Delete Broadcast"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Tab Content 3: User Roles & Permissions */}
      {activeTab === 'roles' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden animate-fadeIn">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Staff Role Management & Terminal Access</span>
            <button
              onClick={() => showToast('➕ New Staff credential invitation sent successfully.')}
              className="px-3.5 py-1.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>Add Staff User</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100/70 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider">
                  <th className="p-4">Staff ID & Name</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Assigned Role</th>
                  <th className="p-4">Terminal ID</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-medium text-gray-800">
                {staff.map(member => (
                  <tr key={member.id} className="hover:bg-gray-50/80">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gray-200 text-gray-700 font-bold flex items-center justify-center shrink-0">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{member.name}</p>
                        <span className="font-mono text-[10px] text-gray-400">{member.id}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-gray-600">{member.email}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        member.role === 'Admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                        member.role === 'Dock Lead' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                        member.role === 'Security' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-gray-600">{member.terminal}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        member.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        {member.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => showToast(`🔒 Permissions updated for ${member.name} (${member.role})`)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-colors"
                      >
                        Edit Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content 4: Security Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden animate-fadeIn">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Real-Time Security Events & Operational Overrides</span>
            <span className="text-xs font-mono text-gray-500">Encrypted Immutable Audit Vault</span>
          </div>

          <div className="divide-y divide-gray-200 font-mono text-xs">
            {auditLogs.map(log => (
              <div key={log.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    log.status === 'Critical' ? 'bg-red-100 text-red-600' :
                    log.status === 'Warning' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900">{log.id}</span>
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{log.category}</span>
                      <span className="text-gray-400 text-[11px]">{log.timestamp}</span>
                    </div>
                    <p className="font-sans text-xs text-gray-700 mt-1 font-semibold">{log.action}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="text-[10px] bg-slate-900 text-slate-300 px-2.5 py-1 rounded font-bold">
                    User: {log.user}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

