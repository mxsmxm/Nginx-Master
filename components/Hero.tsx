import React from 'react';
import { ArrowDown } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <div className="relative h-screen flex flex-col items-center justify-center overflow-hidden bg-black text-white">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="z-10 text-center px-4 max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
          Nginx Masterclass
        </h1>
        <p className="text-xl md:text-3xl font-medium text-gray-400 mb-10 tracking-tight max-w-2xl mx-auto">
          高性能 Web 服务器的终极指南。<br/>
          <span className="text-white">简单。强大。无处不在。</span>
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={() => {
              document.getElementById('intro')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-white text-black hover:bg-gray-100 px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105"
          >
            开始学习
          </button>
          <div className="text-sm text-gray-500 font-mono">ver 1.25.x stable</div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <ArrowDown className="text-gray-500 w-6 h-6" />
      </div>
    </div>
  );
};

export default Hero;