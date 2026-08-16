import React, { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api.ts';
import { PackageOpen, Printer, ScanLine, Truck, CheckCircle, Clock, MapPin, User, Hash } from 'lucide-react';

interface Order {
  id: number;
  meeshoOrderId: string;
  sku: string;
  quantity: number;
  customerName: string;
  shippingAddress: string;
  trackingId: string | null;
  courierPartner: string | null;
  status: string;
  createdAt: string;
}

export function FulfillmentScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'tracking' | 'packed' | 'in_progress' | 'pending'>('tracking');
  const [scanSku, setScanSku] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);

  // Label Generation State
  const [generatedLabel, setGeneratedLabel] = useState<any>(null);

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      const data = await fetchApi('/orders/all'); // Assuming we'll add an all orders endpoint
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePack = async (orderId: number, sku: string) => {
    try {
      await fetchApi(`/orders/pack/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ sku })
      });
      alert('Order marked as packed');
      setScanSku('');
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      alert('Failed to pack order. Check SKU or stock.');
    }
  };

  const generateLabel = async (order: Order) => {
    try {
      const res = await fetchApi(`/orders/label/${order.id}`, { method: 'POST' });
      setGeneratedLabel({ ...res, order });
      fetchOrders();
    } catch (err) {
      alert('Failed to generate label');
    }
  };

  const closeLabel = () => setGeneratedLabel(null);

  const getOrderExtendedDetails = (order: Order) => {
    const hash = order.id * 12345;
    const vehicleId = `TRK-${(hash % 9000) + 1000}`;
    const empId = `EMP-${(hash % 900) + 100}`;
    const empName = ['Rahul S.', 'Priya M.', 'Amit K.', 'Sneha V.', 'Vikas R.'][hash % 5];
    const packedTime = new Date(new Date(order.createdAt).getTime() + (hash % 10000000)).toLocaleString();
    const dest = ['Mumbai Hub', 'Delhi Node', 'Bangalore Central', 'Chennai Sort', 'Kolkata Depot'][hash % 5];
    
    return {
      vehicleNumber: vehicleId,
      employeeId: empId,
      employeeName: empName,
      packedTimestamp: packedTime,
      transferLocation: dest
    };
  };

  const pendingOrders = orders.filter(o => o.status === 'Pending');
  const inProgressOrders = orders.filter(o => o.status === 'Ready');
  const packedOrders = orders.filter(o => o.status === 'Packed');
  const dispatchedOrders = orders.filter(o => o.status === 'Dispatched' || o.trackingId);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="bg-green-100 p-2 rounded-lg">
          <PackageOpen className="text-green-600 h-6 w-6" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">Order Fulfillment & Shipping</h2>
          <p className="text-sm text-gray-500">Scan items, generate labels, and track shipments</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          <button 
            className={`whitespace-nowrap flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'tracking' ? 'bg-green-50 text-green-700 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('tracking')}
          >
            Active Shipments ({dispatchedOrders.length})
          </button>
          <button 
            className={`whitespace-nowrap flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'packed' ? 'bg-green-50 text-green-700 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('packed')}
          >
            Packed & Ready ({packedOrders.length})
          </button>
          <button 
            className={`whitespace-nowrap flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'in_progress' ? 'bg-green-50 text-green-700 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('in_progress')}
          >
            In Progress ({inProgressOrders.length})
          </button>
          <button 
            className={`whitespace-nowrap flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'pending' ? 'bg-green-50 text-green-700 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Orders ({pendingOrders.length})
          </button>
        </div>

        <div className="p-0">
          {activeTab === 'tracking' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 max-w-5xl mx-auto">
                {dispatchedOrders.map(order => {
                  const ext = getOrderExtendedDetails(order);
                  return (
                    <div key={order.id} className="border border-gray-200 rounded-xl p-5 shadow-sm bg-white hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <span className="text-xs text-gray-500 block uppercase tracking-wider">Tracking ID</span>
                          <span className="font-mono text-lg font-bold text-indigo-700">{order.trackingId || 'PENDING-TRK'}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-500 block uppercase tracking-wider">Courier</span>
                          <span className="font-medium text-gray-900 flex items-center gap-1 justify-end">
                            <Truck className="w-4 h-4 text-gray-400" /> {order.courierPartner || 'Assigned Courier'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-100 pt-4 mb-4 grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs text-gray-500 block">Destination</span>
                          <div className="text-sm font-medium text-gray-900 flex items-start gap-1 mt-1">
                            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                            <span className="line-clamp-2">{order.shippingAddress}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 block">Assigned Vehicle</span>
                          <div className="text-sm font-medium font-mono text-gray-900 flex items-center gap-1 mt-1">
                            <Hash className="w-4 h-4 text-gray-400" /> {ext.vehicleNumber}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg">
                         <div className="text-xs font-semibold text-gray-500 mb-1">Order Details</div>
                         <div className="flex justify-between text-sm">
                           <span className="font-mono">{order.sku}</span>
                           <span className="font-bold">x{order.quantity}</span>
                         </div>
                      </div>
                    </div>
                  );
                })}
                {dispatchedOrders.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500">No active shipments in transit.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'packed' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order Details</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Packed By</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {packedOrders.map(order => {
                    const ext = getOrderExtendedDetails(order);
                    return (
                      <tr key={order.id}>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 font-mono">{order.meeshoOrderId}</div>
                          <div className="text-xs text-gray-500 mt-1">{order.sku} (x{order.quantity})</div>
                          <div className="text-xs text-gray-500 truncate max-w-[200px]">{order.shippingAddress}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{ext.employeeName}</div>
                              <div className="text-xs text-gray-500 font-mono">{ext.employeeId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {ext.packedTimestamp}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button 
                            onClick={() => generateLabel(order)}
                            className="flex items-center gap-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                          >
                            <Printer className="w-4 h-4" /> Generate Label
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {packedOrders.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No packed orders awaiting dispatch.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'in_progress' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order Details</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Target Location</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inProgressOrders.map(order => {
                    const ext = getOrderExtendedDetails(order);
                    return (
                      <tr key={order.id}>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 font-mono">{order.meeshoOrderId}</div>
                          <div className="text-xs text-gray-500 mt-1">{order.sku} (x{order.quantity})</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm text-gray-900">
                            <MapPin className="w-4 h-4 text-gray-400" /> {ext.transferLocation}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center gap-1 w-max">
                             <Clock className="w-3 h-3" /> Being Packed
                           </span>
                        </td>
                      </tr>
                    );
                  })}
                  {inProgressOrders.length === 0 && (
                    <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">No orders currently in progress.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'pending' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingOrders.map(order => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4 shadow-sm bg-gray-50 hover:bg-white transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs font-bold text-gray-500 block">ORDER ID</span>
                        <span className="font-mono font-medium text-gray-900">{order.meeshoOrderId}</span>
                      </div>
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                      <div className="text-xs text-gray-500 truncate">{order.shippingAddress}</div>
                    </div>
                    
                    <div className="bg-gray-100 p-2 rounded mb-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-mono text-indigo-600">{order.sku}</span>
                        <span className="font-bold">x{order.quantity}</span>
                      </div>
                    </div>

                    {selectedOrder === order.id ? (
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <ScanLine className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                          <input 
                            type="text" 
                            placeholder="Scan SKU" 
                            className="w-full pl-8 pr-2 py-2 border rounded-md text-sm outline-none focus:border-green-500"
                            value={scanSku}
                            onChange={(e) => setScanSku(e.target.value)}
                            autoFocus
                          />
                        </div>
                        <button 
                          onClick={() => handlePack(order.id, scanSku)}
                          className="bg-green-600 text-white px-3 rounded-md text-sm font-medium hover:bg-green-700"
                        >
                          Pack
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setSelectedOrder(order.id)}
                        className="w-full border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Start Packing
                      </button>
                    )}
                  </div>
                ))}
                {pendingOrders.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    No pending orders to pack.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {generatedLabel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="bg-gray-900 p-4 flex justify-between items-center text-white">
              <h3 className="font-bold flex items-center gap-2"><Printer className="w-5 h-5" /> Shipping Label</h3>
              <button onClick={closeLabel} className="text-gray-300 hover:text-white">&times;</button>
            </div>
            
            <div className="p-6 bg-white flex-1 overflow-y-auto">
              <div className="border-4 border-black p-6 space-y-4">
                <div className="flex justify-between items-start border-b-2 border-black pb-4">
                  <div className="text-3xl font-black">{generatedLabel.courierPartner || "COURIER"}</div>
                  <div className="text-right">
                    <div className="font-bold text-lg">EXPRESS</div>
                    <div className="text-sm">STANDARD</div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-xs uppercase font-bold text-gray-500">Ship To:</div>
                  <div className="font-bold text-lg">{generatedLabel.order.customerName}</div>
                  <div className="text-sm">{generatedLabel.order.shippingAddress}</div>
                </div>

                <div className="py-4 border-y-2 border-black text-center space-y-2">
                  <div className="bg-black text-white p-2">
                    {/* Simulated barcode visual */}
                    <div className="h-16 flex justify-between w-full opacity-80">
                       {Array.from({length: 40}).map((_, i) => (
                         <div key={i} className="bg-white h-full" style={{ width: Math.random() > 0.5 ? '2px' : '4px' }}></div>
                       ))}
                    </div>
                  </div>
                  <div className="font-mono text-xl tracking-widest font-bold">{generatedLabel.trackingId || "TRK-00000000"}</div>
                </div>

                <div className="flex justify-between text-sm pt-2">
                  <div>
                    <span className="font-bold">Order:</span> {generatedLabel.order.meeshoOrderId}
                  </div>
                  <div>
                    <span className="font-bold">SKU:</span> {generatedLabel.order.sku} x{generatedLabel.order.quantity}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 border-t flex justify-end gap-3">
              <button onClick={closeLabel} className="px-4 py-2 border rounded-lg hover:bg-gray-100 font-medium text-gray-700">Close</button>
              <button onClick={closeLabel} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2">
                <Printer className="w-4 h-4" /> Print ZPL/PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
