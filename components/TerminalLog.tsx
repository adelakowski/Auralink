
import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface TerminalLogProps {
  logs: LogEntry[];
}

const TerminalLog: React.FC<TerminalLogProps> = ({ logs }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-black border-t border-gray-800 h-24 sm:h-32 w-full p-2 font-mono text-[9px] sm:text-[11px] overflow-y-auto relative">
      <div className="sticky top-0 right-0 float-right text-[8px] sm:text-[9px] text-gray-600 bg-black/80 px-1 font-orbitron z-10">SYSTEM_LOG</div>
      {logs.map((log, idx) => (
        <div key={idx} className="flex gap-2 sm:gap-3 mb-1 animate-in fade-in slide-in-from-left-2 duration-300">
          <span className="text-gray-600 shrink-0">[{log.timestamp}]</span>
          <span className={
            log.type === 'success' ? 'text-[#39ff14]' :
            log.type === 'error' ? 'text-red-500' :
            log.type === 'warning' ? 'text-yellow-500' :
            log.type === 'ai' ? 'text-cyan-400' :
            'text-gray-400'
          }>
            {log.type === 'ai' ? '✨ [AI]' : `[${log.type.toUpperCase()}]`} {log.message}
          </span>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
};

export default TerminalLog;
