
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Activity, PlusSquare, Target, Crosshair, Camera, Loader2, Download, Save, History, Menu, X, ShieldCheck, Cpu, Terminal, Fingerprint } from 'lucide-react';
import html2canvas from 'html2canvas';
import AuraGauge from './components/AuraGauge';
import StatsDashboard from './components/StatsDashboard';
import TerminalLog from './components/TerminalLog';
import BioArchive from './components/BioArchive';
import { analyzeAthleticVideo } from './services/geminiService';
import { BiomechanicalMetrics, LogEntry, SavedSession } from './types';

const App: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [currentPacketId, setCurrentPacketId] = useState("");
  
  const [metrics, setMetrics] = useState<BiomechanicalMetrics>({
    auraScore: 0,
    stability: 0,
    explosiveness: 0,
    injuryPrevention: 0,
    feedback: ""
  });
  
  const [logs, setLogs] = useState<LogEntry[]>([
    { timestamp: new Date().toLocaleTimeString(), message: "AuraLink OS v2.0 Online.", type: "info" },
    { timestamp: new Date().toLocaleTimeString(), message: "Neural architecture synchronized.", type: "ai" }
  ]);

  const [archive, setArchive] = useState<SavedSession[]>(() => {
    const stored = localStorage.getItem('aura_archive');
    return stored ? JSON.parse(stored) : [];
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const captureAreaRef = useRef<HTMLElement>(null);

  useEffect(() => {
    localStorage.setItem('aura_archive', JSON.stringify(archive));
  }, [archive]);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    }]);
  }, []);

  const getFileSignature = (file: File) => {
    return `cache_${file.name}_${file.size}_${file.lastModified}`;
  };

  const performAnalysis = async (file: File) => {
    const signature = getFileSignature(file);
    const cached = localStorage.getItem(signature);

    if (cached) {
      addLog(`Signature Match Found in Cache.`, "success");
      addLog("Retrieving consistent neural patterns.", "ai");
      setIsAnalyzing(true);
      setTimeout(() => {
        setMetrics(JSON.parse(cached));
        setIsAnalyzing(false);
        addLog("Pattern restoration complete.", "success");
      }, 1500);
      return;
    }

    setIsAnalyzing(true);
    addLog(`Ingesting Kinetic Stream...`, "info");
    addLog("Neural Scan initiated. Calibrating Aura metrics.", "ai");

    try {
      const reader = new FileReader();
      const base64Video = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const result = await analyzeAthleticVideo(base64Video, file.type);
      setMetrics(result);
      localStorage.setItem(signature, JSON.stringify(result));
      addLog(`Analysis Locked. Aura Score: ${result.auraScore}`, "success");
      addLog("Coach cues ready for review.", "ai");
    } catch (err) {
      console.error(err);
      addLog("Connection dropped. Check Neural Link.", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-m4v', 'video/webm'];
      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp4|mov|webm)$/i)) {
        addLog(`Error: Unsupported media type.`, "error");
        return;
      }
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      addLog(`Stream loaded: ${file.name}`, "success");
      performAnalysis(file);
    }
    if (e.target) e.target.value = '';
  };

  const handleSaveToArchive = () => {
    if (!videoFile || metrics.auraScore === 0) return;
    const newSession: SavedSession = {
      id: crypto.randomUUID(),
      date: new Date().toLocaleString(),
      fileName: videoFile.name,
      metrics: { ...metrics }
    };
    setArchive(prev => [newSession, ...prev]);
    addLog("Sequence synchronized to Bio-Archive.", "success");
    setShowArchive(true);
  };

  const deleteSession = (id: string) => {
    setArchive(prev => prev.filter(s => s.id !== id));
    addLog("Archived entry purged from memory.", "warning");
  };

  const loadSession = (session: SavedSession) => {
    setMetrics(session.metrics);
    addLog(`Viewing historical session: ${session.fileName}`, "info");
    if (window.innerWidth < 1280) setShowArchive(false);
  };

  const handleNewAnalysis = () => {
    setVideoFile(null);
    setVideoUrl(null);
    setMetrics({ auraScore: 0, stability: 0, explosiveness: 0, injuryPrevention: 0, feedback: "" });
    addLog("Cache cleared. Awaiting new sequence.", "warning");
    fileInputRef.current?.click();
  };

  const handleShare = async () => {
    if (metrics.auraScore === 0 && !isAnalyzing) {
      addLog("Export failed: No analysis data present.", "error");
      return;
    }

    if (!captureAreaRef.current) return;

    const packetId = Math.random().toString(36).substr(2, 9).toUpperCase();
    setCurrentPacketId(packetId);
    setIsCapturing(true);
    addLog("Compiling Bio-Audit report...", "info");

    try {
      // Delay to ensure React renders the snapshot-only elements and layout shifts finish
      await new Promise(resolve => setTimeout(resolve, 800));

      const canvas = await html2canvas(captureAreaRef.current, {
        backgroundColor: '#020202',
        scale: 2, 
        logging: false,
        useCORS: true,
        windowWidth: 1200, // Force desktop width for snapshot clone
        onclone: (clonedDoc) => {
          const area = clonedDoc.querySelector('[data-capture-area]') as HTMLElement;
          if (area) {
            area.classList.add('snapshot-mode');
            // Force metrics visibility in report
            const dashboard = area.querySelector('.xl\\:col-span-4');
            if (dashboard) (dashboard as HTMLElement).style.display = 'flex';
          }
        }
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `AuraLink_BioAudit_${packetId}.png`;
      link.href = dataUrl;
      link.click();

      addLog(`Bio-Audit Packet Generated: ${packetId}`, "success");
    } catch (err) {
      console.error("Capture Error:", err);
      addLog("Snapshot failed. HUD Buffer Overflow.", "error");
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col relative overflow-hidden bg-[#020202] transition-colors duration-300 ${isCapturing ? 'bg-[#051505]' : ''}`}>
      <div className="scanline"></div>

      {/* Snapshot HUD Overlay */}
      <div className={`fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-xl pointer-events-none transition-all duration-500 ${isCapturing ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}>
        <div className="flex flex-col items-center gap-6 p-10 border border-[#39ff14]/50 bg-black shadow-[0_0_80px_rgba(57,255,20,0.3)] rounded-lg max-w-sm w-[90%]">
           <div className="relative">
              <Loader2 className="w-16 h-16 text-[#39ff14] animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Cpu className="w-6 h-6 text-[#39ff14] animate-pulse" />
              </div>
           </div>
           <div className="text-center">
              <h2 className="text-[#39ff14] font-orbitron font-bold text-lg tracking-[0.4em] mb-2 uppercase">ENCODING_AUDIT</h2>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mx-auto mt-6">
                 <div className="h-full bg-[#39ff14] animate-[progress_1.5s_ease-in-out_infinite]"></div>
              </div>
              <p className="text-[10px] font-mono text-white/40 mt-4 uppercase tracking-[0.2em] leading-relaxed">
                Compiling Bio-Audit Metrics...<br/>
                Syncing Packet_{currentPacketId}
              </p>
           </div>
        </div>
      </div>
      
      {/* Header */}
      <header className="z-40 bg-black/90 backdrop-blur-xl border-b border-[#39ff14]/20 p-3 sm:p-4 flex justify-between items-center px-4 sm:px-6 h-16 sm:h-20 shrink-0">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="p-1.5 sm:p-2 border border-[#39ff14] neon-glow rounded-sm shrink-0">
            <Target className="text-[#39ff14] w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
          </div>
          <div className="hidden xs:block">
            <h1 className="text-sm sm:text-xl font-orbitron font-black tracking-widest text-white flex items-center gap-2 leading-none uppercase">
              AURALINK <span className="text-[8px] sm:text-[10px] bg-[#39ff14] text-black px-1 py-0.5 rounded-sm">PRO</span>
            </h1>
            <p className="text-[7px] sm:text-[9px] text-[#39ff14]/60 font-mono tracking-widest mt-0.5 sm:mt-1 uppercase">BIO-DYNAMIC INTELLIGENCE UNIT</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 sm:gap-3">
          <button 
            onClick={() => setShowArchive(!showArchive)}
            className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 border font-orbitron text-[8px] sm:text-[10px] transition-all rounded-sm ${
              showArchive ? 'bg-[#39ff14] text-black border-[#39ff14]' : 'border-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {showArchive ? <X size={12} /> : <History size={12} />} 
            <span className="hidden sm:inline">{showArchive ? 'CLOSE_ARCHIVE' : 'OPEN_ARCHIVE'}</span>
          </button>

          <button 
            onClick={handleShare}
            disabled={isCapturing || metrics.auraScore === 0}
            className="hidden xs:flex items-center gap-1.5 px-2 sm:px-3 py-1.5 border border-gray-800 text-gray-400 font-orbitron text-[8px] sm:text-[10px] hover:text-white transition-all rounded-sm disabled:opacity-30"
          >
            <Camera size={12} /> <span className="hidden sm:inline">EXPORT_SNAP</span>
          </button>
          
          <button 
            onClick={handleNewAnalysis}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#39ff14] text-black font-orbitron font-bold text-[8px] sm:text-[10px] tracking-widest hover:scale-105 transition-all rounded-sm shadow-[0_0_15px_rgba(57,255,20,0.3)] active:scale-95"
          >
            <PlusSquare size={14} /> <span className="hidden xs:inline">NEW_SEQUENCE</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main 
        ref={captureAreaRef} 
        data-capture-area
        className={`flex-1 z-10 flex flex-col xl:flex-row p-1 sm:p-2 gap-1 overflow-hidden min-h-0 relative transition-all duration-300 ${isCapturing ? 'snapshot-mode' : ''}`}
      >
        {/* SNAPSHOT SPECIFIC REPORT HEADER */}
        {isCapturing && (
          <div data-show-on-snap className="hidden w-full border-b-2 border-[#39ff14] pb-8 mb-8 relative">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-4">
                <div className="p-3 border-2 border-[#39ff14] bg-black shadow-[0_0_20px_rgba(57,255,20,0.2)]">
                  <Target className="text-[#39ff14] w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-orbitron font-black text-white tracking-[0.2em] leading-none uppercase">BIO-AUDIT REPORT</h1>
                  <p className="text-[10px] font-mono text-[#39ff14] tracking-[0.5em] mt-2 uppercase">AURALINK PERFORMANCE INTELLIGENCE // AUTH: GEMINI_3</p>
                </div>
              </div>
              <div className="text-right font-mono bg-[#39ff14]/5 p-3 border-l border-[#39ff14]/20">
                <div className="text-[10px] text-white tracking-widest uppercase mb-1 flex items-center gap-2 justify-end">
                  <ShieldCheck size={10} className="text-[#39ff14]" /> UNIT_ID: AL-PRO-99-X
                </div>
                <div className="text-[9px] text-white/40 uppercase">PKT_ID: {currentPacketId}</div>
                <div className="text-[9px] text-white/40 uppercase">SEQ: {videoFile?.name || "STREAM_DATA"}</div>
              </div>
            </div>
            {/* Corner Accents */}
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#39ff14]"></div>
          </div>
        )}

        {/* Snapshot Watermark Overlay */}
        {isCapturing && (
          <div className="absolute top-1/2 right-4 -translate-y-1/2 z-[70] opacity-10 pointer-events-none select-none [writing-mode:vertical-rl] text-6xl font-orbitron font-black text-[#39ff14] tracking-[1em] uppercase">
            VERIFIED_AUDIT
          </div>
        )}

        {/* Archive Overlay/Sidebar (HIDDEN ON SNAPSHOT) */}
        <div data-hide-on-snap className={`
          absolute inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-black/95 border-r border-[#39ff14]/20 p-4 transition-transform duration-300 transform
          xl:relative xl:translate-x-0 xl:bg-black/40 xl:z-10
          ${showArchive ? 'translate-x-0' : '-translate-x-full xl:hidden'}
        `}>
          <div className="flex justify-between items-center xl:hidden mb-4">
             <h2 className="text-[#39ff14] font-orbitron text-[10px] tracking-widest">ARCHIVE_ACCESS</h2>
             <button onClick={() => setShowArchive(false)} className="text-white/40"><X size={16}/></button>
          </div>
          <BioArchive sessions={archive} onDelete={deleteSession} onLoad={loadSession} />
        </div>

        {/* Video / Dashboard Grid */}
        <div className="flex-1 flex flex-col xl:grid xl:grid-cols-12 gap-1 overflow-y-auto xl:overflow-hidden custom-scrollbar">
          
          {/* Left: Video Analysis Unit */}
          <div className="xl:col-span-8 flex flex-col gap-1 min-h-[400px] xl:h-full xl:min-h-0">
            <div className="flex-1 bg-black border border-white/5 relative flex items-center justify-center p-2 overflow-hidden rounded-sm">
              <div className={`absolute top-4 left-4 w-8 h-8 sm:w-12 sm:h-12 border-t-2 border-l-2 pointer-events-none transition-colors duration-300 ${isCapturing ? 'border-[#39ff14]' : 'border-[#39ff14]/30'}`}></div>
              <div className={`absolute top-4 right-4 w-8 h-8 sm:w-12 sm:h-12 border-t-2 border-r-2 pointer-events-none transition-colors duration-300 ${isCapturing ? 'border-[#39ff14]' : 'border-[#39ff14]/30'}`}></div>
              <div className={`absolute bottom-4 left-4 w-8 h-8 sm:w-12 sm:h-12 border-b-2 border-l-2 pointer-events-none transition-colors duration-300 ${isCapturing ? 'border-[#39ff14]' : 'border-[#39ff14]/30'}`}></div>
              <div className={`absolute bottom-4 right-4 w-8 h-8 sm:w-12 sm:h-12 border-b-2 border-r-2 pointer-events-none transition-colors duration-300 ${isCapturing ? 'border-[#39ff14]' : 'border-[#39ff14]/30'}`}></div>
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none w-full h-full flex items-center justify-center">
                <Crosshair size={400} className="text-[#39ff14] sm:scale-150" />
              </div>

              {isAnalyzing && (
                <div className="absolute inset-0 z-30 bg-[#39ff14]/5 pointer-events-none overflow-hidden">
                  <div className="absolute w-full h-[2px] bg-[#39ff14]/80 shadow-[0_0_20px_#39ff14] animate-[scan_2.5s_ease-in-out_infinite]"></div>
                  <div className="absolute inset-0 grid grid-cols-6 sm:grid-cols-12 grid-rows-6 sm:grid-rows-12 opacity-10">
                    {[...Array(144)].map((_, i) => (
                      <div key={i} className="border-[0.5px] border-[#39ff14]/20"></div>
                    ))}
                  </div>
                </div>
              )}

              <div className="w-full h-full z-20 flex items-center justify-center overflow-hidden">
                {videoUrl ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                     <video ref={videoRef} src={videoUrl} controls className={`max-w-full max-h-full object-contain transition-all duration-700 ${isAnalyzing ? 'sepia-[0.3] contrast-125 brightness-110' : 'shadow-2xl shadow-[#39ff14]/5'}`} />
                  </div>
                ) : (
                  <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer group flex flex-col items-center justify-center w-full h-full border border-dashed border-white/10 bg-white/[0.01] hover:bg-[#39ff14]/5 transition-all p-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 border border-white/20 rounded-full flex items-center justify-center mb-4 sm:mb-6 group-hover:border-[#39ff14] group-hover:shadow-[0_0_20px_rgba(57,255,20,0.2)] transition-all">
                      <Upload className="text-white/40 group-hover:text-[#39ff14]" size={24} />
                    </div>
                    <h3 className="text-white/60 font-orbitron text-xs sm:text-sm mb-1 tracking-[0.2em] uppercase text-center">Initialize Neural Link</h3>
                    <p className="text-white/30 text-[8px] sm:text-[9px] font-mono uppercase tracking-widest text-center">Connect Movement Stream (MP4/MOV)</p>
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="video/mp4,video/quicktime,video/webm" onChange={handleFileChange} />
            </div>

            <div data-hide-on-snap className="p-2 sm:p-3 bg-black/60 border border-white/5 flex flex-col sm:flex-row gap-3 justify-between items-center shrink-0 rounded-sm">
              <div className="text-[8px] sm:text-[10px] font-mono text-[#39ff14]/60 uppercase flex items-center gap-2">
                <Activity size={12} className={isAnalyzing ? "animate-pulse" : ""} /> Status: {isAnalyzing ? 'Mapping_Pattern' : 'Standby'}
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                {videoFile && metrics.auraScore > 0 && !isAnalyzing && (
                  <button 
                    onClick={handleSaveToArchive}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 border border-[#39ff14]/40 text-[#39ff14] font-orbitron text-[9px] tracking-widest hover:bg-[#39ff14]/10 transition-all rounded-sm"
                  >
                    <Save size={12} /> <span className="xs:inline hidden">SYNC</span>
                  </button>
                )}
                <button 
                  disabled={!videoFile || isAnalyzing}
                  onClick={() => performAnalysis(videoFile!)}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 font-orbitron text-[9px] font-black tracking-[0.3em] transition-all rounded-sm ${
                    !videoFile || isAnalyzing 
                    ? 'bg-gray-900 text-gray-700 border border-white/5 opacity-50' 
                    : 'bg-white text-black hover:bg-[#39ff14] hover:shadow-[0_0_25px_rgba(57,255,20,0.4)]'
                  }`}
                >
                  {isAnalyzing ? "LOCKING..." : "RUN_NEURAL_SCAN"}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Metrics Dashboard - FORCED VISIBILITY IN SNAPSHOT */}
          <div className="xl:col-span-4 flex flex-col gap-1 h-full min-h-[500px] xl:min-h-0">
            <div className={`flex-1 bg-black/80 border border-white/5 p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto custom-scrollbar h-full rounded-sm relative ${isCapturing ? 'border-[#39ff14]/40 bg-black shadow-[0_0_40px_rgba(0,0,0,1)]' : ''}`}>
              <div className="flex justify-center items-center py-2 shrink-0">
                 <AuraGauge score={metrics.auraScore} loading={isAnalyzing} />
              </div>

              <div className="flex-1 px-1">
                <StatsDashboard metrics={metrics} loading={isAnalyzing} />
              </div>

              <div className="bg-[#39ff14]/5 border border-[#39ff14]/20 p-3 sm:p-4 rounded-sm shrink-0">
                 <div className="flex justify-between items-center mb-2">
                   <div className="text-[8px] sm:text-[9px] font-orbitron text-[#39ff14] tracking-wider uppercase">Potential_Gain</div>
                   <div className="text-[8px] sm:text-[9px] font-mono text-white/40 uppercase">Target: 100%</div>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="flex-1 h-1 bg-black/40 rounded-full overflow-hidden">
                      <div className="h-full bg-[#39ff14] transition-all duration-[2000ms] shadow-[0_0_10px_#39ff14]" style={{ width: isAnalyzing ? '0%' : `${100 - metrics.auraScore}%` }}></div>
                    </div>
                    <span className="text-[10px] font-mono text-[#39ff14] font-bold">+{100 - metrics.auraScore}%</span>
                 </div>
              </div>

              {/* Dedicated Mobile Export (HIDDEN ON SNAPSHOT) */}
              <button 
                data-hide-on-snap
                onClick={handleShare}
                disabled={isCapturing || metrics.auraScore === 0}
                className="w-full flex xs:hidden items-center justify-center gap-2 py-3 border border-gray-800 text-gray-400 font-orbitron text-[10px] hover:text-white transition-all rounded-sm disabled:opacity-30"
              >
                <Camera size={14} /> EXPORT_SNAP_ telemetry
              </button>
            </div>
          </div>
        </div>

        {/* SNAPSHOT SPECIFIC FOOTER */}
        {isCapturing && (
          <div data-show-on-snap className="hidden w-full border-t border-white/10 mt-8 pt-6 relative">
            <div className="flex justify-between items-center">
              <div className="flex gap-10">
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">Analysis Engine</span>
                  <div className="flex items-center gap-2">
                    <Fingerprint size={12} className="text-[#39ff14]" />
                    <span className="text-[10px] font-mono text-white font-bold">NEURAL_VERIFIED_V2.0</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">Data Integrity</span>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={12} className="text-[#39ff14]" />
                    <span className="text-[10px] font-mono text-white font-bold">BIO_SYNC_SECURE</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-orbitron text-[#39ff14] font-black tracking-widest uppercase mb-1">AURALINK SYSTEMS</div>
                <div className="text-[8px] font-mono text-white/20 uppercase tracking-tighter">TIMESTAMP: {new Date().toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer data-hide-on-snap className="z-40 shrink-0 hidden sm:block">
        <TerminalLog logs={logs} />
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(57, 255, 20, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(57, 255, 20, 0.5); }
        @media (max-width: 480px) {
          .xs\\:block { display: none; }
          .xs\\:inline { display: none; }
          .xs\\:hidden { display: flex; }
        }
        @media (min-width: 481px) {
           .xs\\:hidden { display: none; }
           .xs\\:flex { display: flex; }
        }
      `}} />
    </div>
  );
};

export default App;
