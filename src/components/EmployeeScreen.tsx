import React, { useState, useMemo } from 'react';
import { 
  Users, UserPlus, FileText, ShieldCheck, Download, Search, Filter, 
  CheckCircle2, AlertCircle, Sparkles, X, ChevronLeft, ChevronRight, 
  Building2, Phone, Mail, Award, Check, FileCheck, Shield, Lock
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MeeshoLogo } from './MeeshoLogo';

export function EmployeeScreen() {
  const [activeTab, setActiveTab] = useState<'directory' | 'agreements' | 'payroll' | 'leaderboard'>('directory');
  
  // 400 Staff Members generation
  const [employees, setEmployees] = useState<any[]>(() => {
    const departments = ['Inbound Receiving', 'Wave Picking', 'Packing & QC', 'Dock Logistics', 'Returns & RTO', 'Security', 'Maintenance'];
    const designations = ['Floor Associate', 'Shift Lead', 'Forklift Driver', 'QC Specialist'];
    const shifts = ['Morning A', 'Evening B', 'Night C'];
    const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Sunita', 'Priya', 'Ananya', 'Diya', 'Kavita', 'Neha', 'Pooja', 'Sneha', 'Ritu', 'Anita', 'Ravi', 'Amit', 'Vikas', 'Deepak', 'Sandeep', 'Anil', 'Manoj', 'Rahul', 'Rohit', 'Sanjay'];
    const lastNames = ['Kumar', 'Sharma', 'Singh', 'Verma', 'Gupta', 'Yadav', 'Malik', 'Chauhan', 'Saini', 'Reddy', 'Patel', 'Joshi', 'Tiwari', 'Desai', 'Rao'];

    return Array.from({ length: 400 }, (_, i) => {
      const idNum = i + 1;
      const empId = `MSH-EMP-${String(idNum).padStart(3, '0')}`;
      const fName = firstNames[i % firstNames.length];
      const lName = lastNames[(i * 7) % lastNames.length];
      const name = `${fName} ${lName}`;
      const department = departments[i % departments.length];
      const designation = designations[i % designations.length];
      const shift = shifts[i % shifts.length];
      const salaryTier = `₹${(24000 + (i % 6) * 3500).toLocaleString()}/mo`;
      const salaryNum = 24000 + (i % 6) * 3500;
      const phone = `+91 ${9000000000 + (i * 37) % 999999999}`;
      const agreementStatus = i < 378 ? 'Signed' : i < 395 ? 'Pending' : 'Expired';

      return {
        id: idNum,
        empId,
        name,
        department,
        designation,
        shift,
        salaryTier,
        salary: salaryNum,
        phone,
        email: `${fName.toLowerCase()}.${lName.toLowerCase()}${idNum}@meeshowms.com`,
        agreementStatus,
        zone: `${department} - Zone ${(i % 4) + 1}`,
        status: i % 12 === 0 ? 'Off Duty' : 'On Shift',
        pph: 90 + (i % 60)
      };
    });
  });

  // Filter & Search state for Directory
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [filterShift, setFilterShift] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingAgreementEmp, setViewingAgreementEmp] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New staff form state
  const [newName, setNewName] = useState('');
  const [newDept, setNewDept] = useState('Inbound Receiving');
  const [newDesignation, setNewDesignation] = useState('Floor Associate');
  const [newShift, setNewShift] = useState('Morning A');
  const [newPhone, setNewPhone] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            emp.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            emp.phone.includes(searchQuery);
      const matchesDept = filterDept === 'All' || emp.department === filterDept;
      const matchesShift = filterShift === 'All' || emp.shift === filterShift;
      const matchesStatus = filterStatus === 'All' || emp.agreementStatus === filterStatus;
      return matchesSearch && matchesDept && matchesShift && matchesStatus;
    });
  }, [employees, searchQuery, filterDept, filterShift, filterStatus]);

  const totalPages = Math.ceil(filteredEmployees.length / pageSize) || 1;
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const signedCount = employees.filter(e => e.agreementStatus === 'Signed').length;
  const pendingCount = employees.filter(e => e.agreementStatus === 'Pending' || e.agreementStatus === 'Expired').length;

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    const newIdNum = employees.length + 1;
    const newEmp = {
      id: newIdNum,
      empId: `MSH-EMP-${String(newIdNum).padStart(3, '0')}`,
      name: newName,
      department: newDept,
      designation: newDesignation,
      shift: newShift,
      salaryTier: '₹28,000/mo',
      salary: 28000,
      phone: newPhone || '+91 9876543210',
      email: `${newName.toLowerCase().replace(/\s+/g, '')}@meeshowms.com`,
      agreementStatus: 'Pending',
      zone: `${newDept} - Zone 1`,
      status: 'On Shift',
      pph: 100
    };
    setEmployees([newEmp, ...employees]);
    setIsAddModalOpen(false);
    setNewName('');
    setNewPhone('');
    showToast(`✅ Successfully onboarded staff member ${newEmp.empId} - ${newName}`);
  };

  const handleBulkSignAll = () => {
    setEmployees(prev => prev.map(emp => ({ ...emp, agreementStatus: 'Signed' })));
    showToast('📜 Bulk Sign Triggered: All 400 staff agreements verified and signed by Harsh Sharma.');
  };

  const exportCSV = () => {
    const headers = ['Employee ID', 'Full Name', 'Department', 'Designation', 'Shift', 'Salary Tier', 'Phone', 'Agreement Status'];
    const rows = filteredEmployees.map(e => [e.empId, e.name, e.department, e.designation, e.shift, e.salaryTier, e.phone, e.agreementStatus]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'meesho_warehouse_staff_roster.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📥 Exported staff roster to CSV successfully.');
  };

  const downloadIndividualPDF = (emp: any) => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('MEESHO WAREHOUSE FULFILLMENT PVT. LTD.', 14, 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('NIT Faridabad Fulfillment Center • Haryana Operational Division', 14, 26);
    
    doc.setLineWidth(0.5);
    doc.line(14, 32, 196, 32);

    doc.setFont('helvetica', 'bold');
    doc.text('EMPLOYMENT & SAFETY COMPLIANCE AGREEMENT', 14, 42);
    doc.setFont('helvetica', 'normal');
    doc.text(`Agreement Ref: MWPL/AGR/2026/${emp.empId}`, 14, 48);
    doc.text(`Date of Issuance: August 20, 2026`, 14, 54);

    autoTable(doc, {
      startY: 62,
      head: [['Employee Detail Field', 'Record Information']],
      body: [
        ['Employee ID', emp.empId],
        ['Full Name', emp.name],
        ['Department & Zone', `${emp.department} (${emp.zone})`],
        ['Designation', emp.designation],
        ['Shift Schedule', emp.shift],
        ['Compensation Package', emp.salaryTier],
        ['Contact Number', emp.phone],
        ['Agreement Status', emp.agreementStatus.toUpperCase()],
      ]
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Standard Operational Clauses & Safety Regulations:', 14, finalY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const clauses = [
      '1. Warehouse Safety & PPE: Mandatory wearing of high-visibility vests, steel-toe boots, and assigned barcode scanners during all operational hours.',
      '2. Data Confidentiality & Anti-Theft: Strict prohibition of unauthorized entry into high-value electronics vaults and treasury blocks.',
      '3. Working Hours & Overtime: Standard shifts are 8 hours with 1.5x overtime compensation approved by shift leads.',
      '4. Equipment Care: Proper handling of material handling equipment (MHE) and automated conveyor lines.'
    ];
    clauses.forEach((clause, idx) => {
      doc.text(clause, 14, finalY + 8 + (idx * 6));
    });

    doc.setFont('helvetica', 'bold');
    doc.text('Verified & Authenticated By:', 14, finalY + 38);
    doc.setFont('helvetica', 'normal');
    doc.text('Harsh Sharma (Operations Management)', 14, finalY + 44);
    doc.text('Meesho Warehouse Fulfillment Pvt. Ltd.', 14, finalY + 50);

    doc.save(`Agreement_${emp.empId}_${emp.name.replace(/\s+/g, '_')}.pdf`);
    showToast(`📄 Downloaded agreement PDF for ${emp.name} (${emp.empId})`);
  };

  return (
    <div className="space-y-6 pb-12 animate-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-pink-500/50 flex items-center gap-3 animate-in fade-in slide-in-from-top-5">
          <Sparkles className="text-[#f43397] animate-pulse" size={20} />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Employee Directory & 400-Staff Agreement Hub</h2>
          <p className="text-sm text-gray-500 mt-1">Manage 400 warehouse associates, contract renewals, digital signatures, and compliance audit logs.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Download size={16} />
            <span>Export Roster (CSV)</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#f43397] hover:bg-[#d82481] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <UserPlus size={16} />
            <span>Add New Staff Member</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex border-b border-gray-200 gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('directory')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'directory' ? 'border-[#f43397] text-[#f43397]' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Users size={18} /> Staff Directory & Spreadsheet ({employees.length})
        </button>
        <button
          onClick={() => setActiveTab('agreements')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'agreements' ? 'border-[#f43397] text-[#f43397]' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <FileCheck size={18} /> Agreements & Contracts ({signedCount}/{employees.length} Signed)
        </button>
        <button
          onClick={() => setActiveTab('payroll')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'payroll' ? 'border-[#f43397] text-[#f43397]' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Award size={18} /> Payslips & Payroll
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'leaderboard' ? 'border-[#f43397] text-[#f43397]' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          🏆 Productivity Leaderboard
        </button>
      </div>

      {/* TAB 1: DIRECTORY SPREADSHEET */}
      {activeTab === 'directory' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Search and Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search by Employee Name, ID (e.g. MSH-EMP-045)..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#f43397]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select
                value={filterDept}
                onChange={(e) => { setFilterDept(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none"
              >
                <option value="All">All Departments</option>
                <option value="Inbound Receiving">Inbound Receiving</option>
                <option value="Wave Picking">Wave Picking</option>
                <option value="Packing & QC">Packing & QC</option>
                <option value="Dock Logistics">Dock Logistics</option>
                <option value="Returns & RTO">Returns & RTO</option>
                <option value="Security">Security</option>
                <option value="Maintenance">Maintenance</option>
              </select>

              <select
                value={filterShift}
                onChange={(e) => { setFilterShift(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none"
              >
                <option value="All">All Shifts</option>
                <option value="Morning A">Morning A</option>
                <option value="Evening B">Evening B</option>
                <option value="Night C">Night C</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none"
              >
                <option value="All">All Agreements</option>
                <option value="Signed">Signed</option>
                <option value="Pending">Pending</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 font-bold uppercase border-b border-gray-200">
                    <th className="px-4 py-3">Employee ID</th>
                    <th className="px-4 py-3">Full Name</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Designation</th>
                    <th className="px-4 py-3">Shift</th>
                    <th className="px-4 py-3">Salary Tier</th>
                    <th className="px-4 py-3">Contact Phone</th>
                    <th className="px-4 py-3">Agreement</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedEmployees.length === 0 ? (
                    <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">No staff members found matching criteria.</td></tr>
                  ) : (
                    paginatedEmployees.map(emp => (
                      <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-pink-600">{emp.empId}</td>
                        <td className="px-4 py-3 font-bold text-gray-900">{emp.name}</td>
                        <td className="px-4 py-3 text-gray-600">{emp.department}</td>
                        <td className="px-4 py-3 font-semibold text-gray-800">{emp.designation}</td>
                        <td className="px-4 py-3 text-gray-600">{emp.shift}</td>
                        <td className="px-4 py-3 font-mono text-gray-900">{emp.salaryTier}</td>
                        <td className="px-4 py-3 font-mono text-gray-600">{emp.phone}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${
                            emp.agreementStatus === 'Signed' ? 'bg-green-100 text-green-700' :
                            emp.agreementStatus === 'Pending' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {emp.agreementStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setViewingAgreementEmp(emp)}
                            className="px-2.5 py-1 bg-pink-50 hover:bg-pink-100 text-[#f43397] font-bold rounded-lg transition-colors"
                          >
                            View Contract
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-semibold">
                Showing {Math.min(1, filteredEmployees.length)} - {Math.min(currentPage * pageSize, filteredEmployees.length)} of {filteredEmployees.length} staff members
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg bg-white text-gray-600 disabled:opacity-40 hover:bg-gray-100"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-xs font-bold text-gray-700 px-2">Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-lg bg-white text-gray-600 disabled:opacity-40 hover:bg-gray-100"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AGREEMENTS & CONTRACTS */}
      {activeTab === 'agreements' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Overview counters & Bulk action banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-100">Signed & Verified</p>
                <h3 className="text-3xl font-black mt-1">{signedCount} / 400</h3>
                <p className="text-xs text-emerald-200 mt-1">94.5% Compliance Rate</p>
              </div>
              <ShieldCheck size={40} className="text-emerald-200 opacity-80" />
            </div>

            <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-6 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-amber-100">Pending Signature</p>
                <h3 className="text-3xl font-black mt-1">{pendingCount} / 400</h3>
                <p className="text-xs text-amber-200 mt-1">Action Required</p>
              </div>
              <AlertCircle size={40} className="text-amber-200 opacity-80" />
            </div>

            <div className="bg-gradient-to-br from-pink-600 to-rose-700 text-white p-6 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-pink-100">Master Agreement Engine</p>
                <p className="text-xs text-pink-100 mt-1">All contracts authenticated by Harsh Sharma.</p>
              </div>
              <button
                onClick={handleBulkSignAll}
                className="mt-3 px-4 py-2 bg-white text-pink-700 hover:bg-pink-50 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm"
              >
                Bulk Issue & Sign All (400)
              </button>
            </div>
          </div>

          {/* Standard Terms Clause Viewer */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Lock size={18} className="text-[#f43397]" /> Standard Terms & Compliance Clause Viewer
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-800">1. Warehouse Safety & PPE Compliance</h4>
                <p className="text-xs text-gray-600">Mandatory wearing of high-visibility safety vests, steel-toe boots, and calibrated barcode scanners during all operational hours.</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-800">2. Data Confidentiality & Anti-Theft Policy</h4>
                <p className="text-xs text-gray-600">Strict prohibition of unauthorized entry into high-value electronics vaults and treasury blocks. Zero tolerance for inventory leakage.</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-800">3. Working Hours & Overtime Compensation</h4>
                <p className="text-xs text-gray-600">Standard shifts are 8 hours. Overtime is credited at 1.5x standard hourly rates for peak sale surge handling.</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-800">4. Equipment Care & Forklift Regulations</h4>
                <p className="text-xs text-gray-600">Certified operators only for MHE and forklifts. Pre-shift inspection checklists are mandatory before operation.</p>
              </div>
            </div>
          </div>

          {/* Pending / Review Table */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
            <h3 className="text-base font-bold text-gray-900">Staff Contract Action Queue</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 font-bold uppercase border-b border-gray-200">
                    <th className="px-4 py-3">Emp ID</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Contract Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {employees.slice(0, 10).map(emp => (
                    <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-pink-600">{emp.empId}</td>
                      <td className="px-4 py-3 font-bold text-gray-900">{emp.name}</td>
                      <td className="px-4 py-3 text-gray-600">{emp.department}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          emp.agreementStatus === 'Signed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {emp.agreementStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewingAgreementEmp(emp)}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors"
                        >
                          View Agreement
                        </button>
                        <button
                          onClick={() => downloadIndividualPDF(emp)}
                          className="px-3 py-1 bg-[#f43397] hover:bg-[#d82481] text-white font-bold rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <Download size={12} /> PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PAYROLL & PAYSLIPS */}
      {activeTab === 'payroll' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Staff Payroll & Official Payslips</h3>
              <p className="text-sm text-gray-500">Generate and download certified monthly payslips with HRA, PF, and PPH bonus breakdown.</p>
            </div>
            <span className="bg-pink-50 text-[#f43397] font-bold px-3 py-1 rounded-full text-xs border border-pink-200">Pay Cycle: August 2026</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-500 font-bold uppercase border-b">
                  <th className="px-4 py-3">Emp ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Designation</th>
                  <th className="px-4 py-3">Base Salary</th>
                  <th className="px-4 py-3">Net Payable</th>
                  <th className="px-4 py-3 text-right">Payslip Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employees.slice(0, 12).map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-pink-600">{emp.empId}</td>
                    <td className="px-4 py-3 font-bold text-gray-900">{emp.name}</td>
                    <td className="px-4 py-3 text-gray-600">{emp.designation}</td>
                    <td className="px-4 py-3 font-mono">{emp.salaryTier}</td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-600">₹{(emp.salary - 1800).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => downloadIndividualPDF(emp)}
                        className="px-3 py-1.5 bg-[#f43397] hover:bg-[#d82481] text-white font-bold rounded-lg transition-colors shadow-sm inline-flex items-center gap-1.5"
                      >
                        <Download size={13} /> Download Payslip PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Warehouse Staff Productivity Leaderboard</h3>
              <p className="text-sm text-gray-500">Picks Per Hour (PPH) and zero-defect accuracy rankings across all 400 associates.</p>
            </div>
            <span className="bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full text-xs border border-emerald-200">Active Shift: Morning A</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-br from-pink-500 to-rose-600 text-white p-6 rounded-2xl shadow-md flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-pink-100">Top Speed Picker</p>
                <h4 className="text-2xl font-black mt-1">Sunita Devi (MSH-EMP-001)</h4>
                <p className="text-sm text-pink-200 mt-0.5">142 Picks / Hour</p>
              </div>
              <div className="text-3xl">👑</div>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-md flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-100">Zero Defect Master</p>
                <h4 className="text-2xl font-black mt-1">Ravi Kumar (MSH-EMP-002)</h4>
                <p className="text-sm text-blue-200 mt-0.5">100% Accuracy</p>
              </div>
              <div className="text-3xl">🎯</div>
            </div>
            <div className="bg-gradient-to-br from-purple-600 to-violet-700 text-white p-6 rounded-2xl shadow-md flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-purple-100">Average PPH</p>
                <h4 className="text-2xl font-black mt-1">118.4 PPH</h4>
                <p className="text-sm text-purple-200 mt-0.5">+14% vs Target</p>
              </div>
              <div className="text-3xl">🚀</div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW AGREEMENT MODAL */}
      {viewingAgreementEmp && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col border border-gray-100 animate-in zoom-in-95">
            <div className="px-6 py-4 bg-gradient-to-r from-pink-600 to-rose-700 text-white flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <MeeshoLogo size={32} />
                <div>
                  <h3 className="text-base font-black tracking-wide">Employment & Safety Agreement</h3>
                  <p className="text-[10px] text-pink-100">Ref: MWPL/AGR/2026/{viewingAgreementEmp.empId}</p>
                </div>
              </div>
              <button onClick={() => setViewingAgreementEmp(null)} className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 text-sm text-gray-700 font-sans">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-gray-500 font-semibold">Employee ID:</span> <strong className="text-gray-900">{viewingAgreementEmp.empId}</strong></div>
                <div><span className="text-gray-500 font-semibold">Full Name:</span> <strong className="text-gray-900">{viewingAgreementEmp.name}</strong></div>
                <div><span className="text-gray-500 font-semibold">Department:</span> <strong className="text-gray-900">{viewingAgreementEmp.department}</strong></div>
                <div><span className="text-gray-500 font-semibold">Designation:</span> <strong className="text-gray-900">{viewingAgreementEmp.designation}</strong></div>
                <div><span className="text-gray-500 font-semibold">Shift Schedule:</span> <strong className="text-gray-900">{viewingAgreementEmp.shift}</strong></div>
                <div><span className="text-gray-500 font-semibold">Compensation:</span> <strong className="text-gray-900">{viewingAgreementEmp.salaryTier}</strong></div>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-gray-600">
                <h4 className="font-bold text-gray-900 uppercase tracking-wider text-xs">Terms & Conditions of Employment:</h4>
                <p>1. <strong>Warehouse Safety & PPE Compliance</strong>: All associates must wear high-vis vests, steel-toe boots, and calibrated barcode scanners during operational hours.</p>
                <p>2. <strong>Data Confidentiality & Anti-Theft</strong>: Strict prohibition of unauthorized entry into high-value electronics vaults and treasury blocks.</p>
                <p>3. <strong>Working Hours & Overtime</strong>: Standard 8-hour shifts with approved 1.5x overtime compensation.</p>
                <p>4. <strong>Equipment Care</strong>: Proper handling of material handling equipment (MHE) and automated conveyor lines.</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-emerald-600 w-8 h-8" />
                  <div>
                    <p className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">Verified Signature Stamp</p>
                    <p className="text-xs font-bold text-gray-900">Harsh Sharma (Operations Management)</p>
                    <p className="text-[10px] text-emerald-700">Meesho Warehouse Fulfillment Pvt. Ltd.</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  viewingAgreementEmp.agreementStatus === 'Signed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {viewingAgreementEmp.agreementStatus}
                </span>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setViewingAgreementEmp(null)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 shadow-sm"
              >
                Close
              </button>
              <button
                onClick={() => downloadIndividualPDF(viewingAgreementEmp)}
                className="px-4 py-2 bg-[#f43397] hover:bg-[#d82481] text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2"
              >
                <Download size={14} /> Download PDF Contract
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW STAFF MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 bg-gradient-to-r from-pink-600 to-rose-700 text-white flex items-center justify-between">
              <h3 className="text-base font-black">Onboard New Warehouse Staff Member</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-[#f43397] focus:outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">Department</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium focus:outline-none"
                  >
                    <option value="Inbound Receiving">Inbound Receiving</option>
                    <option value="Wave Picking">Wave Picking</option>
                    <option value="Packing & QC">Packing & QC</option>
                    <option value="Dock Logistics">Dock Logistics</option>
                    <option value="Returns & RTO">Returns & RTO</option>
                    <option value="Security">Security</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">Designation</label>
                  <select
                    value={newDesignation}
                    onChange={(e) => setNewDesignation(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium focus:outline-none"
                  >
                    <option value="Floor Associate">Floor Associate</option>
                    <option value="Shift Lead">Shift Lead</option>
                    <option value="Forklift Driver">Forklift Driver</option>
                    <option value="QC Specialist">QC Specialist</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">Shift Schedule</label>
                  <select
                    value={newShift}
                    onChange={(e) => setNewShift(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium focus:outline-none"
                  >
                    <option value="Morning A">Morning A</option>
                    <option value="Evening B">Evening B</option>
                    <option value="Night C">Night C</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-gray-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium focus:outline-none text-sm font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#f43397] text-white rounded-xl font-bold hover:bg-[#d82481] shadow-md"
                >
                  Save & Onboard Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
