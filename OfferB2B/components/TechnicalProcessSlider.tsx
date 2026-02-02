import React, { useState, useRef } from 'react';
import SliderControls from './SliderControls';

const TechnicalProcessSlider: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStart = useRef<number | null>(null);

  const steps = [
    {
      step: "Krok 1",
      title: "Wdrożenie i Branding",
      desc: "Po podpisaniu umowy otrzymujesz od nas \"Pakiet Startowy\": standy na recepcję i stoliki, plakaty oraz zapas Kart Aktywacyjnych – wszystko spójne z Twoją marką. Jesteś gotowy do działania od pierwszego dnia."
    },
    {
      step: "Krok 2",
      title: "Sprzedaż",
      desc: "Gdy Rodzic decyduje się na pamiątkę (przy rezerwacji urodzin lub w trakcie imprezy), Twój pracownik wykonuje tylko jedną czynność: wręcza Rodzicowi Kartę z unikalnym kodem QR. To wszystko. Recepcja nie musi niczego konfigurować ani tłumaczyć."
    },
    {
      step: "Krok 3",
      title: "Piłeczka po stronie Rodzica",
      desc: "Rodzic skanuje kod QR swoim telefonem lub wchodzi w link (przed, w trakcie zabawy lub w domu). Otwiera się intuicyjny kreator, gdzie: wgrywa zdjęcie z przyjęcia (opcjonalnie), ustala własne Hasło Dostępu do bajki, zatwierdza stworzenie pamiątki."
    },
    {
      step: "Krok 4",
      title: "Produkcja w tle",
      desc: "Nasz system przetwarza dane i tworzy spersonalizowaną wideo-bajkę. Proces zajmuje około 30 minut. W tym czasie dzieci bawią się na sali, a Ty nie angażujesz żadnych zasobów."
    },
    {
      step: "Krok 5",
      title: "Finał i Efekt WOW",
      desc: "Rodzic otrzymuje powiadomienie (SMS/e-mail), że bajka jest gotowa. Może ją odtworzyć natychmiast na telefonie, wpisując swoje Hasło. Bonus dla gości: Rodzic może przekazać ustalone hasło oraz rozdać \"Karty Gościa\" pozostałym uczestnikom."
    }
  ];

  const next = () => setActiveIndex(prev => (prev + 1) % steps.length);
  const prev = () => setActiveIndex(prev => (prev - 1 + steps.length) % steps.length);

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
    <div id="proces-techniczny" className="mt-24 mb-32 reveal">
      <div className="text-center mb-12 space-y-4">
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight italic uppercase">PROCES TECHNICZNY</h2>
        <p className="text-slate-500 text-lg md:text-xl font-medium italic">Logistyka? Bierzemy ją na siebie.</p>
      </div>

      <div 
        className="relative overflow-visible px-4 touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {steps.map((s, i) => (
            <div key={i} className="min-w-full px-4">
              <div className="bg-white p-10 md:p-14 rounded-[3.5rem] border border-slate-100 shadow-xl flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto h-full min-h-[400px] justify-center">
                <div className="w-16 h-16 bg-blue-900 text-white rounded-full flex items-center justify-center text-xl font-black mb-2 shadow-lg">
                  {i + 1}
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight italic">{s.step}: {s.title}</h3>
                <p className="text-slate-500 text-base md:text-xl font-medium leading-relaxed max-w-2xl">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <SliderControls onPrev={prev} onNext={next} current={activeIndex} total={steps.length} />
    </div>
  );
};

export default TechnicalProcessSlider;