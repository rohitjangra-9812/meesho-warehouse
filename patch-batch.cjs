const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "        binLocation: `A-${Math.floor(Math.random() * 90) + 10}`,\n        lowStockThreshold: 20",
  "        binLocation: `A-${Math.floor(Math.random() * 90) + 10}`,\n        lowStockThreshold: 20,\n        sourceVehicle: `MH-${Math.floor(10 + Math.random() * 90)}-AB-${Math.floor(1000 + Math.random() * 9000)}`,\n        qualityRate: Math.random() > 0.8 ? 'Excellent' : Math.random() > 0.4 ? 'Good' : 'Needs Inspection',\n        category: 'Batch'"
);

code = code.replace(
  "        binLocation: `A-${Math.floor(Math.random() * 90) + 10}`,\n        lowStockThreshold: 20",
  "        binLocation: `A-${Math.floor(Math.random() * 90) + 10}`,\n        lowStockThreshold: 20,\n        sourceVehicle: `MH-${Math.floor(10 + Math.random() * 90)}-AB-${Math.floor(1000 + Math.random() * 9000)}`,\n        qualityRate: Math.random() > 0.8 ? 'Excellent' : Math.random() > 0.4 ? 'Good' : 'Needs Inspection',\n        category: 'Batch'"
);

fs.writeFileSync('server.ts', code);
