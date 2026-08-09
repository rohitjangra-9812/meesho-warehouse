import React, { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api.ts';
import { Briefcase, Building2, Phone, Mail, Calendar } from 'lucide-react';

interface Leader {
  id: number;
  name: string;
  role: string;
  mobile: string;
  email: string;
  officeLocation: string;
  responsibilities: string;
  dateOfJoining: string;
}

export function ManagementScreen() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchManagement = async () => {
    try {
      setLoading(true);
      const data = await fetchApi('/management');
      setLeaders(data);
    } catch (err) {
      console.error('Failed to load management directory', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagement();
  }, []);

  const handleSeed = async () => {
    try {
      setLoading(true);
      await fetchApi('/management/seed', { method: 'POST' });
      await fetchManagement();
      alert("Successfully seeded management directory!");
    } catch (err) {
      alert("Failed to seed management directory");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <Briefcase className="text-indigo-600 h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Leadership & Management</h2>
            <p className="text-sm text-gray-500">Warehouse Operations Directory</p>
          </div>
        </div>
        <button 
          onClick={handleSeed}
          disabled={loading}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          Seed Directory
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leaders.map(leader => (
          <div key={leader.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">{leader.name}</h3>
              <p className="text-sm font-semibold text-indigo-600 mt-1">{leader.role}</p>
            </div>
            
            <div className="space-y-3 mb-6 flex-1">
              {leader.dateOfJoining && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span className="text-sm text-gray-700">Appointed: <span className="font-medium">{new Date(leader.dateOfJoining).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></span>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                <span className="text-sm text-gray-700 font-medium">{leader.mobile}</span>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                <span className="text-sm text-gray-700">{leader.email}</span>
              </div>
              <div className="flex items-start gap-3">
                <Building2 className="w-4 h-4 text-gray-400 mt-0.5" />
                <span className="text-sm text-gray-700">{leader.officeLocation}</span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 mt-auto">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Responsibilities</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{leader.responsibilities}</p>
            </div>
          </div>
        ))}
        {leaders.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-200">
            No management records found.
          </div>
        )}
      </div>
    </div>
  );
}
