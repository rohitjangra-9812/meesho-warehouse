const fs = require('fs');
let code = fs.readFileSync('src/components/DockManagementScreen.tsx', 'utf8');

const voiceButton = `
          <button 
            onClick={toggleListening}
            className={\`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors \${isListening ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}\`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {isListening ? 'Stop' : 'Voice Command'}
          </button>
`;

code = code.replace(
  '<button \n            onClick={() => setShowBooking(true)}',
  voiceButton.trim() + '\n          <button \n            onClick={() => setShowBooking(true)}'
);

fs.writeFileSync('src/components/DockManagementScreen.tsx', code);
