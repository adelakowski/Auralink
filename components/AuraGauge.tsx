
import React from 'react';

interface AuraGaugeProps { score: number; loading?: boolean; }

const AuraGauge: React.FC<AuraGaugeProps> = ({ score, loading }) => {
  const radius = 90;
  const svgSize = 220;
  const center = svgSize / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const isOptimal = score >= 85;
  const showStatus = !loading && score > 0;

  return (
    <div className="relative flex items-center justify-center p-1 w-full max-w-[240px]">
      <svg 
        width={svgSize} 
        height={svgSize} 
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        className="transform -rotate-90 block max-w-full h-auto"
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="rgba(255,255,255,0.03)"
          strokeWidth="6"
          fill="transparent"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#39ff14"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={loading ? circumference : offset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-1000 ease-out"
          style={{ filter: 'drop-shadow(0 0 8px rgba(57,255,20,0.4))' }}
        />
        <circle
          cx={center}
          cy={center}
          r={radius + 10}
          stroke="#39ff14"
          strokeWidth="1"
          strokeDasharray="2 12"
          className="opacity-10"
          fill="transparent"
        />
      </svg>
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none translate-y-1">
        <div className="flex flex-col items-center text-center">
          <span className="text-[8px] sm:text-[10px] text-[#39ff14]/50 font-orbitron uppercase tracking-[0.3em] mb-0.5 sm:mb-1">
            Aura Level
          </span>
          
          <span className="aura-gauge-text text-5xl sm:text-6xl font-orbitron font-black text-white leading-none tracking-tighter" style={{ textShadow: '0 0 20px rgba(57,255,20,0.3)' }}>
            {loading ? "..." : Math.round(score)}
          </span>
          
          <div className="mt-4 sm:mt-6 flex flex-col items-center min-h-[1.2rem]">
            {showStatus && (
              <div className={`flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 border rounded-full backdrop-blur-md transition-all duration-700 ${
                isOptimal 
                ? 'bg-green-500/10 border-green-500/30' 
                : 'bg-red-500/10 border-red-500/30'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  isOptimal 
                  ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' 
                  : 'bg-red-500 shadow-[0_0_10px_#ef4444]'
                } animate-pulse`}></div>
                <span className={`text-[8px] sm:text-[9px] font-mono font-bold tracking-[0.1em] sm:tracking-[0.2em] uppercase ${
                  isOptimal ? 'text-green-400' : 'text-red-400'
                }`}>
                  {isOptimal ? 'Optimal' : 'Correction'}
                </span>
              </div>
            )}
            
            {loading && (
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                <span className="text-white/40 text-[8px] font-mono tracking-widest uppercase animate-pulse">
                  Syncing...
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuraGauge;
