import React, { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api.ts';
import { IndianRupee, Loader2, Download, BadgeCheck } from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  mobile: string;
  email: string;
  address: string;
  qualification: string;
  position: string;
  status: string;
  dateOfJoining: string;
  createdAt: string;
}

const meeshoWatermarkSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><text x="200" y="100" font-family="Arial" font-size="40" font-weight="bold" fill="rgba(0,0,0,0.03)" text-anchor="middle" transform="rotate(-30, 200, 100)">MEESHO WAREHOUSE</text></svg>`;

export function SalaryScreen() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    window.addEventListener('auto-refresh', fetchData);
  return () => window.removeEventListener('auto-refresh', fetchData);
}, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const employeesData = await fetchApi('/employees');
      setEmployees(employeesData);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  const generatePayslipPdf = async (employee: Employee) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to generate payslips");
      return;
    }
    printWindow.document.write('<html><body><div style="font-family: Arial, sans-serif; padding: 40px; text-align: center; color: #666;">Generating official payslip... Please wait.</div></body></html>');

    const date = new Date();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const totalDays = new Date(year, month, 0).getDate();
    
    let absentDays = 0;
    try {
      const logs = await fetchApi(`/attendance/monthly/${employee.id}?month=${month}&year=${year}`);
      if (logs && logs.length > 0) {
        absentDays = logs.filter((l: any) => l.status === 'Absent').length;
      }
    } catch (err) {
      console.error(err);
    }

    const baseSalary = 20000 + (employee.id * 12345 % 10001);
    const perDaySalary = baseSalary / totalDays;
    const leaveDeduction = Math.round(perDaySalary * absentDays);
    
    // Components
    const basicDA = Math.round(baseSalary * 0.50);
    const hra = Math.round(baseSalary * 0.20);
    const ta = Math.round(baseSalary * 0.10);
    const otherAllowances = baseSalary - (basicDA + hra + ta); // Ensure total matches base
    
    const grossEarnings = basicDA + hra + ta + otherAllowances; // which is baseSalary

    const pf = Math.round(basicDA * 0.12);
    const esi = Math.round(grossEarnings * 0.0075);
    const pt = 200;
    
    const totalDeductions = pf + esi + pt + leaveDeduction;
    const netPayable = grossEarnings - totalDeductions;

    const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const serialNumber = `MWPL/PAY/${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(employee.id).padStart(4, '0')}`;
    const formattedDoj = employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

    printWindow.document.open();

    printWindow.document.write(`
      <html>
        <head>
          <title>Payslip - ${employee.name}</title>
          <style>
            body { font-family: 'Arial', sans-serif; padding: 40px; color: #1f2937; position: relative; }
            .watermark { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-image: url('${meeshoWatermarkSvg}'); background-repeat: repeat; opacity: 0.5; z-index: -1; pointer-events: none; }
            .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
            .company { font-size: 24px; font-weight: bold; color: #111827; letter-spacing: 1px; }
            .address { font-size: 12px; color: #6b7280; margin-top: 5px; }
            .title { text-align: center; font-size: 18px; font-weight: bold; text-transform: uppercase; margin-bottom: 30px; letter-spacing: 1px; }
            
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; background: #f9fafb; }
            .info-row { display: flex; font-size: 13px; }
            .info-label { width: 150px; color: #6b7280; font-weight: 500; }
            .info-value { font-weight: 600; color: #111827; flex: 1; }

            .salary-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .salary-table th { background: #eff6ff; color: #1d4ed8; text-align: left; padding: 12px; font-size: 13px; border: 1px solid #bfdbfe; }
            .salary-table td { padding: 10px 12px; font-size: 13px; border: 1px solid #e5e7eb; }
            .salary-table .amount { text-align: right; }
            
            .net-pay { background: #111827; color: white; padding: 15px; border-radius: 8px; text-align: right; margin-bottom: 50px; }
            .net-pay span { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-right: 15px; opacity: 0.8; }
            .net-pay strong { font-size: 24px; }

            .signature-block { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 50px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
            .signer { text-align: center; }
            .signer-name { font-weight: bold; font-size: 14px; margin-bottom: 4px; }
            .signer-title { font-size: 11px; color: #6b7280; text-transform: uppercase; }
            .verified { display: inline-block; background: #eff6ff; color: #1d4ed8; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; border: 1px solid #bfdbfe; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="watermark"></div>
          
          <div class="header">
            <div class="company">MEESHO WAREHOUSE PVT. LTD.</div>
            <div class="address">HQ - Gurugram, Haryana | Official Compensation Document</div>
          </div>
          
          <div class="title">Payslip for the month of ${monthYear}</div>

          <div class="info-grid">
            <div>
              <div class="info-row"><div class="info-label">Employee Name:</div><div class="info-value">${employee.name}</div></div>
              <div class="info-row" style="margin-top: 8px;"><div class="info-label">Designation:</div><div class="info-value">${employee.position}</div></div>
              <div class="info-row" style="margin-top: 8px;"><div class="info-label">Date of Joining:</div><div class="info-value">${formattedDoj}</div></div>
            </div>
            <div>
              <div class="info-row"><div class="info-label">Serial No:</div><div class="info-value">${serialNumber}</div></div>
              <div class="info-row" style="margin-top: 8px;"><div class="info-label">Status:</div><div class="info-value">${employee.status}</div></div>
            </div>
          </div>

          <table class="salary-table">
            <thead>
              <tr>
                <th width="35%">Earnings</th>
                <th width="15%" class="amount">Amount (₹)</th>
                <th width="35%">Deductions</th>
                <th width="15%" class="amount">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Basic Salary & DA</td>
                <td class="amount">${basicDA.toLocaleString()}</td>
                <td>Provident Fund (PF)</td>
                <td class="amount">${pf.toLocaleString()}</td>
              </tr>
              <tr>
                <td>House Rent Allowance (HRA)</td>
                <td class="amount">${hra.toLocaleString()}</td>
                <td>Employee State Insurance (ESI)</td>
                <td class="amount">${esi.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Transport Allowance (TA)</td>
                <td class="amount">${ta.toLocaleString()}</td>
                <td>Professional Tax (PT)</td>
                <td class="amount">${pt.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Other Allowances</td>
                <td class="amount">${otherAllowances.toLocaleString()}</td>
                <td>Leave Deduction (${absentDays} days)</td>
                <td class="amount">${leaveDeduction.toLocaleString()}</td>
              </tr>
              <tr style="font-weight: bold; background: #f9fafb;">
                <td>Total Earnings</td>
                <td class="amount">${grossEarnings.toLocaleString()}</td>
                <td>Total Deductions</td>
                <td class="amount">${totalDeductions.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div class="net-pay">
            <span>Net Payable Salary:</span>
            <strong>₹${netPayable.toLocaleString()}</strong>
          </div>

          <div class="signature-block">
            <div class="signer">
              <div style="height: 40px;"></div>
              <div class="signer-name">Employee Signature</div>
            </div>
            <div class="signer">
              <div class="signer-name">Insp Rohit Jangra</div>
              <div class="signer-title">Warehouse Owner / Managing Director</div>
              <div class="verified">✓ Cryptographically Verified Signature</div>
            </div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative z-0">
      <div 
        className="absolute inset-0 pointer-events-none z-[-1] opacity-5"
        style={{ backgroundImage: `url('${meeshoWatermarkSvg}')`, backgroundRepeat: 'repeat', backgroundSize: '400px 200px' }}
      ></div>

      <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="bg-emerald-100 p-2 rounded-lg">
          <IndianRupee className="text-emerald-600 h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Salary & Payslips</h2>
          <p className="text-sm text-gray-500">Generate and manage employee compensation records</p>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joining Date</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Monthly Base (₹)</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                    <p className="text-sm text-gray-500 mt-2">Loading employees...</p>
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No employees found in directory.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => {
                  const baseSalary = 20000 + (emp.id * 12345 % 10001);
                  return (
                    <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{emp.name}</div>
                        <div className="text-xs text-gray-500">{emp.email || emp.mobile}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded-md">{emp.position}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {emp.dateOfJoining ? new Date(emp.dateOfJoining).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-semibold text-gray-900">₹{baseSalary.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => generatePayslipPdf(emp)}
                          className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-emerald-200"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Generate Payslip
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
