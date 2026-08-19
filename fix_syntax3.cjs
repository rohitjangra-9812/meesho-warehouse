const fs = require('fs');
let code = fs.readFileSync('src/components/BankingScreen.tsx', 'utf8');

// Just restore the BankingScreen.tsx code by directly recreating the export function

const fresh = `  const [activeTab, setActiveTab] = useState<'treasury' | 'ledger'>('treasury');

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
`;

code = code.replace(/const \[activeTab, setActiveTab\] = useState\w*\('treasury' \| 'ledger'\)\('treasury'\);\s*return \([\s\S]*?Sync Transactions\s*<\/button>\s*<\/div>\s*<\/div>/, fresh);


fs.writeFileSync('src/components/BankingScreen.tsx', code);
