const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Update imports
code = code.replace("Video } from 'lucide-react';", "Video, FileBarChart, FileText } from 'lucide-react';");
code = code.replace("import { SurveillanceScreen } from './components/SurveillanceScreen';", "import { SurveillanceScreen } from './components/SurveillanceScreen';\nimport { ReportsScreen } from './components/ReportsScreen';");

// Update nav items
code = code.replace(
  "{ icon: Video, label: 'CCTV Security', path: '/cctv' }",
  "{ icon: Video, label: 'CCTV Security', path: '/cctv' },\n  { icon: FileBarChart, label: 'Reports & Issuance', path: '/reports' }"
);

// Update route paths
code = code.replace(
  "<Route path=\"/cctv\" element={<SurveillanceScreen />} />",
  "<Route path=\"/cctv\" element={<SurveillanceScreen />} />\n            <Route path=\"/reports\" element={<ReportsScreen />} />"
);

// Update styling & branding
code = code.replace("bg-blue-600 text-white p-2 rounded-lg", "bg-[#f43397] text-white p-2 rounded-lg");
code = code.replace("text-blue-600", "text-[#f43397]");
code = code.replace("text-blue-700", "text-[#f43397]");
code = code.replace("bg-blue-50 text-blue-700", "bg-pink-50 text-[#f43397]");
code = code.replace("WMS Portal", "Meesho WMS");
code = code.replace("text-blue-600", "text-[#f43397]"); // may run multiple times

// Add a faint background watermark
code = code.replace(
  "<main className=\"flex-1 overflow-auto p-6 md:p-8\">",
  `<main className="flex-1 overflow-auto p-6 md:p-8 relative">
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 400 400" className="w-[120%] h-[120%] text-[#f43397]" fill="currentColor">
               <path d="M200 40 L360 120 L360 280 L200 360 L40 280 L40 120 Z" />
               <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="60" fontWeight="bold">meesho</text>
            </svg>
          </div>
          <div className="relative z-10">`
);

// close the relative z-10 div before closing main
code = code.replace(
  "</main>",
  "</div>\n        </main>"
);

fs.writeFileSync('src/App.tsx', code);
