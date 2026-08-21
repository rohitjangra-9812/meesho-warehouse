import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, Maximize, AlertTriangle, ShieldAlert, Camera, Map, Grid, 
  LayoutGrid, LayoutList, Crosshair, Users, Truck, Sparkles, Shield, 
  Radio, Eye, ZoomIn, ZoomOut, RefreshCw, Download, CheckCircle, 
  SlidersHorizontal, ChevronRight, Activity, Zap, Play, Pause, Volume2, 
  VolumeX, Clock, Layers, Flame, Moon, Sun, Lock
} from 'lucide-react';

export interface CameraData {
  id: string;
  name: string;
  zone: string;
  type: 'docks' | 'sorting' | 'picking' | 'dispatch' | 'vault' | 'perimeter' | 'server' | 'general';
  isRestricted: boolean;
  workerCount: number;
  forkliftCount: number;
  fps: number;
  bitrate: string;
  resolution: string;
  x: number;
  y: number;
  status: 'Online' | 'Recording' | 'Alert';
}

const ZONES = [
  'Inbound Docks', 
  'Sorting Line', 
  'Picking Aisles', 
  'Dispatch & Staging', 
  'High-Value Storage', 
  'Perimeter Gates', 
  'Server Room', 
  'Break Rooms'
];

const ZONE_TYPES: Record<string, CameraData['type']> = {
  'Inbound Docks': 'docks',
  'Sorting Line': 'sorting',
  'Picking Aisles': 'picking',
  'Dispatch & Staging': 'dispatch',
  'High-Value Storage': 'vault',
  'Perimeter Gates': 'perimeter',
  'Server Room': 'server',
  'Break Rooms': 'general'
};

const RESTRICTED_ZONES = ['High-Value Storage', 'Server Room'];

// Generate 50 unique warehouse cameras
export const CAMERAS: CameraData[] = Array.from({ length: 50 }, (_, i) => {
  const zoneIndex = i % ZONES.length;
  const zone = ZONES[zoneIndex];
  const type = ZONE_TYPES[zone] || 'general';
  const isRestricted = RESTRICTED_ZONES.includes(zone);
  
  // Specific worker counts based on zone
  let workerCount = 4;
  let forkliftCount = 0;
  if (type === 'docks') { workerCount = 8 + (i % 7); forkliftCount = 2 + (i % 3); }
  else if (type === 'sorting') { workerCount = 12 + (i % 6); forkliftCount = 1; }
  else if (type === 'picking') { workerCount = 14 + (i % 8); forkliftCount = 3 + (i % 2); }
  else if (type === 'dispatch') { workerCount = 10 + (i % 5); forkliftCount = 2 + (i % 2); }
  else if (type === 'vault') { workerCount = 1 + (i % 2); forkliftCount = 0; }
  else if (type === 'perimeter') { workerCount = 2; forkliftCount = 1; }
  else if (type === 'server') { workerCount = 1; forkliftCount = 0; }
  else { workerCount = 5 + (i % 5); forkliftCount = 0; }

  return {
    id: `CAM-${(i + 1).toString().padStart(2, '0')}`,
    name: `${zone} - Unit ${(Math.floor(i / ZONES.length) + 1).toString().padStart(2, '0')}`,
    zone,
    type,
    isRestricted,
    workerCount,
    forkliftCount,
    fps: 30 + (i % 30),
    bitrate: `${4.2 + (i % 5) * 0.3} Mbps`,
    resolution: '4K UHD (3840x2160)',
    x: Math.floor(10 + (i * 17) % 80),
    y: Math.floor(12 + (i * 23) % 78),
    status: isRestricted ? 'Recording' : 'Online'
  };
});

const MOCK_ALERTS = [
  { id: 1, time: '13:08:12', cam: 'CAM-05', zone: 'High-Value Storage', msg: 'Motion Detected: Security Cage B - Badge ID #EMP-1042', type: 'critical' },
  { id: 2, time: '13:02:44', cam: 'CAM-03', zone: 'Picking Aisles', msg: 'Forklift Safety Proximity Alert: Aisle 04 (Clearance 1.2m)', type: 'warning' },
  { id: 3, time: '12:55:10', cam: 'CAM-01', zone: 'Inbound Docks', msg: 'Dock Bay 02: Trailer DL-01-AX-3310 Inbound Unload Completed', type: 'info' },
  { id: 4, time: '12:48:30', cam: 'CAM-02', zone: 'Sorting Line', msg: 'Sorting Line Conveyor 02: High-Speed Barcode Scan Sync (99.8%)', type: 'info' },
];

