const fs = require('fs');
const file = 'src/components/InventoryScreen.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
`                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-gray-900">{product.stockQuantity}</span>
                        {product.stockQuantity <= (product.lowStockThreshold || 20) && (
                           <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded">
                             <AlertTriangle className="w-3 h-3" />
                             <span className="text-[10px] font-bold uppercase tracking-wider">Low</span>
                           </div>
                        )}
                      </div>
                    </td>`,
`                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={\`text-base font-bold \${product.stockQuantity <= (product.lowStockThreshold || 20) ? 'text-red-600' : 'text-gray-900'}\`}>
                          {product.stockQuantity}
                        </span>
                        {product.stockQuantity <= (product.lowStockThreshold || 20) && (
                           <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-200">
                             <AlertTriangle className="w-3.5 h-3.5" />
                             <span className="text-[10px] font-bold uppercase tracking-wider">Low Stock</span>
                           </div>
                        )}
                      </div>
                    </td>`
);

fs.writeFileSync(file, code);
