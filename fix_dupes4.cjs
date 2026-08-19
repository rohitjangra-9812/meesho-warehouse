const fs = require('fs');
let code = fs.readFileSync('src/components/DockScreen.tsx', 'utf8');

const regex3 = /  const \[lookupMode, setLookupMode\] = useState\(true\);\n  const \[vehicleHistory, setVehicleHistory\] = useState<any\[\]>\(\[\]\);\n  const \[isLookingUp, setIsLookingUp\] = useState\(false\);\n  const handleLookup = async \(\) => \{[\s\S]*?setLookupMode\(false\);\n    \}\n  \};\n/g;

// Instead of regex, let's just find the string
const searchStr1 = `  const [lookupMode, setLookupMode] = useState(true);
  const [vehicleHistory, setVehicleHistory] = useState<any[]>([]);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const handleLookup = async () => {`;

const endOfFunc1 = `      setIsLookingUp(false);
      setLookupMode(false);
    }
  };`;

const startIdx = code.indexOf(searchStr1);
if (startIdx !== -1) {
  const endIdx = code.indexOf(endOfFunc1, startIdx) + endOfFunc1.length;
  code = code.slice(0, startIdx) + code.slice(endIdx);
  fs.writeFileSync('src/components/DockScreen.tsx', code);
  console.log("Deleted old states");
}

