const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add import
const importTarget = `import { CatalogScreen } from './components/CatalogScreen';`;
const newImport = `import { CatalogScreen } from './components/CatalogScreen';\nimport { DockScreen } from './components/DockScreen';`;
code = code.replace(importTarget, newImport);

// Add icon import
const iconTarget = `  BookOpen } from 'lucide-react';`;
const newIconImport = `  BookOpen,\n  Truck } from 'lucide-react';`;
code = code.replace(iconTarget, newIconImport);

// Add to navItems
const navTarget = `  { icon: BookOpen, label: 'Catalog', path: '/catalog' }\n];`;
const newNavItems = `  { icon: BookOpen, label: 'Catalog', path: '/catalog' },\n  { icon: Truck, label: 'Docks', path: '/docks' }\n];`;
code = code.replace(navTarget, newNavItems);

// Add Route
const routeTarget = `          <Route path="/catalog" element={<ProtectedRoute><DashboardLayout><CatalogScreen /></DashboardLayout></ProtectedRoute>} />\n        </Routes>`;
const newRoute = `          <Route path="/catalog" element={<ProtectedRoute><DashboardLayout><CatalogScreen /></DashboardLayout></ProtectedRoute>} />\n          <Route path="/docks" element={<ProtectedRoute><DashboardLayout><DockScreen /></DashboardLayout></ProtectedRoute>} />\n        </Routes>`;
code = code.replace(routeTarget, newRoute);

fs.writeFileSync('src/App.tsx', code);
