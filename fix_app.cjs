const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The replacement logic incorrectly messed up the main tags.
code = code.replace(/<main className="flex-1 flex flex-col min-w-0 overflow-hidden pb-16 md:pb-0">/, `<main className="flex-1 flex flex-col min-w-0 overflow-hidden pb-16 md:pb-0 relative">
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 400 400" className="w-[120%] h-[120%] text-[#f43397]" fill="currentColor">
               <path d="M200 40 L360 120 L360 280 L200 360 L40 280 L40 120 Z" />
               <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="60" fontWeight="bold">meesho</text>
            </svg>
          </div>
          <div className="relative z-10 flex flex-col h-full w-full">`);

code = code.replace(/<\/div>\n        <\/main>/, `</div>\n      </main>`);
code = code.replace(/<\/div>\n      <\/div>\n      <\/main>/, `</div>\n      </div>\n      </main>`);
// Fixing the actual output:
// 197|        </div>
// 198|      </div>
// 199|        </main>
code = code.replace(/<\/div>\n      <\/div>\n        <\/main>/, `</div>\n      </div>\n      </div>\n      </main>`);


fs.writeFileSync('src/App.tsx', code);
