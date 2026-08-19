const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /const newEmployees = Array\.from\(\{\s*length:\s*20\s*\},\s*\(_,\s*i\)\s*=>\s*\(\{\s*name:\s*\`Batch Emp \$\{Math\.floor\(Math\.random\(\)\*10000\)\}\`,\s*mobile: \`9\$\{Math\.floor\(Math\.random\(\) \* 900000000\) \+ 100000000\}\`,\s*email: \`batch\.emp\$\{Date\.now\(\)\}\$\{i\}@meeshowms\.com\`,\s*address:\s*"Auto Generated Address",\s*qualification:\s*"12th Pass",\s*position:\s*positions\[Math\.floor\(Math\.random\(\)\*positions\.length\)\],\s*status:\s*'Active',\s*dateOfJoining:\s*new Date\(\)\.toISOString\(\)\s*\}\)\);/g;

code = code.replace(regex, `const newEmployees = Array.from({ length: 20 }, (_, i) => ({
        empId: \`BEMP-\${Date.now().toString().slice(-4)}\${i}\`,
        department: 'Operations',
        name: \`Batch Emp \${Math.floor(Math.random()*10000)}\`,
        mobile: \`9\${Math.floor(Math.random() * 900000000) + 100000000}\`,
        email: \`batch.emp\${Date.now()}\${i}@meeshowms.com\`,
        address: "Auto Generated Address",
        qualification: "12th Pass",
        position: positions[Math.floor(Math.random()*positions.length)],
        status: 'Active',
        dateOfJoining: new Date().toISOString()
      }));`);

fs.writeFileSync('server.ts', code);
