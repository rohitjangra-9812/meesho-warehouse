import React, { useState, useEffect, useMemo } from 'react';
import { fetchApi } from '../lib/api.ts';
import { FileText, Send, BadgeCheck, Loader2, Download } from 'lucide-react';

interface Notice {
  id: number;
  serialNumber: string;
  recipient: string;
  subject: string;
  body: string;
  createdAt: string;
}

const meeshoWatermarkSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><text x="200" y="100" font-family="Arial" font-size="40" font-weight="bold" fill="rgba(0,0,0,0.03)" text-anchor="middle" transform="rotate(-30, 200, 100)">MEESHO WAREHOUSE</text></svg>`;

interface Employee {
  id: number;
  name: string;
  position: string;
}

export function NoticesScreen() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Draft state
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [noticesData, employeesData] = await Promise.all([
        fetchApi('/notices'),
        fetchApi('/employees')
      ]);
      setNotices(noticesData);
      setEmployees(employeesData);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  const departments = useMemo(() => {
    const depts = new Set<string>();
    employees.forEach(emp => depts.add(emp.position));
    return Array.from(depts);
  }, [employees]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !subject || !body) return;
    
    try {
      setSubmitting(true);
      const newNotice = await fetchApi('/notices', {
        method: 'POST',
        body: JSON.stringify({ recipient, subject, body })
      });
      setNotices([newNotice, ...notices]);
      setRecipient('');
      setSubject('');
      setBody('');
    } catch (error) {
      console.error('Error creating notice', error);
      alert('Failed to issue letter.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const downloadPdf = (notice: Notice) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${notice.serialNumber || 'Notice'}</title>
          <style>
            body { font-family: 'Arial', sans-serif; padding: 40px; color: #1f2937; position: relative; }
            .watermark { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-image: url('${meeshoWatermarkSvg}'); background-repeat: repeat; opacity: 0.5; z-index: -1; pointer-events: none; }
            .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
            .company { font-size: 24px; font-weight: bold; color: #111827; letter-spacing: 1px; }
            .address { font-size: 12px; color: #6b7280; margin-top: 5px; }
            .meta { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 30px; }
            .meta div { display: flex; flex-direction: column; gap: 5px; }
            .label { font-size: 11px; text-transform: uppercase; color: #6b7280; letter-spacing: 0.5px; }
            .value { font-weight: 600; }
            .subject { font-size: 18px; font-weight: bold; margin-bottom: 20px; }
            .body { font-size: 15px; line-height: 1.6; white-space: pre-wrap; margin-bottom: 50px; }
            .signature-block { margin-top: 50px; border-top: 1px solid #e5e7eb; padding-top: 20px; display: inline-block; }
            .signer-name { font-weight: bold; font-size: 16px; }
            .signer-title { font-size: 12px; color: #6b7280; text-transform: uppercase; margin-top: 4px; }
            .verified { margin-top: 10px; display: inline-block; background: #eff6ff; color: #1d4ed8; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; border: 1px solid #bfdbfe; }
          </style>
        </head>
        <body>
          <div class="watermark"></div>
          <div class="header">
            <div class="company">MEESHO WAREHOUSE PVT. LTD.</div>
            <div class="address">HQ - Gurugram, Haryana | Official Communication</div>
          </div>
          
          <div class="meta">
            <div>
              <span class="label">Serial No.</span>
              <span class="value">${notice.serialNumber || 'Pending'}</span>
            </div>
            <div style="text-align: right;">
              <span class="label">Date</span>
              <span class="value">${formatDate(notice.createdAt)}</span>
            </div>
          </div>

          <div class="meta" style="margin-bottom: 40px;">
            <div>
              <span class="label">To</span>
              <span class="value">${notice.recipient}</span>
            </div>
          </div>

          <div class="subject">Subject: ${notice.subject}</div>
          
          <div class="body">${notice.body}</div>

          <div class="signature-block">
            <div class="signer-name">Insp Rohit Jangra</div>
            <div class="signer-title">Warehouse Owner / Managing Director</div>
            <div class="verified">✓ Cryptographically Verified Signature</div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative z-0">
      <div 
        className="absolute inset-0 pointer-events-none z-[-1] opacity-5"
        style={{ backgroundImage: `url('${meeshoWatermarkSvg}')`, backgroundRepeat: 'repeat', backgroundSize: '400px 200px' }}
      ></div>

      <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="bg-blue-100 p-2 rounded-lg">
          <FileText className="text-blue-600 h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Notices & Letters</h2>
          <p className="text-sm text-gray-500">Draft and issue official company letters</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Draft Module */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-4">Draft New Letter</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Template Header Preview */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 text-center">
              <h4 className="font-bold text-gray-900 tracking-wider">MEESHO WAREHOUSE PVT. LTD.</h4>
              <p className="text-xs text-gray-500 mt-1">HQ - Gurugram, Haryana</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recipient (Department or Individual)</label>
              <select 
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              >
                <option value="">Select Recipient...</option>
                <optgroup label="Departments">
                  {departments.map(dept => (
                    <option key={dept} value={`Department: ${dept}`}>{dept} Department</option>
                  ))}
                  <option value="All Staff">All Staff</option>
                </optgroup>
                <optgroup label="Individuals">
                  {employees.map(emp => (
                    <option key={emp.id} value={`${emp.name} (${emp.position})`}>{emp.name}</option>
                  ))}
                </optgroup>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input 
                type="text" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                placeholder="e.g., Policy Update, Warning, Appreciation"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Body Text</label>
              <textarea 
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                rows={6}
                placeholder="Write the contents of the official letter here..."
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              />
            </div>

            {/* Signature Block */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 mt-6 flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-gray-900">Insp Rohit Jangra</p>
                <p className="text-xs text-gray-600">Warehouse Owner / Managing Director</p>
              </div>
              <div className="flex items-center gap-1.5 text-blue-700 bg-blue-100 px-2 py-1 rounded text-xs font-medium border border-blue-200">
                <BadgeCheck className="w-4 h-4" />
                Verified Signature
              </div>
            </div>

            <div className="pt-4 border-t">
              <button 
                type="submit" 
                disabled={submitting || !recipient || !subject || !body}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Issue Official Letter
              </button>
            </div>
          </form>
        </div>

        {/* Issued Letters */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-4">Issued Letters Directory</h3>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4" style={{ maxHeight: '600px' }}>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              </div>
            ) : notices.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>No official letters have been issued yet.</p>
              </div>
            ) : (
              notices.map(notice => (
                <div key={notice.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:border-blue-300 transition-colors">
                  {/* Letter Header */}
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-900">{notice.subject}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">To: <span className="font-medium text-gray-700">{notice.recipient}</span></p>
                      {notice.serialNumber && (
                        <p className="text-[10px] text-gray-500 font-mono mt-1 bg-gray-200 inline-block px-1.5 py-0.5 rounded">S.No: {notice.serialNumber}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-4">{formatDate(notice.createdAt)}</span>
                      <button 
                        onClick={() => downloadPdf(notice)}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        Download PDF
                      </button>
                    </div>
                  </div>
                  
                  {/* Letter Body */}
                  <div className="p-4 text-sm text-gray-700 whitespace-pre-wrap">
                    {notice.body}
                  </div>
                  
                  {/* Letter Footer (Signature) */}
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                     <div>
                       <p className="text-xs font-semibold text-gray-800">Insp Rohit Jangra</p>
                       <p className="text-[10px] text-gray-500 uppercase tracking-wider">Managing Director</p>
                     </div>
                     <BadgeCheck className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
