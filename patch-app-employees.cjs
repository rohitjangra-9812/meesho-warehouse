const fs = require('fs');
const file = 'src/App.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add import
const importTarget = `import { BankingScreen } from './components/BankingScreen';`;
const newImport = `import { BankingScreen } from './components/BankingScreen';\nimport { EmployeeScreen } from './components/EmployeeScreen';`;
code = code.replace(importTarget, newImport);

// Add icon import
const iconTarget = `  Landmark } from 'lucide-react';`;
const newIconImport = `  Landmark,\n  Users } from 'lucide-react';`;
code = code.replace(iconTarget, newIconImport);

// Add to navItems
const navTarget = `  { icon: Landmark, label: 'Banking', path: '/banking' }\n];`;
const newNavItems = `  { icon: Landmark, label: 'Banking', path: '/banking' },\n  { icon: Users, label: 'Employees', path: '/employees' }\n];`;
code = code.replace(navTarget, newNavItems);

// Add Route
const routeTarget = `          <Route path="/banking" element={<ProtectedRoute><DashboardLayout><BankingScreen /></DashboardLayout></ProtectedRoute>} />\n        </Routes>`;
const newRoute = `          <Route path="/banking" element={<ProtectedRoute><DashboardLayout><BankingScreen /></DashboardLayout></ProtectedRoute>} />\n          <Route path="/employees" element={<ProtectedRoute><DashboardLayout><EmployeeScreen /></DashboardLayout></ProtectedRoute>} />\n        </Routes>`;
code = code.replace(routeTarget, newRoute);

fs.writeFileSync(file, code);
