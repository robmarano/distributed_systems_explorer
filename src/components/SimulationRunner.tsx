import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Terminal } from 'lucide-react';
import { LogViewer } from './LogViewer';
import { Visualizer, Node, Message } from './Visualizer';

interface SimulationRunnerProps {
  type: 'ipc' | 'threads' | 'sockets';
  title: string;
  description: string;
}

export function SimulationRunner({ type, title, description }: SimulationRunnerProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Ref to keep track of nodes for updates without re-renders causing issues
  const nodesRef = useRef<Node[]>([]);

  const parseLog = (message: string) => {
    // Simple regex-based state machine for visualization
    
    // 1. Detect Process/Thread/Node Start
    // Matches: [Parent-123] Process started.
    // Matches: [Producer-1] Started.
    const startMatch = message.match(/\[(.*?)] (Process started|Started|Starting TCP Server|Connecting to)/);
    if (startMatch) {
      const id = startMatch[1];
      const nodeType = type === 'ipc' ? 'process' : type === 'threads' ? 'thread' : id.includes('Server') ? 'server' : 'client';
      
      const newNode: Node = {
        id,
        label: id,
        type: nodeType as any,
        status: 'active'
      };
      
      if (!nodesRef.current.find(n => n.id === id)) {
        nodesRef.current = [...nodesRef.current, newNode];
        setNodes([...nodesRef.current]);
      }
    }

    // 2. Detect Waiting State
    if (message.includes('Waiting') || message.includes('Listening')) {
       const idMatch = message.match(/\[(.*?)]/);
       if (idMatch) {
         const id = idMatch[1];
         nodesRef.current = nodesRef.current.map(n => 
           n.id === id ? { ...n, status: 'waiting' } : n
         );
         setNodes([...nodesRef.current]);
       }
    }

    // 3. Detect Sending/Producing
    // Matches: [Parent-123] Sending data via Pipe: ...
    // Matches: [Producer-1] Producing ...
    const sendMatch = message.match(/\[(.*?)] (Sending|Producing|Put|Sending response)/);
    if (sendMatch) {
      const id = sendMatch[1];
      nodesRef.current = nodesRef.current.map(n => 
        n.id === id ? { ...n, status: 'active' } : n
      );
      setNodes([...nodesRef.current]);
      
      // Add a transient message
      const msgId = Date.now().toString();
      const msgLabel = message.split(':')[1]?.trim().substring(0, 15) + '...' || 'Data';
      
      setMessages(prev => [...prev, { id: msgId, source: id, target: '?', label: msgLabel }]);
      setTimeout(() => {
        setMessages(prev => prev.filter(m => m.id !== msgId));
      }, 1500);
    }
    
    // 4. Detect Receiving/Consuming
    if (message.includes('Received') || message.includes('Got') || message.includes('Connected')) {
       const idMatch = message.match(/\[(.*?)]/);
       if (idMatch) {
         const id = idMatch[1];
         nodesRef.current = nodesRef.current.map(n => 
           n.id === id ? { ...n, status: 'active' } : n
         );
         setNodes([...nodesRef.current]);
       }
    }
    
    // 5. Detect Exit
    if (message.includes('Exiting') || message.includes('shutting down')) {
       const idMatch = message.match(/\[(.*?)]/);
       if (idMatch) {
         const id = idMatch[1];
         nodesRef.current = nodesRef.current.filter(n => n.id !== id);
         setNodes([...nodesRef.current]);
       }
    }
  };

  const runSimulation = () => {
    setIsRunning(true);
    setLogs([]);
    setNodes([]);
    nodesRef.current = [];
    setMessages([]);

    const eventSource = new EventSource(`/api/run-simulation/${type}`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'exit') {
        eventSource.close();
        setIsRunning(false);
        return;
      }

      setLogs((prev) => [...prev, { ...data, timestamp: Date.now() }]);
      
      if (data.type === 'stdout') {
        parseLog(data.message);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      setIsRunning(false);
      setLogs((prev) => [...prev, { type: 'stderr', message: 'Connection lost', timestamp: Date.now() }]);
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          <p className="text-slate-600 mt-2 max-w-2xl">{description}</p>
        </div>
        <button
          onClick={runSimulation}
          disabled={isRunning}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
            isRunning
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30'
          }`}
        >
          {isRunning ? (
            <>
              <RotateCcw className="w-5 h-5 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Start Simulation
            </>
          )}
        </button>
      </div>

      <Visualizer nodes={nodes} messages={messages} />

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-slate-700 font-medium">
          <Terminal className="w-5 h-5" />
          <h3>Live Execution Logs</h3>
        </div>
        <LogViewer logs={logs} />
      </div>
    </div>
  );
}
