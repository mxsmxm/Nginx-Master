import React from 'react';

interface CodeBlockProps {
  code: string;
}

// Simple regex-based syntax highlighter for Nginx config
const highlightNginx = (code: string) => {
  const lines = code.split('\n');
  return lines.map((line, i) => {
    // Comments
    if (line.trim().startsWith('#')) {
      return <div key={i} className="text-gray-500 italic">{line}</div>;
    }

    // Directives
    let content = line;
    
    // Highlight Keywords
    const keywords = ['server', 'http', 'events', 'location', 'upstream', 'include', 'user'];
    keywords.forEach(kw => {
        content = content.replace(new RegExp(`\\b${kw}\\b`, 'g'), `<span class="text-pink-400 font-bold">${kw}</span>`);
    });

    // Highlight Variables
    content = content.replace(/(\$[\w_]+)/g, '<span class="text-yellow-300">$1</span>');

    // Highlight Values (IPs, Paths)
    content = content.replace(/(\s\/[\w\/.]+)/g, '<span class="text-green-300">$1</span>'); // Paths
    content = content.replace(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/g, '<span class="text-blue-300">$1</span>'); // IPs
    content = content.replace(/(https?:\/\/[^\s;]+)/g, '<span class="text-cyan-300">$1</span>'); // URLs
    
    // Highlight Numbers (Ports, Status Codes, etc.) - Make sure this doesn't break IPs
    // We use a lookbehind/lookahead or boundary to avoid matching inside IPs roughly, 
    // but for simple Nginx config, matching \b\d+\b after IPs are done is usually safe enough 
    // if we are careful. Since we replaced IPs with spans already, we need to be careful not to match numbers inside HTML tags.
    // A safer way in this simple regex engine is to match numbers that are NOT inside a tag.
    // However, simplest here is to match strictly standalone numbers that appear to be ports/integers.
    content = content.replace(/\b(\d+)\b(?![^<]*>)/g, '<span class="text-orange-400 font-bold">$1</span>');

    // Highlight important secondary keywords
    const secondaryKeywords = ['listen', 'server_name', 'root', 'index', 'proxy_pass', 'proxy_set_header', 'error_page', 'worker_processes', 'worker_connections', 'ip_hash', 'weight', 'deny', 'allow', 'default_type', 'sendfile', 'keepalive_timeout'];
    secondaryKeywords.forEach(kw => {
        content = content.replace(new RegExp(`\\b${kw}\\b`, 'g'), `<span class="text-blue-400">${kw}</span>`);
    });

    return <div key={i} dangerouslySetInnerHTML={{ __html: content || '&nbsp;' }} />;
  });
};

const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
  return (
    <div className="font-mono text-sm leading-6 overflow-x-auto whitespace-pre text-gray-200">
      {highlightNginx(code)}
    </div>
  );
};

export default CodeBlock;