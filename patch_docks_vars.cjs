const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const docksDef = `
let seenVehiclesToday = new Set<string>();

const generateTrip = () => {
  const types = ['32ft Container', 'Trailer', '20ft Container', 'LCV', 'Reefer'];
  const type = types[Math.floor(Math.random() * types.length)];
  let vNo;
  do {
    vNo = ['MH', 'DL', 'HR', 'UP', 'GJ'][Math.floor(Math.random()*5)] + '-' + 
          Math.floor(10+Math.random()*90) + '-' + 
          ['AB','XY','PQ','MN'][Math.floor(Math.random()*4)] + '-' + 
          Math.floor(1000+Math.random()*9000);
  } while (seenVehiclesToday.has(vNo));
  
  seenVehiclesToday.add(vNo);
  
  return {
    vehicleNo: vNo,
    vehicleType: type,
    driverName: 'Driver ' + Math.floor(Math.random() * 1000),
    driverMobile: '9' + Math.floor(100000000 + Math.random() * 900000000),
    origin: ['Bhiwandi Hub', 'Delhi NCR', 'Bangalore Hub', 'Chennai Port'][Math.floor(Math.random()*4)],
    material: ['Electronics', 'Apparel', 'FMCG', 'Auto Parts', 'Mixed Retail'][Math.floor(Math.random()*5)],
    quantity: Math.floor(100 + Math.random() * 900),
    distance: Math.floor(50 + Math.random() * 950),
    fuel: Math.floor(20 + Math.random() * 80),
    efficiency: (3 + Math.random() * 3).toFixed(1)
  };
};

let docks: any[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  status: 'Available',
  vehicle: null,
  lastReleasedAt: null
}));

// Pre-fill a few docks
for (let i = 0; i < 5; i++) {
  const dock = docks[Math.floor(Math.random() * 20)];
  if (dock.status === 'Available') {
    dock.status = ['Occupied / Loading', 'Inbound Unloading'][Math.floor(Math.random()*2)];
    dock.vehicle = { ...generateTrip(), assignedAt: Date.now() - Math.floor(Math.random() * 3600000), eta: new Date().toISOString() };
  }
}

let totalInboundToday = docks.filter(d => d.vehicle).reduce((acc, d) => acc + (d.vehicle.quantity || 0), 0);
let totalFuelToday = docks.filter(d => d.vehicle).reduce((acc, d) => acc + (d.vehicle.fuel || 0), 0);

app.get("/api/v3/docks"
`;

code = code.replace('app.get("/api/v3/docks"', docksDef);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts with docks");
