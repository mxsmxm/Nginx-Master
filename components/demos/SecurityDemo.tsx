import React, { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, Ban, Plus, Trash2 } from 'lucide-react';
import CodeBlock from '../CodeBlock';

interface Request {
  id: number;
  ip: string;
  status: 'pending' | 'allowed' | 'blocked';
  x: number;
}

const SecurityDemo: React.FC = () => {
  const [blacklist, setBlacklist] = useState<string[]>(['10.0.0.5']);
  const [requests, setRequests] = useState<Request[]>([]);
  const [newIp, setNewIp] = useState('');
  
  const SAMPLE_IPS = ['192.168.1.100', '192.168.1.101', '10.0.0.5', '172.16.0.20', '6.6.6.6'];

  // Traffic Generator
  useEffect(() => {
    const interval = setInterval(() => {
      const ip = SAMPLE_IPS[Math.floor(Math.random() * SAMPLE_IPS.length)];
      const id = Date.now();
      setRequests(prev => [...prev, { id, ip, status: 'pending', x: 0 }]);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Traffic Mover
  useEffect(() => {
    const interval = setInterval(() => {
      setRequests(prev => 
        prev
          .map(req => {
            // Logic: Check if blocked when reaching the "Gate" (x=50)
            let newStatus = req.status;
            if (req.x >= 48 && req.x <= 52 && req.status === 'pending') {
               newStatus = blacklist.includes(req.ip) ? 'blocked' : 'allowed';
            }
            
            // If blocked, it bounces off or stops. Let's make it fade out after blocking.
            if (req.status === 'blocked' && req.x > 55) return null; 
            if (req.x > 100) return null; // Remove if passed screen

            return { ...req, x: req.x + 1, status: newStatus };
          })
          .filter(Boolean) as Request[]
      );
    }, 30);
    return () => clearInterval(interval);
  }, [blacklist]);

  const addIp = () => {
    if (newIp && !blacklist.includes(newIp)) {
      setBlacklist(prev => [...prev, newIp]);
      setNewIp('');
    }
  };

  const removeIp = (ip: string) => {
    setBlacklist(prev => prev.filter(i => i !== ip));
  };

  const code = `location / {
    # 允许内部子网
    allow 192.168.1.0/24;
    
    # 屏蔽特定恶意 IP
${blacklist.map(ip => `    deny ${ip};`).join('\n')}
    
    # 默认规则 (可选)
    # deny all; 
}`;

  return (
    <div className="flex flex-col gap-8">
      {/* Controls & Config */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="md:col-span-2 bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-xl">
             <CodeBlock code={code} />
         </div>

         <div className="bg-stone-900/50 p-6 rounded-2xl border border-stone-800 flex flex-col">
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Ban className="text-red-500" /> Blacklist Management
            </h4>
            
            <div className="flex gap-2 mb-4">
                <select 
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  className="bg-black border border-gray-700 text-white text-sm rounded-lg p-2.5 flex-1 outline-none focus:border-blue-500"
                >
                    <option value="">Select IP to Block</option>
                    {SAMPLE_IPS.filter(ip => !blacklist.includes(ip)).map(ip => (
                        <option key={ip} value={ip}>{ip}</option>
                    ))}
                </select>
                <button 
                    onClick={addIp}
                    disabled={!newIp}
                    className="bg-red-600 hover:bg-red-500 disabled:bg-gray-700 text-white p-2.5 rounded-lg transition-colors"
                >
                    <Plus size={20}/>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 max-h-[150px] custom-scrollbar">
                {blacklist.length === 0 && <div className="text-gray-500 text-sm italic">No IPs blocked. All traffic allowed.</div>}
                {blacklist.map(ip => (
                    <div key={ip} className="flex items-center justify-between bg-red-900/20 border border-red-900/50 p-2 rounded-lg text-sm text-red-200 animate-in fade-in slide-in-from-right-4">
                        <span className="font-mono">{ip}</span>
                        <button onClick={() => removeIp(ip)} className="text-red-400 hover:text-red-200">
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
         </div>
      </div>

      {/* Visualizer */}
      <div className="bg-gradient-to-r from-gray-900 to-black rounded-3xl p-8 relative min-h-[250px] overflow-hidden border border-gray-800 flex items-center">
        
        {/* Road Markings */}
        <div className="absolute inset-0 flex flex-col justify-center space-y-8 opacity-20 pointer-events-none">
            <div className="border-t border-dashed border-white w-full"></div>
            <div className="border-t border-dashed border-white w-full"></div>
        </div>

        {/* The Gate (Nginx) */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-green-500/30 z-10"></div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
            <div className="w-12 h-24 bg-stone-800 border-2 border-green-500 rounded-lg shadow-[0_0_30px_rgba(34,197,94,0.3)] flex items-center justify-center">
                <ShieldCheck className="text-green-500 w-8 h-8" />
            </div>
            <span className="text-xs text-gray-500 mt-2 font-mono">FIREWALL</span>
        </div>

        {/* Requests */}
        {requests.map(req => (
            <div 
                key={req.id}
                className="absolute top-1/2 -translate-y-1/2 transition-all duration-75 ease-linear flex flex-col items-center gap-1"
                style={{ left: `${req.x}%` }}
            >
                <div 
                    className={`w-12 h-8 rounded-md shadow-md flex items-center justify-center text-[10px] font-bold font-mono text-white relative
                        ${req.status === 'blocked' ? 'bg-red-600' : 'bg-blue-600'}
                    `}
                >
                    {req.status === 'blocked' && (
                        <div className="absolute -top-6 text-red-500 font-bold text-lg animate-bounce">403</div>
                    )}
                    {req.status === 'allowed' && req.x > 55 && (
                        <div className="absolute -top-4 text-green-500 font-bold text-xs opacity-80">200</div>
                    )}
                    REQ
                </div>
                <span className={`text-[10px] whitespace-nowrap ${blacklist.includes(req.ip) ? 'text-red-400' : 'text-gray-500'}`}>
                    {req.ip}
                </span>
            </div>
        ))}

        <div className="absolute left-2 bottom-2 text-xs text-gray-600">INCOMING TRAFFIC</div>
        <div className="absolute right-2 bottom-2 text-xs text-gray-600">BACKEND SERVER</div>

      </div>
    </div>
  );
};

export default SecurityDemo;