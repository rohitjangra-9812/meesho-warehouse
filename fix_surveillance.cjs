const fs = require('fs');
let code = fs.readFileSync('src/components/SurveillanceScreen.tsx', 'utf8');

code = code.replace("const LiveFeed = ({ cam }: { cam: any }) => {", "const LiveFeed = ({ cam, key }: { cam: any, key?: React.Key }) => {");

fs.writeFileSync('src/components/SurveillanceScreen.tsx', code);
