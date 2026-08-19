const fs = require('fs');
let code = fs.readFileSync('src/components/AIOperationsScreen.tsx', 'utf8');

// Find the last three closing lines
//       )}
//       )}
//     </div>
//   );
// }
// and clean it up.
code = code.replace(/      \)\}\n      \)\}\n    <\/div>\n  \);\n\}/g, "      )}\n    </div>\n  );\n}");

// The routing tab has `{activeTab === 'routing' && (` but then its closing `)}` is at the very end of the newViews block.
// Let's just remove the first `)}` before `{activeTab === 'vision' && (` and wrap everything correctly, OR we can just insert `)}` at the right place.

fs.writeFileSync('src/components/AIOperationsScreen.tsx', code);
