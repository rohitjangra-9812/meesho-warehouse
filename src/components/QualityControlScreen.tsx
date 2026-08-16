import React, { useState, useEffect } from 'react';
import { fetchApi } from '../lib/api.ts';
import { CheckSquare, ShieldAlert, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export function QualityControlScreen() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/inspections');
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('auto-refresh', loadData);
    return () => window.removeEventListener('auto-refresh', loadData);
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-red-100 p-2 rounded-lg">
            <CheckSquare className="text-red-600 h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">QC & Inspection Gate</h2>
            <p className="text-sm text-gray-500">Track pass/fail metrics, defect categories, and quarantine holds for incoming shipments</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shipment ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inspector</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Result</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Defect Category</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Quarantine Hold</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center">Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No inspections found</td></tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.shipmentId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.inspector}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {item.passFail === 'Pass' ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
                         item.passFail === 'Fail' ? <XCircle className="h-4 w-4 text-red-500" /> : 
                         <AlertTriangle className="h-4 w-4 text-amber-500" />}
                        <span className={`text-sm font-medium ${item.passFail === 'Pass' ? 'text-green-700' : item.passFail === 'Fail' ? 'text-red-700' : 'text-amber-700'}`}>
                          {item.passFail}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.defectCategory || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {item.quarantineHold ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Hold Active
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
