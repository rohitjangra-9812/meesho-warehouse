const fs = require('fs');
let code = fs.readFileSync('src/components/DockManagementScreen.tsx', 'utf8');

// 1. Add Mic, MicOff to lucide-react imports
code = code.replace(
  "TrendingUp } from 'lucide-react';",
  "TrendingUp, Mic, MicOff } from 'lucide-react';"
);

// 2. Change alertHistory from const to useState
code = code.replace(
  "const alertHistory = [",
  "const [alertHistory, setAlertHistory] = useState(["
);
code = code.replace(
  "    { id: 4, timestamp: '2026-08-07T11:20:00Z', location: 'Yard Staging Area', severity: 'High', description: 'Yard capacity reached 95%. Traffic diverted.' },\n  ];",
  "    { id: 4, timestamp: '2026-08-07T11:20:00Z', location: 'Yard Staging Area', severity: 'High', description: 'Yard capacity reached 95%. Traffic diverted.' },\n  ]);"
);

// 3. Add Voice states and logic
const voiceState = `
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState('');

  const processVoiceCommand = async (command: string) => {
    const text = command.toLowerCase();
    
    // Command 1: mark gate X available/occupied
    const markGateMatch = text.match(/mark gate (\\d+) (available|occupied)/);
    if (markGateMatch) {
      const gateNum = markGateMatch[1].padStart(2, '0');
      const statusInput = markGateMatch[2];
      const newStatus = statusInput === 'available' ? 'Available' : 'Occupied';
      
      const targetDoor = doors.find(d => d.doorNumber === \`Dock-\${gateNum}\`);
      if (targetDoor) {
        try {
          await fetchApi(\`/docks/doors/\${targetDoor.id}/status\`, {
            method: 'PUT',
            body: JSON.stringify({ status: newStatus })
          });
          setVoiceFeedback(\`Gate \${gateNum} marked as \${newStatus}.\`);
          loadData();
        } catch (e) {
          setVoiceFeedback(\`Failed to update Gate \${gateNum}.\`);
        }
      } else {
        setVoiceFeedback(\`Gate \${gateNum} not found.\`);
      }
      return;
    }

    // Command 2: alert high value truck
    if (text.includes("alert high value") || text.includes("alert high-value")) {
      const newAlert = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        location: 'Voice Command',
        severity: 'Critical',
        description: 'High-value truck alert triggered by voice.'
      };
      setAlertHistory(prev => [newAlert, ...prev]);
      setVoiceFeedback('Alert created for high-value truck.');
      return;
    }

    setVoiceFeedback(\`Command not recognized: "\${command}"\`);
  };

  const toggleListening = () => {
    if (isListening) {
      // It will stop automatically, or we can't easily stop without saving recognition instance to ref.
      setIsListening(false);
      setVoiceFeedback('');
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setVoiceFeedback('Speech recognition is not supported in this browser.');
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceFeedback('Listening for command (e.g., "Mark gate 5 available" or "Alert high-value truck")...');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      processVoiceCommand(transcript);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      setVoiceFeedback('Error listening to voice command.');
    };

    recognition.onend = () => {
      setIsListening(false);
      setTimeout(() => setVoiceFeedback(''), 5000);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };
`;

code = code.replace(
  "const totalDoors = doors.length;",
  voiceState + "\n  const totalDoors = doors.length;"
);

// 4. Add Voice button to header
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
  '<button \n             onClick={() => setShowBooking(true)}',
  voiceButton + '\n          <button \n             onClick={() => setShowBooking(true)}'
);

// 5. Add Voice Feedback UI
const voiceFeedbackUI = `
      {voiceFeedback && (
        <div className={\`p-4 rounded-xl shadow-sm border flex items-center gap-3 \${voiceFeedback.includes('Error') || voiceFeedback.includes('Failed') || voiceFeedback.includes('not found') || voiceFeedback.includes('not recognized') ? 'bg-red-50 border-red-200 text-red-800' : 'bg-blue-50 border-blue-200 text-blue-800'}\`}>
          {isListening ? (
             <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
             </span>
          ) : (
             <Mic className="h-5 w-5 opacity-70" />
          )}
          <span className="text-sm font-medium">{voiceFeedback}</span>
        </div>
      )}
`;

code = code.replace(
  '<div className="flex gap-6 border-b border-gray-200">',
  voiceFeedbackUI + '\n      <div className="flex gap-6 border-b border-gray-200">'
);

fs.writeFileSync('src/components/DockManagementScreen.tsx', code);
