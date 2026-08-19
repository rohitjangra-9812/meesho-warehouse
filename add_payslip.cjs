const fs = require('fs');
let code = fs.readFileSync('src/components/EmployeeScreen.tsx', 'utf8');

// Icons
const iconImportRegex = /import \{\s*Users[\s\S]*?\} from 'lucide-react';/m;
if (!code.includes('Receipt')) {
  const newIconImport = `import { Users, Info, Plus, Search, Edit2, Trash2, X, FileText, CheckCircle2, Stamp, Calendar, ArrowUp, ArrowDown, BarChart2, Receipt, BadgeCheck, IndianRupee } from 'lucide-react';`;
  code = code.replace(iconImportRegex, newIconImport);
}

// State
if (!code.includes('viewPayslip')) {
  code = code.replace(
    "const [viewAgreement, setViewAgreement] = useState<any | null>(null);",
    `const [viewAgreement, setViewAgreement] = useState<any | null>(null);
  const [viewPayslip, setViewPayslip] = useState<any | null>(null);`
  );
}

// Action Button
const targetActions = `<button onClick={() => setViewAgreement(emp)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="View Agreement">`;
const replacementActions = `<button onClick={() => setViewPayslip(emp)} className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors" title="Generate Payslip">
                      <Receipt size={16} />
                    </button>
                    <button onClick={() => setViewAgreement(emp)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="View Agreement">`;
if (code.includes(targetActions) && !code.includes('setViewPayslip(emp)')) {
  code = code.replace(targetActions, replacementActions);
}

// Modal HTML
const payslipModal = `
      {/* Payslip Modal */}
      {viewPayslip && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto font-sans text-left rounded-xl">
            {/* Action Bar */}
            <div className="bg-gray-100 border-b border-gray-300 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
              <span className="text-sm font-bold text-gray-600 flex items-center gap-2">
                <Receipt size={16} /> Automated End-of-Month Payslip
              </span>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="px-4 py-1.5 bg-white border border-gray-300 rounded text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  Print PDF
                </button>
                <button onClick={() => setViewPayslip(null)} className="px-4 py-1.5 bg-gray-800 text-white rounded text-sm font-semibold hover:bg-gray-900">
                  Close
                </button>
              </div>
            </div>

            {/* Payslip Document */}
            <div className="p-8 md:p-10 text-gray-800">
              {/* Header */}
              <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-6">
                <div>
                  <h1 className="text-2xl font-black uppercase tracking-widest text-gray-900">Meesho Logistics</h1>
                  <p className="text-sm text-gray-600 font-medium">Central Inward & Fulfillment Hub</p>
                  <p className="text-sm text-gray-600 font-medium">Salary Slip - End of Month ({new Date().toLocaleString('default', { month: 'long', year: 'numeric' })})</p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200 text-xs font-bold uppercase tracking-wider mb-2">
                    <BadgeCheck size={14} /> Verified Salary
                  </div>
                  <p className="text-xs text-gray-500 font-mono">Auto-generated via System</p>
                </div>
              </div>

              {/* Employee Details */}
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 mb-8 bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Employee Name</p>
                  <p className="text-lg font-bold text-gray-900">{viewPayslip.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Employee ID</p>
                  <p className="text-lg font-bold text-gray-900 font-mono">{viewPayslip.empId || \`EMP-\${viewPayslip.id.toString().padStart(4, '0')}\`}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Allotted Department</p>
                  <p className="font-semibold text-gray-800">{viewPayslip.department}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Allotted Mobile No.</p>
                  <p className="font-semibold text-gray-800">+91 {viewPayslip.phone}</p>
                </div>
              </div>

              {/* Salary Breakdown */}
              <div className="border border-gray-200 rounded-xl overflow-hidden mb-8">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-600">
                    <tr>
                      <th className="px-6 py-3 border-b border-gray-200">Earnings</th>
                      <th className="px-6 py-3 border-b border-gray-200 text-right">Amount (₹)</th>
                      <th className="px-6 py-3 border-b border-gray-200 border-l">Deductions</th>
                      <th className="px-6 py-3 border-b border-gray-200 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    <tr>
                      <td className="px-6 py-3 font-semibold text-gray-800">Basic Salary</td>
                      <td className="px-6 py-3 text-right font-mono">{(viewPayslip.salary * 0.5).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                      <td className="px-6 py-3 font-semibold text-gray-800 border-l">PF Deduction</td>
                      <td className="px-6 py-3 text-right font-mono text-red-600">{(viewPayslip.salary * 0.05).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3 font-semibold text-gray-800">HRA</td>
                      <td className="px-6 py-3 text-right font-mono">{(viewPayslip.salary * 0.3).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                      <td className="px-6 py-3 font-semibold text-gray-800 border-l">Professional Tax</td>
                      <td className="px-6 py-3 text-right font-mono text-red-600">{(viewPayslip.salary * 0.02).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3 font-semibold text-gray-800">Special Allowance</td>
                      <td className="px-6 py-3 text-right font-mono">{(viewPayslip.salary * 0.2).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                      <td className="px-6 py-3 font-semibold text-gray-800 border-l">Other Deductions</td>
                      <td className="px-6 py-3 text-right font-mono text-red-600">0.00</td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-gray-50 border-t-2 border-gray-800 font-bold text-gray-900 text-sm uppercase">
                    <tr>
                      <td className="px-6 py-4">Total Gross Earnings</td>
                      <td className="px-6 py-4 text-right font-mono">₹{viewPayslip.salary.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                      <td className="px-6 py-4 border-l">Total Deductions</td>
                      <td className="px-6 py-4 text-right font-mono text-red-600">₹{(viewPayslip.salary * 0.07).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Net Salary Highlight */}
              <div className="flex flex-col sm:flex-row items-center justify-between bg-gray-900 text-white p-6 rounded-xl mb-12">
                <div>
                  <p className="text-sm text-gray-300 font-semibold uppercase tracking-widest mb-1">Net Pay Transferred</p>
                  <p className="text-xs text-gray-400">Credited directly to employee bank account</p>
                </div>
                <div className="text-3xl font-black font-mono tracking-tight text-green-400">
                  ₹{(viewPayslip.salary * 0.93).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                </div>
              </div>

              {/* Signatures */}
              <div className="flex justify-between items-end">
                <div className="text-center">
                  <div className="h-16 border-b border-gray-400 w-48 mb-2"></div>
                  <p className="font-bold text-gray-900">Employee Signature</p>
                </div>
                <div className="text-center">
                  <div className="h-24 flex items-center justify-center flex-col relative">
                    <Stamp size={64} className="text-green-700/10 absolute -rotate-12" />
                    <span className="font-signature text-3xl text-gray-900 relative z-10 block -rotate-3">Rohit Jangra</span>
                  </div>
                  <div className="border-t border-gray-400 mt-2 pt-2 w-56">
                    <p className="font-bold text-gray-900">Rohit Jangra</p>
                    <p className="text-xs text-gray-600 uppercase font-semibold">Authorized HR Manager</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
`;

if (!code.includes('Payslip Modal')) {
  code = code.replace(`    </div>\n  );\n}`, payslipModal + `\n    </div>\n  );\n}`);
}

fs.writeFileSync('src/components/EmployeeScreen.tsx', code);
