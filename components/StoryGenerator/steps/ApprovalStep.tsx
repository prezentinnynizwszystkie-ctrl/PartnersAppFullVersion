
import React, { useState, useMemo } from 'react';
import { GeneratorState, StoryBlock } from '../types';
import { 
  CheckCircle2, ArrowLeft, ArrowRight, Lock, Zap, FileText, Loader2, 
  ChevronDown, ChevronUp, Code, Database, Music, Clock, AlignLeft, Hash, Mic2 
} from 'lucide-react';

interface ApprovalStepProps {
  state: GeneratorState;
  onBack: () => void;
  onSave: () => Promise<boolean>;
  onNext?: () => void;
}

// Helper do generowania DSL (zaktualizowany o logikę [Slug])
const getScenarioDSL = (blocks: StoryBlock[]) => {
    let output = "";
    let episodeOpen = false;
    let chapterOpen = false;
    let bgOpen = false;

    const closeBg = () => { if(bgOpen) { output += "        End\n"; bgOpen = false; } };
    const closeChapter = () => { closeBg(); if(chapterOpen) { output += "    End\n"; chapterOpen = false; } };
    const closeEpisode = () => { closeChapter(); if(episodeOpen) { output += "End\n"; episodeOpen = false; } };

    blocks.forEach(block => {
        if (block.type === 'EPISODE') {
            closeEpisode();
            output += `Episode:\n`;
            episodeOpen = true;
        } else if (block.type === 'CHAPTER') {
            closeChapter();
            output += `    Chapter: ${block.content}\n`;
            chapterOpen = true;
        } else if (block.type === 'BACKGROUND') {
            closeBg();
            const fadeIn = block.metadata?.fadeIn || '00:00:01';
            output += `        BackgroundSampleLine: Code=${block.content}, FadeIn=${fadeIn}, FadeOut=00:00:02\n`;
            bgOpen = true;
        } else if (block.type === 'PAUSE') {
            const dur = block.metadata?.duration || 2;
            output += `            PauseLine: 00:00:0${dur}\n`;
        } else if (block.type === 'LINE') {
            const rawCode = block.code ? block.code.trim() : '';
            // FIX: Dodawanie suffixu [Slug] jeśli linia jest PartnerSpecific
            const finalCode = block.isPartnerSpecific ? `${rawCode}[Slug]` : rawCode;

            if (rawCode.toUpperCase().startsWith('Z')) {
                output += `            DynamicSampleLine: Code=${finalCode}\n`;
            } else if (rawCode) {
                output += `            SampleLine: Code=${finalCode}\n`;
            }
        }
    });
    closeEpisode();
    return output;
};

// Helper do generowania DynamicLines JSON (zaktualizowany o ElevenID i czyszczenie UUID)
const getDynamicJSON = (state: GeneratorState) => {
    const dynamicLinesPayload: Record<string, any> = {};
    
    state.blocks.forEach(block => {
        if (block.type === 'LINE' && block.code?.toUpperCase().startsWith('Z')) {
            // Znajdź lektora i pobierz jego ElevenID zamiast wewnętrznego ID
            const lectorObj = state.lectors.find(l => l.id === block.lectorId);
            const lectorName = lectorObj?.name || 'Nieznany';
            const elevenId = lectorObj?.elevenId || '';

            // Pobierz warianty tekstu
            const variants = block.contentVariants || { boy: block.content, girl: block.content };

            dynamicLinesPayload[block.code as string] = {
                isUniversal: block.isGenderUniversal || false,
                boy: variants.boy,
                girl: variants.girl,
                lector: lectorName,
                // FIX: Używamy elevenId, a nie wewnętrznego UUID
                elevenId: elevenId
            };
        }
    });
    return dynamicLinesPayload;
};

