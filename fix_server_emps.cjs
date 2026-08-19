const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/mobile: \`9\$\\{Math\.floor\\(Math\.random\\(\\) \\* 900000000\\) \\+ 100000000\\}\`,\\s*email: \`batch\\.emp\$\\{Date\\.now\\(\\)\\}\\$\\{i\\}@meeshowms\\.com\`,\\s*address: "Auto Generated Address",\\s*qualification: "12th Pass",\\s*position: positions\\[Math\\.floor\\(Math\\.random\\(\\)\\*positions\\.length\\)\\],\\s*status: 'Active',\\s*dateOfJoining: new Date\\(\\)\\.toISOString\\(\\)/,
"empId: `BEMP-${Date.now().toString().slice(-4)}${i}`, department: 'Operations', mobile: `9${Math.floor(Math.random() * 900000000) + 100000000}`, email: `batch.emp${Date.now()}${i}@meeshowms.com`, address: \"Auto Generated Address\", qualification: \"12th Pass\", position: positions[Math.floor(Math.random()*positions.length)], status: 'Active', dateOfJoining: new Date().toISOString()");
fs.writeFileSync('server.ts', code);
