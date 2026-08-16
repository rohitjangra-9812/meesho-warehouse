const fs = require('fs');
const file = 'src/components/InventoryScreen.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
`import { Boxes, Search, AlertTriangle, CheckCircle2, ShieldAlert, Truck, DollarSign } from 'lucide-react';`,
`import { Boxes, Search, AlertTriangle, CheckCircle2, ShieldAlert, Truck, DollarSign, Download } from 'lucide-react';`
);

code = code.replace(
`  const filteredProducts = products.filter(p => 
     p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     (p.sourceVehicle && p.sourceVehicle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (`,
`  const filteredProducts = products.filter(p => 
     p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     (p.sourceVehicle && p.sourceVehicle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const exportToCSV = () => {
    if (filteredProducts.length === 0) return;

    const headers = ['SKU', 'Name', 'Category', 'Stock Quantity', 'Low Stock Threshold', 'Price', 'Source Vehicle', 'Quality Rate'];
    
    const csvRows = [
      headers.join(','),
      ...filteredProducts.map(p => {
        return [
          \`"\${p.sku}"\`,
          \`"\${p.name}"\`,
          \`"\${p.category || ''}"\`,
          p.stockQuantity,
          p.lowStockThreshold || 20,
          p.price || 0,
          \`"\${p.sourceVehicle || ''}"\`,
          \`"\${p.qualityRate || ''}"\`
        ].join(',');
      })
    ];

    const csvContent = csvRows.join('\\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', \`inventory_export_\${new Date().toISOString().split('T')[0]}.csv\`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (`
);

code = code.replace(
`          <button 
             onClick={handleSeed}
            disabled={loading}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            Refresh Data
          </button>`,
`          <button 
            onClick={exportToCSV}
            disabled={loading || filteredProducts.length === 0}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button 
             onClick={handleSeed}
            disabled={loading}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            Refresh Data
          </button>`
);

fs.writeFileSync(file, code);
