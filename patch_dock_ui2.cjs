const fs = require('fs');
let code = fs.readFileSync('src/components/DockScreen.tsx', 'utf8');

const hookAddition = `
  const [activeTab, setActiveTab] = useState<'live' | 'history'>('live');
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
`;
if (!code.includes("setActiveTab('live')")) {
  code = code.replace("const [isReportModalOpen, setIsReportModalOpen] = useState(false);", "const [isReportModalOpen, setIsReportModalOpen] = useState(false);\n" + hookAddition);
}


const headerRegex = /<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">[\s\S]*?<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">/;

const headerTabs = `
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dock & Yard Management</h2>
          <p className="text-sm text-gray-500 mt-1">Live bay operations, inbound tracking, and automation logs.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-gray-100 p-1 rounded-lg flex items-center">
            <button 
              onClick={() => setActiveTab('live')}
              className={\`px-4 py-1.5 rounded-md text-sm font-bold transition-colors \${activeTab === 'live' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}\`}
            >
              Live Monitor
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={\`px-4 py-1.5 rounded-md text-sm font-bold transition-colors \${activeTab === 'history' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}\`}
            >
              Automation Logs
            </button>
          </div>
          {activeTab === 'live' && (
            <button 
              onClick={() => openAssignModal()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
            >
              <Truck size={16} /> Check-In Vehicle
            </button>
          )}
        </div>
      </div>
      
      {activeTab === 'live' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
`;
code = code.replace(headerRegex, headerTabs);


const endRegex = /\{\/\* Assign Modal \*\/\}/;
const historyContent = `
        </>
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
`;
code = code.replace(endRegex, historyContent);

fs.writeFileSync('src/components/DockScreen.tsx', code);
console.log("Patched tab structure");
