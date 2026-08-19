const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Import Video icon
code = code.replace(/import \{ \n  LayoutDashboard/g, "import { \n  Video,\n  LayoutDashboard");

// Import SurveillanceScreen
code = code.replace(/import \{ LeadershipScreen \} from '\.\/components\/LeadershipScreen';/g, 
"import { LeadershipScreen } from './components/LeadershipScreen';\nimport { SurveillanceScreen } from './components/SurveillanceScreen';");

// Add to navItems
const navItemsRegex = /\{ icon: ScanBarcode, label: 'Scan Station', path: '\/scanner' \}\n\];/g;
code = code.replace(navItemsRegex, "{ icon: ScanBarcode, label: 'Scan Station', path: '/scanner' },\n  { icon: Video, label: 'CCTV Security', path: '/cctv' }\n];");

// Add Route
const routesRegex = /<Route path="\/scanner" element=\{<ProtectedRoute><DashboardLayout><ScannerScreen \/><\/DashboardLayout><\/ProtectedRoute>\} \/>/g;
code = code.replace(routesRegex, '<Route path="/scanner" element={<ProtectedRoute><DashboardLayout><ScannerScreen /></DashboardLayout></ProtectedRoute>} />\n          <Route path="/cctv" element={<ProtectedRoute><DashboardLayout><SurveillanceScreen /></DashboardLayout></ProtectedRoute>} />');

fs.writeFileSync('src/App.tsx', code);
