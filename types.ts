
export interface BiomechanicalMetrics {
  auraScore: number;
  stability: number;
  explosiveness: number;
  injuryPrevention: number;
  feedback: string;
}

export interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'ai';
}

export interface SavedSession {
  id: string;
  date: string;
  fileName: string;
  metrics: BiomechanicalMetrics;
}
