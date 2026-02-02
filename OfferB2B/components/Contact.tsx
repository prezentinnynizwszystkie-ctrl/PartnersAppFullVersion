import React from 'react';

const Contact: React.FC = () => {
  return (
    <section id="kontakt" className="h-full flex flex-col justify-center py-8 px-4 bg-white border-t border-slate-100 reveal">
      {/* Zmiana max-w-5xl na w-[90%] max-w-screen-xl */}
      <div className="w-[90%] max-w-screen-xl mx-auto text-center">
        <div className="inline-block px-4 py-1.5 bg-blue-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-lg">
          Skontaktuj się z nami
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-8 md:mb-12 tracking-tight italic uppercase">Porozmawiajmy</h2>
        
        <div className="flex flex-col gap-4 md:gap-6 w-full">
          
          {/* Email - Poziomy Kafelek */}
          <a 
            href="mailto:biuro@PrezentInnyNizWszystkie.pl" 
            className="w-full flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 p-6 md:p-8 rounded-[2rem] bg-slate-50 border border-slate-100 transition-all hover:shadow-xl hover:border-blue-100 group"
          >
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-blue-900 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shrink-0">
              <i className="fa-regular fa-envelope text-xl md:text-2xl"></i>
            </div>
            <div className="text-center md:text-left">
                 <span className="block text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest mb-1">Napisz do nas</span>
                 <span className="text-slate-900 text-base md:text-2xl font-black break-all md:break-normal">biuro@PrezentInnyNizWszystkie.pl</span>
            </div>
          </a>

          {/* Telefony - Poziomy Kafelek, numery obok siebie */}
          <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 p-6 md:p-8 rounded-[2rem] bg-slate-50 border border-slate-100 transition-all hover:shadow-xl hover:border-blue-100 group">
            
            <div className="flex flex-col items-center md:items-start gap-4 md:gap-0 md:flex-row md:items-center md:mr-auto">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-blue-900 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shrink-0">
                  <i className="fa-solid fa-phone text-xl md:text-2xl"></i>
                </div>
                <span className="mt-2 md:mt-0 md:ml-4 text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest whitespace-nowrap">Zadzwoń do nas</span>
            </div>

            <div className="flex flex-col md:flex-row gap-6 md:gap-12 md:ml-auto items-center">
              <div className="flex flex-col items-center md:items-end">
                <span className="text-[9px] font-black uppercase text-blue-900/60 tracking-widest mb-0.5">Michał</span>
                <a href="tel:+48508528528" className="text-slate-900 text-lg md:text-2xl font-black hover:text-blue-900 transition-colors whitespace-nowrap">+48 508 528 528</a>
              </div>
              <div className="hidden md:block w-px h-10 bg-slate-200"></div>
              <div className="flex flex-col items-center md:items-start">
                <span className="text-[9px] font-black uppercase text-blue-900/60 tracking-widest mb-0.5">Grzegorz</span>
                <a href="tel:+48501031430" className="text-slate-900 text-lg md:text-2xl font-black hover:text-blue-900 transition-colors whitespace-nowrap">+48 501 031 430</a>
              </div>
            </div>
            
          </div>

        </div>
      </div>
    </section>
  );
};

export default Contact;