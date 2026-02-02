
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, BookOpen, Share2, Printer, Edit3 } from 'lucide-react';
import { STORY_UNDERWATER_ADVENTURE_SCENARIO } from '../constants/StoryUnderwaterAdventureScenario';

const GeneratedTale: React.FC = () => {
  // Funkcja przetwarzająca surowy tekst na sformatowane akapity
  const renderContent = (text: string) => {
    // Dzielimy na akapity
    const paragraphs = text.split('\n').filter(p => p.trim() !== '');

    // Wyciągamy tytuł (pierwsza linia jeśli jest w CAPS)
    let title = "Podgląd Bajki";
    let contentParagraphs = paragraphs;
    
    if (paragraphs.length > 0 && paragraphs[0] === paragraphs[0].toUpperCase() && paragraphs[0].length > 10) {
        title = paragraphs[0];
        contentParagraphs = paragraphs.slice(1);
    }

    return (
      <>
        <h1 className="text-3xl md:text-4xl font-display font-black text-slate-900 mb-8 text-center leading-tight">
          {title}
        </h1>
        {contentParagraphs.map((paragraph, pIdx) => {
          // Regex łapie: {Zn} ORAZ [cite: n]
          const parts = paragraph.split(/(\{Z\d+\}|\[cite: [^\]]+\])/g);

          return (
            <p key={pIdx} className="mb-6 text-lg md:text-xl text-slate-700 leading-loose font-serif text-justify">
              {parts.map((part, i) => {
                // Obsługa zmiennych {Z1}, {Z2}...
                if (part.match(/\{Z\d+\}/)) {
                  return (
                    <span 
                      key={i} 
                      className="inline-flex items-center justify-center bg-blue-100 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded mx-1 font-sans text-sm font-bold align-middle shadow-sm cursor-help"
                      title={`Zmienna dynamiczna: ${part}`}
                    >
                      <Edit3 size={10} className="mr-1 opacity-50" />
                      {part}
                    </span>
                  );
                }
                // Obsługa znaczników [cite: ...]
                if (part.match(/\[cite: [^\]]+\]/)) {
                  return (
                    <span 
                      key={i} 
                      className="text-[10px] text-slate-300 font-mono align-super select-none mx-0.5 hover:text-slate-500 transition-colors cursor-default"
                      title={`Znacznik czasowy: ${part}`}
                    >
                      {part.replace('cite: ', '#')}
                    </span>
                  );
                }
                // Zwykły tekst
                return <span key={i}>{part}</span>;
              })}
            </p>
          );
        })}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-slate-800 font-sans relative">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <Link 
            to="/" 
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wide"
        >
            <ChevronLeft size={18} /> Powrót
        </Link>
        <div className="flex gap-2">
            <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors" title="Drukuj"><Printer size={20} /></button>
            <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors" title="Udostępnij"><Share2 size={20} /></button>
        </div>
      </div>

      {/* Book Container */}
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        <div className="bg-white shadow-xl shadow-slate-200/60 border border-slate-100 p-8 md:p-16 rounded-[4px] md:rounded-[8px] relative overflow-hidden">
            
            {/* Ozdobny pasek z boku (imitacja książki) */}
            <div className="absolute top-0 left-0 bottom-0 w-2 md:w-4 bg-gradient-to-r from-slate-200 to-slate-50 opacity-50" />
            
            <div className="flex items-center justify-center gap-2 text-blue-600 mb-12 opacity-80">
                <BookOpen size={24} />
                <span className="text-xs font-bold uppercase tracking-[0.2em]">Scenariusz Audiobajki</span>
            </div>

            <article className="relative z-10">
                {renderContent(STORY_UNDERWATER_ADVENTURE_SCENARIO)}
            </article>

            {/* Footer książki */}
            <div className="mt-16 pt-8 border-t border-slate-100 flex justify-between items-center text-slate-400 text-xs font-medium uppercase tracking-widest">
                <span>MultiBajka Experience</span>
                <span>Strona 1 z 1</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratedTale;
