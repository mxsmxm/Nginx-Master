import React, { useState, useEffect } from 'react';
import { Database, Server, User, Clock, RefreshCw, Zap } from 'lucide-react';
import CodeBlock from '../CodeBlock';

const CacheDemo: React.FC = () => {
  const [cacheState, setCacheState] = useState<'empty' | 'valid' | 'expired'>('empty');
  const [requestStatus, setRequestStatus] = useState<'idle' | 'traveling' | 'processing' | 'returning'>('idle');
  const [path, setPath] = useState<'short' | 'long' | null>(null); // short = hit, long = miss
  const [ttl, setTtl] = useState(0);
  const [responseCode, setResponseCode] = useState<number | null>(null);
  const [cacheHeader, setCacheHeader] = useState<string>('-');

  // TTL Timer
  useEffect(() => {
    let interval: ReturnType<typeof setTimeout>;
    if (ttl > 0) {
      interval = setInterval(() => {
        setTtl((prev) => {
          if (prev <= 1) {
            setCacheState('expired');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [ttl]);

  const handleRequest = () => {
    if (requestStatus !== 'idle') return;

    setRequestStatus('traveling');
    setResponseCode(null);
    setCacheHeader('-');

    // Determine Logic
    const isHit = cacheState === 'valid';
    setPath(isHit ? 'short' : 'long');

    // Animation Sequence
    setTimeout(() => {
      // Arrived at Nginx
      if (isHit) {
        // Cache HIT
        setCacheHeader('HIT');
        setRequestStatus('returning');
        setTimeout(() => finishRequest(200), 1000);
      } else {
        // Cache MISS or EXPIRED
        setCacheHeader(cacheState === 'expired' ? 'EXPIRED' : 'MISS');
        setRequestStatus('processing'); // Go to backend
        
        setTimeout(() => {
            // Backend Processed
            setRequestStatus('returning');
            // Update Cache on return
            setCacheState('valid');
            setTtl(10); // Reset TTL to 10s
            setTimeout(() => finishRequest(200), 1000);
        }, 1500);
      }
    }, 1000);
  };

  const finishRequest = (code: number) => {
    setResponseCode(code);
    setRequestStatus('idle');
    setPath(null);
  };

  const clearCache = () => {
    setCacheState('empty');
    setTtl(0);
  };

  const nginxConfig = `proxy_cache_path /data/nginx/cache levels=1:2 keys_zone=my_cache:10m max_size=10g inactive=60m use_temp_path=off;

server {
    location /api/ {
        proxy_cache my_cache;
        proxy_cache_valid 200 302 10m;
        proxy_cache_valid 404      1m;
        
        # Add header for debugging
        add_header X-Cache-Status $upstream_cache_status;
        
        proxy_pass http://backend;
    }
}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Config & Controls */}
      <div className="space-y-6">
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-2xl">
          <CodeBlock code={nginxConfig} />
        </div>
        
        <div className="bg-stone-900/50 p-6 rounded-2xl border border-stone-800">
           <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
             <Zap className="text-yellow-400" size={20}/> Cache Controls
           </h4>
           <div className="flex gap-4">
             <button 
               onClick={handleRequest}
               disabled={requestStatus !== 'idle'}
               className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                 requestStatus === 'idle' 
                   ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                   : 'bg-gray-700 text-gray-500 cursor-not-allowed'
               }`}
             >
               {requestStatus === 'idle' ? 'Send Request' : 'Processing...'}
             </button>
             <button 
               onClick={clearCache}
               className="px-6 py-3 bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-900 rounded-xl transition-colors"
             >
               Purge
             </button>
           </div>
           
           <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-black/50 p-3 rounded-lg border border-white/5">
                <span className="text-xs text-gray-500 uppercase">Last Status</span>
                <div className={`text-xl font-mono font-bold ${
                    cacheHeader === 'HIT' ? 'text-green-400' : 
                    cacheHeader === 'MISS' ? 'text-red-400' : 
                    cacheHeader === 'EXPIRED' ? 'text-yellow-400' : 'text-gray-400'
                }`}>
                    {cacheHeader}
                </div>
              </div>
              <div className="bg-black/50 p-3 rounded-lg border border-white/5">
                <span className="text-xs text-gray-500 uppercase">Latency</span>
                <div className="text-xl font-mono font-bold text-white">
                    {responseCode ? (path === 'short' ? '5ms' : '150ms') : '-'}
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* Visualization */}
      <div className="bg-stone-100 rounded-3xl p-8 relative flex flex-col justify-between min-h-[400px] border border-stone-300 overflow-hidden">
        
        {/* Nodes */}
        <div className="flex justify-between items-center relative z-10 h-full">
            {/* Client */}
            <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <User className="text-white w-8 h-8" />
                </div>
                <span className="text-sm font-bold text-gray-600">Client</span>
            </div>

            {/* Nginx + Cache */}
            <div className="flex flex-col items-center gap-2 relative">
                <div className="w-48 h-40 bg-black rounded-2xl flex flex-col items-center justify-center shadow-2xl border-4 border-green-500 relative">
                    <span className="font-bold text-white text-lg mb-2">NGINX</span>
                    
                    {/* Internal Cache Storage Visual */}
                    <div className={`w-36 h-16 rounded-lg flex items-center justify-between px-3 transition-colors duration-300 ${
                        cacheState === 'empty' ? 'bg-gray-800 border-gray-700' :
                        cacheState === 'valid' ? 'bg-green-900/30 border-green-500/50' :
                        'bg-red-900/30 border-red-500/50'
                    } border-2`}>
                        <div className="flex items-center gap-2">
                            <Database size={16} className={cacheState === 'valid' ? 'text-green-400' : 'text-gray-500'} />
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 font-mono">/api/data</span>
                                <span className={`text-xs font-bold ${cacheState === 'valid' ? 'text-white' : 'text-gray-500'}`}>
                                    {cacheState === 'empty' ? 'Empty' : (cacheState === 'valid' ? 'Cached' : 'Expired')}
                                </span>
                            </div>
                        </div>
                        {cacheState !== 'empty' && (
                            <div className="flex flex-col items-end">
                                <Clock size={12} className="text-yellow-500" />
                                <span className="text-[10px] text-yellow-500 font-mono">{ttl}s</span>
                            </div>
                        )}
                    </div>
                </div>
                <span className="text-sm font-bold text-gray-600">Reverse Proxy & Cache</span>
            </div>

            {/* Origin Server */}
            <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                    <Server className="text-white w-8 h-8" />
                </div>
                <span className="text-sm font-bold text-gray-600">Origin</span>
            </div>
        </div>

        {/* Animation Particles */}
        {/* Path 1: Client <-> Nginx */}
        <div className="absolute top-1/2 left-[10%] right-[50%] h-1 bg-gray-300 -translate-y-1/2 -z-0"></div>
        {requestStatus !== 'idle' && (
            <div 
                className={`absolute top-1/2 w-4 h-4 bg-blue-500 rounded-full shadow-md z-20 transition-all duration-[1000ms] ease-linear`}
                style={{
                    left: requestStatus === 'traveling' ? '50%' : '10%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: requestStatus === 'returning' && path === 'short' ? '#22c55e' : '#3b82f6' // Green if returning hit
                }}
            />
        )}

        {/* Path 2: Nginx <-> Origin */}
        <div className="absolute top-1/2 left-[50%] right-[10%] h-1 bg-gray-300 -translate-y-1/2 -z-0 border-t-2 border-dashed border-gray-400"></div>
        {(requestStatus === 'processing' || (requestStatus === 'returning' && path === 'long')) && (
            <div 
                className={`absolute top-1/2 w-4 h-4 rounded-full shadow-md z-20 transition-all duration-[1500ms] ease-in-out`}
                style={{
                    left: requestStatus === 'processing' ? '90%' : '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: requestStatus === 'processing' ? '#3b82f6' : '#22c55e' // Blue going, Green returning
                }}
            />
        )}

      </div>
    </div>
  );
};

export default CacheDemo;