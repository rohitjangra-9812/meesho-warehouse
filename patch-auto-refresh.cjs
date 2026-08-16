const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/components/*.tsx');
files.forEach(f => {
  let code = fs.readFileSync(f, 'utf8');
  
  // Find useEffect that has an empty dependency array
  // and see if there's a fetchData or loadData function called inside it
  if (code.includes('useEffect(() => {') && !code.includes("'auto-refresh'")) {
    const fetchMatches = code.match(/const (fetch[a-zA-Z0-9]+|load[a-zA-Z0-9]+) = async \(\) => {/);
    if (fetchMatches && fetchMatches[1]) {
      const funcName = fetchMatches[1];
      
      // Inject global event listener to auto-refresh the tables
      code = code.replace(
        /useEffect\(\(\) => \{([\s\S]*?)\}, \[\]\);/,
        `useEffect(() => {$1  window.addEventListener('auto-refresh', ${funcName});\n  return () => window.removeEventListener('auto-refresh', ${funcName});\n}, []);`
      );
      fs.writeFileSync(f, code);
      console.log('Patched auto-refresh for ' + f);
    }
  }
});
