const fs = require('fs');
let code = fs.readFileSync('src/components/EmployeeScreen.tsx', 'utf8');

// 1. Add jsPDF imports
code = code.replace(
  "import { fetchApi } from '../lib/api.ts';",
  "import { fetchApi } from '../lib/api.ts';\nimport jsPDF from 'jspdf';\nimport autoTable from 'jspdf-autotable';"
);

// 2. Add Download PDF function inside EmployeeScreen
const downloadPdfFn = `
  const handleDownloadPayslipPDF = (payslipData: any) => {
    const doc = new jsPDF();
    doc.text('Employee Monthly Payslip', 14, 20);
    doc.setFontSize(10);
    doc.text(\`Name: \${payslipData.name}\`, 14, 30);
    doc.text(\`Employee ID: \${payslipData.empId || 'EMP-' + payslipData.id.toString().padStart(4, '0')}\`, 14, 36);
    doc.text(\`Department: \${payslipData.department}\`, 14, 42);
    
    const salary = payslipData.salary || 0;
    const basic = salary * 0.5;
    const hra = salary * 0.3;
    const special = salary * 0.2;
    const pf = salary * 0.05;
    const tax = salary * 0.02;
    const net = salary * 0.93;
    
    autoTable(doc, {
      startY: 50,
      head: [['Earnings', 'Amount (INR)', 'Deductions', 'Amount (INR)']],
      body: [
        ['Basic Salary', basic.toFixed(2), 'PF Deduction', pf.toFixed(2)],
        ['HRA', hra.toFixed(2), 'Professional Tax', tax.toFixed(2)],
        ['Special Allowance', special.toFixed(2), 'Other Deductions', '0.00'],
      ],
      foot: [
        ['Total Gross Earnings', salary.toFixed(2), 'Total Deductions', (pf + tax).toFixed(2)]
      ]
    });
    
    doc.setFontSize(12);
    doc.text(\`Net Pay Transferred: INR \${net.toFixed(2)}\`, 14, (doc as any).lastAutoTable.finalY + 15);
    
    doc.save(\`Payslip_\${payslipData.name.replace(/\\s+/g, '_')}.pdf\`);
  };
`;

code = code.replace("const handleBulkDownload = () => {", downloadPdfFn + "\n  const handleBulkDownload = () => {");

// 3. Update the Payslip Modal button
code = code.replace(
  /<button onClick=\{\(\) => window.print\(\)\} className="px-4 py-1\.5 bg-white border border-gray-300 rounded text-sm font-semibold text-gray-700 hover:bg-gray-50">\s*Print PDF\s*<\/button>/,
  `<button onClick={() => window.print()} className="px-4 py-1.5 bg-white border border-gray-300 rounded text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  Print
                </button>
                <button onClick={() => handleDownloadPayslipPDF(viewPayslip)} className="px-4 py-1.5 bg-[#f43397] border border-[#f43397] rounded text-sm font-semibold text-white hover:bg-pink-700 flex items-center gap-2">
                  <Download size={16} /> Download PDF
                </button>`
);

// 4. Rename 'approvals' to 'Payslips & Payroll' in the Tabs
code = code.replace(
  "HR Pending Approval",
  "Payslips & Payroll"
);

fs.writeFileSync('src/components/EmployeeScreen.tsx', code);
