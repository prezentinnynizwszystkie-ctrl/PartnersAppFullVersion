import React, { useState, useEffect, useRef } from 'react';
import MockupImageSlider from './MockupImageSlider';

const Reviews: React.FC = () => {
  const [shouldLoadWidget, setShouldLoadWidget] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadWidget(true);
          observer.disconnect();
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
    // Zmniejszono paddingi górne (pt-4 md:pt-8), aby zyskać miejsce
    <section id="opinie" ref={sectionRef} className="pt-4 pb-2 md:pt-8 md:pb-4 px-6 bg-slate-50 h-full flex flex-col">
      {/* Zmiana max-w-6xl na w-[90%] max-w-screen-2xl */}
      <div className="w-[90%] max-w-screen-2xl mx-auto reveal flex-1 flex flex-col">
        {/* Zmniejszono margines dolny mb-6 */}
        <div className="text-center mb-6 space-y-2 flex-shrink-0">
          {/* Usunięto badge "Głos naszych klientów" */}
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Opinie</h2>
          <p className="text-slate-500 text-sm md:text-base max-w-3xl mx-auto font-light leading-relaxed line-clamp-2 md:line-clamp-none">
            W ostatnie Święta, ponad 4000 dzieci zostało pomocnikiem Świętego Mikołaja. Radość na ich twarzach mówi sama za siebie!
          </p>
        </div>
        
        {/* Zdjęcia obok siebie */}
        <div className="flex-shrink-0">
          <MockupImageSlider />
        </div>
        
        {/* Kontener Widgeta - flex-1 aby wypełnił resztę miejsca */}
        <div className="w-full overflow-hidden flex flex-col items-center flex-1 min-h-0 relative mt-4">
          {shouldLoadWidget && (
            // Zmiana h-full na h-[90%]
            <div className="elfsight-app-66eaab44-079a-415c-bed9-112ec79bb1b1 w-full h-[90%] overflow-y-auto no-scrollbar" data-elfsight-app-lazy></div>
          )}
          {!shouldLoadWidget && <div className="w-full h-[90%] flex items-center justify-center text-slate-300">Ładowanie opinii...</div>}
        </div>
      </div>
    </section>
  );
};

export default Reviews;