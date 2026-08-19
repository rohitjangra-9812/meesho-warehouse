const fs = require('fs');
let code = fs.readFileSync('src/components/EmployeeScreen.tsx', 'utf8');

// 1. Imports
const importTarget = `import { Users, Info, Plus, Search, Edit2, Trash2, X } from 'lucide-react';`;
const newImport = `import { Users, Info, Plus, Search, Edit2, Trash2, X, FileText, CheckCircle2, Stamp } from 'lucide-react';`;
code = code.replace(importTarget, newImport);

// 2. State
const stateTarget = `  const [editingId, setEditingId] = useState<number | null>(null);`;
const newState = `  const [editingId, setEditingId] = useState<number | null>(null);\n  const [viewAgreement, setViewAgreement] = useState<any | null>(null);`;
code = code.replace(stateTarget, newState);

// 3. Actions Column Button
const tableTarget = `<td className="px-6 py-4 text-right space-x-2">`;
const newTableAction = `<td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => setViewAgreement(emp)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="View Agreement">
                      <FileText size={16} />
                    </button>`;
code = code.replace(tableTarget, newTableAction);

// 4. Modal
const endDivTarget = `    </div>\n  );\n}`;
const agreementModal = `
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
                    <p className="text-sm">Authorized HR: Insp. Rohit Jangra</p>
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
                  The Employer agrees to compensate the Employee with a structured gross monthly remuneration of <strong>₹{viewAgreement.salary?.toLocaleString('en-IN')}</strong>. This salary is subject to standard tax deductions, attendance performance, and operational KPIs evaluated directly by the warehouse management team.
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
                    <span className="font-signature text-3xl text-blue-900 relative z-10 block -rotate-3">Rohit Jangra</span>
                  </div>
                  <div className="border-t border-gray-400 mt-2 pt-2">
                    <p className="font-bold text-gray-900">Insp. Rohit Jangra</p>
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
`;
code = code.replace(endDivTarget, agreementModal + endDivTarget);
fs.writeFileSync('src/components/EmployeeScreen.tsx', code);
