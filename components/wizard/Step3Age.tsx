import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

interface Step3Props {
  name: string;
  age: string;
  onAgeChange: (val: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step3Age: React.FC<Step3Props> = ({ name, age, onAgeChange, onNext, onBack }) => (
  <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="p-6 text-center w-full max-w-md mx-auto">
    <button onClick={onBack} className="mx-auto text-slate-400 mb-6 flex items-center gap-1 text-sm font-bold uppercase"><ChevronLeft size={16} /> Wróć</button>
    <h2 className="text-3xl font-display font-black text-slate-900 mb-4">Ile lat ma {name}?</h2>
    <input type="number" value={age} onChange={(e) => onAgeChange(e.target.value)} placeholder="0" className="w-32 h-32 text-5xl font-black text-center rounded-3xl border-4 border-slate-200 focus:border-slate-900 focus:outline-none bg-white shadow-xl mb-8" />
    <button onClick={onNext} disabled={!age} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-xl disabled:opacity-50">Dalej</button>
  </motion.div>
);