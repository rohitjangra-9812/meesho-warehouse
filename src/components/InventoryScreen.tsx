import React, { useEffect, useState } from 'react';
import { fetchApi } from '../lib/api.ts';
import { PackageSearch, AlertTriangle, Search, Filter } from 'lucide-react';

export function InventoryScreen() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchInventory = async () => {
    try {
      const data = await fetchApi('/inventory');
      setInventory(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const filtered = inventory.filter(item => 
    item.sku.toLowerCase().includes(search.toLowerCase()) || 
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.binLocation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Live Inventory</h2>
          <p className="text-sm text-gray-500 mt-1">Bin locations and stock levels</p>
        </div>
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search SKU or Bin..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-xs font-semibold tracking-wide text-gray-500 uppercase border-b border-gray-100">
              <th className="px-6 py-4">SKU / Item</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Bin Location</th>
              <th className="px-6 py-4">Stock Qty</th>
              <th className="px-6 py-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No items found.</td></tr>
            ) : filtered.map((item, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{item.sku}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.name}</div>
                </td>
                <td className="px-6 py-4 text-gray-600">{item.category}</td>
                <td className="px-6 py-4 font-medium text-gray-700">{item.binLocation}</td>
                <td className="px-6 py-4 font-bold text-gray-900">{item.stockQuantity}</td>
                <td className="px-6 py-4 text-right">
                  {item.stockQuantity <= (item.lowStockThreshold || 20) ? (
                    <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold">
                      <AlertTriangle size={12} /> Low Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold">
                      Healthy
                    </span>
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
