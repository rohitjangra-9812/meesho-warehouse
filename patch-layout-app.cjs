const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const navItemsStr = `
  { name: 'Cross-Docking', href: '/cross-docking', icon: Package },
  { name: 'QC & Inspections', href: '/qc-inspections', icon: Activity },
  { name: 'HazMat Zones', href: '/special-zones', icon: Shield },
  { name: 'Packaging', href: '/packaging-ledger', icon: Settings },
  { name: 'Warehouse Layout', href: '/heatmap', icon: TrendingUp },
`;

code = code.replace(
  "{ name: 'Dock Management', href: '/docks', icon: Anchor },",
  "{ name: 'Dock Management', href: '/docks', icon: Anchor },\n" + navItemsStr
);

fs.writeFileSync('src/App.tsx', code);
