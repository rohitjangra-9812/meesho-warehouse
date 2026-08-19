const fs = require('fs');
let code = fs.readFileSync('src/components/EmployeeScreen.tsx', 'utf8');

if (!code.includes('<th className="px-6 py-3">Agreement</th>')) {
  code = code.replace('<th className="px-6 py-3">Status</th>', '<th className="px-6 py-3">Status</th>\n                <th className="px-6 py-3 text-center">Agreement</th>');
}

const actionBlockRegex = /<td className="px-6 py-4">[\s\S]*?<\/span>\s*<\/td>/;
const actionBlockStr = code.match(actionBlockRegex);
if (actionBlockStr && !code.includes('<td className="px-6 py-4 text-center">')) {
  const injection = `
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => setViewAgreement(emp)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors border border-blue-200 shadow-sm whitespace-nowrap">
                      <FileText size={14} /> View Contract
                    </button>
                  </td>`;
  code = code.replace(actionBlockStr[0], actionBlockStr[0] + injection);
}

// Remove the old icon button
code = code.replace(/<button onClick=\{\(\) => setViewAgreement\(emp\)\} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="View Agreement">[\s\S]*?<\/button>/, '');

fs.writeFileSync('src/components/EmployeeScreen.tsx', code);
console.log("Patched emp");
