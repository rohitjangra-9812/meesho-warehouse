import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, LineChart as LineChartIcon, Map, Target, Bot, Zap, 
  ArrowRight, TrendingUp, AlertCircle, CheckCircle2, Box, Activity, 
  Camera, Users, ShieldCheck, Clock, Check, Truck, MonitorPlay, Timer, 
  Gauge, Database, BarChart3, Settings2, Play, Wrench, MessageSquare, Mic, Sparkles, Cpu, Send, Info
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart
} from 'recharts';

const demandData = [
  { month: 'Jan', 'Wireless Earbuds': 400, 'Smart Watches': 240, predicted: 420 },
  { month: 'Feb', 'Wireless Earbuds': 300, 'Smart Watches': 139, predicted: 310 },
  { month: 'Mar', 'Wireless Earbuds': 550, 'Smart Watches': 480, predicted: 520 },
  { month: 'Apr', 'Wireless Earbuds': 480, 'Smart Watches': 390, predicted: 500 },
  { month: 'May', 'Wireless Earbuds': 600, 'Smart Watches': 480, predicted: 650 },
  { month: 'Jun', 'Wireless Earbuds': 700, 'Smart Watches': 600, predicted: 780 },
];

const slottingRecommendations = [
  { id: 'SKU-8912', name: 'Cotton T-Shirt', currentZone: 'Zone D (Deep Storage)', newZone: 'Zone A (Fast Pick)', reason: 'Seasonal Summer Demand Surge', confidence: 94 },
  { id: 'SKU-3321', name: 'Smart Watch', currentZone: 'Zone C (Mid)', newZone: 'Zone A (Fast Pick)', reason: 'High Regional Velocity (Diwali Prep)', confidence: 89 },
  { id: 'SKU-1092', name: 'Winter Jacket', currentZone: 'Zone B (Active)', newZone: 'Zone E (Cold Storage)', reason: 'Off-season decay', confidence: 98 },
  { id: 'SKU-5541', name: 'Bluetooth Speaker', currentZone: 'Zone D (Deep Storage)', newZone: 'Zone B (Active)', reason: 'Marketing campaign detected', confidence: 82 },
];

const activeWaves = [
  { id: 'WAVE-1092', type: 'AMR Pick', orders: 124, progress: 85, distanceSaved: '4.2 km', assigned: ['AMR-01', 'AMR-04'] },
  { id: 'WAVE-1093', type: 'Human + AMR', orders: 86, progress: 42, distanceSaved: '2.8 km', assigned: ['Picker-7', 'AMR-02'] },
  { id: 'WAVE-1094', type: 'Human Pick', orders: 45, progress: 12, distanceSaved: '1.1 km', assigned: ['Picker-3', 'Picker-9'] },
];

