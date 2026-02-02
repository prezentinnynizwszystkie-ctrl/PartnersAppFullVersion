
import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, CheckCircle2, ChevronDown, Sparkles } from 'lucide-react';
import { SearchableSelect } from './SearchableSelect';
import { supabase } from '../../utils/supabaseClient';

interface Step5Props {
  name: string;
  hobby: string;
  onHobbyChange: (val: string) => void;
  
  friendGender: 'boy' | 'girl';
  onFriendGenderChange: (val: 'boy' | 'girl') => void;
  bestFriend: string;
  onFriendChange: (val: string) => void;

  positiveTrait: string;
  onTraitChange: (val: string) => void;
  childFile: File | null;
  onFileSelect: (file: File | null) => void;
  onNext: () => void;
  onBack: () => void;
  hobbies: string[];
  traits: string[];
}

export const Step5Details: React.FC<Step5Props> = ({ 
  name, hobby, onHobbyChange, 
  friendGender, onFriendGenderChange, bestFriend, onFriendChange,
  positiveTrait, onTraitChange, 
  childFile, onFileSelect, onNext, onBack, hobbies, traits 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Friend Name Input State
  const [friendNameSearch, setFriendNameSearch] = useState(bestFriend);
  const [availableFriendNames, setAvailableFriendNames] = useState<string[]>([]);
  const [isFriendFocused, setIsFriendFocused] = useState(false);

  // Update local search state if parent state changes (e.g. from valid selection)
  useEffect(() => {
    setFriendNameSearch(bestFriend);
  }, [bestFriend]);

  // Fetch friend names based on gender
  useEffect(() => {
    const fetchFriendNames = async () => {
      try {
        const sexFilter = friendGender === 'boy' ? 'Male' : 'Female';
        const { data, error } = await supabase
          .schema('PartnersApp')
          .from('Names')
          .select('Name')
          .eq('Sex', sexFilter);
        
        if (error) throw error;
        
        if (data) {
          const namesList = data.map((item: any) => item.Name).sort();
          setAvailableFriendNames(namesList);
        }
      } catch (err) {
        console.error('Error fetching friend names:', err);
      }
    };
    fetchFriendNames();
  }, [friendGender]);

  const handleFriendNameClick = (n: string) => {
    onFriendChange(n);
    setFriendNameSearch(n);
    setIsFriendFocused(false);
  };

  const filteredFriendNames = availableFriendNames
    .filter(n => n.toLowerCase().includes(friendNameSearch.toLowerCase()));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 w-full max-w-2xl mx-auto space-y-8">
      <div className="space-y-6">
        <SearchableSelect label="Ulubione zajęcie" placeholder="Wybierz lub wpisz..." value={hobby} onSelect={onHobbyChange} options={hobbies} />
        
        {/* Friend Section */}
        <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-500 uppercase">Najlepszy przyjaciel</label>
                
                {/* Gender Toggle */}
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button 
                        onClick={() => { onFriendGenderChange('boy'); onFriendChange(''); setFriendNameSearch(''); }}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${friendGender === 'boy' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Chłopiec
                    </button>
                    <button 
                        onClick={() => { onFriendGenderChange('girl'); onFriendChange(''); setFriendNameSearch(''); }}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${friendGender === 'girl' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Dziewczynka
                    </button>
                </div>
            </div>

            <div className="relative">
                <input 
                  type="text" 
                  placeholder="Wpisz imię przyjaciela..." 
                  value={friendNameSearch} 
                  onFocus={() => setIsFriendFocused(true)}
                  onBlur={() => setTimeout(() => setIsFriendFocused(false), 200)}
                  onChange={(e) => {
                      setFriendNameSearch(e.target.value);
                      onFriendChange(e.target.value);
                  }} 
                  className="w-full p-4 pr-12 rounded-2xl bg-white border-2 border-slate-100 shadow-sm focus:border-blue-500 focus:outline-none font-medium text-slate-800"
                />
                
                {/* Friend Suggestions Dropdown */}
                {isFriendFocused && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-100 shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                        {filteredFriendNames.map(n => (
                            <button 
                                key={n} 
                                onClick={() => handleFriendNameClick(n)}
                                className="w-full text-left px-4 py-3 hover:bg-blue-50 text-slate-700 font-medium border-b border-slate-50 last:border-0 flex items-center justify-between"
                            >
                                {n} <Sparkles size={14} className="text-blue-400 opacity-0 hover:opacity-100" />
                            </button>
                        ))}
                        {filteredFriendNames.length === 0 && friendNameSearch.length > 0 && (
                        <div className="px-4 py-3 text-slate-400 text-sm italic">
                            Niestandardowe imię? Kliknij dalej, aby zatwierdzić.
                        </div>
                        )}
                    </div>
                )}
            </div>
        </div>

        <SearchableSelect label={`Pozytywna cecha ${name}`} placeholder="Wybierz cechę..." value={positiveTrait} onSelect={onTraitChange} options={traits} />
        
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-500 uppercase">Zdjęcie dziecka</label>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden" 
          />
          <div 
            className={`w-full h-40 rounded-3xl border-3 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${childFile ? 'bg-green-50 border-green-300' : 'bg-white/50 border-slate-200 hover:bg-white hover:border-blue-300'}`}
            onClick={() => fileInputRef.current?.click()}
          >
            {childFile ? (
              <>
                <CheckCircle2 className="text-green-600" size={32} />
                <span className="text-green-700 font-bold">Zdjęcie dodane!</span>
                <span className="text-xs text-green-600 font-medium">{childFile.name}</span>
              </>
            ) : (
              <>
                <Upload className="text-slate-400" />
                <span className="text-slate-500 font-bold">Kliknij, aby wgrać zdjęcie</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-4 pt-4">
        <button onClick={onBack} className="px-8 py-4 bg-white/50 text-slate-600 rounded-2xl font-bold">Wróć</button>
        <button onClick={onNext} disabled={!hobby || !bestFriend || !positiveTrait} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl disabled:opacity-50">Dalej</button>
      </div>
    </motion.div>
  );
};
