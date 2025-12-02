import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Play, RefreshCw, Check, Info } from 'lucide-react';
import CodeBlock from '../CodeBlock';

const InteractiveTutorial: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Global Context (Ubuntu)",
      description: "On Ubuntu, Nginx runs as the 'www-data' user. The 'events' block determines connection handling.",
      explanation: "'worker_processes auto' tells Nginx to use all available CPU cores. 'worker_connections' sets max connections per worker.",
      code: `user www-data;
worker_processes auto;
pid /run/nginx.pid;

events {
    worker_connections  768;
}`
    },
    {
      title: "The HTTP Context",
      description: "The 'http' block is where all web-related configuration lives. It wraps all server and location blocks.",
      explanation: "'include mime.types' ensures correct Content-Types. 'sendfile on' optimizes file transfer speed.",
      code: `user www-data;
worker_processes auto;
pid /run/nginx.pid;

events {
    worker_connections  768;
}

http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile        on;
    keepalive_timeout  65;
}`
    },
    {
      title: "Define a Virtual Server",
      description: "A 'server' block defines a virtual host. You can run multiple websites on the same Nginx instance.",
      explanation: "We tell Nginx to 'listen' on port 80 (standard HTTP) and respond to requests for 'localhost'.",
      code: `...
http {
    ...
    server {
        listen       80;
        server_name  localhost;
    }
}`
    },
    {
      title: "Handling Requests (Location)",
      description: "The 'location' block matches specific URL patterns. On Ubuntu, the default web root is /var/www/html.",
      explanation: "'root' defines where files are stored. When you visit '/', Nginx looks in '/var/www/html'.",
      code: `...
    server {
        listen       80;
        server_name  localhost;

        location / {
            root   /var/www/html;
            index  index.html index.htm;
        }
    }
}`
    },
    {
      title: "Custom Error Pages",
      description: "It's good practice to provide friendly error pages instead of generic browser errors.",
      explanation: "If a 500-level error occurs, Nginx will serve the content of '/50x.html'.",
      code: `...
    server {
        listen       80;
        server_name  localhost;

        location / {
            root   /var/www/html;
            index  index.html index.htm;
        }

        error_page   500 502 503 504  /50x.html;
    }
}`
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl bg-stone-950">
      
      {/* Left Panel: Guide & Controls */}
      <div className="p-8 md:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-stone-800 bg-stone-900/50 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm">
              {currentStep + 1}
            </span>
            <span className="text-gray-500 uppercase tracking-widest text-xs font-semibold">Step {currentStep + 1} of {steps.length}</span>
          </div>
          
          <h3 className="text-3xl font-bold text-white mb-6 tracking-tight">
            {steps[currentStep].title}
          </h3>
          
          <p className="text-lg text-gray-300 mb-8 leading-relaxed">
            {steps[currentStep].description}
          </p>

          <div className="bg-blue-900/20 border border-blue-500/30 p-6 rounded-xl mb-8">
            <div className="flex items-start gap-3">
              <Info className="text-blue-400 shrink-0 mt-1" size={20} />
              <p className="text-blue-100 text-sm leading-relaxed">
                {steps[currentStep].explanation}
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-auto">
          <button 
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`p-3 rounded-full transition-all ${currentStep === 0 ? 'text-gray-600 cursor-not-allowed' : 'bg-stone-800 text-white hover:bg-stone-700'}`}
          >
            <ChevronLeft size={24} />
          </button>

          <div className="flex-1 h-2 bg-stone-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          {currentStep === steps.length - 1 ? (
             <button 
               onClick={handleReset}
               className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-full font-semibold transition-all hover:scale-105"
             >
               <RefreshCw size={20} />
               Start Over
             </button>
          ) : (
            <button 
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-white text-black hover:bg-gray-200 rounded-full font-semibold transition-all hover:scale-105"
            >
              <span>Next Step</span>
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Right Panel: Code Preview */}
      <div className="bg-black p-8 md:p-12 overflow-y-auto max-h-[600px] flex flex-col relative">
        <div className="absolute top-4 right-4 px-3 py-1 bg-stone-800 rounded text-xs text-gray-400 font-mono">
          /etc/nginx/sites-available/default
        </div>
        <div className="animate-in fade-in duration-500">
           <CodeBlock code={steps[currentStep].code} />
        </div>
        
        {/* Success Indicator on final step */}
        {currentStep === steps.length - 1 && (
          <div className="mt-8 p-4 bg-green-900/20 border border-green-500/50 rounded-xl flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-700">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shrink-0">
              <Check className="text-black" size={24} />
            </div>
            <div>
              <h5 className="font-bold text-green-400">Configuration Complete!</h5>
              <p className="text-sm text-green-200/70">You can now test it with: <code>nginx -t</code></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveTutorial;