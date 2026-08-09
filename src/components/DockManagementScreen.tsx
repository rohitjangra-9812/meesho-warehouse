import React, { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api.ts';
import { Truck, Clock, CalendarCheck, CalendarRange, Navigation, Settings, Plus, X, AlertTriangle } from 'lucide-react';

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

export function DockManagementScreen() {
  const [doors, setDoors] = useState<DockDoor[]>([]);
  const [vehicles, setVehicles] = useState<VehicleLog[]>([]);
  const [loading, setLoading] = useState(true);

  // New Booking State
  const [showBooking, setShowBooking] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    vehicleNumber: '', carrierName: '', type: 'Inbound', driverName: '', driverContact: '', scheduledTime: ''
  });
  
  const [alertDismissed, setAlertDismissed] = useState(false);

  const totalDoors = doors.length;
  const occupiedDoors = doors.filter(d => d.status === 'Occupied').length;
  const occupancyRate = totalDoors > 0 ? (occupiedDoors / totalDoors) : 0;
  const showCapacityAlert = occupancyRate > 0.8 && !alertDismissed;

  useEffect(() => {
    if (occupancyRate <= 0.8 && alertDismissed) {
      setAlertDismissed(false);
    }
  }, [occupancyRate, alertDismissed]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/docks');
      setDoors(res.doors);
      setVehicles(res.vehicles);
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
                          <span className="text-xs text-gray-500">{v.carrierName}</span>
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
                        <span className="text-xs text-gray-500">{v.carrierName}</span>
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
    </div>
  );
}
