const fs = require('fs');
let code = fs.readFileSync('src/components/ScannerScreen.tsx', 'utf8');

code = code.replace(
  "className={\\`w-full h-full flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-200 \\${scanResult.statusColor.split(' ')[0]}\\`}",
  "className={`w-full h-full flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-200 ${scanResult.statusColor.split(' ')[0]}`}"
);

code = code.replace(
  "className={\\`font-bold px-2 py-1 rounded-md text-xs uppercase \\${\\n",
  "className={`font-bold px-2 py-1 rounded-md text-xs uppercase ${\\n"
);
code = code.replace(
  "\\`}",
  "`}"
);

fs.writeFileSync('src/components/ScannerScreen.tsx', code);
