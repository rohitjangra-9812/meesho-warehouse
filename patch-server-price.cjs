const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Update first seed
code = code.replace(
  /stockQuantity: Math.floor\(Math.random\(\) \* 500\),/g,
  "stockQuantity: Math.floor(Math.random() * 500),\n        price: Math.floor(100 + Math.random() * 9900),"
);

fs.writeFileSync('server.ts', code);
