const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardScreen.tsx', 'utf8');

const capacityGaugeCode = `
      {/* KPI Cards & Storage */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className={\`\${card.bg} p-4 rounded-xl\`}>
                  <Icon className={\`w-6 h-6 \${card.color}\`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{card.title}</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{card.value}</h3>
                </div>
              </div>
            );
          })}
        </div>

        {/* Circular Progress Gauge */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center relative lg:col-span-1 sm:col-span-2">
           <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 self-start w-full text-center">Storage Capacity</h3>
           <div className="relative flex items-center justify-center my-2">
             <svg height="120" width="120" className="rotate-[-90deg]">
               <circle
                 stroke="#f3f4f6"
                 fill="transparent"
                 strokeWidth="12"
                 r="48"
                 cx="60"
                 cy="60"
               />
               <circle
                 stroke="#f43397"
                 fill="transparent"
                 strokeWidth="12"
                 strokeDasharray={301.59}
                 strokeDashoffset={301.59 - (84.5 * 301.59) / 100}
                 strokeLinecap="round"
                 r="48"
                 cx="60"
                 cy="60"
                 className="transition-all duration-1000 ease-out"
               />
             </svg>
             <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-gray-900">84.5%</span>
             </div>
           </div>
           <div className="mt-2 flex justify-between w-full text-xs font-semibold px-2">
              <span className="text-gray-500">Filled: <span className="text-gray-900">84,520</span></span>
              <span className="text-gray-500">Limit: <span className="text-gray-900">100,000</span></span>
           </div>
        </div>
      </div>
`;

code = code.replace(
  /<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">[\s\S]*?\{statCards\.map\(\(card, i\) => \{[\s\S]*?\}<\/div>/,
  capacityGaugeCode
);

fs.writeFileSync('src/components/DashboardScreen.tsx', code);
