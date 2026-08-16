const fs = require('fs');
let code = fs.readFileSync('src/components/DockManagementScreen.tsx', 'utf8');

code = code.replace(
  "const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;",
  "const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;"
);

fs.writeFileSync('src/components/DockManagementScreen.tsx', code);
