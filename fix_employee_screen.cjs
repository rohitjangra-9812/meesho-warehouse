const fs = require('fs');
let code = fs.readFileSync('src/components/EmployeeScreen.tsx', 'utf8');

// Re-write EmployeeScreen cleanly with Roster, Payroll, and Leaderboard
const cleanEmployeeScreen = `import React, { useState } from 'react';
import { Users, UserPlus, Shield, CheckCircle, Clock, AlertCircle, DollarSign, Award, Trophy } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function EmployeeScreen() {
  const [employeeTab, setEmployeeTab] = useState<'roster' | 'payroll' | 'leaderboard'>('roster');
  const [pendingPayrollIds, setPendingPayrollIds] = useState<number[]>([1, 2]);

  const employees = [
    { id: 1, name: 'Sunita Devi', role: 'Senior Picker', zone: 'Zone A', status: 'On Shift', shift: 'Morning (06:00 - 14:00)', salary: 32000, pph: 142 },
    { id: 2, name: 'Ravi Kumar', role: 'Packer', zone: 'Dispatch Dock', status: 'On Shift', shift: 'Morning (06:00 - 14:00)', salary: 28000, pph: 128 },
    { id: 3, name: 'Amit Singh', role: 'Inbound Associate', zone: 'Dock 2', status: 'On Break', shift: 'Morning (06:00 - 14:00)', salary: 26000, pph: 115 },
    { id: 4, name: 'Priya Sharma', role: 'Quality Control', zone: 'Returns QC', status: 'On Shift', shift: 'Evening (14:00 - 22:00)', salary: 30000, pph: 108 },
    { id: 5, name: 'Vikram Singh', role: 'AMR Fleet Supervisor', zone: 'Control Center', status: 'Off Duty', shift: 'Night (22:00 - 06:00)', salary: 38000, pph: 95 },
  ];

  const leaderboardStaff = [
    { rank: 1, name: 'Sunita Devi', role: 'Senior Picker', pph: 142, throughput: '1,420 pkgs', accuracy: '99.9%', badge: '👑 Shift MVP & Top Speed' },
    { rank: 2, name: 'Ravi Kumar', role: 'Packer', pph: 128, throughput: '1,280 pkgs', accuracy: '100%', badge: '🎯 Zero Defect Master' },
    { rank: 3, name: 'Amit Singh', role: 'Inbound Specialist', pph: 115, throughput: '1,150 pkgs', accuracy: '99.7%', badge: '⚡ Speed Demon' },
    { rank: 4, name: 'Priya Sharma', role: 'Picker', pph: 108, throughput: '1,080 pkgs', accuracy: '99.5%', badge: '⭐ High Achiever' },
    { rank: 5, name: 'Vikram Singh', role: 'Dock Handler', pph: 95, throughput: '950 pkgs', accuracy: '98.9%', badge: '📦 Reliable Worker' },
  ];

  const generatePayslipPDF = (emp: any) => {
    const doc = new jsPDF();
    doc.text('Meesho Warehouse - Official Salary Payslip', 14, 20);
    doc.setFontSize(10);
    doc.text(\`Employee Name: \${emp.name}\`, 14, 30);
    doc.text(\`Role & Zone: \${emp.role} (\${emp.zone})\`, 14, 36);
    doc.text(\`Shift: \${emp.shift}\`, 14, 42);
    doc.text(\`Pay Period: August 2026\`, 14, 48);

    autoTable(doc, {
      startY: 55,
      head: [['Earnings / Deduction', 'Amount (INR)']],
      body: [
        ['Basic Salary', \`₹\${(emp.salary * 0.6).toFixed(0)}\`],
        ['House Rent Allowance (HRA)', \`₹\${(emp.salary * 0.25).toFixed(0)}\`],
        ['Performance & PPH Bonus', \`₹\${(emp.salary * 0.15).toFixed(0)}\`],
        ['Provident Fund (PF) Deduction', '-₹1,800'],
        ['Net Transferred Pay', \`₹\${emp.salary - 1800}\`],
      ]
    });

    doc.save(\`Payslip_\${emp.name.replace(/\\s+/g, '_')}.pdf\`);
    setPendingPayrollIds(prev => prev.filter(id => id !== emp.id));
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Workforce, Payroll & Gamified Leaderboard</h2>
          <p className="text-sm text-gray-500 mt-1">Manage shift staffing, download official payslips, and view productivity rankings</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-gray-200 mt-2 mb-4">
        <button
          onClick={() => setEmployeeTab('roster')}
          className={\`px-5 py-3 text-sm font-bold border-b-2 transition-colors \${employeeTab === 'roster' ? 'border-[#f43397] text-[#f43397]' : 'border-transparent text-gray-500 hover:text-gray-700'}\`}
        >
          Active Roster
        </button>
        <button
          onClick={() => setEmployeeTab('payroll')}
          className={\`px-5 py-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors \${employeeTab === 'payroll' ? 'border-[#f43397] text-[#f43397]' : 'border-transparent text-gray-500 hover:text-gray-700'}\`}
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
          className={\`px-5 py-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors \${employeeTab === 'leaderboard' ? 'border-[#f43397] text-[#f43397]' : 'border-transparent text-gray-500 hover:text-gray-700'}\`}
        >
          🏆 Productivity Leaderboard & Badges
        </button>
      </div>

      {employeeTab === 'leaderboard' ? (
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
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Assigned Zone</th>
                <th className="px-6 py-4">Shift Status</th>
                <th className="px-6 py-4">Shift Timing</th>
                {employeeTab === 'payroll' && <th className="px-6 py-4">Monthly Salary</th>}
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {employees.map(emp => (
                <tr key={emp.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{emp.name}</td>
                  <td className="px-6 py-4 text-gray-600">{emp.role}</td>
                  <td className="px-6 py-4 font-semibold text-gray-800">{emp.zone}</td>
                  <td className="px-6 py-4">
                    <span className={\`inline-flex px-2.5 py-1 rounded-full text-xs font-bold \${
                      emp.status === 'On Shift' ? 'bg-green-50 text-green-700 border border-green-200' :
                      emp.status === 'On Break' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                      'bg-gray-100 text-gray-600 border border-gray-200'
                    }\`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-xs">{emp.shift}</td>
                  {employeeTab === 'payroll' && (
                    <td className="px-6 py-4 font-mono font-bold text-gray-900">₹{emp.salary.toLocaleString()}</td>
                  )}
                  <td className="px-6 py-4 text-right">
                    {employeeTab === 'payroll' ? (
                      <button
                        onClick={() => generatePayslipPDF(emp)}
                        className="px-4 py-2 bg-[#f43397] text-white rounded-xl text-xs font-bold hover:bg-pink-700 transition-colors shadow-sm inline-flex items-center gap-1.5"
                      >
                        📄 Download Payslip PDF
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-gray-400">Active Duty</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync('src/components/EmployeeScreen.tsx', cleanEmployeeScreen);
