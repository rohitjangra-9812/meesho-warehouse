const fs = require('fs');
let code = fs.readFileSync('src/components/FulfillmentScreen.tsx', 'utf8');

// 1. imports
code = code.replace(
  "import { PackageOpen, Printer, ScanLine, Truck, CheckCircle, Clock } from 'lucide-react';",
  "import { PackageOpen, Printer, ScanLine, Truck, CheckCircle, Clock, MapPin, User, Hash } from 'lucide-react';"
);

// 2. state
code = code.replace(
  "const [activeTab, setActiveTab] = useState<'pending' | 'packed' | 'tracking'>('pending');",
  "const [activeTab, setActiveTab] = useState<'tracking' | 'packed' | 'in_progress' | 'pending'>('tracking');"
);

// 3. filter logic
const filterLogic = `
  const getOrderExtendedDetails = (order: Order) => {
    const hash = order.id * 12345;
    const vehicleId = \`TRK-\${(hash % 9000) + 1000}\`;
    const empId = \`EMP-\${(hash % 900) + 100}\`;
    const empName = ['Rahul S.', 'Priya M.', 'Amit K.', 'Sneha V.', 'Vikas R.'][hash % 5];
    const packedTime = new Date(new Date(order.createdAt).getTime() + (hash % 10000000)).toLocaleString();
    const dest = ['Mumbai Hub', 'Delhi Node', 'Bangalore Central', 'Chennai Sort', 'Kolkata Depot'][hash % 5];
    
    return {
      vehicleNumber: vehicleId,
      employeeId: empId,
      employeeName: empName,
      packedTimestamp: packedTime,
      transferLocation: dest
    };
  };

  const pendingOrders = orders.filter(o => o.status === 'Pending');
  const inProgressOrders = orders.filter(o => o.status === 'Ready');
  const packedOrders = orders.filter(o => o.status === 'Packed');
  const dispatchedOrders = orders.filter(o => o.status === 'Dispatched' || o.trackingId);
`;

code = code.replace(
  /const pendingOrders = [^\n]+\n  const packedOrders = [^\n]+\n  const dispatchedOrders = [^\n]+/,
  filterLogic.trim()
);

// 4. Update the Tab headers
const oldTabs = `        <div className="flex border-b border-gray-200">
          <button 
            className={\`flex-1 py-3 px-4 text-sm font-medium transition-colors \${activeTab === 'pending' ? 'bg-green-50 text-green-700 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}\`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Orders ({pendingOrders.length})
          </button>
          <button 
            className={\`flex-1 py-3 px-4 text-sm font-medium transition-colors \${activeTab === 'packed' ? 'bg-green-50 text-green-700 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}\`}
            onClick={() => setActiveTab('packed')}
          >
            Packed & Ready ({packedOrders.length})
          </button>
          <button 
            className={\`flex-1 py-3 px-4 text-sm font-medium transition-colors \${activeTab === 'tracking' ? 'bg-green-50 text-green-700 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}\`}
            onClick={() => setActiveTab('tracking')}
          >
            Active Shipments ({dispatchedOrders.length})
          </button>
        </div>`;

const newTabs = `        <div className="flex border-b border-gray-200 overflow-x-auto">
          <button 
            className={\`whitespace-nowrap flex-1 py-3 px-4 text-sm font-medium transition-colors \${activeTab === 'tracking' ? 'bg-green-50 text-green-700 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}\`}
            onClick={() => setActiveTab('tracking')}
          >
            Active Shipments ({dispatchedOrders.length})
          </button>
          <button 
            className={\`whitespace-nowrap flex-1 py-3 px-4 text-sm font-medium transition-colors \${activeTab === 'packed' ? 'bg-green-50 text-green-700 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}\`}
            onClick={() => setActiveTab('packed')}
          >
            Packed & Ready ({packedOrders.length})
          </button>
          <button 
            className={\`whitespace-nowrap flex-1 py-3 px-4 text-sm font-medium transition-colors \${activeTab === 'in_progress' ? 'bg-green-50 text-green-700 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}\`}
            onClick={() => setActiveTab('in_progress')}
          >
            In Progress ({inProgressOrders.length})
          </button>
          <button 
            className={\`whitespace-nowrap flex-1 py-3 px-4 text-sm font-medium transition-colors \${activeTab === 'pending' ? 'bg-green-50 text-green-700 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}\`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Orders ({pendingOrders.length})
          </button>
        </div>`;
code = code.replace(oldTabs, newTabs);

fs.writeFileSync('src/components/FulfillmentScreen.tsx', code);
