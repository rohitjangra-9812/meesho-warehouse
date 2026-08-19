const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `      const vNo = req.body.vehicle.vehicleNo;
      if (!seenVehiclesToday.has(vNo)) {
         seenVehiclesToday.add(vNo);
      }`;
const replacement = `      const vNo = req.body.vehicle.vehicleNo;
      if (seenVehiclesToday.has(vNo)) {
         return res.status(400).json({error: 'Duplicate vehicle entry: This vehicle has already been assigned today.'});
      }
      seenVehiclesToday.add(vNo);`;
      
if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('server.ts', code);
    console.log("Patched duplicate vehicle check");
} else {
    console.log("Could not find target block");
}
