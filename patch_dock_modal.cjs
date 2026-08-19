const fs = require('fs');
let code = fs.readFileSync('src/components/DockScreen.tsx', 'utf8');

// Insert new states
const stateInsertion = `
  const [lookupMode, setLookupMode] = useState(true);
  const [vehicleHistory, setVehicleHistory] = useState<any[]>([]);
  const [isLookingUp, setIsLookingUp] = useState(false);

  const handleLookup = async () => {
    if(!formData.vehicleNo) return;
    setIsLookingUp(true);
    try {
      const res = await fetchApi(\`/v3/vehicles/\${formData.vehicleNo}/history\`);
      setVehicleHistory(res.history || []);
      if(res.history && res.history.length > 0) {
        const last = res.history[res.history.length - 1];
        setFormData(prev => ({...prev, driverName: last.driver || prev.driverName}));
      }
    } catch(e) {
      console.error(e);
      setVehicleHistory([]);
    } finally {
      setIsLookingUp(false);
      setLookupMode(false);
    }
  };
`;
if (!code.includes('setLookupMode')) {
  code = code.replace("const [selectedDockId, setSelectedDockId] = useState<number | null>(null);", "const [selectedDockId, setSelectedDockId] = useState<number | null>(null);\n" + stateInsertion);
}

// Update openAssignModal
const oldOpenModal = `  const openAssignModal = (id: number) => {
    setSelectedDockId(id);
    setFormData({
      vehicleNo: '', vehicleType: '32ft Container', driverName: '', driverMobile: '',
      origin: 'Bhiwandi Hub', material: 'Electronics', quantity: 500, distance: 150, fuel: 30, efficiency: 5.0, status: 'Inbound Unloading'
    });
    setIsModalOpen(true);
  };`;
const newOpenModal = `  const openAssignModal = (id: number) => {
    setSelectedDockId(id);
    setLookupMode(true);
    setVehicleHistory([]);
    setFormData({
      vehicleNo: '', vehicleType: '32ft Container', driverName: '', driverMobile: '',
      origin: 'Bhiwandi Hub', material: 'Electronics', quantity: 500, distance: 150, fuel: 30, efficiency: 5.0, status: 'Inbound Unloading'
    });
    setIsModalOpen(true);
  };`;
code = code.replace(oldOpenModal, newOpenModal);

// Now for the modal JSX
const oldModalJSX = `
            <form onSubmit={handleAssign} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Vehicle Number Plate</label>
                  <input required type="text" value={formData.vehicleNo} onChange={e => setFormData({...formData, vehicleNo: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono placeholder:normal-case placeholder:font-sans" placeholder="e.g. MH04 AB 1234" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Vehicle Type</label>
                  <select value={formData.vehicleType} onChange={e => setFormData({...formData, vehicleType: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                    {['32ft Container', 'Tata 407', 'Eicher Pro', 'Trailer', '14ft Canter'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>

                <div className="col-span-1 md:col-span-2 border-t border-gray-100 pt-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Driver & Logistics</h4>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Driver Name</label>
                  <input required type="text" value={formData.driverName} onChange={e => setFormData({...formData, driverName: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Driver Mobile</label>
                  <input required type="text" value={formData.driverMobile} onChange={e => setFormData({...formData, driverMobile: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Origin Hub</label>
                  <input required type="text" value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Operation Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                    {['Inbound Unloading', 'Occupied / Loading'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>

                <div className="col-span-1 md:col-span-2 border-t border-gray-100 pt-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Cargo & Journey Metrics</h4>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Cargo Material</label>
                  <input required type="text" value={formData.material} onChange={e => setFormData({...formData, material: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Quantity / Units</label>
                  <input required type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Distance Covered (km)</label>
                  <input required type="number" value={formData.distance} onChange={e => setFormData({...formData, distance: Number(e.target.value)})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Fuel Used (L)</label>
                  <input required type="number" value={formData.fuel} onChange={e => setFormData({...formData, fuel: Number(e.target.value)})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-200 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <CheckCircle2 size={16}/> Confirm Assignment
                </button>
              </div>
            </form>
`;

