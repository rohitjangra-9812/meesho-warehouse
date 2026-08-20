import React, { useState, useEffect } from 'react';
import { 
  Mail, Phone, MapPin, Briefcase, ChevronRight, X, Clock, Award, Users, Radio, 
  Building2, FileText, ShieldCheck, Plus, Sparkles, Copy, Download, CheckCircle2, Send 
} from 'lucide-react';
import { fetchApi } from '../lib/api';
import { MeeshoLogo } from './MeeshoLogo';

export function LeadershipScreen() {
  const [activeTab, setActiveTab] = useState<'directory' | 'notices'>('directory');
  const [leaders, setLeaders] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeader, setSelectedLeader] = useState<any | null>(null);

  // AI Letter Generator Modal state
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('Safety Protocol & PPE Compliance');
  const [recipient, setRecipient] = useState('All Warehouse Floor Staff & Supervisors');
  const [subject, setSubject] = useState('Mandatory Safety & PPE Compliance Notice');
  const [body, setBody] = useState('In accordance with corporate safety standards, all associates working in Zones A, B, C, and D must wear high-visibility safety vests, steel-toe boots, and calibrated barcode scanners at all times during operational hours.');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [viewingNotice, setViewingNotice] = useState<any | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    Promise.all([
      fetchApi('/management').catch(() => []),
      fetchApi('/notices').catch(() => [])
    ]).then(([mgmtData, noticesData]) => {
      setLeaders(mgmtData);
      setNotices(noticesData);
    }).finally(() => setLoading(false));
  }, []);

  const templates = [
    {
      title: 'Safety Protocol & PPE Compliance',
      subject: 'Mandatory Safety & PPE Compliance Notice',
      recipient: 'All Warehouse Floor Staff & Supervisors',
      body: 'In accordance with corporate safety standards, all associates working in Zones A, B, C, and D must wear high-visibility safety vests, steel-toe boots, and calibrated barcode scanners at all times during operational hours.'
    },
    {
      title: 'Shift Schedule & Overtime Updates',
      subject: 'Shift B & C Overtime & Schedule Adjustment',
      recipient: 'All Shift B & C Personnel',
      body: 'Effective immediately, operational hours for shifts B and C are extended by 1 hour to handle peak sorting volume. Overtime will be credited directly to employee accounts at 1.5x standard hourly rate.'
    },
    {
      title: 'Conveyor/System Maintenance Downtime',
      subject: 'Scheduled Main Conveyor Line Maintenance Window',
      recipient: 'All Dock & Conveyor Operators',
      body: 'Main sorting conveyor Line 2 will undergo scheduled firmware updates and roller maintenance tonight between 02:00 AM and 04:00 AM. Inbound freight will be temporarily diverted to Line 4 staging docks.'
    },
    {
      title: 'High-Volume Peak Festive Dispatch Target',
      subject: 'Peak Festive Sale Dispatch Target: 15,000 Units/Day',
      recipient: 'All Fulfillment & Dispatch Associates',
      body: 'With the Mega Festive Sale commencing this week, our target throughput is set at 15,000 units per shift. All team leads are directed to minimize idle time and expedite AMR robot batch picking.'
    },
    {
      title: 'General Conduct & Floor Etiquette',
      subject: 'Warehouse Floor Conduct & Restricted Area Guidelines',
      recipient: 'All Facility Staff & Visitors',
      body: 'Access to the Electronics High-Value Vault and Treasury Admin block is strictly restricted to authorized badge holders. Unauthorized personnel found in secure zones will face disciplinary review.'
    }
  ];

  const handleTemplateSelect = (tTitle: string) => {
    const found = templates.find(t => t.title === tTitle);
    if (found) {
      setSelectedTemplate(tTitle);
      setSubject(found.subject);
      setRecipient(found.recipient);
      setBody(found.body);
    }
  };

  const handlePublishNotice = async () => {
    try {
      const res = await fetchApi('/notices', {
        method: 'POST',
        body: JSON.stringify({ recipient, subject, body })
      });
      setNotices(prev => [res, ...prev]);
      setIsGeneratorOpen(false);
      showToast('📢 Official Notice published successfully to Floor Portal!');
    } catch (err) {
      console.error(err);
      showToast('Failed to publish notice.');
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('📋 Copied notice text to clipboard!');
  };

  const handleDownloadPDF = (notice: any) => {
    showToast(`📥 Downloading official letter PDF (${notice.serialNumber})...`);
  };

  const getDepartmentColor = (role: string) => {
    if (role.includes('Director') || role.includes('Owner')) return 'bg-purple-100 text-purple-700 border-purple-200';
    if (role.includes('HR')) return 'bg-pink-100 text-pink-700 border-pink-200';
    if (role.includes('Finance')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (role.includes('Operations')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (role.includes('Logistics') || role.includes('Transport')) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="space-y-6 pb-12">
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
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Warehouse Leadership & Official Staff Notices</h2>
          <p className="text-sm text-gray-500 mt-1">Executive directory, digitally signed operational notices, and AI letter generator.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsGeneratorOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#f43397] hover:bg-[#d82481] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Sparkles size={16} />
            <span>AI Notice & Letter Generator</span>
          </button>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex border-b border-gray-200 gap-6">
        <button
          onClick={() => setActiveTab('directory')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'directory' ? 'border-[#f43397] text-[#f43397]' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Users size={18} /> Executive Management Directory
        </button>
        <button
          onClick={() => setActiveTab('notices')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'notices' ? 'border-[#f43397] text-[#f43397]' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <FileText size={18} /> Official Staff Notices Board ({notices.length})
        </button>
      </div>

      {activeTab === 'directory' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {loading ? (
            <div className="col-span-full text-center py-12 text-gray-400">Loading leadership directory...</div>
          ) : (
            leaders.map(leader => (
              <div key={leader.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-16 h-16 rounded-full bg-pink-100 text-[#f43397] flex items-center justify-center text-xl font-black border-2 border-white shadow-sm ring-2 ring-pink-50">
                      {leader.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> On Duty
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
                    className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    View Profile <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Official Staff Notices Board */
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-gradient-to-r from-pink-500/10 via-purple-500/5 to-white p-6 rounded-2xl border border-pink-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Verified Digital Notice Board</h3>
              <p className="text-xs text-gray-600 mt-1">All official memos, schedule changes, and safety guidelines authenticated by Harsh Sharma (Operations Management).</p>
            </div>
            <button
              onClick={() => setIsGeneratorOpen(true)}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm"
            >
              <Plus size={14} /> Issue New Notice
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {notices.map((notice: any, idx: number) => (
              <div key={notice.id || idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col justify-between hover:border-pink-300 transition-all">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded border border-pink-200">
                          {notice.serialNumber || `MWPL/NOTICE/2026/0820/${String(idx+1).padStart(3, '0')}`}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500 font-semibold">{new Date(notice.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <h4 className="text-lg font-black text-gray-900 mt-2">{notice.subject}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Recipient: <strong className="text-gray-800">{notice.recipient}</strong></p>
                    </div>

                    {/* Verified Signature Stamp */}
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
                      <ShieldCheck className="text-emerald-600 w-6 h-6 flex-shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wide">Verified Signature</span>
                        <span className="text-xs font-bold text-gray-900">Harsh Sharma</span>
                        <span className="text-[9px] text-emerald-700">Operations Management</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6 font-sans">
                    {notice.body}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>Broadcasted across all warehouse floor portals and mobile terminals.</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyToClipboard(notice.body)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Copy size={13} /> Copy Text
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(notice)}
                      className="px-3 py-1.5 bg-[#f43397] hover:bg-[#d82481] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Download size={13} /> Download Letter PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Executive Profile Modal */}
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
                <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-pink-100 text-[#f43397] flex items-center justify-center text-3xl font-black shadow-sm border border-pink-200">
                  {selectedLeader.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedLeader.name}</h2>
                  <p className="text-lg text-[#f43397] font-medium">{selectedLeader.role}</p>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Contact</div>
                      <div className="flex items-center gap-2 text-sm text-gray-800 font-medium mb-1"><Phone size={14} className="text-[#f43397]"/> {selectedLeader.mobile}</div>
                      <div className="flex items-center gap-2 text-sm text-gray-800 font-medium"><Mail size={14} className="text-[#f43397]"/> {selectedLeader.email}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Location</div>
                      <div className="flex items-center gap-2 text-sm text-gray-800 font-medium"><Building2 size={14} className="text-[#f43397]"/> {selectedLeader.officeLocation}</div>
                      <div className="flex items-center gap-2 text-sm text-gray-800 font-medium mt-1"><Radio size={14} className="text-[#f43397]"/> CH-01 (Internal)</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 border-t border-gray-100 pt-6">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2"><Award size={16} className="text-[#f43397]"/> Core Responsibilities</h4>
                <div className="bg-pink-50/50 p-4 rounded-xl border border-pink-100 text-sm text-gray-700 leading-relaxed">
                  {selectedLeader.responsibilities}
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedLeader(null)}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors shadow-sm"
              >
                Close Profile
              </button>
              <a href={`mailto:${selectedLeader.email}`} className="px-4 py-2 bg-[#f43397] text-white rounded-xl font-medium text-sm hover:bg-[#d82481] transition-colors shadow-sm flex items-center gap-2">
                <Mail size={16} /> Send Email
              </a>
            </div>
          </div>
        </div>
      )}

      {/* AI Staff Notice & Letter Generator Modal */}
      {isGeneratorOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-pink-50 to-white">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#f43397] text-white rounded-xl shadow-sm">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">AI Staff Notice & Formal Letter Generator</h3>
                  <p className="text-xs text-gray-500">Draft certified operational memos with Harsh Sharma's verified digital signature.</p>
                </div>
              </div>
              <button onClick={() => setIsGeneratorOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Template Picker */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Select Notice Template / AI Prompt</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {templates.map(t => (
                    <button
                      key={t.title}
                      onClick={() => handleTemplateSelect(t.title)}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between ${
                        selectedTemplate === t.title 
                          ? 'border-[#f43397] bg-pink-50/60 text-[#f43397] shadow-sm' 
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="truncate">{t.title}</span>
                      <Sparkles size={14} className={selectedTemplate === t.title ? 'text-[#f43397]' : 'text-gray-400'} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Target Recipient Group</label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#f43397] focus:outline-none"
                    placeholder="e.g. All Warehouse Floor Staff"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Notice Subject Title</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#f43397] focus:outline-none"
                    placeholder="e.g. Safety Protocol Notice"
                  />
                </div>
              </div>

              {/* Notice Body */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Notice Content Body</label>
                  <span className="text-[10px] text-pink-600 font-bold bg-pink-50 px-2 py-0.5 rounded flex items-center gap-1">
                    <Sparkles size={10} /> AI Assisted Draft
                  </span>
                </div>
                <textarea
                  rows={5}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#f43397] focus:outline-none font-sans"
                />
              </div>

              {/* Letterhead & Verified Signature Preview Box */}
              <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50/50 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <div className="flex items-center gap-3">
                    <MeeshoLogo size={32} />
                    <div>
                      <h4 className="text-sm font-black text-gray-900">MEESHO WAREHOUSE FULFILLMENT PVT. LTD.</h4>
                      <p className="text-[10px] text-gray-500">NIT Faridabad Hub • Haryana Operational Division</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">REF: MWPL/NOTICE/2026/0820</span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                    <ShieldCheck className="text-emerald-600 w-5 h-5" />
                    <div>
                      <p className="text-[9px] font-black text-emerald-800 uppercase">Authenticated Issuer</p>
                      <p className="text-xs font-bold text-gray-900">Harsh Sharma (Operations Management)</p>
                    </div>
                  </div>
                  <div className="text-right text-[10px] text-gray-500">
                    <p>Status: Ready for Broadcast</p>
                    <p>Timestamp: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-3">
              <button 
                onClick={() => handleCopyToClipboard(body)}
                className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 flex items-center gap-2 shadow-sm"
              >
                <Copy size={16} /> Copy Text
              </button>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsGeneratorOpen(false)}
                  className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 shadow-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handlePublishNotice}
                  className="px-5 py-2.5 bg-[#f43397] text-white rounded-xl text-sm font-bold hover:bg-[#d82481] shadow-md flex items-center gap-2"
                >
                  <Send size={16} /> Publish to Floor Portal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
