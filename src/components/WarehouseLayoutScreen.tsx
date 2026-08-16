import React from 'react';
import { Map, Zap, Users, Truck, AlertTriangle, ShieldCheck } from 'lucide-react';

export function WarehouseLayoutScreen() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <Map className="text-indigo-600 h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Warehouse Layout & Heatmap</h2>
            <p className="text-sm text-gray-500">Interactive visualization for traffic, bottlenecks, and zones</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[600px] flex flex-col">
        
        <div className="flex gap-4 mb-6">
           <div className="flex items-center gap-2 text-sm"><span className="w-3 h-3 rounded-full bg-red-500"></span> High Traffic</div>
           <div className="flex items-center gap-2 text-sm"><span className="w-3 h-3 rounded-full bg-amber-400"></span> Medium Traffic</div>
           <div className="flex items-center gap-2 text-sm"><span className="w-3 h-3 rounded-full bg-green-400"></span> Smooth Flow</div>
        </div>

        <div className="relative flex-1 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden group">
          {/* Main Layout Canvas - Simulated */}
          
          {/* Dock Doors (Left) */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gray-200 border-r border-gray-300 flex flex-col justify-around py-8">
            <div className="h-16 bg-white mx-2 flex items-center justify-center rounded border border-gray-300 relative shadow-sm">
               <Truck className="text-gray-400 h-6 w-6" />
               <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-amber-400 opacity-75 animate-ping"></div>
               <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-amber-500"></div>
            </div>
            <div className="h-16 bg-white mx-2 flex items-center justify-center rounded border border-gray-300 relative shadow-sm">
               <Truck className="text-gray-400 h-6 w-6" />
               <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-red-500 opacity-75 animate-ping"></div>
               <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-red-600"></div>
            </div>
            <div className="h-16 bg-white mx-2 flex items-center justify-center rounded border border-gray-300 shadow-sm text-xs font-bold text-gray-400">DOCK 3</div>
            <div className="h-16 bg-white mx-2 flex items-center justify-center rounded border border-gray-300 shadow-sm text-xs font-bold text-gray-400">DOCK 4</div>
          </div>

          {/* Cross Docking Zone (Middle Left) */}
          <div className="absolute left-32 top-12 w-48 h-32 bg-purple-50 border-2 border-purple-200 rounded-lg p-3 flex flex-col">
            <span className="text-xs font-bold text-purple-700 flex items-center gap-1"><Zap className="h-3 w-3" /> Cross-Dock Area</span>
            <div className="flex-1 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center relative">
                <div className="w-8 h-8 rounded-full bg-red-500/40"></div>
                <AlertTriangle className="absolute text-red-700 h-4 w-4" />
              </div>
            </div>
          </div>

          {/* QC Zone */}
          <div className="absolute left-32 bottom-12 w-48 h-48 bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
             <span className="text-xs font-bold text-blue-700 flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> QC & Inspection</span>
             <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="h-8 bg-green-200 rounded"></div>
                <div className="h-8 bg-green-200 rounded"></div>
                <div className="h-8 bg-red-200 rounded"></div>
                <div className="h-8 bg-green-200 rounded"></div>
             </div>
          </div>

          {/* Racks / Inventory Storage */}
          <div className="absolute left-96 right-12 top-12 bottom-12 flex flex-col justify-between">
             <div className="flex gap-8 h-24">
                <div className="flex-1 bg-gray-300 rounded shadow-inner flex flex-col justify-around px-2 py-1">
                   <div className="h-2 bg-indigo-400 w-full rounded-sm"></div>
                   <div className="h-2 bg-indigo-400 w-4/5 rounded-sm"></div>
                   <div className="h-2 bg-indigo-400 w-full rounded-sm"></div>
                </div>
                <div className="flex-1 bg-gray-300 rounded shadow-inner flex flex-col justify-around px-2 py-1">
                   <div className="h-2 bg-indigo-400 w-full rounded-sm"></div>
                   <div className="h-2 bg-indigo-400 w-full rounded-sm"></div>
                   <div className="h-2 bg-indigo-400 w-full rounded-sm"></div>
                </div>
                <div className="w-48 bg-orange-100 border-2 border-orange-300 rounded flex flex-col items-center justify-center p-2 text-center">
                   <span className="text-xs font-bold text-orange-800">HazMat Zone A</span>
                   <div className="w-12 h-12 rounded-full bg-orange-400/30 flex items-center justify-center mt-1">
                      <div className="w-6 h-6 rounded-full bg-orange-500/50"></div>
                   </div>
                </div>
             </div>

             {/* Aisle Path */}
             <div className="h-20 w-full relative">
                <div className="absolute top-1/2 -translate-y-1/2 w-full border-t-2 border-dashed border-gray-400"></div>
                {/* Simulated workers/forklifts */}
                <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-6 h-6 bg-yellow-400 rounded-sm flex items-center justify-center shadow">
                  <Users className="h-3 w-3 text-yellow-900" />
                </div>
                <div className="absolute left-2/3 top-1/2 -translate-y-1/2 w-6 h-6 bg-yellow-400 rounded-sm flex items-center justify-center shadow">
                  <Users className="h-3 w-3 text-yellow-900" />
                </div>
             </div>

             <div className="flex gap-8 h-24">
                <div className="flex-1 bg-gray-300 rounded shadow-inner flex flex-col justify-around px-2 py-1">
                   <div className="h-2 bg-indigo-400 w-1/2 rounded-sm"></div>
                   <div className="h-2 bg-indigo-400 w-3/4 rounded-sm"></div>
                   <div className="h-2 bg-indigo-400 w-full rounded-sm"></div>
                </div>
                <div className="flex-1 bg-gray-300 rounded shadow-inner flex flex-col justify-around px-2 py-1 relative">
                   <div className="absolute inset-0 bg-red-500/10 rounded"></div>
                   <div className="h-2 bg-indigo-400 w-full rounded-sm"></div>
                   <div className="h-2 bg-indigo-400 w-full rounded-sm"></div>
                   <div className="h-2 bg-indigo-400 w-full rounded-sm"></div>
                </div>
                <div className="w-48 bg-blue-100 border-2 border-blue-300 rounded flex flex-col items-center justify-center p-2 text-center">
                   <span className="text-xs font-bold text-blue-800">Temp Control</span>
                   <span className="text-xs font-mono text-blue-600 mt-1">4.2°C</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
