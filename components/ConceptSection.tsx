import React, { useRef, useEffect, useState } from 'react';

interface ConceptSectionProps {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  children: React.ReactNode;
  isDark?: boolean;
}

const ConceptSection: React.FC<ConceptSectionProps> = ({ 
  id, 
  title, 
  subtitle, 
  description, 
  children, 
  isDark = true 
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      id={id} 
      ref={sectionRef}
      className={`py-32 overflow-hidden transition-colors duration-700 ${
        isDark ? 'bg-black text-white' : 'bg-[#f5f5f7] text-black'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className={`mb-16 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h3 className="text-xl md:text-2xl font-semibold mb-2 opacity-60">
            {subtitle}
          </h3>
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
            {title}
          </h2>
          <p className={`text-lg md:text-xl max-w-2xl leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {description}
          </p>
        </div>

        <div className={`transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
          {children}
        </div>
      </div>
    </section>
  );
};

export default ConceptSection;