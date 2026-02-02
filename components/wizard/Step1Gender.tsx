import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

interface Step1Props {
  onSelect: (gender: 'boy' | 'girl') => void;
}

export const Step1Gender: React.FC<Step1Props> = ({ onSelect }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col items-center justify-start px-6 py-12 text-center">
    <h2 className="text-3xl md:text-5xl font-display font-black text-slate-900 mb-10">Wybierz płeć dziecka</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
      <button onClick={() => onSelect('boy')} className="group relative h-64 rounded-[2.5rem] bg-white border border-slate-200 shadow-xl flex flex-col items-center justify-center gap-4 transition-all hover:scale-[1.02]">
        <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><User size={40} /></div>
        <span className="text-2xl font-bold text-slate-800">Chłopiec</span>
      </button>
      <button onClick={() => onSelect('girl')} className="group relative h-64 rounded-[2.5rem] bg-white border border-slate-200 shadow-xl flex flex-col items-center justify-center gap-4 transition-all hover:scale-[1.02]">
        <div className="w-20 h-20 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center"><User size={40} /></div>
        <span className="text-2xl font-bold text-slate-800">Dziewczynka</span>
      </button>
    </div>
  </motion.div>
);