const fs = require('fs');
let code = fs.readFileSync('src/components/DockScreen.tsx', 'utf8');

// Ensure we have correct imports
if (!code.includes('CheckCircle2, Search, Plus, X, ArrowRight,')) {
    // handled
}

// Ensure state for the new flow
const stateAddition = `
  const [lookupMode, setLookupMode] = useState(true);
  const [vehicleHistory, setVehicleHistory] = useState<any[]>([]);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [assignTargetBay, setAssignTargetBay] = useState<number | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!formData.vehicleNo) return;
    setIsLookingUp(true);
    try {
      const res = await fetchApi(\`/v3/vehicles/\${formData.vehicleNo}/history\`);
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
`;

// Replace `const openAssignModal = (id: number) => { ... }` with our new one
const oldOpenModalRegex = /const openAssignModal = \(id: number\) => \{[\s\S]*?setIsModalOpen\(true\);\n  \};/;
if (code.match(oldOpenModalRegex)) {
  code = code.replace(oldOpenModalRegex, stateAddition);
} else {
  console.log("Could not find openAssignModal");
}

// Add Global Check-In button next to Generate Report
const checkInBtn = `
          <button 
            onClick={() => openAssignModal()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Truck size={16} /> Check-In Vehicle
          </button>
`;
if (!code.includes('Check-In Vehicle')) {
  code = code.replace('Generate Report\n          </button>', 'Generate Report\n          </button>\n' + checkInBtn);
}

// Update the onClick for releasing a bay
code = code.replace(/onClick=\{\(\) => handleRelease\(dock\.id\)\}/g, 'onClick={() => handleReleaseWithConfirm(dock.id)}');


// We need to replace the entire Assign Modal with the new 3-step UI
const modalStart = '{/* Assign Modal */}';
const modalEndRegex = /\{\/\* Assign Modal \*\/\}([\s\S]*?)\{\/\* Report Modal \*\/\}/;

const newModal = `
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
                    // temporarily set selectedDockId to assignTargetBay to satisfy handleAssign
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
                            className={\`p-2 text-center rounded-lg border-2 transition-all \${
                              isSelected 
                                ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm scale-105 z-10' 
                                : isAvail 
                                  ? 'border-gray-200 bg-white hover:border-blue-300 text-gray-600' 
                                  : 'border-gray-100 bg-gray-50 text-gray-400 opacity-50 cursor-not-allowed'
                            }\`}
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
`;

if (code.match(modalEndRegex)) {
  code = code.replace(modalEndRegex, newModal + '\n      {/* Report Modal */}');
} else {
  console.log("Could not find Assign Modal replacement bounds");
}

// Ensure handleAssign can handle the overridden target bay
const oldHandleAssign = `const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDockId) return;
    try {
      const res = await fetchApi(\`/v3/docks/\${selectedDockId}/assign\`, {`;

const newHandleAssign = `const handleAssign = async (e: React.FormEvent, forceBayId?: number) => {
    e.preventDefault();
    const targetId = forceBayId || selectedDockId;
    if (!targetId) return;
    try {
      const res = await fetchApi(\`/v3/docks/\${targetId}/assign\`, {`;

if (code.includes('const handleAssign = async (e: React.FormEvent) => {')) {
  code = code.replace('const handleAssign = async (e: React.FormEvent) => {', 'const handleAssign = async (e: React.FormEvent, forceBayId?: number) => {');
  code = code.replace('if (!selectedDockId) return;', 'const targetId = forceBayId || selectedDockId;\n    if (!targetId) return;');
  code = code.replace('await fetchApi(`/v3/docks/${selectedDockId}/assign`', 'await fetchApi(`/v3/docks/${targetId}/assign`');
}

fs.writeFileSync('src/components/DockScreen.tsx', code);
console.log("Patched 3 step assignment");
