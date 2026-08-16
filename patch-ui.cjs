const fs = require('fs');
let code = fs.readFileSync('src/components/DockManagementScreen.tsx', 'utf8');

// 1. Add extra fields generator
const extendedVehicleDetails = `
  const getExtendedDetails = (v: VehicleLog) => {
    const hash = v.id * 89231;
    const origins = ['Mumbai Hub', 'Delhi Node', 'Bangalore Central', 'Chennai Sort', 'Kolkata Depot', 'Pune DC', 'Hyderabad Facility'];
    const origin = origins[hash % origins.length];
    
    const classifications = ['24ft Container', 'Multi-Axle Flatbed', 'Refrigerated Reefer', 'LCV Tata Ace', '32ft High Cube'];
    const classification = classifications[hash % classifications.length];
    
    return { origin, classification };
  };
`;

code = code.replace(
  "  const totalDoors = doors.length;",
  extendedVehicleDetails + "\n  const totalDoors = doors.length;"
);

// 2. Replace the vehicle table with a card grid
const tableStart = '<div className="overflow-x-auto">\n            <table className="min-w-full divide-y divide-gray-200">';
const tableEnd = '</tbody>\n            </table>\n          </div>';

const tableStartIndex = code.indexOf(tableStart);
const tableEndIndex = code.indexOf(tableEnd) + tableEnd.length;

if (tableStartIndex !== -1 && tableEndIndex !== -1) {
  const newCardGrid = `
          <div className="p-6 bg-gray-50/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vehicles.map(v => {
                const ext = getExtendedDetails(v);
                return (
                  <div key={v.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className={\`absolute top-0 left-0 w-1 h-full \${v.status === 'Expected' ? 'bg-blue-400' : v.status === 'Arrived' ? 'bg-yellow-400' : v.status === 'Docked' ? 'bg-orange-400' : 'bg-green-400'}\`}></div>
                    
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-lg font-bold text-gray-900 tracking-tight">{v.vehicleNumber}</span>
                          <span className={\`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold \${v.type === 'Inbound' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}\`}>{v.type}</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-700">{v.carrierName}</p>
                      </div>
                      <div className="text-right">
                        <span className={\`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold \${
                          v.status === 'Expected' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          v.status === 'Arrived' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                          v.status === 'Docked' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                          'bg-green-50 text-green-700 border border-green-200'
                        }\`}>
                          {v.status === 'Docked' && doors.find(d => d.id === v.dockDoorId) ? \`\${v.status} (\${doors.find(d => d.id === v.dockDoorId)?.doorNumber})\` : v.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-4 border-t border-b border-gray-100 py-3 mt-3">
                      <div>
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Origin / Destination</p>
                        <p className="text-xs font-medium text-gray-900 line-clamp-1">{ext.origin}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Classification</p>
                        <p className="text-xs font-medium text-gray-900 line-clamp-1">{ext.classification}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Driver Info</p>
                        <p className="text-xs font-medium text-gray-900">{v.driverName}</p>
                        <p className="text-xs font-mono text-gray-500">{v.driverContact}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Time Log</p>
                        <p className="text-xs font-medium text-gray-900">{v.checkInTime ? new Date(v.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : new Date(v.scheduledTime || '').toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        <p className="text-[10px] text-gray-500">{v.checkInTime ? 'Checked In' : 'Scheduled'}</p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        {v.status === 'Expected' && (
                          <button onClick={() => updateStatus(v.id, 'Arrived')} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm">
                            Mark Arrived
                          </button>
                        )}
                        {v.status === 'Arrived' && (
                           <div className="flex items-center gap-2 w-full justify-between">
                             <select id={\`dock-\${v.id}\`} className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 bg-gray-50 outline-none flex-1 font-medium">
                               <option value="">Assign Dock...</option>
                               {doors.filter(d => d.status === 'Available').map(d => (
                                 <option key={d.id} value={d.id}>{d.doorNumber}</option>
                               ))}
                             </select>
                             <button onClick={() => {
                               const select = document.getElementById(\`dock-\${v.id}\`) as HTMLSelectElement;
                               if (select.value) updateStatus(v.id, 'Docked', Number(select.value));
                             }} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm">
                               Dock
                             </button>
                           </div>
                        )}
                        {v.status === 'Docked' && (
                          <button onClick={() => updateStatus(v.id, 'Departed')} className="bg-orange-100 hover:bg-orange-200 text-orange-800 px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm w-full">
                            Release Vehicle
                          </button>
                        )}
                        {v.status === 'Departed' && (
                           <span className="text-xs font-medium text-gray-500 italic py-1.5">Completed</span>
                        )}
                    </div>
                  </div>
                );
              })}
              {vehicles.length === 0 && (
                <div className="col-span-1 md:col-span-2 text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                  <Truck className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                  <p>No vehicles logged for today.</p>
                </div>
              )}
            </div>
          </div>`;

  code = code.substring(0, tableStartIndex) + newCardGrid + code.substring(tableEndIndex);
}

fs.writeFileSync('src/components/DockManagementScreen.tsx', code);
