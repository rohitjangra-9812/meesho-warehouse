const fs = require('fs');
let code = fs.readFileSync('src/components/DockScreen.tsx', 'utf8');

const searchStr1 = `  const [lookupMode, setLookupMode] = useState(true);
  const [vehicleHistory, setVehicleHistory] = useState<any[]>([]);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [assignTargetBay, setAssignTargetBay] = useState<number | null>(null);

  const handleLookup = async (e: React.FormEvent) => {`;

const endOfFunc1 = `      setIsLookingUp(false);
      setLookupMode(false);
    }
  };`;

const startIdx = code.indexOf(searchStr1, 1000); // skip first occurrence if it's there
if (startIdx !== -1) {
  const endIdx = code.indexOf(endOfFunc1, startIdx) + endOfFunc1.length;
  code = code.slice(0, startIdx) + code.slice(endIdx);
  fs.writeFileSync('src/components/DockScreen.tsx', code);
  console.log("Deleted old states correctly");
} else {
  console.log("Didn't find it with skip");
  
  // just delete lines 184 to 212
  const lines = code.split('\n');
  lines.splice(183, 29); // 184 is index 183. 212-184 + 1 = 29
  fs.writeFileSync('src/components/DockScreen.tsx', lines.join('\n'));
  console.log("Deleted by line numbers");
}

