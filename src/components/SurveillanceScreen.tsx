import React, { useState, useEffect } from 'react';
import { Video, Maximize, AlertTriangle, ShieldAlert, Camera, Map, Grid, LayoutGrid, LayoutList, Crosshair } from 'lucide-react';

const ZONES = [
  'Dock Bays', 'Inbound Staging', 'Aisle Zones A-M', 
  'High-Value Storage', 'Outbound Packing', 'Perimeter Gates', 'Break Rooms', 'Server Room'
];

const RESTRICTED_ZONES = ['High-Value Storage', 'Server Room'];

// Generate 50 cameras
const CAMERAS = Array.from({ length: 50 }, (_, i) => {
  const zone = ZONES[Math.floor(Math.random() * ZONES.length)];
  return {
    id: `CAM-${(i + 1).toString().padStart(2, '0')}`,
    name: `${zone} Cam ${Math.floor(Math.random() * 10)}`,
    zone: zone,
    isRestricted: RESTRICTED_ZONES.includes(zone),
    x: Math.floor(Math.random() * 90) + 5, // 5% to 95%
    y: Math.floor(Math.random() * 90) + 5,
  };
});

const MOCK_ALERTS = [
  { id: 1, time: '10:42:15', cam: 'CAM-12', msg: 'Motion in High-Value Storage', type: 'warning' },
  { id: 2, time: '10:35:00', cam: 'CAM-45', msg: 'Unauthorized access Server Room', type: 'critical' },
  { id: 3, time: '10:15:22', cam: 'CAM-08', msg: 'Forklift speeding Zone B', type: 'info' },
  { id: 4, time: '09:50:11', cam: 'CAM-02', msg: 'Tailgating at Perimeter Gate 2', type: 'warning' },
];

const VIDEO_SOURCES = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4'
];

