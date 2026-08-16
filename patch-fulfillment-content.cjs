const fs = require('fs');
let code = fs.readFileSync('src/components/FulfillmentScreen.tsx', 'utf8');

const pendingContent = `          {activeTab === 'pending' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingOrders.map(order => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4 shadow-sm bg-gray-50 hover:bg-white transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs font-bold text-gray-500 block">ORDER ID</span>
                        <span className="font-mono font-medium text-gray-900">{order.meeshoOrderId}</span>
                      </div>
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                      <div className="text-xs text-gray-500 truncate">{order.shippingAddress}</div>
                    </div>
                    
                    <div className="bg-gray-100 p-2 rounded mb-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-mono text-indigo-600">{order.sku}</span>
                        <span className="font-bold">x{order.quantity}</span>
                      </div>
                    </div>

                    {selectedOrder === order.id ? (
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <ScanLine className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                          <input 
                            type="text" 
                            placeholder="Scan SKU" 
                            className="w-full pl-8 pr-2 py-2 border rounded-md text-sm outline-none focus:border-green-500"
                            value={scanSku}
                            onChange={(e) => setScanSku(e.target.value)}
                            autoFocus
                          />
                        </div>
                        <button 
                          onClick={() => handlePack(order.id, scanSku)}
                          className="bg-green-600 text-white px-3 rounded-md text-sm font-medium hover:bg-green-700"
                        >
                          Pack
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setSelectedOrder(order.id)}
                        className="w-full border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Start Packing
                      </button>
                    )}
                  </div>
                ))}
                {pendingOrders.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    No pending orders to pack.
                  </div>
                )}
              </div>
            </div>
          )}`;

const packedContent = `          {activeTab === 'packed' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order Details</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Packed By</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {packedOrders.map(order => {
                    const ext = getOrderExtendedDetails(order);
                    return (
                      <tr key={order.id}>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 font-mono">{order.meeshoOrderId}</div>
                          <div className="text-xs text-gray-500 mt-1">{order.sku} (x{order.quantity})</div>
                          <div className="text-xs text-gray-500 truncate max-w-[200px]">{order.shippingAddress}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{ext.employeeName}</div>
                              <div className="text-xs text-gray-500 font-mono">{ext.employeeId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {ext.packedTimestamp}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button 
                            onClick={() => generateLabel(order)}
                            className="flex items-center gap-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                          >
                            <Printer className="w-4 h-4" /> Generate Label
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {packedOrders.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No packed orders awaiting dispatch.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}`;

const inProgressContent = `          {activeTab === 'in_progress' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order Details</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Target Location</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inProgressOrders.map(order => {
                    const ext = getOrderExtendedDetails(order);
                    return (
                      <tr key={order.id}>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 font-mono">{order.meeshoOrderId}</div>
                          <div className="text-xs text-gray-500 mt-1">{order.sku} (x{order.quantity})</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm text-gray-900">
                            <MapPin className="w-4 h-4 text-gray-400" /> {ext.transferLocation}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center gap-1 w-max">
                             <Clock className="w-3 h-3" /> Being Packed
                           </span>
                        </td>
                      </tr>
                    );
                  })}
                  {inProgressOrders.length === 0 && (
                    <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">No orders currently in progress.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}`;

const trackingContent = `          {activeTab === 'tracking' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 max-w-5xl mx-auto">
                {dispatchedOrders.map(order => {
                  const ext = getOrderExtendedDetails(order);
                  return (
                    <div key={order.id} className="border border-gray-200 rounded-xl p-5 shadow-sm bg-white hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <span className="text-xs text-gray-500 block uppercase tracking-wider">Tracking ID</span>
                          <span className="font-mono text-lg font-bold text-indigo-700">{order.trackingId || 'PENDING-TRK'}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-500 block uppercase tracking-wider">Courier</span>
                          <span className="font-medium text-gray-900 flex items-center gap-1 justify-end">
                            <Truck className="w-4 h-4 text-gray-400" /> {order.courierPartner || 'Assigned Courier'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-100 pt-4 mb-4 grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs text-gray-500 block">Destination</span>
                          <div className="text-sm font-medium text-gray-900 flex items-start gap-1 mt-1">
                            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                            <span className="line-clamp-2">{order.shippingAddress}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 block">Assigned Vehicle</span>
                          <div className="text-sm font-medium font-mono text-gray-900 flex items-center gap-1 mt-1">
                            <Hash className="w-4 h-4 text-gray-400" /> {ext.vehicleNumber}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg">
                         <div className="text-xs font-semibold text-gray-500 mb-1">Order Details</div>
                         <div className="flex justify-between text-sm">
                           <span className="font-mono">{order.sku}</span>
                           <span className="font-bold">x{order.quantity}</span>
                         </div>
                      </div>
                    </div>
                  );
                })}
                {dispatchedOrders.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500">No active shipments in transit.</div>
                )}
              </div>
            </div>
          )}`;

const startIdx = code.indexOf("{activeTab === 'pending' && (");
const endIdx = code.indexOf("</div>\n      </div>\n      {generatedLabel && (");

const before = code.substring(0, startIdx);
const after = code.substring(endIdx);

code = before + "\n" + trackingContent + "\n" + packedContent + "\n" + inProgressContent + "\n" + pendingContent + "\n        " + after;

fs.writeFileSync('src/components/FulfillmentScreen.tsx', code);
