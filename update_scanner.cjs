const fs = require('fs');
let code = fs.readFileSync('src/components/ScannerScreen.tsx', 'utf8');

// Add camera state and HTML5 Qrcode integration
const webcamCode = `
  const [useCamera, setUseCamera] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playBeep = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      // AudioContext policy catch
    }
  };

  const startCamera = async () => {
    setUseCamera(true);
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Webcam access error:", err);
    }
  };

  const stopCamera = () => {
    setUseCamera(false);
    setCameraActive(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const simulateCameraScan = (codeText: string) => {
    playBeep();
    setScanInput(codeText);
    // Simulate scan trigger
    const isDamaged = codeText.includes('DAM');
    const isMismatch = codeText.includes('ERR');
    setScanResult({
      code: codeText,
      status: isDamaged ? 'Damaged' : isMismatch ? 'Mismatch' : 'Success',
      item: codeText.includes('SKU') ? 'Meesho Ethnic Kurti Set' : 'Express Delivery AWB',
      location: 'Zone A - Bin 14',
      timestamp: new Date().toLocaleTimeString()
    });
    setScanLogs(prev => [
      { id: Date.now(), time: new Date().toLocaleTimeString(), station: 'ST-04 (Cam)', operator: 'Raj Patel', code: codeText, action: 'Camera Scan', status: isDamaged ? 'Damaged' : isMismatch ? 'Mismatch' : 'Success' },
      ...prev
    ]);
  };
`;

code = code.replace("const inputRef = useRef<HTMLInputElement>(null);", webcamCode + "\n  const inputRef = useRef<HTMLInputElement>(null);");

// Replace manual header buttons or add camera toggle button
const cameraToggleUI = `
          <div className="flex items-center gap-3">
            {useCamera ? (
              <button 
                onClick={stopCamera}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm"
              >
                <XCircle size={16} /> Stop Camera
              </button>
            ) : (
              <button 
                onClick={startCamera}
                className="px-4 py-2 bg-[#f43397] text-white rounded-lg font-bold text-sm hover:bg-pink-700 transition-colors flex items-center gap-2 shadow-sm"
              >
                <ScanLine size={16} /> Open Camera Scanner
              </button>
            )}
          </div>
`;

code = code.replace(
  /<div className="flex items-center gap-2">[\s\S]*?<\/div>/,
  cameraToggleUI
);

// Insert live video element inside scanner screen if useCamera is true
const videoContainerCode = `
      {useCamera && (
        <div className="bg-slate-900 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden flex flex-col items-center">
          <div className="flex justify-between w-full items-center mb-4">
            <h3 className="font-bold flex items-center gap-2 text-pink-400">
              <Crosshair className="animate-spin" /> Live Webcam Scanner Feed (HTML5 Stream)
            </h3>
            <span className="bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-bold animate-pulse">LIVE STREAM</span>
          </div>
          <div className="relative w-full max-w-xl h-72 bg-black rounded-xl overflow-hidden border-2 border-pink-500/50 shadow-inner flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
            {/* Target Bounding Box Overlay */}
            <div className="absolute inset-12 border-2 border-dashed border-pink-400 rounded-lg pointer-events-none flex items-center justify-center">
               <div className="absolute top-2 left-2 text-[10px] text-pink-300 font-mono bg-black/60 px-2 py-0.5 rounded">ALIGN BARCODE / AWB</div>
               <div className="w-full h-0.5 bg-pink-500/80 animate-pulse"></div>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button 
              onClick={() => simulateCameraScan('SKU-MEESHO-99201')}
              className="px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg text-xs font-bold transition-all shadow-md"
            >
              Simulate Successful SKU Scan
            </button>
            <button 
              onClick={() => simulateCameraScan('AWB-8349281X')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-bold transition-all shadow-md"
            >
              Simulate AWB Label Scan
            </button>
            <button 
              onClick={() => simulateCameraScan('DAMAGED-ITEM-ERR')}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-xs font-bold transition-all shadow-md"
            >
              Simulate Damaged Item Scan
            </button>
          </div>
        </div>
      )}
`;

code = code.replace(
  /<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">/,
  videoContainerCode + "\n      <div className=\"grid grid-cols-1 lg:grid-cols-3 gap-6\">"
);

fs.writeFileSync('src/components/ScannerScreen.tsx', code);
