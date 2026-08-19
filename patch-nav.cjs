const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldNavItems = `const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: ArrowDownToLine, label: 'Inbound', path: '/inbound' },
  { icon: ArrowUpFromLine, label: 'Outbound', path: '/outbound' },
  { icon: PackageSearch, label: 'Inventory', path: '/inventory' },
  { icon: RotateCcw, label: 'Returns', path: '/returns' },
  { icon: Landmark, label: 'Banking', path: '/banking' },
  { icon: Users, label: 'Employees', path: '/employees' },
  { icon: BookOpen, label: 'Catalog', path: '/catalog' }
];`;

const newNavItems = `const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Landmark, label: 'Banking', path: '/banking' },
  { icon: Users, label: 'Employees', path: '/employees' },
  { icon: BookOpen, label: 'Catalog', path: '/catalog' }
];`;

code = code.replace(oldNavItems, newNavItems);

const oldRoutes = `          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><DashboardScreen /></DashboardLayout></ProtectedRoute>} />
          <Route path="/inbound" element={<ProtectedRoute><DashboardLayout><InboundScreen /></DashboardLayout></ProtectedRoute>} />
          <Route path="/outbound" element={<ProtectedRoute><DashboardLayout><OutboundScreen /></DashboardLayout></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><DashboardLayout><InventoryScreen /></DashboardLayout></ProtectedRoute>} />
          <Route path="/returns" element={<ProtectedRoute><DashboardLayout><ReturnsScreen /></DashboardLayout></ProtectedRoute>} />
          <Route path="/banking" element={<ProtectedRoute><DashboardLayout><BankingScreen /></DashboardLayout></ProtectedRoute>} />`;

const newRoutes = `          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><DashboardScreen /></DashboardLayout></ProtectedRoute>} />
          <Route path="/banking" element={<ProtectedRoute><DashboardLayout><BankingScreen /></DashboardLayout></ProtectedRoute>} />`;

code = code.replace(oldRoutes, newRoutes);
fs.writeFileSync('src/App.tsx', code);
