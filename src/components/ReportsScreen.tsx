import React, { useState } from 'react';
import { FileBarChart, Download, FileText, Calendar, Filter, FileSpreadsheet, FileOutput, ShieldCheck } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function ReportsScreen() {
  const [dateRange, setDateRange] = useState('Today');
  
  const generatePDF = (reportName: string, headers: string[], data: any[][]) => {
    const doc = new jsPDF();
    doc.text(`Meesho WMS - ${reportName}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Date Range: ${dateRange}`, 14, 36);
    
    autoTable(doc, {
      startY: 45,
      head: [headers],
      body: data,
    });
    
    doc.save(`${reportName.replace(/\s+/g, '_')}.pdf`);
  };

  const generateCSV = (reportName: string, headers: string[], data: any[][]) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += headers.join(",") + "\r\n";
    data.forEach(function(rowArray) {
        let row = rowArray.join(",");
        csvContent += row + "\r\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reportModules = [
    {
      id: 'attendance',
      title: 'Daily Shift Attendance & Payout',
      description: 'Log of clocked hours, overtime metrics, and computed shift payouts.',
      icon: <FileText size={24} className="text-blue-500" />,
      headers: ['Emp ID', 'Name', 'Shift', 'Clock In', 'Clock Out', 'Hours', 'Payout (INR)'],
      getData: () => [
        ['EMP-1002', 'Ravi Kumar', 'Morning', '06:00 AM', '02:00 PM', '8', '800'],
        ['EMP-1045', 'Sunita Devi', 'Morning', '06:15 AM', '02:00 PM', '7.75', '775'],
        ['EMP-1088', 'Amit Singh', 'Evening', '02:00 PM', '10:00 PM', '8', '850'],
        ['EMP-1092', 'Priya Sharma', 'Night', '10:00 PM', '06:00 AM', '8', '950 (Night Premium)'],
      ]
    },
    {
      id: 'inventory',
      title: 'Inventory Audit & Discrepancy',
      description: 'Detailed cycle count logs, missing items, and condition reports.',
      icon: <ShieldCheck size={24} className="text-orange-500" />,
      headers: ['SKU', 'Expected Qty', 'Actual Qty', 'Discrepancy', 'Bin Location', 'Status'],
      getData: () => [
        ['SKU-882193', '450', '448', '-2', 'A-12-Rack', 'Missing'],
        ['SKU-992112', '120', '120', '0', 'B-04-Rack', 'Matched'],
        ['SKU-112344', '50', '52', '+2', 'C-01-Bulk', 'Overstock'],
        ['SKU-773821', '800', '795', '-5', 'D-09-Rack', 'Damaged in transit'],
      ]
    },
    {
      id: 'pnl',
      title: 'Daily P&L & Dock Throughput',
      description: 'End-of-day financial ledger, gross sales, and volume throughput metrics.',
      icon: <FileBarChart size={24} className="text-green-500" />,
      headers: ['Metric', 'Value', 'Details'],
      getData: () => [
        ['Total Packages Scanned', '14,250', 'Across 12 Active Docks'],
        ['Gross Throughput Value', 'INR 45,20,000', 'Calculated from manifests'],
        ['Operational Overheads', 'INR 1,20,000', 'Fuel, Labor, Power'],
        ['Reported Shrinkage', 'INR 14,500', 'Missing / Damaged'],
        ['Net Daily Performance', 'INR 43,85,500', 'Final EOD'],
      ]
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Issuance Center</h2>
          <p className="text-sm text-gray-500 mt-1">Generate, audit, and export official warehouse reports</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#f43397]"
            >
              <option>Today</option>
              <option>Yesterday</option>
              <option>Last 7 Days</option>
              <option>This Month</option>
            </select>
          </div>
          <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 bg-white shadow-sm">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportModules.map((report) => (
          <div key={report.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 flex-1">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 mb-4">
                {report.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{report.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {report.description}
              </p>
            </div>
            <div className="border-t border-gray-100 bg-gray-50/50 p-4 flex gap-3">
              <button 
                onClick={() => generatePDF(report.title, report.headers, report.getData())}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
              >
                <FileOutput size={16} className="text-red-500" />
                PDF
              </button>
              <button 
                onClick={() => generateCSV(report.title, report.headers, report.getData())}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
              >
                <FileSpreadsheet size={16} className="text-green-600" />
                CSV
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Recent Exports Log */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm mt-8">
         <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Recent Exports Log</h3>
            <span className="text-xs font-semibold text-gray-500">Last 24 Hours</span>
         </div>
         <div className="p-6 text-center text-gray-500 text-sm">
            <Download size={24} className="mx-auto text-gray-300 mb-2" />
            <p>No reports exported in the current session.</p>
         </div>
      </div>
    </div>
  );
}
