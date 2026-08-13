import React, { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api.ts';
import { Truck, Clock, CalendarCheck, CalendarRange, Navigation, Settings, Plus, X, AlertTriangle, Camera, Activity, TrendingUp } from 'lucide-react';

interface DockDoor {
  id: number;
  doorNumber: string;
  status: string;
  currentVehicleId: number | null;
  notes: string | null;
}

interface VehicleLog {
  id: number;
  vehicleNumber: string;
  carrierName: string;
  type: string;
  scheduledTime: string | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: string;
  dockDoorId: number | null;
  driverName: string;
  driverContact: string;
}

const getStateName = (plateNumber: string) => {
  if (!plateNumber || plateNumber.length < 2) return 'Unknown State';
  const code = plateNumber.substring(0, 2).toUpperCase();
  const stateMap: Record<string, string> = {
    'AP': 'Andhra Pradesh', 'AR': 'Arunachal Pradesh', 'AS': 'Assam', 'BR': 'Bihar', 
    'CG': 'Chhattisgarh', 'GA': 'Goa', 'GJ': 'Gujarat', 'HR': 'Haryana', 'HP': 'Himachal Pradesh', 
    'JH': 'Jharkhand', 'KA': 'Karnataka', 'KL': 'Kerala', 'MP': 'Madhya Pradesh', 'MH': 'Maharashtra', 
    'MN': 'Manipur', 'ML': 'Meghalaya', 'MZ': 'Mizoram', 'NL': 'Nagaland', 'OD': 'Odisha', 
    'PB': 'Punjab', 'RJ': 'Rajasthan', 'SK': 'Sikkim', 'TN': 'Tamil Nadu', 'TG': 'Telangana', 
    'TR': 'Tripura', 'UP': 'Uttar Pradesh', 'UK': 'Uttarakhand', 'WB': 'West Bengal', 
    'AN': 'Andaman and Nicobar', 'CH': 'Chandigarh', 'DN': 'Dadra & Nagar', 
    'DD': 'Daman & Diu', 'DL': 'Delhi', 'JK': 'Jammu & Kashmir', 'LA': 'Ladakh', 
    'LD': 'Lakshadweep', 'PY': 'Puducherry'
  };
  return stateMap[code] || 'Unknown State';
};

export function DockManagementScreen() {
  const [doors, setDoors] = useState<DockDoor[]>([]);
  const [vehicles, setVehicles] = useState<VehicleLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [optimalPath, setOptimalPath] = useState<{ optimalPath: string, congestionLevel: number } | null>(null);

  // New Booking State
  const [showBooking, setShowBooking] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    vehicleNumber: '', carrierName: '', type: 'Inbound', driverName: '', driverContact: '', scheduledTime: ''
  });
  
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard');
  
  const alertHistory = [
    { id: 1, timestamp: '2026-08-10T14:30:00Z', location: 'Gate A (Inbound)', severity: 'High', description: 'Surge of 15 expected vehicles within 30 minutes.' },
    { id: 2, timestamp: '2026-08-09T09:15:00Z', location: 'Dock 08-10', severity: 'Medium', description: 'Occupancy exceeded 80% for over 2 hours.' },
    { id: 3, timestamp: '2026-08-08T18:45:00Z', location: 'Warehouse Packing & Docks Gate', severity: 'Critical', description: 'High trafficking occurred in the warehouse packing and the docks gate.' },
    { id: 4, timestamp: '2026-08-07T11:20:00Z', location: 'Yard Staging Area', severity: 'High', description: 'Yard capacity reached 95%. Traffic diverted.' },
  ];


  const totalDoors = doors.length;
  const occupiedDoors = doors.filter(d => d.status === 'Occupied').length;
  const occupancyRate = totalDoors > 0 ? (occupiedDoors / totalDoors) : 0;
  const showCapacityAlert = occupancyRate > 0.8 && !alertDismissed;

  useEffect(() => {
    if (occupancyRate <= 0.8 && alertDismissed) {
      setAlertDismissed(false);
    }
  }, [occupancyRate, alertDismissed]);

    const currentInboundExpected = vehicles.filter(v => v.type === 'Inbound' && (v.status === 'Expected' || v.status === 'Arrived')).length;
  // Mock 7-day rolling average
  const rollingAvgInbound = 5; 
  const surgeMultiplier = currentInboundExpected / (rollingAvgInbound || 1);
  const isSurge = surgeMultiplier >= 1.5;

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/docks');
      setDoors(res.doors);
      setVehicles(res.vehicles);
      try {
        const pathRes = await fetchApi('/docks/paths/optimal');
        setOptimalPath(pathRes);
      } catch(e) {
        console.error(e);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSeedDoors = async () => {
    try {
      await fetchApi('/docks/doors/seed', { method: 'POST' });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/docks/vehicles', {
        method: 'POST',
        body: JSON.stringify(newVehicle)
      });
      setShowBooking(false);
      setNewVehicle({ vehicleNumber: '', carrierName: '', type: 'Inbound', driverName: '', driverContact: '', scheduledTime: '' });
      loadData();
    } catch (err) {
      alert("Failed to book slot");
    }
  };

  const updateStatus = async (id: number, status: string, dockDoorId?: number) => {
    try {
      await fetchApi(`/docks/vehicles/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, dockDoorId })
      });
      loadData();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (

    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-xl">
            <Truck className="text-blue-700 h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Inbound & Outbound Docks</h2>
            <p className="text-sm text-gray-500">Manage dock doors, track arrivals, and control yard traffic.</p>
          </div>
        </div>
        <div className="flex gap-2">
          {doors.length === 0 && (
            <button onClick={handleSeedDoors} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
              Initialize Doors
            </button>
          )}
          <button 
            onClick={() => setShowBooking(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Book Slot
          </button>
        </div>
      </div>

            <div className="flex gap-6 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'dashboard' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Live Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('history')} 
          className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Alert History
        </button>
      </div>

      {activeTab === 'dashboard' ? (
        <>
{showBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold text-gray-900">Book Vehicle Slot</h3>
              <button onClick={() => setShowBooking(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleBookingSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                  <input required type="text" value={newVehicle.vehicleNumber} onChange={e => setNewVehicle({...newVehicle, vehicleNumber: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500" placeholder="e.g. HR-38-Z-1234" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Carrier / Transporter</label>
                  <input required type="text" value={newVehicle.carrierName} onChange={e => setNewVehicle({...newVehicle, carrierName: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500" placeholder="e.g. Delhivery" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={newVehicle.type} onChange={e => setNewVehicle({...newVehicle, type: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500">
                    <option value="Inbound">Inbound (Receiving)</option>
                    <option value="Outbound">Outbound (Shipping)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Time</label>
                  <input required type="datetime-local" value={newVehicle.scheduledTime} onChange={e => setNewVehicle({...newVehicle, scheduledTime: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Driver Name</label>
                  <input required type="text" value={newVehicle.driverName} onChange={e => setNewVehicle({...newVehicle, driverName: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500" placeholder="Driver name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Driver Contact</label>
                  <input required type="text" value={newVehicle.driverContact} onChange={e => setNewVehicle({...newVehicle, driverContact: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500" placeholder="Phone number" />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowBooking(false)} className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCapacityAlert && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border-2 border-red-500">
            <div className="bg-red-50 p-4 border-b border-red-100 flex items-start gap-3">
              <div className="bg-red-100 p-2 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1 pt-0.5">
                <h3 className="font-bold text-red-900 text-lg">High Dock Occupancy Alert</h3>
                <p className="text-sm text-red-700">Dock capacity has exceeded 80% ({(occupancyRate * 100).toFixed(0)}% full). Review currently docked vehicles to expedite turnaround.</p>
              </div>
              <button onClick={() => setAlertDismissed(true)} className="text-red-400 hover:text-red-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-0 max-h-[60vh] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Dock</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Vehicle</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {vehicles.filter(v => v.status === 'Docked').map(v => (
                    <tr key={v.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">
                        {doors.find(d => d.id === v.dockDoorId)?.doorNumber || 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{v.vehicleNumber}</span>
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200 mt-0.5 w-max">
                            {getStateName(v.vehicleNumber)}
                          </span>
                          <span className="text-xs text-gray-500 mt-1">{v.carrierName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${v.type === 'Inbound' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                          {v.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <button onClick={() => updateStatus(v.id, 'Departed')} className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 px-3 py-1.5 rounded-lg font-medium transition-colors">
                          Release
                        </button>
                      </td>
                    </tr>
                  ))}
                  {vehicles.filter(v => v.status === 'Docked').length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">No vehicles currently docked.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button onClick={() => setAlertDismissed(true)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-medium transition-colors">
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl shadow-sm border border-indigo-100 p-6">
            <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
              <Camera className="w-5 h-5 text-indigo-600" /> AI Yard Camera Analysis
            </h3>
            <p className="text-xs text-indigo-700 mb-4">Real-time congestion and turnaround analysis.</p>
            {doors.filter(d => d.status === 'Available').length > 0 ? (
              <div className="bg-white p-4 rounded-lg border border-indigo-50 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase">Suggested Next Assignment</span>
                  <p className="font-bold text-xl text-gray-900 mt-1">{doors.filter(d => d.status === 'Available')[0]?.doorNumber}</p>
                </div>
                <div className="text-right">
                   <div className="flex items-center gap-1 text-green-600 text-xs font-medium justify-end mb-1">
                      <Activity className="w-3 h-3" /> Least Congested Path
                   </div>
                   <p className="text-xs text-gray-600 font-bold">{optimalPath ? optimalPath.optimalPath : "Calculating..."}</p>
                   {optimalPath && <p className="text-[10px] text-gray-400">Congestion: {optimalPath.congestionLevel.toFixed(0)}%</p>}
                </div>
              </div>
            ) : (
               <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 flex items-center gap-3">
                 <AlertTriangle className="text-orange-500 w-5 h-5" />
                 <p className="text-sm font-medium text-orange-800">All gates currently occupied. High congestion.</p>
               </div>
            )}
          </div>
          
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gray-500" /> Traffic Surge Prediction
            </h3>
            <div className="flex items-center justify-between mb-2">
               <span className="text-sm font-medium text-gray-600">Current Inflow Rate</span>
               <span className="font-bold text-gray-900">{currentInboundExpected} vehicles</span>
            </div>
            <div className="flex items-center justify-between mb-4">
               <span className="text-sm font-medium text-gray-600">7-Day Rolling Avg</span>
               <span className="font-bold text-gray-900">{rollingAvgInbound} vehicles</span>
            </div>
            
            <div className={`p-4 rounded-lg border ${isSurge ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
               {isSurge ? (
                 <div className="flex items-start gap-3">
                   <AlertTriangle className="text-red-600 w-5 h-5 shrink-0 mt-0.5" />
                   <div>
                     <p className="font-bold text-red-900 text-sm">Surge Warning</p>
                     <p className="text-xs text-red-700 mt-1">
                       Inflow is {(surgeMultiplier * 100).toFixed(0)}% of the 7-day average. Prepare for potential gate congestion in the next hour.
                     </p>
                   </div>
                 </div>
               ) : (
                 <div className="flex items-start gap-3">
                   <Activity className="text-green-600 w-5 h-5 shrink-0 mt-0.5" />
                   <div>
                     <p className="font-bold text-green-900 text-sm">Traffic Normal</p>
                     <p className="text-xs text-green-700 mt-1">
                       Current inflow rate is stable and within expected historical bounds.
                     </p>
                   </div>
                 </div>
               )}
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Navigation className="w-5 h-5 text-gray-500" /> Dock Doors</h3>
            <div className="grid grid-cols-2 gap-3">
              {doors.map(door => (
                <div key={door.id} className={`p-4 rounded-xl border ${
                  door.status === 'Available' ? 'bg-green-50 border-green-200' :
                  door.status === 'Occupied' ? 'bg-orange-50 border-orange-200' :
                  'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-gray-900">{door.doorNumber}</span>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    door.status === 'Available' ? 'bg-green-100 text-green-700' :
                    door.status === 'Occupied' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-200 text-gray-700'
                  }`}>{door.status}</span>
                </div>
              ))}
              {doors.length === 0 && <p className="text-sm text-gray-500 col-span-2">No dock doors initialized.</p>}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2"><CalendarRange className="w-5 h-5 text-gray-500" /> Vehicle Log & Yard Traffic</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Vehicle & Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Time/Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Dock/Driver</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {vehicles.map(v => (
                  <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">{v.vehicleNumber}</span>
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200 mt-0.5 w-max">
                          {getStateName(v.vehicleNumber)}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">{v.carrierName}</span>
                        <span className={`text-xs mt-1 w-max px-2 py-0.5 rounded-full font-medium ${v.type === 'Inbound' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                          {v.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900 font-medium">
                          {v.status}
                        </span>
                        {v.scheduledTime && (
                          <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" /> {new Date(v.scheduledTime).toLocaleString([], {hour: '2-digit', minute:'2-digit', month: 'short', day: 'numeric'})}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col">
                        {v.dockDoorId ? (
                          <span className="font-bold text-gray-900">{doors.find(d => d.id === v.dockDoorId)?.doorNumber}</span>
                        ) : (
                          <span className="text-gray-400">No Dock</span>
                        )}
                        <span className="text-xs mt-1">{v.driverName} ({v.driverContact})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex flex-col items-end gap-2">
                        {v.status === 'Expected' && (
                          <button onClick={() => updateStatus(v.id, 'Arrived')} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium transition-colors">Check-In</button>
                        )}
                        {v.status === 'Arrived' && (
                          <select 
                            onChange={(e) => updateStatus(v.id, 'Docked', Number(e.target.value))}
                            className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-lg px-2 py-1 outline-none"
                            defaultValue=""
                          >
                            <option value="" disabled>Assign Dock</option>
                            {doors.filter(d => d.status === 'Available').map(d => (
                              <option key={d.id} value={d.id}>{d.doorNumber}</option>
                            ))}
                          </select>
                        )}
                        {v.status === 'Docked' && (
                          <button onClick={() => updateStatus(v.id, 'Departed')} className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 px-3 py-1.5 rounded-lg font-medium transition-colors">Release & Check-Out</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {vehicles.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500 text-sm">No vehicles scheduled or logged.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-gray-500" /> Historical Traffic Alerts</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Severity</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {alertHistory.map(alert => (
                  <tr key={alert.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {new Date(alert.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {alert.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        alert.severity === 'Critical' ? 'bg-red-100 text-red-800' : 
                        alert.severity === 'High' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {alert.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
