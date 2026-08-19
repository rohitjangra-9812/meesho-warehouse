const fs = require('fs');
const file = 'src/App.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add import
const importTarget = `import { ReturnsScreen } from './components/ReturnsScreen';`;
const newImport = `import { ReturnsScreen } from './components/ReturnsScreen';\nimport { BankingScreen } from './components/BankingScreen';`;
code = code.replace(importTarget, newImport);

// Add icon import
const iconTarget = `  RotateCcw,\n  Search,`;
const newIconImport = `  RotateCcw,\n  Search,\n  Landmark,`;
code = code.replace(iconTarget, newIconImport);

// Add to navItems
const navTarget = `  { icon: RotateCcw, label: 'Returns', path: '/returns' }\n];`;
const newNavItems = `  { icon: RotateCcw, label: 'Returns', path: '/returns' },\n  { icon: Landmark, label: 'Banking', path: '/banking' }\n];`;
code = code.replace(navTarget, newNavItems);

// Add Route
const routeTarget = `<Route path="/returns" element={<ProtectedRoute><DashboardLayout><ReturnsScreen /></DashboardLayout></ProtectedRoute>} />\n        </Routes>`;
const newRoute = `<Route path="/returns" element={<ProtectedRoute><DashboardLayout><ReturnsScreen /></DashboardLayout></ProtectedRoute>} />\n          <Route path="/banking" element={<ProtectedRoute><DashboardLayout><BankingScreen /></DashboardLayout></ProtectedRoute>} />\n        </Routes>`;
code = code.replace(routeTarget, newRoute);

fs.writeFileSync(file, code);
