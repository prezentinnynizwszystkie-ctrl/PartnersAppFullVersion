import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface SearchableSelectProps {
  label: string;
  value: string;
  onSelect: (val: string) => void;
  options: string[];
  placeholder: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({ 
  label, 
  value, 
  onSelect, 
  options, 
  placeholder 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      <label className="text-sm font-bold text-slate-500 uppercase">{label}</label>
      <div 
        className="relative cursor-pointer" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <input 
          type="text"
          placeholder={placeholder}
          value={isOpen ? search : value}
          onChange={(e) => setSearch(e.target.value)}
          readOnly={!isOpen}
          className="w-full p-4 pr-12 rounded-2xl bg-white border-2 border-slate-100 shadow-sm focus:border-blue-500 focus:outline-none font-medium cursor-pointer"
        />
        <ChevronDown 
          className={`absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          size={20} 
        />
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }} 
            className="absolute z-[100] top-full left-0 right-0 bg-white border border-slate-100 rounded-2xl shadow-2xl mt-2 max-h-60 overflow-y-auto"
          >
            {(search ? filteredOptions : options).map(opt => (
                <button 
                  key={opt} 
                  onClick={() => { 
                    onSelect(opt); 
                    setIsOpen(false); 
                    setSearch(''); 
                  }} 
                  className={`w-full text-left p-4 hover:bg-blue-50 border-b border-slate-50 last:border-0 font-medium transition-colors ${value === opt ? 'bg-blue-50 text-blue-700' : 'text-slate-700'}`}
                >
                  {opt}
                </button>
            ))}
            {(search && filteredOptions.length === 0) && (
              <div className="p-4 text-slate-400 text-center font-medium italic">Brak wyników</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};