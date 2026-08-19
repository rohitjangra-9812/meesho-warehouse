const fs = require('fs');
const code = fs.readFileSync('src/components/DockScreen.tsx', 'utf8');

const regex1 = /\{activeTab === 'live' \? \(\<\>\<div className="grid grid-cols-1/g;
console.log("Check live match:", regex1.test(code));
