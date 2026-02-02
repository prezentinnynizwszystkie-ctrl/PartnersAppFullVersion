import React from 'react';

interface HowItWorksStepsProps {
  onShowCreator: () => void;
}

const HowItWorksSteps: React.FC<HowItWorksStepsProps> = ({ onShowCreator }) => {
  const steps = [
    {
      title: "1. Wybór",
      content: "Rodzic wybiera AudioBajkę jako dodatek do oferty urodzinowej. To produkcja studyjnej jakości z profesjonalnym lektorem."
    },
    {
      title: "2. Personalizacja",
      content: "Minimum formalności. W dedykowanym kreatorze rodzic wybiera motyw, wpisuje imiona i dodaje zdjęcie w 3 minuty."
    },
    {
      title: "3. Magia w tle",
      content: "Bajka generuje się automatycznie w 30 minut, podczas gdy dzieci bawią się na urodzinach. Zero angażowania pracowników."
    },
    {
      title: "4. Pamiątka",
      content: "Każdy uczestnik otrzymuje kartę z dostępem. Ty dostarczasz gotowe materiały, my zajmujemy się technologią."
    }
  ];

  return (
    <section id="jak-to-dziala" className="h-full flex flex-col justify-center py-8 md:py-12 px-6 bg-slate-50 overflow-hidden relative">
      {/* Zmiana max-w-7xl na max-w-5xl, aby kafelki nie były zbyt szerokie i nie wchodziły na nawigację */}
      <div className="max-w-5xl mx-auto w-full reveal flex flex-col h-full justify-center">
        
        <div className="text-center mb-8 space-y-6 flex-shrink-0">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight italic uppercase">Jak to działa?</h2>
          <p className="text-slate-500 text-sm md:text-base font-medium uppercase tracking-widest">Prosty proces w 4 krokach</p>
          
          {/* Przycisk przeniesiony na górę sekcji */}
          <div className="flex justify-center">
             <button 
                onClick={onShowCreator}
                className="px-6 py-3 bg-blue-900 text-white rounded-full text-xs md:text-sm font-black uppercase tracking-[0.15em] hover:bg-blue-800 transition-all shadow-lg hover:shadow-blue-900/20 active:scale-95 flex items-center gap-3"
              >
                <i className="fa-solid fa-wand-magic-sparkles"></i>
                Sprawdź jak wygląda kreator
              </button>
          </div>
        </div>

        {/* Widok Siatki (Grid) - Zmieniono na 2 kolumny (2x2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {steps.map((step, i) => (
              <div key={i} className="bg-white p-6 md:p-8 rounded-[2rem] shadow-lg border border-slate-100 flex flex-col items-start hover:scale-[1.02] transition-transform duration-300 h-full">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-900 flex items-center justify-center text-lg font-black shadow-sm mb-4">
                      {i + 1}
                  </div>
                  <h3 className="text-lg md:text-xl font-black text-slate-900 leading-tight tracking-tight mb-3">
                      {step.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">
                      {step.content}
                  </p>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSteps;