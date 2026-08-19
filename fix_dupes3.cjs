const fs = require('fs');
let code = fs.readFileSync('src/components/DockScreen.tsx', 'utf8');

const regex2 = /  const \[lookupMode, setLookupMode\] = useState\(true\);\n  const \[vehicleHistory, setVehicleHistory\] = useState<any\[\]>\(\[\]\);\n  const \[isLookingUp, setIsLookingUp\] = useState\(false\);\n  const handleLookup = async \(\) => \{[\s\S]*?setLookupMode\(false\);\n    \}\n  \};\n/g;

code = code.replace(regex2, '');

fs.writeFileSync('src/components/DockScreen.tsx', code);
console.log("Fixed via regex 2");
