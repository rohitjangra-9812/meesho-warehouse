const fs = require('fs');
let code = fs.readFileSync('src/components/EmployeeScreen.tsx', 'utf8');

// Add Leaderboard sub-tab state and view
const leaderboardCode = `
  const [employeeTab, setEmployeeTab] = useState<'roster' | 'payroll' | 'leaderboard'>('roster');

  const leaderboardStaff = [
    { rank: 1, name: 'Sunita Devi', role: 'Senior Picker', pph: 142, throughput: '1,420 pkgs', accuracy: '99.9%', badge: '👑 Shift MVP & Top Speed' },
    { rank: 2, name: 'Ravi Kumar', role: 'Packer', pph: 128, throughput: '1,280 pkgs', accuracy: '100%', badge: '🎯 Zero Defect Master' },
    { rank: 3, name: 'Amit Singh', role: 'Inbound Specialist', pph: 115, throughput: '1,150 pkgs', accuracy: '99.7%', badge: '⚡ Speed Demon' },
    { rank: 4, name: 'Priya Sharma', role: 'Picker', pph: 108, throughput: '1,080 pkgs', accuracy: '99.5%', badge: '⭐ High Achiever' },
    { rank: 5, name: 'Vikram Singh', role: 'Dock Handler', pph: 95, throughput: '950 pkgs', accuracy: '98.9%', badge: '📦 Reliable Worker' },
  ];
`;

code = code.replace("const [activeTab, setActiveTab] = useState<'roster' | 'approvals'>('roster');", leaderboardCode);

// Update tabs JSX
const tabsOld = `      {/* Tabs */}
      <div className="flex space-x-1 border-b border-gray-200 mt-2 mb-4">
        <button
          onClick={() => setActiveTab('roster')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'roster' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Active Roster
        </button>
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-5 py-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'approvals' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Payslips & Payroll
          {pendingPayrollIds.length > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
              {pendingPayrollIds.length}
            </span>
          )}
        </button>
      </div>`;

const tabsNew = `      {/* Tabs */}
      <div className="flex space-x-1 border-b border-gray-200 mt-2 mb-4">
        <button
          onClick={() => setEmployeeTab('roster')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors ${employeeTab === 'roster' ? 'border-[#f43397] text-[#f43397]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Active Roster
        </button>
        <button
          onClick={() => setEmployeeTab('payroll')}
          className={`px-5 py-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${employeeTab === 'payroll' ? 'border-[#f43397] text-[#f43397]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Payslips & Payroll
          {pendingPayrollIds.length > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
              {pendingPayrollIds.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setEmployeeTab('leaderboard')}
          className={`px-5 py-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${employeeTab === 'leaderboard' ? 'border-[#f43397] text-[#f43397]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          🏆 Productivity Leaderboard & Badges
        </button>
      </div>`;

code = code.replace(tabsOld, tabsNew);

// Wrap main table rendering conditional on employeeTab === 'roster' or 'payroll' versus 'leaderboard'
const rosterTableBlockOld = `      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">`;

const leaderboardRenderBlock = `      {employeeTab === 'leaderboard' ? (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm p-6 space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
             <div>
               <h3 className="text-lg font-bold text-gray-900">Picker & Packer Productivity Leaderboard</h3>
               <p className="text-sm text-gray-500">Real-time shift rankings based on Picks-Per-Hour (PPH) and 0-defect accuracy</p>
             </div>
             <span className="bg-pink-50 text-[#f43397] font-bold px-3 py-1 rounded-full text-xs border border-pink-200">Shift #2 Active</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
             <div className="bg-gradient-to-br from-pink-500 to-rose-600 text-white p-6 rounded-2xl shadow-md flex items-center justify-between">
                <div>
                   <p className="text-xs font-bold uppercase tracking-widest text-pink-100">Top Speed Picker</p>
                   <h4 className="text-2xl font-black mt-1">Sunita Devi</h4>
                   <p className="text-sm text-pink-200 mt-0.5">142 Picks / Hour</p>
                </div>
                <div className="text-3xl">👑</div>
             </div>
             <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-md flex items-center justify-between">
                <div>
                   <p className="text-xs font-bold uppercase tracking-widest text-blue-100">Zero Defect Master</p>
                   <h4 className="text-2xl font-black mt-1">Ravi Kumar</h4>
                   <p className="text-sm text-blue-200 mt-0.5">100% Accuracy</p>
                </div>
                <div className="text-3xl">🎯</div>
             </div>
             <div className="bg-gradient-to-br from-purple-600 to-violet-700 text-white p-6 rounded-2xl shadow-md flex items-center justify-between">
                <div>
                   <p className="text-xs font-bold uppercase tracking-widest text-purple-100">Team PPH Average</p>
                   <h4 className="text-2xl font-black mt-1">118.4 PPH</h4>
                   <p className="text-sm text-purple-200 mt-0.5">+14% vs Yesterday</p>
                </div>
                <div className="text-3xl">🚀</div>
             </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">Staff Member</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Picks Per Hour (PPH)</th>
                  <th className="px-6 py-4">Throughput</th>
                  <th className="px-6 py-4">Accuracy</th>
                  <th className="px-6 py-4">Badge / Reward</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {leaderboardStaff.map(staff => (
                  <tr key={staff.rank} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-black text-gray-900">
                      #{staff.rank}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">{staff.name}</td>
                    <td className="px-6 py-4 text-gray-600">{staff.role}</td>
                    <td className="px-6 py-4 font-mono font-bold text-pink-600">{staff.pph} PPH</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{staff.throughput}</td>
                    <td className="px-6 py-4 font-mono font-bold text-green-600">{staff.accuracy}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-3 py-1 bg-pink-50 text-[#f43397] font-bold rounded-full text-xs border border-pink-200">
                        {staff.badge}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">`;

code = code.replace(rosterTableBlockOld, leaderboardRenderBlock);

// Close the conditional wrapper at the bottom of EmployeeScreen
code = code.replace(
  /<\/div>\s*<\/div>\s*\}\);\s*$/,
  "</div>\n      )}\n    </div>\n  );\n}"
);

fs.writeFileSync('src/components/EmployeeScreen.tsx', code);
