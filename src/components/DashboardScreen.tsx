import React, { useEffect, useState } from 'react';
import { fetchApi } from '../lib/api.ts';
import { 
  Activity, Package, ArrowUpRight, ArrowDownRight, Truck, LayoutGrid, List, 
  AlertTriangle, Wrench, ShieldAlert, Clock, Download, Megaphone, Zap, 
  Play, Square, CheckCircle2, BarChart3, Layers, Send, TrendingUp, AlertOctagon, X,
  ShieldCheck, Lock
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar 
} from 'recharts';

const hourlyThroughputDataToday = [
  { time: '06:00', inbound: 420, outbound: 210 },
  { time: '08:00', inbound: 980, outbound: 650 },
  { time: '10:00', inbound: 1450, outbound: 1200 },
  { time: '12:00', inbound: 1100, outbound: 1400 },
  { time: '14:00', inbound: 1320, outbound: 1550 },
  { time: '16:00', inbound: 1650, outbound: 1890 },
  { time: '18:00', inbound: 950, outbound: 1300 },
  { time: '20:00', inbound: 520, outbound: 840 },
  { time: '22:00', inbound: 280, outbound: 450 },
];

const hourlyThroughputData7Days = [
  { time: 'Mon', inbound: 8400, outbound: 8200 },
  { time: 'Tue', inbound: 9100, outbound: 8900 },
  { time: 'Wed', inbound: 10200, outbound: 9800 },
  { time: 'Thu', inbound: 9600, outbound: 9400 },
  { time: 'Fri', inbound: 11500, outbound: 11200 },
  { time: 'Sat', inbound: 13200, outbound: 12800 },
  { time: 'Sun', inbound: 7800, outbound: 7500 },
];

const hourlyThroughputData30Days = [
  { time: 'Week 1', inbound: 58000, outbound: 56000 },
  { time: 'Week 2', inbound: 64000, outbound: 62000 },
  { time: 'Week 3', inbound: 71000, outbound: 69000 },
  { time: 'Week 4', inbound: 68000, outbound: 66000 },
];

