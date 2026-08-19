import React, { useEffect, useState } from 'react';
import { fetchApi } from '../lib/api.ts';
import { RotateCcw, CheckSquare, XSquare } from 'lucide-react';

export function ReturnsScreen() {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReturns = async () => {
    try {
      const data = await fetchApi('/returns');
      setReturns(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleAction = async (id: number, action: string) => {
    await fetchApi(`/returns/${id}/action`, { 
      method: 'POST',
      body: JSON.stringify({ action })
    });
    fetchReturns();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Returns & RTO</h2>
        <p className="text-sm text-gray-500 mt-1">Manage customer returns and RTO inspections</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-xs font-semibold tracking-wide text-gray-500 uppercase border-b border-gray-100">
              <th className="px-6 py-4">RMA / Order ID</th>
              <th className="px-6 py-4">SKU</th>
              <th className="px-6 py-4">Reason</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Inspection</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : returns.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No pending returns found.</td></tr>
            ) : returns.map((ret, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{ret.rmaId}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{ret.meeshoOrderId}</div>
                </td>
                <td className="px-6 py-4 font-medium text-gray-700">{ret.sku}</td>
                <td className="px-6 py-4 text-gray-600">{ret.reason}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                    ret.status === 'Restocked' ? 'bg-green-100 text-green-700' : 
                    ret.status === 'Liquidated' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {ret.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {ret.status === 'Pending Inspection' && (
                    <>
                      <button 
                        onClick={() => handleAction(ret.id, 'Restock')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg font-medium text-xs hover:bg-green-700 transition-colors"
                      >
                        <CheckSquare size={14} /> Restock
                      </button>
                      <button 
                        onClick={() => handleAction(ret.id, 'Liquidate')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg font-medium text-xs hover:bg-red-700 transition-colors"
                      >
                        <XSquare size={14} /> Liquidate
                      </button>
                    </>
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
