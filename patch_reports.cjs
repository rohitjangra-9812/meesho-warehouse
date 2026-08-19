const fs = require('fs');
let code = fs.readFileSync('src/components/AIOperationsScreen.tsx', 'utf8');

// Update activeTab type
code = code.replace(
  "useState<'slotting' | 'routing' | 'vision' | 'labor' | 'yard' | 'twin' | 'maintenance' | 'copilot'>('slotting')",
  "useState<'slotting' | 'routing' | 'vision' | 'labor' | 'yard' | 'twin' | 'maintenance' | 'copilot' | 'reports'>('slotting')"
);

// Add state for reports
const states = `
  const [reportEmails, setReportEmails] = useState<string[]>(['management@warehouse.com', 'operations@warehouse.com']);
  const [newEmail, setNewEmail] = useState('');
  const [reportTime, setReportTime] = useState('18:00');
  const [schedules, setSchedules] = useState<any[]>([
    { id: 1, type: 'Daily Performance Summary', time: '18:00', format: 'PDF', emails: ['management@warehouse.com'], active: true }
  ]);
`;
if (!code.includes('setReportEmails')) {
  code = code.replace("const [chatQuery, setChatQuery] = useState('');", states + "\n  const [chatQuery, setChatQuery] = useState('');");
}

// Add the button to the nav
const button = `
          <button 
            onClick={() => setActiveTab('reports')}
            className={\`px-6 py-2 text-sm font-semibold rounded-md transition-colors flex items-center gap-2 \${
              activeTab === 'reports' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }\`}
          >
            <BarChart3 size={16} /> Automated Reports
          </button>
        </div>
      </div>
`;
code = code.replace('</div>\n      </div>\n      {activeTab === \'slotting\' && (', button + '      {activeTab === \'slotting\' && (');


// Add the UI section
const ui = `
      {activeTab === 'reports' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Active Schedules</h3>
                  <p className="text-sm text-gray-500">Manage your automated report generation and delivery.</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4">Report Type</th>
                      <th className="px-6 py-4">Schedule Time</th>
                      <th className="px-6 py-4">Recipients</th>
                      <th className="px-6 py-4">Format</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {schedules.map(sch => (
                      <tr key={sch.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-bold text-gray-900">{sch.type}</td>
                        <td className="px-6 py-4 text-gray-600 flex items-center gap-2"><Clock size={14}/> {sch.time} Daily</td>
                        <td className="px-6 py-4 text-gray-600">{sch.emails.length} Addresses</td>
                        <td className="px-6 py-4 text-red-600 font-bold">{sch.format}</td>
                        <td className="px-6 py-4">
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Active</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Send size={18} className="text-blue-600" /> New Schedule</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Report Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50">
                    <option>Daily Performance Summary</option>
                    <option>End of Shift Yield</option>
                    <option>Predictive Maintenance Log</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Time (24H)</label>
                  <input type="time" value={reportTime} onChange={(e) => setReportTime(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50" />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Add Recipient Email</label>
                  <div className="flex gap-2">
                    <input 
                      type="email" 
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="manager@company.com" 
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" 
                    />
                    <button 
                      onClick={() => {
                        if (newEmail.includes('@')) {
                          setReportEmails([...reportEmails, newEmail]);
                          setNewEmail('');
                        }
                      }}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-sm"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="mt-4 border border-gray-200 rounded-lg p-3 bg-gray-50 max-h-40 overflow-y-auto">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Mailing List ({reportEmails.length})</span>
                  <div className="space-y-2">
                    {reportEmails.map((email, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm bg-white p-2 border border-gray-100 rounded shadow-sm">
                        <span className="text-gray-700 truncate">{email}</span>
                        <button onClick={() => setReportEmails(reportEmails.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700">
                          <AlertCircle size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setSchedules([...schedules, { id: Date.now(), type: 'Daily Performance Summary', time: reportTime, format: 'PDF', emails: reportEmails, active: true }]);
                    alert("Schedule Saved! Daily PDF reports will be sent at " + reportTime);
                  }}
                  className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={16} /> Save Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
`;

if (!code.includes("activeTab === 'reports'")) {
  code = code + '\n' + ui;
  // We should insert it right before the last closing div of the component.
  // Actually, better to insert it before the final `    </div>\n  );\n}`
  code = code.replace(ui, ''); // remove from end
  const insertionPoint = code.lastIndexOf('</div>\n  );\n}');
  code = code.slice(0, insertionPoint) + ui + code.slice(insertionPoint);
}

fs.writeFileSync('src/components/AIOperationsScreen.tsx', code);
console.log("Patched reports");