export type VisionMode = 'color' | 'night' | 'thermal' | 'matrix';

interface LiveFeedProps {
  key?: React.Key;
  cam: CameraData;
  onMaximize?: (cam: CameraData) => void;
  isExpanded?: boolean;
}

export function AnimatedWarehouseCanvas({ cam, visionMode = 'color', zoomLevel = 1 }: { cam: CameraData; visionMode?: VisionMode; zoomLevel?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let tick = 0;

    // Simulation entities for this camera
    const workers = Array.from({ length: cam.workerCount }, (_, index) => ({
      id: `W-${100 + index}`,
      x: 50 + (index * 80) % 540,
      y: 70 + (index * 55) % 220,
      targetX: 50 + Math.random() * 500,
      targetY: 60 + Math.random() * 230,
      speed: 0.8 + Math.random() * 0.7,
      vestColor: index % 2 === 0 ? '#f97316' : '#eab308', // Neon Orange / Yellow Hi-Vis
      hasCart: index % 3 === 0,
      action: index % 4 === 0 ? 'Scanning' : index % 3 === 0 ? 'Transporting' : 'Inspecting'
    }));

    const forklifts = Array.from({ length: cam.forkliftCount }, (_, index) => ({
      id: `FL-${(index + 1).toString().padStart(2, '0')}`,
      x: 80 + index * 200,
      y: 120 + (index * 80) % 180,
      direction: 1,
      speed: 1.2 + index * 0.3,
      hasLoad: true
    }));

    const render = () => {
      tick++;
      const width = canvas.width;
      const height = canvas.height;

      // Clear Canvas
      ctx.save();
      ctx.clearRect(0, 0, width, height);

      // Background Tone depending on Vision Mode
      if (visionMode === 'night') {
        ctx.fillStyle = '#051807'; // Deep night-vision green
      } else if (visionMode === 'thermal') {
        ctx.fillStyle = '#090014'; // Thermal FLIR dark violet
      } else if (visionMode === 'matrix') {
        ctx.fillStyle = '#020b08'; // Cyber grid dark
      } else {
        ctx.fillStyle = '#0f172a'; // Deep Navy Slate for CCTV
      }
      ctx.fillRect(0, 0, width, height);

      // Floor Grid
      ctx.strokeStyle = visionMode === 'night' ? 'rgba(34, 197, 94, 0.15)' : 
                        visionMode === 'thermal' ? 'rgba(168, 85, 247, 0.12)' : 
                        visionMode === 'matrix' ? 'rgba(16, 185, 129, 0.25)' : 
                        'rgba(51, 65, 85, 0.35)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Warehouse Scene Architecture based on Camera Type
      if (cam.type === 'docks') {
        // Render Inbound Docks Bay
        // Dock Bay Doors
        for (let b = 0; b < 4; b++) {
          const bayX = 60 + b * 135;
          ctx.fillStyle = visionMode === 'night' ? '#0f391b' : visionMode === 'thermal' ? '#2e1065' : '#1e293b';
          ctx.fillRect(bayX, 20, 100, 70);
          ctx.strokeStyle = visionMode === 'night' ? '#22c55e' : '#64748b';
          ctx.strokeRect(bayX, 20, 100, 70);

          // Dock Roller Door Slats
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
          for (let s = 25; s < 85; s += 8) {
            ctx.beginPath();
            ctx.moveTo(bayX, s);
            ctx.lineTo(bayX + 100, s);
            ctx.stroke();
          }

          // Dock Bay Label
          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 10px monospace';
          ctx.fillText(`BAY 0${b + 1}`, bayX + 30, 40);

          // Dock Leveler & Truck Outline
          if (b % 2 === 0) {
            ctx.fillStyle = visionMode === 'night' ? '#166534' : visionMode === 'thermal' ? '#7c2d12' : '#0369a1';
            ctx.fillRect(bayX + 15, 60, 70, 30);
            ctx.fillStyle = '#38bdf8';
            ctx.font = '8px sans-serif';
            ctx.fillText(b === 0 ? 'HR-55-TRUCK' : 'DL-01-EXP', bayX + 20, 78);
          }
        }

        // Staging Pallets
        for (let p = 0; p < 8; p++) {
          const px = 70 + (p * 65);
          const py = 120 + (p % 2) * 45;
          ctx.fillStyle = visionMode === 'night' ? '#14532d' : visionMode === 'thermal' ? '#c2410c' : '#78350f';
          ctx.fillRect(px, py, 28, 28);
          ctx.strokeStyle = '#f59e0b';
          ctx.strokeRect(px, py, 28, 28);
        }
      } else if (cam.type === 'sorting') {
        // Render Sorting Conveyor Lines
        const beltY1 = 110;
        const beltY2 = 210;

        // Conveyor Belts
        [beltY1, beltY2].forEach((by, idx) => {
          ctx.fillStyle = visionMode === 'night' ? '#064e3b' : visionMode === 'thermal' ? '#3b0764' : '#1e293b';
          ctx.fillRect(30, by, width - 60, 38);
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 2;
          ctx.strokeRect(30, by, width - 60, 38);

          // Moving Rollers
          const rollerOffset = (tick * 2) % 30;
          ctx.strokeStyle = 'rgba(255,255,255,0.2)';
          ctx.lineWidth = 1;
          for (let rx = 30 + rollerOffset; rx < width - 60; rx += 30) {
            ctx.beginPath();
            ctx.moveTo(rx, by);
            ctx.lineTo(rx, by + 38);
            ctx.stroke();
          }

          // Moving Packages on Conveyor
          for (let k = 0; k < 6; k++) {
            const pkgX = 40 + ((tick * (1.5 + idx * 0.5) + k * 95) % (width - 120));
            ctx.fillStyle = visionMode === 'thermal' ? '#ea580c' : (k % 2 === 0 ? '#d97706' : '#ca8a04');
            ctx.fillRect(pkgX, by + 8, 24, 22);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(pkgX, by + 8, 24, 22);

            // Barcode on package
            ctx.fillStyle = '#000000';
            ctx.fillRect(pkgX + 4, by + 12, 16, 6);
          }

          // Laser Scanner Arch
          const scanX = 260 + (idx * 120);
          ctx.fillStyle = '#475569';
          ctx.fillRect(scanX - 6, by - 14, 12, 14);
          ctx.fillRect(scanX - 6, by + 38, 12, 14);

          // Red Scanning Laser line with pulsing glow
          const laserAlpha = 0.5 + Math.sin(tick * 0.15) * 0.4;
          ctx.strokeStyle = `rgba(239, 68, 68, ${laserAlpha})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(scanX, by - 10);
          ctx.lineTo(scanX, by + 48);
          ctx.stroke();
        });
      } else if (cam.type === 'picking') {
        // High-Bay Pallet Racks (Aisles Perspective)
        const aisles = [40, 180, 320, 460];
        aisles.forEach((ax, aIdx) => {
          ctx.fillStyle = visionMode === 'night' ? '#064e3b' : visionMode === 'thermal' ? '#4c1d95' : '#1e293b';
          ctx.fillRect(ax, 30, 90, 240);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(ax, 30, 90, 240);

          // Racking Shelves
          for (let sy = 55; sy < 260; sy += 38) {
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
            ctx.beginPath();
            ctx.moveTo(ax, sy);
            ctx.lineTo(ax + 90, sy);
            ctx.stroke();

            // Bin storage boxes on shelf
            for (let bx = 0; bx < 3; bx++) {
              ctx.fillStyle = visionMode === 'thermal' ? (bx === 1 ? '#e11d48' : '#d97706') : 
                              (bx === 0 ? '#0284c7' : bx === 1 ? '#16a34a' : '#ea580c');
              ctx.fillRect(ax + 6 + bx * 27, sy - 24, 23, 22);
            }
          }

          // Aisle Header Sign
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(ax + 10, 12, 70, 16);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px monospace';
          ctx.fillText(`AISLE ${aIdx + 1}A`, ax + 20, 24);
        });
      } else if (cam.type === 'vault') {
        // High-Value Vault Cage & Tripwires
        ctx.strokeStyle = visionMode === 'night' ? '#22c55e' : '#e11d48';
        ctx.lineWidth = 2;
        ctx.strokeRect(60, 40, width - 120, height - 80);

        // Security Cage Mesh
        ctx.strokeStyle = 'rgba(225, 29, 72, 0.15)';
        for (let m = 60; m < width - 60; m += 20) {
          ctx.beginPath();
          ctx.moveTo(m, 40);
          ctx.lineTo(m, height - 40);
          ctx.stroke();
        }

        // Active Tripwires
        const wirePhase = (tick * 0.05) % 1;
        ctx.strokeStyle = `rgba(34, 197, 94, ${0.4 + Math.sin(tick * 0.1) * 0.3})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(70, 70 + wirePhase * 30);
        ctx.lineTo(width - 70, 190);
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('RESTRICTED ACCESS - BIOMETRIC CLEARANCE ONLY', 120, 30);
      } else {
        // General / Dispatch / Perimeter
        ctx.fillStyle = visionMode === 'night' ? '#064e3b' : visionMode === 'thermal' ? '#312e81' : '#334155';
        ctx.fillRect(60, 60, width - 120, 160);
        ctx.strokeStyle = '#64748b';
        ctx.strokeRect(60, 60, width - 120, 160);
      }

      // Render Animated Forklifts
      forklifts.forEach((fl) => {
        // Move Forklift along aisle
        fl.x += fl.speed * fl.direction;
        if (fl.x > width - 100) { fl.direction = -1; }
        if (fl.x < 60) { fl.direction = 1; }

        ctx.save();
        ctx.translate(fl.x, fl.y);

        // Forklift Body
        if (visionMode === 'thermal') {
          ctx.fillStyle = '#fbbf24'; // Hot engine block
        } else if (visionMode === 'night') {
          ctx.fillStyle = '#15803d';
        } else {
          ctx.fillStyle = '#f59e0b'; // Yellow industrial body
        }
        ctx.fillRect(-18, -12, 36, 24);

        // Wheels
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-16, -15, 10, 4);
        ctx.fillRect(6, -15, 10, 4);
        ctx.fillRect(-16, 11, 10, 4);
        ctx.fillRect(6, 11, 10, 4);

        // Overhead Mast & Forks
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(fl.direction > 0 ? 18 : -26, -10, 8, 20);

        // Loaded Pallet on forks
        ctx.fillStyle = visionMode === 'thermal' ? '#ea580c' : '#b45309';
        ctx.fillRect(fl.direction > 0 ? 26 : -46, -14, 20, 28);

        // Flashing Amber Warning Beacon on top
        const beaconFlash = (Math.floor(tick / 8) % 2 === 0);
        if (beaconFlash) {
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(0, 0, 5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Headlight Beam
        const beamGradient = ctx.createRadialGradient(
          fl.direction > 0 ? 20 : -20, 0, 2,
          fl.direction > 0 ? 90 : -90, 0, 80
        );
        beamGradient.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
        beamGradient.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = beamGradient;
        ctx.beginPath();
        ctx.moveTo(fl.direction > 0 ? 18 : -18, -6);
        ctx.lineTo(fl.direction > 0 ? 100 : -100, -30);
        ctx.lineTo(fl.direction > 0 ? 100 : -100, 30);
        ctx.lineTo(fl.direction > 0 ? 18 : -18, 6);
        ctx.fill();

        // AI Bounding Box & Telemetry
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.strokeRect(-22, -18, 68, 36);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 8px monospace';
        ctx.fillText(`${fl.id} [3.8 km/h]`, -20, -22);

        ctx.restore();
      });

      // Render Animated Workers (Moving around with AI bounding boxes)
      workers.forEach((w, wIdx) => {
        // Move towards target
        const dx = w.targetX - w.x;
        const dy = w.targetY - w.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 5) {
          // Pick new target waypoint
          w.targetX = 60 + Math.random() * (width - 120);
          w.targetY = 60 + Math.random() * (height - 120);
        } else {
          w.x += (dx / dist) * w.speed;
          w.y += (dy / dist) * w.speed;
        }

        ctx.save();
        ctx.translate(w.x, w.y);

        // Worker Body (Top-down / isometric view)
        // Hard hat / Head
        ctx.fillStyle = visionMode === 'thermal' ? '#f43f5e' : '#f8fafc';
        ctx.beginPath();
        ctx.arc(0, -6, 5, 0, Math.PI * 2);
        ctx.fill();

        // Shoulders & High-Vis Vest
        if (visionMode === 'thermal') {
          ctx.fillStyle = '#fb923c'; // Thermal heat gradient
        } else if (visionMode === 'night') {
          ctx.fillStyle = '#22c55e';
        } else {
          ctx.fillStyle = w.vestColor; // Hi-Vis Orange/Yellow
        }
        ctx.fillRect(-7, -2, 14, 12);

        // Reflective stripes on vest
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-7, 2, 14, 2);

        // Pick Cart or Handheld Scanner
        if (w.hasCart) {
          ctx.fillStyle = '#64748b';
          ctx.fillRect(8, -6, 12, 16);
          ctx.strokeStyle = '#94a3b8';
          ctx.strokeRect(8, -6, 12, 16);
        }

        // Handheld Scanner Flash Beam
        if (wIdx % 3 === 0 && (Math.floor(tick / 15) % 3 === 0)) {
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(4, 0);
          ctx.lineTo(24, (Math.sin(tick) * 8));
          ctx.stroke();
        }

        // AI Bounding Box & ID Tracker
        if (visionMode !== 'night') {
          ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)';
          ctx.lineWidth = 1;
          ctx.strokeRect(-12, -16, 26, 32);

          ctx.fillStyle = 'rgba(34, 197, 94, 0.9)';
          ctx.fillRect(-12, -26, 44, 10);
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 7px monospace';
          ctx.fillText(`${w.id} 99%`, -10, -18);
        }

        ctx.restore();
      });

      // CCTV Scanlines & Distortion Filter
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      for (let sl = 0; sl < height; sl += 4) {
        ctx.fillRect(0, sl, width, 1.5);
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [cam, visionMode]);

  return (
    <canvas
      ref={canvasRef}
      width={640}
      height={360}
      className="w-full h-full object-cover rounded-lg"
      style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center', transition: 'transform 0.2s ease-out' }}
    />
  );
}

export function LiveFeed({ cam, onMaximize, isExpanded = false }: LiveFeedProps) {
  const [visionMode, setVisionMode] = useState<VisionMode>('color');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [aiOverlay, setAiOverlay] = useState(true);
  const [currentTime, setCurrentTime] = useState('');
  const [snapshotTaken, setSnapshotTaken] = useState(false);

  // Live millisecond accurate timestamp (e.g. 2026-08-20 13:08:45.392 IST)
  useEffect(() => {
    let frameId: number;
    const updateTime = () => {
      const now = new Date();
      const pad = (n: number, z = 2) => n.toString().padStart(z, '0');
      const yr = now.getFullYear();
      const mo = pad(now.getMonth() + 1);
      const da = pad(now.getDate());
      const hr = pad(now.getHours());
      const mi = pad(now.getMinutes());
      const se = pad(now.getSeconds());
      const ms = pad(now.getMilliseconds(), 3);
      setCurrentTime(`${yr}-${mo}-${da} ${hr}:${mi}:${se}.${ms} IST`);
      frameId = requestAnimationFrame(updateTime);
    };
    frameId = requestAnimationFrame(updateTime);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const handleTakeSnapshot = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSnapshotTaken(true);
    setTimeout(() => setSnapshotTaken(false), 2000);
    // Create download link for snapshot
    const link = document.createElement('a');
    link.download = `CCTV_SNAPSHOT_${cam.id}_${Date.now()}.png`;
    // Generate dummy canvas snapshot
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 640, 360);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(`MEESHO WMS SECURITY SNAPSHOT - ${cam.id}`, 20, 40);
      ctx.fillText(`Zone: ${cam.zone} | Time: ${currentTime}`, 20, 70);
      ctx.fillText(`Active Workers: ${cam.workerCount} | Forklifts: ${cam.forkliftCount}`, 20, 100);
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <div className={`relative bg-gray-950 rounded-2xl border border-gray-800 overflow-hidden flex flex-col shadow-lg transition-all ${
      isExpanded ? 'h-[500px]' : 'min-h-[260px] h-full'
    }`}>
      {/* Animated Warehouse Operations Canvas Feed */}
      <div className="relative flex-1 w-full h-full overflow-hidden bg-slate-950">
        <AnimatedWarehouseCanvas cam={cam} visionMode={visionMode} zoomLevel={zoomLevel} />

        {/* Snapshot Flash Feedback */}
        {snapshotTaken && (
          <div className="absolute inset-0 bg-white/80 animate-in fade-in duration-100 flex items-center justify-center z-30">
            <div className="bg-black/90 text-white px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 border border-emerald-500">
              <CheckCircle size={16} className="text-emerald-400" />
              <span>Snapshot Captured & Saved ({cam.id})</span>
            </div>
          </div>
        )}

        {/* CCTV Scanline & Vignette Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] opacity-40"></div>
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_80px_rgba(0,0,0,0.8)]"></div>

        {/* Top Header Overlay */}
        <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start z-10 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black bg-blue-950/80 text-blue-300 px-2 py-0.5 rounded border border-blue-700/60 shadow-sm">
                {cam.id}
              </span>
              <span className="text-xs font-bold text-white drop-shadow-md truncate max-w-[180px]">
                {cam.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-gray-300 bg-black/60 px-1.5 py-0.5 rounded border border-gray-800">
                {cam.zone}
              </span>
              {cam.isRestricted && (
                <span className="text-[10px] font-black px-2 py-0.5 bg-red-600/90 text-white rounded w-max animate-pulse flex items-center gap-1">
                  <Lock size={10} /> RESTRICTED VAULT
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* GREEN LIVE REC STATUS DOT */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/70 rounded-full border border-emerald-500/40 text-emerald-400 font-bold text-[11px] font-mono shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 -ml-3.5"></span>
              <span>LIVE REC</span>
            </div>

            <button
              onClick={handleTakeSnapshot}
              className="p-1.5 bg-black/60 hover:bg-black/90 text-gray-300 hover:text-white rounded-lg border border-gray-700 transition-colors"
              title="Capture High-Res CCTV Snapshot"
            >
              <Camera size={14} />
            </button>
          </div>
        </div>

        {/* Live Worker Density & Telemetry Floating HUD Badge */}
        <div className="absolute top-14 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
          <div className="bg-black/75 backdrop-blur-sm border border-white/10 px-2.5 py-1 rounded-lg text-[11px] text-white font-mono flex items-center gap-2">
            <Users size={12} className="text-emerald-400" />
            <span className="font-bold text-emerald-300">{cam.workerCount} Workers Detected</span>
          </div>
          {cam.forkliftCount > 0 && (
            <div className="bg-black/75 backdrop-blur-sm border border-white/10 px-2.5 py-1 rounded-lg text-[11px] text-white font-mono flex items-center gap-2">
              <Truck size={12} className="text-amber-400" />
              <span className="font-bold text-amber-300">{cam.forkliftCount} Forklifts Active</span>
            </div>
          )}
        </div>

        {/* Vision Mode & Zoom Controls (Floating on Feed) */}
        <div className="absolute top-14 right-3 z-10 flex flex-col gap-1 bg-black/75 backdrop-blur-sm p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setVisionMode('color')}
            className={`p-1.5 rounded-lg text-[10px] font-bold transition-all ${visionMode === 'color' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            title="Optical HD Color"
          >
            <Sun size={13} />
          </button>
          <button
            onClick={() => setVisionMode('night')}
            className={`p-1.5 rounded-lg text-[10px] font-bold transition-all ${visionMode === 'night' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'}`}
            title="Infrared Night Vision"
          >
            <Moon size={13} />
          </button>
          <button
            onClick={() => setVisionMode('thermal')}
            className={`p-1.5 rounded-lg text-[10px] font-bold transition-all ${visionMode === 'thermal' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
            title="FLIR Thermal Heatmap"
          >
            <Flame size={13} />
          </button>
          <div className="h-px bg-gray-800 my-0.5"></div>
          <button
            onClick={() => setZoomLevel(prev => prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1)}
            className="p-1.5 rounded-lg text-[10px] font-mono font-bold text-gray-300 hover:text-white"
            title="Digital Zoom (1x, 1.5x, 2x)"
          >
            {zoomLevel}x
          </button>
        </div>

        {/* Bottom Overlay with Real-Time Millisecond Timestamp */}
        <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between items-end z-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
          <div className="flex items-center gap-2">
            <span className="text-white font-mono text-[11px] font-bold bg-black/70 px-2.5 py-1 rounded border border-gray-800 shadow-sm">
              {currentTime || 'Syncing clock...'}
            </span>
            <span className="text-[10px] font-mono text-gray-400 hidden sm:inline">
              {cam.bitrate} • {cam.fps} FPS
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onMaximize && (
              <button
                onClick={() => onMaximize(cam)}
                className="text-gray-300 hover:text-white transition-colors bg-black/60 hover:bg-black/90 p-1.5 rounded-lg border border-gray-700 shadow-sm"
                title="Expand / Fullscreen Camera Feed"
              >
                <Maximize size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SurveillanceScreen() {
  const [layout, setLayout] = useState<1 | 4 | 9>(4);
  const [selectedZone, setSelectedZone] = useState<string>('All');
  const [activeCams, setActiveCams] = useState<CameraData[]>(CAMERAS.slice(0, 4));
  const [maximizedCam, setMaximizedCam] = useState<CameraData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCameras = CAMERAS.filter(c => {
    const matchesZone = selectedZone === 'All' || c.zone === selectedZone;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesZone && matchesSearch;
  });

  const handleCameraClick = (cam: CameraData) => {
    if (layout === 1) {
      setActiveCams([cam]);
    } else {
      if (activeCams.find(c => c.id === cam.id)) return;
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
      const unused = CAMERAS.filter(c => !activeCams.some(ac => ac.id === c.id)).slice(0, needed);
      setActiveCams([...activeCams, ...unused]);
    }
  };

  // Total active workers & forklifts across warehouse
  const totalWorkers = CAMERAS.reduce((acc, c) => acc + c.workerCount, 0);
  const totalForklifts = CAMERAS.reduce((acc, c) => acc + c.forkliftCount, 0);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 shadow-inner">
              <Video size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">CCTV & Security Surveillance</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  50/50 Feeds Online
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Real-time warehouse labor tracking, AI motion detection, and multi-zone surveillance feeds
              </p>
            </div>
          </div>
        </div>

        {/* Global Facility Telemetry Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2">
            <Users size={16} className="text-blue-600" />
            <div>
              <span className="text-gray-500 text-[10px] uppercase font-bold block">Floor Density</span>
              <span className="font-black text-gray-900">{totalWorkers} Total Labor Detected</span>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2">
            <Truck size={16} className="text-amber-600" />
            <div>
              <span className="text-gray-500 text-[10px] uppercase font-bold block">Fleet Operations</span>
              <span className="font-black text-gray-900">{totalForklifts} Forklifts Moving</span>
            </div>
          </div>

          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-inner">
            <button 
              onClick={() => handleLayoutChange(1)} 
              className={`p-2 rounded-lg transition-all ${layout === 1 ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-gray-500 hover:text-gray-900'}`}
              title="Single Focused Feed (1x1)"
            >
              <Maximize size={16} />
            </button>
            <button 
              onClick={() => handleLayoutChange(4)} 
              className={`p-2 rounded-lg transition-all ${layout === 4 ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-gray-500 hover:text-gray-900'}`}
              title="Quad Grid Feed (2x2)"
            >
              <Grid size={16} />
            </button>
            <button 
              onClick={() => handleLayoutChange(9)} 
              className={`p-2 rounded-lg transition-all ${layout === 9 ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-gray-500 hover:text-gray-900'}`}
              title="Matrix Multiview (3x3)"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Zone Switcher Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedZone('All')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            selectedZone === 'All'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          All Zones (50)
        </button>
        {ZONES.map(z => {
          const count = CAMERAS.filter(c => c.zone === z).length;
          return (
            <button
              key={z}
              onClick={() => {
                setSelectedZone(z);
                const zoneCams = CAMERAS.filter(c => c.zone === z);
                if (zoneCams.length > 0) {
                  setActiveCams(zoneCams.slice(0, layout));
                }
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedZone === z
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span>{z}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${selectedZone === z ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Surveillance Grid & Right Rail */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[620px]">
        {/* Left 3 Cols: Active Live Feeds */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className={`grid gap-4 flex-1 ${
            layout === 1 ? 'grid-cols-1' : 
            layout === 4 ? 'grid-cols-1 md:grid-cols-2' : 
            'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {Array.from({ length: layout }).map((_, i) => {
              const cam = activeCams[i] || CAMERAS[i];
              return (
                <LiveFeed 
                  key={cam ? cam.id : i} 
                  cam={cam} 
                  onMaximize={(c) => setMaximizedCam(c)} 
                />
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Facility Floor Map & Security Incidents */}
        <div className="flex flex-col gap-6">
          {/* Facility Floor Plan & Camera Matrix Selector */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                <Map size={16} className="text-blue-600" />
                <span>Interactive Facility Map</span>
              </h3>
              <span className="text-[11px] font-mono text-gray-500">BLR-FC-01</span>
            </div>
            
            <div className="p-4 bg-gray-50/50">
              <div className="relative w-full aspect-square bg-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-inner">
                {/* Visual Facility Zones */}
                <div className="absolute top-2 left-2 w-1/3 h-1/4 bg-blue-500/20 border border-blue-400/40 text-[9px] text-blue-300 font-bold p-1 rounded">
                  DOCKS
                </div>
                <div className="absolute top-2 right-2 w-1/2 h-1/3 bg-amber-500/20 border border-amber-400/40 text-[9px] text-amber-300 font-bold p-1 rounded">
                  SORTING
                </div>
                <div className="absolute top-1/3 left-2 w-2/5 h-1/3 bg-emerald-500/20 border border-emerald-400/40 text-[9px] text-emerald-300 font-bold p-1 rounded">
                  AISLES
                </div>
                <div className="absolute bottom-2 right-2 w-2/5 h-1/3 bg-red-500/20 border border-red-400/40 text-[9px] text-red-300 font-bold p-1 rounded">
                  VAULT
                </div>

                {/* Camera Pins */}
                {CAMERAS.map((cam) => {
                  const isActive = activeCams.some(c => c.id === cam.id);
                  return (
                    <button 
                      key={cam.id}
                      onClick={() => handleCameraClick(cam)}
                      className={`absolute w-3.5 h-3.5 -ml-1.5 -mt-1.5 rounded-full border shadow-md transition-all hover:scale-150 z-10 ${
                        isActive ? 'bg-blue-400 border-white scale-125 ring-2 ring-blue-500 ring-offset-1 ring-offset-slate-900' : 
                        cam.isRestricted ? 'bg-red-500 border-white' : 'bg-slate-400 border-slate-800'
                      }`}
                      style={{ top: `${cam.y}%`, left: `${cam.x}%` }}
                      title={`${cam.id}: ${cam.name} (${cam.workerCount} Workers)`}
                    />
                  );
                })}
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-gray-600">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Active ({activeCams.length})</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Restricted</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-400"></div> Standard</div>
              </div>
            </div>
          </div>

          {/* Real-time AI Security Alerts Feed */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden min-h-[280px]">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                <ShieldAlert size={16} className="text-red-500" />
                <span>AI Security Telemetry</span>
              </h3>
              <span className="bg-red-100 text-red-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                {MOCK_ALERTS.length} Live Alerts
              </span>
            </div>

            <div className="p-3 overflow-y-auto flex-1 space-y-2.5">
              {MOCK_ALERTS.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-3 rounded-xl border flex flex-col gap-1.5 transition-all hover:shadow-sm ${
                    alert.type === 'critical' ? 'bg-red-50/80 border-red-200' :
                    alert.type === 'warning' ? 'bg-amber-50/80 border-amber-200' : 'bg-blue-50/80 border-blue-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-mono font-bold text-gray-600">{alert.time}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full font-mono ${
                      alert.type === 'critical' ? 'bg-red-200 text-red-900' :
                      alert.type === 'warning' ? 'bg-amber-200 text-amber-900' : 'bg-blue-200 text-blue-900'
                    }`}>
                      {alert.cam}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-gray-800 leading-snug">{alert.msg}</p>
                  <div className="pt-1 flex items-center justify-between text-[10px] text-gray-500">
                    <span className="font-medium">{alert.zone}</span>
                    <button 
                      onClick={() => {
                        const targetCam = CAMERAS.find(c => c.id === alert.cam);
                        if (targetCam) handleCameraClick(targetCam);
                      }}
                      className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5"
                    >
                      Focus Camera <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Inspector Modal */}
      {maximizedCam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-slate-900 w-full max-w-5xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-black bg-blue-600 px-2 py-0.5 rounded">{maximizedCam.id}</span>
                <div>
                  <h3 className="font-bold text-base">{maximizedCam.name}</h3>
                  <p className="text-xs text-slate-400">{maximizedCam.zone} • {maximizedCam.resolution}</p>
                </div>
              </div>
              <button 
                onClick={() => setMaximizedCam(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-auto bg-slate-950">
              <LiveFeed cam={maximizedCam} isExpanded={true} />
            </div>

            <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 text-xs text-slate-400 flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <span>Labor Detected: <strong className="text-white">{maximizedCam.workerCount} Workers</strong></span>
                <span>Active Forklifts: <strong className="text-white">{maximizedCam.forkliftCount}</strong></span>
                <span>Bitrate: <strong className="text-white">{maximizedCam.bitrate}</strong></span>
                <span>Frame Rate: <strong className="text-emerald-400">{maximizedCam.fps} FPS</strong></span>
              </div>
              <button 
                onClick={() => setMaximizedCam(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
