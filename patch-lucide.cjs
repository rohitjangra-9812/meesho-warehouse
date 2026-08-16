const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const match = code.match(/import\s+{([^}]*)}\s+from\s+'lucide-react';/);
if (match) {
  const existingImports = match[1];
  const toAdd = ['Package', 'Activity', 'Shield', 'Settings', 'TrendingUp'];
  let newImports = existingImports;
  toAdd.forEach(imp => {
    if (!newImports.includes(imp)) {
      newImports += ", " + imp;
    }
  });
  code = code.replace(match[0], "import { " + newImports + " } from 'lucide-react';");
  fs.writeFileSync('src/App.tsx', code);
}
