const fs = require('fs');
let code = fs.readFileSync('src/components/EmployeeScreen.tsx', 'utf8');

// Icons
if (!code.includes('ClipboardCheck')) {
  code = code.replace("import { Settings, Users,", "import { Settings, Users, ClipboardCheck, AlertCircle,");
}

// Add state
if (!code.includes('activeTab')) {
  const newStates = `const [activeTab, setActiveTab] = useState<'roster' | 'approvals'>('roster');
  const [pendingPayrollIds, setPendingPayrollIds] = useState<number[]>([]);`;
  code = code.replace("const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);", newStates + "\n  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);");
  
  // Populate pending list automatically after fetching
  const fetchReplace = `setEmployees(empRes);
      setStats(statsRes);
      if (empRes.length > 0 && pendingPayrollIds.length === 0) {
        setPendingPayrollIds(empRes.slice(2, 5).map((e: any) => e.id));
      }`;
  code = code.replace("setEmployees(empRes);\n      setStats(statsRes);", fetchReplace);
}

// Add Tabs after the header section
const headerEnd = `        </button>
        </div>
      </div>`;
const tabsHtml = `
      {/* Tabs */}
      <div className="flex space-x-1 border-b border-gray-200 mt-2 mb-4">
        <button
          onClick={() => setActiveTab('roster')}
          className={\`px-5 py-3 text-sm font-bold border-b-2 transition-colors \${activeTab === 'roster' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}\`}
        >
          Active Roster
        </button>
        <button
          onClick={() => setActiveTab('approvals')}
          className={\`px-5 py-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors \${activeTab === 'approvals' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}\`}
        >
          HR Pending Approval
          {pendingPayrollIds.length > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
              {pendingPayrollIds.length}
            </span>
          )}
        </button>
      </div>`;

if (!code.includes('{/* Tabs */}')) {
  code = code.replace(headerEnd, headerEnd + tabsHtml);
}

// Handle what gets rendered depending on the tab
// Currently it renders filteredEmployees. We can adjust filteredEmployees based on the active tab!
const filterLogicRegex = /const filteredEmployees = employees\.filter\(e => \{[\s\S]*?return matchSearch && matchDept;\s*\}\);/m;
const newFilterLogic = `const filteredEmployees = employees.filter(e => {
    // If we're on the approvals tab, ONLY show employees whose ID is in pendingPayrollIds
    if (activeTab === 'approvals') {
      if (!pendingPayrollIds.includes(e.id)) return false;
    }
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.empId.toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept === 'All' || e.department === filterDept;
    return matchSearch && matchDept;
  });`;
code = code.replace(filterLogicRegex, newFilterLogic);

// Modify the Action Buttons in the table. If activeTab === 'approvals', show an "Approve" button
const tableRowRegex = /<td className="px-6 py-4 text-right space-x-2">([\s\S]*?)<\/td>/g;
code = code.replace(tableRowRegex, (match, innerButtons) => {
  if (match.includes('Approve')) return match;
  return `<td className="px-6 py-4 text-right space-x-2">
                    {activeTab === 'approvals' ? (
                      <button 
                        onClick={() => setPendingPayrollIds(prev => prev.filter(id => id !== emp.id))} 
                        className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 rounded font-bold text-xs uppercase tracking-wide transition-colors border border-red-200"
                      >
                        Approve Payroll
                      </button>
                    ) : (
                      <>
                        ${innerButtons.trim()}
                      </>
                    )}
                  </td>`;
});

// Modify the Payslip modal to show "PENDING HR APPROVAL" if the ID is in pendingPayrollIds
const payslipVerifiedRegex = /<div className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200 text-xs font-bold uppercase tracking-wider mb-2">[\s\S]*?<\/div>/m;
const dynamicPayslipTag = `{pendingPayrollIds.includes(viewPayslip.id) ? (
                    <div className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-3 py-1 rounded-full border border-red-200 text-xs font-bold uppercase tracking-wider mb-2">
                      <AlertCircle size={14} /> Pending HR Approval
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200 text-xs font-bold uppercase tracking-wider mb-2">
                      <BadgeCheck size={14} /> Verified
                    </div>
                  )}`;
if (code.match(payslipVerifiedRegex) && !code.includes('Pending HR Approval')) {
  code = code.replace(payslipVerifiedRegex, dynamicPayslipTag);
}

fs.writeFileSync('src/components/EmployeeScreen.tsx', code);
