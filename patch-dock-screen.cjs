const fs = require('fs');
let code = fs.readFileSync('src/components/DockScreen.tsx', 'utf8');

const targetAssign = `    await fetchApi(\`/v3/docks/\${selectedDockId}/assign\`, {
      method: 'POST',
      body: JSON.stringify({
        status: formData.status,
        vehicle: {
          vehicleNo: formData.vehicleNo.toUpperCase(),
          vehicleType: formData.vehicleType,
          driverName: formData.driverName,
          driverMobile: formData.driverMobile,
          origin: formData.origin,
          material: formData.material,
          quantity: formData.quantity,
          distance: formData.distance,
          fuel: formData.fuel,
          efficiency: formData.efficiency
        }
      })
    });
    setIsModalOpen(false);
    fetchDocks();`;

const newAssign = `    try {
      await fetchApi(\`/v3/docks/\${selectedDockId}/assign\`, {
        method: 'POST',
        body: JSON.stringify({
          status: formData.status,
          vehicle: {
            vehicleNo: formData.vehicleNo.toUpperCase(),
            vehicleType: formData.vehicleType,
            driverName: formData.driverName,
            driverMobile: formData.driverMobile,
            origin: formData.origin,
            material: formData.material,
            quantity: formData.quantity,
            distance: formData.distance,
            fuel: formData.fuel,
            efficiency: formData.efficiency
          }
        })
      });
      setIsModalOpen(false);
      fetchDocks();
    } catch (e: any) {
      alert(e.message);
    }`;
    
if (code.includes(targetAssign)) {
    code = code.replace(targetAssign, newAssign);
    fs.writeFileSync('src/components/DockScreen.tsx', code);
    console.log("Patched DockScreen handleAssign");
} else {
    console.log("Could not find handleAssign block");
}
