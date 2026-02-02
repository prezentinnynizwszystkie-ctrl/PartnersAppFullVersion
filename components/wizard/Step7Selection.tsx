
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Cloud, Sword, Search, Compass, Star, Loader2, Check } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import { Story } from '../../types';

interface Step7Props {
  partnerAgeGroups: string[];
  selectedStoryId: number | null;
  onStorySelect: (id: number) => void;
  onBack: () => void;
  onNext: () => void;
}

// Fixed metadata for categories
const CATEGORY_INFO: Record<string, { 
    title: string; 
    subtitle: string; 
    description: string; 
    icon: React.ReactNode;
    color: string;
    bg: string;
    border: string;
    btnColor: string;
}> = {
  '3-5': {
    title: 'MAŁY MARZYCIEL',
    subtitle: 'Najmłodszych (wiek 3-5)',
    description: 'Łagodne, bezpieczne historie pełne ciepła. Bez gwałtownych zwrotów akcji i nadmiaru bodźców. Idealne dla wrażliwych dzieci, które kochają bajkowy klimat, zwierzątka i spokojną zabawę.',
    icon: <Cloud size={24} />,
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    btnColor: 'bg-sky-100 hover:bg-sky-200 text-sky-700'
  },
  '6-8': {
    title: 'DZIELNY BOHATER',
    subtitle: 'Średniaków (wiek 6-8)',
    description: 'Dynamiczne opowieści, w których dziecko nie tylko słucha, ale działa. Jest cel, jest misja do wykonania i przeszkody do pokonania. Dla wulkanów energii, którzy chcą poczuć, że ratują świat.',
    icon: <Sword size={24} />,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    btnColor: 'bg-orange-100 hover:bg-orange-200 text-orange-700'
  },
  '9-12': {
    title: 'MISTRZ ZAGADEK',
    subtitle: 'Nastolatków (wiek 9-12)',
    description: 'Interaktywna bajka dla starszych dzieci pełna zagadek i tajemnic. Dla bystrzaków, którzy szukają intelektualnej rozrywki i tajemnic.',
    icon: <Search size={24} />,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    btnColor: 'bg-violet-100 hover:bg-violet-200 text-violet-700'
  },
  '13+': {
    title: 'ARCHITEKT LEGEND',
    subtitle: 'Młodzieży (wiek 13+)',
    description: 'Epicka podróż z głębią, w której liczą się trudne wybory i ich realne konsekwencje. To już nie tylko bajka, a narracyjna wyprawa, w której jubilat staje się liderem i „aktywnym agentem” budującym własne dziedzictwo.',
    icon: <Compass size={24} />,
    color: 'text-slate-700',
    bg: 'bg-slate-100',
    border: 'border-slate-300',
    btnColor: 'bg-slate-200 hover:bg-slate-300 text-slate-800'
  }
};

