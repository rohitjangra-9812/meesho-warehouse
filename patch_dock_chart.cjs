const fs = require('fs');
let code = fs.readFileSync('src/components/DockScreen.tsx', 'utf8');

// 1. Imports
if (!code.includes('recharts')) {
  const imports = `import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';\n`;
  code = code.replace("import { Truck,", imports + "import { Truck,");
}

// 2. Data
const dataDef = `
const staffingData = [
  { time: '00:00', inbound: 12, outbound: 8, staffing: 15 },
  { time: '04:00', inbound: 15, outbound: 10, staffing: 18 },
  { time: '08:00', inbound: 45, outbound: 35, staffing: 50 },
  { time: '12:00', inbound: 55, outbound: 60, staffing: 65 },
  { time: '16:00', inbound: 40, outbound: 50, staffing: 48 },
  { time: '20:00', inbound: 25, outbound: 20, staffing: 25 },
];
`;
if (!code.includes('staffingData')) {
  code = code.replace("export function DockScreen() {", dataDef + "\nexport function DockScreen() {");
}

// 3. UI
const chartUI = `
      {/* Staffing Demand Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">24H Staffing Demand Forecast</h3>
            <p className="text-sm text-gray-500">Predicted dock activity vs recommended labor allocation</p>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={staffingData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dx={-10} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dx={10} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Area yAxisId="left" type="monotone" dataKey="inbound" name="Inbound Trucks" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorInbound)" />
              <Area yAxisId="left" type="monotone" dataKey="outbound" name="Outbound Trucks" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorOutbound)" />
              <Line yAxisId="right" type="monotone" dataKey="staffing" name="Required Staff" stroke="#f59e0b" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
`;

if (!code.includes('24H Staffing Demand Forecast')) {
  // insert before the dock grid, maybe after stats
  const insertionPoint = `        </div>
      )}

      {/* Docks Grid */}`;
  
  if (code.includes(insertionPoint)) {
    code = code.replace(insertionPoint, `        </div>\n      )}\n\n` + chartUI + `\n      {/* Docks Grid */}`);
  } else {
    // If not found, try something else
    const altInsertion = `        </div>\n      )}\n\n      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6 gap-4">`;
    code = code.replace(altInsertion, `        </div>\n      )}\n\n` + chartUI + `\n      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6 gap-4">`);
  }
}

fs.writeFileSync('src/components/DockScreen.tsx', code);
console.log("Patched chart");
