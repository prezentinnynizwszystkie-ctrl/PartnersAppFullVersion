import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

interface Step7Props {
  name: string;
  onClose: () => void;
}

export const Step7Final: React.FC<Step7Props> = ({ name, onClose }) => (
  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6 min-h-[400px]">
    <div className="w-32 h-32 bg-white rounded-full shadow-2xl flex items-center justify-center text-red-500 animate-bounce"><Heart size={64} fill="currentColor" /></div>
    <h2 className="text-4xl font-display font-black text-slate-900">Niesamowite!</h2>
    <p className="text-xl text-slate-600 font-medium max-w-sm">Przygotowujemy Twoją spersonalizowaną bajkę dla {name}.</p>
    <div className="p-8 bg-blue-600 text-white rounded-[2.5rem] shadow-2xl font-black text-2xl tracking-tight">Ciąg dalszy nastąpi...</div>
    <button onClick={onClose} className="mt-8 text-slate-400 font-bold uppercase tracking-widest hover:text-slate-900 transition-colors">Zamknij</button>
  </motion.div>
);