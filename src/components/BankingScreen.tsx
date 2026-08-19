import React, { useEffect, useState } from 'react';
import { fetchApi } from '../lib/api.ts';
import { Landmark, ArrowUpRight, ArrowDownRight, ShieldCheck, RefreshCw, FileText, Download, CheckCircle, ShieldAlert, Lock, Unlock, FileSignature, Check, AlertTriangle, X } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


function DailyLedgerView() {
  const [ledger, setLedger] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [isSignOffOpen, setIsSignOffOpen] = React.useState(false);
  const [managerId, setManagerId] = React.useState('');
  const [remarks, setRemarks] = React.useState('');

  const fetchLedger = async () => {
    try {
      const res = await fetchApi('/v3/finance/daily-ledger');
      setLedger(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchLedger();
  }, []);

  const handleVerify = async () => {
    if (!managerId) {
      alert("Manager ID is required for verification.");
      return;
    }
    
    try {
      const res = await fetchApi('/v3/finance/daily-ledger/verify', {
        method: 'POST',
        body: JSON.stringify({
          date: ledger.date,
          managerId,
          remarks,
          data: ledger
        })
      });
      if (res.success) {
        setLedger({ ...res.verifiedLedger, isVerified: true });
        setIsSignOffOpen(false);
      }
    } catch (e) {
      alert("Verification failed.");
    }
  };

  const handleDownloadPDF = () => {
    if (!ledger) return;
    const doc = new jsPDF();
    doc.text(`Daily Sales, Loss & Financial Audit Report`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${ledger.date}`, 14, 30);
    doc.text(`Gross Sales: INR ${ledger.grossSales.toLocaleString()}`, 14, 40);
    doc.text(`COGS: INR ${ledger.cogs.toLocaleString()}`, 14, 48);
    doc.text(`Overheads: INR ${ledger.overhead.toLocaleString()}`, 14, 56);
    doc.text(`Total Losses: INR ${ledger.totalLossAmount.toLocaleString()}`, 14, 64);
    doc.text(`Net Profit: INR ${ledger.netDailyProfit.toLocaleString()} (${ledger.profitMargin.toFixed(2)}%)`, 14, 72);
    
    if (ledger.isVerified) {
      doc.setTextColor(0, 128, 0);
      doc.text(`VERIFIED by Manager: ${ledger.managerId} at ${new Date(ledger.verifiedAt).toLocaleString()}`, 14, 82);
      doc.setTextColor(0, 0, 0);
    } else {
      doc.setTextColor(255, 0, 0);
      doc.text(`STATUS: PENDING REVIEW`, 14, 82);
      doc.setTextColor(0, 0, 0);
    }
    
    const tableData = ledger.dailyLosses.map((l: any) => [
      l.sku, l.category, `INR ${l.amount.toLocaleString()}`, l.station
    ]);
    
    autoTable(doc, {
      startY: 90,
      head: [['SKU/Order ID', 'Issue Category', 'Loss Amount', 'Terminal/Station']],
      body: tableData,
    });
    
    doc.save(`Financial_Audit_${ledger.date}.pdf`);
  };

  if (loading || !ledger) return <div className="text-center py-12">Loading daily ledger...</div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${ledger.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
             {ledger.isVerified ? <Lock size={24} /> : <Unlock size={24} />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Daily Financial Ledger</h3>
            <p className="text-sm font-semibold text-gray-500">Date: {ledger.date}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold text-sm rounded-lg flex items-center gap-2 hover:bg-gray-50"
          >
            <Download size={16} /> PDF Export
          </button>
          {!ledger.isVerified ? (
            <button 
              onClick={() => setIsSignOffOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white font-bold text-sm rounded-lg flex items-center gap-2 hover:bg-blue-700"
            >
              <FileSignature size={16} /> Review & Sign-Off
            </button>
          ) : (
            <span className="px-4 py-2 bg-green-100 text-green-800 border border-green-200 font-bold text-sm rounded-lg flex items-center gap-2">
              <CheckCircle size={16} /> Verified Sealed
            </span>
          )}
        </div>
      </div>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
         <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
           <span className="text-sm font-semibold text-gray-500">Gross Sales Revenue</span>
           <span className="text-2xl font-black text-gray-900 mt-2">₹{ledger.grossSales.toLocaleString()}</span>
         </div>
         <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
           <span className="text-sm font-semibold text-gray-500">COGS</span>
           <span className="text-2xl font-bold text-orange-600 mt-2">-₹{ledger.cogs.toLocaleString()}</span>
         </div>
         <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
           <span className="text-sm font-semibold text-gray-500">Overhead (Fixed)</span>
           <span className="text-2xl font-bold text-orange-600 mt-2">-₹{ledger.overhead.toLocaleString()}</span>
         </div>
         <div className="bg-white p-5 rounded-2xl border border-red-200 bg-red-50 shadow-sm flex flex-col justify-between">
           <span className="text-sm font-bold text-red-700">Daily Shrink / Losses</span>
           <span className="text-2xl font-bold text-red-700 mt-2">-₹{ledger.totalLossAmount.toLocaleString()}</span>
         </div>
         <div className="bg-white p-5 rounded-2xl border border-green-200 bg-green-50 shadow-sm flex flex-col justify-between">
           <span className="text-sm font-bold text-green-700">Net Daily Profit ({ledger.profitMargin.toFixed(1)}%)</span>
           <span className="text-2xl font-black text-green-700 mt-2">₹{ledger.netDailyProfit.toLocaleString()}</span>
         </div>
      </div>
      
      {/* Issues Breakdown */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
          <AlertTriangle className="text-red-500" size={18} />
          <h3 className="font-bold text-gray-900">Daily Issue & Loss Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
             <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-xs border-b border-gray-200">
               <tr>
                 <th className="px-6 py-3">SKU / Order ID</th>
                 <th className="px-6 py-3">Issue Category</th>
                 <th className="px-6 py-3">Responsible Station</th>
                 <th className="px-6 py-3 text-right">Financial Loss</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
               {ledger.dailyLosses.map((loss: any) => (
                 <tr key={loss.id}>
                   <td className="px-6 py-4 font-mono font-bold text-gray-900">{loss.sku}</td>
                   <td className="px-6 py-4">
                     <span className="px-2 py-1 bg-red-50 text-red-700 text-xs font-bold rounded">{loss.category}</span>
                   </td>
                   <td className="px-6 py-4 font-medium text-gray-600">{loss.station}</td>
                   <td className="px-6 py-4 text-right font-bold text-red-600">-₹{loss.amount.toLocaleString()}</td>
                 </tr>
               ))}
               {ledger.dailyLosses.length === 0 && (
                 <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No losses recorded for today.</td></tr>
               )}
             </tbody>
          </table>
        </div>
      </div>

      {ledger.isVerified && (
        <div className="bg-green-50 border border-green-200 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
             <ShieldCheck size={32} className="text-green-600" />
          </div>
          <h4 className="text-lg font-black text-green-900">VERIFIED & SEALED</h4>
          <p className="text-sm font-semibold text-green-700 mt-1">
            Manager ID: <span className="font-mono">{ledger.managerId}</span> | 
            Verified At: {new Date(ledger.verifiedAt).toLocaleString()}
          </p>
          {ledger.remarks && <p className="text-sm italic text-green-800 mt-2">"{ledger.remarks}"</p>}
        </div>
      )}

      {/* Sign-Off Drawer/Modal */}
      {isSignOffOpen && !ledger.isVerified && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <ShieldAlert className="text-blue-600" size={20} />
                Daily Report Sign-Off
              </h3>
              <button onClick={() => setIsSignOffOpen(false)} className="text-gray-400 hover:text-gray-600">
                 <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm text-yellow-800 font-semibold mb-4">
                Sealing the ledger will lock the financial numbers for {ledger.date}. Ensure all discrepancy checks are completed.
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Financial Manager ID</label>
                <input 
                  type="text" 
                  value={managerId} 
                  onChange={e => setManagerId(e.target.value)} 
                  placeholder="e.g. FIN-MGR-402"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Audit Remarks (Optional)</label>
                <textarea 
                  value={remarks} 
                  onChange={e => setRemarks(e.target.value)} 
                  placeholder="Notes regarding shrinkage or overhead adjustments..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24 resize-none"
                />
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button 
                  onClick={() => setIsSignOffOpen(false)}
                  className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleVerify}
                  disabled={!managerId}
                  className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <Check size={18} /> Approve & Seal Ledger
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function BankingScreen() {

  const [data, setData] = useState<{ balance: number, transactions: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'treasury' | 'ledger'>('treasury');

  const fetchBanking = async () => {
    try {
      const res = await fetchApi('/bank/transactions');
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanking();
    const interval = setInterval(fetchBanking, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Banking & Finance</h2>
          <p className="text-sm text-gray-500 mt-1">Live treasury, payouts, and settlements</p>
        </div>
        <div className="flex items-center bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('treasury')}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'treasury' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Live Treasury
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'ledger' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Daily P&L Ledger
          </button>
        </div>
      </div>
      
      {activeTab === 'treasury' ? (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button 
              onClick={() => { setLoading(true); fetchBanking(); }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Sync Transactions
            </button>
          </div>

          <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm border border-white/10">
                    <Landmark size={24} className="text-blue-100" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold tracking-wide">State Bank of India</h3>
                    <p className="text-blue-200 text-sm font-medium">Primary Escrow Account</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-2">
                  <div>
                    <p className="text-blue-200 text-xs font-semibold tracking-wider uppercase mb-1">Account No.</p>
                    <p className="font-mono text-lg tracking-wider">98357632912</p>
                  </div>
                  <div>
                    <p className="text-blue-200 text-xs font-semibold tracking-wider uppercase mb-1">IFSC Code</p>
                    <p className="font-mono text-lg tracking-wider">SBIN0050713</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-blue-200 text-xs font-semibold tracking-wider uppercase mb-1">Owner Name</p>
                    <p className="font-semibold text-base">MEESHO PVT. LTD.</p>
                  </div>
                </div>
              </div>
              
              <div className="text-left md:text-right w-full md:w-auto p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                <p className="text-blue-200 text-xs font-semibold tracking-wider uppercase mb-1">Available Balance</p>
                <p className="text-3xl font-bold tracking-tight">
                  {loading && !data ? '₹ --,---' : `₹ ${data?.balance?.toLocaleString('en-IN')}`}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-base font-bold text-gray-900">Recent Transactions (Last 10 Min)</h3>
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">Live Updates</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50/50 text-[11px] font-bold tracking-wider text-gray-500 uppercase border-b border-gray-100">
                    <th className="px-6 py-3">Timestamp</th>
                    <th className="px-6 py-3">Counterparty</th>
                    <th className="px-6 py-3">Purpose</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                    <th className="px-6 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {loading && !data ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">Loading ledger...</td></tr>
                  ) : data?.transactions?.map((tx: any) => {
                    const isCredit = tx.type === 'Credit';
                    const timeStr = new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                    
                    return (
                      <tr key={tx.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-3.5 text-gray-500 font-mono text-xs">{timeStr}</td>
                        <td className="px-6 py-3.5 font-semibold text-gray-900">{tx.counterparty}</td>
                        <td className="px-6 py-3.5 text-gray-600 text-xs">{tx.purpose}</td>
                        <td className="px-6 py-3.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                            isCredit ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {isCredit ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right font-bold font-mono">
                          <span className={isCredit ? 'text-green-600' : 'text-gray-900'}>
                            {isCredit ? '+' : '-'} ₹{tx.amount?.toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <span className="text-xs font-semibold text-gray-500">{tx.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-center p-4 bg-green-50 border border-green-100 rounded-xl">
            <div className="flex items-center gap-2 text-green-800">
              <ShieldCheck size={18} className="text-green-600" />
              <span className="text-sm font-semibold tracking-wide">
                All transactions are reviewed and verified after inspection by Insp. Rohit Jangra.
              </span>
            </div>
          </div>
        </div>
      ) : (
        <DailyLedgerView />
      )}
    </div>
  );
}
