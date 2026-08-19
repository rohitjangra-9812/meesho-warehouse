const fs = require('fs');
let code = fs.readFileSync('src/components/DockScreen.tsx', 'utf8');
const lines = code.split('\n');

// Find the index of the second lookupMode
let firstFound = false;
let startIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const [lookupMode, setLookupMode] = useState(true);')) {
    if (firstFound) {
      startIdx = i;
      break;
    } else {
      firstFound = true;
    }
  }
}

if (startIdx !== -1) {
  let endIdx = -1;
  for (let i = startIdx; i < lines.length; i++) {
    if (lines[i].includes('setLookupMode(false);')) {
      // Find the closing brace of the function block
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].includes('}')) {
           endIdx = j + 2; // give a couple lines for good measure
           break;
        }
      }
      break;
    }
  }
  
  if (endIdx !== -1) {
    lines.splice(startIdx, endIdx - startIdx);
    fs.writeFileSync('src/components/DockScreen.tsx', lines.join('\n'));
    console.log("Killed dupes successfully");
  }
}
