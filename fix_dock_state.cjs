const fs = require('fs');
let code = fs.readFileSync('src/components/DockScreen.tsx', 'utf8');

code = code.replace(/const \[docks, setDocks\] = useState<any\[\]>\(\[\]\);/, 
  "const [docks, setDocks] = useState<any[]>([]);\n  const [queue, setQueue] = useState<any[]>([]);\n  const [autoAssign, setAutoAssign] = useState(true);");

const fetchDocksReplace = `const res = await fetchApi('/v3/docks');
      setDocks(res?.docks || []);
      setStats(res.stats);
      if (res?.queue) setQueue(res.queue);
      if (res?.autoDockEnabled !== undefined) setAutoAssign(res.autoDockEnabled);`;

code = code.replace(/const res = await fetchApi\('\/v3\/docks'\);\s*setDocks\(res\?\.docks \|\| \[\]\);\s*setStats\(res\.stats\);/g, fetchDocksReplace);

fs.writeFileSync('src/components/DockScreen.tsx', code);
