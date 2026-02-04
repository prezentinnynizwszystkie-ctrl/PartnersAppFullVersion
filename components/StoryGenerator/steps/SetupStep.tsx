
import React from 'react';
import { GeneratorState, StoryLector, AgeGroupOption } from '../types';
import { Plus, Trash2, Mic2, FileText, Image as ImageIcon, Users, PersonStanding } from 'lucide-react';

interface SetupStepProps {
  state: GeneratorState;
  updateState: (updates: Partial<GeneratorState>) => void;
}

export const SetupStep: React.FC<SetupStepProps> = ({ state, updateState }) => {
  
  // --- Handlers ---

  const handleLectorAdd = () => {
    const newLector: StoryLector = {
      id: crypto.randomUUID(),
      name: '',
      elevenId: ''
    };
    updateState({ lectors: [...state.lectors, newLector] });
  };

  const handleLectorRemove = (id: string) => {
    if (state.lectors.length <= 1) return; // Zawsze musi być min. 1 lektor
    updateState({ lectors: state.lectors.filter(l => l.id !== id) });
  };

  const handleLectorChange = (id: string, field: keyof StoryLector, value: string) => {
    const updatedLectors = state.lectors.map(l => 
      l.id === id ? { ...l, [field]: value } : l
    );
    updateState({ lectors: updatedLectors });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
      
      {/* LEWA KOLUMNA: Metadane i Lektorzy (4/12) */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Karta: Informacje Podstawowe */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 uppercase text-xs tracking-widest">
                <FileText size={16} className="text-indigo-600" /> Dane Bajki
            </h3>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tytuł Bajki</label>
                    <input 
                        type="text" 
                        value={state.title}
                        onChange={(e) => updateState({ title: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                        placeholder="np. Podwodna Przygoda"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Grupa Wiekowa</label>
                        <select 
                            value={state.ageGroup}
                            onChange={(e) => updateState({ ageGroup: e.target.value })}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                        >
                            <option value="3-5">3-5 lat</option>
                            <option value="6-8">6-8 lat</option>
                            <option value="9-12">9-12 lat</option>
                            <option value="13+">13+ lat</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Płeć (Info)</label>
                        <select 
                            value={state.gender}
                            onChange={(e: any) => updateState({ gender: e.target.value })}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                        >
                            <option value="Chłopiec">Chłopiec</option>
                            <option value="Dziewczynka">Dziewczynka</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Opis (Krótki)</label>
                    <textarea 
                        value={state.description}
                        onChange={(e) => updateState({ description: e.target.value })}
                        rows={3}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white resize-none"
                        placeholder="O czym jest ta historia..."
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Okładka (URL)</label>
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                type="text" 
                                value={state.coverUrl}
                                onChange={(e) => updateState({ coverUrl: e.target.value })}
                                className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-500"
                                placeholder="https://..."
                            />
                        </div>
                        {state.coverUrl && (
                            <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                                <img src={state.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Karta: Lektorzy */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 uppercase text-xs tracking-widest">
                    <Users size={16} className="text-indigo-600" /> Obsada (Lektorzy)
                </h3>
                <button 
                    onClick={handleLectorAdd}
                    className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                    title="Dodaj lektora"
                >
                    <Plus size={16} />
                </button>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {state.lectors.map((lector, index) => (
                    <div key={lector.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-indigo-200 transition-colors">
                        <div className="flex gap-2 mb-2">
                            <input 
                                type="text" 
                                value={lector.name}
                                onChange={(e) => handleLectorChange(lector.id, 'name', e.target.value)}
                                placeholder="Rola (np. Narrator)"
                                className="flex-1 bg-white px-2 py-1.5 rounded-lg text-xs font-bold border border-slate-200 focus:border-indigo-500 focus:outline-none"
                            />
                            {state.lectors.length > 1 && (
                                <button 
                                    onClick={() => handleLectorRemove(lector.id)}
                                    className="text-slate-400 hover:text-red-500 p-1"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                        <div className="relative">
                            <Mic2 className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-300" size={12} />
                            <input 
                                type="text" 
                                value={lector.elevenId}
                                onChange={(e) => handleLectorChange(lector.id, 'elevenId', e.target.value)}
                                placeholder="ElevenLabs ID (np. 21m00T...)"
                                className="w-full pl-7 pr-2 py-1.5 bg-white rounded-lg text-[10px] font-mono border border-slate-200 focus:border-indigo-500 focus:outline-none text-slate-600"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>

      {/* PRAWA KOLUMNA: Edytor Scenariusza (8/12) */}
      <div className="lg:col-span-8 flex flex-col h-full min-h-[600px]">
         <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
            
            {/* Toolbar */}
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest flex items-center gap-2">
                    <FileText size={16} className="text-indigo-600" /> Edytor Scenariusza
                </h3>
                <div className="text-[10px] font-medium text-slate-400 bg-white px-2 py-1 rounded border border-slate-200">
                    Wklej tekst podzielony na bloki. Używaj kodów S1, Z1, itd.
                </div>
            </div>

            {/* Textarea */}
            <div className="flex-1 relative">
                <textarea 
                    value={state.rawScript}
                    onChange={(e) => updateState({ rawScript: e.target.value })}
                    className="w-full h-full p-6 text-sm md:text-base font-mono leading-relaxed text-slate-700 resize-none focus:outline-none"
                    placeholder={`Wklej tutaj swój scenariusz...

Przykład formatu:

Episode: Podwodna Przygoda
  Chapter: Wstęp
    Background_Intro: 00:00:02
    
    Narrator (S1): Dawno dawno temu...
    Bohater (Z1): Cześć, jestem [Imie]!
`}
                    spellCheck={false}
                />
            </div>

            {/* Footer Statystyk */}
            <div className="bg-slate-50 px-6 py-2 border-t border-slate-200 flex justify-between text-[10px] text-slate-500 font-medium uppercase tracking-wide">
                <span>Liczba znaków: {state.rawScript.length}</span>
                <span>Linii: {state.rawScript.split('\n').length}</span>
            </div>
         </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};
