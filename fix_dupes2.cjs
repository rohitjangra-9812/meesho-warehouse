const fs = require('fs');
let code = fs.readFileSync('src/components/DockScreen.tsx', 'utf8');

const regex = /const \[lookupMode, setLookupMode\] = useState\(true\);\s*const \[vehicleHistory, setVehicleHistory\] = useState<any\[\]>\(\[\]\);\s*const \[isLookingUp, setIsLookingUp\] = useState\(false\);\s*const \[assignTargetBay, setAssignTargetBay\] = useState<number \| null>\(null\);\s*const handleLookup = async \(e: React\.FormEvent\) => \{[\s\S]*?handleRelease\(id\);\s*\}\s*\};/g;

const matches = code.match(regex);
if (matches && matches.length > 1) {
  code = code.replace(matches[1], '');
  fs.writeFileSync('src/components/DockScreen.tsx', code);
  console.log("Fixed via regex");
} else {
  console.log("No duplicate match found");
}

