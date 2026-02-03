
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeneratorState, StoryLector, StoryBlock } from './types';
import { SetupStep } from './steps/SetupStep';
import { ProcessingStep } from './steps/ProcessingStep';
import { ApprovalStep } from './steps/ApprovalStep';
import { ProductionStep } from './steps/ProductionStep';
import { Wand2, ChevronRight, Loader2, List, Trash2, Edit, Copy, Plus, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// FIX: Correct relative path depth (2 levels up)
import { supabase } from '../../utils/supabaseClient';
import { parseScriptToBlocks, generateScenarioOutput } from './utils';

const StoryGenerator: React.FC = () => {
  const navigate = useNavigate();
  
  const [viewMode, setViewMode] = useState<'LIST' | 'WIZARD'>('LIST');
  const [stories, setStories] = useState<any[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  const [deleteCandidateId, setDeleteCandidateId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const [state, setState] = useState<GeneratorState>({
    dbId: null, 
    title: '',
    ageGroup: '3-5',
    gender: 'Chłopiec', // Changed from Uniwersalna
    description: '',
    coverUrl: '',
    rawScript: '',
    lectors: [{ id: '1', name: 'Narrator', elevenId: '' }],
    blocks: [],
    currentStep: 1,
    isSaving: false,
  });

  const updateState = (updates: Partial<GeneratorState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const showToast = (message: string, type: 'success' | 'error') => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 4000);
  };

  const fetchStories = async () => {
      setIsLoadingList(true);
      try {
          const { data, error } = await supabase
            .schema('PartnersApp')
            .from('Stories')
            .select('*')
            .order('Id', { ascending: false });
          
          if (error) throw error;
          setStories(data || []);
      } catch (err) {
          console.error("Błąd pobierania bajek:", err);
          showToast("Nie udało się pobrać listy bajek.", 'error');
      } finally {
          setIsLoadingList(false);
      }
  };

  useEffect(() => {
      if (viewMode === 'LIST') {
          fetchStories();
      }
  }, [viewMode]);

  const handleStartNew = () => {
      setState({
        dbId: null,
        title: '',
        ageGroup: '3-5',
        gender: 'Chłopiec',
        description: '',
        coverUrl: '',
        rawScript: '',
        lectors: [{ id: '1', name: 'Narrator', elevenId: '' }],
        blocks: [],
        currentStep: 1,
        isSaving: false,
      });
      setViewMode('WIZARD');
  };

  // Shared helper to load story data from DB into state
  const loadStoryToState = (story: any) => {
      const storyId = story.Id || story.id;
      const schemaDSL = story.Schema || ''; 
      const scenarioJSON = story.Scenario || {};
      const lectors = (story.Lektorzy as StoryLector[]) || [{ id: '1', name: 'Narrator', elevenId: '' }];
      
      // 1. Parsowanie schematu (DSL) na bloki strukturalne
      let blocks = parseScriptToBlocks(schemaDSL || (typeof story.Scenario === 'string' ? story.Scenario : ''), lectors);

      // 2. Uzupełnienie bloków o treść i metadane z JSON-a
      blocks = blocks.map(block => {
          if (block.type === 'LINE' && block.code && scenarioJSON[block.code]) {
              const data = scenarioJSON[block.code];
              
              const loadedContent = data.content?.boy || (typeof data.content === 'string' ? data.content : block.content);

              return {
                  ...block,
                  content: loadedContent, 
                  isPartnerSpecific: data.isPartnerSpecific || false,
                  isGenderUniversal: data.isGenderUniversal || false,
                  contentVariants: data.content || undefined, 
                  imageUrls: data.imageUrls || undefined,
                  overrides: data.overrides || undefined,
                  imageOverrides: data.imageOverrides || undefined,
                  lectorId: data.lectorId || block.lectorId 
              };
          }
          return block;
      });

      // 3. Rekonstrukcja czytelnego scenariusza (Human Readable)
      const reconstructedScript = generateScenarioOutput(blocks, lectors);

      return {
          dbId: storyId,
          title: story.StoryTitle,
          ageGroup: story.AgeGroup || '3-5',
          gender: story.Gender || 'Chłopiec',
          description: story.StoryDescription || '',
          coverUrl: story.CoverUrl || '',
          rawScript: reconstructedScript,
          lectors: lectors,
          blocks: blocks,
          isSaving: false
      };
  }

  const handleEdit = (story: any) => {
      const loadedData = loadStoryToState(story);
      setState({
          ...loadedData,
          currentStep: 1
      });
      setViewMode('WIZARD');
  };

  const handleProduction = (story: any) => {
      const loadedData = loadStoryToState(story);
      setState({
          ...loadedData,
          currentStep: 4
      });
      setViewMode('WIZARD');
  };

  const handleDuplicate = (story: any) => {
      const loadedData = loadStoryToState(story);
      setState({
          ...loadedData,
          dbId: null,
          title: `${loadedData.title} (Kopia)`,
          currentStep: 1
      });
      setViewMode('WIZARD');
  };

  const confirmDelete = (id: number) => {
      setDeleteCandidateId(id);
  };

  const executeDelete = async () => {
      if (!deleteCandidateId) return;
      try {
          const { error, count } = await supabase
            .schema('PartnersApp')
            .from('Stories')
            .delete({ count: 'exact' })
            .eq('Id', deleteCandidateId);

          if (error) throw error;
          showToast("Bajka została usunięta.", 'success');
          fetchStories(); 
      } catch (err: any) {
          console.error("Błąd usuwania:", err);
          showToast("Wystąpił błąd podczas usuwania.", 'error');
      } finally {
          setDeleteCandidateId(null);
      }
  };

  const handleNextStep = () => {
    if (state.currentStep === 1) {
      if (!state.title || !state.rawScript) {
        showToast("Uzupełnij tytuł i treść scenariusza.", 'error');
        return;
      }
      updateState({ currentStep: 2 });
    } else if (state.currentStep === 2) {
      updateState({ currentStep: 3 });
    } else if (state.currentStep === 3) {
      updateState({ currentStep: 4 });
    }
  };

  const generateSchemaDSL = () => {
      let output = "";
      let episodeOpen = false;
      let chapterOpen = false;
      let bgOpen = false;

      const closeBg = () => { if(bgOpen) { output += "        End\n"; bgOpen = false; } };
      const closeChapter = () => { closeBg(); if(chapterOpen) { output += "    End\n"; chapterOpen = false; } };
      const closeEpisode = () => { closeChapter(); if(episodeOpen) { output += "End\n"; episodeOpen = false; } };

      state.blocks.forEach(block => {
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
              const code = block.code ? block.code.trim() : '';
              if (code.toUpperCase().startsWith('Z')) {
                  output += `            DynamicSampleLine: Code=${code}\n`;
              } else {
                  if (code) {
                      output += `            SampleLine: Code=${code}\n`;
                  }
              }
          }
      });
      closeEpisode();
      return output;
  };

  const generateScenarioJSON = () => {
      const scenarioMap: Record<string, any> = {};
      state.blocks.forEach(block => {
          if (block.type === 'LINE' && block.code) {
              const key = block.code.trim();
              scenarioMap[key] = {
                  isPartnerSpecific: block.isPartnerSpecific || false,
                  isGenderUniversal: block.isGenderUniversal || false, 
                  content: block.contentVariants || { 
                      boy: block.content, 
                      girl: block.content 
                  },
                  imageUrls: block.imageUrls || {},
                  overrides: block.overrides || {},
                  imageOverrides: block.imageOverrides || {},
                  lectorId: block.lectorId 
              };
          }
      });
      return scenarioMap;
  };

  const handleSaveToSystem = async (): Promise<boolean> => {
      if (!state.title) {
          showToast("Brak tytułu!", 'error');
          return false;
      }

      updateState({ isSaving: true });
      
      try {
          const dynamicLinesPayload: Record<string, any> = {};
          const defaultLectorId = state.lectors[0]?.id;

          state.blocks.forEach(block => {
              if (block.type === 'LINE' && block.code?.toUpperCase().startsWith('Z')) {
                  const lectorObj = state.lectors.find(l => l.id === block.lectorId);
                  const lectorName = lectorObj?.name || 'Nieznany';
                  const elevenId = lectorObj?.elevenId || ''; 

                  const variants = block.contentVariants || { boy: block.content, girl: block.content };

                  dynamicLinesPayload[block.code as string] = {
                      isUniversal: block.isGenderUniversal || false,
                      boy: variants.boy,
                      girl: variants.girl,
                      lector: lectorName,
                      lectorId: block.lectorId,
                      elevenId: elevenId
                  };
              }
          });

          const schemaText = generateSchemaDSL();
          const scenarioJSON = generateScenarioJSON();

          const dbPayload = {
              StoryTitle: state.title,
              AgeGroup: state.ageGroup,
              Gender: state.gender, 
              StoryDescription: state.description,
              CoverUrl: state.coverUrl,
              StoryHeroUrl: state.coverUrl,
              Lektorzy: state.lectors,
              Schema: schemaText,      
              Scenario: scenarioJSON, 
              DynamicLines: dynamicLinesPayload
          };

          let newDbId = state.dbId;

          if (state.dbId) {
              const res = await supabase.schema('PartnersApp').from('Stories').update(dbPayload).eq('Id', state.dbId).select();
              if (res.error) throw res.error;
          } else {
              const res = await supabase.schema('PartnersApp').from('Stories').insert(dbPayload).select();
              if (res.error) throw res.error;
              if (res.data) newDbId = res.data[0].Id;
          }

          showToast("Zapisano pomyślnie! Baza zaktualizowana.", 'success');
          
          updateState({ 
              isSaving: false,
              dbId: newDbId,
          });
          return true; // SUCCESS

      } catch (err: any) {
          console.error("Błąd zapisu:", err);
          showToast(`Błąd zapisu: ${err.message}`, 'error');
          updateState({ isSaving: false });
          return false; // FAILURE
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col relative">
      <AnimatePresence>
          {toast && (
              <motion.div 
                  initial={{ opacity: 0, y: 50, x: '-50%' }}
                  animate={{ opacity: 1, y: 0, x: '-50%' }}
                  exit={{ opacity: 0, y: 50, x: '-50%' }}
                  className={`fixed bottom-8 left-1/2 z-[110] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 font-bold text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
              >
                  {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                  {toast.message}
              </motion.div>
          )}
      </AnimatePresence>

      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
            <Wand2 size={20} />
          </div>
          <div>
            <h1 className="text-xl font-display font-black text-slate-900 leading-none">Story Generator</h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">MultiBajka CMS v2.0</p>
          </div>
        </div>

        {viewMode === 'WIZARD' && (
            <div className="hidden md:flex items-center gap-2 bg-slate-100 p-1.5 rounded-lg">
                <div className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${state.currentStep === 1 ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>1. Konfiguracja</div>
                <ChevronRight size={14} className="text-slate-300" />
                <div className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${state.currentStep === 2 ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>2. Montaż</div>
                <ChevronRight size={14} className="text-slate-300" />
                <div className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${state.currentStep === 3 ? 'bg-white shadow-sm text-green-600' : 'text-slate-400'}`}>3. Zatwierdzenie</div>
                <ChevronRight size={14} className="text-slate-300" />
                <div className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${state.currentStep === 4 ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>4. Produkcja</div>
            </div>
        )}

        <div className="flex items-center gap-3">
            <button onClick={() => navigate('/hub')} className="text-sm font-bold text-slate-500 hover:text-slate-800 px-4 py-2">
                Wyjdź
            </button>
            
            {viewMode === 'WIZARD' && state.currentStep < 4 && (
                <button onClick={handleNextStep} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center gap-2">
                    {state.currentStep === 3 ? 'Przejdź do Produkcji' : 'Dalej'} <ChevronRight size={16} />
                </button>
            )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-8 h-[calc(100vh-80px)] overflow-hidden">
        
        {viewMode === 'LIST' && (
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2">
                <div className="flex justify-between items-center mb-8">
                    <div><h2 className="text-3xl font-black text-slate-900 mb-1">Baza Bajek</h2></div>
                    <button onClick={handleStartNew} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg"><Plus size={20} /> GENERUJ BAJKĘ</button>
                </div>
                <div className="flex-1 overflow-auto bg-white rounded-[2rem] border border-slate-200 shadow-sm relative">
                    {isLoadingList ? <div className="p-10 text-center"><Loader2 className="animate-spin inline" /></div> : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                                <tr>
                                    <th className="p-6 text-xs font-black text-slate-400 uppercase">ID</th>
                                    <th className="p-6 text-xs font-black text-slate-400 uppercase">Tytuł</th>
                                    <th className="p-6 text-xs font-black text-slate-400 uppercase text-right">Akcje</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {stories.map((story) => (
                                    <tr key={story.Id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-6 font-bold text-slate-400">#{story.Id}</td>
                                        <td className="p-6 font-bold text-slate-900">{story.StoryTitle}</td>
                                        <td className="p-6 text-right">
                                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100">
                                                <button onClick={() => handleEdit(story)} title="Edytuj Pierwotną Wersję" className="p-2 hover:bg-blue-50 text-blue-600 rounded bg-white shadow-sm border border-slate-100 transition-all active:scale-95"><Edit size={16}/></button>
                                                <button onClick={() => handleProduction(story)} title="PRODUKCJA" className="px-3 py-2 hover:bg-indigo-50 text-indigo-600 rounded flex items-center gap-2 bg-white shadow-sm border border-slate-100 font-bold text-[10px] transition-all active:scale-95">
                                                    <Wand2 size={16}/> PRODUKCJA
                                                </button>
                                                <button onClick={() => confirmDelete(story.Id)} title="Usuń" className="p-2 hover:bg-red-50 text-red-600 rounded bg-white shadow-sm border border-slate-100 transition-all active:scale-95"><Trash2 size={16}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                
                <AnimatePresence>
                  {deleteCandidateId && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Trash2 size={32} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">Czy na pewno usunąć?</h3>
                        <p className="text-slate-500 mb-8">Tej operacji nie można cofnąć.</p>
                        <div className="grid grid-cols-2 gap-3">
                          <button onClick={() => setDeleteCandidateId(null)} className="py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200">Anuluj</button>
                          <button onClick={executeDelete} className="py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700">Tak, usuń</button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
            </div>
        )}

        {viewMode === 'WIZARD' && (
            <AnimatePresence mode="wait">
                {state.currentStep === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                        <SetupStep state={state} updateState={updateState} />
                    </motion.div>
                )}
                {state.currentStep === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                        <ProcessingStep 
                            state={state} 
                            updateState={updateState} 
                            onBack={() => updateState({ currentStep: 1 })}
                            onNext={() => updateState({ currentStep: 3 })}
                        />
                    </motion.div>
                )}
                {state.currentStep === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                        <ApprovalStep 
                            state={state} 
                            onBack={() => updateState({ currentStep: 2 })}
                            onSave={handleSaveToSystem}
                            onNext={() => updateState({ currentStep: 4 })}
                        />
                    </motion.div>
                )}
                {state.currentStep === 4 && (
                    <motion.div key="step4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                        <ProductionStep 
                            state={state}
                            onUpdateState={updateState}
                            onBack={() => setViewMode('LIST')}
                            onSave={handleSaveToSystem}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        )}
      </main>
    </div>
  );
};

export default StoryGenerator;
