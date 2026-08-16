const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace("import { ScannerHubScreen } from './components/ScannerHubScreen.tsx';\n", "");
code = code.replace("    { path: '/scanners', label: 'Barcode & RFID', icon: ScanBarcode },\n", "");
code = code.replace("          <Route path=\"/scanners\" element={<ProtectedRoute><DashboardLayout><ScannerHubScreen /></DashboardLayout></ProtectedRoute>} />\n", "");

fs.writeFileSync('src/App.tsx', code);
