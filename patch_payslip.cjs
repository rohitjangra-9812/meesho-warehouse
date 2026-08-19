const fs = require('fs');
let code = fs.readFileSync('src/components/EmployeeScreen.tsx', 'utf8');

const targetDetails = `<div className="grid md:grid-cols-2 gap-x-8 gap-y-4 mb-8 bg-blue-50/50 p-6 rounded-xl border border-blue-100">
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
              </div>`;

const completeDetails = `<div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5 mb-8 bg-blue-50/30 p-6 rounded-xl border border-blue-100">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Employee Name</p>
                  <p className="text-base font-bold text-gray-900">{viewPayslip.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Employee ID</p>
                  <p className="text-base font-bold text-gray-900 font-mono">{viewPayslip.empId || \`EMP-\${viewPayslip.id.toString().padStart(4, '0')}\`}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Department</p>
                  <p className="font-semibold text-gray-800">{viewPayslip.department}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Base Salary</p>
                  <p className="font-bold text-green-700">₹{(viewPayslip.salary || 0).toLocaleString('en-IN')}/mo</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Bank A/C Number</p>
                  <p className="font-semibold text-gray-800 font-mono">XXXX-XXXX-{(viewPayslip.id * 1234).toString().slice(-4).padStart(4, '0')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">UAN / PF Number</p>
                  <p className="font-semibold text-gray-800 font-mono">1009{viewPayslip.id.toString().padStart(6, '0')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Days Worked</p>
                  <p className="font-semibold text-gray-800">30 / 30 Days</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Designation</p>
                  <p className="font-semibold text-gray-800">{viewPayslip.department === 'Management Team' ? 'Manager' : 'Staff Worker'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Contact No.</p>
                  <p className="font-semibold text-gray-800">+91 {viewPayslip.phone}</p>
                </div>
              </div>`;

if (code.includes(targetDetails)) {
  code = code.replace(targetDetails, completeDetails);
  fs.writeFileSync('src/components/EmployeeScreen.tsx', code);
  console.log('Payslip Details updated successfully.');
} else {
  console.log('Payslip Details target not found. Cannot patch.');
}
