import React, { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api.ts';
import { Truck, Package, AlertTriangle, CheckCircle, Search, Settings } from 'lucide-react';

interface Vendor {
  id: number;
  name: string;
  contact: string;
  status: string;
}

interface Shipment {
  id: number;
  vendorId: number;
  vendorName: string;
  batchNumber: string;
  expectedDate: string;
  status: string;
  totalItems: number;
}

interface Product {
  id: number;
  sku: string;
  name: string;
  stockQuantity: number;
  lowStockThreshold: number;
}

interface PurchaseOrder {
  id: number;
  vendorId: number;
  vendorName: string;
  productId: number;
  productName: string;
  quantity: number;
  status: string;
}

export function VendorScreen() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  
  const [activeTab, setActiveTab] = useState<'shipments' | 'reorder' | 'qc'>('shipments');
  
  // QC State
  const [qcShipmentId, setQcShipmentId] = useState('');
  const [qcProductId, setQcProductId] = useState('');
  const [qcSellable, setQcSellable] = useState(0);
  const [qcDamaged, setQcDamaged] = useState(0);
  
  // Threshold state
  const [showThresholdSettings, setShowThresholdSettings] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [newThreshold, setNewThreshold] = useState(20);

  // Add Vendor state
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorContact, setNewVendorContact] = useState('');

  useEffect(() => {
    fetchData();
    window.addEventListener('auto-refresh', fetchData);
  

  return () => window.removeEventListener('auto-refresh', fetchData);
}, []);

  const fetchData = async () => {
    try {
      const [vRes, sRes, pRes, poRes] = await Promise.all([
        fetchApi('/vendors'),
        fetchApi('/shipments'),
        fetchApi('/inventory'),
        fetchApi('/purchase-orders')
      ]);
      setVendors(vRes);
      setShipments(sRes);
      setProducts(pRes);
      setPurchaseOrders(poRes);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorName || !newVendorContact) return;
    try {
      const newVendor = await fetchApi('/vendors', {
        method: 'POST',
        body: JSON.stringify({ name: newVendorName, contact: newVendorContact })
      });
      setVendors([...vendors, newVendor]);
      setShowAddVendor(false);
      setNewVendorName('');
      setNewVendorContact('');
    } catch (err) {
      alert("Failed to add vendor");
    }
  };

  const handleQcSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qcShipmentId || !qcProductId) return;
    try {
      await fetchApi('/shipments/qc', {
        method: 'POST',
        body: JSON.stringify({
          shipmentId: qcShipmentId,
          productId: qcProductId,
          sellableItems: qcSellable,
          damagedItems: qcDamaged
        })
      });
      alert('QC Logged successfully');
      setQcShipmentId('');
      setQcProductId('');
      setQcSellable(0);
      setQcDamaged(0);
      fetchData();
    } catch (err) {
      alert('Failed to log QC');
    }
  };

  const createPO = async (productId: number) => {
    try {
      const vendorId = vendors.length > 0 ? vendors[0].id : 1; // Default to first vendor for demo
      await fetchApi('/purchase-orders', {
        method: 'POST',
        body: JSON.stringify({
          vendorId,
          productId,
          quantity: 100 // Default restock quantity
        })
      });
      alert('Purchase Order Created');
      fetchData();
    } catch (err) {
      alert('Failed to create PO');
    }
  };

  const updateThreshold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;
    try {
      await fetchApi(`/products/${selectedProductId}/threshold`, {
        method: 'PUT',
        body: JSON.stringify({ threshold: newThreshold })
      });
      alert('Threshold updated');
      setShowThresholdSettings(false);
      fetchData();
    } catch (err) {
      alert('Failed to update threshold');
    }
  };

  const lowStockProducts = products.filter(p => p.stockQuantity < (p.lowStockThreshold || 20));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="bg-orange-100 p-2 rounded-lg">
          <Truck className="text-orange-600 h-6 w-6" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">Vendor & Supply Management</h2>
          <p className="text-sm text-gray-500">Track shipments, QC checks, and auto-reorder</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowAddVendor(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Add Vendor
          </button>
          <button 
            onClick={() => setShowThresholdSettings(true)}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </div>

      {showAddVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold text-gray-900">Add New Vendor</h3>
              <button onClick={() => setShowAddVendor(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleAddVendor} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
                <input required type="text" value={newVendorName} onChange={e => setNewVendorName(e.target.value)} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-orange-500" placeholder="e.g. Acme Supplies" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                <input required type="text" value={newVendorContact} onChange={e => setNewVendorContact(e.target.value)} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-orange-500" placeholder="Phone or Email" />
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddVendor(false)} className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700">Add Vendor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {lowStockProducts.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-red-500 h-5 w-5" />
            <h3 className="text-red-800 font-bold">Low Stock Alerts ({lowStockProducts.length})</h3>
          </div>
          <p className="text-red-700 text-sm mt-1">Some products have dropped below their critical threshold. Immediate restock recommended.</p>
        </div>
      )}

      {showThresholdSettings && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-bold mb-4">Set Low-Stock Threshold</h3>
          <form onSubmit={updateThreshold} className="flex gap-4">
            <select
              required
              className="flex-1 border-gray-300 rounded-lg p-2 border"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
            >
              <option value="">Select Product...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} (Current Threshold: {p.lowStockThreshold || 20})</option>
              ))}
            </select>
            <input 
              type="number" required min="1"
              className="w-32 border-gray-300 rounded-lg p-2 border"
              placeholder="Threshold"
              value={newThreshold}
              onChange={(e) => setNewThreshold(Number(e.target.value))}
            />
            <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium">Save</button>
            <button type="button" onClick={() => setShowThresholdSettings(false)} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg">Cancel</button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button 
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'shipments' ? 'bg-orange-50 text-orange-700 border-b-2 border-orange-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('shipments')}
          >
            Incoming Shipments
          </button>
          <button 
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'qc' ? 'bg-orange-50 text-orange-700 border-b-2 border-orange-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('qc')}
          >
            QC & Grading
          </button>
          <button 
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'reorder' ? 'bg-orange-50 text-orange-700 border-b-2 border-orange-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('reorder')}
          >
            Auto-Reorder (POs)
          </button>
        </div>

        <div className="p-0">
          {activeTab === 'shipments' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Vendor</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Batch Number</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Expected Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {shipments.map(s => (
                    <tr key={s.id}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{s.vendorName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.batchNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(s.expectedDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{s.totalItems}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                          s.status === 'Received' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {shipments.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No shipments found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'qc' && (
            <div className="p-6">
              <h3 className="font-bold text-gray-900 mb-4">Log Defect & QC Grading</h3>
              <form onSubmit={handleQcSubmit} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shipment Batch</label>
                  <select required value={qcShipmentId} onChange={e => setQcShipmentId(e.target.value)} className="w-full border-gray-300 border rounded-lg p-2">
                    <option value="">Select Pending Shipment...</option>
                    {shipments.filter(s => s.status === 'Pending').map(s => (
                      <option key={s.id} value={s.id}>{s.batchNumber} ({s.vendorName})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                  <select required value={qcProductId} onChange={e => setQcProductId(e.target.value)} className="w-full border-gray-300 border rounded-lg p-2">
                    <option value="">Select Product...</option>
                    {products.slice(0, 50).map(p => ( // Limit for dropdown
                      <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sellable Items (Passed QC)</label>
                    <input type="number" required min="0" value={qcSellable} onChange={e => setQcSellable(Number(e.target.value))} className="w-full border-gray-300 border rounded-lg p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Damaged Items (Failed QC)</label>
                    <input type="number" required min="0" value={qcDamaged} onChange={e => setQcDamaged(Number(e.target.value))} className="w-full border-gray-300 border rounded-lg p-2" />
                  </div>
                </div>
                <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg">Submit QC & Update Inventory</button>
              </form>
            </div>
          )}

          {activeTab === 'reorder' && (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-2">Fast-Moving / Low Stock SKUs</h3>
                {lowStockProducts.length === 0 ? (
                  <p className="text-sm text-gray-500">All products are adequately stocked.</p>
                ) : (
                  <div className="grid gap-3">
                    {lowStockProducts.map(p => (
                      <div key={p.id} className="flex items-center justify-between bg-gray-50 border border-gray-200 p-3 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{p.name}</p>
                          <p className="text-xs text-gray-500">Stock: <span className="font-bold text-red-600">{p.stockQuantity}</span> (Threshold: {p.lowStockThreshold || 20})</p>
                        </div>
                        <button 
                          onClick={() => createPO(p.id)}
                          className="bg-gray-900 hover:bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg"
                        >
                          Auto-Generate PO
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <h3 className="font-bold text-gray-900 mb-4 border-t pt-6">Purchase Orders History</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">PO Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Vendor</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {purchaseOrders.map(po => (
                      <tr key={po.id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{new Date(po.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{po.vendorName}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{po.productName}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{po.quantity}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">{po.status}</span>
                        </td>
                      </tr>
                    ))}
                    {purchaseOrders.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">No purchase orders found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
