import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Briefcase, ChevronRight, X, Clock, Award, Users, Radio, Link as LinkIcon, Building2 } from 'lucide-react';
import { fetchApi } from '../lib/api';

export function LeadershipScreen() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeader, setSelectedLeader] = useState<any | null>(null);

  useEffect(() => {
    fetchApi('/management')
      .then(res => setLeaders(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getDepartmentColor = (role: string) => {
    if (role.includes('Director') || role.includes('Owner')) return 'bg-purple-100 text-purple-700 border-purple-200';
    if (role.includes('HR')) return 'bg-pink-100 text-pink-700 border-pink-200';
    if (role.includes('Finance')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (role.includes('Operations')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (role.includes('Logistics') || role.includes('Transport')) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Warehouse Leadership & Management</h2>
          <p className="text-gray-500 mt-1">Executive directory and core operational administration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-400">Loading leadership directory...</div>
        ) : (
          leaders.map(leader => (
            <div key={leader.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xl font-bold border-2 border-white shadow-sm ring-2 ring-indigo-50">
                    {leader.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> On Duty
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 leading-tight">{leader.name}</h3>
                <p className="text-gray-500 text-sm font-medium mt-1 mb-3">{leader.role}</p>
                <div className={`inline-flex px-2 py-1 rounded text-xs font-bold border ${getDepartmentColor(leader.role)} mb-4`}>
                  Management Team
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-gray-400" />
                    <span className="truncate">{leader.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-400" />
                    <span>{leader.mobile}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-gray-400" />
                    <span className="truncate">{leader.officeLocation}</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-100 bg-gray-50 p-4 flex gap-2">
                <button 
                  onClick={() => setSelectedLeader(leader)}
                  className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  View Profile <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedLeader && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Executive Profile</h3>
              <button onClick={() => setSelectedLeader(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-3xl font-bold shadow-sm border border-indigo-200">
                  {selectedLeader.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedLeader.name}</h2>
                  <p className="text-lg text-indigo-600 font-medium">{selectedLeader.role}</p>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Contact</div>
                      <div className="flex items-center gap-2 text-sm text-gray-800 font-medium mb-1"><Phone size={14} className="text-indigo-500"/> {selectedLeader.mobile}</div>
                      <div className="flex items-center gap-2 text-sm text-gray-800 font-medium"><Mail size={14} className="text-indigo-500"/> {selectedLeader.email}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Location</div>
                      <div className="flex items-center gap-2 text-sm text-gray-800 font-medium"><Building2 size={14} className="text-indigo-500"/> {selectedLeader.officeLocation}</div>
                      <div className="flex items-center gap-2 text-sm text-gray-800 font-medium mt-1"><Radio size={14} className="text-indigo-500"/> CH-{Math.floor(Math.random() * 9) + 1} (Internal)</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 border-t border-gray-100 pt-6">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2"><Award size={16} className="text-indigo-500"/> Core Responsibilities</h4>
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-sm text-gray-700 leading-relaxed">
                  {selectedLeader.responsibilities}
                </div>
              </div>
              
              <div className="mt-6 border-t border-gray-100 pt-6">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2"><Briefcase size={16} className="text-indigo-500"/> Professional Background</h4>
                <ul className="space-y-3">
                  <li className="flex gap-3 text-sm">
                    <div className="mt-0.5"><Clock size={16} className="text-gray-400" /></div>
                    <div>
                      <p className="font-bold text-gray-800">Joined Organization</p>
                      <p className="text-gray-500">{new Date(selectedLeader.dateOfJoining).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </li>
                  <li className="flex gap-3 text-sm">
                    <div className="mt-0.5"><Award size={16} className="text-gray-400" /></div>
                    <div>
                      <p className="font-bold text-gray-800">Experience</p>
                      <p className="text-gray-500">{Math.floor(Math.random() * 10) + 5}+ Years in Logistics & Supply Chain</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedLeader(null)}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors shadow-sm"
              >
                Close Profile
              </button>
              <a href={`mailto:${selectedLeader.email}`} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2">
                <Mail size={16} /> Send Email
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
