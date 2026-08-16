import React, { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api.ts';
import { Boxes, Search, AlertTriangle, CheckCircle2, ShieldAlert, Truck, DollarSign, Download } from 'lucide-react';

interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  stockQuantity: number;
  lowStockThreshold: number;
  price: number | null;
  sourceVehicle: string | null;
  qualityRate: string | null;
}

export function InventoryScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await fetchApi('/inventory');
      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    try {
      setLoading(true);
      await fetchApi('/inventory/seed', { method: 'POST' });
      fetchInventory();
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    window.addEventListener('auto-refresh', fetchInventory);
    return () => window.removeEventListener('auto-refresh', fetchInventory);
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.sourceVehicle && p.sourceVehicle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-3 rounded-xl">
            <Boxes className="text-blue-700 h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Inventory Directory</h2>
            <p className="text-sm text-gray-500">Live view of current warehouse stock and receiving details</p>
          </div>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by Name or Vehicle..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <button 
            onClick={handleSeed}
            disabled={loading}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            Refresh Data
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Stock Count</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Origin Vehicle</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Quality Rating</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Unit Price</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">Loading inventory data...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">No inventory items found.</td>
                </tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 leading-tight">{product.name}</div>
                      {product.category && (
                        <div className="text-xs text-gray-500 mt-1">{product.category}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`text-base font-bold ${product.stockQuantity <= (product.lowStockThreshold || 20) ? 'text-red-600' : 'text-gray-900'}`}>
                          {product.stockQuantity}
                        </span>
                        {product.stockQuantity <= (product.lowStockThreshold || 20) && (
                           <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-200">
                             <AlertTriangle className="w-3.5 h-3.5" />
                             <span className="text-[10px] font-bold uppercase tracking-wider">Low Stock</span>
                           </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.sourceVehicle ? (
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-semibold text-gray-700">
                            {product.sourceVehicle}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Unknown</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex items-center gap-1.5">
                         {product.qualityRate === 'Excellent' ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                         ) : product.qualityRate === 'Needs Inspection' ? (
                            <ShieldAlert className="w-4 h-4 text-orange-500" />
                         ) : (
                            <CheckCircle2 className="w-4 h-4 text-blue-500" />
                         )}
                         <span className={`text-sm font-medium ${
                           product.qualityRate === 'Excellent' ? 'text-green-700' :
                           product.qualityRate === 'Needs Inspection' ? 'text-orange-700' :
                           'text-blue-700'
                         }`}>
                           {product.qualityRate || 'Standard'}
                         </span>
                       </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {product.price != null ? (
                        <span className="text-sm font-bold text-gray-900">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400 italic">N/A</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
