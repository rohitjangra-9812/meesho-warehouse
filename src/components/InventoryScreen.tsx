import React, { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api.ts';
import { Boxes, Plus } from 'lucide-react';

interface Product {
  id: number;
  sku: string;
  name: string;
  stockQuantity: number;
  binLocation: string;
}

export function InventoryScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Add new item state
  const [newSku, setNewSku] = useState('');
  const [newName, setNewName] = useState('');
  const [newStock, setNewStock] = useState('0');
  const [newBin, setNewBin] = useState('');

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await fetchApi('/inventory');
      setProducts(data);
    } catch (err) {
      console.error('Failed to load inventory', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/inventory', {
        method: 'POST',
        body: JSON.stringify({
          sku: newSku,
          name: newName,
          stockQuantity: Number(newStock),
          binLocation: newBin
        })
      });
      setIsAdding(false);
      setNewSku('');
      setNewName('');
      setNewStock('0');
      setNewBin('');
      fetchInventory();
    } catch (err) {
      alert("Failed to add product");
    }
  };

  const handleSeed = async () => {
    try {
      setLoading(true);
      await fetchApi('/inventory/seed', { method: 'POST' });
      await fetchInventory();
      alert("Successfully seeded 10,000 products!");
    } catch (err) {
      alert("Failed to seed inventory");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Boxes className="text-blue-600 h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Inventory Status</h2>
            <p className="text-sm text-gray-500">Showing top 100 products</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleSeed}
            disabled={loading}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            Seed 10k Items
          </button>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Add Product
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Product</h3>
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
              <input required type="text" value={newSku} onChange={e => setNewSku(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input required type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Initial Stock</label>
              <input required type="number" min="0" value={newStock} onChange={e => setNewStock(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bin Location</label>
              <input required type="text" value={newBin} onChange={e => setNewBin(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm" />
            </div>
            <div className="md:col-span-4 flex justify-end gap-2 mt-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-black rounded-lg">Save Product</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock Level</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bin Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-900">{product.sku}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.stockQuantity > 20 ? 'bg-green-100 text-green-800' :
                        product.stockQuantity > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stockQuantity} in stock
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${
                        product.stockQuantity > 20 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {product.stockQuantity > 20 ? 'Optimal' : 'Low'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {product.binLocation}
                  </td>
                </tr>
              ))}
              {products.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No inventory records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
