const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardScreen.tsx', 'utf8');

// Add Heatmap & AMR animation state to Floor Plan
const floorPlanEnhancements = `
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [amrPositions, setAmrPositions] = useState([
    { id: 1, x: 34, y: 64, status: 'Active' },
    { id: 2, x: 30, y: 32, status: 'Active' },
    { id: 3, x: 45, y: 48, status: 'Charging' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAmrPositions(prev => prev.map(amr => ({
        ...amr,
        x: Math.max(20, Math.min(75, amr.x + (Math.random() * 4 - 2))),
        y: Math.max(15, Math.min(80, amr.y + (Math.random() * 4 - 2)))
      })));
    }, 2000);
    return () => clearInterval(interval);
  }, []);
`;

code = code.replace("const [dismissAlert, setDismissAlert] = useState(false);", "const [dismissAlert, setDismissAlert] = useState(false);\n" + floorPlanEnhancements);

// Update floor plan view header with heatmap toggle
const floorHeaderOld = `          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Virtual Floor Plan: Operations Map</h3>
            <div className="flex gap-4 text-xs font-semibold">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div> Optimal</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div> Warning</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-100 border border-red-500 rounded animate-pulse"></div> Critical Alert</div>
            </div>
          </div>`;

const floorHeaderNew = `          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <h3 className="text-lg font-bold text-gray-900">Virtual Floor Plan & AMR Heatmap Tracking</h3>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={\`px-4 py-1.5 rounded-lg text-xs font-bold transition-all \${showHeatmap ? 'bg-pink-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}\`}
              >
                {showHeatmap ? '🔥 Heatmap Layer: ON' : '📊 Toggle Pick Heatmap'}
              </button>
              <div className="flex gap-3 text-xs font-semibold">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div> Optimal</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div> Congested</div>
              </div>
            </div>
          </div>`;

code = code.replace(floorHeaderOld, floorHeaderNew);

// Add heatmap overlay style inside the floor plan container
const floorPlanContainerOld = '<div className="relative w-full h-[600px] bg-slate-50 border border-slate-200 rounded-xl overflow-hidden p-6 shadow-inner">';
const floorPlanContainerNew = `<div className="relative w-full h-[600px] bg-slate-50 border border-slate-200 rounded-xl overflow-hidden p-6 shadow-inner">
            {showHeatmap && (
              <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-tr from-red-500/20 via-orange-500/15 to-pink-500/25 backdrop-blur-[1px] flex items-center justify-center">
                 <div className="absolute top-4 bg-slate-900/80 text-white px-4 py-1.5 rounded-full text-xs font-mono tracking-widest uppercase border border-pink-500/40">
                    Live Aisle Pick Heatmap (Zone A & C High Traffic)
                 </div>
              </div>
            )}`;

code = code.replace(floorPlanContainerOld, floorPlanContainerNew);

// Update AMR moving markers
const amrRenderOld = `            {/* AMRs */}
            <div className="absolute top-64 left-[34rem] w-8 h-8 bg-purple-600 rounded-full shadow-lg flex items-center justify-center text-white border-2 border-white z-20 transition-all">
              <Truck size={14} />
            </div>
            <div className="absolute top-32 left-[30rem] w-8 h-8 bg-purple-600 rounded-full shadow-lg flex items-center justify-center text-white border-2 border-white z-20 transition-all">
              <Truck size={14} />
            </div>`;

const amrRenderNew = `            {/* Real-time Moving AMRs */}
            {amrPositions.map((amr) => (
              <div 
                key={amr.id} 
                className="absolute w-8 h-8 bg-purple-600 rounded-full shadow-xl flex items-center justify-center text-white border-2 border-white z-20 transition-all duration-1000 ease-in-out cursor-pointer group"
                style={{ top: \`\${amr.y}%\`, left: \`\${amr.x}%\` }}
                title={\`AMR Bot #0\${amr.id} - \${amr.status}\`}
              >
                <Truck size={14} className="animate-pulse" />
                <span className="absolute -bottom-5 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-mono">
                  AMR-0{amr.id} ({amr.status})
                </span>
              </div>
            ))}
            
            {/* Active Floor Pickers */}
            <div className="absolute top-48 left-[40%] w-6 h-6 bg-blue-500 rounded-full shadow-md flex items-center justify-center text-white text-[10px] font-bold z-20 animate-bounce" title="Picker #12 - Rahul S.">
              P12
            </div>
            <div className="absolute top-60 left-[55%] w-6 h-6 bg-blue-500 rounded-full shadow-md flex items-center justify-center text-white text-[10px] font-bold z-20 animate-pulse" title="Picker #08 - Anita M.">
              P08
            </div>`;

code = code.replace(amrRenderOld, amrRenderNew);

fs.writeFileSync('src/components/DashboardScreen.tsx', code);
