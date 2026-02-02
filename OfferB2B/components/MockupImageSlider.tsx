import React, { useState, useEffect, useRef } from 'react';

const MockupImageSlider: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const images = [
    "https://pbyfajvltehsuugpayej.supabase.co/storage/v1/object/public/MainApp/BirthdayApp/MockupChlopiec.webp",
    "https://pbyfajvltehsuugpayej.supabase.co/storage/v1/object/public/MainApp/BirthdayApp/MockupDziewczynka.webp"
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    // Zmieniono układ na grid, usunięto logikę slidera, zmniejszono marginesy
    <div ref={containerRef} className="max-w-4xl mx-auto mb-2 relative group w-full">
      <div className={`grid grid-cols-2 gap-4 md:gap-8 transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {images.map((img, idx) => (
          <div
            key={idx}
            // Zmiana aspect-[4/3] na aspect-[16/9]
            className="relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] shadow-xl border-[4px] border-white aspect-[16/9] bg-slate-100 hover:scale-[1.02] transition-transform duration-300"
          >
            <img src={img} alt={`Mockup ${idx}`} className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 to-transparent"></div>
          </div>
        ))}
      </div>
      
      {/* Tła ozdobne */}
      <div className="absolute -z-10 -top-4 -right-4 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute -z-10 -bottom-4 -left-4 w-32 h-32 bg-slate-200 rounded-full blur-3xl opacity-50"></div>
    </div>
  );
};

export default MockupImageSlider;