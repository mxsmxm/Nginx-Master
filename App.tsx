import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ConceptSection from './components/ConceptSection';
import Footer from './components/Footer';
import StaticServerDemo from './components/demos/StaticServerDemo';
import ReverseProxyDemo from './components/demos/ReverseProxyDemo';
import LoadBalancerDemo from './components/demos/LoadBalancerDemo';
import CacheDemo from './components/demos/CacheDemo';
import SecurityDemo from './components/demos/SecurityDemo';
import ConfigExplainer from './components/demos/ConfigExplainer';
import ProcessArchitectureDemo from './components/demos/ProcessArchitectureDemo';
import InteractiveTutorial from './components/demos/InteractiveTutorial';
import MonitoringDemo from './components/demos/MonitoringDemo';
import PathRoutingDemo from './components/demos/PathRoutingDemo';
import { ArrowDown, CheckCircle, Server, Shield, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('hero');

  // Simple scroll spy to update active section for nav
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'intro', 'architecture', 'static', 'proxy', 'multiapp', 'loadbalance', 'cache', 'security', 'ops', 'config', 'tutorial'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && element.offsetTop <= scrollPosition && (element.offsetTop + element.offsetHeight) > scrollPosition) {
          setActiveSection(section);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500 selection:text-white">
      <Navbar activeSection={activeSection} />
      
      <main>
        <section id="hero">
          <Hero />
        </section>

        <section id="intro" className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="text-center mb-24 opacity-0 animate-fade-in-up" style={{animationFillMode: 'forwards', animationDelay: '0.2s'}}>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              为什么你需要 <span className="text-blue-500">Nginx</span>?
            </h2>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              它不仅是一个Web服务器。它是互联网的高速公路入口。
              处理高并发，负载均衡，反向代理，它无所不能。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="w-8 h-8 text-yellow-400" />}
              title="高性能"
              description="基于事件驱动的异步架构，单机轻松处理数万并发连接。"
            />
            <FeatureCard 
              icon={<Server className="w-8 h-8 text-blue-400" />}
              title="反向代理"
              description="隐藏后端真实架构，统一入口，提升安全性和灵活性。"
            />
            <FeatureCard 
              icon={<Shield className="w-8 h-8 text-green-400" />}
              title="轻量稳定"
              description="极低的内存占用（低至2.5MB），数月不重启依然稳定运行。"
            />
          </div>
        </section>

        <ConceptSection 
          id="architecture"
          title="进程架构"
          subtitle="Master & Workers."
          description="Nginx 采用 Master-Worker 多进程架构。Master 负责读取配置和管理 Worker，Worker 负责处理实际请求。这种架构允许 Nginx 在不中断服务的情况下进行热加载和平滑升级。"
          isDark={true}
        >
          <ProcessArchitectureDemo />
        </ConceptSection>

        <ConceptSection 
          id="static"
          title="静态资源服务器"
          subtitle="Simple. Fast. Reliable."
          description="Nginx 最基础的功能就是作为静态服务器。无论是 HTML、CSS 还是图片，它都能以极快的速度发送给客户端。"
          isDark={false}
        >
          <StaticServerDemo />
        </ConceptSection>

        <ConceptSection 
          id="proxy"
          title="反向代理"
          subtitle="The Ultimate Middleman."
          description="客户端并不知道实际提供服务的是谁。Nginx 接收请求，转发给内网服务器，再将结果返回。这保护了你的后端服务器。"
          isDark={true} 
        >
          <ReverseProxyDemo />
        </ConceptSection>

        <ConceptSection 
          id="multiapp"
          title="多应用部署"
          subtitle="One Domain, Many Apps."
          description="通过路径（Path）区分不同的应用。在同一个 https://dh.xipigou.com 域名下，同时托管 /app1, /app2 和默认应用。"
          isDark={true} 
        >
          <PathRoutingDemo />
        </ConceptSection>

        <ConceptSection 
          id="loadbalance"
          title="负载均衡"
          subtitle="Power in Numbers."
          description="当一台服务器撑不住时，增加服务器。Nginx 像交通指挥官，根据规则将流量智能分发到不同的服务器上。"
          isDark={false}
        >
          <LoadBalancerDemo />
        </ConceptSection>

        <ConceptSection 
          id="cache"
          title="HTTP 缓存"
          subtitle="Speed at the Edge."
          description="Nginx 可以作为内容分发网络（CDN）的本地节点。通过缓存后端响应，可以显著减少服务器负载并提高用户访问速度。"
          isDark={true}
        >
          <CacheDemo />
        </ConceptSection>

        <ConceptSection 
          id="security"
          title="网关安全"
          subtitle="The Guard at the Gate."
          description="作为入口网关，Nginx 提供了多种安全功能。你可以轻松配置 IP 黑名单、速率限制（Rate Limiting）和访问控制列表（ACL）来抵御恶意攻击。"
          isDark={false}
        >
          <SecurityDemo />
        </ConceptSection>

        <ConceptSection 
          id="ops"
          title="运维监控 & 管理"
          subtitle="Visibility & Control."
          description="如何知道 Nginx 的运行状态？如何可视化管理配置？这里展示了原生的 stub_status 监控以及推荐的现代化管理面板方案。"
          isDark={true}
        >
          <MonitoringDemo />
        </ConceptSection>

        <ConceptSection 
          id="config"
          title="配置详解"
          subtitle="Master the Syntax."
          description="nginx.conf 是核心。理解 http, server, location 块的层级关系是掌握 Nginx 的关键。"
          isDark={true}
        >
          <ConfigExplainer />
        </ConceptSection>

        <ConceptSection 
          id="tutorial"
          title="动手配置"
          subtitle="Step by Step."
          description="从零开始构建一个完整的 Nginx 配置文件。按照引导，理解每一行指令背后的含义。"
          isDark={true}
        >
          <InteractiveTutorial />
        </ConceptSection>

      </main>

      <Footer />
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="bg-stone-900/50 border border-stone-800 p-8 rounded-3xl backdrop-blur-sm hover:bg-stone-900 transition-colors duration-300">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-3 text-white">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{description}</p>
  </div>
);

export default App;