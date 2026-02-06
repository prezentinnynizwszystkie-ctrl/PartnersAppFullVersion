
import React, { useState, useRef } from 'react';
import SliderControls from './SliderControls';

interface ImplementationSectionProps {
  centerName: string;
}

const ImplementationSection: React.FC<ImplementationSectionProps> = ({ centerName }) => {
  // Usunięto stan isAppModalOpen
  
  const steps = [
    {
      id: 1,
      title: "Wdrożenie i Branding",
      icon: "fa-box-open",
      desc: "Po podpisaniu umowy otrzymujesz \"Pakiet Startowy\": standy, plakaty i Karty Aktywacyjne spójne z Twoją marką. Wdrożymy system w maksymalnie 7 dni."
    },
    {
      id: 2,
      title: "Sprzedaż",
      icon: "fa-hand-holding-dollar",
      desc: "Gdy Rodzic kupuje pamiątkę, pracownik wręcza tylko Kartę z kodem QR. Recepcja nie musi niczego konfigurować ani tłumaczyć."
    },
    {
      id: 3,
      title: "Ruch Rodzica",
      icon: "fa-mobile-screen",
      desc: "Rodzic skanuje kod telefonem. W intuicyjnym kreatorze uzupełnia dane do personalizacji. Całość zajmuje 3 minuty."
    },
    {
      id: 4,
      title: "BAJKA JEST GOTOWA!",
      icon: "fa-envelope-open-text",
      desc: "Rodzic otrzymuje SMS lub E-mail z gotową bajką. Może ją obejrzeć lub pobrać i udostępnić wszystkim gościom."
    }
  ];

  // Logic for mobile sliders
  const [partnerIndex, setPartnerIndex] = useState(0);
  const [clientIndex, setClientIndex] = useState(0);
  const touchStartPartner = useRef<number | null>(null);
  const touchStartClient = useRef<number | null>(null);

  const partnerSteps = steps.slice(0, 2);
  const clientSteps = steps.slice(2, 5);

  // Partner Slider Handlers
  const nextPartner = () => setPartnerIndex(prev => (prev + 1) % partnerSteps.length);
  const prevPartner = () => setPartnerIndex(prev => (prev - 1 + partnerSteps.length) % partnerSteps.length);
  
  const handlePartnerTouchStart = (e: React.TouchEvent) => {
    touchStartPartner.current = e.targetTouches[0].clientX;
  };

  const handlePartnerTouchEnd = (e: React.TouchEvent) => {
    if (touchStartPartner.current === null) return;
    const diff = touchStartPartner.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextPartner();
      else prevPartner();
    }
    touchStartPartner.current = null;
  };

  // Client Slider Handlers
  const nextClient = () => setClientIndex(prev => (prev + 1) % clientSteps.length);
  const prevClient = () => setClientIndex(prev => (prev - 1 + clientSteps.length) % clientSteps.length);

  const handleClientTouchStart = (e: React.TouchEvent) => {
    touchStartClient.current = e.targetTouches[0].clientX;
  };

  const handleClientTouchEnd = (e: React.TouchEvent) => {
    if (touchStartClient.current === null) return;
    const diff = touchStartClient.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextClient();
      else prevClient();
    }
    touchStartClient.current = null;
  };


  return (
    <section id="wdrozenie" className="h-full flex flex-col justify-center py-4 md:py-8 px-4 bg-slate-50 overflow-hidden relative">
      {/* Zmiana max-w-7xl na w-[90%] max-w-screen-2xl */}
      <div className="w-[90%] max-w-screen-2xl mx-auto reveal flex flex-col h-full">
        
        {/* Nagłówek bez podtytułu */}
        <div className="text-center mb-6 md:mb-10 flex-shrink-0">
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight italic uppercase">PROCES TECHNICZNY</h2>
        </div>

        {/* Kontener Główny - Zmiana max-w-6xl na w-full */}
        {/* DESKTOP VIEW */}
        <div className="hidden md:flex flex-1 flex-col justify-center gap-6 md:gap-10 w-full mx-auto">
            
            {/* SEKCJA 1: Działania po stronie Partnera (Kroki 1, 2) */}
            <div className="w-full">
                <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
                    <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center shadow-md">
                         <i className="fa-solid fa-handshake-simple"></i>
                    </div>
                    {/* Dynamiczny nagłówek działań partnera */}
                    <h3 className="text-lg md:text-xl font-black text-slate-800 uppercase tracking-tight">
                      {centerName ? `Działania po stronie ${centerName}` : 'Działania po stronie Partnera'}
                    </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {partnerSteps.map((s) => (
                        <div key={s.id} className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col items-center text-center h-full justify-start group">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center text-lg md:text-xl mb-3 group-hover:scale-110 transition-transform shadow-sm">
                                <i className={`fa-solid ${s.icon}`}></i>
                            </div>
                            <div className="text-xs font-black text-blue-200 uppercase tracking-widest mb-1">Krok {s.id}</div>
                            <h3 className="text-sm md:text-base font-black text-slate-900 uppercase leading-tight mb-2">{s.title}</h3>
                            <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* SEKCJA 2: Działania po stronie Klienta (Kroki 3, 4) */}
             <div className="w-full">
                <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
                     <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center shadow-md">
                         <i className="fa-solid fa-users"></i>
                    </div>
                    <h3 className="text-lg md:text-xl font-black text-slate-800 uppercase tracking-tight">Działania po stronie Klienta</h3>
                </div>

                {/* Zmiana grid-cols-3 na grid-cols-2 bo mamy teraz 2 kroki */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {clientSteps.map((s) => (
                        <div key={s.id} className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col items-center text-center h-full justify-start group">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center text-lg md:text-xl mb-3 group-hover:scale-110 transition-transform shadow-sm">
                                <i className={`fa-solid ${s.icon}`}></i>
                            </div>
                            <div className="text-xs font-black text-blue-200 uppercase tracking-widest mb-1">Krok {s.id}</div>
                            <h3 className="text-sm md:text-base font-black text-slate-900 uppercase leading-tight mb-2">{s.title}</h3>
                            <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* MOBILE VIEW */}
        <div className="md:hidden flex flex-col gap-6">
            {/* PARTNER SLIDER */}
            <div>
                 <div className="flex items-center gap-3 mb-2 justify-center">
                    <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center shadow-md">
                         <i className="fa-solid fa-handshake-simple"></i>
                    </div>
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                      {centerName ? `Działania ${centerName}` : 'Działania Partnera'}
                    </h3>
                </div>
                
                <div 
                    className="relative overflow-visible touch-pan-y"
                    onTouchStart={handlePartnerTouchStart}
                    onTouchEnd={handlePartnerTouchEnd}
                >
                    <div 
                        className="flex transition-transform duration-500 ease-out"
                        style={{ transform: `translateX(-${partnerIndex * 100}%)` }}
                    >
                        {partnerSteps.map((s) => (
                            <div key={s.id} className="min-w-full px-2">
                                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center h-full min-h-[220px] justify-start">
                                    <div className="w-10 h-10 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center text-lg mb-3 shadow-sm">
                                        <i className={`fa-solid ${s.icon}`}></i>
                                    </div>
                                    <div className="text-xs font-black text-blue-200 uppercase tracking-widest mb-1">Krok {s.id}</div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase leading-tight mb-2">{s.title}</h3>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <SliderControls onPrev={prevPartner} onNext={nextPartner} current={partnerIndex} total={partnerSteps.length} />
            </div>

            {/* CLIENT SLIDER */}
            <div>
                 <div className="flex items-center gap-3 mb-2 justify-center">
                     <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center shadow-md">
                         <i className="fa-solid fa-users"></i>
                    </div>
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Działania Klienta</h3>
                </div>

                <div 
                    className="relative overflow-visible touch-pan-y"
                    onTouchStart={handleClientTouchStart}
                    onTouchEnd={handleClientTouchEnd}
                >
                    <div 
                        className="flex transition-transform duration-500 ease-out"
                        style={{ transform: `translateX(-${clientIndex * 100}%)` }}
                    >
                        {clientSteps.map((s) => (
                            <div key={s.id} className="min-w-full px-2">
                                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center h-full min-h-[220px] justify-start">
                                    <div className="w-10 h-10 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center text-lg mb-3 shadow-sm">
                                        <i className={`fa-solid ${s.icon}`}></i>
                                    </div>
                                    <div className="text-xs font-black text-blue-200 uppercase tracking-widest mb-1">Krok {s.id}</div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase leading-tight mb-2">{s.title}</h3>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <SliderControls onPrev={prevClient} onNext={nextClient} current={clientIndex} total={clientSteps.length} />
            </div>

        </div>

      </div>

      {/* Usunięto POPUP APLIKACJI TESTOWEJ */}

    </section>
  );
};

export default ImplementationSection;
