const fs = require('fs');
let code = fs.readFileSync('src/components/DockScreen.tsx', 'utf8');

const badStateBlock = `
  const [lookupMode, setLookupMode] = useState(true);
  const [vehicleHistory, setVehicleHistory] = useState<any[]>([]);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [assignTargetBay, setAssignTargetBay] = useState<number | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!formData.vehicleNo) return;
    setIsLookingUp(true);
    try {
      const res = await fetchApi(\`/v3/vehicles/\${formData.vehicleNo}/history\`);
      setVehicleHistory(res.history || []);
      if(res.history && res.history.length > 0) {
        const last = res.history[res.history.length - 1];
        setFormData(prev => ({
          ...prev, 
          driverName: last.driver || prev.driverName,
          material: last.cargo || prev.material
        }));
      }
    } catch(err) {
      console.error(err);
      setVehicleHistory([]);
    } finally {
      setIsLookingUp(false);
      setLookupMode(false);
    }
  };

  const handleReleaseWithConfirm = (id: number) => {
    if (window.confirm("Are you sure you want to release this bay and archive the trip data?")) {
      handleRelease(id);
    }
  };
`;

code = code.replace(badStateBlock, ""); // Delete the second occurrence 
fs.writeFileSync('src/components/DockScreen.tsx', code);
console.log("Fixed dupes");
