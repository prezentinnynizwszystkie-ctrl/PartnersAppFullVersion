
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, CheckCircle2, BookOpen, Printer, Share2 } from 'lucide-react';

interface Step9Props {
  name: string;
  onClose: () => void;
  generatedStory?: string | null;
  childFile?: File | null;
}

export const Step9ThankYou: React.FC<Step9Props> = ({ name, onClose, generatedStory, childFile }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Generate a local preview URL for the file to avoid permissions issues with Supabase Storage
  useEffect(() => {
    if (childFile) {
        const url = URL.createObjectURL(childFile);
        setPreviewUrl(url);
        
        // Cleanup the URL to avoid memory leaks
        return () => {
            URL.revokeObjectURL(url);
        };
    } else {
        setPreviewUrl(null);
    }
  }, [childFile]);

  // Function to render the story with book styling
  const renderStoryContent = (text: string) => {
    const paragraphs = text.split('\n').filter(p => p.trim() !== '');
    
    // Extract title if appropriate (e.g. first line is short and uppercase)
    let title = "Twoja Bajka";
    let contentParagraphs = paragraphs;
    
    if (paragraphs.length > 0 && paragraphs[0] === paragraphs[0].toUpperCase() && paragraphs[0].length < 100) {
        title = paragraphs[0];
        contentParagraphs = paragraphs.slice(1);
    }

    return (
      <div className="bg-white shadow-xl shadow-slate-200/60 border border-slate-100 p-8 md:p-12 rounded-[4px] relative overflow-hidden text-left max-h-[60vh] overflow-y-auto custom-scrollbar">
         {/* Decorative book spine */}
         <div className="absolute top-0 left-0 bottom-0 w-2 bg-gradient-to-r from-slate-200 to-slate-50 opacity-50" />
         
         <div className="flex items-center justify-center gap-2 text-blue-600 mb-8 opacity-80">
            <BookOpen size={20} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Scenariusz Audiobajki</span>
         </div>

         {/* Hero Image if available */}
         {previewUrl && (
             <div className="flex justify-center mb-8">
                 <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-slate-100 shadow-md overflow-hidden">
                     <img src={previewUrl} alt="Bohater" className="w-full h-full object-cover" />
                 </div>
             </div>
         )}

         <h1 className="text-2xl md:text-3xl font-display font-black text-slate-900 mb-6 text-center leading-tight">
           {title}
         </h1>

         <article className="prose prose-slate max-w-none">
            {contentParagraphs.map((paragraph, pIdx) => {
                 // Clean up tags for display if they still exist (though typically we want clean text)
                 // Keeping [cite] logic for consistency with previous viewer
                 const parts = paragraph.split(/(\[cite: [^\]]+\])/g);
                 
                 return (
                    <p key={pIdx} className="mb-4 text-base md:text-lg text-slate-700 leading-relaxed font-serif text-justify">
                        {parts.map((part, i) => {
                            if (part.match(/\[cite: [^\]]+\]/)) {
                                return (
                                    <span 
                                      key={i} 
                                      className="text-[9px] text-slate-300 font-mono align-super select-none mx-0.5"
                                    >
                                      {part.replace('cite: ', '#')}
                                    </span>
                                );
                            }
                            return <span key={i}>{part}</span>;
                        })}
                    </p>
                 );
            })}
         </article>
      </div>
    );
  };

  if (generatedStory) {
      return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="flex-1 flex flex-col p-6 text-center h-full max-w-4xl mx-auto"
        >
            <div className="mb-6 flex justify-between items-center px-2">
                 <h2 className="text-2xl font-display font-black text-slate-900 text-left">Oto Twoja Bajka!</h2>
                 <div className="flex gap-2">
                    <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors" title="Drukuj"><Printer size={20} /></button>
                    <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors" title="Udostępnij"><Share2 size={20} /></button>
                 </div>
            </div>

            {renderStoryContent(generatedStory)}

            <div className="mt-6 flex flex-col items-center gap-4">
                <div className="bg-green-50 text-green-700 px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 border border-green-100">
                    <CheckCircle2 size={16} /> Zapisano w bazie. Wysłano na e-mail.
                </div>
                <button 
                  onClick={onClose} 
                  className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition-all"
                >
                  Zamknij
                </button>
            </div>
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>
        </motion.div>
      );
  }

  // Fallback / Standard Thank You (No Story)
  return (
    <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8 min-h-[400px]"
    >
        <div className="relative">
            {previewUrl ? (
                <div className="w-32 h-32 rounded-full shadow-2xl border-4 border-white overflow-hidden mx-auto">
                    <img src={previewUrl} alt="Bohater" className="w-full h-full object-cover" />
                </div>
            ) : (
                <div className="w-32 h-32 bg-white rounded-full shadow-2xl flex items-center justify-center text-red-500 animate-bounce mx-auto">
                    <Heart size={64} fill="currentColor" />
                </div>
            )}
            
            {!previewUrl && (
                <div className="absolute -top-4 -right-4 bg-yellow-400 text-white p-3 rounded-full shadow-lg animate-pulse">
                    <Sparkles size={24} />
                </div>
            )}
        </div>

        <div className="space-y-4">
        <h2 className="text-4xl md:text-5xl font-display font-black text-slate-900">Dziękujemy!</h2>
        <p className="text-xl text-slate-600 font-medium max-w-sm mx-auto">
            Przygoda dla bohatera o imieniu <strong className="text-slate-900 font-black">{name}</strong> została przyjęta do realizacji!
        </p>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 max-w-md w-full">
        <div className="flex items-center justify-center gap-3 text-green-600 font-bold mb-4">
            <CheckCircle2 size={24} />
            <span>Zamówienie w toku</span>
        </div>
        <p className="text-slate-600 font-semibold leading-relaxed">
            Twoją spersonalizowaną bajkę otrzymasz w ciągu <span className="text-blue-600 font-black underline decoration-blue-200">24 godzin</span> na podany adres e-mail oraz telefon (SMS).
        </p>
        </div>

        <button 
        onClick={onClose} 
        className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xl shadow-xl hover:scale-105 transition-all"
        >
        Zamknij
        </button>
        
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Czekaj na wiadomość od nas!</p>
    </motion.div>
  );
};
