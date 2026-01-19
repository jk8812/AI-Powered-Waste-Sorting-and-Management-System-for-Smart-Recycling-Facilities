import React, { useEffect, useState, useRef } from 'react';
import { User, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import logo from './assets/logo2.png';
import { Navbar } from './Navbar'; 
import backgroundImage from './assets/bg1.jpg';
// --- Types ---
type Category = 'Cardboard' | 'Metal' | 'E-Waste' | 'Glass' | 'Paper' | 'Plastic' | 'Medical';
interface DetectionResult {
  predicted_class: string;
  confidence: number;
  top3: {
    class: string;
    confidence: number;
  }[];
}
// --- Configuration ---
const CATEGORIES: {
  id: Category;
  color: string;
  x: number;
  y: number;
}[] = [{
  id: 'Cardboard',
  color: '#84cc16',
  x: 35,
  y: 10
}, {
  id: 'Metal',
  color: '#eab308',
  x: 75,
  y: 25
}, {
  id: 'E-Waste',
  color: '#ec4899',
  x: 35,
  y: 35
}, {
  id: 'Glass',
  color: '#a855f7',
  x: 35,
  y: 55
}, {
  id: 'Paper',
  color: '#06b6d4',
  x: 75,
  y: 50
}, {
  id: 'Plastic',
  color: '#f97316',
  x: 75,
  y: 75
}, {
  id: 'Medical',
  color: '#ef4444',
  x: 35,
  y: 80
} // Red
];
export function App() {
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setImage(URL.createObjectURL(selectedFile));
    setResult(null);
  };

  // Mock detection process
const handleDetect = async () => {
  if (!file) return;

  setIsAnalyzing(true);

  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      body: formData,
    });

    const data = await response.json(); 
    setResult(data);                    //  THIS UPDATES UI

  } catch (error) {
    console.error("Prediction failed:", error);
  } finally {
    setIsAnalyzing(false);
  }
};

const startCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }
    setIsCameraOpen(true);
  } catch (error) {
    console.error("Camera access denied:", error);
    alert("Unable to access camera");
  }
};

const stopCamera = () => {
  if (videoRef.current?.srcObject) {
    const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
    tracks.forEach(track => track.stop());
  }
  setIsCameraOpen(false);
};

