import React, { useState, useEffect, useRef } from 'react';
import { ServerNode, RequestPacket, AlgorithmType } from '../../types';
import { Server, Settings, Activity } from 'lucide-react';
import CodeBlock from '../CodeBlock';

const LoadBalancerDemo: React.FC = () => {
  const [algorithm, setAlgorithm] = useState<AlgorithmType>(AlgorithmType.ROUND_ROBIN);
  const [servers, setServers] = useState<ServerNode[]>([
    { id: 1, name: 'S1', status: 'active', weight: 1, activeConnections: 0 },
    { id: 2, name: 'S2', status: 'active', weight: 2, activeConnections: 0 },
    { id: 3, name: 'S3', status: 'active', weight: 1, activeConnections: 0 },
  ]);
  const [requests, setRequests] = useState<RequestPacket[]>([]);
  const [hoveredServerId, setHoveredServerId] = useState<number | null>(null);
  const requestCounter = useRef(0);
  const roundRobinIndex = useRef(0);

  // Spawner
  useEffect(() => {
    const interval = setInterval(() => {
      spawnRequest();
    }, 1200);
    return () => clearInterval(interval);
  }, [algorithm, servers]);

  // Physics Loop
  useEffect(() => {
    const loop = setInterval(() => {
      setRequests(prev => prev.map(req => {
        if (req.progress >= 100) return req;
        return { ...req, progress: req.progress + 2 }; // Speed
      }).filter(req => req.progress < 100)); // Remove finished
    }, 20);
    return () => clearInterval(loop);
  }, []);

  const spawnRequest = () => {
    const activeServers = servers.filter(s => s.status === 'active');
    if (activeServers.length === 0) return;

    let targetId: number | null = null;

    if (algorithm === AlgorithmType.ROUND_ROBIN) {
      targetId = activeServers[roundRobinIndex.current % activeServers.length].id;
      roundRobinIndex.current++;
    } else if (algorithm === AlgorithmType.WEIGHTED) {
      // Simple Weighted Random for visualization
      const weightedList = activeServers.flatMap(s => Array(s.weight || 1).fill(s.id));
      targetId = weightedList[Math.floor(Math.random() * weightedList.length)];
    } else if (algorithm === AlgorithmType.IP_HASH) {
       // Mock IP hash - stick to same server for same "session" (randomly picked but consistent in this simplified demo?)
       // For demo, just pick random to show distribution difference or stick to first
       targetId = activeServers[0].id; 
    }

    if (targetId) {
      const newReq: RequestPacket = {
        id: requestCounter.current++,
        targetServerId: targetId,
        progress: 0,
        color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][Math.floor(Math.random() * 4)]
      };
      setRequests(prev => [...prev, newReq]);
      
      // Flash server effect
      setServers(prev => prev.map(s => s.id === targetId ? { ...s, activeConnections: s.activeConnections + 1 } : s));
      setTimeout(() => {
        setServers(prev => prev.map(s => s.id === targetId ? { ...s, activeConnections: Math.max(0, s.activeConnections - 1) } : s));
      }, 1000); // Connection duration simulation
    }
  };

  const toggleServer = (id: number) => {
    setServers(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'active' ? 'down' : 'active' } : s));
  };

  const getCode = () => {
    let conf = `upstream myapp {
    # 负载均衡策略: ${algorithm}\n`;
    
    servers.forEach(s => {
      const state = s.status === 'down' ? ' down' : '';
      const weight = algorithm === AlgorithmType.WEIGHTED ? ` weight=${s.weight}` : '';
      conf += `    server 192.168.1.${10 + s.id}:8080${weight}${state};\n`;
    });
    
    if (algorithm === AlgorithmType.IP_HASH) {
      conf += `    ip_hash;\n`;
    }
    
    conf += `}

server {
    location / {
        proxy_pass http://myapp;
    }
}`;
    return conf;
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-center bg-stone-900 p-4 rounded-2xl border border-stone-800">
        <div className="flex gap-2 bg-black p-1 rounded-lg border border-stone-700">
          {(Object.values(AlgorithmType) as AlgorithmType[]).map((type) => (
            <button
              key={type}
              onClick={() => setAlgorithm(type)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                algorithm === type ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="text-gray-500 text-sm border-l border-stone-700 pl-4 flex items-center gap-2">
          <Activity size={14} />
          <span>Click servers to toggle ON/OFF</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-xl overflow-hidden h-fit">
           <CodeBlock code={getCode()} />
        </div>

        {/* Visualizer Canvas */}
        <div className="bg-stone-900/50 rounded-2xl p-8 border border-stone-800 relative min-h-[400px] flex flex-col justify-between">
           
           {/* Nginx Node */}
           <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
             <div className="w-20 h-20 bg-green-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.3)]">
               <span className="font-bold text-black text-xl">LB</span>
             </div>
           </div>

           {/* Server Nodes */}
           <div className="mt-auto grid grid-cols-3 gap-4 w-full">
             {servers.map((server) => (
               <div 
                 key={server.id}
                 onClick={() => toggleServer(server.id)}
                 onMouseEnter={() => setHoveredServerId(server.id)}
                 onMouseLeave={() => setHoveredServerId(null)}
                 className={`
                   relative h-32 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 border-2 group
                   ${server.status === 'active' 
                     ? 'bg-stone-800 border-stone-700 hover:border-blue-500' 
                     : 'bg-red-900/20 border-red-900 grayscale opacity-50'}
                   ${server.activeConnections > 0 ? 'scale-105 shadow-[0_0_20px_rgba(59,130,246,0.3)] border-blue-500' : ''}
                 `}
               >
                 {/* Tooltip */}
                 {hoveredServerId === server.id && (
                    <div className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-48 bg-black/90 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl z-30 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center pb-2 border-b border-white/10">
                          <span className="font-semibold text-white">Server Details</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${server.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {server.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-gray-400">
                           <span>Active Conn:</span>
                           <span className="text-white font-mono">{server.activeConnections}</span>
                        </div>
                         {algorithm === AlgorithmType.WEIGHTED && (
                          <div className="flex justify-between items-center text-gray-400">
                             <span>Weight:</span>
                             <span className="text-white font-mono">{server.weight}</span>
                          </div>
                        )}
                         {algorithm !== AlgorithmType.WEIGHTED && (
                          <div className="flex justify-between items-center text-gray-400">
                             <span>IP Suffix:</span>
                             <span className="text-white font-mono">.1{server.id}</span>
                          </div>
                        )}
                      </div>
                      {/* Tooltip Arrow */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-8 border-transparent border-t-black/90"></div>
                    </div>
                 )}

                 <Server className={`w-8 h-8 mb-2 ${server.status === 'active' ? 'text-blue-400' : 'text-red-500'}`} />
                 <span className="text-white font-mono">{server.name}</span>
                 {algorithm === AlgorithmType.WEIGHTED && <span className="text-xs text-gray-500 mt-1">Weight: {server.weight}</span>}
                 
                 {/* Connection Dot anchor */}
                 <div id={`server-target-${server.id}`} className="absolute -top-2 left-1/2 w-1 h-1" />
               </div>
             ))}
           </div>

           {/* Flying Particles */}
           {requests.map(req => {
              // Calculate position logic is simplified: Start top center, end at specific server bottom
              // We'll use simple percentage top-to-bottom for this React-based animation
              // X position interpolates from Center (50%) to Server Center (16%, 50%, 84%)
              
              const startX = 50; 
              const startY = 20; // Under LB
              
              let targetX = 50;
              if (req.targetServerId === 1) targetX = 16;
              if (req.targetServerId === 2) targetX = 50;
              if (req.targetServerId === 3) targetX = 84;
              
              const currentX = startX + (targetX - startX) * (req.progress / 100);
              const currentY = startY + (80 - startY) * (req.progress / 100);

              return (
                <div 
                  key={req.id}
                  className="absolute w-3 h-3 rounded-full shadow-sm z-10 pointer-events-none"
                  style={{
                    backgroundColor: req.color,
                    left: `${currentX}%`,
                    top: `${currentY}%`,
                    transform: 'translate(-50%, -50%)',
                    opacity: req.progress > 95 ? 0 : 1
                  }}
                />
              );
           })}
        </div>
      </div>
    </div>
  );
};

export default LoadBalancerDemo;