const fs = require('fs');
let code = fs.readFileSync('src/components/DockScreen.tsx', 'utf8');

const gatePassCode = `
  const [showGatePassModal, setShowGatePassModal] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState<any>(null);
  const [courierPartner, setCourierPartner] = useState('Delhivery');
  const [manifestGenerated, setManifestGenerated] = useState(false);

  const handleOpenGatePass = (dock: any) => {
    setSelectedTruck(dock);
    setShowGatePassModal(true);
    setManifestGenerated(false);
  };

  const generatePDFManifest = () => {
    const doc = new jsPDF();
    doc.text("Meesho Outbound 3PL Courier Handover Manifest", 14, 20);
    doc.setFontSize(10);
    doc.text("Partner: " + courierPartner, 14, 30);
    doc.text("Dock Station: " + (selectedTruck?.bay || 'Dock #04'), 14, 36);
    doc.text("Vehicle Number: KA-01-HH-9920", 14, 42);
    doc.text("Timestamp: " + new Date().toLocaleString(), 14, 48);

    autoTable(doc, {
      startY: 55,
      head: [['AWB Tracking', 'Destination Hub', 'Package Count', 'Weight (Kg)', 'Seal Status']],
      body: [
        ['AWB-8349281X', 'BLR Hub - South', '320 pkgs', '410 kg', 'Intact #9921'],
        ['AWB-1122334X', 'DEL Hub - North', '450 pkgs', '580 kg', 'Intact #9922'],
        ['AWB-5566778Y', 'BOM Hub - West', '280 pkgs', '340 kg', 'Intact #9923'],
      ]
    });

    doc.save("Courier_Manifest_" + courierPartner + ".pdf");
    setManifestGenerated(true);
  };
`;

code = code.replace("export function DockScreen() {", "export function DockScreen() {\n" + gatePassCode);

const dockCardButtonOld = `<button className="w-full py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-colors">
                  Assign / Manage Dock
                </button>`;

const dockCardButtonNew = `<div className="flex gap-2 w-full">
                  <button onClick={() => handleOpenGatePass(dock)} className="flex-1 py-2 bg-[#f43397] hover:bg-pink-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm">
                    🎟️ Gate Pass & 3PL
                  </button>
                  <button className="px-3 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-colors">
                    Manage
                  </button>
                </div>`;

code = code.replace(dockCardButtonOld, dockCardButtonNew);

const modalJSX = `
      {/* Gate Pass & 3PL Courier Handover Modal */}
      {showGatePassModal && selectedTruck && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl relative border border-gray-100">
            <button 
              onClick={() => setShowGatePassModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 font-bold bg-gray-100 p-2 rounded-full"
            >
              ✕
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-pink-50 text-[#f43397] p-3 rounded-2xl">
                <Truck size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">Digital Gate Pass & 3PL Handover</h3>
                <p className="text-xs text-gray-500">Secure outbound logistics verification for truck dispatch</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase">Dock Bay</span>
                  <p className="font-bold text-gray-900">{selectedTruck.bay}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase">Carrier / Vehicle</span>
                  <p className="font-bold text-gray-900">KA-01-MH-8821 (Heavy Container)</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Select 3PL Courier Partner</label>
                <select 
                  value={courierPartner}
                  onChange={(e) => setCourierPartner(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#f43397]"
                >
                  <option value="Delhivery">Delhivery Logistics</option>
                  <option value="Shadowfax">Shadowfax Technologies</option>
                  <option value="Xpressbees">Xpressbees Express</option>
                  <option value="Ecom Express">Ecom Express</option>
                </select>
              </div>

              {/* QR Code & Digital Gate Pass Badge */}
              <div className="bg-pink-50/50 border border-pink-200 p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-pink-600 uppercase tracking-widest">Digital Gate Pass #GP-88921</span>
                  <h4 className="text-lg font-black text-gray-900 mt-1">Verified for Dispatch Exit</h4>
                  <p className="text-xs text-gray-600 mt-0.5">Driver Security PIN: <strong className="text-gray-900 font-mono">9921-OK</strong></p>
                </div>
                <div className="w-16 h-16 bg-white p-2 rounded-xl border border-pink-200 shadow-sm flex items-center justify-center font-mono text-[9px] text-center font-bold text-gray-800">
                  QR GATE PASS
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  onClick={generatePDFManifest}
                  className="flex-1 py-3 bg-[#f43397] hover:bg-pink-700 text-white rounded-xl font-bold text-xs transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  📥 Download 3PL Handover Manifest PDF
                </button>
                <button 
                  onClick={() => setShowGatePassModal(false)}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
`;

// Append before the last closing div of the component
code = code.replace(/(\s*<\/div>\s*)\s*$/, modalJSX + "\n$1");

fs.writeFileSync('src/components/DockScreen.tsx', code);