const newModalJSX = `
            <div className="p-6">
              {lookupMode ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Vehicle Number Plate Lookup</label>
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        value={formData.vehicleNo} 
                        onChange={e => setFormData({...formData, vehicleNo: e.target.value.toUpperCase()})} 
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono placeholder:normal-case placeholder:font-sans text-lg" 
                        placeholder="e.g. MH-04-AB-1234" 
                      />
                      <button 
                        onClick={handleLookup}
                        disabled={!formData.vehicleNo || isLookingUp}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2"
                      >
                        {isLookingUp ? 'Searching...' : <><Search size={18} /> Lookup</>}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Enter the license plate to pull vehicle trip history and pre-fill assignment details.</p>
                  </div>
                  <div className="pt-6 border-t border-gray-200 flex justify-end gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAssign} className="space-y-6">
                  {/* History Summary Card */}
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <div>
                      <h4 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-blue-600" />
                        Vehicle Record: <span className="font-mono">{formData.vehicleNo}</span>
                      </h4>
                      {vehicleHistory.length > 0 ? (
                        <p className="text-xs text-blue-700 mt-1">
                          Found {vehicleHistory.length} previous visits. 
                          Avg TAT: {Math.floor(vehicleHistory.reduce((acc, curr) => acc + curr.turnaroundMs, 0) / vehicleHistory.length / 60000)} mins.
                          <br/>Last Driver: {vehicleHistory[vehicleHistory.length-1].driver}
                        </p>
                      ) : (
                        <p className="text-xs text-blue-700 mt-1">No prior visit history found. New vehicle registration.</p>
                      )}
                    </div>
                    <button 
                      type="button"
                      onClick={() => setLookupMode(true)}
                      className="text-xs font-bold text-blue-700 hover:text-blue-900 bg-white border border-blue-200 px-3 py-1.5 rounded-lg"
                    >
                      Change Vehicle
                    </button>
                  </div>
                  
                  {/* Existing Form Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Vehicle Type</label>
                      <select value={formData.vehicleType} onChange={e => setFormData({...formData, vehicleType: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                        {['32ft Container', 'Tata 407', 'Eicher Pro', 'Trailer', '14ft Canter', 'Reefer'].map(d => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Operation Status</label>
                      <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                        {['Inbound Unloading', 'Occupied / Loading'].map(d => <option key={d}>{d}</option>)}
                      </select>
                    </div>

                    <div className="col-span-1 md:col-span-2 border-t border-gray-100 pt-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Driver & Logistics</h4>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Driver Name</label>
                      <input required type="text" value={formData.driverName} onChange={e => setFormData({...formData, driverName: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Driver Mobile</label>
                      <input required type="text" value={formData.driverMobile} onChange={e => setFormData({...formData, driverMobile: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Origin Hub</label>
                      <input required type="text" value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Cargo Material</label>
                      <input required type="text" value={formData.material} onChange={e => setFormData({...formData, material: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Quantity / Units</label>
                      <input required type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Distance Covered (km)</label>
                      <input required type="number" value={formData.distance} onChange={e => setFormData({...formData, distance: Number(e.target.value)})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Fuel Used (L)</label>
                      <input required type="number" value={formData.fuel} onChange={e => setFormData({...formData, fuel: Number(e.target.value)})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-200 flex justify-end gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                      Cancel
                    </button>
                    <button type="submit" className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                      <CheckCircle2 size={16}/> Confirm Assignment
                    </button>
                  </div>
                </form>
              )}
            </div>
`;
code = code.replace(oldModalJSX, newModalJSX);

fs.writeFileSync('src/components/DockScreen.tsx', code);
console.log("Patched DockScreen with modal updates");
