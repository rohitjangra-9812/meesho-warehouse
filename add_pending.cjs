const fs = require('fs');
let code = fs.readFileSync('src/components/EmployeeScreen.tsx', 'utf8');

// Icons
if (!code.includes('ClipboardCheck')) {
  code = code.replace("import { Settings, Users,", "import { Settings, Users, ClipboardCheck, AlertCircle,");
}

// State
if (!code.includes('activeTab')) {
  const newStates = `const [activeTab, setActiveTab] = useState<'roster' | 'approvals'>('roster');
  const [pendingPayrollIds, setPendingPayrollIds] = useState<number[]>([]);`;
  code = code.replace("const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);", newStates + "\n  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);");
  
  // Populate mock pending list on fetch
  const fetchReplace = `setEmployees(empRes);
      setStats(statsRes);
      if (empRes.length > 0) {
        setPendingPayrollIds(empRes.slice(0, 7).map((e: any) => e.id));
      }`;
  code = code.replace("setEmployees(empRes);\n      setStats(statsRes);", fetchReplace);
}

// Add Tabs UI under the header
const headerRegex = /<p className="text-sm text-gray-500 mt-1">Manage personnel, rosters, and operational teams<\/p>\s*<\/div>/;
const tabsHtml = `<p className="text-sm text-gray-500 mt-1">Manage personnel, rosters, and operational teams</p>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex space-x-1 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('roster')}
          className={\`px-5 py-3 text-sm font-bold border-b-2 transition-colors \${activeTab === 'roster' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}\`}
        >
          Active Roster
        </button>
        <button
          onClick={() => setActiveTab('approvals')}
          className={\`px-5 py-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors \${activeTab === 'approvals' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}\`}
        >
          HR Pending Approval
          {pendingPayrollIds.length > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
              {pendingPayrollIds.length}
            </span>
          )}
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-2">
        <div className="hidden">`; // Hide the original closing div to balance tags if needed, actually better to just inject before the Stats & Filters.

code = code.replace(
  /{[\s\S]*?\/\*\s*Stats & Filters\s*\*\//m, 
  (match) => {
    if (match.includes('Tabs')) return match;
    const splitStr = `<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">`;
    const parts = match.split(splitStr);
    
    return parts[0] + splitStr + parts[1].replace(
      `        <button `,
      `      </div>
      
      {/* Tabs */}
      <div className="flex space-x-1 border-b border-gray-200 mt-6">
        <button
          onClick={() => setActiveTab('roster')}
          className={\`px-5 py-3 text-sm font-bold border-b-2 transition-colors \${activeTab === 'roster' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}\`}
        >
          Active Roster
        </button>
        <button
          onClick={() => setActiveTab('approvals')}
          className={\`px-5 py-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors \${activeTab === 'approvals' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}\`}
        >
          HR Pending Approval
          {pendingPayrollIds.length > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
              {pendingPayrollIds.length}
            </span>
          )}
        </button>
      </div>
      
      {/* Stats & Filters */`
    );
  }
);
// Wait, my regex replacement strategy above might be fragile. Let's do something simpler:
