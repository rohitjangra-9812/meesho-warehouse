const fs = require('fs');

// 1. Fix App.tsx duplicate import
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace("import { ReturnsScreen } from './components/ReturnsScreen';\nimport { ReturnsScreen } from './components/ReturnsScreen';", "import { ReturnsScreen } from './components/ReturnsScreen';");
fs.writeFileSync('src/App.tsx', appCode);

// 2. Fix AIOperationsScreen useEffect import
let aiCode = fs.readFileSync('src/components/AIOperationsScreen.tsx', 'utf8');
if (!aiCode.includes('useEffect')) {
  aiCode = aiCode.replace("import React, { useState } from 'react';", "import React, { useState, useEffect } from 'react';");
  fs.writeFileSync('src/components/AIOperationsScreen.tsx', aiCode);
}

// 3. Fix DockScreen jsPDF imports
let dockCode = fs.readFileSync('src/components/DockScreen.tsx', 'utf8');
if (!dockCode.includes('jsPDF')) {
  dockCode = "import React, { useState } from 'react';\nimport { Truck, Package } from 'lucide-react';\nimport jsPDF from 'jspdf';\nimport autoTable from 'jspdf-autotable';\n" + dockCode;
  fs.writeFileSync('src/components/DockScreen.tsx', dockCode);
}

console.log("Imports fixed successfully!");
