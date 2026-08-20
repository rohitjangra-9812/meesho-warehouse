const fs = require('fs');

let appCode = fs.readFileSync('src/App.tsx', 'utf8');
// Clean up all imports of ReturnsScreen and re-insert single clean import
appCode = appCode.replace(/import\s+\{\s*ReturnsScreen\s*\}\s+from\s+['"].*?['"];?/g, '');
appCode = "import { ReturnsScreen } from './components/ReturnsScreen';\n" + appCode;
fs.writeFileSync('src/App.tsx', appCode);

let aiCode = fs.readFileSync('src/components/AIOperationsScreen.tsx', 'utf8');
if (!aiCode.includes('import React, { useState, useEffect }')) {
  aiCode = aiCode.replace(/import React.*?;/, "import React, { useState, useEffect } from 'react';");
  fs.writeFileSync('src/components/AIOperationsScreen.tsx', aiCode);
}

let dockCode = fs.readFileSync('src/components/DockScreen.tsx', 'utf8');
if (!dockCode.includes("import jsPDF")) {
  dockCode = "import jsPDF from 'jspdf';\nimport autoTable from 'jspdf-autotable';\n" + dockCode;
  fs.writeFileSync('src/components/DockScreen.tsx', dockCode);
}

console.log("Cleanup complete!");
