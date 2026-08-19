const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const simStart = code.indexOf('setInterval(');
if (simStart !== -1) {
  console.log("Found setInterval");
} else {
  console.log("No more setIntervals");
}

