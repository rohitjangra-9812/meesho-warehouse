const fs = require('fs');
let code = fs.readFileSync('src/components/DockScreen.tsx', 'utf8');
code = code.replace("{activeTab === 'live' ? (<><div", "{activeTab === 'live' ? (\\n<>\\n<div");
code = code.replace("</>\\n      ) : (", "\\n</>\\n      ) : (");
fs.writeFileSync('src/components/DockScreen.tsx', code);
