const fs = require('fs');
let code = fs.readFileSync('src/components/DockScreen.tsx', 'utf8');
console.log(code.match(/setAssignTargetBay/g).length);
