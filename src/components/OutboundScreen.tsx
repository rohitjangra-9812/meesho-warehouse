import React, { useEffect, useState } from 'react';
import { fetchApi } from '../lib/api.ts';
import { ArrowUpFromLine, PackageCheck, Box, Truck } from 'lucide-react';

export function OutboundScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const data = await fetchApi('/outbound');
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    await fetchApi(`/outbound/${id}/status`, { 
      method: 'POST', 
      body: JSON.stringify({ status }) 
    });
    fetchOrders();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Outbound & Fulfillment</h2>
        <p className="text-sm text-gray-500 mt-1">Pick, pack, label generation, and dispatch</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-xs font-semibold tracking-wide text-gray-500 uppercase border-b border-gray-100">
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">SKU & Qty</th>
              <th className="px-6 py-4">Courier</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Workflow</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No outbound orders found.</td></tr>
            ) : orders.map((order, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{order.meeshoOrderId}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{order.trackingId || 'Unassigned'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-700">{order.sku}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Qty: {order.quantity}</div>
                </td>
                <td className="px-6 py-4 text-gray-600 font-medium">
                  {order.courierPartner || 'N/A'}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                    order.status === 'Dispatched' ? 'bg-purple-100 text-purple-700' : 
                    order.status === 'Packed' ? 'bg-green-100 text-green-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {order.status === 'Pending' && (
                    <button 
                      onClick={() => updateStatus(order.id, 'Packed')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg font-medium text-xs hover:bg-blue-700 transition-colors"
                    >
                      <Box size={14} /> Mark Packed
                    </button>
                  )}
                  {order.status === 'Packed' && (
                    <button 
                      onClick={() => updateStatus(order.id, 'Dispatched')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg font-medium text-xs hover:bg-purple-700 transition-colors"
                    >
                      <Truck size={14} /> Dispatch
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
