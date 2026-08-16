const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(
  `deviceId: \`SCAN-\${(i + 1).toString().padStart(3, '0')}\`,`,
  `name: \`Scanner \${(i + 1).toString().padStart(3, '0')}\`,\n        type: 'Barcode',\n        macAddress: \`00:1A:2B:3C:4D:\${(i + 1).toString().padStart(2, '0')}\`,`
);
code = code.replace(
  `department: depts[i % depts.length],`,
  `location: depts[i % depts.length],`
);
code = code.replace(
  `assignedTo: null,`,
  ``
);
fs.writeFileSync('server.ts', code);