export function AIOperationsScreen() {

  const [telemetry, setTelemetry] = useState({
    vibration: '2.4 mm/s',
    temperature: '68.4 °C',
    beltSpeed: '1.2 m/s',
    status: 'Warning'
  });
  const [workOrderCreated, setWorkOrderCreated] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      // Fluctuate slightly to simulate live IoT sensors
      const vib = (2.2 + Math.random() * 0.8).toFixed(1);
      const temp = (67 + Math.random() * 3).toFixed(1);
      setTelemetry({
        vibration: vib + ' mm/s',
        temperature: temp + ' °C',
        beltSpeed: '1.2 m/s',
        status: Number(vib) > 2.7 ? 'Critical Alert' : 'Normal'
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const createMaintenanceWorkOrder = () => {
    setWorkOrderCreated(true);
  };

  
const visionEvents = [
  { id: 'SCN-8821', time: '10:42 AM', type: 'Dimension Mismatch', sku: 'SKU-9921', expected: '20x10x5 cm', actual: '22x12x6 cm', status: 'Flagged' },
  { id: 'SCN-8822', time: '10:45 AM', type: 'Label Read', sku: 'SKU-1022', expected: 'Verified', actual: 'Verified', status: 'Passed' },
  { id: 'SCN-8823', time: '10:47 AM', type: 'Damage Detected', sku: 'SKU-4432', expected: 'Intact', actual: 'Crushed Corner', status: 'Rejected' },
];

const laborForecast = [
  { zone: 'Receiving', current: 12, recommended: 15, impact: 'Prevents Dock Bottleneck' },
  { zone: 'Picking', current: 45, recommended: 38, impact: 'Reduces Idle Time (-15%)' },
  { zone: 'Packing', current: 28, recommended: 35, impact: 'Meets 4PM Dispatch Surge' },
  { zone: 'Dispatch', current: 15, recommended: 15, impact: 'Balanced' }
];



const iotAlerts = [
  { id: 'EQ-CV-02', type: 'Conveyor Motor', sensor: 'Vibration', status: 'Critical', ttf: '2.4 Hours', detail: 'High frequency resonance detected in main drive shaft.' },
  { id: 'EQ-FL-14', type: 'Forklift', sensor: 'Battery Cell', status: 'Warning', ttf: '12 Days', detail: 'Cell 4 voltage dropping 15% faster than fleet average.' },
  { id: 'EQ-SR-01', type: 'High-Speed Sorter', sensor: 'Temperature', status: 'Warning', ttf: '5 Days', detail: 'Operating 4°C above nominal baseline during peak loads.' },
];

const yardQueue = [
  { truck: 'MH-04-AB-1234', eta: '10 mins', cargo: 'Electronics', priority: 'High', unldDifficulty: 'Low (Pallets)', bay: 'Bay 02', reason: 'Fastest turnaround path' },
  { truck: 'DL-01-XY-9876', eta: '25 mins', cargo: 'Apparel', priority: 'Medium', unldDifficulty: 'High (Loose)', bay: 'Bay 05', reason: 'Extended dwell tolerance' },
  { truck: 'KA-02-KL-5555', eta: '45 mins', cargo: 'FMCG', priority: 'Urgent', unldDifficulty: 'Medium', bay: 'Bay 01', reason: 'Direct routing to cold storage' }
];

const twinSimData = [
  { time: '08:00', baseline: 120, simulated: 125 },
  { time: '12:00', baseline: 180, simulated: 340 },
  { time: '16:00', baseline: 210, simulated: 420 },
  { time: '20:00', baseline: 140, simulated: 210 },
];

const [activeTab, setActiveTab] = useState<'slotting' | 'routing' | 'vision' | 'labor' | 'yard' | 'twin' | 'maintenance' | 'copilot' | 'reports' | 'climate'>('slotting');
  const [climateZones, setClimateZones] = useState([
    { name: 'Cosmetics Zone C', temp: 21.2, humidity: 45, status: 'Optimal', threshold: '24°C Max', sensorId: 'SNS-C01' },
    { name: 'Electronics Zone B', temp: 29.4, humidity: 68, status: 'Warning', threshold: '28°C Max', sensorId: 'SNS-B04' },
    { name: 'Ambient Zone A', temp: 27.5, humidity: 62, status: 'Optimal', threshold: '30°C Max', sensorId: 'SNS-A12' },
    { name: 'High-Value Vault', temp: 19.4, humidity: 40, status: 'Optimal', threshold: '22°C Max', sensorId: 'SNS-V02' }
  ]);
  const [climateToast, setClimateToast] = useState<string | null>(null);

  const showClimateToast = (msg: string) => {
    setClimateToast(msg);
    setTimeout(() => setClimateToast(null), 4000);
  };
  
  const [reportEmails, setReportEmails] = useState<string[]>(['management@warehouse.com', 'operations@warehouse.com']);
  const [newEmail, setNewEmail] = useState('');
  const [reportTime, setReportTime] = useState('18:00');
  const [schedules, setSchedules] = useState<any[]>([
    { id: 1, type: 'Daily Performance Summary', time: '18:00', format: 'PDF', emails: ['management@warehouse.com'], active: true }
  ]);

  const [chatQuery, setChatQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { id: 1, role: 'ai', content: "Hello! I'm your WMS Operations Copilot. You can ask me about stock anomalies, wave delays, or ask me to generate reports." },
    { id: 2, role: 'user', content: "Why is the throughput in Zone C dropping today?" },
    { id: 3, role: 'ai', content: "I analyzed the telemetry for Zone C. There is a 14% drop in throughput over the last 2 hours. This correlates with a predictive maintenance alert on 'Conveyor Motor CV-02' (Vibration anomaly) causing micro-stoppages, and 2 AMRs being queued for battery replacement.\n\n**Recommendation**: Temporarily re-route Wave picking to Zone D and dispatch maintenance to CV-02." }
  ]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BrainCircuit className="text-purple-600" /> AI Warehouse Intelligence
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Predictive demand forecasting, dynamic slotting, and AMR route optimization
          </p>
        </div>
        
        <div className="flex flex-wrap bg-gray-100 p-1 rounded-lg gap-1 mt-4 xl:mt-0 xl:max-w-[65%] justify-end">
          <button 
            onClick={() => setActiveTab('slotting')}
            className={`px-6 py-2 text-sm font-semibold rounded-md transition-colors flex items-center gap-2 \${
              activeTab === 'slotting' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <LineChartIcon size={16} /> Predictive Slotting
          </button>
          <button 
            onClick={() => setActiveTab('routing')}
            className={`px-6 py-2 text-sm font-semibold rounded-md transition-colors flex items-center gap-2 ${
              activeTab === 'routing' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Map size={16} /> Wave Routing & AMRs
          </button>
          <button 
            onClick={() => setActiveTab('climate')}
            className={`px-6 py-2 text-sm font-semibold rounded-md transition-colors flex items-center gap-2 ${
              activeTab === 'climate' ? 'bg-white text-purple-700 shadow-sm font-bold' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Gauge size={16} /> Climate Sensors
          </button>
        </div>
      </div>

      {activeTab === 'slotting' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Demand Forecast (6-Month Projection)</h3>
                  <p className="text-sm text-gray-500">ML model analyzing seasonality and regional buying velocity</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded text-xs font-bold">
                  <Activity size={14} /> 94.2% Accuracy
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={demandData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorEarbuds" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dx={-10} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                    <Area type="monotone" dataKey="Wireless Earbuds" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorEarbuds)" />
                    <Area type="monotone" dataKey="predicted" name="AI Forecast (Overall)" stroke="#9333ea" strokeWidth={3} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorPredicted)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Slotting Efficiency</h3>
              <p className="text-sm text-gray-500 mb-6">Current warehouse spatial allocation vs. AI optimal layout</p>
              
              <div className="flex-1 flex flex-col justify-center space-y-8">
                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-gray-700">Pick Path Density</span>
                    <span className="text-red-600">High Congestion</span>
                  </div>
                  <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 w-[85%]"></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-gray-700">AI Optimized Density</span>
                    <span className="text-green-600">Optimal Flow</span>
                  </div>
                  <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[45%]"></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3 flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-green-600" /> 
                    <span className="font-medium text-gray-700">47% reduction</span> in picker travel time expected.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Dynamic Slotting Recommendations</h3>
                <p className="text-sm text-gray-500 mt-1">Suggested SKU relocations based on velocity forecasts</p>
              </div>
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2">
                <Zap size={16} /> Execute All Moves
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4">SKU / Product</th>
                    <th className="px-6 py-4">Current Location</th>
                    <th className="px-6 py-4">AI Recommended Zone</th>
                    <th className="px-6 py-4">Primary Driver</th>
                    <th className="px-6 py-4 text-right">Confidence</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {slottingRecommendations.map((rec, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{rec.id}</div>
                        <div className="text-gray-500">{rec.name}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium">{rec.currentZone}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <ArrowRight size={14} className="text-purple-400" />
                          <span className="font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded">{rec.newZone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{rec.reason}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-mono text-green-600 font-bold">{rec.confidence}%</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-blue-600 font-semibold hover:text-blue-800 hover:underline">
                          Assign Task
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'routing' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 bg-white border border-gray-200 rounded-2xl shadow-sm p-6 relative overflow-hidden">
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Live Wave & Route Optimization</h3>
                  <p className="text-sm text-gray-500">AI clustering orders to minimize AMR and human travel distance</p>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                  <Bot size={16} className="text-blue-600" /> Active AMRs: 12
                </div>
              </div>
              
              {/* Simulated Warehouse Map / Visual */}
              <div className="relative h-[400px] w-full bg-slate-50 rounded-xl border border-slate-200 p-4 overflow-hidden">
                {/* Grid overlay */}
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                
                {/* Racks */}
                <div className="absolute top-10 left-10 w-24 h-64 bg-slate-200 rounded border border-slate-300 shadow-sm"></div>
                <div className="absolute top-10 left-48 w-24 h-64 bg-slate-200 rounded border border-slate-300 shadow-sm"></div>
                <div className="absolute top-10 right-48 w-24 h-64 bg-slate-200 rounded border border-slate-300 shadow-sm"></div>
                <div className="absolute top-10 right-10 w-24 h-64 bg-slate-200 rounded border border-slate-300 shadow-sm"></div>
                
                {/* Packing Station */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-64 h-16 bg-blue-100 border-2 border-blue-300 rounded-lg flex items-center justify-center text-blue-800 font-bold shadow-sm">
                  PACKING STATION
                </div>

                {/* Simulated SVG Path (AI Route) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
                  <path 
                    d="M 50% 90% L 50% 70% L 20% 70% L 20% 20% L 40% 20% L 40% 50% L 75% 50% L 75% 15%" 
                    fill="none" 
                    stroke="#8b5cf6" 
                    strokeWidth="4" 
                    strokeDasharray="8 8" 
                    className="animate-[dash_20s_linear_infinite]"
                  />
                  {/* Pick points */}
                  <circle cx="20%" cy="20%" r="6" fill="#8b5cf6" className="animate-pulse" />
                  <circle cx="40%" cy="50%" r="6" fill="#8b5cf6" className="animate-pulse" />
                  <circle cx="75%" cy="15%" r="6" fill="#8b5cf6" className="animate-pulse" />
                </svg>

                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-3 rounded-lg border border-slate-200 shadow-sm text-xs font-mono">
                  <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 rounded-full bg-slate-300"></div> Storage Racks</div>
                  <div className="flex items-center gap-2 mb-1"><div className="w-3 h-0.5 bg-purple-500"></div> AI Pick Path</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500"></div> Pick Locations</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Active Pick Waves</h4>
                <div className="space-y-4">
                  {activeWaves.map(wave => (
                    <div key={wave.id} className="group">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-gray-800">{wave.id}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded">{wave.type}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                        <span>{wave.orders} Orders</span>
                        <span className="text-green-600 font-medium">Saved: {wave.distanceSaved}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full \${wave.progress > 80 ? 'bg-green-500' : 'bg-blue-500'}`} 
                          style={{ width: `${wave.progress}%` }}
                        ></div>
                      </div>
                      <div className="mt-2 text-[10px] font-mono text-gray-400">
                        Assigned: {wave.assigned.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg transition-colors border border-gray-200">
                  View All Waves
                </button>
              </div>

              <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-2xl shadow-sm p-5 text-white">
                <h4 className="text-sm font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                  <Target size={16} className="text-blue-300" /> AI Routing Impact
                </h4>
                <p className="text-xs text-blue-200 mb-4 opacity-80">Daily aggregated metrics</p>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-blue-200 mb-0.5">Total Distance Saved</div>
                    <div className="text-2xl font-black">124.5 km</div>
                  </div>
                  <div>
                    <div className="text-xs text-blue-200 mb-0.5">Pick Rate Increase</div>
                    <div className="text-2xl font-black text-green-400">+34.2%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      )}
      {activeTab === 'vision' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-slate-900 text-white">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2"><Camera size={20} className="text-blue-400" /> High-Speed Camera Array (Gate 4)</h3>
                  <p className="text-sm text-slate-400 mt-1">Real-time volumetric scanning & damage detection</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <span className="text-sm font-bold text-slate-300 tracking-wider">LIVE FEED</span>
                </div>
              </div>
              <div className="p-6 bg-slate-800 relative h-[300px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 border-[4px] border-slate-700 m-8 rounded-xl flex items-center justify-center">
                  {/* Simulated Scanner View */}
                  <div className="w-48 h-32 border-2 border-dashed border-blue-500 relative">
                    <div className="absolute inset-0 bg-blue-500/20 animate-pulse"></div>
                    <div className="absolute -top-3 -left-3 border-t-2 border-l-2 border-blue-400 w-6 h-6"></div>
                    <div className="absolute -top-3 -right-3 border-t-2 border-r-2 border-blue-400 w-6 h-6"></div>
                    <div className="absolute -bottom-3 -left-3 border-b-2 border-l-2 border-blue-400 w-6 h-6"></div>
                    <div className="absolute -bottom-3 -right-3 border-b-2 border-r-2 border-blue-400 w-6 h-6"></div>
                    
                    {/* Laser line */}
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-green-400 shadow-[0_0_8px_2px_rgba(74,222,128,0.6)] animate-[scan_2s_ease-in-out_infinite]"></div>
                  </div>
                  
                  {/* Overlay Meta */}
                  <div className="absolute top-4 left-4 text-xs font-mono text-green-400 bg-slate-900/80 p-2 rounded">
                    &gt; Dims: 24 x 18 x 12 cm<br/>
                    &gt; Wgt: 1.42 kg<br/>
                    &gt; Code: 8849201992
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
               <h3 className="text-lg font-bold text-gray-900 mb-4">Inspection Stream</h3>
               <div className="space-y-4">
                 {visionEvents.map(evt => (
                   <div key={evt.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50 flex items-start gap-3">
                     <div className={`mt-1 ${evt.status === 'Passed' ? 'text-green-500' : evt.status === 'Flagged' ? 'text-orange-500' : 'text-red-500'}`}>
                       {evt.status === 'Passed' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                     </div>
                     <div className="flex-1">
                       <div className="flex justify-between items-start">
                         <p className="text-sm font-bold text-gray-900">{evt.type}</p>
                         <span className="text-xs text-gray-500">{evt.time}</span>
                       </div>
                       <p className="text-xs text-gray-600 mt-1"><span className="font-semibold">SKU:</span> {evt.sku}</p>
                       <p className="text-xs text-gray-600 mt-0.5"><span className="font-semibold">Detected:</span> {evt.actual}</p>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'labor' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Volume Forecast</h3>
                  <p className="text-sm text-gray-500">Today's Predicted Orders</p>
                </div>
              </div>
              <div className="text-4xl font-black text-gray-900">14,250</div>
              <p className="text-sm font-medium text-red-500 mt-2 flex items-center gap-1">
                <TrendingUp size={14} /> +12% vs. 30-day average
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 p-2 rounded-lg text-green-700">
                  <Clock size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Overtime Saved</h3>
                  <p className="text-sm text-gray-500">via Predictive Planning</p>
                </div>
              </div>
              <div className="text-4xl font-black text-gray-900">42 hrs</div>
              <p className="text-sm font-medium text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp size={14} className="rotate-180" /> -18% cost reduction
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-100 p-2 rounded-lg text-purple-700">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Bottleneck Risk</h3>
                  <p className="text-sm text-gray-500">Current AI Confidence</p>
                </div>
              </div>
              <div className="text-4xl font-black text-gray-900">Low</div>
              <p className="text-sm font-medium text-green-600 mt-2 flex items-center gap-1">
                <Check size={14} /> Shift alignment optimal
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Dynamic Staffing Reallocation</h3>
              <p className="text-sm text-gray-500 mt-1">Algorithmically balanced workforce based on hourly throughput predictions</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4">Operational Zone</th>
                    <th className="px-6 py-4">Current Staffing</th>
                    <th className="px-6 py-4">AI Recommended</th>
                    <th className="px-6 py-4">Adjustment Impact</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {laborForecast.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-bold text-gray-900">{row.zone}</td>
                      <td className="px-6 py-4 text-gray-600 font-medium">{row.current} Staff</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <ArrowRight size={14} className={row.current === row.recommended ? "text-gray-400" : "text-blue-500"} />
                          <span className={`font-bold px-2 py-1 rounded ${row.current < row.recommended ? 'bg-blue-100 text-blue-700' : row.current > row.recommended ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                            {row.recommended} Staff
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{row.impact}</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          disabled={row.current === row.recommended}
                          className={`font-semibold ${row.current === row.recommended ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800 hover:underline'}`}
                        >
                          {row.current === row.recommended ? 'Optimized' : 'Execute Transfer'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      )}
      {activeTab === 'yard' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
                  <Timer size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Truck Idling</h3>
                  <p className="text-sm text-gray-500">Average wait time today</p>
                </div>
              </div>
              <div className="text-4xl font-black text-gray-900">4.2m</div>
              <p className="text-sm font-medium text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp size={14} className="rotate-180" /> -12 mins vs baseline
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-100 p-2 rounded-lg text-purple-700">
                  <Gauge size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Bay Utilization</h3>
                  <p className="text-sm text-gray-500">AI synchronized turnover</p>
                </div>
              </div>
              <div className="text-4xl font-black text-gray-900">92%</div>
              <p className="text-sm font-medium text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp size={14} /> Peak efficiency reached
              </p>
            </div>

            <div className="bg-slate-900 rounded-2xl shadow-sm p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                  <Target size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Active Queue</h3>
                  <p className="text-sm text-slate-400">Inbound via Geofence</p>
                </div>
              </div>
              <div className="text-4xl font-black text-white">14</div>
              <p className="text-sm font-medium text-blue-400 mt-2 flex items-center gap-1">
                <Activity size={14} /> 3 Urgent Priority
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">AI Dynamic Bay Assignments</h3>
                <p className="text-sm text-gray-500 mt-1">Cross-referencing ETA, unload difficulty, and cargo priority</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4">Inbound Vehicle</th>
                    <th className="px-6 py-4">Live ETA</th>
                    <th className="px-6 py-4">Cargo / Diff.</th>
                    <th className="px-6 py-4">AI Bay Allocation</th>
                    <th className="px-6 py-4">Reasoning Engine</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {yardQueue.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{row.truck}</div>
                        <div className="text-xs text-gray-500 font-medium mt-0.5">
                          <span className={`${row.priority === 'Urgent' ? 'text-red-600' : row.priority === 'High' ? 'text-orange-500' : 'text-blue-600'}`}>
                            {row.priority} Priority
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-gray-700">{row.eta}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{row.cargo}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{row.unldDifficulty}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-lg border border-blue-200">
                            {row.bay}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-xs">{row.reason}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="font-semibold text-blue-600 hover:text-blue-800 hover:underline">
                          Confirm
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'twin' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden p-1 relative">
            {/* Grid overlay for digital feel */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
            
            <div className="relative z-10 grid lg:grid-cols-3 gap-1">
              <div className="lg:col-span-1 bg-slate-900 rounded-xl p-6 flex flex-col">
                <div className="flex items-center gap-2 text-blue-400 mb-6">
                  <MonitorPlay size={20} />
                  <h3 className="text-lg font-bold text-white tracking-wide">Simulation Config</h3>
                </div>
                
                <div className="space-y-5 flex-1">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Event Scenario</label>
                    <select className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2.5 outline-none focus:border-blue-500">
                      <option>Black Friday Surge (3x Volume)</option>
                      <option>Q4 Holiday Rush (2.5x Volume)</option>
                      <option>Labor Strike (-30% Staff)</option>
                      <option>New Layout Rollout A/B</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Staffing Override</label>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg transition-colors border border-blue-500">Auto ML</button>
                      <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 rounded-lg transition-colors border border-slate-700">Manual</button>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-800">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                      <span>Routing Strategy</span>
                      <Settings2 size={14} />
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 text-sm text-slate-300">
                        <input type="radio" name="route" className="text-blue-500 bg-slate-800 border-slate-700 focus:ring-blue-500" defaultChecked />
                        Zone Picking (Density Focus)
                      </label>
                      <label className="flex items-center gap-3 text-sm text-slate-300">
                        <input type="radio" name="route" className="text-blue-500 bg-slate-800 border-slate-700 focus:ring-blue-500" />
                        Wave Picking (Speed Focus)
                      </label>
                    </div>
                  </div>
                </div>
                
                <button className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-lg shadow-[0_0_15px_rgba(79,70,229,0.4)] flex items-center justify-center gap-2 transition-all">
                  <Play size={18} fill="currentColor" /> Run Twin Simulation
                </button>
              </div>

              <div className="lg:col-span-2 bg-slate-950 rounded-xl p-6 border border-slate-800 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Activity size={20} />
                    <h3 className="text-lg font-bold text-white tracking-wide">Stress Test Results</h3>
                  </div>
                  <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded border border-green-500/30">
                    SLA ADHERENCE: 98.4%
                  </span>
                </div>
                
                <div className="h-[280px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={twinSimData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSimulated" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dx={-10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px', color: '#cbd5e1' }} />
                      <Area type="monotone" name="Standard Load (Vol/hr)" dataKey="baseline" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                      <Area type="monotone" name="Simulated Surge" dataKey="simulated" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorSimulated)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-800">
                  <div>
                    <p className="text-xs text-slate-400 font-semibold mb-1">Peak Choke Point</p>
                    <p className="text-sm font-bold text-orange-400">Zone C (Outbound)</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold mb-1">Staff Shortfall</p>
                    <p className="text-sm font-bold text-red-400">4 Packers Req. @ 14:00</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold mb-1">AMR Utilization</p>
                    <p className="text-sm font-bold text-green-400">98% (Highly Efficient)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      )}
      {activeTab === 'maintenance' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 p-2 rounded-lg text-red-700">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Critical Alerts</h3>
                  <p className="text-sm text-gray-500">Impending Failures (&lt;24hr)</p>
                </div>
              </div>
              <div className="text-4xl font-black text-gray-900">1</div>
              <p className="text-sm font-medium text-red-600 mt-2 flex items-center gap-1">
                <Wrench size={14} /> Immediate Action Required
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
                  <Cpu size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Active Sensors</h3>
                  <p className="text-sm text-gray-500">IoT Telemetry Nodes</p>
                </div>
              </div>
              <div className="text-4xl font-black text-gray-900">1,248</div>
              <p className="text-sm font-medium text-green-600 mt-2 flex items-center gap-1">
                <Activity size={14} /> 99.8% Online
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 p-2 rounded-lg text-green-700">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Downtime Prevented</h3>
                  <p className="text-sm text-gray-500">Estimated Cost Savings (YTD)</p>
                </div>
              </div>
              <div className="text-4xl font-black text-gray-900">$142K</div>
              <p className="text-sm font-medium text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp size={14} /> 12 Major faults avoided
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Predictive Maintenance Alerts</h3>
                <p className="text-sm text-gray-500 mt-1">AI-driven degradation detection on mechanical and electrical systems</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4">Equipment ID</th>
                    <th className="px-6 py-4">Anomaly Type</th>
                    <th className="px-6 py-4">Sensor Diagnostics</th>
                    <th className="px-6 py-4">Est. Time to Failure</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {iotAlerts.map((alert, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{alert.id}</div>
                        <div className="text-xs text-gray-500 font-medium mt-0.5">{alert.type}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold px-2 py-1 rounded-md border ${alert.status === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                            {alert.sensor}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 max-w-sm">
                        {alert.detail}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${alert.status === 'Critical' ? 'text-red-600' : 'text-orange-500'}`}>
                          {alert.ttf}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded text-xs font-bold transition-colors">
                          Dispatch Tech
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'copilot' && (
        <div className="h-[600px] flex flex-col bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-900 to-indigo-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Sparkles size={24} className="text-purple-300" />
              </div>
              <div>
                <h3 className="text-lg font-bold">WMS AI Copilot</h3>
                <p className="text-xs text-indigo-200">Natural Language Operations & Queries</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div> Context Connected
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
            {chatHistory.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-5 py-4 ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none shadow-md' 
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                }`}>
                  {msg.role === 'ai' && (
                    <div className="flex items-center gap-2 mb-2 text-purple-600 font-bold text-xs uppercase tracking-wider">
                      <Sparkles size={14} /> AI Copilot
                    </div>
                  )}
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </div>
                  {msg.role === 'ai' && msg.id === 3 && (
                    <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
                      <button className="text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 px-3 py-1.5 rounded transition-colors border border-purple-200">
                        Re-route Wave to Zone D
                      </button>
                      <button className="text-xs font-bold bg-gray-50 text-gray-700 hover:bg-gray-100 px-3 py-1.5 rounded transition-colors border border-gray-200">
                        Dispatch Maintenance
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="relative flex items-center">
              <button className="absolute left-4 text-gray-400 hover:text-gray-600">
                <Mic size={20} />
              </button>
              <input 
                type="text" 
                value={chatQuery}
                onChange={(e) => setChatQuery(e.target.value)}
                placeholder="Ask about anomalies, stock discrepancies, or request a report..."
                className="w-full pl-12 pr-14 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-sm font-medium"
              />
              <button 
                className="absolute right-3 p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-sm"
                onClick={() => {
                  if (chatQuery.trim()) {
                    setChatHistory([...chatHistory, { id: Date.now(), role: 'user', content: chatQuery }]);
                    setChatQuery('');
                  }
                }}
              >
                <Send size={18} />
              </button>
            </div>
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 hide-scrollbar">
              <span className="text-xs text-gray-400 font-semibold flex items-center whitespace-nowrap">Suggested:</span>
              <button className="text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full whitespace-nowrap transition-colors">
                Generate shift compliance report
              </button>
              <button className="text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full whitespace-nowrap transition-colors">
                Find stock discrepancies in Zone A
              </button>
            </div>
          </div>
        </div>
      )}
    
      {activeTab === 'reports' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Active Schedules</h3>
                  <p className="text-sm text-gray-500">Manage your automated report generation and delivery.</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4">Report Type</th>
                      <th className="px-6 py-4">Schedule Time</th>
                      <th className="px-6 py-4">Recipients</th>
                      <th className="px-6 py-4">Format</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {schedules.map(sch => (
                      <tr key={sch.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-bold text-gray-900">{sch.type}</td>
                        <td className="px-6 py-4 text-gray-600 flex items-center gap-2"><Clock size={14}/> {sch.time} Daily</td>
                        <td className="px-6 py-4 text-gray-600">{sch.emails.length} Addresses</td>
                        <td className="px-6 py-4 text-red-600 font-bold">{sch.format}</td>
                        <td className="px-6 py-4">
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Active</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Send size={18} className="text-blue-600" /> New Schedule</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Report Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50">
                    <option>Daily Performance Summary</option>
                    <option>End of Shift Yield</option>
                    <option>Predictive Maintenance Log</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Time (24H)</label>
                  <input type="time" value={reportTime} onChange={(e) => setReportTime(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50" />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Add Recipient Email</label>
                  <div className="flex gap-2">
                    <input 
                      type="email" 
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="manager@company.com" 
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" 
                    />
                    <button 
                      onClick={() => {
                        if (newEmail.includes('@')) {
                          setReportEmails([...reportEmails, newEmail]);
                          setNewEmail('');
                        }
                      }}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-sm"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="mt-4 border border-gray-200 rounded-lg p-3 bg-gray-50 max-h-40 overflow-y-auto">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Mailing List ({reportEmails.length})</span>
                  <div className="space-y-2">
                    {reportEmails.map((email, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm bg-white p-2 border border-gray-100 rounded shadow-sm">
                        <span className="text-gray-700 truncate">{email}</span>
                        <button onClick={() => setReportEmails(reportEmails.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700">
                          <AlertCircle size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setSchedules([...schedules, { id: Date.now(), type: 'Daily Performance Summary', time: reportTime, format: 'PDF', emails: reportEmails, active: true }]);
                    alert("Schedule Saved! Daily PDF reports will be sent at " + reportTime);
                  }}
                  className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={16} /> Save Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {climateToast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-purple-500/50 flex items-center gap-3 animate-in fade-in slide-in-from-top-5">
          <Gauge className="text-purple-400 animate-pulse" size={20} />
          <span className="text-sm font-semibold">{climateToast}</span>
        </div>
      )}

      {activeTab === 'climate' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-white p-6 rounded-2xl border border-purple-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Gauge className="text-purple-600" /> Cold-Chain & Environmental IoT Telemetry Hub
              </h3>
              <p className="text-xs text-gray-600 mt-1">Real-time temperature, humidity, and airflow sensors across temperature-sensitive warehouse zones.</p>
            </div>
            <button
              onClick={() => showClimateToast('🌡️ Recalibrated all IoT climate sensors successfully.')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              Recalibrate All Sensors
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {climateZones.map((zone, idx) => (
              <div key={idx} className={`bg-white rounded-2xl p-6 shadow-sm border ${zone.status === 'Warning' ? 'border-red-300 bg-red-50/20' : 'border-gray-200'} flex flex-col justify-between gap-4`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-mono font-bold text-gray-400">{zone.sensorId}</span>
                    <h4 className="font-bold text-gray-900 mt-1">{zone.name}</h4>
                  </div>
                  <span className={`text-[10px] uppercase font-black px-2 py-1 rounded-full ${
                    zone.status === 'Warning' ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-green-100 text-green-700'
                  }`}>
                    {zone.status}
                  </span>
                </div>

                <div className="space-y-3 py-2">
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="text-xs text-gray-500 font-semibold">Temperature</span>
                    <span className={`text-lg font-mono font-black ${zone.status === 'Warning' ? 'text-red-600' : 'text-gray-950'}`}>
                      {zone.temp}°C
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="text-xs text-gray-500 font-semibold">Humidity</span>
                    <span className="text-base font-mono font-bold text-gray-900">
                      {zone.humidity}% RH
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 flex justify-between">
                    <span>Threshold Limit:</span>
                    <strong className="text-gray-800">{zone.threshold}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex gap-2">
                  <button
                    onClick={() => showClimateToast(`🔧 Dispatched HVAC technician to ${zone.name}.`)}
                    className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors"
                  >
                    Dispatch Tech
                  </button>
                  {zone.status === 'Warning' && (
                    <button
                      onClick={() => {
                        const updated = [...climateZones];
                        updated[idx].status = 'Optimal';
                        updated[idx].temp = 23.5;
                        setClimateZones(updated);
                        showClimateToast(`✅ Resolved warning for ${zone.name}. Climate stabilized.`);
                      }}
                      className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      Ventilate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
</div>
  );
}

