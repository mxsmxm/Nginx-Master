import React from 'react';

interface NavbarProps {
  activeSection: string;
}

const Navbar: React.FC<NavbarProps> = ({ activeSection }) => {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop,
        behavior: 'smooth'
      });
    }
  };

  const navItems = [
    { id: 'intro', label: 'Intro' },
    { id: 'architecture', label: 'Arch' },
    { id: 'static', label: 'Static' },
    { id: 'proxy', label: 'Proxy' },
    { id: 'multiapp', label: 'MultiApp' },
    { id: 'loadbalance', label: 'Balancing' },
    { id: 'cache', label: 'Cache' },
    { id: 'security', label: 'Security' },
    { id: 'ops', label: 'Ops' },
    { id: 'config', label: 'Config' },
    { id: 'tutorial', label: 'Tutorial' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav border-b border-white/10 h-14 flex items-center transition-all duration-300">
      <div className="max-w-7xl mx-auto w-full px-6 flex justify-between items-center">
        <div 
          onClick={() => scrollTo('hero')}
          className="font-bold text-lg tracking-wider cursor-pointer flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-5 h-5 bg-green-500 rounded-sm flex items-center justify-center">
            <span className="text-black text-xs font-bold">N</span>
          </div>
          <span>NGINX Pro</span>
        </div>

        <div className="hidden md:flex space-x-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                activeSection === item.id 
                  ? 'bg-white text-black' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        
        <button 
          onClick={() => window.open('https://nginx.org/en/docs/', '_blank')}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-colors"
        >
          Docs
        </button>
      </div>
    </nav>
  );
};

export default Navbar;