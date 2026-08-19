const fs = require('fs');
let code = fs.readFileSync('src/components/EmployeeScreen.tsx', 'utf8');

// Add Download icon
if (!code.includes('Download,')) {
  code = code.replace("import { Settings, Users,", "import { Settings, Users, Download,");
}

// Add state
if (!code.includes('isDownloadingZip')) {
  const stateInsert = `const [isDownloadingZip, setIsDownloadingZip] = useState(false);`;
  code = code.replace("const [pendingPayrollIds, setPendingPayrollIds] = useState<number[]>([]);", "const [pendingPayrollIds, setPendingPayrollIds] = useState<number[]>([]);\n  " + stateInsert);
}

// Add download function
if (!code.includes('handleBulkDownload')) {
  const handlerInsert = `
  const handleBulkDownload = () => {
    setIsDownloadingZip(true);
    // Simulate generation of bulk zipped PDFs
    setTimeout(() => {
      setIsDownloadingZip(false);
      const verifiedCount = employees.length - pendingPayrollIds.length;
      
      // Create a dummy blob representing the ZIP containing PDFs
      const content = "ZIP_MOCK: Contains " + verifiedCount + " verified payslips in PDF format.";
      const blob = new Blob([content], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = \`Verified_Payslips_\${new Date().toLocaleString('default', { month: 'short', year: 'numeric' })}.zip\`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 2000);
  };
`;
  code = code.replace("const openNew = () => {", handlerInsert + "\n  const openNew = () => {");
}

// Add Download Button
const targetButtons = `<div className="flex gap-2">
        <button 
          onClick={() => setIsSettingsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Settings size={16} /> HR Settings
        </button>`;

const newButtons = `<div className="flex flex-wrap gap-2 justify-end">
        <button 
          onClick={handleBulkDownload}
          disabled={isDownloadingZip}
          className={\`inline-flex items-center justify-center gap-2 px-4 py-2 \${isDownloadingZip ? 'bg-indigo-100 text-indigo-400' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'} rounded-lg font-medium text-sm transition-colors shadow-sm\`}
        >
          <Download size={16} className={isDownloadingZip ? "animate-bounce" : ""} /> 
          {isDownloadingZip ? "Archiving PDFs..." : "Download All Payslips"}
        </button>
        <button 
          onClick={() => setIsSettingsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Settings size={16} /> HR Settings
        </button>`;

if (code.includes(targetButtons)) {
  code = code.replace(targetButtons, newButtons);
  fs.writeFileSync('src/components/EmployeeScreen.tsx', code);
  console.log("Patched successfully");
} else {
  console.log("Could not find target");
}
