import React, { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api.ts';
import { Clock, Calendar, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  position: string;
}

interface AttendanceLog {
  id: number;
  employeeId: number;
  employeeName: string;
  employeePosition: string;
  date: string;
  punchIn: string | null;
  punchOut: string | null;
  status: string;
}

interface LeaveRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  createdAt: string;
}

export function AttendanceScreen() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Punch state
  const [punchEmpId, setPunchEmpId] = useState('');
  const [punchType, setPunchType] = useState('in');
  
  // Leave state
  const [leaveEmpId, setLeaveEmpId] = useState('');
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  const [activeTab, setActiveTab] = useState<'daily' | 'leaves'>('daily');

  useEffect(() => {
    fetchData();
    window.addEventListener('auto-refresh', fetchData);
  return () => window.removeEventListener('auto-refresh', fetchData);
}, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [empData, logsData, leavesData] = await Promise.all([
        fetchApi('/employees'),
        fetchApi(`/attendance?date=${new Date().toISOString().split('T')[0]}`),
        fetchApi('/leaves')
      ]);
      setEmployees(empData);
      setLogs(logsData);
      setLeaves(leavesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!punchEmpId) return;
    try {
      await fetchApi('/attendance/punch', {
        method: 'POST',
        body: JSON.stringify({ employeeId: punchEmpId, type: punchType })
      });
      setPunchEmpId('');
      fetchData();
      alert('Punched successfully');
    } catch (err: any) {
      alert(err.message || 'Failed to punch');
    }
  };

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveEmpId || !leaveStart || !leaveEnd || !leaveReason) return;
    try {
      await fetchApi('/leaves', {
        method: 'POST',
        body: JSON.stringify({
          employeeId: leaveEmpId,
          startDate: leaveStart,
          endDate: leaveEnd,
          reason: leaveReason
        })
      });
      setLeaveEmpId('');
      setLeaveStart('');
      setLeaveEnd('');
      setLeaveReason('');
      fetchData();
      alert('Leave requested successfully');
    } catch (err: any) {
      alert(err.message || 'Failed to request leave');
    }
  };

  const updateLeaveStatus = async (id: number, status: string) => {
    try {
      await fetchApi(`/leaves/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="bg-indigo-100 p-2 rounded-lg">
          <Clock className="text-indigo-600 h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Attendance & Shifts</h2>
          <p className="text-sm text-gray-500">Manage daily punch-ins, shifts, and leave requests</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Punch Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-3">Daily Punch In/Out</h3>
          <form onSubmit={handlePunch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
              <select 
                required
                value={punchEmpId}
                onChange={(e) => setPunchEmpId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Employee...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.position})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
              <select 
                required
                value={punchType}
                onChange={(e) => setPunchType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="in">Punch In (Start Shift)</option>
                <option value="out">Punch Out (End Shift)</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors"
            >
              Record Punch
            </button>
          </form>
        </div>

        {/* Leave Request Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-3">Request Leave</h3>
          <form onSubmit={handleLeaveSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
              <select 
                required
                value={leaveEmpId}
                onChange={(e) => setLeaveEmpId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Employee...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.position})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input 
                  type="date" required
                  value={leaveStart} onChange={(e) => setLeaveStart(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input 
                  type="date" required
                  value={leaveEnd} onChange={(e) => setLeaveEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <input 
                type="text" required placeholder="E.g., Medical, Family Emergency"
                value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-white border border-indigo-600 text-indigo-700 hover:bg-indigo-50 font-medium py-2 rounded-lg transition-colors"
            >
              Submit Request
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button 
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'daily' ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('daily')}
          >
            Today's Punch Log
          </button>
          <button 
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'leaves' ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('leaves')}
          >
            Leave Requests
          </button>
        </div>

        <div className="p-0">
          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
              <p className="text-sm text-gray-500 mt-2">Loading data...</p>
            </div>
          ) : activeTab === 'daily' ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Punch In</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Punch Out</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">No punch records found for today.</td>
                    </tr>
                  ) : logs.map(log => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{log.employeeName}</div>
                        <div className="text-xs text-gray-500">{log.employeePosition}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {log.punchIn ? new Date(log.punchIn).toLocaleTimeString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {log.punchOut ? new Date(log.punchOut).toLocaleTimeString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaves.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">No leave requests found.</td>
                    </tr>
                  ) : leaves.map(leave => (
                    <tr key={leave.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{leave.employeeName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                        {leave.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                          leave.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          leave.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {leave.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {leave.status === 'Pending' && (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => updateLeaveStatus(leave.id, 'Approved')} className="text-green-600 hover:text-green-800">
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                            <button onClick={() => updateLeaveStatus(leave.id, 'Rejected')} className="text-red-600 hover:text-red-800">
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
