const fs = require('fs');
let code = fs.readFileSync('src/components/DockScreen.tsx', 'utf8');

// Insert the alert component logic and Bell icon
if (!code.includes('Bell')) {
  code = code.replace("ThumbsUp, XCircle } from 'lucide-react';", "ThumbsUp, XCircle, Bell, BellRing } from 'lucide-react';");
}

const stateInsertion = `
  const [alerts, setAlerts] = useState<any[]>([]);
  const [browserAlertsEnabled, setBrowserAlertsEnabled] = useState(Notification.permission === 'granted');

  useEffect(() => {
    const checkETAs = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every 10 seconds to get a high-priority alert for simulation
        const priorityVehicles = ['Trailer', '32ft Container', 'Reefer'];
        const type = priorityVehicles[Math.floor(Math.random() * priorityVehicles.length)];
        const vNo = 'MH-' + Math.floor(10+Math.random()*90) + '-AB-' + Math.floor(1000+Math.random()*9000);
        const bay = Math.floor(1 + Math.random() * 20);
        const newAlert = {
          id: Date.now(),
          title: 'High-Priority Inbound Arrival',
          message: \`Vehicle \${vNo} (\${type}) is arriving at Bay \${bay} in < 2 mins.\`
        };
        
        setAlerts(prev => [...prev, newAlert]);
        
        if (Notification.permission === 'granted') {
          new Notification(newAlert.title, { body: newAlert.message, icon: '/favicon.ico' });
        }
        
        setTimeout(() => {
          setAlerts(prev => prev.filter(a => a.id !== newAlert.id));
        }, 8000);
      }
    }, 15000);
    return () => clearInterval(checkETAs);
  }, []);

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          setBrowserAlertsEnabled(true);
          new Notification("Alerts Enabled", { body: "You will now receive high-priority dock alerts." });
        }
      });
    } else {
      alert("Browser notifications not supported.");
    }
  };
`;

if (!code.includes('setAlerts')) {
  code = code.replace("const [selectedDockId, setSelectedDockId] = useState<number | null>(null);", "const [selectedDockId, setSelectedDockId] = useState<number | null>(null);\n" + stateInsertion);
}

const buttonInsertion = `
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={requestNotificationPermission} 
            className={\`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm border \${browserAlertsEnabled ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}\`}
          >
            {browserAlertsEnabled ? <BellRing size={16} /> : <Bell size={16} />} 
            {browserAlertsEnabled ? 'Browser Alerts Active' : 'Enable Browser Alerts'}
          </button>
`;

code = code.replace('<div className="flex flex-wrap items-center gap-3">', buttonInsertion);

const toastUIInsertion = `
      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {alerts.map(alert => (
          <div key={alert.id} className="bg-gray-900 border border-gray-800 text-white p-4 rounded-xl shadow-2xl flex items-start gap-4 animate-in slide-in-from-right-8 duration-300 max-w-sm">
            <div className="bg-red-500/20 p-2 rounded-lg text-red-400 shrink-0">
              <AlertCircle size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">{alert.title}</h4>
              <p className="text-gray-300 text-sm mt-1 leading-snug">{alert.message}</p>
            </div>
            <button onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))} className="text-gray-500 hover:text-white transition-colors shrink-0 p-1">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Header & Stats */}
`;

code = code.replace('{/* Header & Stats */}', toastUIInsertion);

fs.writeFileSync('src/components/DockScreen.tsx', code);
console.log("Patched DockScreen alerts");
