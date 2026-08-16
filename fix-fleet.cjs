const fs = require('fs');
let code = fs.readFileSync('src/components/FleetTrackingScreen.tsx', 'utf8');

// I will just re-write FleetTrackingScreen to a clean state.
const cleanCode = `
import React, { useState, useEffect } from 'react';
import { Truck, Map, Navigation, ShieldAlert, CheckCircle, Clock, Fuel, Activity } from 'lucide-react';

export function FleetTrackingScreen() {
  const [vehicles, setVehicles] = useState([
    { id: 'MH-12-AB-1234', type: 'Inbound', status: 'Approaching', eta: '10 mins', x: 20, y: 30, color: 'bg-blue-500', distance: 120, fuel: 85, efficiency: 4.2 },
    { id: 'KA-01-XY-9876', type: 'Outbound', status: 'In Transit', eta: '-', x: 70, y: 50, color: 'bg-green-500', distance: 340, fuel: 40, efficiency: 3.8 },
    { id: 'DL-4C-BN-5678', type: 'Inbound', status: 'Delayed', eta: '45 mins', x: 80, y: 20, color: 'bg-red-500', distance: 850, fuel: 15, efficiency: 3.5 },
    { id: 'HR-26-DQ-1111', type: 'Outbound', status: 'Departed', eta: '-', x: 10, y: 80, color: 'bg-green-500', distance: 5, fuel: 98, efficiency: 4.5 },
    { id: 'UP-16-AZ-9999', type: 'Inbound', status: 'At Gate', eta: 'Arrived', x: 45, y: 45, color: 'bg-yellow-500', distance: 412, fuel: 22, efficiency: 4.0 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prev => prev.map(v => {
        if (v.status === 'At Gate') return v;
        const dx = (Math.random() - 0.5) * 4;
        const dy = (Math.random() - 0.5) * 4;
        const distDelta = Math.sqrt(dx * dx + dy * dy) * 0.5;
        const fuelConsumed = distDelta / v.efficiency;
        return { 
          ...v, 
          x: Math.max(5, Math.min(95, v.x + dx)), 
          y: Math.max(5, Math.min(95, v.y + dy)),
          distance: v.distance + distDelta,
          fuel: Math.max(0, v.fuel - (fuelConsumed / 2))
        };
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Map className="text-blue-600" />
          Real-Time Fleet Tracking
        </h1>
        <div className="flex gap-4">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500"></span><span className="text-sm">Inbound</span></div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span><span className="text-sm">Outbound</span></div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span><span className="text-sm">Delayed</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map View */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-[600px] relative overflow-hidden">
          <div className="absolute inset-0 bg-slate-50 opacity-50" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          {/* Warehouse Base */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gray-800 rounded-lg shadow-xl flex items-center justify-center z-10 border-4 border-gray-700">
             <div className="text-center">
               <Navigation className="w-8 h-8 text-blue-400 mx-auto mb-1" />
               <span className="text-white font-bold text-xs uppercase tracking-widest">Main Dock</span>
             </div>
          </div>

          {vehicles.map((v) => (
            <div 
              key={v.id}
              className={\`absolute w-4 h-4 rounded-full shadow-lg border-2 border-white transition-all duration-1000 z-20 \${v.color}\`}
              style={{ left: \`\${v.x}%\`, top: \`\${v.y}%\` }}
              title={v.id}
            >
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow text-[10px] font-bold whitespace-nowrap z-30">
                {v.id}
              </div>
            </div>
          ))}
        </div>

        {/* Status List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-gray-200 bg-gray-50 font-semibold text-gray-700 flex justify-between items-center">
            <span>Active Fleet Status</span>
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">{vehicles.length} Active</span>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {vehicles.map(v => (
              <div key={v.id} className="p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Truck className={\`w-4 h-4 \${v.type === 'Inbound' ? 'text-blue-500' : 'text-green-500'}\`} />
                    <span className="font-bold text-gray-800 text-sm">{v.id}</span>
                  </div>
                  <span className={\`text-[10px] font-bold uppercase px-2 py-1 rounded-full \${
                    v.status === 'Delayed' ? 'bg-red-100 text-red-700' :
                    v.status === 'At Gate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }\`}>
                    {v.status}
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-xs text-gray-500 flex items-center gap-1"><Navigation className="w-3 h-3"/> {v.type}</span>
                  {v.type === 'Inbound' && (
                    <span className="text-xs font-semibold text-gray-700 flex items-center gap-1"><Clock className="w-3 h-3"/> ETA: {v.eta}</span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-100">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-800">{v.distance.toFixed(1)} km</span>
                    <span className="text-[10px] text-gray-500 flex items-center gap-1"><Navigation className="w-3 h-3"/> Distance</span>
                  </div>
                  <div className="flex flex-col">
                    <span className={\`text-xs font-bold \${v.fuel < 20 ? 'text-red-600' : 'text-gray-800'}\`}>{v.fuel.toFixed(1)}%</span>
                    <span className="text-[10px] text-gray-500 flex items-center gap-1"><Fuel className="w-3 h-3"/> Fuel Lvl</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-800">{v.efficiency.toFixed(1)} km/l</span>
                    <span className="text-[10px] text-gray-500 flex items-center gap-1"><Activity className="w-3 h-3"/> Efficiency</span>
                  </div>
                  <div className="col-span-3 mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div className={\`h-1.5 rounded-full transition-all duration-1000 \${v.fuel < 20 ? 'bg-red-500' : v.fuel < 50 ? 'bg-yellow-500' : 'bg-green-500'}\`} style={{ width: \`\${v.fuel}%\` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('src/components/FleetTrackingScreen.tsx', cleanCode);
