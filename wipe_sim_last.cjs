const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const simStart = code.indexOf('setInterval(');
if (simStart !== -1) {
  const lineStart = code.lastIndexOf('\n', simStart);
  const simEnd = code.indexOf('\n', simStart);
  code = code.slice(0, lineStart) + code.slice(simEnd);
  fs.writeFileSync('server.ts', code);
  console.log("Wiped remaining setInterval");
}