export const ApprovalStep: React.FC<ApprovalStepProps> = ({ state, onBack, onSave, onNext }) => {
  
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Stan zwijania sekcji
  const [expanded, setExpanded] = useState({
      static: false,
      dynamic: false,
      jsonScenario: false,
      jsonDynamic: false,
      fullScript: true // Domyślnie otwarty pełny scenariusz
  });

  const toggle = (key: keyof typeof expanded) => {
      setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Filtrowanie linii
  const staticLines = useMemo(() => state.blocks.filter(b => 
    b.type === 'LINE' && b.code?.trim().toUpperCase().startsWith('S')
  ), [state.blocks]);

  const dynamicLines = useMemo(() => state.blocks.filter(b => 
    b.type === 'LINE' && b.code?.trim().toUpperCase().startsWith('Z')
  ), [state.blocks]);

  // Generowanie podglądów
  const previewScenarioDSL = useMemo(() => getScenarioDSL(state.blocks), [state.blocks]);
  const previewDynamicJSON = useMemo(() => getDynamicJSON(state), [state.blocks]);

  const defaultLectorId = state.lectors[0]?.id;

  // AUTO-SAVE AND CONTINUE LOGIC
  const handleAutoSaveAndProceed = async () => {
      if (!onNext) return;
      
      setIsAutoSaving(true);
      try {
          // Wywołaj zapis do bazy
          const success = await onSave();
          
          // Jeśli zapis się udał, przejdź dalej
          if (success) {
              onNext();
          }
      } catch (e) {
          console.error("Auto-save failed", e);
      } finally {
          setIsAutoSaving(false);
      }
  };

  // Komponent sekcji
  const Section = ({ title, icon: Icon, isOpen, onToggle, colorClass, children, badgeCount }: any) => (
      <div className={`bg-white rounded-2xl shadow-sm border ${isOpen ? 'border-slate-300 ring-2 ring-slate-100' : 'border-slate-200'} transition-all overflow-hidden`}>
          <button 
            onClick={onToggle}
            className={`w-full flex items-center justify-between p-4 ${colorClass} ${isOpen ? 'border-b border-slate-100' : ''} transition-colors`}
          >
              <div className="flex items-center gap-3">
                  <Icon size={18} />
                  <span className="font-bold text-sm uppercase tracking-wide">{title}</span>
                  {badgeCount !== undefined && (
                      <span className="ml-2 px-2 py-0.5 bg-white/50 rounded text-xs font-black">{badgeCount}</span>
                  )}
              </div>
              {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {isOpen && (
              <div className="p-4 bg-white overflow-x-auto">
                  {children}
              </div>
          )}
      </div>
  );

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto space-y-6 pb-20">
      
      {/* Header Podsumowania i Przyciski */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 sticky top-0 z-20 flex justify-between items-center">
        <div className="flex items-center gap-4">
            <button 
                onClick={onBack}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm text-sm"
            >
                <ArrowLeft size={16} /> Wróć
            </button>
            <div className="hidden md:flex flex-col">
                <h2 className="text-lg font-black text-slate-900 leading-none">{state.title || "Nowa Bajka"}</h2>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-1">
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold uppercase">{state.ageGroup} lat</span>
                    <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-bold uppercase">{state.gender}</span>
                </div>
            </div>
        </div>

        <div className="flex gap-3">
            {/* Przycisk manualnego zapisu (zostawiamy dla pewności, ale "Next" jest ważniejszy) */}
            <button 
                onClick={() => onSave()}
                disabled={state.isSaving || isAutoSaving}
                className="px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-70"
            >
                {state.isSaving ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                Zapisz
            </button>
            
            {onNext && (
                <button 
                    onClick={handleAutoSaveAndProceed}
                    disabled={isAutoSaving || state.isSaving}
                    className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-md disabled:opacity-70"
                >
                    {isAutoSaving ? <Loader2 className="animate-spin" size={16} /> : null}
                    {isAutoSaving ? 'Zapisuję...' : 'Przejdź do Produkcji'} <ArrowRight size={16} />
                </button>
            )}
        </div>
      </div>

      {/* GRID 2 KOLUMNY: Listy i JSONy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* 1. LINIE STAŁE */}
          <Section 
            title="Linie Stałe (Static)" 
            icon={Lock} 
            isOpen={expanded.static} 
            onToggle={() => toggle('static')}
            colorClass="bg-slate-50 text-slate-700"
            badgeCount={staticLines.length}
          >
              <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {staticLines.map((block) => (
                    <div key={block.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm">
                        <div className="flex justify-between mb-1">
                            <span className="font-black text-slate-500 text-xs">
                                {block.code}
                                {block.isPartnerSpecific && <span className="ml-2 text-[9px] text-indigo-500 bg-indigo-50 px-1 rounded">PARTNER</span>}
                            </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed font-medium">{block.content}</p>
                    </div>
                ))}
                {staticLines.length === 0 && <p className="text-slate-400 text-sm italic">Brak linii stałych.</p>}
              </div>
          </Section>

          {/* 2. LINIE DYNAMICZNE */}
          <Section 
            title="Linie Dynamiczne (Variables)" 
            icon={Zap} 
            isOpen={expanded.dynamic} 
            onToggle={() => toggle('dynamic')}
            colorClass="bg-amber-50 text-amber-700"
            badgeCount={dynamicLines.length}
          >
              <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {dynamicLines.map((block) => (
                    <div key={block.id} className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 text-sm">
                        <div className="flex justify-between mb-1">
                            <span className="font-black text-amber-600 text-xs">
                                {block.code}
                                {block.isPartnerSpecific && <span className="ml-2 text-[9px] text-indigo-600 bg-white/50 px-1 rounded">PARTNER</span>}
                            </span>
                        </div>
                        <p className="text-slate-800 leading-relaxed font-bold">{block.content}</p>
                    </div>
                ))}
                {dynamicLines.length === 0 && <p className="text-slate-400 text-sm italic">Brak linii dynamicznych.</p>}
              </div>
          </Section>

          {/* 3. PODGLĄD SCENARIUSZA (DSL) */}
          <Section 
            title="Database: Scenario (DSL)" 
            icon={Database} 
            isOpen={expanded.jsonScenario} 
            onToggle={() => toggle('jsonScenario')}
            colorClass="bg-blue-50 text-blue-700"
          >
              <pre className="text-[10px] font-mono bg-slate-900 text-slate-300 p-4 rounded-xl overflow-x-auto custom-scrollbar">
                  {previewScenarioDSL}
              </pre>
          </Section>

          {/* 4. PODGLĄD DYNAMIC LINES (JSON) */}
          <Section 
            title="Database: DynamicLines (JSON)" 
            icon={Code} 
            isOpen={expanded.jsonDynamic} 
            onToggle={() => toggle('jsonDynamic')}
            colorClass="bg-emerald-50 text-emerald-700"
          >
              <pre className="text-[10px] font-mono bg-slate-900 text-emerald-400 p-4 rounded-xl overflow-x-auto custom-scrollbar">
                  {JSON.stringify(previewDynamicJSON, null, 2)}
              </pre>
          </Section>

      </div>

      {/* 5. PEŁNY SCENARIUSZ (Full Width) */}
      <Section 
        title="Pełny Scenariusz (Timeline)" 
        icon={FileText} 
        isOpen={expanded.fullScript} 
        onToggle={() => toggle('fullScript')}
        colorClass="bg-indigo-50 text-indigo-800 border-indigo-100"
        badgeCount={state.blocks.length}
      >
          <div className="space-y-3">
              {state.blocks.map((block) => {
                  const isCustomLector = block.lectorId && block.lectorId !== defaultLectorId;
                  const lectorName = state.lectors.find(l => l.id === block.lectorId)?.name;

                  // Różne style dla różnych typów bloków
                  if (block.type === 'EPISODE') return (
                      <div key={block.id} className="flex items-center gap-4 py-4 border-b-2 border-indigo-100 mt-4">
                          <Hash className="text-indigo-400" size={24} />
                          <h3 className="text-xl font-black text-indigo-900 uppercase tracking-widest">{block.content}</h3>
                      </div>
                  );

                  if (block.type === 'CHAPTER') return (
                      <div key={block.id} className="flex items-center gap-3 py-2 mt-2 pl-4">
                          <AlignLeft className="text-blue-400" size={18} />
                          <h4 className="text-lg font-bold text-blue-800">{block.content}</h4>
                      </div>
                  );

                  if (block.type === 'BACKGROUND') return (
                      <div key={block.id} className="flex items-center gap-3 p-3 bg-pink-50 rounded-xl border border-pink-100 ml-8 max-w-fit">
                          <Music className="text-pink-500" size={16} />
                          <span className="text-sm font-bold text-pink-700">{block.content}</span>
                          {block.metadata?.fadeIn && <span className="text-xs font-mono bg-white px-2 rounded text-pink-400 border border-pink-100">FadeIn: {block.metadata.fadeIn}</span>}
                      </div>
                  );

                  if (block.type === 'PAUSE') return (
                      <div key={block.id} className="flex items-center gap-3 p-2 bg-amber-50 rounded-lg border border-amber-100 ml-8 w-fit border-dashed">
                          <Clock className="text-amber-500" size={14} />
                          <span className="text-xs font-bold text-amber-700">Pauza ({block.metadata?.duration}s)</span>
                      </div>
                  );

                  // LINE (Dialog)
                  return (
                      <div key={block.id} className={`p-4 rounded-xl border ml-8 flex flex-col gap-2 ${block.code?.startsWith('Z') ? 'bg-amber-50/30 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                  {block.code && <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-white px-1.5 rounded border border-slate-100">{block.code}</span>}
                                  {block.isPartnerSpecific && <span className="text-[9px] font-bold text-white bg-indigo-400 px-1.5 py-0.5 rounded">PARTNER</span>}
                                  {isCustomLector && (
                                      <span className="flex items-center gap-1 text-[10px] font-bold text-white bg-indigo-500 px-2 py-0.5 rounded-full shadow-sm">
                                          <Mic2 size={10} /> {lectorName}
                                      </span>
                                  )}
                              </div>
                          </div>
                          <p className={`text-sm leading-relaxed ${block.code?.startsWith('Z') ? 'font-bold text-amber-900' : 'text-slate-700'}`}>
                              {block.content}
                          </p>
                      </div>
                  );
              })}
          </div>
      </Section>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};
