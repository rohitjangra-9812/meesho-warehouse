const fs = require('fs');
console.log(fs.readFileSync('src/components/DockScreen.tsx', 'utf8').includes('setAssignTargetBay'));
