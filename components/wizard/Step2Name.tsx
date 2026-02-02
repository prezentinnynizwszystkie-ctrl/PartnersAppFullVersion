
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Search, Sparkles } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';

interface Step2Props {
  gender: 'boy' | 'girl';
  name: string;
  nameSearch: string;
  onNameSearchChange: (val: string) => void;
  onSelectName: (name: string) => void;
  age: string;
  onAgeChange: (val: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export const Step2Name: React.FC<Step2Props> = ({ 
  gender, name, nameSearch, onNameSearchChange, onSelectName, 
  age, onAgeChange, onBack, onNext 
}) => {
  const [availableNames, setAvailableNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Fetch names based on gender from Supabase
  useEffect(() => {
    const fetchNames = async () => {
      setLoading(true);
      try {
        const sexFilter = gender === 'boy' ? 'Male' : 'Female';
        const { data, error } = await supabase
          .schema('PartnersApp')
          .from('Names')
          .select('Name')
          .eq('Sex', sexFilter);
        
        if (error) throw error;
        
        if (data) {
          const namesList = data.map((item: any) => item.Name).sort();
          setAvailableNames(namesList);
        }
      } catch (err) {
        console.error('Error fetching names:', err);
      } finally {
        setLoading(false);
      }
    };

    if (gender) {
      fetchNames();
    }
  }, [gender]);

  const filtered = availableNames
    .filter(n => n.toLowerCase().includes(nameSearch.toLowerCase()));

  const handleNameClick = (n: string) => {
    onSelectName(n);
    onNameSearchChange(n); // Update input to show selected name
    setIsFocused(false);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="p-6 w-full max-w-xl mx-auto flex flex-col h-full">
      <button onClick={onBack} className="text-slate-400 mb-6 flex items-center gap-1 text-sm font-bold uppercase self-start"><ChevronLeft size={16} /> Wróć</button>
      
      <div className="space-y-8">
        {/* Name Section */}
        <div>
           <h2 className="text-3xl font-display font-black text-slate-900 mb-4">Jak ma na imię dziecko?</h2>
           <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Wpisz imię..." 
              value={nameSearch} 
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              onChange={(e) => {
                  onNameSearchChange(e.target.value);
                  onSelectName(e.target.value);
              }} 
              className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-slate-200 text-lg focus:border-slate-900 focus:outline-none bg-white shadow-sm font-bold text-slate-800"
            />
          </div>
          
          {/* Suggestions Dropdown */}
          {isFocused && (
             <div className="mt-2 bg-white rounded-xl border border-slate-100 shadow-lg overflow-hidden max-h-60 overflow-y-auto z-10 relative">
                {filtered.map(n => (
                    <button 
                        key={n} 
                        onClick={() => handleNameClick(n)}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 text-slate-700 font-medium border-b border-slate-50 last:border-0 flex items-center justify-between"
                    >
                        {n} <Sparkles size={14} className="text-blue-400 opacity-0 hover:opacity-100" />
                    </button>
                ))}
                {filtered.length === 0 && nameSearch.length > 0 && (
                   <div className="px-4 py-3 text-slate-400 text-sm italic">
                      Niestandardowe imię? Kliknij dalej, aby zatwierdzić.
                   </div>
                )}
             </div>
          )}
        </div>

        {/* Age Section */}
        <div>
            <h2 className="text-3xl font-display font-black text-slate-900 mb-4">Ile ma lat?</h2>
            <div className="flex items-center gap-4">
                <input 
                    type="number" 
                    value={age} 
                    onChange={(e) => onAgeChange(e.target.value)} 
                    placeholder="0" 
                    className="w-24 h-24 text-4xl font-black text-center rounded-2xl border-4 border-slate-200 focus:border-slate-900 focus:outline-none bg-white shadow-sm" 
                />
                <span className="text-xl font-bold text-slate-400">lat(a)</span>
            </div>
        </div>
      </div>

      <div className="flex-1" />

      <button 
        onClick={onNext} 
        disabled={!name || !age} 
        className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-xl disabled:opacity-50"
      >
        Dalej
      </button>
    </motion.div>
  );
};
