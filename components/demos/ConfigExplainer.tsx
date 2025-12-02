import React, { useState } from 'react';
import { ChevronRight, Cpu, Share2, Zap, Layers } from 'lucide-react';

const ConfigExplainer: React.FC = () => {
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);

  const blocks = [
    {
      id: 'main',
      label: 'Main Context',
      desc: '全局配置，定义进程数量(worker_processes)和用户权限。',
      color: 'border-gray-500 text-gray-700',
      bg: 'bg-gray-100'
    },
    {
      id: 'events',
      label: 'Events',
      desc: '网络连接配置，决定 Nginx 如何处理连接(worker_connections)。',
      color: 'border-purple-500 text-purple-700',
      bg: 'bg-purple-50'
    },
    {
      id: 'http',
      label: 'HTTP',
      desc: 'Web 核心模块。配置共享内存(Shared Memory)、日志、Upstream 等。',
      color: 'border-blue-500 text-blue-700',
      bg: 'bg-blue-50'
    },
    {
      id: 'server',
      label: 'Server',
      desc: '虚拟主机配置。定义监听端口(listen)和域名(server_name)。',
      color: 'border-green-500 text-green-700',
      bg: 'bg-green-50'
    },
    {
      id: 'location',
      label: 'Location',
      desc: '路由匹配规则。决定 URL 如何被处理（代理、静态文件等）。',
      color: 'border-orange-500 text-orange-700',
      bg: 'bg-orange-50'
    }
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Visual Hierarchy - Left Panel (Code) */}
      <div className="flex-1 bg-white p-8 rounded-3xl shadow-xl border border-gray-200 font-mono text-sm">
        
        {/* Main Context Block */}
        <div 
          className={`p-4 border-2 rounded-lg mb-4 transition-all duration-300 ${hoveredBlock === 'main' ? 'bg-gray-100 border-gray-500 scale-[1.02]' : 'border-gray-300 bg-white'}`}
          onMouseEnter={() => setHoveredBlock('main')}
          onMouseLeave={() => setHoveredBlock(null)}
        >
          <span className="text-gray-500 font-bold select-none"># Main Context</span>
          <div className="pl-4 mt-3 space-y-2">
            <div className="text-gray-800 font-medium">
              user <span className="text-blue-600 font-bold">www-data</span>;
            </div>
            
            {/* Interactive Worker Processes Tooltip */}
            <div className="group relative w-fit z-50">
              <div className="cursor-help border-b border-dotted border-gray-400 text-gray-800 font-medium hover:text-blue-600 hover:border-blue-600 transition-colors">
                worker_processes auto;
              </div>
              <div className="absolute left-0 top-full mt-2 w-80 bg-stone-900 text-white p-5 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-stone-700 z-[60]">
                <h5 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
                  <Cpu size={16} /> CPU & Processes
                </h5>
                <p className="text-xs text-gray-300 leading-relaxed mb-3">
                  Nginx 使用单线程、非阻塞的事件驱动架构。不像传统服务器每个请求一个线程，Nginx 一个进程就能处理成千上万的并发。
                </p>
                <div className="space-y-2 text-xs">
                   <div className="bg-black/50 p-3 rounded border border-white/10">
                      <span className="text-green-400 font-bold block mb-1">worker_processes auto;</span>
                      <p className="text-gray-400">
                        这是推荐设置。它会自动检测 CPU 核心数并启动对应数量的 Worker。
                      </p>
                      <p className="text-gray-500 mt-2 pt-2 border-t border-white/10">
                        <strong className="text-blue-300">Why?</strong> 绑定 CPU 核心 (Affinity) 可以减少上下文切换 (Context Switching) 并利用 CPU 缓存，最大化吞吐量。
                      </p>
                   </div>
                   <div className="text-gray-400 italic mt-1">
                      注意：设置为 CPU 核心数的 1 倍是最佳实践。
                   </div>
                </div>
              </div>
            </div>
            
            {/* Events Block */}
            <div 
              className={`mt-4 p-4 border-2 rounded-lg transition-all duration-300 ${hoveredBlock === 'events' ? 'bg-purple-50 border-purple-500 scale-[1.02]' : 'border-dashed border-purple-300 bg-white/50'}`}
              onMouseEnter={(e) => { e.stopPropagation(); setHoveredBlock('events'); }}
              onMouseLeave={() => setHoveredBlock('main')}
            >
              <span className="text-purple-700 font-bold">events</span> {'{'}
              <div className="pl-4 group relative w-fit z-40 my-1">
                <div className="cursor-help border-b border-dotted border-gray-400 text-gray-800 font-medium hover:text-purple-600 hover:border-purple-600 transition-colors">
                   worker_connections 1024;
                </div>
                {/* Tooltip for Connections */}
                <div className="absolute left-0 top-full mt-2 w-80 bg-stone-900 text-white p-5 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-stone-700">
                   <h5 className="font-bold text-purple-400 mb-2 flex items-center gap-2">
                      <Zap size={16} /> Concurrency Calculation
                   </h5>
                   <p className="text-xs text-gray-300 leading-relaxed mb-3">
                      每个 Worker 进程能同时处理的最大连接数。
                   </p>
                   <div className="bg-black/50 p-3 rounded border border-white/10 text-xs space-y-2 font-mono">
                      <div><span className="text-gray-400">Total Clients ≈ </span> <span className="text-blue-400">Processes</span> × <span className="text-purple-400">Connections</span></div>
                   </div>
                   <p className="text-xs text-gray-400 mt-3 border-t border-white/10 pt-2">
                      <strong className="text-white">反向代理场景:</strong> 需要除以 2 或 4 (客户端连接 + 后端连接)。<br/>
                      <strong className="text-white">系统限制:</strong> 此数值不能超过系统的 <code>ulimit -n</code> (Open Files) 限制。
                   </p>
                </div>
              </div>
              {'}'}
            </div>

            {/* HTTP Block */}
            <div 
              className={`mt-4 p-4 border-2 rounded-lg transition-all duration-300 ${hoveredBlock === 'http' || hoveredBlock === 'server' || hoveredBlock === 'location' ? 'bg-blue-50 border-blue-500 shadow-md' : 'border-dashed border-blue-300 bg-white/50'}`}
              onMouseEnter={(e) => { e.stopPropagation(); setHoveredBlock('http'); }}
              onMouseLeave={() => setHoveredBlock('main')}
            >
              <span className="text-blue-700 font-bold">http</span> {'{'}
              <div className="pl-4 mt-2 space-y-2">
                <div className="text-gray-800 font-medium">include mime.types;</div>

                {/* Shared Memory Example */}
                <div className="group relative w-fit z-30">
                     <div className="cursor-help border-b border-dotted border-gray-400 hover:text-orange-600 hover:border-orange-500 transition-colors text-gray-800 font-medium">
                        limit_req_zone $binary_remote_addr zone=<span className="text-orange-600 font-bold">one:10m</span> rate=1r/s;
                     </div>
                     {/* Tooltip for Shared Memory */}
                     <div className="absolute left-0 top-full mt-2 w-80 bg-stone-900 text-white p-5 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-stone-700">
                        <h5 className="font-bold text-orange-400 mb-2 flex items-center gap-2">
                           <Share2 size={16} /> Shared Memory Zones
                        </h5>
                        <p className="text-xs text-gray-300 leading-relaxed mb-3">
                           Nginx 的 Worker 进程是相互隔离的。为了跨进程共享数据（如限流计数器、SSL 会话、缓存索引），必须申请<strong>共享内存区</strong>。
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                           <div className="bg-stone-800 p-2 rounded">
                              <span className="text-gray-400 block mb-1">zone=one:10m</span>
                              <span className="text-white">开辟 10MB 内存空间，所有 Worker 可读写。</span>
                           </div>
                           <div className="bg-stone-800 p-2 rounded">
                              <span className="text-gray-400 block mb-1">Use Case</span>
                              <span className="text-white">限流 (Limit Req)、缓存 (Proxy Cache)。</span>
                           </div>
                        </div>
                     </div>
                </div>
                
                {/* Server Block */}
                <div 
                  className={`mt-4 p-4 border-2 rounded-lg transition-all duration-300 ${hoveredBlock === 'server' || hoveredBlock === 'location' ? 'bg-white border-green-500 scale-[1.01] shadow-sm' : 'bg-white/80 border-dashed border-green-300'}`}
                  onMouseEnter={(e) => { e.stopPropagation(); setHoveredBlock('server'); }}
                  onMouseLeave={(e) => { e.stopPropagation(); setHoveredBlock('http'); }}
                >
                  <span className="text-green-700 font-bold">server</span> {'{'}
                  <div className="pl-4 mt-2 space-y-2">
                    <div className="text-gray-800 font-medium">listen <span className="text-orange-600 font-bold">80</span>;</div>
                    
                    {/* Location Block */}
                    <div 
                      className={`mt-4 p-2 border-2 rounded-lg transition-all duration-300 ${hoveredBlock === 'location' ? 'bg-orange-50 border-orange-500 scale-[1.03] shadow-sm' : 'bg-white border-dashed border-orange-300'}`}
                      onMouseEnter={(e) => { e.stopPropagation(); setHoveredBlock('location'); }}
                      onMouseLeave={(e) => { e.stopPropagation(); setHoveredBlock('server'); }}
                    >
                      <span className="text-orange-600 font-bold">location /</span> {'{'}
                      <div className="pl-4 text-gray-800 font-medium">root /var/www/html;</div>
                      {'}'}
                    </div>
                  </div>
                  <div className="mt-2">{'}'}</div>
                </div>
              </div>
              <div className="mt-2">{'}'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Hierarchy - Right Panel (Legend) */}
      <div className="w-full md:w-1/3 flex flex-col gap-4 justify-center">
        {blocks.map((block) => (
          <div 
            key={block.id}
            onMouseEnter={() => setHoveredBlock(block.id)}
            onMouseLeave={() => setHoveredBlock(null)}
            className={`p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
              hoveredBlock === block.id 
                ? `${block.bg} ${block.color.split(' ')[0]} shadow-lg scale-105` 
                : 'bg-white border-transparent hover:border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className={`font-bold text-lg ${block.color.split(' ')[1]}`}>{block.label}</h4>
              {hoveredBlock === block.id && <ChevronRight className={block.color.split(' ')[1]} />}
            </div>
            <p className="text-gray-600 text-sm leading-relaxed font-medium">{block.desc}</p>
          </div>
        ))}
        
        {/* Additional Tip Box */}
        <div className="mt-4 p-4 bg-stone-900 rounded-xl border border-stone-800 shadow-xl">
           <div className="flex items-center gap-2 text-yellow-500 font-bold mb-2">
              <Layers size={16} />
              <span className="text-sm">架构小贴士</span>
           </div>
           <p className="text-xs text-gray-300 leading-relaxed">
              Worker 之间不直接通信。如果需要数据共享（例如在负载均衡中保持会话），必须显式配置共享内存区域 (Shared Memory Zones)。
           </p>
        </div>
      </div>
    </div>
  );
};

export default ConfigExplainer;