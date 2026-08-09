import React, { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api.ts';
import { Landmark, IndianRupee, ArrowDownRight, ArrowUpRight, Clock, RefreshCw } from 'lucide-react';

interface Account {
  id: number;
  accountName: string;
  bankName: string;
  branch: string;
  balance: number;
  updatedAt: string;
}

interface Transaction {
  id: number;
  accountId: number;
  type: string;
  amount: number;
  category: string;
  description: string;
  createdAt: string;
}

export function TreasuryScreen() {
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadData = async () => {
    try {
      const res = await fetchApi('/treasury');
      setAccount(res.account);
      setTransactions(res.transactions);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('auto-refresh', handleAutoSync);
    return () => window.removeEventListener('auto-refresh', handleAutoSync);
  }, []);

  const handleAutoSync = async () => {
    try {
      await fetchApi('/treasury/sync', { method: 'POST' });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await handleAutoSync();
    setTimeout(() => setIsSyncing(false), 500);
  };

  if (!account) return <div className="p-8 text-center text-gray-500">Loading Treasury...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-100 p-3 rounded-xl">
            <Landmark className="text-emerald-700 h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Bank Account & Treasury</h2>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Auto-syncs every 30 minutes
            </p>
          </div>
        </div>
        <button 
          onClick={handleManualSync}
          disabled={isSyncing}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          Force Sync
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-lg p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Landmark className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-gray-400 font-medium mb-1 uppercase tracking-wider text-sm">Account Name</p>
                <h3 className="text-xl font-bold">{account.accountName}</h3>
              </div>
              <div className="text-right">
                <p className="text-gray-400 font-medium mb-1 uppercase tracking-wider text-sm">Bank & Branch</p>
                <h3 className="font-medium text-gray-200">{account.bankName}</h3>
                <p className="text-sm text-gray-400">{account.branch}</p>
              </div>
            </div>
            
            <div>
              <p className="text-gray-400 font-medium mb-2 uppercase tracking-wider text-sm">Available Balance</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl text-gray-400">₹</span>
                <span className="text-5xl font-black tracking-tight">
                  {account.balance.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-2 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Last updated: {new Date(account.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-center">
          <h4 className="font-bold text-gray-900 mb-4">Treasury Analytics</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <ArrowDownRight className="w-5 h-5 text-red-600" />
                </div>
                <span className="font-medium text-gray-700">Total Outflow</span>
              </div>
              <span className="font-bold text-gray-900">
                ₹{transactions.filter(t => t.type === 'Debit').reduce((sum, t) => sum + t.amount, 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <ArrowUpRight className="w-5 h-5 text-green-600" />
                </div>
                <span className="font-medium text-gray-700">Total Inflow</span>
              </div>
              <span className="font-bold text-gray-900">
                ₹{transactions.filter(t => t.type === 'Credit').reduce((sum, t) => sum + t.amount, 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-900">Transaction Ledger</h3>
          <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border">Showing {transactions.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(tx.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    {tx.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full font-medium">
                      {tx.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-mono">
                    <span className={`font-bold flex items-center justify-end gap-1 ${tx.type === 'Debit' ? 'text-red-600' : 'text-green-600'}`}>
                      {tx.type === 'Debit' ? '-' : '+'}
                      <IndianRupee className="w-3 h-3" />
                      {tx.amount.toLocaleString('en-IN')}
                    </span>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <IndianRupee className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    No transactions recorded yet.
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
