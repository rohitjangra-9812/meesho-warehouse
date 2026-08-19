import React, { useEffect, useState } from 'react';
import { fetchApi } from '../lib/api.ts';
import { Settings, Users, Download, ClipboardCheck, AlertCircle, Info, Plus, Search, Edit2, Trash2, X, FileText, CheckCircle2, Stamp, Calendar, ArrowUp, ArrowDown, BarChart2, Receipt, BadgeCheck, IndianRupee } from 'lucide-react';

export function EmployeeScreen() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewAgreement, setViewAgreement] = useState<any | null>(null);
  const [viewPayslip, setViewPayslip] = useState<any | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'roster' | 'approvals'>('roster');
  const [pendingPayrollIds, setPendingPayrollIds] = useState<number[]>([]);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [hrSignatoryName, setHrSignatoryName] = useState(() => localStorage.getItem('hrSignatoryName') || 'Rohit Angra');

  useEffect(() => {
    localStorage.setItem('hrSignatoryName', hrSignatoryName);
  }, [hrSignatoryName]);

  
  const [formData, setFormData] = useState({
    name: '', fathersName: '', department: 'Packing Department', age: 21,
    qualification: '10th Pass', homeState: 'Bihar', experience: 'Fresher',
    salary: 20000, phone: '', email: '', emergencyContact: '', status: 'Active'
  });

  const fetchData = async () => {
    try {
      const [empRes, statsRes] = await Promise.all([
        fetchApi('/employees'),
        fetchApi('/employees/stats')
      ]);
      setEmployees(empRes);
      setStats(statsRes);
      if (empRes.length > 0 && pendingPayrollIds.length === 0) {
        setPendingPayrollIds(empRes.slice(2, 5).map((e: any) => e.id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if(confirm('Are you sure you want to deactivate/remove this employee?')) {
      await fetchApi(`/employees/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  const handleEdit = (emp: any) => {
    setEditingId(emp.id);
    setFormData(emp);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await fetchApi(`/employees/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
    } else {
      await fetchApi('/employees', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
    }
    setIsModalOpen(false);
    setEditingId(null);
    fetchData();
  };

  
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
      a.download = `Verified_Payslips_${new Date().toLocaleString('default', { month: 'short', year: 'numeric' })}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 2000);
  };

  const openNew = () => {
    setEditingId(null);
    setFormData({
      name: '', fathersName: '', department: 'Packing Department', age: 21,
      qualification: '10th Pass', homeState: 'Bihar', experience: 'Fresher',
      salary: 20000, phone: '', email: '', emergencyContact: '', status: 'Active'
    });
    setIsModalOpen(true);
  };

  const filteredEmployees = employees.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) || 
                          e.empId.toLowerCase().includes(search.toLowerCase());
    const matchesDept = filterDept === 'All' || e.department === filterDept;
    return matchesSearch && matchesDept;
  });

  const allDepts = ['All', 'Packing Department', 'Scanning / Intake', 'Material Handling', 'General Workers', 'Security Guard / Loss Prevention', 'Fleet Drivers / Logistics', 'Management Team'];

  return (
    <div className="space-y-6 relative">
      {/* Audit Banner */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center gap-3">
        <Info className="text-blue-600 w-5 h-5 shrink-0" />
        <p className="text-sm font-medium text-blue-800">
          System scheduled update: Roster sync and personnel modifications refresh automatically every 2 days.
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Employee Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage personnel, rosters, and operational teams</p>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
        <button 
          onClick={handleBulkDownload}
          disabled={isDownloadingZip}
          className={`inline-flex items-center justify-center gap-2 px-4 py-2 ${isDownloadingZip ? 'bg-indigo-100 text-indigo-400' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'} rounded-lg font-medium text-sm transition-colors shadow-sm`}
        >
          <Download size={16} className={isDownloadingZip ? "animate-bounce" : ""} /> 
          {isDownloadingZip ? "Archiving PDFs..." : "Download All Payslips"}
        </button>
        <button 
          onClick={() => setIsSettingsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Settings size={16} /> HR Settings
        </button>
        <button 
          onClick={openNew}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={16} /> Add New Employee
        </button>
        </div>
      </div>
      {/* Tabs */}
      <div className="flex space-x-1 border-b border-gray-200 mt-2 mb-4">
        <button
          onClick={() => setActiveTab('roster')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'roster' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Active Roster
        </button>
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-5 py-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'approvals' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          HR Pending Approval
          {pendingPayrollIds.length > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
              {pendingPayrollIds.length}
            </span>
          )}
        </button>
      </div>

      {/* Stats & Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Users size={20} />
            </div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Headcount</h3>
          </div>
          <p className="text-4xl font-extrabold text-gray-900">{stats?.total || 350}</p>
        </div>

        <div className="lg:col-span-3 bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Departments</h3>
          <div className="flex flex-wrap gap-2">
            {allDepts.map(dept => (
              <button
                key={dept}
                onClick={() => setFilterDept(dept)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  filterDept === dept 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {dept} {dept !== 'All' && stats?.departments && `(${stats.departments[dept] || 0})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by ID or Name..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-4">
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
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-gray-50 text-xs font-semibold tracking-wide text-gray-500 uppercase border-b border-gray-200">
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Profile</th>
                <th className="px-6 py-4">Contact & Location</th>
                <th className="px-6 py-4 text-right">Salary</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">Loading roster...</td></tr>
              ) : filteredEmployees.slice(0, 50).map((emp: any) => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{emp.name}</div>
                    <div className="text-xs text-gray-500 mt-1 font-mono">{emp.empId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-700">{emp.department}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => setViewAgreement(emp)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors border border-blue-200 shadow-sm whitespace-nowrap">
                      <FileText size={14} /> View Contract
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900 font-medium">{emp.age} yrs • {emp.experience}</div>
                    <div className="text-xs text-gray-500 mt-1">{emp.qualification}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900 font-medium">+91 {emp.phone}</div>
                    <div className="text-xs text-gray-500 mt-1 font-mono break-all max-w-[180px]">{emp.email}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{emp.homeState}</div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">
                    ₹{emp.salary?.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${
                      emp.status === 'Active' ? 'bg-green-100 text-green-700' : 
                      emp.status === 'On Leave' ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {activeTab === 'approvals' ? (
                      <button 
                        onClick={() => setPendingPayrollIds(prev => prev.filter(id => id !== emp.id))} 
                        className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 rounded font-bold text-xs uppercase tracking-wide transition-colors border border-red-200"
                      >
                        Approve Payroll
                      </button>
                    ) : (
                      <>
                        <button onClick={() => setViewPayslip(emp)} className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors" title="Generate Payslip">
                      <Receipt size={16} />
                    </button>
                    
                    <button onClick={() => handleEdit(emp)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(emp.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                      <Trash2 size={16} />
                    </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredEmployees.length > 50 && (
            <div className="px-6 py-4 text-center text-sm text-gray-500 bg-gray-50 border-t border-gray-100">
              Showing first 50 results. Please use search to find specific employees.
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
              <h3 className="text-lg font-bold text-gray-900">{editingId ? 'Edit Employee' : 'Add New Employee'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Full Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Father's Name</label>
                  <input required type="text" value={formData.fathersName} onChange={e => setFormData({...formData, fathersName: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Department</label>
                  <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                    {allDepts.filter(d => d !== 'All').map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Home State</label>
                  <select value={formData.homeState} onChange={e => setFormData({...formData, homeState: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                    {['Bihar', 'UP', 'Punjab', 'Haryana', 'Delhi'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Age</label>
                  <input required type="number" value={formData.age} onChange={e => setFormData({...formData, age: Number(e.target.value)})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Salary (₹)</label>
                  <input required type="number" min="20000" value={formData.salary} onChange={e => setFormData({...formData, salary: Number(e.target.value)})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Contact Number</label>
                  <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Email Address</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                    {['Active', 'On Leave', 'Shift Active'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-200 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                  {editingId ? 'Save Changes' : 'Register Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Agreement Modal (PDF Style) */}
      {viewAgreement && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto font-serif text-left">
            {/* Action Bar */}
            <div className="bg-gray-100 border-b border-gray-300 px-6 py-3 flex items-center justify-between sticky top-0 z-10 font-sans">
              <span className="text-sm font-bold text-gray-600 flex items-center gap-2">
                <FileText size={16} /> Official Employee Contract Document
              </span>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="px-4 py-1.5 bg-white border border-gray-300 rounded text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  Print PDF
                </button>
                <button onClick={() => setViewAgreement(null)} className="px-4 py-1.5 bg-gray-800 text-white rounded text-sm font-semibold hover:bg-gray-900">
                  Close
                </button>
              </div>
            </div>

            {/* Document Body */}
            <div className="p-8 md:p-12 text-gray-800 space-y-8">
              {/* Header */}
              <div className="text-center border-b-2 border-gray-800 pb-6">
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-gray-900">Meesho Logistics</h1>
                <h2 className="text-xl md:text-2xl font-bold mt-2">Warehouse Employment Agreement</h2>
                <p className="text-sm text-gray-600 mt-2 font-mono">Contract Ref: EMP-{viewAgreement.id}-{Date.now().toString().slice(-6)}</p>
              </div>

              {/* Duration & Parties */}
              <div className="space-y-4 text-justify leading-relaxed">
                <p>
                  This Warehouse Employment Agreement ("Agreement") is effective immediately, by and between:
                </p>
                <div className="grid md:grid-cols-2 gap-6 bg-gray-50 p-6 border border-gray-200">
                  <div>
                    <h3 className="font-bold uppercase text-sm mb-2 text-gray-900 border-b border-gray-300 pb-1">Entity 1: The Employer</h3>
                    <p className="font-semibold">Meesho Logistics Pvt. Ltd.</p>
                    <p className="text-sm">Central Inward & Fulfillment Hub</p>
                    <p className="text-sm">Authorized HR: Insp. {hrSignatoryName}</p>
                  </div>
                  <div>
                    <h3 className="font-bold uppercase text-sm mb-2 text-gray-900 border-b border-gray-300 pb-1">Entity 2: The Employee</h3>
                    <p className="font-semibold">{viewAgreement.name}</p>
                    <p className="text-sm">Father's Name: {viewAgreement.fathersName}</p>
                    <p className="text-sm">Contact Number: +91 {viewAgreement.phone}</p>
                    <p className="text-sm">Registered Domicile: {viewAgreement.homeState}</p>
                  </div>
                </div>
              </div>

              {/* Deal Terms */}
              <div className="space-y-4 leading-relaxed">
                <h3 className="text-lg font-bold uppercase tracking-wide border-b border-gray-300 pb-1">1. Scope of Employment</h3>
                <p>
                  The Employee is officially hired for the position within the <strong>{viewAgreement.department}</strong>. The Employee agrees to perform the designated warehouse duties efficiently and in compliance with Meesho Logistics standard operational protocols.
                </p>
                
                <h3 className="text-lg font-bold uppercase tracking-wide border-b border-gray-300 pb-1 mt-6">2. Compensation & Salary Terms</h3>
                <p>
                  The Employer agrees to compensate the Employee with a structured gross monthly remuneration of <strong>₹{(viewAgreement.salary || 0)?.toLocaleString('en-IN')}</strong>. This salary is subject to standard tax deductions, attendance performance, and operational KPIs evaluated directly by the warehouse management team.
                </p>

                <h3 className="text-lg font-bold uppercase tracking-wide border-b border-gray-300 pb-1 mt-6">3. Legal Liability & Warehouse Compliance</h3>
                <p>
                  The Employee assumes full legal liability for maintaining safety standards, asset protection, and operational discipline on the warehouse floor. Any breach of Meesho Logistics standard operating procedures (SOPs) or security protocols will result in immediate disciplinary action up to termination.
                </p>
              </div>

              {/* Signatures */}
              <div className="mt-12 pt-12 border-t-2 border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="text-center">
                  <div className="h-24 flex items-center justify-center flex-col relative">
                    <Stamp size={64} className="text-blue-900/20 absolute -rotate-12" />
                    <span className="font-signature text-3xl text-blue-900 relative z-10 block -rotate-3">{hrSignatoryName}</span>
                  </div>
                  <div className="border-t border-gray-400 mt-2 pt-2">
                    <p className="font-bold text-gray-900">Insp. {hrSignatoryName}</p>
                    <p className="text-xs text-gray-600 uppercase">Authorized HR & Inspector</p>
                    <p className="text-xs text-gray-500 font-mono mt-1">Meesho Logistics</p>
                  </div>
                </div>

                <div className="text-center">
                  <div className="h-24 flex items-center justify-center">
                    <span className="font-signature text-3xl text-gray-800 block -rotate-2">{viewAgreement.name}</span>
                  </div>
                  <div className="border-t border-gray-400 mt-2 pt-2">
                    <p className="font-bold text-gray-900">{viewAgreement.name}</p>
                    <p className="text-xs text-gray-600 uppercase">Employee Counter-Signature</p>
                    <p className="text-xs text-gray-500 font-mono mt-1">Timestamp: {new Date().toISOString().split('T')[0]}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Footer */}
            <div className="bg-green-50 border-t border-green-200 p-4 flex items-center justify-center gap-2 text-green-800 font-sans">
              <CheckCircle2 size={20} className="text-green-600" />
              <span className="font-bold tracking-wide uppercase text-sm">Verified & Authorized Employment Contract — Active Status</span>
            </div>
          </div>
        </div>
      )}

      {/* Shift Analysis Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BarChart2 size={20} className="text-blue-600"/> Labor Scheduling Analysis
              </h3>
              <button onClick={() => setIsScheduleModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-6">
              {/* Header KPI */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-5 border border-gray-200 rounded-xl shadow-sm">
                  <div className="text-sm font-bold text-gray-500 mb-1 uppercase tracking-wide">Peak Over-staffing</div>
                  <div className="text-3xl font-black text-gray-900 flex items-center gap-2">
                    14:00 - 16:00 <ArrowUp className="text-red-500" size={24} />
                  </div>
                  <p className="text-sm text-red-600 font-medium mt-2">+12 surplus staff detected</p>
                </div>
                <div className="bg-white p-5 border border-gray-200 rounded-xl shadow-sm">
                  <div className="text-sm font-bold text-gray-500 mb-1 uppercase tracking-wide">Peak Under-staffing</div>
                  <div className="text-3xl font-black text-gray-900 flex items-center gap-2">
                    08:00 - 10:00 <ArrowDown className="text-orange-500" size={24} />
                  </div>
                  <p className="text-sm text-orange-600 font-medium mt-2">-8 staff shortfall detected</p>
                </div>
                <div className="bg-white p-5 border border-gray-200 rounded-xl shadow-sm">
                  <div className="text-sm font-bold text-gray-500 mb-1 uppercase tracking-wide">Optimization Saving</div>
                  <div className="text-3xl font-black text-gray-900">
                    ₹ 18,400 <span className="text-sm text-gray-400 font-medium font-sans">/day</span>
                  </div>
                  <p className="text-sm text-green-600 font-medium mt-2">Potential savings if smoothed</p>
                </div>
              </div>

              {/* Chart/Grid representation */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-white">
                  <h4 className="font-bold text-gray-900">Shift Overlap Map (Today)</h4>
                  <p className="text-xs text-gray-500 mt-1">Cross-referencing Morning, General, and Evening shifts against predictive volume.</p>
                </div>
                <div className="p-6">
                  {/* Pseudo-chart container */}
                  <div className="space-y-4">
                    {[
                      { time: '06:00 - 08:00', load: 30, capacity: 35, status: 'Optimal' },
                      { time: '08:00 - 10:00', load: 85, capacity: 60, status: 'Under-staffed' },
                      { time: '10:00 - 12:00', load: 70, capacity: 75, status: 'Optimal' },
                      { time: '12:00 - 14:00', load: 60, capacity: 75, status: 'Optimal' },
                      { time: '14:00 - 16:00', load: 45, capacity: 90, status: 'Over-staffed' },
                      { time: '16:00 - 18:00', load: 60, capacity: 55, status: 'Warning' },
                      { time: '18:00 - 20:00', load: 80, capacity: 85, status: 'Optimal' },
                      { time: '20:00 - 22:00', load: 40, capacity: 45, status: 'Optimal' }
                    ].map((slot, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-28 text-xs font-bold text-gray-500 font-mono text-right">{slot.time}</div>
                        <div className="flex-1 h-8 bg-gray-100 rounded-md relative flex items-center">
                          {/* Capacity Bar */}
                          <div 
                            className={`absolute left-0 top-0 bottom-0 rounded-md opacity-40 ${
                              slot.status === 'Over-staffed' ? 'bg-red-400' : 
                              slot.status === 'Under-staffed' ? 'bg-orange-400' : 'bg-blue-400'
                            }`} 
                            style={{ width: `${slot.capacity}%` }}
                          ></div>
                          {/* Load line */}
                          <div 
                            className="absolute top-0 bottom-0 border-r-2 border-gray-900 z-10"
                            style={{ left: `${slot.load}%` }}
                          ></div>
                        </div>
                        <div className="w-32">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${
                            slot.status === 'Over-staffed' ? 'bg-red-100 text-red-700' :
                            slot.status === 'Under-staffed' ? 'bg-orange-100 text-orange-700' :
                            slot.status === 'Warning' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>{slot.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Legend */}
                  <div className="mt-8 flex items-center justify-center gap-6 border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                      <div className="w-4 h-4 bg-blue-400 opacity-40 rounded"></div> Shift Capacity
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                      <div className="w-1 h-4 bg-gray-900"></div> Predictive Volume Load
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Recs */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 shadow-sm">
                <h4 className="text-blue-900 font-bold mb-2">AI Recommendation</h4>
                <p className="text-sm text-blue-800">
                  Delay General Shift start times by 2 hours (10:00 to 19:00 instead of 08:00 to 17:00) for 15 workers in the Packing Department. This will completely smooth the 14:00 over-staffing spike and cover the 18:00 volume warning.
                </p>
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 transition-colors">
                  Draft Schedule Revision
                </button>
              </div>

            </div>
          </div>
        </div>
      )}


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
                  {pendingPayrollIds.includes(viewPayslip.id) ? (
                    <div className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-3 py-1 rounded-full border border-red-200 text-xs font-bold uppercase tracking-wider mb-2">
                      <AlertCircle size={14} /> Pending HR Approval
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200 text-xs font-bold uppercase tracking-wider mb-2">
                      <BadgeCheck size={14} /> Verified
                    </div>
                  )}
                  <p className="text-xs text-gray-500 font-mono">Auto-generated via System</p>
                </div>
              </div>

              {/* Employee Details */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5 mb-8 bg-blue-50/30 p-6 rounded-xl border border-blue-100">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Employee Name</p>
                  <p className="text-base font-bold text-gray-900">{viewPayslip.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Employee ID</p>
                  <p className="text-base font-bold text-gray-900 font-mono">{viewPayslip.empId || `EMP-${viewPayslip.id.toString().padStart(4, '0')}`}</p>
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
                      <td className="px-6 py-3 text-right font-mono">{((viewPayslip.salary || 0) * 0.5).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                      <td className="px-6 py-3 font-semibold text-gray-800 border-l">PF Deduction</td>
                      <td className="px-6 py-3 text-right font-mono text-red-600">{((viewPayslip.salary || 0) * 0.05).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3 font-semibold text-gray-800">HRA</td>
                      <td className="px-6 py-3 text-right font-mono">{((viewPayslip.salary || 0) * 0.3).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                      <td className="px-6 py-3 font-semibold text-gray-800 border-l">Professional Tax</td>
                      <td className="px-6 py-3 text-right font-mono text-red-600">{((viewPayslip.salary || 0) * 0.02).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3 font-semibold text-gray-800">Special Allowance</td>
                      <td className="px-6 py-3 text-right font-mono">{((viewPayslip.salary || 0) * 0.2).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                      <td className="px-6 py-3 font-semibold text-gray-800 border-l">Other Deductions</td>
                      <td className="px-6 py-3 text-right font-mono text-red-600">0.00</td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-gray-50 border-t-2 border-gray-800 font-bold text-gray-900 text-sm uppercase">
                    <tr>
                      <td className="px-6 py-4">Total Gross Earnings</td>
                      <td className="px-6 py-4 text-right font-mono">₹{(viewPayslip.salary || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                      <td className="px-6 py-4 border-l">Total Deductions</td>
                      <td className="px-6 py-4 text-right font-mono text-red-600">₹{((viewPayslip.salary || 0) * 0.07).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
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
                  ₹{((viewPayslip.salary || 0) * 0.93).toLocaleString('en-IN', {minimumFractionDigits: 2})}
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
                    <span className="font-signature text-3xl text-gray-900 relative z-10 block -rotate-3">{hrSignatoryName}</span>
                  </div>
                  <div className="border-t border-gray-400 mt-2 pt-2 w-56">
                    <p className="font-bold text-gray-900">{hrSignatoryName}</p>
                    <p className="text-xs text-gray-600 uppercase font-semibold">Authorized HR Manager</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}


      {/* HR Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Settings size={20} className="text-blue-600"/> HR Admin Settings
              </h3>
              <button onClick={() => setIsSettingsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Authorized HR Signatory Name</label>
                  <p className="text-xs text-gray-500 mb-2">This name will appear on all generated employment contracts and automated payslips.</p>
                  <input
                    type="text"
                    value={hrSignatoryName}
                    onChange={(e) => setHrSignatoryName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="e.g. Rohit Angra"
                  />
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg text-sm hover:bg-blue-700"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
