import React, { useEffect, useRef } from 'react';

interface LogEntry {
  type: 'stdout' | 'stderr' | 'exit';
  message: string;
  timestamp: number;
}

interface LogViewerProps {
  logs: LogEntry[];
}

export function LogViewer({ logs }: LogViewerProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-slate-950 rounded-lg border border-slate-800 p-4 h-96 overflow-y-auto font-mono text-sm shadow-inner">
      {logs.map((log, index) => (
        <div key={index} className="mb-1">
          <span className="text-slate-500 mr-2">
            {new Date(log.timestamp).toLocaleTimeString()}
          </span>
          <span
            className={
              log.type === 'stderr'
                ? 'text-red-400'
                : log.type === 'exit'
                ? 'text-yellow-400'
                : 'text-emerald-400'
            }
          >
            {log.message}
          </span>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
