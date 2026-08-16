const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /sourceVehicle: `MH-\$\{Math\.floor\(10 \+ Math\.random\(\) \* 90\)\}-AB-\$\{Math\.floor\(1000 \+ Math\.random\(\) \* 9000\)\}`,\n\s+qualityRate: Math\.random\(\) > 0\.8 \? 'Excellent' : Math\.random\(\) > 0\.4 \? 'Good' : 'Needs Inspection',\n\s+category: 'Batch',\n\s+sourceVehicle: `MH-\$\{Math\.floor\(10 \+ Math\.random\(\) \* 90\)\}-AB-\$\{Math\.floor\(1000 \+ Math\.random\(\) \* 9000\)\}`,\n\s+qualityRate: Math\.random\(\) > 0\.8 \? 'Excellent' : Math\.random\(\) > 0\.4 \? 'Good' : 'Needs Inspection',\n\s+category: 'Batch'/g,
  "sourceVehicle: `MH-${Math.floor(10 + Math.random() * 90)}-AB-${Math.floor(1000 + Math.random() * 9000)}`,\n        qualityRate: Math.random() > 0.8 ? 'Excellent' : Math.random() > 0.4 ? 'Good' : 'Needs Inspection',\n        category: 'Batch'"
);

fs.writeFileSync('server.ts', code);