// Sub-component for the Slider to handle its own refs
const StorySlider: React.FC<{
  stories: Story[];
  selectedStoryId: number | null;
  onSelect: (id: number) => void;
}> = ({ stories, selectedStoryId, onSelect }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 260; // card width + gap
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="pt-4 pb-2">
      {/* Slider Container */}
      <div 
        ref={scrollRef}
        className="overflow-x-auto flex gap-4 pb-4 -mx-6 px-6 no-scrollbar snap-x snap-mandatory touch-pan-x"
      >
        {stories.map(story => (
          <button 
            key={story.Id}
            onClick={() => onSelect(story.Id)}
            className={`
                flex-shrink-0 w-[240px] snap-center group relative bg-white rounded-[1.5rem] border-2 transition-all text-left shadow-lg overflow-hidden flex flex-col
                ${selectedStoryId === story.Id ? 'border-blue-600 ring-4 ring-blue-100 scale-[0.98]' : 'border-transparent hover:border-slate-200'}
            `}
          >
            {/* Image Aspect Ratio */}
            <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                {story.CoverUrl ? (
                    <img src={story.CoverUrl} alt={story.StoryTitle} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400 font-bold uppercase text-xs">Brak okładki</div>
                )}
                
                {selectedStoryId === story.Id && (
                    <div className="absolute inset-0 bg-blue-600/20 backdrop-blur-[1px] flex items-center justify-center">
                        <div className="bg-white p-2 rounded-full shadow-xl">
                            <Star className="text-blue-600 fill-blue-600" size={24} />
                        </div>
                    </div>
                )}
            </div>
            
            {/* Content */}
            <div className="p-4 flex-1 flex flex-col">
                <h4 className="font-display font-black text-slate-900 text-lg leading-tight mb-2">{story.StoryTitle}</h4>
                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{story.StoryDescription}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-end gap-2 px-2">
        <button 
          onClick={() => scroll('left')}
          className="p-2 rounded-full bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm"
          aria-label="Przewiń w lewo"
        >
          <ChevronLeft size={20} />
        </button>
        <button 
          onClick={() => scroll('right')}
          className="p-2 rounded-full bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm"
          aria-label="Przewiń w prawo"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export const Step7Selection: React.FC<Step7Props> = ({ 
  partnerAgeGroups, selectedStoryId, onStorySelect, onBack, onNext 
}) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Fetch stories from DB
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const { data, error } = await supabase
          .schema('PartnersApp')
          .from('Stories')
          .select('*');
        
        if (error) throw error;
        setStories(data || []);
      } catch (err) {
        console.error("Error fetching stories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, []);

  // Filter categories
  const availableCategories = Object.keys(CATEGORY_INFO).filter(cat => partnerAgeGroups.includes(cat));

  const toggleCategory = (catKey: string) => {
    setExpandedCategory(prev => prev === catKey ? null : catKey);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      <div className="px-6 pt-1 flex-shrink-0 z-20 bg-[#dbeafe]/80 backdrop-blur-sm sticky top-0">
         <button onClick={onBack} className="text-slate-400 mb-2 flex items-center gap-1 text-xs font-bold uppercase self-start">
          <ChevronLeft size={14} /> Wróć
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 scroll-smooth">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="space-y-6 px-6 pt-4"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-display font-black text-slate-900 leading-tight">Wybierz historię</h2>
            <p className="text-slate-500 font-medium text-sm mt-2">Zapoznaj się z kategoriami i wybierz idealną przygodę.</p>
          </div>

          {loading ? (
             <div className="flex justify-center py-20"><Loader2 className="animate-spin text-slate-400" size={32} /></div>
          ) : (
            availableCategories.map(catKey => {
              const info = CATEGORY_INFO[catKey];
              const categoryStories = stories.filter(s => s.AgeGroup === catKey);
              const isExpanded = expandedCategory === catKey;

              if (categoryStories.length === 0) return null;

              // Check if the currently selected story belongs to this category
              const isSelectedStoryInThisCategory = categoryStories.some(s => s.Id === selectedStoryId);

              return (
                <section key={catKey} className="space-y-4">
                  {/* Category Card */}
                  <div className={`p-6 rounded-3xl border-2 transition-all ${info.bg} ${info.border} ${isExpanded ? 'shadow-md' : ''}`}>
                    <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl bg-white shadow-sm ${info.color}`}>
                                {info.icon}
                            </div>
                            <div>
                                 <h3 className={`text-xl font-black uppercase tracking-tight ${info.color}`}>{info.title}</h3>
                                 <span className="text-xs font-bold text-slate-500 uppercase">Sugerowane dla: {info.subtitle}</span>
                            </div>
                        </div>
                    </div>
                    
                    <p className="text-sm text-slate-700 leading-relaxed font-medium mb-6">
                        {info.description}
                    </p>

                    <button 
                        onClick={() => toggleCategory(catKey)}
                        className={`w-full py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 ${info.btnColor}`}
                    >
                        {isExpanded ? (
                            <>Zwiń <ChevronLeft className="rotate-90" size={16} /></>
                        ) : (
                            <>Zobacz tytuły ({categoryStories.length}) <ChevronRight className="rotate-90" size={16} /></>
                        )}
                    </button>
                  </div>

                  {/* Expandable Slider Area */}
                  <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                        >
                           <StorySlider 
                              stories={categoryStories}
                              selectedStoryId={selectedStoryId}
                              onSelect={onStorySelect}
                           />
                           
                           {/* Contextual Confirm Button - Appears inside the active category if a story from it is selected */}
                           <AnimatePresence>
                             {isSelectedStoryInThisCategory && (
                               <motion.div 
                                 initial={{ opacity: 0, y: -10 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 exit={{ opacity: 0, y: -10 }}
                                 className="px-2 pt-2 pb-6"
                               >
                                  <button 
                                      onClick={onNext}
                                      className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-lg shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                                  >
                                      ZATWIERDŹ BAJKĘ <Check size={22} className="text-green-400" />
                                  </button>
                               </motion.div>
                             )}
                           </AnimatePresence>
                        </motion.div>
                    )}
                  </AnimatePresence>
                </section>
              );
            })
          )}
        </motion.div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};
