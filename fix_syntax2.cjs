const fs = require('fs');
let code = fs.readFileSync('src/components/BankingScreen.tsx', 'utf8');

const regex = /\{activeTab === 'treasury' \? \(\n        <>\n        <div>\n          <h2 className="text-2xl font-bold text-gray-900">Banking & Finance<\/h2>\n          <p className="text-sm text-gray-500 mt-1">Live treasury, payouts, and settlements<\/p>\n        <\/div>\n        <button \n          onClick=\{\(\) => \{ setLoading\(true\); fetchBanking\(\); \}\}\n          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"\n        >\n          <RefreshCw size=\{16\} className=\{loading \? 'animate-spin' : ''\} \/>\n          Sync Transactions\n        <\/button>\n      <\/div>/;

code = code.replace(regex, `{activeTab === 'treasury' ? (
        <div className="space-y-6">
        <div className="flex justify-end">
          <button 
            onClick={() => { setLoading(true); fetchBanking(); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Sync Transactions
          </button>
        </div>`);
        
code = code.replace(/<\/div>\n        <\/>\n      \) : \(\n        <DailyLedgerView \/>\n      \)/, `</div>
        </div>
      ) : (
        <DailyLedgerView />
      )`);

fs.writeFileSync('src/components/BankingScreen.tsx', code);
