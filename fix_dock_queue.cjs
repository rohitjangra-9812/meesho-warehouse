const fs = require('fs');
let code = fs.readFileSync('src/components/DockScreen.tsx', 'utf8');

// 1. Import ArrowUp
code = code.replace("RefreshCw, List } from 'lucide-react';", "RefreshCw, List, ArrowUp } from 'lucide-react';");

// 2. Add handlePrioritize function
const prioritizeFn = `  const handlePrioritize = async (vehicleNo: string) => {
    try {
      await fetchApi('/v3/docks/queue/prioritize', {
        method: 'POST',
        body: JSON.stringify({ vehicleNo })
      });
      fetchDocks();
    } catch(e) {
      console.error(e);
    }
  };
`;
code = code.replace("  const handleSimulate = async () => {", prioritizeFn + "\n  const handleSimulate = async () => {");

// 3. Add prioritize button to queue items
const btnHtml = `
                   <div className="flex justify-between items-center ml-2">
                     <span className="font-bold text-gray-900">{q.vehicleNo}</span>
                     <span className="text-xs font-bold text-blue-700 px-2 py-0.5 bg-blue-100 rounded-full">Queue #{idx + 1}</span>
                   </div>
                   <div className="text-xs text-gray-600 flex items-center gap-1 ml-2 mt-1"><Package size={12} className="text-gray-400"/> {q.material}</div>
                   <div className="text-xs text-gray-600 flex items-center gap-1 ml-2"><Truck size={12} className="text-gray-400"/> {q.vehicleType}</div>
                   {idx > 0 && (
                     <button 
                       onClick={() => handlePrioritize(q.vehicleNo)} 
                       className="absolute bottom-3 right-3 p-1.5 bg-white border border-blue-200 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
                       title="Prioritize to Next in Queue"
                     >
                       <ArrowUp size={14} />
                     </button>
                   )}
`;

const oldHtmlRegex = /<div className="flex justify-between items-center ml-2">\s*<span className="font-bold text-gray-900">\{q.vehicleNo\}<\/span>\s*<span className="text-xs font-bold text-blue-700 px-2 py-0\.5 bg-blue-100 rounded-full">Queue #\{idx \+ 1\}<\/span>\s*<\/div>\s*<div className="text-xs text-gray-600 flex items-center gap-1 ml-2 mt-1"><Package size=\{12\} className="text-gray-400"\/> \{q.material\}<\/div>\s*<div className="text-xs text-gray-600 flex items-center gap-1 ml-2"><Truck size=\{12\} className="text-gray-400"\/> \{q.vehicleType\}<\/div>/;

code = code.replace(oldHtmlRegex, btnHtml);

fs.writeFileSync('src/components/DockScreen.tsx', code);
