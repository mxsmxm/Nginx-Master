import React, { useState, useEffect } from 'react';
import { Activity, Terminal, LayoutDashboard, BarChart3, Shield, Box, FileCog } from 'lucide-react';

const MonitoringDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'management'>('management');
  
  // Simulation State for Metrics
  const [metrics, setMetrics] = useState({
    active: 1,
    accepts: 1050,
    handled: 1050,
    requests: 2400,
    reading: 0,
    writing: 1,
    waiting: 0
  });

  const [history, setHistory] = useState<number[]>(new Array(20).fill(50));

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => {
        const newReqs = Math.floor(Math.random() * 10);
        return {
          active: 1 + Math.floor(Math.random() * 5),
          accepts: prev.accepts + 1,
          handled: prev.handled + 1,
          requests: prev.requests + newReqs,
          reading: 0,
          writing: 1 + Math.floor(Math.random() * 2),
          waiting: Math.floor(Math.random() * 3)
        };
      });

      setHistory(prev => {
        const newVal = 30 + Math.floor(Math.random() * 60);
        return [...prev.slice(1), newVal];
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-8">
      {/* Toggle Controls */}
      <div className="flex justify-center">
        <div className="bg-stone-900 p-1 rounded-xl border border-stone-800 inline-flex">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'metrics' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Activity size={16} /> 实时监控 (Stub Status)
          </button>
          <button
            onClick={() => setActiveTab('management')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'management' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            <LayoutDashboard size={16} /> 管理面板方案 (UI)
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-stone-950 rounded-3xl border border-stone-800 overflow-hidden min-h-[450px]">
        
        {/* === METRICS TAB === */}
        {activeTab === 'metrics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
            {/* Left: Raw Stub Status */}
            <div className="p-8 border-b lg:border-b-0 lg:border-r border-stone-800 flex flex-col">
              <div className="flex items-center gap-2 mb-4 text-gray-400">
                <Terminal size={18} />
                <span className="font-mono text-sm">curl http://localhost/nginx_status</span>
              </div>
              <div className="flex-1 bg-black rounded-xl p-6 font-mono text-green-400 text-sm leading-loose shadow-inner overflow-hidden relative">
                <div className="absolute top-0 right-0 p-2">
                   <span className="flex h-3 w-3 relative">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                   </span>
                </div>
                <p>Active connections: <span className="text-white font-bold">{metrics.active}</span></p>
                <p>server accepts handled requests</p>
                <p> <span className="text-blue-400">{metrics.accepts}</span> <span className="text-blue-400">{metrics.handled}</span> <span className="text-blue-400">{metrics.requests}</span></p>
                <p>Reading: {metrics.reading} Writing: {metrics.writing} Waiting: {metrics.waiting}</p>
              </div>
              <p className="mt-4 text-xs text-gray-500">
                这是 Nginx 最基础的内置监控模块 <code>ngx_http_stub_status_module</code>。
                Prometheus 等工具就是通过抓取这个接口的数据来生成图表的。
              </p>
            </div>

            {/* Right: Modern Dashboard Viz */}
            <div className="p-8 flex flex-col bg-stone-900/30">
              <div className="flex items-center gap-2 mb-6 text-gray-400">
                <BarChart3 size={18} />
                <span className="font-sans text-sm">Grafana / Dashboard Simulation</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                 <div className="bg-stone-800 p-4 rounded-xl border border-stone-700">
                    <div className="text-xs text-gray-400 mb-1">Req / Sec</div>
                    <div className="text-2xl font-bold text-white">{Math.floor(metrics.requests / 120)}</div>
                 </div>
                 <div className="bg-stone-800 p-4 rounded-xl border border-stone-700">
                    <div className="text-xs text-gray-400 mb-1">Active Conn</div>
                    <div className="text-2xl font-bold text-blue-400">{metrics.active}</div>
                 </div>
              </div>

              <div className="flex-1 bg-stone-800 rounded-xl border border-stone-700 p-4 relative flex items-end justify-between gap-1 overflow-hidden">
                 {/* Fake Graph Bars */}
                 {history.map((h, i) => (
                    <div 
                      key={i} 
                      className="w-full bg-blue-500/50 hover:bg-blue-400 transition-all rounded-t-sm"
                      style={{ height: `${h}%` }}
                    />
                 ))}
                 <div className="absolute top-2 left-2 text-xs text-gray-500 font-bold">TRAFFIC INGRESS</div>
              </div>
            </div>
          </div>
        )}

        {/* === MANAGEMENT TAB === */}
        {activeTab === 'management' && (
          <div className="p-8 md:p-12">
            <div className="text-center mb-10">
              <h3 className="text-2xl font-bold text-white mb-2">如何管理 Nginx?</h3>
              <p className="text-gray-400">
                对于不熟悉命令行的运维人员，使用可视化面板是更安全、高效的选择。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Option 1: Native */}
              <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 opacity-60 hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                  <Terminal className="text-gray-400" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">纯命令行 (CLI)</h4>
                <ul className="text-sm text-gray-400 space-y-2 mb-4">
                  <li>• 修改 <code className="text-gray-300">vim /etc/nginx/...</code></li>
                  <li>• 手动申请 SSL 证书</li>
                  <li>• 灵活性最高</li>
                </ul>
                <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">专家向</span>
              </div>

              {/* Option 2: Nginx UI */}
              <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 hover:border-green-500/50 transition-colors">
                <div className="w-12 h-12 bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                  <FileCog className="text-green-500" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Nginx UI</h4>
                <p className="text-xs text-gray-500 mb-3">GitHub 开源项目</p>
                <ul className="text-sm text-gray-300 space-y-2 mb-6">
                  <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5"/> 轻量级 Web 管理界面</li>
                  <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5"/> 实时修改配置文件</li>
                  <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5"/> 适合已有 Nginx 的环境</li>
                </ul>
                <a href="https://github.com/0xJacky/nginx-ui" target="_blank" className="block text-center w-full py-2 border border-stone-700 rounded-lg text-sm hover:bg-white/5 transition-colors text-gray-300">
                  了解 Nginx UI
                </a>
              </div>

              {/* Option 3: 1Panel (Recommended) */}
              <div className="bg-gradient-to-b from-blue-900/20 to-stone-900 p-6 rounded-2xl border-2 border-blue-600/50 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                  推荐方案
                </div>
                
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4 shadow-lg shadow-blue-900/20">
                  <Box className="text-white" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">1Panel + OpenResty</h4>
                <p className="text-xs text-blue-300 mb-3">基于容器的现代化运维面板</p>
                
                <ul className="text-sm text-gray-200 space-y-3 mb-6">
                  <li className="flex gap-2">
                    <Shield size={16} className="text-blue-400 shrink-0" />
                    <span>自带 WAF 防火墙 (OpenResty)</span>
                  </li>
                  <li className="flex gap-2">
                    <Box size={16} className="text-blue-400 shrink-0" />
                    <span>Docker 容器化部署，环境隔离</span>
                  </li>
                  <li className="flex gap-2">
                    <LayoutDashboard size={16} className="text-blue-400 shrink-0" />
                    <span>一键 SSL、备份、建站向导</span>
                  </li>
                </ul>
                <div className="text-xs text-gray-400 mb-4 bg-black/30 p-2 rounded border border-white/5">
                   对于完全不了解 Nginx 的新手，1Panel 提供的应用商店一键部署 OpenResty 是最省心的选择。
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MonitoringDemo;
