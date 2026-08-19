const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add import
const importTarget = `import { EmployeeScreen } from './components/EmployeeScreen';`;
const newImport = `import { EmployeeScreen } from './components/EmployeeScreen';\nimport { CatalogScreen } from './components/CatalogScreen';`;
code = code.replace(importTarget, newImport);

// Add icon import
const iconTarget = `  Users } from 'lucide-react';`;
const newIconImport = `  Users,\n  BookOpen } from 'lucide-react';`;
code = code.replace(iconTarget, newIconImport);

// Add to navItems
const navTarget = `  { icon: Users, label: 'Employees', path: '/employees' }\n];`;
const newNavItems = `  { icon: Users, label: 'Employees', path: '/employees' },\n  { icon: BookOpen, label: 'Catalog', path: '/catalog' }\n];`;
code = code.replace(navTarget, newNavItems);

// Add Route
const routeTarget = `          <Route path="/employees" element={<ProtectedRoute><DashboardLayout><EmployeeScreen /></DashboardLayout></ProtectedRoute>} />\n        </Routes>`;
const newRoute = `          <Route path="/employees" element={<ProtectedRoute><DashboardLayout><EmployeeScreen /></DashboardLayout></ProtectedRoute>} />\n          <Route path="/catalog" element={<ProtectedRoute><DashboardLayout><CatalogScreen /></DashboardLayout></ProtectedRoute>} />\n        </Routes>`;
code = code.replace(routeTarget, newRoute);

fs.writeFileSync('src/App.tsx', code);
