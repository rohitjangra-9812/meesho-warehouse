import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import React, { useEffect, useState } from 'react';
import { fetchApi } from '../lib/api.ts';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Truck, Clock, MapPin, Package, Fuel, AlertCircle, CheckCircle2, Search, Plus, X, ArrowRight, Zap, Bot, ThumbsUp, XCircle, Bell, BellRing, FileText, Printer, ClipboardCheck, RefreshCw, List, ArrowUp } from 'lucide-react';

const TurnaroundTimer = ({ assignedAt }: { assignedAt: number }) => {
  const [elapsed, setElapsed] = useState(Date.now() - assignedAt);
  
  useEffect(() => {
    const int = setInterval(() => setElapsed(Date.now() - assignedAt), 1000);
    return () => clearInterval(int);
  }, [assignedAt]);
  
  const hours = Math.floor(elapsed / 3600000).toString().padStart(2, '0');
  const mins = Math.floor((elapsed % 3600000) / 60000).toString().padStart(2, '0');
  const secs = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0');
  
  return <span className="font-mono">{hours}:{mins}:{secs}</span>;
};


const staffingData = [
  { time: '00:00', inbound: 12, outbound: 8, staffing: 15 },
  { time: '04:00', inbound: 15, outbound: 10, staffing: 18 },
  { time: '08:00', inbound: 45, outbound: 35, staffing: 50 },
  { time: '12:00', inbound: 55, outbound: 60, staffing: 65 },
  { time: '16:00', inbound: 40, outbound: 50, staffing: 48 },
  { time: '20:00', inbound: 25, outbound: 20, staffing: 25 },
];

