const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Import AIOperationsScreen
const importTarget = `import { DockScreen } from './components/DockScreen';`;
const newImport = `import { DockScreen } from './components/DockScreen';\nimport { AIOperationsScreen } from './components/AIOperationsScreen';`;
code = code.replace(importTarget, newImport);

// 2. Import BrainCircuit icon
const iconTarget = `  Truck } from 'lucide-react';`;
const newIconTarget = `  Truck, BrainCircuit } from 'lucide-react';`;
code = code.replace(iconTarget, newIconTarget);

// 3. Add to navItems
const navTarget = `  { icon: Truck, label: 'Docks', path: '/docks' }\n];`;
const newNavTarget = `  { icon: Truck, label: 'Docks', path: '/docks' },\n  { icon: BrainCircuit, label: 'AI Operations', path: '/ai-operations' }\n];`;
code = code.replace(navTarget, newNavTarget);

// 4. Add Route
const routeTarget = `          <Route path="/docks" element={<ProtectedRoute><DashboardLayout><DockScreen /></DashboardLayout></ProtectedRoute>} />\n        </Routes>`;
const newRouteTarget = `          <Route path="/docks" element={<ProtectedRoute><DashboardLayout><DockScreen /></DashboardLayout></ProtectedRoute>} />\n          <Route path="/ai-operations" element={<ProtectedRoute><DashboardLayout><AIOperationsScreen /></DashboardLayout></ProtectedRoute>} />\n        </Routes>`;
code = code.replace(routeTarget, newRouteTarget);

fs.writeFileSync('src/App.tsx', code);
