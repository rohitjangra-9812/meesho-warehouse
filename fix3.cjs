const fs = require('fs');
let code = fs.readFileSync('src/components/AIOperationsScreen.tsx', 'utf8');

const target = `      )}
      )}
    </div>
  );
}`;
const target2 = `      )}

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
} else if (code.includes(target2)) {
  code = code.replace(target2, replacement);
}

// Just in case it's 3 of them
code = code.replace(/\)\}\s*\)\}\s*<\/div>/g, ")}\n    </div>");

fs.writeFileSync('src/components/AIOperationsScreen.tsx', code);
