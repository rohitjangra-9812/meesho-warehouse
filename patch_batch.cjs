const fs = require('fs');
let code = fs.readFileSync('src/components/EmployeeScreen.tsx', 'utf8');

const target = `<div className="text-sm font-medium text-gray-500">
            Showing {filteredEmployees.length} records
          </div>`;

const replacement = `<div className="flex items-center gap-4">
            {activeTab === 'approvals' && pendingPayrollIds.length > 0 && (
              <button
                onClick={() => setPendingPayrollIds([])}
                className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
              >
                Batch Approve All ({pendingPayrollIds.length})
              </button>
            )}
            <div className="text-sm font-medium text-gray-500">
              Showing {filteredEmployees.length} records
            </div>
          </div>`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/components/EmployeeScreen.tsx', code);
  console.log("Patched successfully");
} else {
  console.log("Could not find target");
}
