import React, { useState } from 'react';
import { Layout, Network, Cpu, Layers } from 'lucide-react';
import { SimulationRunner } from './components/SimulationRunner';

function App() {
  const [activeTab, setActiveTab] = useState<'ipc' | 'threads' | 'sockets'>('ipc');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <Layout className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
            Distributed Systems Visualizer
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar Navigation */}
          <div className="col-span-12 md:col-span-3 space-y-2">
            <button
              onClick={() => setActiveTab('ipc')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                activeTab === 'ipc'
                  ? 'bg-white text-indigo-600 shadow-md ring-1 ring-slate-200'
                  : 'text-slate-600 hover:bg-white/50 hover:text-slate-900'
              }`}
            >
              <Cpu className="w-5 h-5" />
              <div>
                <div className="font-semibold">Multi-Process</div>
                <div className="text-xs opacity-70">IPC & Pipes</div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('threads')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                activeTab === 'threads'
                  ? 'bg-white text-indigo-600 shadow-md ring-1 ring-slate-200'
                  : 'text-slate-600 hover:bg-white/50 hover:text-slate-900'
              }`}
            >
              <Layers className="w-5 h-5" />
              <div>
                <div className="font-semibold">Multi-Thread</div>
                <div className="text-xs opacity-70">Threads & Queues</div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('sockets')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                activeTab === 'sockets'
                  ? 'bg-white text-indigo-600 shadow-md ring-1 ring-slate-200'
                  : 'text-slate-600 hover:bg-white/50 hover:text-slate-900'
              }`}
            >
              <Network className="w-5 h-5" />
              <div>
                <div className="font-semibold">Distributed</div>
                <div className="text-xs opacity-70">TCP Sockets</div>
              </div>
            </button>
          </div>

          {/* Main Content Area */}
          <div className="col-span-12 md:col-span-9">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 min-h-[600px]">
              {activeTab === 'ipc' && (
                <SimulationRunner
                  type="ipc"
                  title="Inter-Process Communication (IPC)"
                  description="Demonstrates two separate OS processes communicating via a Pipe. The Parent process spawns a Child process and sends data through a unidirectional or bidirectional channel."
                />
              )}
              {activeTab === 'threads' && (
                <SimulationRunner
                  type="threads"
                  title="Multi-Threading & Queues"
                  description="Demonstrates the Producer-Consumer pattern using Python threads sharing a synchronized Queue. Multiple threads run within a single process context."
                />
              )}
              {activeTab === 'sockets' && (
                <SimulationRunner
                  type="sockets"
                  title="Network Sockets (TCP)"
                  description="Demonstrates a distributed system topology where a Server listens on a port and a Client connects to it. This simulates communication between distinct nodes on a network."
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
