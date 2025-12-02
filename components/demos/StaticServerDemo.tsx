import React, { useState } from 'react';
import { FileCode, Globe, Folder, File, Image } from 'lucide-react';
import CodeBlock from '../CodeBlock';

const StaticServerDemo: React.FC = () => {
  const [activeFile, setActiveFile] = useState<string>('index.html');
  const [urlPath, setUrlPath] = useState<string>('/');

  const fileSystem = {
    '/var/www/html': {
      'index.html': '<h1 class="text-3xl font-bold text-blue-600">Hello Nginx!</h1><p class="mt-4 text-gray-600">Served from Ubuntu.</p>',
      'about.html': '<h1 class="text-3xl font-bold text-purple-600">About Us</h1><p class="mt-4 text-gray-600">We love high performance.</p>',
      'style.css': 'body { background: #f0f0f0; }',
      'logo.png': '[Image Data]'
    }
  };

  const getBrowserContent = () => {
    if (urlPath === '/' || urlPath === '/index.html') return fileSystem['/var/www/html']['index.html'];
    if (urlPath === '/about' || urlPath === '/about.html') return fileSystem['/var/www/html']['about.html'];
    return '<div class="text-red-500 font-bold text-2xl">404 Not Found</div><div class="text-sm text-gray-400 mt-2">nginx/1.18.0 (Ubuntu)</div>';
  };

  const code = `server {
    listen       80;
    server_name  localhost;

    # Ubuntu 默认静态资源目录
    location / {
        root   /var/www/html;
        index  index.html index.htm;
    }

    # 自定义错误页
    error_page   500 502 503 504  /50x.html;
}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* Configuration & Files */}
      <div className="space-y-6">
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-2xl code-glow">
          <div className="flex items-center gap-2 mb-4 text-gray-400 text-sm font-mono">
            <FileCode size={16} />
            <span>/etc/nginx/sites-available/default</span>
          </div>
          <CodeBlock code={code} />
        </div>

        <div className="bg-stone-900/50 rounded-2xl p-6 border border-stone-800">
          <h4 className="text-gray-400 text-sm font-semibold mb-4 uppercase tracking-wider flex items-center gap-2">
            <Folder size={16} /> Server File System (Ubuntu)
          </h4>
          <div className="space-y-2">
            <div className="pl-4 border-l border-gray-700 space-y-2">
              <div className="flex items-center gap-2 text-blue-400 text-sm font-mono">
                <Folder size={14} /> /var/www/html/
              </div>
              {Object.keys(fileSystem['/var/www/html']).map(file => (
                <div key={file} className="pl-6 flex items-center gap-2 text-gray-300 text-sm font-mono opacity-80 hover:opacity-100 transition-opacity">
                   {file.endsWith('.png') ? <Image size={14} className="text-yellow-500"/> : <File size={14} className="text-gray-500"/>}
                   {file}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Browser Simulation */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-200 h-full min-h-[400px] flex flex-col">
        {/* Browser Chrome */}
        <div className="bg-gray-100 border-b border-gray-200 p-3 flex items-center gap-4">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="flex-1 bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 flex items-center gap-2 shadow-sm">
            <Globe size={14} className="text-gray-400"/>
            <span className="text-gray-400">http://localhost</span>
            <input 
              type="text" 
              value={urlPath}
              onChange={(e) => setUrlPath(e.target.value)}
              className="flex-1 outline-none text-black"
              placeholder="/"
            />
          </div>
        </div>

        {/* Browser Viewport */}
        <div className="flex-1 p-8 bg-white flex flex-col justify-center items-center text-center relative">
          <div dangerouslySetInnerHTML={{ __html: getBrowserContent() }} />
        </div>

        <div className="bg-gray-50 p-4 border-t border-gray-200">
            <div className="flex gap-2 justify-center">
                <button onClick={() => setUrlPath('/')} className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200">/ (Home)</button>
                <button onClick={() => setUrlPath('/about')} className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200">/about</button>
                <button onClick={() => setUrlPath('/missing')} className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200">/missing</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StaticServerDemo;