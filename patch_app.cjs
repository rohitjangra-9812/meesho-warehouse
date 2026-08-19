const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('LeadershipScreen')) {
  code = code.replace("import { ScannerScreen } from './components/ScannerScreen';", "import { ScannerScreen } from './components/ScannerScreen';\nimport { LeadershipScreen } from './components/LeadershipScreen';");
}

if (!code.includes("label: 'Leadership'")) {
  code = code.replace("{ icon: Users, label: 'Employees', path: '/employees' },", "{ icon: Users, label: 'Employees', path: '/employees' },\n  { icon: Users, label: 'Leadership', path: '/leadership' },");
}

if (!code.includes('<Route path="/leadership"')) {
  code = code.replace('<Route path="/employees" element={<ProtectedRoute><DashboardLayout><EmployeeScreen /></DashboardLayout></ProtectedRoute>} />', '<Route path="/employees" element={<ProtectedRoute><DashboardLayout><EmployeeScreen /></DashboardLayout></ProtectedRoute>} />\n        <Route path="/leadership" element={<ProtectedRoute><DashboardLayout><LeadershipScreen /></DashboardLayout></ProtectedRoute>} />');
}

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx");
