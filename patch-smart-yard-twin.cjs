const fs = require('fs');
let code = fs.readFileSync('src/components/AIOperationsScreen.tsx', 'utf8');

// 1. Add new icons
const iconImportRegex = /import \{\s*BrainCircuit[\s\S]*?\} from 'lucide-react';/m;
const newIconImport = `import { 
  BrainCircuit, LineChart as LineChartIcon, Map, Target, Bot, Zap, 
  ArrowRight, TrendingUp, AlertCircle, CheckCircle2, Box, Activity, 
  Camera, Users, ShieldCheck, Clock, Check, Truck, MonitorPlay, Timer, 
  Gauge, Database, BarChart3, Settings2, Play
} from 'lucide-react';`;
code = code.replace(iconImportRegex, newIconImport);

// 2. Add new data objects
const newData = `
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
`;
const laborForecastMatch = "];\n\nconst [activeTab";
if (!code.includes("const yardQueue =")) {
  code = code.replace("const [activeTab", newData + "\nconst [activeTab");
}

// 3. Update activeTab state
code = code.replace(
  "const [activeTab, setActiveTab] = useState<'slotting' | 'routing' | 'vision' | 'labor'>('slotting');", 
  "const [activeTab, setActiveTab] = useState<'slotting' | 'routing' | 'vision' | 'labor' | 'yard' | 'twin'>('slotting');"
);

// 4. Update Nav Buttons
const buttonsTarget = `<button 
            onClick={() => setActiveTab('labor')}
            className={\`px-6 py-2 text-sm font-semibold rounded-md transition-colors flex items-center gap-2 \${
              activeTab === 'labor' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }\`}
          >
            <Users size={16} /> Labor Scheduling
          </button>`;

const newButtons = buttonsTarget + `
          <button 
            onClick={() => setActiveTab('yard')}
            className={\`px-6 py-2 text-sm font-semibold rounded-md transition-colors flex items-center gap-2 \${
              activeTab === 'yard' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }\`}
          >
            <Truck size={16} /> Smart Yard
          </button>
          <button 
            onClick={() => setActiveTab('twin')}
            className={\`px-6 py-2 text-sm font-semibold rounded-md transition-colors flex items-center gap-2 \${
              activeTab === 'twin' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }\`}
          >
            <MonitorPlay size={16} /> Digital Twin
          </button>`;
if (code.includes(buttonsTarget) && !code.includes("setActiveTab('yard')")) {
  code = code.replace(buttonsTarget, newButtons);
}

// 5. Add the Views
const endDivTarget = `      )}
    </div>
  );
}`;

const newViews = `
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
                          <span className={\`\${row.priority === 'Urgent' ? 'text-red-600' : row.priority === 'High' ? 'text-orange-500' : 'text-blue-600'}\`}>
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
`;

if (code.includes(endDivTarget) && !code.includes("activeTab === 'twin'")) {
  code = code.replace(endDivTarget, newViews + "\n" + endDivTarget);
}

fs.writeFileSync('src/components/AIOperationsScreen.tsx', code);
