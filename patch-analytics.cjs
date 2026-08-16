const fs = require('fs');
let code = fs.readFileSync('src/components/AnalyticsScreen.tsx', 'utf8');

if (!code.includes('<BatchEngineWidget />')) {
  code = code.replace(
    '    <div className="max-w-7xl mx-auto space-y-6">',
    '    <div className="max-w-7xl mx-auto space-y-6">\n      <BatchEngineWidget />'
  );
}

fs.writeFileSync('src/components/AnalyticsScreen.tsx', code);
