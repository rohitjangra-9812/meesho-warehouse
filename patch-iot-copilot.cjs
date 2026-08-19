const fs = require('fs');
let code = fs.readFileSync('src/components/AIOperationsScreen.tsx', 'utf8');

// 1. Icons
const iconImportRegex = /import \{\s*BrainCircuit[\s\S]*?\} from 'lucide-react';/m;
const newIconImport = `import { 
  BrainCircuit, LineChart as LineChartIcon, Map, Target, Bot, Zap, 
  ArrowRight, TrendingUp, AlertCircle, CheckCircle2, Box, Activity, 
  Camera, Users, ShieldCheck, Clock, Check, Truck, MonitorPlay, Timer, 
  Gauge, Database, BarChart3, Settings2, Play, Wrench, MessageSquare, Mic, Sparkles, Cpu, Send, Info
} from 'lucide-react';`;
code = code.replace(iconImportRegex, newIconImport);

// 2. Data
const newData = `
const iotAlerts = [
  { id: 'EQ-CV-02', type: 'Conveyor Motor', sensor: 'Vibration', status: 'Critical', ttf: '2.4 Hours', detail: 'High frequency resonance detected in main drive shaft.' },
  { id: 'EQ-FL-14', type: 'Forklift', sensor: 'Battery Cell', status: 'Warning', ttf: '12 Days', detail: 'Cell 4 voltage dropping 15% faster than fleet average.' },
  { id: 'EQ-SR-01', type: 'High-Speed Sorter', sensor: 'Temperature', status: 'Warning', ttf: '5 Days', detail: 'Operating 4°C above nominal baseline during peak loads.' },
];
`;
if (!code.includes("const iotAlerts =")) {
  code = code.replace("const yardQueue =", newData + "\nconst yardQueue =");
}

// 3. State & Tab buttons container
code = code.replace(
  "const [activeTab, setActiveTab] = useState<'slotting' | 'routing' | 'vision' | 'labor' | 'yard' | 'twin'>('slotting');", 
  `const [activeTab, setActiveTab] = useState<'slotting' | 'routing' | 'vision' | 'labor' | 'yard' | 'twin' | 'maintenance' | 'copilot'>('slotting');
  const [chatQuery, setChatQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { id: 1, role: 'ai', content: "Hello! I'm your WMS Operations Copilot. You can ask me about stock anomalies, wave delays, or ask me to generate reports." },
    { id: 2, role: 'user', content: "Why is the throughput in Zone C dropping today?" },
    { id: 3, role: 'ai', content: "I analyzed the telemetry for Zone C. There is a 14% drop in throughput over the last 2 hours. This correlates with a predictive maintenance alert on 'Conveyor Motor CV-02' (Vibration anomaly) causing micro-stoppages, and 2 AMRs being queued for battery replacement.\\n\\n**Recommendation**: Temporarily re-route Wave picking to Zone D and dispatch maintenance to CV-02." }
  ]);`
);

code = code.replace(
  `<div className="flex bg-gray-100 p-1 rounded-lg">`,
  `<div className="flex flex-wrap bg-gray-100 p-1 rounded-lg gap-1 mt-4 xl:mt-0 xl:max-w-[65%] justify-end">`
);

// 4. Buttons
const buttonsTarget = `<MonitorPlay size={16} /> Digital Twin
          </button>`;
const newButtons = buttonsTarget + `
          <button 
            onClick={() => setActiveTab('maintenance')}
            className={\`px-6 py-2 text-sm font-semibold rounded-md transition-colors flex items-center gap-2 \${
              activeTab === 'maintenance' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }\`}
          >
            <Wrench size={16} /> IoT Maintenance
          </button>
          <button 
            onClick={() => setActiveTab('copilot')}
            className={\`px-6 py-2 text-sm font-semibold rounded-md transition-colors flex items-center gap-2 \${
              activeTab === 'copilot' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }\`}
          >
            <Sparkles size={16} className={activeTab === 'copilot' ? 'text-purple-600' : ''} /> AI Copilot
          </button>`;
if (code.includes(buttonsTarget) && !code.includes("setActiveTab('maintenance')")) {
  code = code.replace(buttonsTarget, newButtons);
}

// 5. Views
const endDivTarget = `      )}
    </div>
  );
}`;

const newViews = `
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
                          <span className={\`font-bold px-2 py-1 rounded-md border \${alert.status === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-orange-50 text-orange-700 border-orange-200'}\`}>
                            {alert.sensor}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 max-w-sm">
                        {alert.detail}
                      </td>
                      <td className="px-6 py-4">
                        <span className={\`font-bold \${alert.status === 'Critical' ? 'text-red-600' : 'text-orange-500'}\`}>
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
              <div key={msg.id} className={\`flex \${msg.role === 'user' ? 'justify-end' : 'justify-start'}\`}>
                <div className={\`max-w-[80%] rounded-2xl px-5 py-4 \${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none shadow-md' 
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                }\`}>
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
`;

if (code.includes(endDivTarget) && !code.includes("activeTab === 'maintenance'")) {
  code = code.replace(endDivTarget, newViews + "\n" + endDivTarget);
}

fs.writeFileSync('src/components/AIOperationsScreen.tsx', code);
