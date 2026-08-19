const fs = require('fs');
let code = fs.readFileSync('src/components/DockScreen.tsx', 'utf8');

// Icons update
const iconImportRegex = /import \{\s*Truck[\s\S]*?\} from 'lucide-react';/m;
const newIconImport = `import { Truck, Clock, MapPin, Package, Fuel, AlertCircle, CheckCircle2, Search, Plus, X, ArrowRight, Zap, Bot, ThumbsUp, XCircle } from 'lucide-react';`;
code = code.replace(iconImportRegex, newIconImport);

// Add AI Suggestions State
code = code.replace(
  "const [loading, setLoading] = useState(true);",
  `const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([
    { id: 'sugg-1', vehicle: 'DL-01-XY-9876', type: 'Trailer', eta: '10m', cargo: 'Electronics', priority: 'High', suggestedBay: 5, reason: 'Fastest turnaround path.' },
    { id: 'sugg-2', vehicle: 'MH-04-AB-1234', type: '32ft Container', eta: '25m', cargo: 'Apparel', priority: 'Medium', suggestedBay: 2, reason: 'Extended dwell tolerance.' }
  ]);`
);

// Add logic to approve/override
const logicToInsert = `
  const handleApproveSuggestion = (suggestion: any) => {
    // Fill the form data with suggestion info and open modal for the suggested bay
    setFormData({
      vehicleNo: suggestion.vehicle,
      vehicleType: suggestion.type,
      driverName: 'Auto-Assigned',
      driverMobile: 'N/A',
      origin: 'AI Scheduled',
      status: 'Inbound Unloading',
      material: suggestion.cargo,
      quantity: 1000,
      distance: 50,
      fuel: 10
    });
    setSelectedDockId(suggestion.suggestedBay);
    setIsModalOpen(true);
    setSuggestions(suggestions.filter(s => s.id !== suggestion.id));
  };

  const handleDismissSuggestion = (id: string) => {
    setSuggestions(suggestions.filter(s => s.id !== id));
  };
`;
code = code.replace("const loadData = async () => {", logicToInsert + "\n  const loadData = async () => {");

// Add UI for suggestions above the dock grid
const suggestionsUI = `
      {/* AI Suggestions Section */}
      {suggestions.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 shadow-sm mb-6 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-2 mb-4 text-blue-800">
            <Bot size={20} className="text-blue-600" />
            <h3 className="text-lg font-bold">Smart Dock Assignments</h3>
            <span className="text-xs font-semibold bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full ml-2">Live AI Recommendations</span>
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            {suggestions.map(s => (
              <div key={s.id} className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900">{s.vehicle}</span>
                    <span className={\`text-[10px] font-bold px-2 py-0.5 rounded uppercase \${s.priority === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}\`}>{s.priority} Priority</span>
                  </div>
                  <div className="text-sm text-gray-500 mb-2 flex flex-wrap gap-x-4 gap-y-1">
                    <span>ETA: <strong className="text-gray-700">{s.eta}</strong></span>
                    <span>Cargo: <strong className="text-gray-700">{s.cargo}</strong></span>
                  </div>
                  <p className="text-xs text-blue-600 font-medium">↳ Suggesting Bay #{s.suggestedBay.toString().padStart(2, '0')}: {s.reason}</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button onClick={() => handleApproveSuggestion(s)} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors">
                    <CheckCircle2 size={16} /> Approve
                  </button>
                  <button onClick={() => handleDismissSuggestion(s.id)} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition-colors">
                    <XCircle size={16} /> Ignore
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
`;

code = code.replace(`{/* Dock Grid */}`, suggestionsUI + `\n      {/* Dock Grid */}`);

fs.writeFileSync('src/components/DockScreen.tsx', code);
