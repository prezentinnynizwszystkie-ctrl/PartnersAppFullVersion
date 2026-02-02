import React, { useState, useRef } from 'react';
import SliderControls from './SliderControls';

interface ProfitModelProps {
  centerName: string;
}

const ProfitModel: React.FC<ProfitModelProps> = ({ centerName }) => {
  const [parties, setParties] = useState<string>('');
  
  // Logic for mobile slider
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStart = useRef<number | null>(null);
  
  // Obliczenia: Liczba imprez * 67% (zainteresowanie) * 52 zł (zysk partnera)
  const estimatedProfit = parties ? Math.round(Number(parties) * 0.67 * 52) : 0;
  
  // Obliczenia: Prowizja dla pracowników (15% od ceny 149zł = 22.35zł)
  const staffCommission = parties ? Math.round(Number(parties) * 0.67 * 22.35) : 0;

  // Slider navigation
  const totalSlides = 2; // Mamy 2 opcje
  const next = () => setActiveIndex(prev => (prev + 1) % totalSlides);
  const prev = () => setActiveIndex(prev => (prev - 1 + totalSlides) % totalSlides);

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
    <section id="cennik" className="py-2 md:py-4 px-4 bg-white border-t border-slate-100 overflow-hidden h-full flex flex-col">
      {/* Zmiana max-w-7xl na w-[90%] max-w-screen-2xl */}
      <div className="w-[90%] max-w-screen-2xl mx-auto reveal flex-1 flex flex-col justify-center">
        
        {/* Nagłówek sekcji - Zmniejszone marginesy, usunięty podtytuł */}
        <div className="text-center mb-4 space-y-2 flex-shrink-0">
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight italic uppercase leading-tight">
            {centerName ? `Model zysków dla ${centerName}` : 'Twój Model Zysków'}
          </h2>
        </div>

        {/* DESKTOP VIEW: Grid (zachowany oryginał) */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 w-full mx-auto">
          
          {/* OPCJA 1 */}
          <div className="bg-slate-50 p-5 md:p-6 rounded-[2rem] border border-slate-200 shadow-lg flex flex-col h-full hover:border-blue-200 transition-colors group relative overflow-hidden">
             {/* Badge dla Opcji 1 */}
             <div className="absolute top-0 right-0 bg-green-600 text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider shadow-sm z-10">
                Rozliczenie tylko za sprzedane bajki
             </div>

             <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                <h3 className="text-base md:text-lg font-black text-slate-900 uppercase italic tracking-tight">OPCJA 1 – MODEL PROWIZYJNY</h3>
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-900 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-handshake text-sm"></i>
                </div>
             </div>
             
             <div className="space-y-3 text-xs md:text-sm text-slate-600 flex-1">
                <p><strong className="text-slate-900 font-bold block mb-0.5">Zasada (50/35/15):</strong> Rozliczenie następuje wyłącznie za faktycznie sprzedane bajki. Model ten obejmuje zarówno sprzedaż w pakietach urodzinowych, jak i sprzedaż indywidualną.</p>
                
                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-1 border-b border-slate-100 pb-1">
                        <span>Sugerowana cena detaliczna:</span>
                        <span className="font-black text-slate-900 text-base">149,00 PLN <span className="text-[10px] font-normal text-slate-400">brutto</span></span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] md:text-xs bg-green-50 px-2 py-1 rounded text-green-800 font-bold mt-1">
                        <span>Podział zysków:</span>
                        {/* Dynamiczny podział zysków */}
                        <span>50% Dostawca / 35% {centerName || 'Partner'} / 15% Prowizja dla obsługi</span>
                    </div>
                </div>

                <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-50">
                    <strong className="text-blue-900 block mb-2 text-[10px] md:text-xs uppercase tracking-wider font-bold">Oferta dla wielu solenizantów (Urodziny łączone):</strong>
                    <ul className="space-y-1 text-[10px] md:text-xs">
                        <li className="flex justify-between border-b border-blue-100/50 pb-1">
                            <span>Pierwsza bajka:</span>
                            <span className="font-bold text-slate-900">100% ustalonej ceny</span>
                        </li>
                        <li className="flex justify-between items-center">
                            <span>Każda kolejna bajka (2-5):</span>
                            <span className="font-bold text-blue-600 bg-white px-1.5 py-0.5 rounded shadow-sm">50% ustalonej ceny</span>
                        </li>
                    </ul>
                </div>
             </div>
          </div>

          {/* OPCJA 2 */}
          <div className="bg-slate-50 p-5 md:p-6 rounded-[2rem] border border-slate-200 shadow-lg flex flex-col h-full relative overflow-hidden group hover:border-blue-200 transition-colors">
             <div className="absolute top-0 right-0 bg-blue-900 text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider shadow-sm z-10">Zakup z góry</div>
             
             <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                <h3 className="text-base md:text-lg font-black text-slate-900 uppercase italic tracking-tight">OPCJA 2 – MODEL PAKIETOWY</h3>
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-900 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-layer-group text-sm"></i>
                </div>
             </div>

             <div className="space-y-3 text-xs md:text-sm text-slate-600 flex-1">
                <p><strong className="text-slate-900 font-bold block mb-0.5">Zasada:</strong> Partner wykupuje z góry określony pakiet kodów. Sposób ich rozdysponowania (odsprzedaż, dodatek gratisowy, promocja) leży całkowicie po stronie Partnera.</p>

                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <strong className="text-slate-900 block mb-2 text-[10px] md:text-xs uppercase tracking-wider font-bold">Cennik Pakietów (Brutto/szt):</strong>
                    <ul className="space-y-1.5 text-[10px] md:text-xs font-medium">
                        <li className="flex justify-between border-b border-slate-200 border-dashed pb-1">
                            <span>Pakiet do 25 szt.</span>
                            <span className="text-slate-900 font-bold">70,00 PLN</span>
                        </li>
                        <li className="flex justify-between border-b border-slate-200 border-dashed pb-1">
                            <span>Pakiet 26-50 szt.</span>
                            <span className="text-slate-900 font-bold">65,00 PLN</span>
                        </li>
                         <li className="flex justify-between border-b border-slate-200 border-dashed pb-1">
                                <span>Pakiet 51-100 szt.</span>
                                <span className="text-slate-900 font-bold">60,00 PLN</span>
                        </li>
                        <li className="flex justify-between border-b border-slate-200 border-dashed pb-1">
                            <span>Pakiet 101-200 szt.</span>
                            <span className="text-slate-900 font-bold">55,00 PLN</span>
                        </li>
                        <li className="flex justify-between">
                            <span className="font-bold text-blue-900">Pakiet powyżej 200 szt.</span>
                            <span className="text-slate-900 font-bold">50,00 PLN</span>
                        </li>
                    </ul>
                </div>
             </div>
          </div>
        </div>

        {/* MOBILE VIEW: Slider */}
        <div className="md:hidden mb-4">
             <div 
                className="relative overflow-visible touch-pan-y"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <div 
                    className="flex transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                >
                    {/* SLIDE 1: OPCJA 1 */}
                    <div className="min-w-full px-2">
                        <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-200 shadow-lg flex flex-col h-full relative overflow-hidden">
                             <div className="absolute top-0 right-0 bg-green-600 text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider shadow-sm z-10">
                                Rozliczenie tylko za sprzedane bajki
                             </div>

                             <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                                <h3 className="text-base font-black text-slate-900 uppercase italic tracking-tight">OPCJA 1 – MODEL PROWIZYJNY</h3>
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-900 shadow-sm border border-slate-100">
                                  <i className="fa-solid fa-handshake text-sm"></i>
                                </div>
                             </div>
                             
                             <div className="space-y-3 text-xs text-slate-600 flex-1">
                                <p><strong className="text-slate-900 font-bold block mb-0.5">Zasada (50/35/15):</strong> Rozliczenie następuje wyłącznie za faktycznie sprzedane bajki. Model ten obejmuje zarówno sprzedaż w pakietach urodzinowych, jak i sprzedaż indywidualną.</p>
                                
                                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                    <div className="flex justify-between items-center mb-1 border-b border-slate-100 pb-1">
                                        <span>Sugerowana cena detaliczna:</span>
                                        <span className="font-black text-slate-900 text-base">149,00 PLN <span className="text-[10px] font-normal text-slate-400">brutto</span></span>
                                    </div>
                                    <div className="mb-1 text-[10px] text-slate-500 font-medium">
                                        Finalna kwota sprzedaży ustalana jest indywidualnie.
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] bg-green-50 px-2 py-1 rounded text-green-800 font-bold mt-1">
                                        <span>Podział zysków:</span>
                                        <span>50% Dost. / 35% Partner / 15% Obsługa</span>
                                    </div>
                                </div>

                                <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-50">
                                    <strong className="text-blue-900 block mb-2 text-[10px] uppercase tracking-wider font-bold">Oferta dla wielu solenizantów (Urodziny łączone):</strong>
                                    <ul className="space-y-1 text-[10px]">
                                        <li className="flex justify-between border-b border-blue-100/50 pb-1">
                                            <span>Pierwsza bajka:</span>
                                            <span className="font-bold text-slate-900">100% ustalonej ceny</span>
                                        </li>
                                        <li className="flex justify-between items-center">
                                            <span>Każda kolejna bajka (2-5):</span>
                                            <span className="font-bold text-blue-600 bg-white px-1.5 py-0.5 rounded shadow-sm">50% ustalonej ceny</span>
                                        </li>
                                    </ul>
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* SLIDE 2: OPCJA 2 */}
                    <div className="min-w-full px-2">
                        <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-200 shadow-lg flex flex-col h-full relative overflow-hidden">
                             <div className="absolute top-0 right-0 bg-blue-900 text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider shadow-sm z-10">Zakup z góry</div>
                             
                             <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                                <h3 className="text-base font-black text-slate-900 uppercase italic tracking-tight">OPCJA 2 – MODEL PAKIETOWY</h3>
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-900 shadow-sm border border-slate-100">
                                  <i className="fa-solid fa-layer-group text-sm"></i>
                                </div>
                             </div>

                             <div className="space-y-3 text-xs text-slate-600 flex-1">
                                <p><strong className="text-slate-900 font-bold block mb-0.5">Zasada:</strong> Partner wykupuje z góry określony pakiet kodów. Sposób ich rozdysponowania (odsprzedaż, dodatek gratisowy, promocja) leży całkowicie po stronie Partnera.</p>

                                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                    <strong className="text-slate-900 block mb-2 text-[10px] uppercase tracking-wider font-bold">Cennik Pakietów (Brutto/szt):</strong>
                                    <ul className="space-y-1.5 text-[10px] font-medium">
                                        <li className="flex justify-between border-b border-slate-200 border-dashed pb-1">
                                            <span>Pakiet do 25 szt.</span>
                                            <span className="text-slate-900 font-bold">70,00 PLN</span>
                                        </li>
                                        <li className="flex justify-between border-b border-slate-200 border-dashed pb-1">
                                            <span>Pakiet 26-50 szt.</span>
                                            <span className="text-slate-900 font-bold">65,00 PLN</span>
                                        </li>
                                         <li className="flex justify-between border-b border-slate-200 border-dashed pb-1">
                                                <span>Pakiet 51-100 szt.</span>
                                                <span className="text-slate-900 font-bold">60,00 PLN</span>
                                        </li>
                                        <li className="flex justify-between border-b border-slate-200 border-dashed pb-1">
                                            <span>Pakiet 101-200 szt.</span>
                                            <span className="text-slate-900 font-bold">55,00 PLN</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span className="font-bold text-blue-900">Pakiet powyżej 200 szt.</span>
                                            <span className="text-slate-900 font-bold">50,00 PLN</span>
                                        </li>
                                    </ul>
                                </div>
                             </div>
                        </div>
                    </div>

                </div>
             </div>
             <SliderControls onPrev={prev} onNext={next} current={activeIndex} total={totalSlides} />
        </div>

        {/* KALKULATOR ZYSKÓW - Zmiana max-w-5xl na w-full max-w-screen-xl */}
        <div className="w-full max-w-screen-xl mx-auto mt-auto mb-2">
            {/* Usunięto shadow-2xl */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-4 md:p-5 text-white flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                {/* Tło ozdobne */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                
                {/* Część 1: Badania Rynku */}
                <div className="flex-1 flex gap-4 items-start relative z-10">
                    <div className="hidden md:flex w-12 h-12 bg-white/10 rounded-full items-center justify-center shrink-0 border border-white/20">
                        <i className="fa-solid fa-magnifying-glass-chart text-xl text-blue-200"></i>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-wider text-blue-200 mb-1">Potencjał Rynku</h4>
                        <p className="text-xs md:text-sm leading-relaxed text-blue-50/90 font-medium">
                            Nasze badania rynku wykazały, że ponad <strong className="text-white text-base">67%</strong> rodziców organizujących urodziny w centrach rozrywki, jest zainteresowane zakupem AudioBajki.
                        </p>
                    </div>
                </div>

                {/* Separator */}
                <div className="hidden md:block w-px h-16 bg-white/10"></div>

                {/* Część 2: Kalkulator - ZMODYFIKOWANA */}
                <div className="flex-1 w-full bg-white/5 rounded-xl p-3 border border-white/10 backdrop-blur-sm">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-blue-200 text-center md:text-left">
                            Policz potencjalne zyski
                        </label>
                        <div className="flex items-center gap-2">
                            
                            {/* Input - zmniejszona szerokość */}
                            <div className="relative w-16 md:w-28 shrink-0">
                                <input 
                                    type="number" 
                                    placeholder="0"
                                    value={parties}
                                    onChange={(e) => setParties(e.target.value)}
                                    className="w-full bg-white text-slate-900 text-center font-bold rounded-lg py-2 px-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-300"
                                />
                                <span className="absolute -top-4 left-0 w-full text-center text-[9px] text-blue-300 whitespace-nowrap scale-90 md:scale-100">Imprez / msc</span>
                            </div>

                            <span className="text-blue-300 font-black">=</span>

                            {/* Box 1: Twój Zysk */}
                            <div className="flex-1 bg-green-500/20 border border-green-400/30 rounded-lg py-2 px-1 text-center min-w-0">
                                <span className="block text-green-300 font-black text-base md:text-xl leading-none">
                                    {estimatedProfit.toLocaleString()} zł
                                </span>
                                <span className="text-[8px] md:text-[9px] text-green-200/80 uppercase font-bold block mt-1 truncate">Twój Zysk</span>
                            </div>

                            {/* Box 2: Dla Pracowników (15%) - Skrócony tekst dla Mobile */}
                            <div className="flex-1 bg-indigo-500/20 border border-indigo-400/30 rounded-lg py-2 px-1 text-center min-w-0">
                                <span className="block text-indigo-300 font-black text-base md:text-xl leading-none">
                                    {staffCommission.toLocaleString()} zł
                                </span>
                                <span className="text-[8px] md:text-[9px] text-indigo-200/80 uppercase font-bold block mt-1 truncate">Dla Załogi</span>
                            </div>

                        </div>
                        <p className="text-[9px] text-blue-300/60 text-center mt-1">
                            *Szacunki: cena 149 zł, konwersja 67%. Prowizja załogi: 15%.
                        </p>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </section>
  );
};

export default ProfitModel;
