const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The `empId` and `department` fields are missing in the seed data for `employees`.
// Let's replace the `emps` mapping.
code = code.replace(
  /const emps = Array\.from\(\{ length: 50 \}, \(\_, i\) => \(\{\n\s*name: \`Employee \$\{i \+ 1\}\`,\n\s*mobile: \`9\$\{Math\.floor\(Math\.random\(\) \* 900000000\) \+ 100000000\}\`,\n\s*email: \`emp\$\{i \+ 1\}\@meeshowms\.com\`,\n\s*address: "Haryana",\n\s*qualification: "10th Pass",\n\s*position: positions\[i % positions\.length\],\n\s*status: i % 10 === 0 \? 'Inactive' : 'Active',\n\s*dateOfJoining: new Date\(Date\.now\(\) - Math\.random\(\) \* 10000000000\)\.toISOString\(\),\n\s*\}\)\);/g,
  `const emps = Array.from({ length: 50 }, (_, i) => ({
        empId: \`EMP-\$\{1000 + i\}\`,
        name: \`Employee \$\{i + 1\}\`,
        mobile: \`9\$\{Math.floor(Math.random() * 900000000) + 100000000\}\`,
        email: \`emp\$\{i + 1\}@meeshowms.com\`,
        address: "Haryana",
        qualification: "10th Pass",
        department: "Operations",
        position: positions[i % positions.length],
        status: i % 10 === 0 ? 'Inactive' : 'Active',
        dateOfJoining: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      }));`
);
fs.writeFileSync('server.ts', code);
console.log("Fixed seed data");
