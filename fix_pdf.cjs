const fs = require('fs');
let code = fs.readFileSync('src/components/BankingScreen.tsx', 'utf8');

code = code.replace("import 'jspdf-autotable';", "import autoTable from 'jspdf-autotable';");

code = code.replace("(doc as any).autoTable({", "autoTable(doc, {");

fs.writeFileSync('src/components/BankingScreen.tsx', code);
