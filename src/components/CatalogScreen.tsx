import React, { useEffect, useState } from 'react';
import { fetchApi } from '../lib/api.ts';
import { BookOpen, Info, Plus, Search, Trash2, X, FileText, ChevronLeft, ChevronRight, Stamp, CheckCircle2, Truck } from 'lucide-react';
import { InterHubTransferSection } from './InterHubTransferSection';

export function CatalogScreen() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'sto'>('catalog');
  const [catalog, setCatalog] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewAgreement, setViewAgreement] = useState<any | null>(null);
  
  const [formData, setFormData] = useState({
    itemName: '', quantity: 100, origin: 'Delhi NCR',
    sellerName: '', businessName: '', location: 'Delhi NCR',
    gstin: '', phone: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetchApi(`/catalog?page=${page}&limit=20&search=${encodeURIComponent(search)}`);
      setCatalog(res.data);
      setTotalItems(res.total);
      setTotalPages(res.totalPages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search]);

  const handleDelete = async (id: number) => {
    if(confirm('Are you sure you want to decommission this item and terminate the seller agreement?')) {
      await fetchApi(`/catalog/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchApi('/catalog', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
    setIsModalOpen(false);
    setPage(1);
    fetchData();
  };

  const openNew = () => {
    setFormData({
      itemName: '', quantity: 100, origin: 'Delhi NCR',
      sellerName: '', businessName: '', location: 'Delhi NCR',
      gstin: '', phone: ''
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 relative">
      {/* Audit Banner */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center gap-3">
        <Info className="text-blue-600 w-5 h-5 shrink-0" />
        <p className="text-sm font-medium text-blue-800">
          System scheduled update: Inventory roster & seller contract sync updates automatically every 5 days.
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Master Catalog & Inter-Hub WMS</h2>
          <p className="text-sm text-gray-500 mt-1">Manage items across all categories, seller agreements, and inter-facility stock transfers</p>
        </div>
        {activeTab === 'catalog' && (
          <button 
            onClick={openNew}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={16} /> Onboard New Item & Seller
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 px-6 py-3 font-bold text-sm border-b-2 transition-colors ${
            activeTab === 'catalog'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <BookOpen size={18} /> Master Catalog & Vendors
        </button>
        <button
          onClick={() => setActiveTab('sto')}
          className={`flex items-center gap-2 px-6 py-3 font-bold text-sm border-b-2 transition-colors ${
            activeTab === 'sto'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Truck size={18} /> Inter-Hub Transfers (STO)
        </button>
      </div>

      {activeTab === 'sto' ? (
        <InterHubTransferSection />
      ) : (
        <>
          {/* Table Controls */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between bg-gray-50/50 gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search SKU, Item, Seller or GSTIN..." 
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-500">
              Showing page {page} of {totalPages} ({totalItems.toLocaleString('en-IN')} total items)
            </span>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded text-gray-500 hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded text-gray-500 hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-gray-50 text-xs font-semibold tracking-wide text-gray-500 uppercase border-b border-gray-200">
                <th className="px-6 py-4">Item & SKU</th>
                <th className="px-6 py-4">Stock & Origin</th>
                <th className="px-6 py-4">Seller Details</th>
                <th className="px-6 py-4">Status & Schedule</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">Loading catalog...</td></tr>
              ) : catalog.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No items found matching your search.</td></tr>
              ) : catalog.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{item.itemName}</div>
                    <div className="text-xs text-gray-500 mt-1 font-mono">{item.sku}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900 font-bold">{item.quantity?.toLocaleString('en-IN')} units</div>
                    <div className="text-xs text-gray-500 mt-1">From: {item.origin}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900 font-semibold">{item.businessName}</div>
                    <div className="text-xs text-gray-600 mt-0.5">{item.sellerName} • {item.location}</div>
                    <div className="text-xs text-gray-500 mt-0.5 font-mono">GSTIN: {item.gstin}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 rounded text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-wide">
                      {item.status}
                    </span>
                    <div className="text-xs text-blue-600 mt-1.5 font-medium">{item.schedule}</div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button 
                      onClick={() => setViewAgreement(item)} 
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded font-semibold text-xs transition-colors border border-blue-100"
                    >
                      <FileText size={14} /> View Agreement
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)} 
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors inline-block align-middle"
                      title="Decommission Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* Add New Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
              <h3 className="text-lg font-bold text-gray-900">Onboard New Item & Seller</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Item Name</label>
                  <input required type="text" value={formData.itemName} onChange={e => setFormData({...formData, itemName: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Initial Quantity</label>
                  <input required type="number" min="1" value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="col-span-1 md:col-span-2 border-t border-gray-200 pt-4 mt-2">
                  <h4 className="text-sm font-bold text-gray-900 mb-4">Seller Credentials (generates agreement)</h4>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Business / Enterprise Name</label>
                  <input required type="text" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Authorized Person Name</label>
                  <input required type="text" value={formData.sellerName} onChange={e => setFormData({...formData, sellerName: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Seller GSTIN</label>
                  <input required type="text" value={formData.gstin} onChange={e => setFormData({...formData, gstin: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none uppercase" placeholder="e.g. 27ABCDE1234F1Z5" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Hub Location / State</label>
                  <select value={formData.location} onChange={e => setFormData({...formData, location: e.target.value, origin: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                    {['Delhi NCR', 'Maharashtra', 'Gujarat', 'Tamil Nadu', 'West Bengal', 'Rajasthan', 'Karnataka', 'UP', 'Haryana', 'Punjab'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-200 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2">
                  Generate Agreement & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Agreement Modal (PDF Style) */}
      {viewAgreement && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto font-serif">
            {/* Action Bar */}
            <div className="bg-gray-100 border-b border-gray-300 px-6 py-3 flex items-center justify-between sticky top-0 z-10 font-sans">
              <span className="text-sm font-bold text-gray-600 flex items-center gap-2">
                <FileText size={16} /> Official Contract Document
              </span>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="px-4 py-1.5 bg-white border border-gray-300 rounded text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  Print PDF
                </button>
                <button onClick={() => setViewAgreement(null)} className="px-4 py-1.5 bg-gray-800 text-white rounded text-sm font-semibold hover:bg-gray-900">
                  Close
                </button>
              </div>
            </div>

            {/* Document Body */}
            <div className="p-8 md:p-12 text-gray-800 space-y-8">
              {/* Header */}
              <div className="text-center border-b-2 border-gray-800 pb-6">
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-gray-900">Meesho Logistics</h1>
                <h2 className="text-xl md:text-2xl font-bold mt-2">Warehouse & Seller Inward Agreement</h2>
                <p className="text-sm text-gray-600 mt-2 font-mono">Contract Ref: M-${viewAgreement.sku}-${Date.now().toString().slice(-6)}</p>
              </div>

              {/* Duration & Parties */}
              <div className="space-y-4 text-justify leading-relaxed">
                <p>
                  This Warehouse & Seller Inward Agreement ("Agreement") is entered into on <strong>{viewAgreement.agreementDate || new Date().toISOString().split('T')[0]}</strong>, by and between:
                </p>
                <div className="grid md:grid-cols-2 gap-6 bg-gray-50 p-6 border border-gray-200">
                  <div>
                    <h3 className="font-bold uppercase text-sm mb-2 text-gray-900 border-b border-gray-300 pb-1">Entity 1: The Warehouse</h3>
                    <p className="font-semibold">Meesho Logistics Pvt. Ltd.</p>
                    <p className="text-sm">Central Inward & Fulfillment Hub</p>
                    <p className="text-sm">Authorized Inspector: Insp. Rohit Jangra</p>
                  </div>
                  <div>
                    <h3 className="font-bold uppercase text-sm mb-2 text-gray-900 border-b border-gray-300 pb-1">Entity 2: The Seller</h3>
                    <p className="font-semibold">{viewAgreement.businessName}</p>
                    <p className="text-sm">Authorized Person: {viewAgreement.sellerName}</p>
                    <p className="text-sm">GSTIN: {viewAgreement.gstin}</p>
                    <p className="text-sm">Registered Location: {viewAgreement.location}</p>
                  </div>
                </div>
              </div>

              {/* Deal Terms */}
              <div className="space-y-4 leading-relaxed">
                <h3 className="text-lg font-bold uppercase tracking-wide border-b border-gray-300 pb-1">1. Scope of Agreement & Deal Terms</h3>
                <p>
                  The Seller agrees to supply and the Warehouse agrees to store and process the item listed as <strong>{viewAgreement.itemName}</strong> (SKU: {viewAgreement.sku}). The initial logged inbound quantity is documented at <strong>{viewAgreement.quantity?.toLocaleString('en-IN')} units</strong> originating from <strong>{viewAgreement.origin}</strong>.
                </p>
                
                <h3 className="text-lg font-bold uppercase tracking-wide border-b border-gray-300 pb-1 mt-6">2. Dispatch & Schedule Cycle</h3>
                <p>
                  Both parties formally acknowledge that this SKU falls under the <strong>5-Day Mandatory Transfer Schedule</strong>. The Warehouse shall initiate outward dispatch schedules, RTO processing, and seller payout cycles strictly every 5 business days from the date of inventory scanning.
                </p>

                <h3 className="text-lg font-bold uppercase tracking-wide border-b border-gray-300 pb-1 mt-6">3. Legal Liability & Quality Compliance</h3>
                <p>
                  The Seller assumes full legal liability for product authenticity, packaging standards, and GST compliance as per Indian government regulations. The Warehouse reserves the right to reject inward shipments failing the standard Quality Check (QC) protocols overseen by the Warehouse Inspector.
                </p>
              </div>

              {/* Signatures */}
              <div className="mt-12 pt-12 border-t-2 border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="text-center">
                  <div className="h-24 flex items-center justify-center flex-col relative">
                    <Stamp size={64} className="text-blue-900/20 absolute -rotate-12" />
                    <span className="font-signature text-3xl text-blue-900 relative z-10 block -rotate-3">Rohit Jangra</span>
                  </div>
                  <div className="border-t border-gray-400 mt-2 pt-2">
                    <p className="font-bold text-gray-900">Insp. Rohit Jangra</p>
                    <p className="text-xs text-gray-600 uppercase">Authorized Warehouse Inspector</p>
                    <p className="text-xs text-gray-500 font-mono mt-1">Meesho Logistics</p>
                  </div>
                </div>

                <div className="text-center">
                  <div className="h-24 flex items-center justify-center">
                    <span className="font-signature text-3xl text-gray-800 block -rotate-2">{viewAgreement.sellerName}</span>
                  </div>
                  <div className="border-t border-gray-400 mt-2 pt-2">
                    <p className="font-bold text-gray-900">{viewAgreement.businessName}</p>
                    <p className="text-xs text-gray-600 uppercase">Seller Counter-Signature</p>
                    <p className="text-xs text-gray-500 font-mono mt-1">Timestamp: {new Date().toISOString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Footer */}
            <div className="bg-green-50 border-t border-green-200 p-4 flex items-center justify-center gap-2 text-green-800 font-sans">
              <CheckCircle2 size={20} className="text-green-600" />
              <span className="font-bold tracking-wide uppercase text-sm">Verified & Inspected Contract — Active Status</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
