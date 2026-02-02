import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

interface Step4Props {
  currentAvatars: string[];
  activeIndex: number;
  direction: number;
  onPrev: () => void;
  onNext: () => void;
  onBack: () => void;
  onComplete: () => void;
}

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { zIndex: 1, x: 0, opacity: 1 },
  exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? '100%' : '-100%', opacity: 0 })
};

const swipePower = (offset: number, velocity: number) => Math.abs(offset) * velocity;

export const Step4Avatar: React.FC<Step4Props> = ({ 
  currentAvatars, activeIndex, direction, onPrev, onNext, onBack, onComplete 
}) => {
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="flex-1 relative min-h-0 flex items-center justify-center px-4 overflow-hidden">
        <button 
          onClick={onPrev} 
          className="absolute left-4 z-50 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg text-slate-900 active:scale-90 transition-transform"
        >
          <ChevronLeft size={28} strokeWidth={2.5} />
        </button>
        <button 
          onClick={onNext} 
          className="absolute right-4 z-50 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg text-slate-900 active:scale-90 transition-transform"
        >
          <ChevronRight size={28} strokeWidth={2.5} />
        </button>

        <div 
          className="w-full h-full relative flex items-center justify-center pointer-events-none"
          style={{ 
            maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)', 
            WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)' 
          }}
        >
          <AnimatePresence initial={false} custom={direction}>
            <motion.div 
              key={activeIndex} 
              custom={direction} 
              variants={slideVariants} 
              initial="enter" 
              animate="center" 
              exit="exit" 
              transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }} 
              className="absolute inset-0 flex items-center justify-center p-4 pointer-events-auto cursor-grab active:cursor-grabbing"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, { offset, velocity }) => { 
                if (swipePower(offset.x, velocity.x) < -10000) onNext(); 
                else if (swipePower(offset.x, velocity.x) > 10000) onPrev(); 
              }}
            >
              {currentAvatars[activeIndex]?.endsWith('.mp4') ? (
                <video src={currentAvatars[activeIndex]} autoPlay loop muted playsInline className="max-w-full max-h-full object-contain aspect-[4/5] rounded-3xl" />
              ) : (
                <img src={currentAvatars[activeIndex]} alt="" className="max-w-full max-h-full object-contain aspect-[4/5] rounded-3xl" />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
          {currentAvatars.map((_, i) => (
            <div key={i} className={`h-[6px] rounded-full transition-all duration-300 ${i === activeIndex ? 'w-8 bg-blue-600' : 'w-[6px] bg-slate-400/30'}`} />
          ))}
        </div>
      </div>

      <div className="px-8 pb-10 pt-4 flex gap-4 items-center bg-[#dbeafe] relative z-50">
        <button onClick={onBack} className="px-10 py-5 bg-white/50 text-slate-600 rounded-[24px] font-bold text-lg whitespace-nowrap">Wróć</button>
        <button onClick={onComplete} className="flex-1 py-5 bg-slate-900 text-white rounded-[24px] font-bold text-lg shadow-xl flex items-center justify-center gap-3">Dalej <ArrowRight size={22} /></button>
      </div>
    </div>
  );
};