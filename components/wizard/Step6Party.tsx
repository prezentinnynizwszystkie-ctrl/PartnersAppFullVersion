
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Trash2, CheckCircle2 } from 'lucide-react';

interface Step6Props {
  partyDate: string;
  onDateChange: (val: string) => void;
  partyFile: File | null;
  onPartyFileSelect: (file: File | null) => void;
  onAddGuest: (name: string) => void;
  guestList: string[];
  onRemoveGuest: (index: number) => void;
  attractions: string[];
  selectedAttractions: string[];
  onToggleAttraction: (attr: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export const Step6Party: React.FC<Step6Props> = ({ 
  partyDate, onDateChange, partyFile, onPartyFileSelect, 
  onAddGuest, guestList, onRemoveGuest, attractions, selectedAttractions, onToggleAttraction, 
  onBack, onNext
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [manualGuestName, setManualGuestName] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onPartyFileSelect(e.target.files[0]);
    }
  };

  const handleAddManualGuest = () => {
    if (manualGuestName.trim().length > 0) {
        onAddGuest(manualGuestName.trim());
        setManualGuestName('');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 w-full max-w-2xl mx-auto space-y-10 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-500 uppercase">Data przyjęcia</label>
          <input type="date" value={partyDate} onChange={e => onDateChange(e.target.value)} className="w-full p-4 rounded-2xl bg-white border-2 border-slate-100 focus:outline-none font-medium" />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-500 uppercase">Zdjęcie z sali zabaw</label>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          <div 
            className={`h-full min-h-[56px] rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 cursor-pointer transition-all ${partyFile ? 'bg-green-50 border-green-300' : 'bg-white/50 border-slate-200 hover:border-blue-400'}`}
            onClick={() => fileInputRef.current?.click()}
          >
            {partyFile ? <span className="text-green-600 font-bold text-sm flex items-center gap-1"><CheckCircle2 size={16}/> {partyFile.name}</span> : <><Upload size={16} /> <span className="text-sm font-bold">Wgraj</span></>}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-sm font-bold text-slate-500 uppercase">Lista gości (Min. 3)</label>
        <div className="flex gap-2">
             <input 
                type="text" 
                placeholder="Wpisz imię gościa..." 
                value={manualGuestName}
                onChange={(e) => setManualGuestName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddManualGuest()}
                className="flex-1 p-4 rounded-2xl bg-white border-2 border-slate-100 focus:outline-none font-medium focus:border-blue-500"
             />
             <button 
                onClick={handleAddManualGuest}
                disabled={!manualGuestName.trim()}
                className="px-6 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 disabled:opacity-50 transition-colors"
             >
                DODAJ
             </button>
        </div>
        
        <div className="flex flex-wrap gap-2 min-h-[40px]">
          {guestList.map((guest, index) => (
            <span key={`${guest}-${index}`} className="px-4 py-2 bg-white rounded-full border border-slate-200 text-slate-700 font-bold flex items-center gap-2 shadow-sm animate-in fade-in zoom-in duration-200">
              {guest} 
              <button onClick={() => onRemoveGuest(index)}><Trash2 size={14} className="text-red-400 hover:text-red-600" /></button>
            </span>
          ))}
          {guestList.length === 0 && <span className="text-slate-400 text-sm italic py-2">Brak dodanych gości</span>}
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-sm font-bold text-slate-500 uppercase">Dodatkowe atrakcje</label>
        <div className="flex flex-wrap gap-2">
          {attractions.map(attr => (
            <button key={attr} onClick={() => onToggleAttraction(attr)} className={`px-5 py-3 rounded-2xl font-bold transition-all border-2 ${selectedAttractions.includes(attr) ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-600 shadow-sm'}`}>
              {attr}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4 pt-6">
        <button onClick={onBack} className="px-8 py-5 bg-white/50 text-slate-600 rounded-3xl font-bold">Wróć</button>
        <button onClick={onNext} disabled={guestList.length < 3 || !partyDate} className="flex-1 py-5 bg-slate-900 text-white rounded-3xl font-bold text-xl shadow-2xl disabled:opacity-50">
          Dalej
        </button>
      </div>
    </motion.div>
  );
};
