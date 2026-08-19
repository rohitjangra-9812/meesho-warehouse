const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const simStart = code.indexOf('setInterval(');
if (simStart !== -1) {
  // Let's just wipe anything containing setInterval to be safe
  console.log("Found setInterval");
}

