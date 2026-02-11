import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Server, Smartphone, Cpu, Database, ArrowRight, Box } from 'lucide-react';

export interface Node {
  id: string;
  label: string;
  type: 'process' | 'thread' | 'server' | 'client' | 'queue';
  status: 'idle' | 'active' | 'waiting';
}

export interface Message {
  id: string;
  source: string;
  target: string;
  label: string;
}

interface VisualizerProps {
  nodes: Node[];
  messages: Message[];
}

export function Visualizer({ nodes, messages }: VisualizerProps) {
  const getNodeIcon = (type: Node['type']) => {
    switch (type) {
      case 'process': return <Cpu className="w-6 h-6" />;
      case 'thread': return <Box className="w-6 h-6" />;
      case 'server': return <Server className="w-6 h-6" />;
      case 'client': return <Smartphone className="w-6 h-6" />;
      case 'queue': return <Database className="w-6 h-6" />;
      default: return <Box className="w-6 h-6" />;
    }
  };

  return (
    <div className="relative bg-slate-100 rounded-xl border border-slate-200 h-96 w-full overflow-hidden p-8 flex items-center justify-center">
      <div className="flex gap-16 items-center flex-wrap justify-center w-full">
        <AnimatePresence>
          {nodes.map((node) => (
            <motion.div
              key={node.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                borderColor: node.status === 'active' ? '#10b981' : node.status === 'waiting' ? '#f59e0b' : '#e2e8f0',
                boxShadow: node.status === 'active' ? '0 0 20px rgba(16, 185, 129, 0.3)' : 'none'
              }}
              exit={{ scale: 0, opacity: 0 }}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border-2 min-w-[120px] z-10"
            >
              <div className={`p-3 rounded-full ${
                node.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 
                node.status === 'waiting' ? 'bg-amber-100 text-amber-600' : 
                'bg-slate-100 text-slate-600'
              }`}>
                {getNodeIcon(node.type)}
              </div>
              <span className="font-medium text-slate-700">{node.label}</span>
              <span className="text-xs text-slate-400 uppercase">{node.status}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Message Animation Layer */}
      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence>
          {messages.map((msg) => {
             // Simple positioning logic - in a real app we'd calculate exact coordinates
             // For this demo, we assume nodes are laid out left-to-right or we just animate a generic flight
             return (
               <motion.div
                 key={msg.id}
                 initial={{ opacity: 0, x: -100, y: 0 }} // Simplified start
                 animate={{ opacity: 1, x: 100, y: 0 }}   // Simplified end
                 exit={{ opacity: 0 }}
                 transition={{ duration: 1.5, ease: "easeInOut" }}
                 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
               >
                 <div className="bg-indigo-500 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                   {msg.label}
                 </div>
                 <ArrowRight className="text-indigo-500 mt-1" />
               </motion.div>
             );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
