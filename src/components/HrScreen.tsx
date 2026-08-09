import React, { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api.ts';
import { Shield, AlertTriangle, MessageSquare, CheckCircle, Clock } from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  position: string;
}

interface Certification {
  id: number;
  employeeId: number;
  employeeName: string;
  name: string;
  issueDate: string;
  expiryDate: string;
  status: string;
}

interface Grievance {
  id: number;
  employeeId: number;
  employeeName: string;
  subject: string;
  description: string;
  status: string;
  createdAt: string;
}

export function HrScreen() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  
  const [activeTab, setActiveTab] = useState<'certifications' | 'grievances'>('certifications');

  // Form states
  const [certEmpId, setCertEmpId] = useState('');
  const [certName, setCertName] = useState('');
  const [certIssue, setCertIssue] = useState('');
  const [certExpiry, setCertExpiry] = useState('');

  const [grievanceEmpId, setGrievanceEmpId] = useState('');
  const [grievanceSubject, setGrievanceSubject] = useState('');
  const [grievanceDesc, setGrievanceDesc] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [emp, certs, griv] = await Promise.all([
        fetchApi('/employees'),
        fetchApi('/certifications'),
        fetchApi('/grievances')
      ]);
      setEmployees(emp);
      setCertifications(certs);
      setGrievances(griv);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certEmpId || !certName || !certIssue || !certExpiry) return;
    try {
      await fetchApi('/certifications', {
        method: 'POST',
        body: JSON.stringify({
          employeeId: certEmpId,
          name: certName,
          issueDate: certIssue,
          expiryDate: certExpiry
        })
      });
      alert('Certification added successfully');
      setCertEmpId('');
      setCertName('');
      setCertIssue('');
      setCertExpiry('');
      fetchData();
    } catch (err) {
      alert('Failed to add certification');
    }
  };

  const handleAddGrievance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grievanceEmpId || !grievanceSubject || !grievanceDesc) return;
    try {
      await fetchApi('/grievances', {
        method: 'POST',
        body: JSON.stringify({
          employeeId: grievanceEmpId,
          subject: grievanceSubject,
          description: grievanceDesc
        })
      });
      alert('Grievance submitted successfully');
      setGrievanceEmpId('');
      setGrievanceSubject('');
      setGrievanceDesc('');
      fetchData();
    } catch (err) {
      alert('Failed to submit grievance');
    }
  };

  const updateGrievanceStatus = async (id: number, status: string) => {
    try {
      await fetchApi(`/grievances/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      fetchData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const expiringCerts = certifications.filter(c => {
    const daysLeft = (new Date(c.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
    return daysLeft > 0 && daysLeft <= 30; // Expiring in next 30 days
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="bg-blue-100 p-2 rounded-lg">
          <Shield className="text-blue-600 h-6 w-6" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">HR & Compliance Portal</h2>
          <p className="text-sm text-gray-500">Manage departmental training certifications and resolve employee grievances</p>
        </div>
      </div>

      {expiringCerts.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="text-yellow-600 h-5 w-5" />
            <h3 className="text-yellow-800 font-bold">Certification Expiry Alerts ({expiringCerts.length})</h3>
          </div>
          <div className="space-y-1">
            {expiringCerts.map(cert => (
              <p key={cert.id} className="text-sm text-yellow-700">
                <span className="font-semibold">{cert.employeeName}</span> - {cert.name} (Expires: {new Date(cert.expiryDate).toLocaleDateString()})
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button 
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'certifications' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('certifications')}
          >
            Training & Certifications
          </button>
          <button 
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === 'grievances' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('grievances')}
          >
            Grievances & Ticketing
          </button>
        </div>

        <div className="p-0">
          {activeTab === 'certifications' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
              <div className="p-6 lg:col-span-1">
                <h3 className="font-bold text-gray-900 mb-4">Add Certification</h3>
                <form onSubmit={handleAddCert} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                    <select required value={certEmpId} onChange={e => setCertEmpId(e.target.value)} className="w-full border-gray-300 border rounded-lg p-2">
                      <option value="">Select Employee...</option>
                      {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.position})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Certification Name</label>
                    <input type="text" required placeholder="e.g., Forklift Safety" value={certName} onChange={e => setCertName(e.target.value)} className="w-full border-gray-300 border rounded-lg p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                    <input type="date" required value={certIssue} onChange={e => setCertIssue(e.target.value)} className="w-full border-gray-300 border rounded-lg p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                    <input type="date" required value={certExpiry} onChange={e => setCertExpiry(e.target.value)} className="w-full border-gray-300 border rounded-lg p-2" />
                  </div>
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg">Log Certification</button>
                </form>
              </div>
              <div className="p-0 lg:col-span-2 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Certification</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Validity</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {certifications.map(c => (
                      <tr key={c.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.employeeName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{c.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(c.issueDate).toLocaleDateString()} - {new Date(c.expiryDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${c.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {certifications.length === 0 && (
                      <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No certifications recorded.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'grievances' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
              <div className="p-6 lg:col-span-1 bg-gray-50">
                <h3 className="font-bold text-gray-900 mb-4">Submit New Ticket</h3>
                <form onSubmit={handleAddGrievance} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                    <select required value={grievanceEmpId} onChange={e => setGrievanceEmpId(e.target.value)} className="w-full border-gray-300 border rounded-lg p-2 bg-white">
                      <option value="">Select Employee...</option>
                      {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input type="text" required placeholder="e.g., Shift dispute, Wage query" value={grievanceSubject} onChange={e => setGrievanceSubject(e.target.value)} className="w-full border-gray-300 border rounded-lg p-2 bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea required rows={4} value={grievanceDesc} onChange={e => setGrievanceDesc(e.target.value)} className="w-full border-gray-300 border rounded-lg p-2 bg-white"></textarea>
                  </div>
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg">Submit Ticket</button>
                </form>
              </div>
              
              <div className="p-6 lg:col-span-2">
                <h3 className="font-bold text-gray-900 mb-4">Active & Resolved Tickets</h3>
                <div className="space-y-4">
                  {grievances.map(g => (
                    <div key={g.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-gray-900">{g.subject}</h4>
                          <p className="text-sm text-gray-500">From: <span className="font-medium text-gray-700">{g.employeeName}</span> • {new Date(g.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          g.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                          g.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                          g.status === 'Under Review' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {g.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-3 mb-4 bg-gray-50 p-3 rounded">{g.description}</p>
                      
                      <div className="flex gap-2">
                        <select 
                          className="text-sm border-gray-300 border rounded-lg p-1.5"
                          value={g.status}
                          onChange={(e) => updateGrievanceStatus(g.id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Under Review">Under Review</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </div>
                    </div>
                  ))}
                  {grievances.length === 0 && (
                    <div className="text-center text-gray-500 py-8">No tickets found.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
