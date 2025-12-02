import React, { useState, useEffect } from 'react';
import { Cpu, RefreshCw, GitBranch, Shield, Zap, Activity } from 'lucide-react';

interface Process {
  id: string;
  pid: number;
  type: 'master' | 'worker' | 'old-worker';
  status: 'active' | 'draining';
  requestsHandled: number;
}

const ProcessArchitectureDemo: React.FC = () => {
  const [processes, setProcesses] = useState<Process[]>([
    { id: 'master', pid: 1024, type: 'master', status: 'active', requestsHandled: 0 },
    { id: 'w1', pid: 1025, type: 'worker', status: 'active', requestsHandled: 1542 },
    { id: 'w2', pid: 1026, type: 'worker', status: 'active', requestsHandled: 1603 },
    { id: 'w3', pid: 1027, type: 'worker', status: 'active', requestsHandled: 1489 },
    { id: 'w4', pid: 1028, type: 'worker', status: 'active', requestsHandled: 1567 },
  ]);
  const [nextPid, setNextPid] = useState(1029);
  const [isReloading, setIsReloading] = useState(false);
  const [requestStream, setRequestStream] = useState<{id: number, target: number}[]>([]);

  // Simulation: Increment request counts
  useEffect(() => {
    const interval = setInterval(() => {
      setProcesses(prev => prev.map(p => {
        if (p.type === 'master') return p;
        // Active workers get requests, draining workers finish up existing ones (simulated by slower increment then stop)
        if (p.status === 'active' && Math.random() > 0.3) {
          return { ...p, requestsHandled: p.requestsHandled + Math.floor(Math.random() * 5) };
        }
        if (p.status === 'draining' && Math.random() > 0.8) {
             // Simulate finishing last few requests
             return { ...p, requestsHandled: p.requestsHandled + 1 };
        }
        return p;
      }));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const handleReload = () => {
    if (isReloading) return;
    setIsReloading(true);

    // 1. Send Signal to Master
    // 2. Master marks old workers as draining
    setProcesses(prev => prev.map(p => 
      p.type === 'worker' ? { ...p, type: 'old-worker', status: 'draining' } : p
    ));

    // 3. Master spawns new workers immediately
    setTimeout(() => {
        const newWorkers: Process[] = Array.from({ length: 4 }).map((_, i) => ({
            id: `nw${nextPid + i}`,
            pid: nextPid + i,
            type: 'worker',
            status: 'active',
            requestsHandled: 0
        }));
        setNextPid(prev => prev + 4);
        
        setProcesses(prev => {
            // Keep master, keep old workers (draining), add new workers
            const master = prev.find(p => p.type === 'master')!;
            const oldWorkers = prev.filter(p => p.type === 'old-worker');
            return [master, ...oldWorkers, ...newWorkers];
        });

        // 4. Old workers exit after a delay (simulating connection drain)
        setTimeout(() => {
            setProcesses(prev => prev.filter(p => p.type !== 'old-worker'));
            setIsReloading(false);
        }, 4000);
    }, 800);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
      
      {/* Description Panel */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-stone-900/80 backdrop-blur-md p-6 rounded-2xl border border-stone-800 shadow-xl">
          <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Cpu className="text-blue-500" />
            Master-Worker 架构
          </h4>
          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            Nginx 使用一个 Master 进程来管理多个 Worker 进程。
          </p>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex gap-2">
              <Shield size={16} className="text-purple-400 shrink-0" />
              <span><strong className="text-gray-200">Master:</strong> 读取配置，管理 Worker，不处理业务请求。</span>
            </li>
            <li className="flex gap-2">
              <Zap size={16} className="text-green-400 shrink-0" />
              <span><strong className="text-gray-200">Worker:</strong> 处理网络请求。基于事件驱动，非阻塞。</span>
            </li>
            <li className="flex gap-2">
              <GitBranch size={16} className="text-yellow-400 shrink-0" />
              <span><strong className="text-gray-200">Hot Reload:</strong> 修改配置后，Master 启动新 Worker，旧 Worker 处理完当前请求后优雅退出。</span>
            </li>
          </ul>
        </div>

        <button 
          onClick={handleReload}
          disabled={isReloading}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all duration-300 ${
            isReloading 
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white transform hover:scale-[1.02]'
          }`}
        >
          <RefreshCw className={`${isReloading ? 'animate-spin' : ''}`} />
          {isReloading ? 'Reloading Configuration...' : 'Simulate: nginx -s reload'}
        </button>
      </div>

      {/* Visual Simulation */}
      <div className="lg:col-span-2 bg-stone-950 rounded-3xl p-8 border border-stone-800 relative min-h-[500px] flex flex-col items-center justify-center">
        
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

        {/* Master Process */}
        <div className="relative z-10 mb-12">
            <div className={`w-32 h-32 rounded-full flex flex-col items-center justify-center border-4 shadow-[0_0_50px_rgba(168,85,247,0.2)] transition-all duration-300 ${isReloading ? 'bg-purple-900/50 border-purple-400 animate-pulse' : 'bg-stone-900 border-purple-600'}`}>
                <span className="text-2xl font-bold text-white">Master</span>
                <span className="text-xs text-purple-300 font-mono mt-1">PID {processes.find(p => p.type === 'master')?.pid}</span>
            </div>
            {/* Control Lines */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-px h-12 bg-gradient-to-b from-purple-600 to-transparent"></div>
        </div>

        {/* Worker Area */}
        <div className="w-full relative z-10 min-h-[160px]">
            <div className="flex flex-wrap justify-center gap-6 transition-all duration-500">
                {processes.filter(p => p.type !== 'master').map((worker) => (
                    <div 
                        key={worker.id}
                        className={`
                            relative w-36 p-4 rounded-xl border-2 transition-all duration-700 transform
                            flex flex-col gap-2 items-center
                            ${worker.type === 'old-worker' 
                                ? 'bg-red-900/10 border-red-500/50 grayscale opacity-60 scale-90 translate-y-12' 
                                : 'bg-stone-900 border-green-500 hover:border-green-400 scale-100'}
                        `}
                    >
                        <div className="flex justify-between w-full items-center border-b border-white/10 pb-2 mb-1">
                            <span className={`text-xs font-bold uppercase ${worker.type === 'old-worker' ? 'text-red-400' : 'text-green-400'}`}>
                                {worker.type === 'old-worker' ? 'Shutting Down' : 'Worker'}
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono">PID {worker.pid}</span>
                        </div>
                        
                        <div className="w-full flex items-center justify-between gap-2">
                             <Activity size={16} className={worker.type === 'old-worker' ? 'text-gray-600' : 'text-green-500 animate-pulse'} />
                             <span className="text-sm font-mono text-white">{worker.requestsHandled}</span>
                        </div>
                        
                        <div className="text-[10px] text-gray-500 w-full text-right">reqs</div>
                    </div>
                ))}
            </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-6 left-6 flex gap-4 text-xs font-mono">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-stone-900 border border-green-500 rounded-full"></div>
                <span className="text-gray-400">Active Worker</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-900/20 border border-red-500 rounded-full"></div>
                <span className="text-gray-500">Draining Worker</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessArchitectureDemo;