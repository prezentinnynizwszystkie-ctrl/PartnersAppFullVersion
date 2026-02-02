import React from 'react';

const MarketingPackageSection: React.FC = () => {
  return (
    <section id="pakiet" className="h-full flex flex-col justify-center items-center py-4 md:py-8 px-4 bg-white overflow-hidden relative">
       {/* Tło dekoracyjne */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-blue-50 rounded-full blur-[100px] opacity-40"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[30vw] h-[30vw] bg-indigo-50 rounded-full blur-[100px] opacity-40"></div>
       </div>

      {/* Zmiana max-w-6xl na w-[90%] max-w-screen-2xl */}
      <div className="w-[90%] max-w-screen-2xl mx-auto reveal flex flex-col items-center justify-center h-full z-10">
        
        {/* Zmniejszono padding mobilny z p-8 na p-5 oraz space-y z 8 na 4 */}
        <div className="w-full bg-slate-900 text-white rounded-[2rem] md:rounded-[3rem] p-5 md:p-16 relative overflow-hidden shadow-2xl text-center border-4 border-slate-800">
            {/* Efekty tła wewnątrz karty */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col items-center justify-center space-y-4 md:space-y-8">
                
                {/* Ikona / Badge - zmniejszono na mobile */}
                <div className="w-14 h-14 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg mb-1 md:mb-2 animate-float">
                    <i className="fa-solid fa-box-open text-2xl md:text-4xl text-white"></i>
                </div>

                <div className="space-y-2 md:space-y-4">
                    {/* Zmniejszono czcionkę na mobile */}
                    <h2 className="text-2xl md:text-6xl font-black tracking-tight italic uppercase text-white leading-tight">
                        Pakiet Wdrożeniowy <br/>
                        <span className="text-blue-400">"Gotowy do Startu"</span>
                    </h2>
                    {/* Skrócony tekst i mniejsza czcionka na mobile */}
                    <p className="text-slate-300 text-xs md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed">
                        Pełne wsparcie marketingowe: standy, plakaty, ulotki i karty dostępowe – profesjonalnie zaprojektowane i spójne z Twoją marką.
                    </p>
                </div>

                {/* Cena i Call to Action - zmniejszono padding top */}
                <div className="pt-4 md:pt-8 flex flex-row items-center justify-center gap-4 md:gap-16 border-t border-white/10 mt-2 md:mt-4 w-full">
                     <div className="text-center">
                        <span className="block text-slate-400 text-[10px] md:text-sm font-bold uppercase tracking-widest mb-1">Wartość</span>
                        <div className="text-2xl md:text-5xl font-black text-white tracking-tighter line-through decoration-blue-500 decoration-4">500 zł</div>
                    </div>
                    
                    <div className="text-center transform scale-105 md:scale-110">
                         <span className="block text-blue-400 text-[10px] md:text-sm font-bold uppercase tracking-widest mb-1">Dla Ciebie</span>
                         <div className="text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 tracking-tighter">0 zł</div>
                    </div>

                     <div className="text-center">
                        <span className="block text-slate-400 text-[10px] md:text-sm font-bold uppercase tracking-widest mb-1">Warunek</span>
                        <div className="text-xs md:text-2xl font-bold text-white leading-tight">*przy umowie<br/>na 6 m-cy</div>
                    </div>
                </div>

            </div>
        </div>

      </div>
    </section>
  );
};

export default MarketingPackageSection;