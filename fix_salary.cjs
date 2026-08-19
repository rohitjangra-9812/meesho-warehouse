const fs = require('fs');
let code = fs.readFileSync('src/components/EmployeeScreen.tsx', 'utf8');

// Replace viewPayslip.salary with (viewPayslip.salary || 0)
code = code.replace(/viewPayslip\.salary/g, "(viewPayslip.salary || 0)");
// Also replace viewAgreement.salary with (viewAgreement.salary || 0)
code = code.replace(/viewAgreement\.salary/g, "(viewAgreement.salary || 0)");

fs.writeFileSync('src/components/EmployeeScreen.tsx', code);
