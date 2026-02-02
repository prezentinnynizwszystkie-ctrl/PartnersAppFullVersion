import React, { useState, useRef } from 'react';
import SliderControls from './SliderControls';

interface BenefitsProps {
  centerName: string;
}

const Benefits: React.FC<BenefitsProps> = ({ centerName }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStart = useRef<number | null>(null);
  
  const benefits = [
    {
      icon: "fa-gem",
      title: "Innowacyjna wartość dla Rodzica",
      text: "Oferujesz coś zupełnie innego niż konkurencja. Zamiast kolejnego plastiku, dajesz rodzicom produkt innowacyjny, trwały i edukacyjny."
    },
    {
      icon: "fa-trophy",
      title: "Prestiż i Wyróżnienie",
      text: "Wyróżniasz się na tle konkurencji. Ty dajesz emocje i doświadczenie Premium, o którym mówią rodzice i dzieci."
    },
    {
      icon: "fa-bullhorn",
      title: "Marketing Wirusowy (Viral)",
      text: "Dziecko słucha bajki w domu, puszcza kolegom i koleżankom w szkole. Wszyscy słyszą nazwę Twojej bawialni w kontekście 'magicznej przygody'."
    }
  ];

  // Logic for mobile slider
  const next = () => setActiveIndex(prev => (prev + 1) % benefits.length);
  const prev = () => setActiveIndex(prev => (prev - 1 + benefits.length) % benefits.length);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart.current - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    }
    touchStart.current = null;
  };

  return (
    <section id="korzysci" className="h-full flex flex-col justify-center py-8 md:py-12 px-6 bg-white overflow-hidden border-y border-slate-100">
      {/* Zmiana max-w-7xl na w-[90%] max-w-screen-2xl */}
      <div className="w-[90%] max-w-screen-2xl mx-auto reveal">
        <div className="text-center mb-8 md:mb-12">
            {/* Dynamiczny nagłówek zależny od centerName */}
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-6 text-slate-900 tracking-tight">
              {centerName ? `Co zyska oferta ${centerName}?` : 'Co zyska Twoja oferta?'}
            </h2>
            <p className="text-center text-slate-500 text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
            Zaoferuj swoim klientom <span className="text-blue-900 font-bold italic">pamiątkę Premium</span>, dzięki której Twoja bawialnia stanie się pierwszym wyborem świadomych rodziców.
            </p>
        </div>
        
        {/* DESKTOP VIEW: Grid (zachowany oryginał dla dużych ekranów) */}
        <div className="hidden md:grid grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <div key={i} className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 transition-all duration-300 hover:shadow-xl hover:border-blue-100 flex flex-col items-center text-center h-full hover:scale-[1.02] group">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-900 rounded-[2rem] flex items-center justify-center mb-6 text-2xl md:text-3xl shadow-xl text-white group-hover:scale-110 transition-transform duration-300">
                    <i className={`fa-solid ${b.icon}`}></i>
                  </div>
                  <h3 className="text-xl md:text-2xl font-extrabold mb-4 text-slate-900 tracking-tight">{b.title}</h3>
                  <p className="text-slate-500 text-sm md:text-base leading-relaxed font-medium">{b.text}</p>
              </div>
            ))}
        </div>

        {/* MOBILE VIEW: Slider (tylko dla mniejszych ekranów) */}
        <div className="md:hidden">
            <div 
                className="relative overflow-visible touch-pan-y"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <div 
                    className="flex transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                >
                    {benefits.map((b, i) => (
                        <div key={i} className="min-w-full px-2">
                             <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col items-center text-center h-full min-h-[350px] justify-center shadow-sm">
                                <div className="w-16 h-16 bg-blue-900 rounded-[2rem] flex items-center justify-center mb-6 text-2xl shadow-xl text-white">
                                    <i className={`fa-solid ${b.icon}`}></i>
                                </div>
                                <h3 className="text-xl font-extrabold mb-4 text-slate-900 tracking-tight">{b.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed font-medium">{b.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Nawigacja pod sliderem */}
            <SliderControls 
                onPrev={prev} 
                onNext={next} 
                current={activeIndex} 
                total={benefits.length} 
            />
        </div>

      </div>
    </section>
  );
};

export default Benefits;