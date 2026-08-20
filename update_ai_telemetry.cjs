const fs = require('fs');
let code = fs.readFileSync('src/components/AIOperationsScreen.tsx', 'utf8');

const telemetryCode = `
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
`;

code = code.replace("export function AIOperationsScreen() {", "export function AIOperationsScreen() {\n" + telemetryCode);

// Inject IoT Telemetry section into AI Operations
const telemetryJSX = `
      {/* IoT Sensor Telemetry & Predictive Maintenance */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
              IoT Sensor Telemetry & Predictive Maintenance (Conveyor CV-02)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time vibration analysis, thermal imaging, and automated technician dispatch</p>
          </div>
          <span className="bg-red-500/20 text-red-400 border border-red-500/40 px-3 py-1 rounded-full text-xs font-mono font-bold">
            Status: {telemetry.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Motor Vibration (RMS)</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black font-mono text-red-400">{telemetry.vibration}</span>
              <span className="text-xs text-red-400 bg-red-950 px-2 py-0.5 rounded font-bold">Threshold &gt; 2.6</span>
            </div>
          </div>
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Bearing Temperature</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black font-mono text-orange-400">{telemetry.temperature}</span>
              <span className="text-xs text-orange-400 bg-orange-950 px-2 py-0.5 rounded font-bold">Normal Range</span>
            </div>
          </div>
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Belt Speed</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-black font-mono text-green-400">{telemetry.beltSpeed}</span>
              <span className="text-xs text-green-400 bg-green-950 px-2 py-0.5 rounded font-bold">Optimal</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-sm text-slate-200">Automated Work-Order Trigger</h4>
            <p className="text-xs text-slate-400 mt-0.5">When vibration exceeds 2.6 mm/s, AI automatically schedules maintenance & dispatches lead technician.</p>
          </div>
          {workOrderCreated ? (
            <div className="bg-green-600/20 border border-green-500 text-green-400 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
              ✓ Work-Order #WO-9912 Dispatched to Tech (Rajesh M.)
            </div>
          ) : (
            <button 
              onClick={createMaintenanceWorkOrder}
              className="px-5 py-2.5 bg-[#f43397] hover:bg-pink-700 text-white rounded-xl text-xs font-bold transition-all shadow-md whitespace-nowrap"
            >
              Dispatch Maintenance Work-Order
            </button>
          )}
        </div>
      </div>
`;

code = code.replace('<div className="space-y-6">', '<div className="space-y-6">\n' + telemetryJSX);

fs.writeFileSync('src/components/AIOperationsScreen.tsx', code);
