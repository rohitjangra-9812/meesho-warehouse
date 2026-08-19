import React, { useEffect, useState } from 'react';
import { fetchApi } from '../lib/api.ts';
import { Download, ArrowDownToLine, PackagePlus } from 'lucide-react';

export function InboundScreen() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShipments = async () => {
    try {
      const data = await fetchApi('/inbound');
      setShipments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const handleReceive = async (id: number) => {
    await fetchApi(`/inbound/${id}/receive`, { method: 'POST' });
    fetchShipments();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inbound & Receiving</h2>
          <p className="text-sm text-gray-500 mt-1">Manage vendor shipments and GRN operations</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-xs font-semibold tracking-wide text-gray-500 uppercase border-b border-gray-100">
              <th className="px-6 py-4">Batch Number</th>
              <th className="px-6 py-4">Vendor</th>
              <th className="px-6 py-4">Items</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : shipments.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No inbound shipments found.</td></tr>
            ) : shipments.map((shipment, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{shipment.batchNumber}</td>
                <td className="px-6 py-4 text-gray-600">{shipment.vendorName || `Vendor #${shipment.vendorId}`}</td>
                <td className="px-6 py-4 text-gray-600">{shipment.totalItems}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                    shipment.status === 'Received' ? 'bg-green-100 text-green-700' : 
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {shipment.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {shipment.status === 'Pending' && (
                    <button 
                      onClick={() => handleReceive(shipment.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg font-medium text-xs hover:bg-blue-700 transition-colors"
                    >
                      <ArrowDownToLine size={14} /> Receive Stock
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
