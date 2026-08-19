const fs = require('fs');
let code = fs.readFileSync('src/components/AIOperationsScreen.tsx', 'utf8');

// 1. Add new icons to import
const iconImportTarget = `  ArrowRight, TrendingUp, AlertCircle, CheckCircle2, Box, Activity
} from 'lucide-react';`;
const newIconImport = `  ArrowRight, TrendingUp, AlertCircle, CheckCircle2, Box, Activity, Camera, Users, ShieldCheck, Clock, Check
} from 'lucide-react';`;
code = code.replace(iconImportTarget, newIconImport);

// 2. Add new data objects
const newData = `
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

const activeTabTarget = "const [activeTab, setActiveTab] = useState<'slotting' | 'routing'>('slotting');";
const newActiveTab = "const [activeTab, setActiveTab] = useState<'slotting' | 'routing' | 'vision' | 'labor'>('slotting');";
`;
code = code.replace("const [activeTab, setActiveTab] = useState<'slotting' | 'routing'>('slotting');", newData + newActiveTab);

// 3. Update Nav Buttons
const buttonsTarget = `<button 
            onClick={() => setActiveTab('routing')}
            className={\`px-6 py-2 text-sm font-semibold rounded-md transition-colors flex items-center gap-2 \${
              activeTab === 'routing' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }\`}
          >
            <Map size={16} /> Wave Routing & AMRs
          </button>`;
const newButtons = buttonsTarget + `
          <button 
            onClick={() => setActiveTab('vision')}
            className={\`px-6 py-2 text-sm font-semibold rounded-md transition-colors flex items-center gap-2 \${
              activeTab === 'vision' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }\`}
          >
            <Camera size={16} /> Vision QC
          </button>
          <button 
            onClick={() => setActiveTab('labor')}
            className={\`px-6 py-2 text-sm font-semibold rounded-md transition-colors flex items-center gap-2 \${
              activeTab === 'labor' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }\`}
          >
            <Users size={16} /> Labor Scheduling
          </button>`;
code = code.replace(buttonsTarget, newButtons);

// 4. Add the Views
const endDivTarget = `      )}
    </div>
  );
}`;

const newViews = `
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
                    > Dims: 24 x 18 x 12 cm<br/>
                    > Wgt: 1.42 kg<br/>
                    > Code: 8849201992
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
               <h3 className="text-lg font-bold text-gray-900 mb-4">Inspection Stream</h3>
               <div className="space-y-4">
                 {visionEvents.map(evt => (
                   <div key={evt.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50 flex items-start gap-3">
                     <div className={\`mt-1 \${evt.status === 'Passed' ? 'text-green-500' : evt.status === 'Flagged' ? 'text-orange-500' : 'text-red-500'}\`}>
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
                          <span className={\`font-bold px-2 py-1 rounded \${row.current < row.recommended ? 'bg-blue-100 text-blue-700' : row.current > row.recommended ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}\`}>
                            {row.recommended} Staff
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{row.impact}</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          disabled={row.current === row.recommended}
                          className={\`font-semibold \${row.current === row.recommended ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800 hover:underline'}\`}
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
`;

code = code.replace(endDivTarget, newViews + "\n" + endDivTarget);

// Add tailwind keyframes for scan animation if not exists
// This will be handled in index.css
fs.writeFileSync('src/components/AIOperationsScreen.tsx', code);
