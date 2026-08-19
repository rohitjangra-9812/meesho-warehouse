const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('Shield')) {
  code = code.replace('ScanBarcode } from "lucide-react";', 'ScanBarcode, Shield } from "lucide-react";');
} else {
  // If Shield is there but not imported? Wait, if Shield is in the code but not imported, the above handles it.
  if (!code.includes('Shield } from')) {
    code = code.replace('} from "lucide-react";', ', Shield } from "lucide-react";');
  }
}

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx icon");
