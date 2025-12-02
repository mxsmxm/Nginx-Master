import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-950 border-t border-stone-900 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-stone-500 text-sm">
        <div className="mb-4 md:mb-0">
          <p>&copy; {new Date().getFullYear()} Nginx Educational Demo. Crafted with React & Tailwind.</p>
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Documentation</a>
          <a href="#" className="hover:text-white transition-colors">Download Nginx</a>
          <a href="#" className="hover:text-white transition-colors">Community</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;