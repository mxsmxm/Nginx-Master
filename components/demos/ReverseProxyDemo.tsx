import React, { useState, useEffect, useRef } from 'react';
import { User, Server, ShieldCheck, FileText } from 'lucide-react';
import CodeBlock from '../CodeBlock';

const ReverseProxyDemo: React.FC = () => {
  const [requestState, setRequestState] = useState<'idle' | 'client-to-nginx' | 'nginx-to-server' | 'server-to-nginx' | 'nginx-to-client'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const simulateRequest = () => {
    if (requestState !== 'idle') return;
    setRequestState('client-to-nginx');
  };

  useEffect(() => {
    if (requestState === 'idle') return;

    let timer: ReturnType<typeof setTimeout>;
    
    if (requestState === 'client-to-nginx') {
      timer = setTimeout(() => setRequestState('nginx-to-server'), 1000);
    } else if (requestState === 'nginx-to-server') {
      timer = setTimeout(() => setRequestState('server-to-nginx'), 1000);
    } else if (requestState === 'server-to-nginx') {
      timer = setTimeout(() => {
        // Generate Access Log when response returns to Nginx
        const now = new Date();
        const dateStr = `${now.getDate()}/${now.toLocaleString('en-US', { month: 'short' })}/${now.getFullYear()}:${now.toLocaleTimeString('en-US', {hour12: false})} +0000`;
        const newLog = `203.0.113.42 - - [${dateStr}] "GET /api/users HTTP/1.1" 200 452`;
        setLogs(prev => [...prev, newLog]);
        
        setRequestState('nginx-to-client');
      }, 1000);
    } else if (requestState === 'nginx-to-client') {
      timer = setTimeout(() => setRequestState('idle'), 1000);
    }
    return () => clearTimeout(timer);
  }, [requestState]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const code = `server {
    listen 80;
    server_name api.example.com;

    location / {
        # Hide real backend (192.168.1.50)
        proxy_pass http://192.168.1.50:3000;
        
        # Pass real client IP
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        # Access Log enabled by default
        access_log /var/log/nginx/access.log;
    }
}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="bg-black text-white rounded-2xl p-6 shadow-xl border border-gray-800">
           <CodeBlock code={code} />
           <p className="text-gray-400 text-sm mt-4 leading-relaxed">
             当请求处理完成后，Nginx 会自动记录访问日志。这是排查问题和分析流量的重要数据源。
           </p>
        </div>

        {/* Access Log Console */}
        <div className="bg-stone-950 rounded-2xl p-4 border border-stone-800 shadow-inner flex-1 flex flex-col min-h-[180px]">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10 text-gray-400 text-xs font-mono uppercase tracking-wider">
            <FileText size={12} />
            /var/log/nginx/access.log
          </div>
          <div className="font-mono text-[11px] space-y-2 overflow-y-auto max-h-[150px] pr-2 custom-scrollbar">
             {logs.length === 0 && (
               <div className="text-gray-600 italic py-2">Waiting for requests...</div>
             )}
             {logs.map((log, idx) => (
               <div key={idx} className="text-gray-300 break-all border-l-2 border-green-500 pl-2 animate-pulse">
                 <span className="text-blue-400">{log.split(' ')[0]}</span>
                 <span className="text-gray-500"> - - </span>
                 <span className="text-yellow-500">{log.match(/\[(.*?)\]/)?.[0]}</span>
                 <span className="text-cyan-400"> {log.match(/"(.*?)"/)?.[0]} </span>
                 <span className="text-green-400"> 200 </span>
                 <span className="text-purple-400"> 452 </span>
               </div>
             ))}
             <div ref={logsEndRef} />
          </div>
        </div>
      </div>

      <div className="lg:col-span-3 bg-gray-100 rounded-3xl p-8 relative min-h-[400px] flex items-center justify-between overflow-hidden border border-gray-200 shadow-inner">
        
        {/* Client */}
        <div className="flex flex-col items-center z-10 relative">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-lg mb-2">
            <User className="text-white w-8 h-8" />
          </div>
          <span className="text-sm font-bold text-gray-700">Client</span>
          <span className="text-xs text-gray-500">203.0.113.42</span>
        </div>

        {/* Connection Line 1 */}
        <div className="flex-1 h-1 bg-gray-300 relative mx-4 rounded-full">
           {(requestState === 'client-to-nginx' || requestState === 'nginx-to-client') && (
             <div 
                className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full transition-all duration-1000 ease-linear shadow-md`}
                style={{
                  left: requestState === 'client-to-nginx' ? '100%' : '0%',
                  backgroundColor: requestState === 'nginx-to-client' ? '#10b981' : '#2563eb' // Green on return
                }}
             />
           )}
        </div>

        {/* Nginx */}
        <div className="flex flex-col items-center z-10 relative">
          <div className={`w-24 h-24 rounded-2xl flex flex-col items-center justify-center shadow-2xl border-4 transition-colors duration-300 mb-2 ${requestState === 'nginx-to-client' ? 'bg-stone-900 border-green-400' : 'bg-black border-green-500'}`}>
            <span className="font-bold text-white text-xl">NGINX</span>
            <ShieldCheck className={`w-6 h-6 mt-1 ${requestState === 'nginx-to-client' ? 'text-green-400 animate-pulse' : 'text-green-500'}`} />
          </div>
          <span className="text-sm font-bold text-gray-700">Reverse Proxy</span>
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-700 font-semibold bg-white/50 px-2 rounded-full border border-gray-200">Port 80</span>
            {requestState === 'nginx-to-client' && (
                <span className="text-[10px] text-green-600 font-bold animate-pulse mt-1">Writing Log...</span>
            )}
          </div>
        </div>

        {/* Connection Line 2 */}
        <div className="flex-1 h-1 bg-gray-300 relative mx-4 rounded-full border-t border-dashed border-gray-400">
           {(requestState === 'nginx-to-server' || requestState === 'server-to-nginx') && (
             <div 
                className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full transition-all duration-1000 ease-linear shadow-md`}
                style={{
                  left: requestState === 'nginx-to-server' ? '100%' : '0%',
                  backgroundColor: requestState === 'server-to-nginx' ? '#10b981' : '#2563eb'
                }}
             />
           )}
        </div>

        {/* Backend */}
        <div className="flex flex-col items-center z-10 relative">
          <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center shadow-lg mb-2">
            <Server className="text-white w-8 h-8" />
          </div>
          <span className="text-sm font-bold text-gray-700">App Server</span>
          <span className="text-xs text-gray-500">192.168.1.50</span>
        </div>

        {/* Action Button */}
        <button 
          onClick={simulateRequest}
          disabled={requestState !== 'idle'}
          className={`absolute bottom-6 left-1/2 -translate-x-1/2 px-8 py-2.5 rounded-full font-semibold shadow-lg transition-all transform ${
            requestState === 'idle' 
              ? 'bg-blue-600 text-white hover:bg-blue-500 hover:scale-105 active:scale-95' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed scale-100'
          }`}
        >
          {requestState === 'idle' ? 'Send Request' : 'Processing...'}
        </button>

      </div>
    </div>
  );
};

export default ReverseProxyDemo;