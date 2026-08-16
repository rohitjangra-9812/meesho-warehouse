import React, { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api.ts';
import { Box, ShoppingCart, RefreshCw, AlertTriangle } from 'lucide-react';

export function PackagingLedgerScreen() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/packaging');
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('auto-refresh', loadData);
    return () => window.removeEventListener('auto-refresh', loadData);
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-teal-100 p-2 rounded-lg">
            <Box className="text-teal-600 h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Packaging & Consumables Ledger</h2>
            <p className="text-sm text-gray-500">Real-time tracking of packing materials with automated reorder triggers</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
           <div className="col-span-full text-center py-8">Loading packaging items...</div>
        ) : (
          data.slice(0, 8).map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-gray-800">{item.materialType}</h3>
                <Box className="text-gray-400 h-5 w-5" />
              </div>
              <div className="mb-4">
                <div className="text-2xl font-black text-gray-900">{item.currentStock.toLocaleString()}</div>
                <div className="text-xs text-gray-500">Current Stock Level</div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                <div className={`h-1.5 rounded-full ${item.currentStock < item.reorderThreshold ? 'bg-red-500' : 'bg-teal-500'}`} style={{ width: `${Math.min(100, (item.currentStock / 2000) * 100)}%` }}></div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-500 mb-4">
                <span>0</span>
                <span>Threshold: {item.reorderThreshold}</span>
              </div>
              
              {item.autoReorderTriggered ? (
                <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 p-2 rounded">
                  <RefreshCw className="h-3 w-3" /> Auto-Reorder Triggered
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 p-2 rounded">
                  <ShoppingCart className="h-3 w-3" /> Stock Adequate
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
