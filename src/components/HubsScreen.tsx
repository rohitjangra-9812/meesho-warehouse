import React, { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api.ts';
import { MapPin, ArrowRightLeft, Search, CheckCircle, Package, Truck, Printer } from 'lucide-react';

interface Hub {
  id: number;
  name: string;
  location: string;
  type: string;
}

interface Product {
  id: number;
  name: string;
  sku: string;
}

interface Transfer {
  id: number;
  fromHubId: number;
  toHubId: number;
  fromHubName: string;
  toHubName: string;
  productId: number;
  productName: string;
  quantity: number;
  status: string;
  waybill: string;
  dispatchDate: string;
  createdAt: string;
}

export function HubsScreen() {
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [activeTab, setActiveTab] = useState<'transfers' | 'manifests' | 'hubs'>('transfers');

  const [tFrom, setTFrom] = useState('');
  const [tTo, setTTo] = useState('');
  const [tProduct, setTProduct] = useState('');
  const [tQty, setTQty] = useState('');
  const [tWaybill, setTWaybill] = useState('');

  const [hName, setHName] = useState('');
  const [hLoc, setHLoc] = useState('');
  const [hType, setHType] = useState('Satellite');

  useEffect(() => {
    fetchData();
    window.addEventListener('auto-refresh', fetchData);
  return () => window.removeEventListener('auto-refresh', fetchData);
}, []);

  const fetchData = async () => {
    try {
      const [hRes, pRes, tRes] = await Promise.all([
        fetchApi('/hubs'),
        fetchApi('/inventory'),
        fetchApi('/hub-transfers')
      ]);
      setHubs(hRes);
      setProducts(pRes);
      setTransfers(tRes);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddHub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hName || !hLoc) return;
    try {
      await fetchApi('/hubs', {
        method: 'POST',
        body: JSON.stringify({ name: hName, location: hLoc, type: hType })
      });
      alert('Hub added successfully');
      setHName('');
      setHLoc('');
      fetchData();
    } catch (err) {
      alert('Failed to add hub');
    }
  };

  const handleAddTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tFrom || !tTo || !tProduct || !tQty || !tWaybill) return;
    if (tFrom === tTo) {
      alert('Source and destination hubs must be different');
      return;
    }
    try {
      await fetchApi('/hub-transfers', {
        method: 'POST',
        body: JSON.stringify({
          fromHubId: tFrom,
          toHubId: tTo,
          productId: tProduct,
          quantity: tQty,
          waybill: tWaybill
        })
      });
      alert('Transfer initiated');
      setTFrom('');
      setTTo('');
      setTProduct('');
      setTQty('');
      setTWaybill('');
      fetchData();
    } catch (err) {
      alert('Failed to create transfer');
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await fetchApi(`/hub-transfers/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      fetchData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const generateManifest = (t: Transfer) => {
    alert(`Generated Waybill PDF for ${t.waybill}. \nFrom: ${t.fromHubName} \nTo: ${t.toHubName} \nProduct: ${t.productName} \nQty: ${t.quantity}`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="bg-indigo-100 p-2 rounded-lg">
          <MapPin className="text-indigo-600 h-6 w-6" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">Multi-Warehouse & Transfers</h2>
          <p className="text-sm text-gray-500">Manage hub-to-hub stock movements and generate transfer manifests</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button 
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'transfers' ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('transfers')}
          >
            Initiate Transfer
          </button>
          <button 
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'manifests' ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('manifests')}
          >
            Transfer Manifests
          </button>
          <button 
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'hubs' ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('hubs')}
          >
            Manage Hubs
          </button>
        </div>

        <div className="p-0">
          {activeTab === 'transfers' && (
            <div className="p-6 max-w-2xl">
              <h3 className="font-bold text-gray-900 mb-4">Create Hub-to-Hub Transfer</h3>
              <form onSubmit={handleAddTransfer} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Source Hub</label>
                    <select required value={tFrom} onChange={e => setTFrom(e.target.value)} className="w-full border-gray-300 border rounded-lg p-2">
                      <option value="">Select Hub...</option>
                      {hubs.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Destination Hub</label>
                    <select required value={tTo} onChange={e => setTTo(e.target.value)} className="w-full border-gray-300 border rounded-lg p-2">
                      <option value="">Select Hub...</option>
                      {hubs.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                  <select required value={tProduct} onChange={e => setTProduct(e.target.value)} className="w-full border-gray-300 border rounded-lg p-2">
                    <option value="">Select Product...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input type="number" required min="1" value={tQty} onChange={e => setTQty(e.target.value)} className="w-full border-gray-300 border rounded-lg p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Waybill Number</label>
                    <input type="text" required placeholder="WB-XXXXXXXX" value={tWaybill} onChange={e => setTWaybill(e.target.value)} className="w-full border-gray-300 border rounded-lg p-2" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg mt-2">Create Transfer</button>
              </form>
            </div>
          )}

          {activeTab === 'manifests' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Waybill</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Route</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product Details</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transfers.map(t => (
                    <tr key={t.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-indigo-600">{t.waybill}</span>
                        <div className="text-xs text-gray-500">{new Date(t.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <span>{t.fromHubName}</span>
                          <ArrowRightLeft className="w-3 h-3 text-gray-400" />
                          <span>{t.toHubName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {t.productName} <span className="font-bold">x{t.quantity}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select 
                          className={`text-xs font-medium px-2 py-1 rounded-full border outline-none ${
                            t.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                            t.status === 'In Transit' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}
                          value={t.status}
                          onChange={(e) => updateStatus(t.id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Transit">In Transit</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button 
                          onClick={() => generateManifest(t)}
                          className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800"
                        >
                          <Printer className="w-4 h-4" /> Print
                        </button>
                      </td>
                    </tr>
                  ))}
                  {transfers.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No transfers recorded.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'hubs' && (
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
              <div className="p-6 md:col-span-1">
                <h3 className="font-bold text-gray-900 mb-4">Add New Hub</h3>
                <form onSubmit={handleAddHub} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hub Name</label>
                    <input type="text" required value={hName} onChange={e => setHName(e.target.value)} className="w-full border-gray-300 border rounded-lg p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location / District</label>
                    <input type="text" required value={hLoc} onChange={e => setHLoc(e.target.value)} className="w-full border-gray-300 border rounded-lg p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hub Type</label>
                    <select required value={hType} onChange={e => setHType(e.target.value)} className="w-full border-gray-300 border rounded-lg p-2">
                      <option value="Main Facility">Main Facility</option>
                      <option value="Satellite">Satellite</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg">Add Hub</button>
                </form>
              </div>
              <div className="p-6 md:col-span-2">
                <h3 className="font-bold text-gray-900 mb-4">Active Hubs</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {hubs.map(h => (
                    <div key={h.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          {h.name}
                        </h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${h.type === 'Main Facility' ? 'bg-purple-100 text-purple-800' : 'bg-gray-200 text-gray-800'}`}>
                          {h.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 ml-6">{h.location}</p>
                    </div>
                  ))}
                  {hubs.length === 0 && (
                    <p className="text-sm text-gray-500 col-span-2">No hubs configured.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
