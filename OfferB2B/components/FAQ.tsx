import React, { useState } from 'react';

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "Kto odpowiada za obsługę techniczną?",
      a: "My. W 100%. Na każdej karcie i w aplikacji znajduje się kontakt do naszego Supportu. Jeśli rodzic będzie miał problem, kontaktuje się z nami."
    },
    {
      q: "Jak wygląda rozliczenie?",
      a: "Raz w miesiącu otrzymasz raport sprzedażowy i jedną fakturę zbiorczą obejmującą tylko zrealizowane bajki (tzw. Success Fee)."
    },
    {
      q: "Co z RODO i wizerunkiem dzieci?",
      a: "Administratorem danych jesteśmy my. Rodzic akceptuje regulamin w aplikacji. Ty jesteś prawnie bezpieczny i nie musisz gromadzić zgód."
    },
    {
      q: "Czy rodzic musi stworzyć bajkę na urodzinach?",
      a: "Nie musi. Kod na Karcie jest ważny np. przez 30 dni. Może to zrobić na spokojnie w domu."
    },
    {
      q: "Czy potrzebuję sprzętu w lokalu?",
      a: "Nie. Cały proces odbywa się na smartfonach rodziców (BYOD). Ty zapewniasz tylko fizyczne karty."
    },
    {
      q: "Czy mogę ustalić własną cenę?",
      a: "W modelu \"Freedom\" (Opcja 2) – tak! Masz pełną dowolność. W modelu \"Smart\" (Opcja 1) sugerujemy cenę sztywną."
    },
    {
      q: "Co jeśli klient zgubi kartę?",
      a: "Karty nie są przypisane przed aktywacją. Wydajesz nową, a zgubiony kod pozostaje nieaktywny – bez kosztów."
    }
  ];

  return (
    <section id="faq" className="h-full flex flex-col justify-center py-4 md:py-8 px-4 bg-slate-50 reveal overflow-hidden">
      {/* Zmiana max-w-7xl na w-[90%] max-w-screen-xl */}
      <div className="w-[90%] max-w-screen-xl mx-auto flex flex-col h-full justify-center">
        
        <div className="text-center mb-6 md:mb-8 space-y-2 flex-shrink-0">
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight italic uppercase">Często Zadawane Pytania</h2>
          <div className="w-16 h-1 bg-blue-900 mx-auto rounded-full"></div>
        </div>

        {/* Grid 2-kolumnowy, żeby zmieścić się na ekranie */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 overflow-y-auto md:overflow-visible pr-2 md:pr-0">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-blue-200"
            >
              <button 
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full text-left p-3 md:p-4 flex justify-between items-center group focus:outline-none"
                aria-expanded={openIndex === idx}
                aria-controls={`faq-answer-${idx}`}
              >
                <span className="text-sm md:text-base font-bold text-slate-900 pr-4 leading-tight group-hover:text-blue-900 transition-colors">
                  {faq.q}
                </span>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border transition-all ${openIndex === idx ? 'bg-blue-900 border-blue-900 text-white rotate-180' : 'bg-transparent border-slate-200 text-slate-400 group-hover:border-blue-900 group-hover:text-blue-900'}`}>
                  <i className="fa-solid fa-chevron-down text-[10px]"></i>
                </div>
              </button>
              
              <div 
                id={`faq-answer-${idx}`}
                className={`transition-all duration-300 ease-in-out ${openIndex === idx ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}
                aria-hidden={openIndex !== idx}
              >
                <div className="px-3 md:px-4 pb-4 pt-0">
                  <div className="w-full h-px bg-slate-100 mb-2"></div>
                  <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-medium">
                    {faq.a}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;