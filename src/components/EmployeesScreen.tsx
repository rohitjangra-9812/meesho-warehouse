import React, { useState, useEffect, useMemo } from 'react';
import { fetchApi } from '../lib/api.ts';
import { Users, Filter, Plus, X } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
}

export function EmployeesScreen() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPosition, setFilterPosition] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Employee State
  const [newName, setNewName] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPosition, setNewPosition] = useState('Scanning');
  const [newQualification, setNewQualification] = useState('');
  const [newAddress, setNewAddress] = useState('');

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await fetchApi('/employees');
      setEmployees(data);
    } catch (err) {
      console.error('Failed to load employees', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    window.addEventListener('auto-refresh', fetchEmployees);
  return () => window.removeEventListener('auto-refresh', fetchEmployees);
}, []);

  const handleSeed = async () => {
    try {
      setLoading(true);
      await fetchApi('/employees/seed', { method: 'POST' });
      await fetchEmployees();
      alert("Successfully seeded 347 employees!");
    } catch (err) {
      alert("Failed to seed employees");
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newMobile || !newPosition) return;
    
    try {
      setSubmitting(true);
      const newEmployee = await fetchApi('/employees', {
        method: 'POST',
        body: JSON.stringify({
          name: newName,
          mobile: newMobile,
          email: newEmail,
          position: newPosition,
          qualification: newQualification,
          address: newAddress
        })
      });
      setEmployees([newEmployee, ...employees]);
      setShowAddForm(false);
      setNewName('');
      setNewMobile('');
      setNewEmail('');
      setNewQualification('');
      setNewAddress('');
    } catch (err) {
      alert("Failed to add employee");
    } finally {
      setSubmitting(false);
    }
  };

  const positions = ['All', 'Scanning', 'Packing', 'Security Guard', 'Caretaker', 'Maintenance', 'Office Department', 'Loading/Unloading', 'Quality Check', 'Shift Supervisor'];
  
  const filteredEmployees = filterPosition === 'All' 
    ? employees 
    : employees.filter(e => e.position === filterPosition);

  const departmentStats = useMemo(() => {
    const stats: Record<string, number> = {};
    employees.forEach(emp => {
      stats[emp.position] = (stats[emp.position] || 0) + 1;
    });
    return Object.entries(stats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [employees]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#64748b', '#84cc16'];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-lg">
            <Users className="text-green-600 h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Employee Directory</h2>
            <p className="text-sm text-gray-500">Total {employees.length} employees</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 bg-white">
            <Filter size={16} className="text-gray-500" />
            <select 
              value={filterPosition} 
              onChange={e => setFilterPosition(e.target.value)}
              className="bg-transparent text-sm focus:outline-none text-gray-700"
            >
              {positions.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={handleSeed}
            disabled={loading}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            Seed Employees
          </button>
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Employee
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold text-gray-900">Add New Employee</h3>
              <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddEmployee} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input required type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-green-500" placeholder="e.g. Ramesh Kumar" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                  <input required type="tel" value={newMobile} onChange={e => setNewMobile(e.target.value)} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-green-500" placeholder="10-digit number" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <select required value={newPosition} onChange={e => setNewPosition(e.target.value)} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-green-500">
                    {positions.filter(p => p !== 'All').map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                  <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                  <input type="text" value={newQualification} onChange={e => setNewQualification(e.target.value)} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-green-500" placeholder="e.g. 12th Pass" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea rows={2} value={newAddress} onChange={e => setNewAddress(e.target.value)} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-green-500" placeholder="Full residential address"></textarea>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                  {submitting ? 'Adding...' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {employees.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Department Distribution</h3>
            <p className="text-sm text-gray-500 mb-4">Visual breakdown of workforce allocation across warehouse operations.</p>
            <div className="space-y-3">
              {departmentStats.map((stat, index) => (
                <div key={stat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-sm text-gray-700 font-medium">{stat.name}</span>
                  </div>
                  <span className="text-sm text-gray-500 font-medium">{stat.value} staff</span>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full md:w-1/2 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {departmentStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} Staff`, 'Count']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name & Contact</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Position & Joining</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Qualification</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEmployees.map(employee => (
                <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">{employee.name}</span>
                      <span className="text-xs text-gray-500 mt-1">{employee.mobile}</span>
                      <span className="text-xs text-gray-400 mt-0.5">{employee.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                      employee.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'
                    }`}>
                      {employee.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col items-start gap-1.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        employee.position === 'Office Department' || employee.position === 'Shift Supervisor' ? 'bg-purple-100 text-purple-800' :
                        employee.position === 'Security Guard' ? 'bg-red-100 text-red-800' :
                        employee.position === 'Quality Check' ? 'bg-green-100 text-green-800' :
                        employee.position === 'Packing' || employee.position === 'Scanning' || employee.position === 'Loading/Unloading' ? 'bg-blue-100 text-blue-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {employee.position}
                      </span>
                      {employee.dateOfJoining && (
                        <span className="text-[10px] text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded border border-gray-200 uppercase tracking-wider">
                          Joined: {new Date(employee.dateOfJoining).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {employee.qualification}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {employee.address}
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No employee records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
