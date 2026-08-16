const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Fix first seed in server.ts
code = code.replace(
  "        category: categories[i % categories.length],\n        price: Math.floor(100 + Math.random() * 5000),\n        stock: Math.floor(Math.random() * 500),\n        binLocation: `${districts[i % districts.length]}-A${Math.floor(Math.random() * 90) + 10}`,\n        status: i % 15 === 0 ? 'Out of Stock' : 'In Stock'",
  "        category: categories[i % categories.length],\n        stockQuantity: Math.floor(Math.random() * 500),\n        binLocation: `${districts[i % districts.length]}-A${Math.floor(Math.random() * 90) + 10}`,\n        sourceVehicle: `MH-${Math.floor(10 + Math.random() * 90)}-AB-${Math.floor(1000 + Math.random() * 9000)}`,\n        qualityRate: Math.random() > 0.8 ? 'Excellent' : Math.random() > 0.4 ? 'Good' : 'Needs Inspection'"
);

// Fix second seed (/inventory/seed)
code = code.replace(
  "          binLocation: `${district}-BIN-${Math.floor(Math.random() * 100) + 1}`\n        });",
  "          binLocation: `${district}-BIN-${Math.floor(Math.random() * 100) + 1}`,\n          sourceVehicle: `MH-${Math.floor(10 + Math.random() * 90)}-AB-${Math.floor(1000 + Math.random() * 9000)}`,\n          qualityRate: Math.random() > 0.8 ? 'Excellent' : Math.random() > 0.4 ? 'Good' : 'Needs Inspection',\n          category: 'General'\n        });"
);

fs.writeFileSync('server.ts', code);