export function DashboardScreen() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'overview' | 'floorplan'>('overview');
  const [chartTimeframe, setChartTimeframe] = useState<'Today' | '7 Days' | '30 Days'>('Today');
  
  // 10-Minute Periodic Influx & Auto-Refresh State
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(600000); // 10 min default
  const [countdownSeconds, setCountdownSeconds] = useState<number>(600);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>(new Date().toLocaleTimeString());
  const [storageCapacity, setStorageCapacity] = useState<number>(84.5);

  const [throughputTodayState, setThroughputTodayState] = useState([
    { time: '06:00', inbound: 420, outbound: 210 },
    { time: '08:00', inbound: 980, outbound: 650 },
    { time: '10:00', inbound: 1450, outbound: 1200 },
    { time: '12:00', inbound: 1100, outbound: 1400 },
    { time: '14:00', inbound: 1320, outbound: 1550 },
    { time: '16:00', inbound: 1650, outbound: 1890 },
    { time: '18:00', inbound: 950, outbound: 1300 },
    { time: '20:00', inbound: 520, outbound: 840 },
    { time: '22:00', inbound: 280, outbound: 450 },
  ]);

  const [zonesState, setZonesState] = useState([
    { name: 'Zone A (Apparels / Fast Pick)', capacity: 94, pickers: 34, status: 'High Congestion', risk: 'danger' },
    { name: 'Zone B (Electronics Vault)', capacity: 62, pickers: 18, status: 'Optimal', risk: 'success' },
    { name: 'Zone C (Home & Kitchen)', capacity: 88, pickers: 29, status: 'Moderate Traffic', risk: 'warning' },
    { name: 'Zone D (Bulk Storage & Pallets)', capacity: 41, pickers: 8, status: 'Normal', risk: 'success' },
  ]);
  
  // Interactive action states
  const [conveyorActive, setConveyorActive] = useState(true);
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [handoverModalOpen, setHandoverModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Scheduled Maintenance Banner State
  const [showMaintenanceNotice, setShowMaintenanceNotice] = useState(true);
  const [expandMaintenanceReason, setExpandMaintenanceReason] = useState(true);

  // Express SLA Watchlist state
  const [watchlist, setWatchlist] = useState([
    { id: 'ORD-9821', sku: 'SKU-FASH-8812', destination: 'Delhi NCR (110001)', cutoff: '18 mins', status: 'Critical', zone: 'Zone A' },
    { id: 'ORD-9825', sku: 'SKU-ELEC-4419', destination: 'Mumbai (400001)', cutoff: '34 mins', status: 'Urgent', zone: 'Zone B' },
    { id: 'ORD-9830', sku: 'SKU-HOME-1029', destination: 'Bengaluru (560001)', cutoff: '1 hr 12m', status: 'Normal', zone: 'Zone C' },
    { id: 'ORD-9834', sku: 'SKU-FASH-5520', destination: 'Hyderabad (500001)', cutoff: '1 hr 45m', status: 'Normal', zone: 'Zone A' },
  ]);

  // Smart Re-Slotting Velocity Recommendation state
  const [trendingSkus, setTrendingSkus] = useState([
    { id: 'SKU-HOME-9912', name: 'Meesho Velvet Cushion Cover (Pack of 4)', currentZone: 'Zone C', velocity: '+320% / hr', recommended: 'Zone A' },
    { id: 'SKU-ELEC-4420', name: 'Fast-Charging 65W GaN Wall Adapter', currentZone: 'Zone D', velocity: '+280% / hr', recommended: 'Zone A' },
    { id: 'SKU-FASH-7711', name: 'Ethnic Georgette Embroidered Kurti', currentZone: 'Zone C', velocity: '+210% / hr', recommended: 'Zone A' },
  ]);

  // Live Conveyor IoT Telemetry state
  const [iotTelemetry, setIotTelemetry] = useState({
    speed: 1.45, // m/s
    load: 84.2, // %
    diverterStatus: 'Active Normal',
    motorTemp: 42.5, // °C
    jamDetected: false,
  });

  const handleReslot = (skuId: string, skuName: string) => {
    setTrendingSkus(prev => prev.filter(s => s.id !== skuId));
    showToast(`🚀 Smart Re-Slotting Executed: ${skuName} successfully re-slotted to Zone A (Fast Pick).`);
  };

  const handleEmergencyDivert = () => {
    setIotTelemetry(prev => ({ ...prev, diverterStatus: 'Rerouted via Bypass Line B', jamDetected: false, load: 68.5 }));
    showToast('⚡ Automated Divert Reroute triggered! Conveyor traffic redirected successfully with zero packet loss.');
  };

  const handleAutoReroute = (orderId: string) => {
    setWatchlist(prev => prev.map(o => o.id === orderId ? { ...o, cutoff: 'Safely Rerouted (Xpressbees)', status: 'Rerouted' } : o));
    showToast(`🛡️ 3PL Failover Activated: Order ${orderId} automatically switched to Xpressbees Express Fast Carrier to protect SLA.`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const executeRefreshTick = async (customPayload?: any) => {
    try {
      // 1. Shift throughput time buckets & append new volume with variance
      setThroughputTodayState(prev => {
        const newArr = [...prev.slice(1)];
        const lastHour = prev[prev.length - 1].time;
        const nextHourNum = (parseInt(lastHour.split(':')[0]) + 2) % 24;
        const nextHourStr = String(nextHourNum).padStart(2, '0') + ':00';
        newArr.push({
          time: nextHourStr,
          inbound: Math.floor(450 + Math.random() * 1150),
          outbound: Math.floor(550 + Math.random() * 1350)
        });
        return newArr;
      });

      // 2. Fluctuating Zone Congestion percentages & picker allocation
      setZonesState(prev => prev.map(zone => {
        const delta = Math.floor(Math.random() * 11) - 5; // -5 to +5
        const newCap = Math.min(99, Math.max(35, zone.capacity + delta));
        const newRisk = newCap > 85 ? 'danger' : newCap > 70 ? 'warning' : 'success';
        const newStatus = newRisk === 'danger' ? 'High Congestion' : newRisk === 'warning' ? 'Moderate Traffic' : 'Optimal';
        return {
          ...zone,
          capacity: newCap,
          pickers: Math.max(6, zone.pickers + (Math.random() > 0.5 ? 1 : -1)),
          risk: newRisk,
          status: newStatus
        };
      }));

      // 3. Rolling SLA countdowns & Injecting new Orders into Watchlist
      const orderBatchId = Math.floor(1000 + Math.random() * 9000);
      const newUrgentOrder = {
        id: `ORD-${orderBatchId}`,
        sku: `SKU-INFLUX-${orderBatchId}`,
        destination: ['Bengaluru (560001)', 'Delhi NCR (110001)', 'Mumbai (400001)', 'Pune (411001)'][Math.floor(Math.random() * 4)],
        cutoff: '22 mins',
        status: 'Critical',
        zone: ['Zone A', 'Zone B', 'Zone C'][Math.floor(Math.random() * 3)]
      };

      setWatchlist(prev => {
        const updated = prev.map(ord => {
          if (ord.cutoff.includes('Expedited') || ord.cutoff.includes('BREACHED') || ord.cutoff.includes('Rerouted')) return ord;
          let mins = 18;
          if (ord.cutoff.includes('mins')) {
            mins = Math.max(0, parseInt(ord.cutoff) - 5);
          } else {
            mins = 45;
          }
          if (mins <= 0) {
            return { ...ord, cutoff: 'BREACHED', status: 'Critical SLA Breach' };
          }
          return { ...ord, cutoff: `${mins} mins`, status: mins < 15 ? 'Critical' : 'Urgent' };
        });
        return [newUrgentOrder, ...updated.slice(0, 4)];
      });

      // 4. Storage Capacity Dynamics (fluctuate between 80.0% and 95.0%)
      const deltaCap = (Math.random() * 3.6 - 1.6);
      const newCapacity = customPayload?.storageCapacity || Math.min(95.0, Math.max(80.0, +(storageCapacity + deltaCap).toFixed(1)));
      setStorageCapacity(newCapacity);

      // 5. Update stats count
      setStats((prev: any) => ({
        ...prev,
        pendingOrders: (prev?.pendingOrders ? Number(prev.pendingOrders) + 3 : 1207),
        throughput: (prev?.throughput ? Number(prev.throughput) + 18 : 8450),
        inbound: (prev?.inbound ? Number(prev.inbound) + 1 : 25),
        dispatches: (prev?.dispatches ? Number(prev.dispatches) + 2 : 14),
        storageCapacity: newCapacity
      }));

      // 6. Ingest smart re-slotting trending SKU recommendation
      setTrendingSkus(prev => {
        const newSku = {
          id: `SKU-INFLUX-${orderBatchId}`,
          name: `High-Velocity Influx Item #${orderBatchId}`,
          currentZone: 'Zone D',
          velocity: `+${Math.floor(220 + Math.random() * 180)}% / hr`,
          recommended: 'Zone A'
        };
        return [newSku, ...prev.slice(0, 2)];
      });

      setLastSyncedTime(new Date().toLocaleTimeString());

      // If tick was not already triggered by backend API call, trigger backend sync
      if (!customPayload) {
        fetchApi('/system/stream-tick', { method: 'POST' }).catch(console.error);
      }

      // Detailed toast alert showing 20 records across all categories
      showToast('⚡ 10-Min Influx Complete (+20 Records): 4 Orders & Reviews, 3 Dock Bookings, 3 SKU Restocks, 3 RTO Tickets, 5 Meal Orders, 4 Scan Audits.');
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchApi('/dashboard/stats')
      .then(data => {
        setStats(data);
        if (data?.storageCapacity) {
          setStorageCapacity(Number(data.storageCapacity));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // 10-Minute Active Countdown Ticker
  useEffect(() => {
    if (autoRefreshInterval <= 0) return;
    const ticker = setInterval(() => {
      setCountdownSeconds(prev => {
        if (prev <= 1) {
          executeRefreshTick();
          return Math.floor(autoRefreshInterval / 1000);
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(ticker);
  }, [autoRefreshInterval, storageCapacity]);

  // Window event listener for simulation clicks
  useEffect(() => {
    const handleDataUpdate = (e: any) => {
      executeRefreshTick(e?.detail);
      setCountdownSeconds(autoRefreshInterval > 0 ? Math.floor(autoRefreshInterval / 1000) : 600);
    };
    window.addEventListener('wms-data-updated', handleDataUpdate);
    return () => window.removeEventListener('wms-data-updated', handleDataUpdate);
  }, [autoRefreshInterval, storageCapacity]);

  const handleIntervalChange = (val: number) => {
    setAutoRefreshInterval(val);
    setCountdownSeconds(val > 0 ? Math.floor(val / 1000) : 0);
    showToast(val > 0 ? `⏱️ 10-Min Influx Engine interval set to ${val === 600000 ? '10 Min' : val === 300000 ? '5 Min' : '20 Min'}` : '⏱️ Auto-Refresh paused');
  };

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const statCards = [
    { title: 'Pending Express Orders', value: stats?.pendingOrders || '1,204', change: '+14% vs yesterday', icon: Package, color: 'text-pink-600', bg: 'bg-pink-50' },
    { title: 'Throughput Today', value: stats?.throughput || '8,432', change: '+8.2% target rate', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Inbound Docks Active', value: stats?.inbound || '24 / 30', change: '6 docks available', icon: ArrowDownRight, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Active 3PL Dispatches', value: stats?.dispatches || '12 trucks', change: 'On schedule', icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const getChartData = () => {
    if (chartTimeframe === 'Today') return throughputTodayState;
    if (chartTimeframe === '7 Days') return hourlyThroughputData7Days;
    return hourlyThroughputData30Days;
  };

  const handleExpedite = (id: string) => {
    setWatchlist(prev => prev.map(o => o.id === id ? { ...o, cutoff: 'Expedited (AMR Priority)' } : o));
    showToast(`Order ${id} assigned priority AMR dispatch.`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-pink-500/50 flex items-center gap-3 animate-in fade-in slide-in-from-top-5">
          <Zap className="text-[#f43397] animate-pulse" size={20} />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header & Live Telemetry Badge */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Warehouse Operations Dashboard</h2>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              LIVE TELEMETRY ACTIVE
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Real-time throughput, zone congestion, and automated conveyor status.</p>
        </div>

        {/* Quick Command Action Dock */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setConveyorActive(!conveyorActive);
              showToast(conveyorActive ? '⚠️ Emergency Conveyor STOP triggered!' : '✅ Conveyor system resumed.');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              conveyorActive 
                ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100' 
                : 'bg-emerald-600 text-white border border-emerald-700 hover:bg-emerald-700 animate-pulse'
            }`}
          >
            {conveyorActive ? <Square size={14} className="fill-current" /> : <Play size={14} className="fill-current" />}
            <span>{conveyorActive ? 'Emergency Stop' : 'Resume Conveyor'}</span>
          </button>

          <button
            onClick={() => setHandoverModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all border border-gray-200"
          >
            <BarChart3 size={14} />
            <span>Shift Handover Summary</span>
          </button>

          <button
            onClick={() => showToast('🚀 Wave Picking Batch #WAVE-1190 triggered successfully.')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-all"
          >
            <Layers size={14} />
            <span>Trigger Wave Batch</span>
          </button>

          <button
            onClick={() => setAnnouncementModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-pink-50 text-[#f43397] border border-pink-200 hover:bg-pink-100 transition-all"
          >
            <Megaphone size={14} />
            <span>Broadcast Floor Paging</span>
          </button>
        </div>
      </div>

      {/* SCHEDULED SITE MAINTENANCE ALERT NOTICE */}
      {showMaintenanceNotice && (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/15 to-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-5 shadow-lg relative overflow-hidden animate-in fade-in slide-in-from-top-3">
          <div className="absolute top-0 right-0 w-80 h-full bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 relative z-10">
            <div className="flex items-start gap-3.5">
              <div className="p-3 bg-amber-500 text-white rounded-xl shadow-md shrink-0 mt-0.5 animate-bounce">
                <Wrench size={24} />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="px-3 py-0.5 bg-amber-600 text-white font-black text-xs uppercase tracking-wider rounded-md shadow-sm flex items-center gap-1.5">
                    <ShieldAlert size={14} />
                    <span>SCHEDULED SITE MAINTENANCE</span>
                  </span>
                  <span className="text-xs font-mono font-extrabold px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded-md border border-amber-300">
                    WINDOW: TODAY, 11:30 PM – 01:30 AM IST (2 HRS)
                  </span>
                  <span className="text-xs px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md border border-emerald-300 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <span>Systems Operational (Pre-Window)</span>
                  </span>
                </div>

                <h3 className="text-base font-black text-amber-950">
                  System Maintenance Scheduled for Infrastructure & Database Upgrades
                </h3>

                <p className="text-xs text-amber-900 leading-relaxed font-medium max-w-4xl">
                  <strong>Reason for Maintenance:</strong> Scheduled hardware servicing, thermal POS barcode printer firmware updates, gate biometric controller sync optimization, and database index defragmentation in preparation for the upcoming <strong>Festival Peak Order Surge & High-Concurrency Shift Traffic</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-start">
              <button
                type="button"
                onClick={() => setExpandMaintenanceReason(!expandMaintenanceReason)}
                className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs rounded-xl border border-amber-300 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Clock size={13} className="text-amber-700" />
                <span>{expandMaintenanceReason ? 'Hide Impact Details' : 'View Impact & Reason'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMaintenanceNotice(false);
                  showToast('Acknowledged Maintenance Notice.');
                }}
                className="p-1.5 text-amber-800 hover:text-amber-950 hover:bg-amber-200/60 rounded-lg transition-all cursor-pointer"
                title="Dismiss Notice"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Expanded Maintenance Breakdown & Contingency Plan */}
          {expandMaintenanceReason && (
            <div className="mt-4 pt-4 border-t border-amber-300/50 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white/80 border border-amber-200 rounded-xl space-y-1">
                <div className="font-extrabold text-amber-950 flex items-center gap-1.5">
                  <AlertTriangle size={14} className="text-amber-600" />
                  <span>Key Reason & Upgrades</span>
                </div>
                <p className="text-amber-900 text-[11px] leading-snug">
                  Upgrading database index trees and thermal printing queues to boost voucher generation capacity from 5,000 to 25,000 tokens/hr.
                </p>
              </div>

              <div className="p-3 bg-white/80 border border-amber-200 rounded-xl space-y-1">
                <div className="font-extrabold text-amber-950 flex items-center gap-1.5">
                  <Wrench size={14} className="text-amber-600" />
                  <span>Impacted Modules</span>
                </div>
                <ul className="text-amber-900 text-[11px] space-y-0.5 list-disc list-inside">
                  <li>POS Counter Scanners (11:30 PM - 01:30 AM)</li>
                  <li>Live Biometric Gate Sync (Batch re-synced at 01:30 AM)</li>
                </ul>
              </div>

              <div className="p-3 bg-white/80 border border-amber-200 rounded-xl space-y-1">
                <div className="font-extrabold text-amber-950 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <span>Contingency & Action</span>
                </div>
                <p className="text-amber-900 text-[11px] leading-snug">
                  Physical printed passes & manual Desk 01 backup active. Pre-orders placed before 11:00 PM will be auto-dispatched.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Auto-Refresh & 10-Min Influx Engine Controls */}
      <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-500/10 rounded-xl border border-pink-500/20">
            <Clock size={20} className="text-pink-400 animate-spin" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold tracking-wider uppercase text-slate-200">10-Min Periodic Influx Engine</h4>
              {autoRefreshInterval > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping"></span>
                  Next Influx in: {formatCountdown(countdownSeconds)}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Automated multi-module sync (+20 records) • Last Synced: <span className="font-mono text-white font-bold">{lastSyncedTime}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold mr-1">Interval:</span>
          {[
            { label: '5 Min', value: 300000 },
            { label: '10 Min', value: 600000 },
            { label: '20 Min', value: 1200000 },
            { label: 'Off', value: 0 },
          ].map(opt => (
            <button
              key={opt.label}
              onClick={() => handleIntervalChange(opt.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                autoRefreshInterval === opt.value
                  ? 'bg-pink-600 text-white shadow-md ring-2 ring-pink-400/30'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex border-b border-gray-200 gap-6">
        <button
          onClick={() => setViewMode('overview')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            viewMode === 'overview' ? 'border-[#f43397] text-[#f43397]' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <BarChart3 size={18} /> Executive & Operations Overview
        </button>
        <button
          onClick={() => setViewMode('floorplan')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            viewMode === 'floorplan' ? 'border-[#f43397] text-[#f43397]' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <LayoutGrid size={18} /> Interactive Floor Plan & Heatmap
        </button>
      </div>

      {viewMode === 'overview' ? (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* KPI Cards & Storage Capacity */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((card, i) => {
                const Icon = card.icon;
                return (
                  <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className={`${card.bg} p-3 rounded-xl`}>
                        <Icon className={`w-6 h-6 ${card.color}`} />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">{card.change}</span>
                    </div>
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-gray-500">{card.title}</p>
                      <h3 className="text-2xl font-black text-gray-900 mt-1">{card.value}</h3>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Circular Dynamic Storage Capacity Gauge */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center relative">
               <div className="w-full flex items-center justify-between mb-2">
                 <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Storage Capacity</h3>
                 <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                   storageCapacity >= 90 ? 'bg-red-100 text-red-700 animate-pulse' :
                   storageCapacity >= 85 ? 'bg-amber-100 text-amber-700' :
                   'bg-pink-100 text-[#f43397]'
                 }`}>
                   {storageCapacity >= 90 ? 'High Fill' : 'Dynamic Scale'}
                 </span>
               </div>
               <div className="relative flex items-center justify-center my-1">
                 <svg height="110" width="110" className="rotate-[-90deg]">
                   <circle stroke="#f3f4f6" fill="transparent" strokeWidth="10" r="44" cx="55" cy="55" />
                   <circle
                     stroke={storageCapacity >= 90 ? '#ef4444' : storageCapacity >= 85 ? '#f59e0b' : '#f43397'}
                     fill="transparent"
                     strokeWidth="10"
                     strokeDasharray={276.46}
                     strokeDashoffset={276.46 - (storageCapacity * 276.46) / 100}
                     strokeLinecap="round"
                     r="44"
                     cx="55"
                     cy="55"
                     className="transition-all duration-1000 ease-out"
                   />
                 </svg>
                 <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-black text-gray-900">{storageCapacity.toFixed(1)}%</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase">Utilized</span>
                 </div>
               </div>
               <div className="mt-2 flex justify-between w-full text-xs font-semibold px-1">
                  <span className="text-gray-500">Used: <span className="text-gray-900">{Math.round(storageCapacity * 1000).toLocaleString()} sq.ft</span></span>
                  <span className="text-gray-500">Max: <span className="text-gray-900">100,000 sq.ft</span></span>
               </div>
            </div>
          </div>

          {/* Interactive Hourly Throughput & Dispatch Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Hourly Inbound vs. Outbound Throughput</h3>
                <p className="text-xs text-gray-500 mt-0.5">Real-time package movement volume across shifts</p>
              </div>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                {(['Today', '7 Days', '30 Days'] as const).map(tf => (
                  <button
                    key={tf}
                    onClick={() => setChartTimeframe(tf)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      chartTimeframe === tf ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getChartData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43397" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43397" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="inbound" name="Inbound Scan" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorInbound)" />
                  <Area type="monotone" dataKey="outbound" name="Outbound Dispatch" stroke="#f43397" strokeWidth={3} fillOpacity={1} fill="url(#colorOutbound)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Grid Section: Zone Congestion Tracker & SLA Dispatch Watchlist */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live Bottleneck & Zone Congestion Tracker */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Warehouse Zone Congestion & SLA Risk</h3>
                  <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <AlertTriangle size={12} /> Zone A High Risk
                  </span>
                </div>
                
                <div className="space-y-4">
                  {zonesState.map((zone, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-bold text-gray-900 text-sm">{zone.name}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                          zone.risk === 'danger' ? 'bg-red-100 text-red-700 animate-pulse' :
                          zone.risk === 'warning' ? 'bg-amber-100 text-amber-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {zone.status} ({zone.capacity}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            zone.risk === 'danger' ? 'bg-red-500' :
                            zone.risk === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} 
                          style={{ width: `${zone.capacity}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 font-semibold">
                        <span>Active Pickers: <strong className="text-gray-800">{zone.pickers} staff</strong></span>
                        <span>SLA Buffer: {zone.risk === 'danger' ? '12m (Tight)' : '45m (Safe)'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SLA Dispatch Countdown & Express Order Matrix */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Express SLA Watchlist</h3>
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                    Priority Cutoff Tracking
                  </span>
                </div>

                <div className="space-y-3">
                  {watchlist.map(order => (
                    <div key={order.id} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-all">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-gray-900 text-sm">{order.id}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            order.status === 'Critical' ? 'bg-red-100 text-red-700 animate-pulse' :
                            order.status === 'Urgent' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            Cutoff: {order.cutoff}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{order.sku} • {order.destination}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleExpedite(order.id)}
                          className="px-3 py-1.5 bg-[#f43397] hover:bg-[#d82481] text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                        >
                          Expedite Pick
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Multi-Carrier Dispatch Split Widget */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Multi-Carrier Dispatch Split & 3PL Performance</h3>
                <p className="text-xs text-gray-500">Live shipment distribution across carrier partners</p>
              </div>
              <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">Total Dispatched Today: 4,820 Shipments</span>
            </div>

            {/* Split Progress Bar */}
            <div className="space-y-3 mb-6">
              <div className="flex h-4 w-full rounded-full overflow-hidden shadow-inner gap-0.5">
                <div style={{ width: '42%' }} className="bg-[#f43397] h-full" title="Delhivery: 42%"></div>
                <div style={{ width: '28%' }} className="bg-blue-500 h-full" title="Xpressbees: 28%"></div>
                <div style={{ width: '18%' }} className="bg-emerald-500 h-full" title="Shadowfax: 18%"></div>
                <div style={{ width: '12%' }} className="bg-amber-500 h-full" title="Ecom Express: 12%"></div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                {[
                  { name: 'Delhivery Surface', share: '42%', color: 'bg-[#f43397]', orders: '2,024 shipments', sla: '99.4%' },
                  { name: 'Xpressbees Express', share: '28%', color: 'bg-blue-500', orders: '1,350 shipments', sla: '98.8%' },
                  { name: 'Shadowfax Hyperlocal', share: '18%', color: 'bg-emerald-500', orders: '868 shipments', sla: '99.1%' },
                  { name: 'Ecom Express', share: '12%', color: 'bg-amber-500', orders: '578 shipments', sla: '97.9%' },
                ].map((carrier, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-3 h-3 rounded-full ${carrier.color}`}></div>
                        <span className="font-bold text-gray-900 text-sm truncate">{carrier.name}</span>
                      </div>
                      <p className="text-xs text-gray-500">{carrier.orders}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-gray-200/60 pt-2">
                      <span className="text-xs font-bold text-gray-800">{carrier.share} Share</span>
                      <button 
                        onClick={() => showToast(`📥 Downloading signed manifest for ${carrier.name}...`)}
                        className="text-xs font-bold text-[#f43397] hover:underline flex items-center gap-1"
                      >
                        <Download size={12} /> Manifest
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* New Operational Modules Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 1. Shift Handover & Peak Volume Forecasting */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <BarChart3 className="text-[#f43397]" /> Shift Handover & Peak Volume Forecast
                  </h3>
                  <span className="text-xs font-bold bg-pink-50 text-[#f43397] border border-pink-200 px-2 py-0.5 rounded-full">
                    Shift B → C Handover
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-4">Predicted inbound/outbound bottleneck analysis during Morning-to-Evening changeover.</p>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3 mb-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-semibold">Peak Inbound Surge:</span>
                    <span className="font-bold text-gray-900">16:00 - 17:30 (+1,450 units/hr)</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-semibold">Peak Outbound Wave:</span>
                    <span className="font-bold text-gray-900">18:00 - 20:00 (Dispatch rush)</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-semibold">Bottleneck Risk Area:</span>
                    <span className="font-bold text-amber-600">Dock Bay 02 (High Queuing)</span>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">Automated Shift Performance Grading</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase">Picking Efficiency</span>
                    <p className="text-lg font-black text-emerald-900 mt-0.5">98.4%</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-blue-700 uppercase">Order Accuracy</span>
                    <p className="text-lg font-black text-blue-900 mt-0.5">99.8%</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 p-3 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-purple-700 uppercase">Dock Turnaround</span>
                    <p className="text-lg font-black text-purple-900 mt-0.5">18 mins</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setHandoverModalOpen(true)}
                className="mt-5 w-full py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Download size={14} /> View Full Handover Audit Report
              </button>
            </div>

            {/* 2. Smart Re-Slotting & Velocity Recommendation Engine */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="text-indigo-600" /> Smart Re-Slotting & Velocity Engine
                  </h3>
                  <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-200">
                    AI Velocity AI
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-4">Identifies trending high-volume products currently in Zone C/D and suggests 1-click re-slotting to Zone A (Fast Pick).</p>

                <div className="space-y-3">
                  {trendingSkus.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-xs font-semibold">
                      ✨ All trending SKUs have been successfully re-slotted to Zone A!
                    </div>
                  ) : (
                    trendingSkus.map(item => (
                      <div key={item.id} className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-xs truncate">{item.name}</span>
                            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">{item.velocity}</span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5">Current: <span className="text-amber-600 font-semibold">{item.currentZone}</span> → Recommended: <span className="text-emerald-600 font-semibold">{item.recommended}</span></p>
                        </div>
                        <button
                          onClick={() => handleReslot(item.id, item.name)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm whitespace-nowrap transition-all"
                        >
                          Re-Slot to Zone A
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* 3. Live Conveyor Belt & IoT Sensor Health */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Activity className="text-emerald-600" /> Live Conveyor & IoT Sensor Health
                  </h3>
                  <span className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Connected
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-4">Real-time telemetry meters, jam alerts, and automated bypass reroute triggers.</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Conveyor Speed</span>
                    <p className="text-base font-black text-gray-900 mt-1">{iotTelemetry.speed} m/s</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Belt Load</span>
                    <p className="text-base font-black text-gray-900 mt-1">{iotTelemetry.load}%</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Motor Temp</span>
                    <p className="text-base font-black text-gray-900 mt-1">{iotTelemetry.motorTemp}°C</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Diverter Status</span>
                    <p className="text-xs font-bold text-emerald-600 mt-1 truncate">{iotTelemetry.diverterStatus}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
                <span className="text-xs font-semibold text-gray-500">Emergency Bypass Protocol:</span>
                <button
                  onClick={handleEmergencyDivert}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Zap size={14} /> Trigger Automated Divert Reroute
                </button>
              </div>
            </div>

            {/* 4. 3PL Auto-Reroute Failover System */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <ShieldAlert className="text-rose-600" /> 3PL Auto-Reroute Failover System
                  </h3>
                  <span className="text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full">
                    Active Failover Rule
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-4">If an express cutoff reaches under 15 minutes and the assigned carrier experiences yard delays, execute instant carrier failover.</p>

                <div className="space-y-3">
                  {watchlist.map(ord => (
                    <div key={ord.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-xs">{ord.id}</span>
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Cutoff: {ord.cutoff}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">{ord.destination}</p>
                      </div>

                      {ord.status === 'Rerouted' ? (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                          ✓ Rerouted to Fast Carrier
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAutoReroute(ord.id)}
                          className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1"
                        >
                          <Zap size={12} /> Auto-Reroute to Fast Carrier
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* Floor Plan View Mode */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col animate-in fade-in duration-500">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Interactive Warehouse Floor Plan & AMR Telemetry</h3>
              <p className="text-xs text-gray-500">Real-time bot navigation, active picker coordinates, and zone heatmaps.</p>
            </div>
            <div className="flex gap-3 text-xs font-semibold">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div> Zone A-D</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-purple-600 rounded-full"></div> Active AMRs</div>
            </div>
          </div>

          <div className="relative w-full h-[600px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-6 shadow-inner">
            <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
            
            {/* Receiving Dock */}
            <div className="absolute top-0 left-0 w-48 h-full bg-slate-800/60 border-r border-slate-700 flex flex-col items-center justify-around py-8">
              <span className="rotate-[-90deg] font-mono text-xs font-bold text-slate-400 tracking-widest uppercase">Receiving Docks</span>
              {[1,2,3,4].map(dock => (
                <div key={dock} className="w-4/5 h-14 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center font-bold text-slate-200 text-xs">Dock 0{dock}</div>
              ))}
            </div>

            {/* Zone A */}
            <div className="absolute top-12 left-60 w-64 h-48 bg-pink-950/40 border border-pink-500/30 rounded-xl flex flex-col items-center justify-center p-4">
              <span className="font-bold text-pink-300 text-sm">Zone A: Fast Pick Apparels</span>
              <span className="text-[10px] text-red-400 mt-1 bg-red-950/60 px-2 py-0.5 rounded border border-red-800">94% Capacity - High Congestion</span>
            </div>

            {/* Zone B */}
            <div className="absolute top-12 left-[36rem] w-64 h-48 bg-blue-950/40 border border-blue-500/30 rounded-xl flex flex-col items-center justify-center p-4">
              <span className="font-bold text-blue-300 text-sm">Zone B: Electronics Vault</span>
              <span className="text-[10px] text-emerald-400 mt-1 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">Optimal (62%)</span>
            </div>

            {/* Zone C */}
            <div className="absolute top-72 left-60 w-64 h-48 bg-amber-950/40 border border-amber-500/30 rounded-xl flex flex-col items-center justify-center p-4">
              <span className="font-bold text-amber-300 text-sm">Zone C: Home & Kitchen</span>
              <span className="text-[10px] text-amber-400 mt-1 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">Moderate (88%)</span>
            </div>

            {/* Zone D */}
            <div className="absolute top-72 left-[36rem] w-64 h-48 bg-slate-800/40 border border-slate-700 rounded-xl flex flex-col items-center justify-center p-4">
              <span className="font-bold text-slate-300 text-sm">Zone D: Bulk Pallets</span>
              <span className="text-[10px] text-emerald-400 mt-1 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">Normal (41%)</span>
            </div>

            {/* Dispatch Docks */}
            <div className="absolute top-0 right-0 w-48 h-full bg-slate-800/60 border-l border-slate-700 flex flex-col items-center justify-around py-8">
              <span className="rotate-[-90deg] font-mono text-xs font-bold text-slate-400 tracking-widest uppercase">Dispatch Bay</span>
              <div className="flex flex-col gap-4 w-4/5 px-2">
                {[1, 2, 3].map(bay => (
                  <div key={bay} className="h-20 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex flex-col items-center justify-center text-emerald-300 text-xs font-bold">
                    <Truck size={16} className="mb-1" /> Bay 0{bay}
                  </div>
                ))}
              </div>
            </div>

            {/* AMR Bots */}
            {[
              { id: 1, x: 38, y: 55, status: 'Picking' },
              { id: 2, x: 45, y: 30, status: 'Transit' },
              { id: 3, x: 58, y: 65, status: 'Charging' },
            ].map(amr => (
              <div 
                key={amr.id}
                className="absolute w-8 h-8 bg-purple-600 rounded-full shadow-2xl flex items-center justify-center text-white border-2 border-white z-20 animate-pulse"
                style={{ top: `${amr.y}%`, left: `${amr.x}%` }}
                title={`AMR #0${amr.id} - ${amr.status}`}
              >
                <Truck size={14} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals for Quick Actions */}
      {announcementModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <Megaphone className="text-[#f43397]" /> Broadcast Floor Paging & Announcement
            </h3>
            <p className="text-xs text-gray-500">This message will be broadcast instantly to all warehouse floor speakers and staff mobile terminals.</p>
            <textarea
              rows={4}
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              placeholder="e.g. All floor supervisors please assemble at Zone A loading dock for shift realignment..."
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#f43397] focus:outline-none"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setAnnouncementModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setAnnouncementModalOpen(false);
                  showToast('📢 Floor announcement broadcast successfully to all zones.');
                  setAnnouncementText('');
                }}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-[#f43397] text-white hover:bg-[#d82481] shadow-md"
              >
                Broadcast Now
              </button>
            </div>
          </div>
        </div>
      )}

      {handoverModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <BarChart3 className="text-[#f43397]" /> Shift Handover Summary & Audit Report
            </h3>
            <div className="bg-gray-50 p-4 rounded-xl space-y-3 text-sm border border-gray-200">
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-semibold">Shift Lead:</span>
                <span className="font-bold text-gray-900">Rajesh Sharma (Shift B)</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-semibold">Total Units Processed:</span>
                <span className="font-bold text-gray-900">8,432 Units</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-semibold">Inventory Accuracy:</span>
                <span className="font-bold text-emerald-600">99.82%</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500 font-semibold">Pending Escalations:</span>
                <span className="font-bold text-amber-600">2 Conveyor Maintenance Logs</span>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setHandoverModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  setHandoverModalOpen(false);
                  showToast('📄 Shift handover report generated and emailed to operations leads.');
                }}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-[#f43397] text-white hover:bg-[#d82481] shadow-md flex items-center gap-2"
              >
                <Download size={16} /> Export PDF Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
