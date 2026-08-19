const fs = require('fs');
let code = fs.readFileSync('src/components/AIOperationsScreen.tsx', 'utf8');

// Fix >
code = code.replace(/> Dims:/g, "&gt; Dims:");
code = code.replace(/> Wgt:/g, "&gt; Wgt:");
code = code.replace(/> Code:/g, "&gt; Code:");

// Fix extra )}
code = code.replace(/      \)\}\n      \)\}\n    <\/div>\n  \);\n\}/g, "      )}\n    </div>\n  );\n}");

fs.writeFileSync('src/components/AIOperationsScreen.tsx', code);
