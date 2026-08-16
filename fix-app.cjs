const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const imports = `
import { CrossDockingScreen } from './components/CrossDockingScreen.tsx';
import { QualityControlScreen } from './components/QualityControlScreen.tsx';
import { SpecialZonesScreen } from './components/SpecialZonesScreen.tsx';
import { PackagingLedgerScreen } from './components/PackagingLedgerScreen.tsx';
import { WarehouseLayoutScreen } from './components/WarehouseLayoutScreen.tsx';
`;
if (!code.includes('CrossDockingScreen')) {
  code = code.replace("import { InventoryScreen } from './components/InventoryScreen.tsx';", "import { InventoryScreen } from './components/InventoryScreen.tsx';\n" + imports);
}

const routes = `
          <Route path="/cross-docking" element={<ProtectedRoute><DashboardLayout><CrossDockingScreen /></DashboardLayout></ProtectedRoute>} />
          <Route path="/qc-inspections" element={<ProtectedRoute><DashboardLayout><QualityControlScreen /></DashboardLayout></ProtectedRoute>} />
          <Route path="/special-zones" element={<ProtectedRoute><DashboardLayout><SpecialZonesScreen /></DashboardLayout></ProtectedRoute>} />
          <Route path="/packaging-ledger" element={<ProtectedRoute><DashboardLayout><PackagingLedgerScreen /></DashboardLayout></ProtectedRoute>} />
          <Route path="/heatmap" element={<ProtectedRoute><DashboardLayout><WarehouseLayoutScreen /></DashboardLayout></ProtectedRoute>} />
`;

if (!code.includes('path="/cross-docking"')) {
  code = code.replace('<Route path="/inventory"', routes + '\n          <Route path="/inventory"');
}

fs.writeFileSync('src/App.tsx', code);
