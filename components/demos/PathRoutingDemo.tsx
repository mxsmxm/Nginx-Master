import React, { useState } from 'react';
import { Globe, ArrowDown, Info, FileCode, Terminal, Container, Folder, File, HardDrive, Network, Server, Layers, Box, Cpu, Code } from 'lucide-react';
import CodeBlock from '../CodeBlock';

type Strategy = 'proxy' | 'static';
type Topology = 'host' | 'docker';

const PathRoutingDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'visualizer' | 'vue' | 'nuxt'>('visualizer');
  const [strategy, setStrategy] = useState<Strategy>('proxy');
  const [topology, setTopology] = useState<Topology>('docker');
  const [activePath, setActivePath] = useState<string>('/');
  const [activeBackend, setActiveBackend] = useState<number | null>(null);

  // --- Logic Helpers ---
  const getActiveLocation = () => {
    if (activePath.startsWith('/app1')) return 'app1';
    if (activePath.startsWith('/app2')) return 'app2';
    return 'root';
  };

  // --- Dynamic Code Generation ---
  const getNginxCode = () => {
    // 1. Static Hosting Strategy
    if (strategy === 'static') {
      return `server {
    listen 80;
    server_name my-web.com;
    
    # 统一根目录
    root /var/www/html;

    # 1. 主应用 (Root)
    location / {
        # 尝试寻找文件 -> 寻找目录 -> 返回 index.html (SPA)
        try_files $uri $uri/ /index.html;
    }

    # 2. Vue 应用 (Sub-directory)
    # 物理路径: /var/www/html/app1/
    location /app1 {
        # 关键！解决刷新 404 问题
        # 如果 URL 是 /app1/about，Nginx 找不到文件，就会返回 /app1/index.html
        try_files $uri $uri/ /app1/index.html;
    }

    # 3. Nuxt (SSG) 应用
    location /app2 {
        try_files $uri $uri/ /app2/index.html;
    }
}`;
    }

    // 2. Reverse Proxy Strategy
    const isDocker = topology === 'docker';
    return `server {
    listen 80;
    server_name my-web.com;

    # 1. 主应用 (Port 3000)
    location / {
        proxy_pass http://${isDocker ? 'main_app:80' : '127.0.0.1:3000'};
    }

    # 2. Vue 应用 (Port 4001)
    location /app1/ {
        # 注意末尾的斜杠 / (Strip Prefix)
        proxy_pass http://${isDocker ? 'vue_app:80' : '127.0.0.1:4001'}/;
    }

    # 3. Nuxt 应用 (Port 4002)
    location /app2/ {
        proxy_pass http://${isDocker ? 'nuxt_app:3000' : '127.0.0.1:4002'}/;
    }
}`;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* --- Top Controls --- */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-stone-900 p-4 rounded-2xl border border-stone-800">
        
        {/* Tab Switcher */}
        <div className="flex p-1 bg-black rounded-xl border border-stone-800">
          <button
            onClick={() => setActiveTab('visualizer')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'visualizer' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Globe size={16} /> 路由模拟
          </button>
          <button
            onClick={() => setActiveTab('vue')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'vue' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Code size={16} /> Vue 配置
          </button>
          <button
            onClick={() => setActiveTab('nuxt')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'nuxt' ? 'bg-teal-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Box size={16} /> Nuxt 配置
          </button>
        </div>

        {/* Strategy Switcher */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
            
            <div className="flex items-center gap-2 bg-black px-3 py-1.5 rounded-xl border border-stone-800">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Strategy:</span>
                <div className="flex gap-1">
                    <button 
                       onClick={() => setStrategy('proxy')}
                       className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${strategy === 'proxy' ? 'bg-purple-900/50 text-purple-200 border border-purple-500/50' : 'text-gray-500 hover:bg-stone-800'}`}
                    >
                        <Network size={14} /> Reverse Proxy
                    </button>
                    <button 
                       onClick={() => setStrategy('static')}
                       className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${strategy === 'static' ? 'bg-orange-900/50 text-orange-200 border border-orange-500/50' : 'text-gray-500 hover:bg-stone-800'}`}
                    >
                        <HardDrive size={14} /> Static Hosting
                    </button>
                </div>
            </div>

            {strategy === 'proxy' && (
                <div className="flex items-center gap-2 bg-black px-3 py-1.5 rounded-xl border border-stone-800 animate-in fade-in slide-in-from-left-2">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Topology:</span>
                    <div className="flex gap-1">
                        <button 
                        onClick={() => setTopology('docker')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${topology === 'docker' ? 'bg-blue-900/50 text-blue-200 border border-blue-500/50' : 'text-gray-500 hover:bg-stone-800'}`}
                        >
                            <Container size={14} /> Docker
                        </button>
                        <button 
                        onClick={() => setTopology('host')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${topology === 'host' ? 'bg-stone-700 text-white border border-stone-500' : 'text-gray-500 hover:bg-stone-800'}`}
                        >
                            <Terminal size={14} /> Host
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* === VISUALIZER TAB === */}
      {activeTab === 'visualizer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
          
          {/* Left: Code (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-stone-950 rounded-2xl p-4 border border-stone-800 shadow-xl relative overflow-hidden">
               <div className="flex items-center gap-2 mb-2 text-gray-500 text-xs font-mono">
                 <FileCode size={14} /> /etc/nginx/conf.d/default.conf
               </div>
               <CodeBlock code={getNginxCode()} />
            </div>

            {/* Explanation Box */}
            <div className="bg-stone-900/50 p-6 rounded-2xl border border-stone-800">
               {strategy === 'proxy' ? (
                   <>
                    <h4 className="text-purple-400 font-bold text-sm mb-2 flex items-center gap-2"><Network size={16}/> 反向代理模式 (Reverse Proxy)</h4>
                    <p className="text-xs text-gray-400 leading-relaxed mb-2">
                        这是微服务和容器化部署的标准做法。Nginx 不直接读取文件，而是把请求转发给后端的 <strong>Web 服务进程</strong> (如 Node.js, Python, 或另一个 Nginx)。
                    </p>
                    <div className="text-xs text-gray-500 border-l-2 border-purple-500 pl-2 mt-2">
                        后端服务必须自己监听端口 (如 3000, 4001)。
                    </div>
                   </>
               ) : (
                   <>
                    <h4 className="text-orange-400 font-bold text-sm mb-2 flex items-center gap-2"><HardDrive size={16}/> 静态托管模式 (Static Hosting)</h4>
                    <p className="text-xs text-gray-400 leading-relaxed mb-2">
                        Nginx 直接读取硬盘上的文件。这是部署 Vue/React 构建产物最简单、性能最高的方式。
                    </p>
                    <div className="text-xs text-gray-500 border-l-2 border-orange-500 pl-2 mt-2">
                        不需要启动 Node.js 或其他服务。只需要把 <code>dist</code> 文件夹丢到服务器上。
                    </div>
                   </>
               )}
            </div>
          </div>

          {/* Right: Visualizer (7 Cols) */}
          <div className="lg:col-span-7 bg-stone-100 rounded-3xl p-6 border border-stone-300 relative flex flex-col items-center min-h-[500px]">
            
            {/* 1. Browser Bar */}
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg border border-gray-200 mb-8 z-20">
              <div className="bg-gray-100 px-3 py-2 border-b flex gap-1.5">
                 <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                 <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                 <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
              </div>
              <div className="p-2 flex items-center gap-2">
                 <div className="flex-1 bg-gray-50 rounded px-2 py-1 text-sm font-mono text-gray-600 flex overflow-hidden">
                    <span className="text-gray-400">https://</span>
                    <span className="text-black font-semibold">my-web.com</span>
                    <span className="text-blue-600 font-bold">{activePath}</span>
                 </div>
              </div>
              <div className="flex justify-center gap-2 pb-3">
                 <button onClick={() => { setActivePath('/'); setActiveBackend(0); }} className={`px-3 py-1 rounded text-xs border ${activePath === '/' ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-white border-gray-300 text-gray-600'}`}>Home</button>
                 <button onClick={() => { setActivePath('/app1/dash'); setActiveBackend(1); }} className={`px-3 py-1 rounded text-xs border ${activePath.includes('app1') ? 'bg-green-100 border-green-500 text-green-700' : 'bg-white border-gray-300 text-gray-600'}`}>/app1</button>
                 <button onClick={() => { setActivePath('/app2/user'); setActiveBackend(2); }} className={`px-3 py-1 rounded text-xs border ${activePath.includes('app2') ? 'bg-teal-100 border-teal-500 text-teal-700' : 'bg-white border-gray-300 text-gray-600'}`}>/app2</button>
              </div>
            </div>

            {/* 2. Nginx Node */}
            <div className="relative z-10 w-40 p-3 bg-black rounded-xl border-4 border-stone-800 shadow-2xl flex flex-col items-center text-center mb-12 group">
               <span className="font-bold text-white text-base">Nginx</span>
               <div className="absolute -right-12 top-0 bg-stone-800 text-white text-[10px] px-2 py-1 rounded">Port 80</div>
               <ArrowDown className="text-gray-400 mt-2" />
            </div>

            {/* 3. Backends / File System */}
            {strategy === 'proxy' ? (
                // --- PROXY VIEW ---
                <div className="grid grid-cols-3 gap-4 w-full px-2">
                    <ProxyNode 
                        id={0} title="Main App" port={3000} type="static" topology={topology}
                        isActive={getActiveLocation() === 'root'} onClick={() => setActiveBackend(0)}
                    />
                    <ProxyNode 
                        id={1} title="Vue App" port={4001} type="static" topology={topology}
                        isActive={getActiveLocation() === 'app1'} onClick={() => setActiveBackend(1)}
                    />
                    <ProxyNode 
                        id={2} title="Nuxt SSR" port={4002} type="node" topology={topology}
                        isActive={getActiveLocation() === 'app2'} onClick={() => setActiveBackend(2)}
                    />
                </div>
            ) : (
                // --- STATIC FILE SYSTEM VIEW ---
                <div className="w-full max-w-lg bg-white rounded-xl border border-gray-300 shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
                    <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 flex items-center gap-2">
                        <HardDrive size={14} className="text-gray-500"/>
                        <span className="text-xs font-bold text-gray-600">Server File System</span>
                    </div>
                    <div className="p-4 font-mono text-sm space-y-1">
                        {/* Root */}
                        <div className={`flex items-center gap-2 p-1 rounded ${getActiveLocation() === 'root' ? 'bg-blue-100 text-blue-700 font-bold' : 'text-gray-600'}`}>
                            <Folder size={16} className="text-blue-400 fill-blue-400"/>
                            <span>/var/www/html/</span>
                        </div>
                        
                        {/* Level 1 Files */}
                        <div className="pl-6 border-l border-gray-200 ml-2 space-y-1">
                            <div className={`flex items-center gap-2 ${getActiveLocation() === 'root' ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                                <File size={14}/> index.html <span className="text-[10px] opacity-50">(Main App)</span>
                            </div>

                            {/* App 1 Folder */}
                            <div className={`flex items-center gap-2 mt-2 p-1 rounded ${getActiveLocation() === 'app1' ? 'bg-green-100 text-green-700 font-bold' : 'text-gray-600'}`}>
                                <Folder size={16} className="text-yellow-400 fill-yellow-400"/>
                                <span>app1/</span>
                            </div>
                            <div className="pl-6 border-l border-gray-200 ml-2 space-y-1">
                                <div className={`flex items-center gap-2 ${getActiveLocation() === 'app1' ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                                    <File size={14}/> index.html <span className="text-[10px] opacity-50">(Vue App)</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                    <File size={14}/> assets/...
                                </div>
                            </div>

                             {/* App 2 Folder */}
                             <div className={`flex items-center gap-2 mt-2 p-1 rounded ${getActiveLocation() === 'app2' ? 'bg-teal-100 text-teal-700 font-bold' : 'text-gray-600'}`}>
                                <Folder size={16} className="text-yellow-400 fill-yellow-400"/>
                                <span>app2/</span>
                            </div>
                            <div className="pl-6 border-l border-gray-200 ml-2 space-y-1">
                                <div className={`flex items-center gap-2 ${getActiveLocation() === 'app2' ? 'text-teal-600 font-bold' : 'text-gray-400'}`}>
                                    <File size={14}/> index.html <span className="text-[10px] opacity-50">(Nuxt SSG)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Strategy Info Badge */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur rounded-full border border-gray-200 shadow-sm text-xs font-mono text-gray-600">
               {strategy === 'proxy' ? <Network size={14} className="text-purple-500"/> : <HardDrive size={14} className="text-orange-500"/>}
               Mode: {strategy === 'proxy' ? 'Reverse Proxy' : 'Static Hosting'}
            </div>

          </div>
        </div>
      )}

      {/* === CONFIG TABS === */}
      {activeTab === 'vue' && <VueConfigTab />}
      {activeTab === 'nuxt' && <NuxtConfigTab />}

    </div>
  );
};

// --- Sub-components ---

const ProxyNode: React.FC<{
    id: number; title: string; port: number; type: 'static' | 'node'; topology: Topology; isActive: boolean; onClick: () => void;
}> = ({ title, port, type, topology, isActive, onClick }) => {
    const isDocker = topology === 'docker';
    return (
        <div 
          onClick={onClick}
          className={`
            relative p-4 rounded-xl border-2 transition-all duration-500 flex flex-col items-center gap-2 cursor-pointer group
            ${isActive 
               ? 'bg-white border-purple-500 shadow-[0_10px_30px_rgba(168,85,247,0.3)] scale-105 z-10' 
               : 'bg-gray-50 border-gray-200 opacity-60 hover:opacity-80 hover:scale-100'}
          `}
        >
          <div className={`
             w-12 h-12 rounded-lg flex items-center justify-center shadow-inner transition-colors
             ${isActive ? (type === 'node' ? 'bg-teal-100 text-teal-600' : 'bg-orange-100 text-orange-600') : 'bg-gray-200 text-gray-400'}
          `}>
             {isDocker ? <Container size={24} /> : (type === 'node' ? <Cpu size={24} /> : <Layers size={24} />)}
          </div>
    
          <div className="text-center">
            <div className="text-xs font-bold text-gray-800">{title}</div>
            <div className="text-[10px] text-gray-500 font-mono mt-0.5">
               {isDocker ? `Container: ${title.toLowerCase().replace(' ', '_')}` : `PID: ${1000 + port}`}
            </div>
            <div className="text-[10px] text-gray-400 font-mono">
               Port: {port}
            </div>
          </div>
        </div>
      );
}

const VueConfigTab = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
      <div className="bg-stone-900 p-6 rounded-3xl border border-stone-800">
        <h4 className="text-green-400 font-bold text-lg mb-4 flex items-center gap-2">
          <FileCode size={20}/> Vue 3 (Vite) 配置
        </h4>
        <CodeBlock code={`// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  // 核心：设置基础路径
  // 这样构建出的 HTML 引用资源会带上 /app1/ 前缀
  base: '/app1/', 
})`} />
         <div className="mt-4 border-t border-stone-800 pt-4">
             <CodeBlock code={`// router/index.ts
const router = createRouter({
  // 告诉路由系统它运行在子路径下
  history: createWebHistory('/app1/'),
  routes: [...]
})`} />
         </div>
      </div>
      
      <div className="bg-green-900/10 border border-green-500/20 p-8 rounded-3xl flex flex-col justify-center text-sm text-gray-300 space-y-4">
         <h5 className="text-green-400 font-bold text-lg mb-2">部署检查清单</h5>
         <ul className="list-disc list-inside space-y-3">
            <li>
               <strong>Base URL:</strong> 必须配置为 <code>/app1/</code>，否则 CSS/JS 路径会变成 404。
            </li>
            <li>
               <strong>Router History:</strong> 必须配置 <code>createWebHistory('/app1/')</code>。
            </li>
            <li>
               <strong>Nginx try_files:</strong> 必须包含 <code>/app1/index.html</code>，否则刷新页面会 404。
            </li>
         </ul>
      </div>
  </div>
);

const NuxtConfigTab = () => (
   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
      <div className="bg-stone-900 p-6 rounded-3xl border border-stone-800">
        <h4 className="text-teal-400 font-bold text-lg mb-4 flex items-center gap-2">
          <Box size={20}/> Nuxt 3 配置
        </h4>
        <CodeBlock code={`// nuxt.config.ts
export default defineNuxtConfig({
  app: {
    // 全局基础 URL
    baseURL: '/app2/'
  },
  // Static Hosting (SSG)
  ssr: false, 
  // OR Server Hosting (SSR)
  nitro: {
    port: 4002
  }
})`} />
      </div>
      
      <div className="bg-teal-900/10 border border-teal-500/20 p-8 rounded-3xl flex flex-col justify-center text-sm text-gray-300 space-y-4">
         <h5 className="text-teal-400 font-bold text-lg mb-2">部署模式区别</h5>
         <div className="space-y-4">
            <div>
                <strong className="text-orange-400 block mb-1">Static Hosting (generate)</strong>
                <p>生成纯 HTML 文件。直接丢到 <code>/var/www/html/app2</code> 即可。</p>
            </div>
            <div>
                <strong className="text-purple-400 block mb-1">Server Hosting (build)</strong>
                <p>生成 Node.js 应用。需要启动进程并使用 <code>proxy_pass</code>。</p>
            </div>
         </div>
      </div>
  </div>
);

export default PathRoutingDemo;