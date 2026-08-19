const fs = require('fs');
let code = fs.readFileSync('src/components/AIOperationsScreen.tsx', 'utf8');

const target = `      )}
      )}
    </div>
  );
}`;

const replacement = `      )}
    </div>
  );
}`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
}

// Ensure proper wrapping
code = code.replace(/\)\}\s*\)\}\s*<\/div>/g, ")}\n    </div>");

fs.writeFileSync('src/components/AIOperationsScreen.tsx', code);