export function DockScreen() {

  const [showGatePassModal, setShowGatePassModal] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState<any>(null);
  const [courierPartner, setCourierPartner] = useState('Delhivery');
  const [manifestGenerated, setManifestGenerated] = useState(false);

  const handleOpenGatePass = (dock: any) => {
    setSelectedTruck(dock);
    setShowGatePassModal(true);
    setManifestGenerated(false);
  };

  const generatePDFManifest = () => {
    const doc = new jsPDF();
    doc.text("Meesho Outbound 3PL Courier Handover Manifest", 14, 20);
    doc.setFontSize(10);
    doc.text("Partner: " + courierPartner, 14, 30);
    doc.text("Dock Station: " + (selectedTruck?.bay || 'Dock #04'), 14, 36);
    doc.text("Vehicle Number: KA-01-HH-9920", 14, 42);
    doc.text("Timestamp: " + new Date().toLocaleString(), 14, 48);

    autoTable(doc, {
      startY: 55,
      head: [['AWB Tracking', 'Destination Hub', 'Package Count', 'Weight (Kg)', 'Seal Status']],
      body: [
        ['AWB-8349281X', 'BLR Hub - South', '320 pkgs', '410 kg', 'Intact #9921'],
        ['AWB-1122334X', 'DEL Hub - North', '450 pkgs', '580 kg', 'Intact #9922'],
        ['AWB-5566778Y', 'BOM Hub - West', '280 pkgs', '340 kg', 'Intact #9923'],
      ]
    });

    doc.save("Courier_Manifest_" + courierPartner + ".pdf");
    setManifestGenerated(true);
  };

  const [docks, setDocks] = useState<any[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  const [autoAssign, setAutoAssign] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([
    { id: 'sugg-1', vehicle: 'DL-01-XY-9876', type: 'Trailer', eta: '10m', cargo: 'Electronics', priority: 'High', suggestedBay: 5, reason: 'Fastest turnaround path.' },
    { id: 'sugg-2', vehicle: 'MH-04-AB-1234', type: '32ft Container', eta: '25m', cargo: 'Apparel', priority: 'Medium', suggestedBay: 2, reason: 'Extended dwell tolerance.' }
  ]);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<'live' | 'crossdock' | 'history'>('live');
  const [crossdockItems, setCrossdockItems] = useState([
    { asnId: 'ASN-8821', supplier: 'Samsung India Corp', sku: 'SKU-ELECT-092', qty: 450, backorders: 430, zone: 'Electronics Zone B', status: 'Ready for Cross-Dock', matchedOrder: 'ORD-9821' },
    { asnId: 'ASN-8822', supplier: 'Zara Apparel Ltd', sku: 'SKU-FASH-118', qty: 620, backorders: 600, zone: 'Apparel Zone A', status: 'Ready for Cross-Dock', matchedOrder: 'ORD-9822' },
    { asnId: 'ASN-8823', supplier: 'Nykaa Cosmetics', sku: 'SKU-COSM-331', qty: 280, backorders: 275, zone: 'Cosmetics Zone C', status: 'Staged for Dispatch', matchedOrder: 'ORD-9823' },
    { asnId: 'ASN-8824', supplier: 'OnePlus Direct', sku: 'SKU-ELEC-440', qty: 150, backorders: 148, zone: 'High-Value Vault', status: 'Ready for Cross-Dock', matchedOrder: 'ORD-9824' }
  ]);
  const [crossdockToast, setCrossdockToast] = useState<string | null>(null);

  const showCrossdockToast = (msg: string) => {
    setCrossdockToast(msg);
    setTimeout(() => setCrossdockToast(null), 4000);
  };

  const handleGenerateStagingLabel = (item: any) => {
    showCrossdockToast(`🏷️ Generated Cross-Dock Staging Label for ${item.asnId} (${item.sku}) - Bypassed Put-Away!`);
  };

  const handleGenerateHandoverSheet = (item: any) => {
    showCrossdockToast(`📋 Generated Courier Dispatch Handover Sheet for ${item.matchedOrder} (${item.supplier})`);
  };
  const [dockHistory, setDockHistory] = useState<any[]>([]);

  const fetchHistory = async () => {
    try {
      const res = await fetchApi('/v3/docks/history');
      setDockHistory(res.history || []);
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') fetchHistory();
  }, [activeTab]);


  const [lookupMode, setLookupMode] = useState(true);
  const [vehicleHistory, setVehicleHistory] = useState<any[]>([]);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [assignTargetBay, setAssignTargetBay] = useState<number | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!formData.vehicleNo) return;
    setIsLookingUp(true);
    try {
      const res = await fetchApi(`/v3/vehicles/${formData.vehicleNo}/history`);
      setVehicleHistory(res.history || []);
      if(res.history && res.history.length > 0) {
        const last = res.history[res.history.length - 1];
        setFormData(prev => ({
          ...prev, 
          driverName: last.driver || prev.driverName,
          material: last.cargo || prev.material
        }));
      }
    } catch(err) {
      console.error(err);
      setVehicleHistory([]);
    } finally {
      setIsLookingUp(false);
      setLookupMode(false);
    }
  };

  const [selectedDockId, setSelectedDockId] = useState<number | null>(null);



  const [alerts, setAlerts] = useState<any[]>([]);
  const [browserAlertsEnabled, setBrowserAlertsEnabled] = useState(Notification.permission === 'granted');

  useEffect(() => {
    const checkETAs = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every 10 seconds to get a high-priority alert for simulation
        const priorityVehicles = ['Trailer', '32ft Container', 'Reefer'];
        const type = priorityVehicles[Math.floor(Math.random() * priorityVehicles.length)];
        const vNo = 'MH-' + Math.floor(10+Math.random()*90) + '-AB-' + Math.floor(1000+Math.random()*9000);
        const bay = Math.floor(1 + Math.random() * 20);
        const newAlert = {
          id: Date.now(),
          title: 'High-Priority Inbound Arrival',
          message: `Vehicle ${vNo} (${type}) is arriving at Bay ${bay} in < 2 mins.`
        };
        
        setAlerts(prev => [...prev, newAlert]);
        
        if (Notification.permission === 'granted') {
          new Notification(newAlert.title, { body: newAlert.message, icon: '/favicon.ico' });
        }
        
        setTimeout(() => {
          setAlerts(prev => prev.filter(a => a.id !== newAlert.id));
        }, 8000);
      }
    }, 15000);
    return () => clearInterval(checkETAs);
  }, []);

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          setBrowserAlertsEnabled(true);
          new Notification("Alerts Enabled", { body: "You will now receive high-priority dock alerts." });
        }
      });
    } else {
      alert("Browser notifications not supported.");
    }
  };

  
  const [formData, setFormData] = useState({
    vehicleNo: '', vehicleType: '32ft Container', driverName: '', driverMobile: '',
    origin: 'Bhiwandi Hub', material: 'Electronics', quantity: 500, distance: 150, fuel: 30, efficiency: 5.0, status: 'Inbound Unloading'
  });

  const fetchDocks = async () => {
    try {
      const res = await fetchApi('/v3/docks');
      setDocks(res?.docks || []);
      setStats(res.stats);
      if (res?.queue) setQueue(res.queue);
      if (res?.autoDockEnabled !== undefined) setAutoAssign(res.autoDockEnabled);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocks();
    const interval = setInterval(fetchDocks, 5000); // refresh every 5 seconds for status sync
    return () => clearInterval(interval);
  }, []);

  const handleRelease = async (id: number) => {
    if(confirm('Are you sure you want to release this dock? Trip logs will be archived.')) {
      await fetchApi(`/v3/docks/${id}/release`, { method: 'POST' });
      fetchDocks();
    }
  };

  const handleToggleAuto = async () => {
    try {
      const res = await fetchApi('/v3/docks/toggle-auto', { method: 'POST' });
      setAutoAssign(res.autoDockEnabled);
    } catch(e) {
      console.error(e);
    }
  };

  const handlePrioritize = async (vehicleNo: string) => {
    try {
      await fetchApi('/v3/docks/queue/prioritize', {
        method: 'POST',
        body: JSON.stringify({ vehicleNo })
      });
      fetchDocks();
    } catch(e) {
      console.error(e);
    }
  };

  const handleSimulate = async () => {
    try {
      await fetchApi('/v3/docks/simulate-arrival', { method: 'POST' });
      fetchDocks();
    } catch(e) {
      alert("No available docks to simulate arrival!");
    }
  };

  const handleAssign = async (e: React.FormEvent, forceBayId?: number) => {
    e.preventDefault();
    const targetId = forceBayId || selectedDockId;
    if (!targetId) return;
    
    try {
      await fetchApi(`/v3/docks/${targetId}/assign`, {
        method: 'POST',
        body: JSON.stringify({
          status: formData.status,
          vehicle: {
            vehicleNo: formData.vehicleNo.toUpperCase(),
            vehicleType: formData.vehicleType,
            driverName: formData.driverName,
            driverMobile: formData.driverMobile,
            origin: formData.origin,
            material: formData.material,
            quantity: formData.quantity,
            distance: formData.distance,
            fuel: formData.fuel,
            efficiency: formData.efficiency
          }
        })
      });
      setIsModalOpen(false);
      fetchDocks();
    } catch (e: any) {
      alert(e.message);
    }
  };

  


  const openAssignModal = (id?: number) => {
    setSelectedDockId(id || null);
    setAssignTargetBay(id || null);
    setLookupMode(true);
    setVehicleHistory([]);
    setFormData({
      vehicleNo: '', vehicleType: '32ft Container', driverName: '', driverMobile: '',
      origin: 'Bhiwandi Hub', material: 'Electronics', quantity: 500, distance: 150, fuel: 30, efficiency: 5.0, status: 'Inbound Unloading'
    });
    setIsModalOpen(true);
  };
  
  const handleReleaseWithConfirm = (id: number) => {
    if (window.confirm("Are you sure you want to release this bay and archive the trip data?")) {
      handleRelease(id);
    }
  };


  const filteredDocks = docks.filter(d => {
    const s = search.toLowerCase();
    if (d.id.toString().includes(s)) return true;
    if (d.status.toLowerCase().includes(s)) return true;
    if (d.vehicle) {
      if (d.vehicle.vehicleNo.toLowerCase().includes(s)) return true;
      if (d.vehicle.driverName.toLowerCase().includes(s)) return true;
      if (d.vehicle.origin.toLowerCase().includes(s)) return true;
    }
    return false;
  });

  // Calculate Avg TAT
  const occupiedDocks = docks.filter(d => d.vehicle);
  const avgTatMs = occupiedDocks.length > 0 
    ? occupiedDocks.reduce((acc, d) => acc + (Date.now() - d.vehicle.assignedAt), 0) / occupiedDocks.length 
    : 0;
  const avgTatHours = Math.floor(avgTatMs / 3600000);
  const avgTatMins = Math.floor((avgTatMs % 3600000) / 60000);

  return (
    <div className="space-y-6 relative pb-12">
      
      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {alerts.map(alert => (
          <div key={alert.id} className="bg-gray-900 border border-gray-800 text-white p-4 rounded-xl shadow-2xl flex items-start gap-4 animate-in slide-in-from-right-8 duration-300 max-w-sm">
            <div className="bg-red-500/20 p-2 rounded-lg text-red-400 shrink-0">
              <AlertCircle size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">{alert.title}</h4>
              <p className="text-gray-300 text-sm mt-1 leading-snug">{alert.message}</p>
            </div>
            <button onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))} className="text-gray-500 hover:text-white transition-colors shrink-0 p-1">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Header & Stats */}

      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Truck className="text-blue-600"/> Dock Management Bay</h2>
          <p className="text-sm text-gray-500 mt-1">Live tracking of 20 warehouse docks, fleet fuel, and turnaround analytics</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={requestNotificationPermission} 
            className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm border ${browserAlertsEnabled ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
          >
            {browserAlertsEnabled ? <BellRing size={16} /> : <Bell size={16} />} 
            {browserAlertsEnabled ? 'Browser Alerts Active' : 'Enable Browser Alerts'}
          </button>
          <button 
            onClick={() => setIsReportModalOpen(true)}
            className="px-3 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm"
          >
            <FileText size={16} /> 
            Generate Report
          </button>

          <button 
            onClick={() => openAssignModal()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Truck size={16} /> Check-In Vehicle
          </button>


          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search bay, truck, driver..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          <button 
            onClick={handleSimulate}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-bold text-sm hover:bg-purple-200 transition-colors"
          >
            <Zap size={16} /> Force 20m Arrival
          </button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500">Active Occupancy</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.occupancyRate}</p>
            </div>
            <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center"><Truck className="text-blue-600" size={24} /></div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500">Average TAT</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{avgTatHours}h {avgTatMins}m</p>
            </div>
            <div className="h-12 w-12 bg-orange-50 rounded-xl flex items-center justify-center"><Clock className="text-orange-600" size={24} /></div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500">Total Inbound</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalInboundToday.toLocaleString('en-IN')} <span className="text-sm font-medium text-gray-500">units</span></p>
            </div>
            <div className="h-12 w-12 bg-green-50 rounded-xl flex items-center justify-center"><Package className="text-green-600" size={24} /></div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500">Fleet Fuel Tracked</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalFuelToday.toLocaleString('en-IN')} <span className="text-sm font-medium text-gray-500">Liters</span></p>
            </div>
            <div className="h-12 w-12 bg-red-50 rounded-xl flex items-center justify-center"><Fuel className="text-red-600" size={24} /></div>
          </div>
        </div>
      )}


      {/* Staffing Demand Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">24H Staffing Demand Forecast</h3>
            <p className="text-sm text-gray-500">Predicted dock activity vs recommended labor allocation</p>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={staffingData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dx={-10} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dx={10} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Area yAxisId="left" type="monotone" dataKey="inbound" name="Inbound Trucks" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorInbound)" />
              <Area yAxisId="left" type="monotone" dataKey="outbound" name="Outbound Trucks" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorOutbound)" />
              <Line yAxisId="right" type="monotone" dataKey="staffing" name="Required Staff" stroke="#f59e0b" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {crossdockToast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-blue-500/50 flex items-center gap-3 animate-in fade-in slide-in-from-top-5">
          <Zap className="text-blue-400 animate-pulse" size={20} />
          <span className="text-sm font-semibold">{crossdockToast}</span>
        </div>
      )}

      {/* Tab Selector */}
      <div className="flex border-b border-gray-200 gap-6">
        <button
          onClick={() => setActiveTab('live')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'live' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Truck size={18} /> Live Bays & Queue
        </button>
        <button
          onClick={() => setActiveTab('crossdock')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'crossdock' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <ClipboardCheck size={18} /> Cross-Docking Hub (Fast-Track)
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Clock size={18} /> Dock History & Logs
        </button>
      </div>

      {/* Docks Grid */}
      {activeTab === 'live' ? (
<>

        {/* Waiting Queue & Automation Control */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <List size={20} className="text-blue-500" />
                Automated Dock Queue
              </h3>
              <p className="text-sm text-gray-500">Vehicles waiting to be automatically assigned (30m rotation)</p>
            </div>
            <button 
              onClick={handleToggleAuto}
              className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors ${autoAssign ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {autoAssign ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              {autoAssign ? 'Auto-Assign Enabled' : 'Auto-Assign Disabled'}
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {queue.length === 0 ? (
               <div className="text-sm text-gray-500 italic py-4">No vehicles in queue</div>
            ) : (
               queue.map((q, idx) => (
                 <div key={idx} className="min-w-[250px] bg-gray-50 border border-blue-100 rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                   
                   <div className="flex justify-between items-center ml-2">
                     <span className="font-bold text-gray-900">{q.vehicleNo}</span>
                     <span className="text-xs font-bold text-blue-700 px-2 py-0.5 bg-blue-100 rounded-full">Queue #{idx + 1}</span>
                   </div>
                   <div className="text-xs text-gray-600 flex items-center gap-1 ml-2 mt-1"><Package size={12} className="text-gray-400"/> {q.material}</div>
                   <div className="text-xs text-gray-600 flex items-center gap-1 ml-2"><Truck size={12} className="text-gray-400"/> {q.vehicleType}</div>
                   {idx > 0 && (
                     <button 
                       onClick={() => handlePrioritize(q.vehicleNo)} 
                       className="absolute bottom-3 right-3 p-1.5 bg-white border border-blue-200 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
                       title="Prioritize to Next in Queue"
                     >
                       <ArrowUp size={14} />
                     </button>
                   )}

                 </div>
               ))
            )}
          </div>
        </div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading && docks.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">Loading dock statuses...</div>
        ) : filteredDocks.map(dock => {
          
          const isOccupied = (dock.status === 'Occupied / Loading' || dock.status === 'Inbound Unloading') && dock.vehicle;
          const isAvail = dock.status === 'Available';
          const isMaint = dock.status === 'Maintenance';
          const isRsvd = dock.status === 'Reserved';

          return (
            <div key={dock.id} className={`rounded-2xl border flex flex-col overflow-hidden transition-all \${
              isOccupied ? 'bg-white border-blue-200 shadow-md' : 
              isAvail ? 'bg-gray-50 border-gray-200 border-dashed' : 
              isMaint ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'
            }`}>
              {/* Card Header */}
              <div className={`px-4 py-3 border-b flex justify-between items-center \${
                isOccupied ? 'bg-blue-50/50 border-blue-100' : 
                isAvail ? 'border-gray-200' : 
                isMaint ? 'border-red-200' : 'border-orange-200'
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`font-black text-lg \${isOccupied ? 'text-blue-900' : 'text-gray-500'}`}>
                    BAY #{dock.id.toString().padStart(2, '0')}
                  </span>
                </div>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded \${
                  dock.status === 'Inbound Unloading' ? 'bg-purple-100 text-purple-700' :
                  dock.status === 'Occupied / Loading' ? 'bg-blue-100 text-blue-700' :
                  isAvail ? 'bg-green-100 text-green-700' :
                  isMaint ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {dock.status}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between min-h-[220px]">
                {isOccupied && dock.vehicle ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-gray-900 text-lg">{dock.vehicle.vehicleNo}</p>
                          <p className="text-xs font-semibold text-gray-500">{dock.vehicle.vehicleType}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Live TAT</p>
                          <div className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded text-sm mt-0.5">
                            <TurnaroundTimer assignedAt={dock.vehicle.assignedAt} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm border-t border-gray-100 pt-3">
                      <div className="col-span-2 flex items-center gap-2 text-gray-700">
                        <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                        <span className="font-medium truncate">{dock.vehicle.driverName}</span>
                        <span className="text-xs text-gray-500 ml-auto">+91 {dock.vehicle.driverMobile}</span>
                      </div>
                      <div className="col-span-2 flex items-center gap-2 text-gray-700">
                        <MapPin size={14} className="text-red-500 shrink-0" />
                        <span className="font-medium truncate">From: {dock.vehicle.origin}</span>
                      </div>
                      
                      <div className="col-span-2 bg-gray-50 p-2 rounded border border-gray-100 mt-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5"><Package size={12}/> {dock.vehicle.material}</span>
                          <span className="text-xs font-bold text-blue-700">{dock.vehicle.quantity.toLocaleString('en-IN')} Units</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] text-gray-500 font-mono">
                          <span className="flex items-center gap-1"><Fuel size={12}/> {dock.vehicle.fuel}L</span>
                          <span>{dock.vehicle.distance} KM</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : isAvail ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70 hover:opacity-100 transition-opacity">
                    <Truck size={40} className="text-gray-300 mb-3" />
                    <p className="text-gray-500 text-sm font-medium">Bay is currently empty</p>
                    <button 
                      onClick={() => openAssignModal(dock.id)}
                      className="mt-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs font-bold shadow-sm hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all flex items-center gap-1.5"
                    >
                      <Plus size={14} /> Assign Vehicle
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <AlertCircle size={40} className={isMaint ? 'text-red-300 mb-3' : 'text-orange-300 mb-3'} />
                    <p className={`text-sm font-bold \${isMaint ? 'text-red-600' : 'text-orange-600'}`}>
                      {isMaint ? 'Under Maintenance' : 'Reserved Slot'}
                    </p>
                  </div>
                )}
              </div>

              {/* Card Footer actions */}
              {isOccupied && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                  <button 
                    onClick={() => handleReleaseWithConfirm(dock.id)}
                    className="w-full py-2 bg-white border border-red-200 text-red-600 rounded-lg text-xs font-bold shadow-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                  >
                    Release Bay & Archive Trip <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      
      {/* Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white/95 backdrop-blur z-10 shrink-0">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText size={20} className="text-indigo-600"/> Daily Dock Activity Report
              </h3>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm">
                  <Printer size={16} /> Print / PDF
                </button>
                <button onClick={() => setIsReportModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-8 overflow-y-auto print-area text-black">
              {/* Report Header for Print */}
              <div className="mb-8 border-b pb-4">
                <h1 className="text-3xl font-black text-gray-900 mb-1">Warehouse Operations Summary</h1>
                <div className="flex justify-between text-gray-600 text-sm">
                  <p>Date: {new Date().toLocaleDateString()}</p>
                  <p>Generated by: System Auto-Report</p>
                </div>
              </div>

              {/* High-level stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="text-xs text-gray-500 font-bold uppercase">Total Inbound Volume</div>
                  <div className="text-2xl font-black mt-1">{stats?.totalInboundToday || 0} Units</div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="text-xs text-gray-500 font-bold uppercase">Fleet Fuel Consumed</div>
                  <div className="text-2xl font-black mt-1">{stats?.totalFuelToday || 0} Liters</div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="text-xs text-gray-500 font-bold uppercase">Average Turnaround</div>
                  <div className="text-2xl font-black mt-1">{avgTatHours}h {avgTatMins}m</div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="text-xs text-gray-500 font-bold uppercase">Active Dock Utilization</div>
                  <div className="text-2xl font-black mt-1">{(occupiedDocks.length / 20 * 100).toFixed(0)}%</div>
                </div>
              </div>

              {/* Active Docks List */}
              <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Currently Active Bays ({occupiedDocks.length})</h2>
              {occupiedDocks.length > 0 ? (
                <div className="overflow-x-auto mb-8 border rounded-lg">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-700 font-semibold border-b">
                      <tr>
                        <th className="px-4 py-3">Bay #</th>
                        <th className="px-4 py-3">Vehicle</th>
                        <th className="px-4 py-3">Driver</th>
                        <th className="px-4 py-3">Cargo</th>
                        <th className="px-4 py-3">Quantity</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {occupiedDocks.map(dock => (
                        <tr key={dock.id}>
                          <td className="px-4 py-3 font-bold">{String(dock.id).padStart(2, '0')}</td>
                          <td className="px-4 py-3 font-mono text-xs">{dock.vehicle?.vehicleNo}</td>
                          <td className="px-4 py-3">{dock.vehicle?.driverName}</td>
                          <td className="px-4 py-3">{dock.vehicle?.material}</td>
                          <td className="px-4 py-3 font-bold">{dock.vehicle?.quantity}</td>
                          <td className="px-4 py-3">
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                              {dock.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-sm mb-8">No active operations at this moment.</p>
              )}

              {/* Available Bays */}
              <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Available Bays</h2>
              <div className="flex flex-wrap gap-2">
                {docks.filter(d => !d.vehicle).map(dock => (
                  <div key={dock.id} className="px-3 py-1 bg-gray-100 border border-gray-200 text-gray-600 rounded text-sm font-mono font-bold">
                    Bay {String(dock.id).padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>
            {/* Inject a global print style to make it print well */}
            <style>{`
              @media print {
                body * {
                  visibility: hidden;
                }
                .print-area, .print-area * {
                  visibility: visible;
                }
                .print-area {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                }
              }
            `}</style>
          </div>
        </div>
      )}
      </>
      ) : activeTab === 'crossdock' ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-white p-6 rounded-2xl border border-blue-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-gray-900">Cross-Docking & Fast-Track Direct Fulfillment Hub</h3>
              <p className="text-xs text-gray-600 mt-1">Automatically matching incoming supplier ASNs against pending customer backorders. Bypasses shelf put-away for instant dispatch.</p>
            </div>
            <button 
              onClick={() => showCrossdockToast('⚡ AI Auto-Matched all incoming ASNs to pending customer backorders.')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              Run AI Cross-Dock Matcher
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {crossdockItems.map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-blue-300 transition-all">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                      {item.asnId}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">Supplier: <strong className="text-gray-900">{item.supplier}</strong></span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">{item.status}</span>
                  </div>
                  <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <span>SKU: {item.sku}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-indigo-600 font-bold">{item.zone}</span>
                  </h4>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-600 pt-1">
                    <div>Incoming Qty: <strong className="text-gray-900">{item.qty} units</strong></div>
                    <div>Matched Backorders: <strong className="text-green-600 font-bold">{item.backorders} units</strong></div>
                    <div>Order Ref: <strong className="font-mono text-gray-900">{item.matchedOrder}</strong></div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <button
                    onClick={() => handleGenerateStagingLabel(item)}
                    className="flex-1 md:flex-none px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <ClipboardCheck size={14} className="text-blue-600" /> Staging Label
                  </button>
                  <button
                    onClick={() => handleGenerateHandoverSheet(item)}
                    className="flex-1 md:flex-none px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <FileText size={14} /> Courier Handover Sheet
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <ClipboardCheck size={18} className="text-gray-500" /> Automated Assignment Log
            </h3>
            <button onClick={fetchHistory} className="p-1 text-gray-400 hover:text-gray-700 transition-colors"><RefreshCw size={16}/></button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-[11px] font-bold tracking-wider text-gray-500 uppercase border-b border-gray-100">
                  <th className="px-6 py-3">Vehicle</th>
                  <th className="px-6 py-3 text-center">Bay</th>
                  <th className="px-6 py-3">Cargo Details</th>
                  <th className="px-6 py-3">Assigned At</th>
                  <th className="px-6 py-3">Released At</th>
                  <th className="px-6 py-3 text-right">Turnaround</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {dockHistory.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-medium">No automated assignments logged yet. Vehicles will appear here after they are auto-released.</td></tr>
                ) : dockHistory.map((log, i) => {
                  const assigned = new Date(log.assignedAt);
                  const released = new Date(log.releasedAt);
                  const mins = Math.floor((released.getTime() - assigned.getTime()) / 60000);
                  const secs = Math.floor(((released.getTime() - assigned.getTime()) % 60000) / 1000);
                  
                  return (
                    <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-3">
                        <span className="font-mono font-bold text-gray-900 block">{log.vehicleNo}</span>
                        <span className="text-xs text-gray-500">Driver: {log.driverName}</span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-800 font-black rounded-md text-xs border border-gray-200">
                          #{String(log.dockId).padStart(2, '0')}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-700 font-semibold text-xs">{log.material}</td>
                      <td className="px-6 py-3 text-gray-500 font-mono text-xs">{assigned.toLocaleTimeString()}</td>
                      <td className="px-6 py-3 text-gray-500 font-mono text-xs">{released.toLocaleTimeString()}</td>
                      <td className="px-6 py-3 text-right">
                        <span className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded border border-gray-200 text-xs">
                          {mins}m {secs}s
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Assign Modal */}

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-20">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Truck size={20} className="text-blue-600"/> Vehicle Check-In & Assignment
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {/* STEP 1: Lookup */}
              {lookupMode ? (
                <form onSubmit={handleLookup} className="space-y-6">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center mb-6">
                    <Truck size={48} className="mx-auto text-blue-300 mb-4" />
                    <h4 className="text-lg font-bold text-blue-900 mb-2">Step 1: Identify Vehicle</h4>
                    <p className="text-sm text-blue-700 max-w-md mx-auto">Enter the vehicle registration or license plate number to pull trip history and initialize the check-in process.</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Vehicle License Plate</label>
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        required
                        value={formData.vehicleNo} 
                        onChange={e => setFormData({...formData, vehicleNo: e.target.value.toUpperCase()})} 
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono placeholder:normal-case placeholder:font-sans text-lg" 
                        placeholder="e.g. MH-04-AB-1234" 
                      />
                      <button 
                        type="submit"
                        disabled={!formData.vehicleNo || isLookingUp}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2 shadow-sm"
                      >
                        {isLookingUp ? 'Searching...' : <><Search size={18} /> Lookup History</>}
                      </button>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-gray-200 flex justify-end gap-3 mt-8">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                      Cancel Check-In
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-8">
                  {/* STEP 2: History & Assignment */}
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <CheckCircle2 className="text-green-500" size={20} /> 
                      Vehicle Record: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-blue-700 border border-gray-200">{formData.vehicleNo}</span>
                    </h4>
                    <button type="button" onClick={() => setLookupMode(true)} className="text-xs font-bold text-gray-500 hover:text-gray-800 underline">Lookup Different Vehicle</button>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm">
                    {vehicleHistory.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Visits</p>
                          <p className="text-lg font-black text-gray-900">{vehicleHistory.length}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Avg Turnaround</p>
                          <p className="text-lg font-black text-gray-900">
                            {Math.floor(vehicleHistory.reduce((acc, curr) => acc + curr.turnaroundMs, 0) / vehicleHistory.length / 60000)} mins
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Last Driver</p>
                          <p className="text-sm font-semibold text-gray-900 mt-1">{vehicleHistory[vehicleHistory.length-1].driver || 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Last Cargo</p>
                          <p className="text-sm font-semibold text-gray-900 mt-1">{vehicleHistory[vehicleHistory.length-1].cargo || 'General'}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <AlertCircle className="text-orange-400 mx-auto mb-2" size={24} />
                        <p className="text-sm font-bold text-gray-900">No prior visit history found.</p>
                        <p className="text-xs text-gray-500">This appears to be a new vehicle registration for this facility.</p>
                      </div>
                    )}
                  </div>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!assignTargetBay) {
                      alert("Please select a dock bay for assignment.");
                      return;
                    }
                    handleAssign(e, assignTargetBay);
                  }}>
                    
                    <h4 className="text-sm font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Logistics Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Driver Name</label>
                        <input required type="text" value={formData.driverName} onChange={e => setFormData({...formData, driverName: e.target.value})} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Cargo Material</label>
                        <input required type="text" value={formData.material} onChange={e => setFormData({...formData, material: e.target.value})} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Operation</label>
                        <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                          {['Inbound Unloading', 'Occupied / Loading'].map(d => <option key={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Select & Assign Dock Bay</h4>
                    
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-2 mb-8">
                      {docks.map(dock => {
                        const isAvail = dock.status === 'Available';
                        const isSelected = assignTargetBay === dock.id;
                        return (
                          <button
                            key={dock.id}
                            type="button"
                            disabled={!isAvail && !isSelected}
                            onClick={() => setAssignTargetBay(dock.id)}
                            className={`p-2 text-center rounded-lg border-2 transition-all ${
                              isSelected 
                                ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm scale-105 z-10' 
                                : isAvail 
                                  ? 'border-gray-200 bg-white hover:border-blue-300 text-gray-600' 
                                  : 'border-gray-100 bg-gray-50 text-gray-400 opacity-50 cursor-not-allowed'
                            }`}
                          >
                            <span className="block text-xs font-black">BAY</span>
                            <span className="block text-sm font-mono">{String(dock.id).padStart(2, '0')}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-6 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white/95 backdrop-blur z-20 pb-4">
                      <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                        Cancel
                      </button>
                      <button type="submit" disabled={!assignTargetBay} className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50">
                        <CheckCircle2 size={18}/> Assign to Bay {assignTargetBay ? String(assignTargetBay).padStart(2, '0') : '--'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      </div>
  );
}