const captureAndDetect = async () => {
  if (!videoRef.current || !canvasRef.current) return;

  const video = videoRef.current;
  const canvas = canvasRef.current;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.toBlob(async (blob) => {
    if (!blob) return;

    const cameraFile = new File([blob], "camera.jpg", { type: "image/jpeg" });

    setFile(cameraFile);
    setImage(URL.createObjectURL(cameraFile));

    stopCamera();
    await handleDetect();
  }, "image/jpeg");
};


  return ( 
  //<div className="min-h-screen bg-[#f8f9fa] font-sans text-slate-800 flex flex-col">
  <div 
      className="min-h-screen w-full flex flex-col bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ 
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${backgroundImage})` 
      }}
    >
      {/* --- Navbar --- */}
      <Navbar /> {/* 2. Place the shared component here */}

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col lg:flex-row p-6 lg:p-12 gap-12 max-w-[1600px] mx-auto w-full">
        {/* Left Column: Upload Card */}
        <div className="w-full lg:w-[400px] flex-shrink-0 flex flex-col justify-center">
          <div className="bg-gray-200 rounded-3xl p-6 shadow-lg border border-gray-300">
            {/* Image Preview Area */}
            <div className="aspect-[3/4] bg-white rounded-xl mb-6 overflow-hidden relative border-4 border-white shadow-inner flex items-center justify-center group">
              {image ? <img src={image} alt="Uploaded waste" className="w-full h-full object-cover" /> : <div className="flex flex-col items-center text-gray-400">
                  <div className="bg-blue-50 p-6 rounded-full mb-4">
                    <ImageIcon className="w-12 h-12 text-blue-300" />
                  </div>
                  <p className="font-medium">No Image Selected</p>
                </div>}

              {/* Overlay for changing image */}
              {image && <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={() => fileInputRef.current?.click()} className="text-white font-medium bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm">
                    Change Image
                  </button>
                </div>}
            </div>

            {/* Controls */}
            <div className="space-y-4">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

              <button onClick={() => fileInputRef.current?.click()} className="w-full bg-[#38bdf8] hover:bg-[#0ea5e9] text-white font-semibold py-3 rounded-full shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                <Upload className="w-5 h-5" />
                Browse
              </button>

              <button onClick={handleDetect} disabled={!image || isAnalyzing} className={`w-full font-semibold py-3 rounded-full shadow-md transition-all flex items-center justify-center gap-2
                  ${!image ? 'bg-gray-400 cursor-not-allowed text-gray-100' : 'bg-[#38bdf8] hover:bg-[#0ea5e9] text-white active:scale-[0.98]'}`}>
                {isAnalyzing ? <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </> : 'Detect'}
              </button>
              <button
                onClick={startCamera}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-full shadow-md transition-all active:scale-[0.98]"
              >
                Open Camera
              </button>
              
              
              
            </div>
          {/* Camera UI */}
{isCameraOpen && (
  <div className="mt-6 space-y-4">
    <video
      ref={videoRef}
      className="w-full rounded-lg border"
      autoPlay
      playsInline
    />

    <canvas ref={canvasRef} className="hidden" />

    <div className="flex gap-3">
      <button
        onClick={captureAndDetect}
        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg"
      >
        Capture & Detect
      </button>

      <button
        onClick={stopCamera}
        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg"
      >
        Cancel
      </button>
    </div>
  </div>
)}



          </div>
        </div>

        {/* Right Column: Flow Diagram */}
        <div className="flex-1 relative min-h-[600px] bg-white/50 rounded-3xl border border-gray-200 p-8 lg:bg-transparent lg:border-none lg:p-0">
          {/* SVG Connector Lines Layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden lg:block">
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#9ca3af" />
              </marker>
            </defs>
            {CATEGORIES.map(cat => {
            // Calculate path coordinates
            // Start: Left edge center (x=0, y=50%)
            // End: Card position (x=cat.x%, y=cat.y%)
            // We need to convert percentages to relative coordinates or use vector-effect
            // For simplicity in this responsive layout, we'll use a viewBox approach or just assume standard desktop sizing for the curves
            const isActive = result?.predicted_class.toLowerCase() === cat.id.toLowerCase() ;
            const strokeColor = isActive ? cat.color : '#e5e7eb'; // Gray-200 if inactive
            const strokeWidth = isActive ? 4 : 2;
            const opacity = result ? isActive ? 1 : 0.3 : 1;
            // Bezier curve control points
            // Start point is roughly (0, 50%) of this container
            // End point is (cat.x%, cat.y%)
            // Control point 1: (50%, 50%)
            // Control point 2: (cat.x - 10%, cat.y%)
            return <path key={cat.id} d={`M 0,50 C 15,50 ${cat.x - 15},${cat.y} ${cat.x},${cat.y}`} fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" vectorEffect="non-scaling-stroke" className="transition-all duration-500 ease-out" style={{
              opacity,
              transformBox: 'fill-box',
              transformOrigin: 'center'
            }} />;
          })}
          </svg>

          {/* We need a wrapper for the SVG to work with percentages properly */}
          <div className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden lg:block">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {CATEGORIES.map(cat => {
              const isActive = result?.predicted_class.toLowerCase() === cat.id.toLowerCase() ;
              const strokeColor = isActive ? cat.color : '#d1d5db';
              const strokeWidth = isActive ? 0.8 : 0.4;
              const opacity = result ? isActive ? 1 : 0.2 : 1;
              return <g key={cat.id}>
                    <path d={`M 0,50 C 15,50 ${cat.x - 10},${cat.y} ${cat.x - 2},${cat.y}`} fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" className="transition-all duration-700 ease-out" style={{
                  opacity
                }} />
                    {/* Arrowhead at the end */}
                    <path d={`M ${cat.x - 2},${cat.y} L ${cat.x},${cat.y}`} stroke={strokeColor} strokeWidth={strokeWidth} markerEnd={isActive ? undefined : undefined} // Could add marker if needed
                className="transition-all duration-700" style={{
                  opacity
                }} />
                  </g>;
            })}
            </svg>
          </div>

          {/* Category Cards */}
          {CATEGORIES.map(cat => {
          const isActive = result?.predicted_class.toLowerCase()  === cat.id.toLowerCase();
          return <div key={cat.id} className={`
                  absolute transform -translate-y-1/2 transition-all duration-500
                  w-[200px] lg:w-[240px] p-4 rounded-xl shadow-sm border-2
                  flex flex-col gap-2
                  ${isActive ? 'bg-white scale-110 z-10 shadow-xl' : 'bg-gray-200 border-transparent text-gray-500 scale-100 z-0'}
                `} style={{
            left: `${cat.x}%`,
            top: `${cat.y}%`,
            borderColor: isActive ? cat.color : 'transparent'
            // Fallback for mobile where absolute positioning might be tricky
            // We'll use media queries in classNames to handle mobile stacking if needed
            // But for now we stick to the desktop design requested
          }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold tracking-wider text-gray-500">
                    CLASS :
                  </span>
                  <span className={`font-bold ${isActive ? 'text-black' : 'text-gray-600'}`}>
                    {cat.id.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-bold tracking-wider text-gray-500">
                    CONFIDENCE :
                  </span>
                  <span className={`font-bold ${isActive ? 'text-black' : 'text-gray-400'}`}>
                    {isActive ? `${(result.confidence * 100).toFixed(2)}%` : '__'}
                  </span>
                </div>

                {/* Status Indicator Dot */}
                {isActive && <div className="absolute -right-1 -top-1 w-4 h-4 rounded-full animate-pulse" style={{
              backgroundColor: cat.color
            }} />}
              </div>;
        })}

          {/* Mobile View Fallback (Grid instead of Flow) */}
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            {CATEGORIES.map(cat => {
            const isActive = result?.predicted_class.toLowerCase() === cat.id.toLowerCase();
            return <div key={cat.id} className={`p-4 rounded-xl border-2 transition-all ${isActive ? 'bg-white border-blue-500 shadow-lg' : 'bg-gray-100 border-transparent'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold">{cat.id}</span>
                    {isActive && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        Detected
                      </span>}
                  </div>
                  <div className="text-sm text-gray-600">
                    {isActive ? `${(result.confidence * 100).toFixed(2)}%` : '__'}
                  </div>
                </div>;
          })}
          </div>
        </div>
      </main>
    </div>
    );
}