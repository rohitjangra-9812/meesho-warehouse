const fs = require('fs');
let code = fs.readFileSync('src/components/BankingScreen.tsx', 'utf8');

// Completely rewrite BankingScreen.tsx export to fix all dangling tags.

const fullReplacement = `export function BankingScreen() {
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
            className={\`px-4 py-2 text-sm font-bold rounded-md transition-colors \${activeTab === 'treasury' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}\`}
          >
            Live Treasury
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={\`px-4 py-2 text-sm font-bold rounded-md transition-colors \${activeTab === 'ledger' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}\`}
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
                  {loading && !data ? '₹ --,---' : \`₹ \${data?.balance?.toLocaleString('en-IN')}\`}
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
                          <span className={\`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide \${
                            isCredit ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }\`}>
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
`

code = code.replace(/export function BankingScreen\(\) \{[\s\S]*$/, fullReplacement);

fs.writeFileSync('src/components/BankingScreen.tsx', code);
