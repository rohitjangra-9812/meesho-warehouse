import React, { useEffect, useState } from 'react';
import { fetchApi } from '../lib/api.ts';
import { Truck, Building2, Package, Stamp, Plus, ArrowRight, ShieldCheck, RefreshCw, CheckCircle2 } from 'lucide-react';

export function InterHubTransferSection() {
  const [hubInventory, setHubInventory] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    destHub: 'Bengaluru FC (KA)',
    sku: 'SKU-ELECT-092',
    qty: 500
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [invRes, trRes] = await Promise.all([
        fetchApi('/hubs/inventory'),
        fetchApi('/hubs/transfers')
      ]);
      setHubInventory(invRes);
      setTransfers(trRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSTO = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/hubs/transfers', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setIsModalOpen(false);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await fetchApi(`/hubs/transfers/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status })
      });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Building2 className="text-blue-600" /> Inter-Hub Stock Transfer Orders (STO) & Multi-Facility Visibility
          </h3>
          <p className="text-xs text-gray-500 mt-1">Real-time stock balances across Meesho fulfillment centers and tamper-evident dispatch manifests</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm transition-colors"
        >
          <Plus size={16} /> Create New Inter-Hub STO
        </button>
      </div>

      {/* Cross-Warehouse Inventory Visibility Grid */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Cross-Warehouse Real-Time Stock Balances</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {hubInventory.map((hub, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                  {hub.status}
                </span>
                <h5 className="font-bold text-gray-900 mt-2 text-sm">{hub.hubName}</h5>
                <p className="text-xs text-gray-400 mt-0.5">{hub.location}</p>
              </div>
              <div className="space-y-1 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Active SKUs:</span>
                  <span className="font-mono font-bold text-gray-800">{hub.totalSkuCount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Total Stock:</span>
                  <span className="font-mono font-black text-blue-600">{hub.totalStock.toLocaleString('en-IN')} units</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transfer Orders List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Active & In-Transit Transfer Orders (Manifests)</h4>
          <span className="text-xs text-gray-500 font-semibold">{transfers.length} total STO records</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase border-b border-gray-200">
                <th className="px-6 py-4">STO Reference</th>
                <th className="px-6 py-4">Route (Source → Destination)</th>
                <th className="px-6 py-4">SKU & Quantity</th>
                <th className="px-6 py-4">Security Seal No.</th>
                <th className="px-6 py-4">Transfer Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">Loading transfers...</td></tr>
              ) : transfers.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">No transfer orders found.</td></tr>
              ) : transfers.map((tr: any) => (
                <tr key={tr.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-gray-900">{tr.stoId}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-800">
                      <span>{tr.sourceHub}</span>
                      <ArrowRight size={14} className="text-gray-400" />
                      <span className="text-blue-600">{tr.destHub}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{tr.qty?.toLocaleString('en-IN')} units</div>
                    <div className="text-xs text-gray-500 font-mono mt-0.5">{tr.sku}</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg w-max">
                    {tr.sealNo}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${
                      tr.status === 'In Transit' ? 'bg-blue-100 text-blue-700' :
                      tr.status === 'Customs Verified' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {tr.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {tr.status !== 'Delivered' && (
                      <button
                        onClick={() => updateStatus(tr.id, 'Delivered')}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        Mark Delivered
                      </button>
                    )}
                    <button
                      onClick={() => alert(`🖨️ Printing tamper-evident security manifest for ${tr.stoId} with Seal ${tr.sealNo}`)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-colors"
                    >
                      Manifest PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create STO Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h4 className="font-bold text-gray-900">Initiate Inter-Hub Stock Transfer Order (STO)</h4>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleCreateSTO} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Destination Fulfillment Center</label>
                <select
                  value={formData.destHub}
                  onChange={e => setFormData({...formData, destHub: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option>Bengaluru FC (KA)</option>
                  <option>Bhiwandi FC (MH)</option>
                  <option>Kolkata Hub (WB)</option>
                  <option>Hyderabad FC (TS)</option>
                  <option>Delhi NCR Hub (Main)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">SKU / Item Code</label>
                <input
                  required
                  type="text"
                  value={formData.sku}
                  onChange={e => setFormData({...formData, sku: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  placeholder="e.g. SKU-ELECT-092"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Transfer Quantity (Units)</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={formData.qty}
                  onChange={e => setFormData({...formData, qty: Number(e.target.value)})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                />
              </div>
              <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl text-xs text-blue-800 flex items-center gap-2">
                <ShieldCheck size={16} className="text-blue-600 shrink-0" />
                <span>Creating this STO will automatically generate a tamper-evident cryptographic security seal number and dispatch manifest.</span>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
                >
                  Generate STO & Seal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
