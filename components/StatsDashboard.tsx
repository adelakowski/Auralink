
import React from 'react';
import { BiomechanicalMetrics } from '../types';
import { Shield, Zap, Wind, Info } from 'lucide-react';

interface StatsDashboardProps {
  metrics: BiomechanicalMetrics;
  loading?: boolean;
}

const StatRow: React.FC<{ label: string; value: number; icon: React.ReactNode; loading?: boolean }> = ({ label, value, icon, loading }) => (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-1">
      <div className="flex items-center gap-2">
        <span className="text-[#39ff14] opacity-70">{icon}</span>
        <span className="text-[10px] font-orbitron text-white/60 tracking-wider">{label}</span>
      </div>
      <span className="text-xs font-mono font-bold text-white">{loading ? "..." : value}%</span>
    </div>
    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
      <div 
        className="h-full bg-[#39ff14] transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(57,255,20,0.5)]"
        style={{ width: loading ? '0%' : `${value}%` }}
      />
    </div>
  </div>
);

const StatsDashboard: React.FC<StatsDashboardProps> = ({ metrics, loading }) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Visual Metrics */}
      <div className="grid grid-cols-1 gap-1">
        <StatRow label="Stability" value={metrics.stability} icon={<Shield size={12}/>} loading={loading} />
        <StatRow label="Explosiveness" value={metrics.explosiveness} icon={<Zap size={12}/>} loading={loading} />
        <StatRow label="Injury Prevention" value={metrics.injuryPrevention} icon={<Wind size={12}/>} loading={loading} />
      </div>

      {/* Simplified Coaching Cues (Layman Terms) */}
      <div className="bg-white/[0.02] border border-white/10 p-5 rounded-sm relative group">
        <div className="absolute top-3 right-3 text-[#39ff14]/20 group-hover:text-[#39ff14]/50 transition-colors">
          <Info size={16} />
        </div>
        <h4 className="text-[10px] font-orbitron text-[#39ff14] mb-5 tracking-[0.2em] uppercase border-b border-[#39ff14]/10 pb-2">Coach_Adjustments</h4>
        
        <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-3 bg-white/5 w-full"></div>
              <div className="h-3 bg-white/5 w-4/5"></div>
              <div className="h-3 bg-white/5 w-3/4"></div>
            </div>
          ) : (
            <div className="text-[11px] font-mono text-white/90 leading-relaxed whitespace-pre-wrap space-y-4">
              {metrics.feedback || "SYSTEM_STANDBY: Awaiting movement stream analysis."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
