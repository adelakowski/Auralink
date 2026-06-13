
import React from 'react';
import { SavedSession } from '../types';
import { Database, Trash2, ExternalLink } from 'lucide-react';

interface BioArchiveProps {
  sessions: SavedSession[];
  onDelete: (id: string) => void;
  onLoad: (session: SavedSession) => void;
}

const BioArchive: React.FC<BioArchiveProps> = ({ sessions, onDelete, onLoad }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4 border-b border-[#39ff14]/20 pb-2">
        <Database size={14} className="text-[#39ff14]" />
        <h3 className="text-[10px] font-orbitron text-white tracking-[0.2em] uppercase">Neural_Archive</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
        {sessions.length === 0 ? (
          <div className="h-20 flex items-center justify-center border border-white/5 bg-white/[0.01] rounded-sm italic text-[9px] text-white/20">
            NO_ARCHIVED_SEQUENCES_FOUND
          </div>
        ) : (
          sessions.map((session) => (
            <div 
              key={session.id} 
              className="group relative bg-white/[0.03] border border-white/5 p-3 rounded-sm hover:border-[#39ff14]/40 transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-[10px] font-bold text-white truncate max-w-[140px] uppercase tracking-wider">{session.fileName}</div>
                  <div className="text-[8px] font-mono text-white/30">{session.date}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-orbitron font-black text-[#39ff14] neon-text">{session.metrics.auraScore}%</span>
                </div>
              </div>
              
              <div className="flex gap-1 mb-3">
                {[
                  { label: 'S', val: session.metrics.stability },
                  { label: 'E', val: session.metrics.explosiveness },
                  { label: 'I', val: session.metrics.injuryPrevention }
                ].map(stat => (
                  <div key={stat.label} className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#39ff14]/60" style={{ width: `${stat.val}%` }}></div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => onLoad(session)}
                  className="p-1 hover:text-[#39ff14] text-white/40 transition-colors"
                  title="View Details"
                >
                  <ExternalLink size={12} />
                </button>
                <button 
                  onClick={() => onDelete(session.id)}
                  className="p-1 hover:text-red-500 text-white/40 transition-colors"
                  title="Wipe from Memory"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BioArchive;
