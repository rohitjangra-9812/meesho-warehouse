const fs = require('fs');
let code = fs.readFileSync('src/components/DockScreen.tsx', 'utf8');

// Add List to imports
code = code.replace("import { Truck, Clock, MapPin, Package, Fuel, AlertCircle, CheckCircle2, Search, Plus, X, ArrowRight, Zap, Bot, ThumbsUp, XCircle, Bell, BellRing, FileText, Printer, ClipboardCheck, RefreshCw } from 'lucide-react';", 
"import { Truck, Clock, MapPin, Package, Fuel, AlertCircle, CheckCircle2, Search, Plus, X, ArrowRight, Zap, Bot, ThumbsUp, XCircle, Bell, BellRing, FileText, Printer, ClipboardCheck, RefreshCw, List } from 'lucide-react';");

// Add handleToggleAuto function
const toggleAutoFn = `  const handleToggleAuto = async () => {
    try {
      const res = await fetchApi('/v3/docks/toggle-auto', { method: 'POST' });
      setAutoAssign(res.autoDockEnabled);
    } catch(e) {
      console.error(e);
    }
  };
`;

code = code.replace("  const handleSimulate = async () => {", toggleAutoFn + "\n  const handleSimulate = async () => {");

// Add Queue section
const queueSection = `
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
              className={\`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors \${autoAssign ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}\`}
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
                 </div>
               ))
            )}
          </div>
        </div>
`;

code = code.replace('{activeTab === \'live\' ? (\n<>\n<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">', '{activeTab === \'live\' ? (\n<>\n' + queueSection + '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">');

fs.writeFileSync('src/components/DockScreen.tsx', code);
