const fs = require('fs');
let code = fs.readFileSync('src/components/EmployeeScreen.tsx', 'utf8');

// Icons
if (!code.includes('Settings')) {
  code = code.replace("import { Users,", "import { Settings, Users,");
}

// State
if (!code.includes('isSettingsModalOpen')) {
  const newStates = `const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [hrSignatoryName, setHrSignatoryName] = useState(() => localStorage.getItem('hrSignatoryName') || 'Rohit Angra');

  useEffect(() => {
    localStorage.setItem('hrSignatoryName', hrSignatoryName);
  }, [hrSignatoryName]);
`;
  code = code.replace("const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);", "const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);\n  " + newStates);
}

// Settings button
const buttonTarget = `<button 
          onClick={openNew}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={16} /> Add New Employee
        </button>`;
const newButtons = `<div className="flex gap-2">
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
        </div>`;
code = code.replace(buttonTarget, newButtons);

// Modal HTML
const settingsModal = `
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
`;
if (!code.includes('HR Admin Settings')) {
  code = code.replace(`    </div>\n  );\n}`, settingsModal + `\n    </div>\n  );\n}`);
}

// Replace Rohit Angra with dynamic state
code = code.replace(/Insp\. Rohit Angra/g, "Insp. {hrSignatoryName}");
code = code.replace(/>Rohit Angra</g, ">{hrSignatoryName}<");

fs.writeFileSync('src/components/EmployeeScreen.tsx', code);