const LiveFeed: React.FC<{ cam: any }> = ({ cam }) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [overlay, setOverlay] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    const aiTimer = setInterval(() => {
      const overlays = ['Person Tracking', 'Motion Detected', 'Forklift Active', null, null];
      setOverlay(overlays[Math.floor(Math.random() * overlays.length)]);
    }, 5000);
    return () => {
      clearInterval(timer);
      clearInterval(aiTimer);
    };
  }, []);

  if (!cam) {
    return (
      <div className="bg-gray-900 rounded-lg border border-gray-800 flex items-center justify-center h-full min-h-[200px]">
        <div className="text-gray-600 flex flex-col items-center gap-2">
          <Video size={32} />
          <span className="text-sm font-medium">NO SIGNAL / SELECT CAMERA</span>
        </div>
      </div>
    );
  }

  const camIndex = parseInt(cam.id.replace('CAM-', ''), 10) || 1;
  const videoSrc = VIDEO_SOURCES[(camIndex - 1) % VIDEO_SOURCES.length];

  return (
    <div className="relative bg-gray-950 rounded-lg border border-gray-800 overflow-hidden h-full min-h-[200px] flex flex-col">
      {/* Live Looping Warehouse Video Feed */}
      <video
        autoPlay
        muted
        loop
        playsInline
        src={videoSrc}
        className="absolute inset-0 w-full h-full object-cover opacity-75 contrast-125 brightness-90 filter"
        onError={(e) => {
          (e.target as HTMLElement).style.display = 'none';
        }}
      />

      {/* CCTV Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-40"></div>
      
      {/* Top Overlay */}
      <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start z-10 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-white">
            <span className="font-mono text-sm font-bold bg-black/60 px-2 py-0.5 rounded border border-gray-700">{cam.id}</span>
            <span className="text-xs font-semibold text-gray-200 truncate max-w-[150px] drop-shadow-md">{cam.name}</span>
          </div>
          {cam.isRestricted && (
             <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-600/90 text-white rounded w-max animate-pulse">RESTRICTED ZONE</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-black/60 rounded border border-red-900/50 text-red-500 font-bold text-xs font-mono">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
            REC
          </div>
        </div>
      </div>

      {/* Center AI Bounding Box (mock) */}
      {overlay && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-40 border-2 border-green-500/60 rounded-sm z-10 pointer-events-none">
          <div className="absolute -top-5 left-0 bg-green-500/90 text-black text-[9px] font-bold px-1 py-0.5 whitespace-nowrap">
            {overlay} [98.4%]
          </div>
          <Crosshair className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green-500/40" size={48} />
        </div>
      )}

      {/* Bottom Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between items-end z-10 bg-gradient-to-t from-black/80 to-transparent">
        <span className="text-white font-mono text-xs bg-black/50 px-2 py-0.5 rounded border border-gray-800">{time}</span>
        <button className="text-gray-300 hover:text-white transition-colors bg-black/40 p-1 rounded">
          <Maximize size={16} />
        </button>
      </div>
    </div>
  );
};

export const SurveillanceScreen = () => {
  const [layout, setLayout] = useState<1 | 4 | 9>(4);
  const [activeCams, setActiveCams] = useState<any[]>(CAMERAS.slice(0, 4));

  const handleCameraClick = (cam: any) => {
    // If layout is 1, replace. If more, cycle or add.
    if (layout === 1) {
      setActiveCams([cam]);
    } else {
      if (activeCams.find(c => c.id === cam.id)) return; // already active
      const newActive = [cam, ...activeCams].slice(0, layout);
      setActiveCams(newActive);
    }
  };

  const handleLayoutChange = (size: 1 | 4 | 9) => {
    setLayout(size);
    if (activeCams.length > size) {
      setActiveCams(activeCams.slice(0, size));
    } else if (activeCams.length < size) {
      const needed = size - activeCams.length;
      const unused = CAMERAS.filter(c => !activeCams.includes(c)).slice(0, needed);
      setActiveCams([...activeCams, ...unused]);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Video className="text-blue-600" />
            CCTV & Security Surveillance
          </h2>
          <p className="text-sm text-gray-500">Live warehouse feeds and automated AI security monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
            <button onClick={() => handleLayoutChange(1)} className={`p-2 rounded-md transition-colors ${layout === 1 ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}><Maximize size={18} /></button>
            <button onClick={() => handleLayoutChange(4)} className={`p-2 rounded-md transition-colors ${layout === 4 ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}><Grid size={18} /></button>
            <button onClick={() => handleLayoutChange(9)} className={`p-2 rounded-md transition-colors ${layout === 9 ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}><LayoutGrid size={18} /></button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-[600px]">
        {/* Left Side: Feeds */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className={`grid gap-4 flex-1 ${
            layout === 1 ? 'grid-cols-1' : 
            layout === 4 ? 'grid-cols-2 grid-rows-2' : 
            'grid-cols-3 grid-rows-3'
          }`}>
            {Array.from({ length: layout }).map((_, i) => (
              <LiveFeed key={i} cam={activeCams[i]} />
            ))}
          </div>
        </div>

        {/* Right Side: Map & Alerts */}
        <div className="flex flex-col gap-6">
          {/* Interactive Floor Plan */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Map size={18} className="text-gray-500" />
                Facility Map
              </h3>
            </div>
            <div className="p-4 bg-gray-50">
              <div className="relative w-full aspect-square bg-gray-200 rounded-lg border-2 border-gray-300 overflow-hidden">
                {/* Mock Zones */}
                <div className="absolute top-4 left-4 w-1/3 h-1/4 bg-blue-100/50 border border-blue-200 text-[10px] text-blue-800 font-bold p-1">Docks</div>
                <div className="absolute bottom-4 right-4 w-1/4 h-1/3 bg-red-100/50 border border-red-200 text-[10px] text-red-800 font-bold p-1">Vault</div>
                <div className="absolute top-1/2 left-1/3 w-1/4 h-1/4 bg-yellow-100/50 border border-yellow-200 text-[10px] text-yellow-800 font-bold p-1">Staging</div>
                
                {/* Camera Pins */}
                {CAMERAS.map((cam) => {
                  const isActive = activeCams.some(c => c.id === cam.id);
                  return (
                    <button 
                      key={cam.id}
                      onClick={() => handleCameraClick(cam)}
                      className={`absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full border shadow-sm transition-transform hover:scale-125 z-10 ${
                        isActive ? 'bg-blue-500 border-white scale-125' : 
                        cam.isRestricted ? 'bg-red-500 border-white' : 'bg-gray-400 border-white'
                      }`}
                      style={{ top: `${cam.y}%`, left: `${cam.x}%` }}
                      title={`${cam.id}: ${cam.name}`}
                    />
                  );
                })}
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Active</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Restricted</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-400"></div> Standard</div>
              </div>
            </div>
          </div>

          {/* Security Alerts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 flex flex-col min-h-[250px]">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <ShieldAlert size={18} className="text-red-500" />
                Security Alerts
              </h3>
              <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">{MOCK_ALERTS.length} New</span>
            </div>
            <div className="p-2 overflow-y-auto flex-1">
              <div className="space-y-2">
                {MOCK_ALERTS.map((alert) => (
                  <div key={alert.id} className={`p-3 rounded-lg border flex flex-col gap-2 ${
                    alert.type === 'critical' ? 'bg-red-50 border-red-100' :
                    alert.type === 'warning' ? 'bg-yellow-50 border-yellow-100' : 'bg-gray-50 border-gray-100'
                  }`}>
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold font-mono text-gray-500">{alert.time}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        alert.type === 'critical' ? 'bg-red-200 text-red-800' :
                        alert.type === 'warning' ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-800'
                      }`}>
                        {alert.cam}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{alert.msg}</p>
                    <button className="mt-1 flex items-center justify-center gap-1 w-full py-1.5 bg-white border border-gray-200 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                      <Camera size={14} /> View Snap
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
