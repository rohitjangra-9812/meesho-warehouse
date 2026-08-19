const fs = require('fs');
let code = fs.readFileSync('src/components/DockScreen.tsx', 'utf8');

code = code.replace("{activeTab === 'live' ? (<><div", "{activeTab === 'live' ? (\n<>\n<div");
fs.writeFileSync('src/components/DockScreen.tsx', code);
