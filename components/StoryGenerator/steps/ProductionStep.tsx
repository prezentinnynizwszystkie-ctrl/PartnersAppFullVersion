
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GeneratorState, StoryBlock } from '../types';
import { supabase } from '../../../utils/supabaseClient';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  ArrowLeft, User, Users, Globe, Save, Loader2, Building2, Lock, 
  CheckCircle2, ImagePlus, X, Image as ImageIcon, Sparkles, 
  Eye, BookOpen, Music, Clock, Mic2, LayoutList, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductionStepProps {
  state: GeneratorState;
  onUpdateState: (updates: Partial<GeneratorState>) => void;
  onBack: () => void;
  onSave?: () => Promise<boolean>;
}

export const ProductionStep: React.FC<ProductionStepProps> = ({ state, onUpdateState, onBack, onSave }) => {
  // --- STATE ---
  const [activeGender, setActiveGender] = useState<'boy' | 'girl'>('boy');
  const [partners, setPartners] = useState<any[]>([]);
  const [uploadingBlockId, setUploadingBlockId] = useState<string | null>(null);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  
  // Tryb edycji partnera: 'default' = Baza, 'slug' = konkretny partner
  const [editingPartnerSlug, setEditingPartnerSlug] = useState<string>('default');

  useEffect(() => {
      const fetchPartners = async () => {
          const { data } = await supabase.schema('PartnersApp').from('Partners').select('PartnerName, Slug');
          if (data) setPartners(data);
      };
      fetchPartners();
  }, []);

  // --- FILTERS ---
  const dynamicBlocks = useMemo(() => state.blocks.filter(b => b.type === 'LINE' && b.code?.toUpperCase().startsWith('Z')), [state.blocks]);
  const staticBlocks = useMemo(() => state.blocks.filter(b => b.type === 'LINE' && b.code?.toUpperCase().startsWith('S') && !b.isPartnerSpecific), [state.blocks]);
  const partnerBlocks = useMemo(() => state.blocks.filter(b => b.type === 'LINE' && b.code?.toUpperCase().startsWith('S') && b.isPartnerSpecific), [state.blocks]);

  // --- UTILS ---
  const sanitize = (text: string) => {
    return text.toLowerCase()
        .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e')
        .replace(/ł/g, 'l').replace(/ń/g, 'n').replace(/ó/g, 'o')
        .replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z')
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
  };

  // --- AI CONVERSION LOGIC ---
  const handleAIConvert = async () => {
    const fromGender = activeGender;
    const toGender = activeGender === 'boy' ? 'girl' : 'boy';
    const confirmMessage = `Czy chcesz użyć AI (Gemini Pro 3) aby wygenerować wersję dla ${toGender === 'boy' ? 'Chłopca' : 'Dziewczynki'} na podstawie obecnych tekstów ${fromGender === 'boy' ? 'Chłopca' : 'Dziewczynki'}? To nadpisze obecne teksty w wariancie docelowym.`;
    
    if (!confirm(confirmMessage)) return;

    setIsAIProcessing(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const linesToConvert = state.blocks
            .filter(b => b.type === 'LINE' && !b.isGenderUniversal)
            .map(b => {
                const variants = b.contentVariants || { boy: b.content, girl: b.content };
                const overrides = b.overrides || {};
                
                let text = variants[fromGender];
                if (editingPartnerSlug !== 'default' && overrides[editingPartnerSlug]) {
                    text = overrides[editingPartnerSlug][fromGender];
                }

                return { id: b.id, text: text || b.content };
            });

        if (linesToConvert.length === 0) {
            alert("Brak linii wymagających zmiany płci.");
            return;
        }

        const systemInstruction = `Jesteś ekspertem korekty gramatyki polskiej. Otrzymasz listę linii scenariusza dla bohatera o imieniu [RecipientName]. 
        Twoim JEDYNYM zadaniem jest zmiana rodzaju gramatycznego z ${fromGender === 'boy' ? 'męskiego na żeński' : 'żeńskiego na męski'} (np. 'zrobił' -> 'zrobiła', 'był' -> 'była', 'zadowolony' -> 'zadowolona'). 
        ABSOLUTNY ZAKAZ zmieniania słownictwa, interpunkcji czy usuwania tagów takich jak [RecipientName], [KidAge], [Hobby], [BestFriend], [PositiveAttribute], [Guest1], [Guest2], [Guest3]. 
        Jeśli linia nie wymaga zmiany płci, zwróć ją w oryginale. Zwróć wynik jako JSON z listą obiektów {id, text}.`;

        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: JSON.stringify({ blocks: linesToConvert }),
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        convertedBlocks: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    text: { type: Type.STRING }
                                },
                                required: ["id", "text"]
                            }
                        }
                    }
                }
            }
        });

        const result = JSON.parse(response.text);
        const convertedMap: Record<string, string> = {};
        result.convertedBlocks.forEach((b: any) => {
            convertedMap[b.id] = b.text;
        });

        const updatedBlocks = state.blocks.map(block => {
            if (!convertedMap[block.id]) return block;

            const newText = convertedMap[block.id];
            const originalText = block.type === 'LINE' ? (editingPartnerSlug === 'default' ? (block.contentVariants?.[fromGender] || block.content) : (block.overrides?.[editingPartnerSlug]?.[fromGender] || block.content)) : '';

            const countPlaceholders = (t: string) => (t.match(/\[[^\]]+\]/g) || []).length;
            if (countPlaceholders(newText) !== countPlaceholders(originalText)) {
                console.warn(`AI usunęło placeholder w linii ${block.code}. Pomijam zmianę.`, { originalText, newText });
                return block;
            }

            if (editingPartnerSlug === 'default') {
                const variants = block.contentVariants || { boy: block.content, girl: block.content };
                return { ...block, contentVariants: { ...variants, [toGender]: newText } };
            } else {
                const overrides = block.overrides || {};
                const partnerOverrides = overrides[editingPartnerSlug] || { boy: block.contentVariants?.boy || block.content, girl: block.contentVariants?.girl || block.content };
                return { ...block, overrides: { ...overrides, [editingPartnerSlug]: { ...partnerOverrides, [toGender]: newText } } };
            }
        });

        onUpdateState({ blocks: updatedBlocks });
        showToast(`Konwersja na ${toGender === 'boy' ? 'Chłopca' : 'Dziewczynkę'} zakończona pomyślnie!`, 'success');

    } catch (err) {
        console.error("AI Conversion error:", err);
        alert("Błąd podczas konwersji AI. Sprawdź logi konsoli.");
    } finally {
        setIsAIProcessing(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    console.log(`[Toast] ${type}: ${message}`);
  };

  // --- HANDLERS ---
  const updateBlockText = (blockId: string, newText: string) => {
      const updatedBlocks = state.blocks.map(block => {
          if (block.id !== blockId) return block;
          const variants = block.contentVariants || { boy: block.content, girl: block.content };
          const overrides = block.overrides || {};

          if (editingPartnerSlug === 'default') {
              if (block.isGenderUniversal) {
                  return { ...block, contentVariants: { boy: newText, girl: newText } };
              } else {
                  return { ...block, contentVariants: { ...variants, [activeGender]: newText } };
              }
          } else {
              const partnerOverrides = overrides[editingPartnerSlug] || { boy: variants.boy, girl: variants.girl };
              if (block.isGenderUniversal) {
                  return { ...block, overrides: { ...overrides, [editingPartnerSlug]: { boy: newText, girl: newText } } };
              } else {
                  return { ...block, overrides: { ...overrides, [editingPartnerSlug]: { ...partnerOverrides, [activeGender]: newText } } };
              }
          }
      });
      onUpdateState({ blocks: updatedBlocks });
  };

  const handleImageUpload = async (blockId: string, file: File) => {
    const block = state.blocks.find(b => b.id === blockId);
    if (!block || !block.code) return;

    setUploadingBlockId(blockId);
    try {
        const titleSanitized = sanitize(state.title);
        const lineCodeSanitized = sanitize(block.code);
        const slugSanitized = editingPartnerSlug !== 'default' ? sanitize(editingPartnerSlug) : '';
        
        const filename = slugSanitized ? `${lineCodeSanitized}_${slugSanitized}.png` : `${lineCodeSanitized}.png`;
        
        const uploadToFolder = async (genderName: 'He' | 'She') => {
            const path = `Stories/${titleSanitized}/${genderName}/Images/${filename}`;
            const { error } = await supabase.storage.from('PartnersApp').upload(path, file, {
                upsert: true,
                contentType: 'image/png'
            });
            if (error) throw error;
            const { data } = supabase.storage.from('PartnersApp').getPublicUrl(path);
            return data.publicUrl;
        };

        let newUrlBoy = block.imageUrls?.boy;
        let newUrlGirl = block.imageUrls?.girl;

        if (block.isGenderUniversal) {
            const [urlHe, urlShe] = await Promise.all([uploadToFolder('He'), uploadToFolder('She')]);
            newUrlBoy = urlHe;
            newUrlGirl = urlShe;
        } else {
            const uploadedUrl = await uploadToFolder(activeGender === 'boy' ? 'He' : 'She');
            if (activeGender === 'boy') newUrlBoy = uploadedUrl;
            else newUrlGirl = uploadedUrl;
        }

        const updatedBlocks = state.blocks.map(b => {
            if (b.id !== blockId) return b;
            if (editingPartnerSlug === 'default') {
                return { ...b, imageUrls: { boy: newUrlBoy, girl: newUrlGirl } };
            } else {
                const currentImageOverrides = b.imageOverrides || {};
                const partnerImgs = currentImageOverrides[editingPartnerSlug] || {};
                const newPartnerImgs = block.isGenderUniversal 
                    ? { boy: newUrlBoy, girl: newUrlGirl }
                    : { ...partnerImgs, [activeGender]: activeGender === 'boy' ? newUrlBoy : newUrlGirl };
                return { ...b, imageOverrides: { ...currentImageOverrides, [editingPartnerSlug]: newPartnerImgs } };
            }
        });

        onUpdateState({ blocks: updatedBlocks });
    } catch (err) {
        console.error("Image upload failed:", err);
        alert("Błąd uploadu zdjęcia.");
    } finally {
        setUploadingBlockId(null);
    }
  };

  const handleRemoveImage = (blockId: string) => {
    const updatedBlocks = state.blocks.map(b => {
        if (b.id !== blockId) return b;
        if (editingPartnerSlug === 'default') {
            const currentImgs = b.imageUrls || {};
            return { ...b, imageUrls: b.isGenderUniversal ? {} : { ...currentImgs, [activeGender]: undefined } };
        } else {
            const currentImageOverrides = b.imageOverrides || {};
            const partnerImgs = currentImageOverrides[editingPartnerSlug] || {};
            if (b.isGenderUniversal) {
                const newOverrides = { ...currentImageOverrides };
                delete newOverrides[editingPartnerSlug];
                return { ...b, imageOverrides: newOverrides };
            } else {
                return { ...b, imageOverrides: { ...currentImageOverrides, [editingPartnerSlug]: { ...partnerImgs, [activeGender]: undefined } } };
            }
        }
    });
    onUpdateState({ blocks: updatedBlocks });
  };

  const getBlockValue = (block: StoryBlock) => {
      if (editingPartnerSlug !== 'default' && block.overrides?.[editingPartnerSlug]) {
          return block.overrides[editingPartnerSlug][activeGender];
      }
      if (block.contentVariants) return block.contentVariants[activeGender];
      return block.content;
  };

  const getBlockImageUrl = (block: StoryBlock) => {
      if (editingPartnerSlug !== 'default' && block.imageOverrides?.[editingPartnerSlug]) {
          return block.imageOverrides[editingPartnerSlug][activeGender];
      }
      return block.imageUrls?.[activeGender];
  };

  const LineEditor: React.FC<{ block: StoryBlock; bgColor: string; borderColor: string }> = ({ block, bgColor, borderColor }) => {
    const imageUrl = getBlockImageUrl(block);
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className={`${bgColor} p-4 rounded-xl border ${borderColor} shadow-sm relative group`}>
            <div className="flex justify-between mb-2 items-center">
                <div className="flex items-center gap-2">
                    <span className="font-black text-slate-800 text-xs">{block.code}</span>
                    {block.isGenderUniversal && (
                        <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                            <Lock size={10} /> Uniwersalna
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(block.id, e.target.files[0])} />
                    <button onClick={() => fileInputRef.current?.click()} className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
                        <ImagePlus size={14} />
                    </button>
                </div>
            </div>

            {imageUrl && (
                <div className="mb-3 relative w-full aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-100 group/img">
                    <img src={imageUrl} alt="Line view" className="w-full h-full object-cover" />
                    <button onClick={() => handleRemoveImage(block.id)} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-red-500">
                        <X size={12} />
                    </button>
                </div>
            )}

            {uploadingBlockId === block.id && (
                <div className="mb-3 w-full h-20 bg-slate-50 flex items-center justify-center rounded-lg border border-dashed border-slate-300">
                    <Loader2 className="animate-spin text-blue-500" />
                </div>
            )}

            <textarea 
                value={getBlockValue(block)}
                onChange={(e) => updateBlockText(block.id, e.target.value)}
                disabled={block.isGenderUniversal && editingPartnerSlug === 'default'} 
                className={`w-full bg-white border border-slate-200 rounded-lg p-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-500 min-h-[80px] ${block.isGenderUniversal ? 'opacity-70 cursor-not-allowed' : ''}`}
            />
        </div>
    );
  };

  // --- TIMELINE PREVIEW MODAL ---
  const TimelineModal = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
        <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-slate-50 w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-white"
        >
            {/* Modal Header */}
            <div className="p-8 bg-white border-b border-slate-100 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-display font-black text-slate-900 leading-none">Podgląd Osi Czasu</h2>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Bajka: {state.title}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex bg-slate-100 p-1 rounded-xl mr-4">
                        <button onClick={() => setActiveGender('boy')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${activeGender === 'boy' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}>Chłopiec</button>
                        <button onClick={() => setActiveGender('girl')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${activeGender === 'girl' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-400'}`}>Dziewczynka</button>
                    </div>
                    <button onClick={() => setShowTimeline(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                        <X size={28} />
                    </button>
                </div>
            </div>

            {/* Modal Content - Scrollable Timeline */}
            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                <div className="max-w-3xl mx-auto relative">
                    {/* Vertical Connecting Line */}
                    <div className="absolute left-6 top-0 bottom-0 w-1 bg-slate-200 rounded-full" />

                    <div className="space-y-12">
                        {state.blocks.map((block, idx) => {
                            const imageUrl = getBlockImageUrl(block);
                            const text = getBlockValue(block);

                            if (block.type === 'EPISODE') return (
                                <div key={block.id} className="relative z-10 flex items-center gap-8 group">
                                    <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-xl ring-4 ring-white">
                                        <LayoutList size={20} />
                                    </div>
                                    <h3 className="text-3xl font-black text-purple-900 uppercase tracking-tighter">{block.content}</h3>
                                </div>
                            );

                            if (block.type === 'CHAPTER') return (
                                <div key={block.id} className="relative z-10 flex items-center gap-8 group">
                                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg ring-4 ring-white">
                                        <ChevronRight size={24} />
                                    </div>
                                    <div className="bg-blue-600 text-white px-6 py-2 rounded-2xl shadow-md">
                                        <h4 className="text-lg font-black uppercase tracking-wide">{block.content}</h4>
                                    </div>
                                </div>
                            );

                            if (block.type === 'BACKGROUND') return (
                                <div key={block.id} className="relative z-10 flex items-center gap-8 pl-4">
                                    <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 ring-4 ring-slate-50">
                                        <Music size={14} />
                                    </div>
                                    <div className="flex items-center gap-2 bg-pink-50 border border-pink-100 px-4 py-1.5 rounded-full">
                                        <span className="text-[10px] font-black uppercase text-pink-400">Audio:</span>
                                        <span className="text-xs font-bold text-pink-700">{block.content}</span>
                                        {block.metadata?.fadeIn && <span className="ml-2 text-[9px] font-mono text-pink-300">Fade: {block.metadata.fadeIn}</span>}
                                    </div>
                                </div>
                            );

                            if (block.type === 'PAUSE') return (
                                <div key={block.id} className="relative z-10 flex items-center gap-8 pl-4">
                                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 ring-4 ring-slate-50">
                                        <Clock size={14} />
                                    </div>
                                    <div className="bg-amber-50 border border-amber-100 border-dashed px-4 py-1.5 rounded-full text-xs font-bold text-amber-700">
                                        Cisza {block.metadata?.duration}s
                                    </div>
                                </div>
                            );

                            // LINE
                            return (
                                <div key={block.id} className="relative z-10 flex gap-8">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md ring-4 ring-white shrink-0 ${block.code?.startsWith('Z') ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                                        {block.code?.startsWith('Z') ? <Sparkles size={20} /> : <Mic2 size={20} />}
                                    </div>
                                    <div className={`flex-1 p-6 rounded-[2rem] border shadow-sm transition-all ${block.code?.startsWith('Z') ? 'bg-white border-amber-200' : 'bg-white border-slate-200'}`}>
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black uppercase text-slate-400 px-2 py-0.5 bg-slate-50 rounded border border-slate-100">{block.code}</span>
                                                {block.isPartnerSpecific && <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Partner Spec.</span>}
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-300">#{idx + 1}</span>
                                        </div>
                                        
                                        <div className="flex flex-col md:flex-row gap-6">
                                            <p className={`text-base leading-relaxed flex-1 ${block.code?.startsWith('Z') ? 'font-black text-amber-900' : 'text-slate-700 font-medium'}`}>
                                                {text}
                                            </p>
                                            {imageUrl && (
                                                <div className="w-full md:w-48 aspect-video rounded-xl overflow-hidden border-2 border-slate-100 shadow-sm shrink-0">
                                                    <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 bg-white border-t border-slate-100 text-center">
                <button onClick={() => setShowTimeline(false)} className="px-10 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition-colors">Zamknij Podgląd</button>
            </div>
        </motion.div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <AnimatePresence>
          {showTimeline && <TimelineModal />}
      </AnimatePresence>

      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-6">
              <button onClick={onBack} className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2 text-sm transition-colors">
                  <ArrowLeft size={16} /> Wróć
              </button>
              
              <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button onClick={() => setActiveGender('boy')} className={`px-6 py-2 rounded-lg text-sm font-black uppercase transition-all flex items-center gap-2 ${activeGender === 'boy' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                      <User size={16} /> CHŁOPIEC
                  </button>
                  <button onClick={() => setActiveGender('girl')} className={`px-6 py-2 rounded-lg text-sm font-black uppercase transition-all flex items-center gap-2 ${activeGender === 'girl' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                      <User size={16} /> DZIEWCZYNKA
                  </button>
              </div>

              <button 
                onClick={handleAIConvert} 
                disabled={isAIProcessing}
                className="px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-indigo-100 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {isAIProcessing ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                KONWERTUJ {activeGender === 'boy' ? 'NA DZIEWCZYNKĘ' : 'NA CHŁOPCA'} (AI)
              </button>
          </div>
          
          <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowTimeline(true)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-black text-sm flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-md"
              >
                  <Eye size={16} /> PODGLĄD TIMELINE
              </button>

              {onSave && (
                  <button onClick={onSave} disabled={state.isSaving} className="px-6 py-2 bg-green-600 text-white rounded-xl font-black text-sm flex items-center gap-2 hover:bg-green-700 transition-colors shadow-md disabled:opacity-70">
                      {state.isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                      {state.isSaving ? 'Zapisuję...' : 'Zapisz zmiany w bazie'}
                  </button>
              )}
          </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-4">
                  <div className="flex items-center gap-2 text-amber-600 font-black uppercase text-xs tracking-widest mb-2"><Globe size={16} /> Zmienne (Dynamiczne)</div>
                  {dynamicBlocks.map(block => <LineEditor key={block.id} block={block} bgColor="bg-amber-50" borderColor="border-amber-100" />)}
              </div>
              <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-500 font-black uppercase text-xs tracking-widest mb-2"><Lock size={16} /> Linie Stałe (Baza)</div>
                  {staticBlocks.map(block => <LineEditor key={block.id} block={block} bgColor="bg-white" borderColor="border-slate-200" />)}
              </div>
              <div className="space-y-4">
                  <div className="flex items-center gap-2 text-indigo-600 font-black uppercase text-xs tracking-widest mb-2"><Building2 size={16} /> Partner Specific</div>
                  <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-6">
                      <label className="block text-[10px] font-bold text-indigo-400 uppercase mb-1">Edytujesz wersję dla:</label>
                      <select value={editingPartnerSlug} onChange={(e) => setEditingPartnerSlug(e.target.value)} className="w-full p-2 rounded-lg font-bold text-sm bg-white border border-indigo-200 text-indigo-900 focus:outline-none">
                          <option value="default">✨ Wersja Domyślna (Baza)</option>
                          <optgroup label="Konkretni Partnerzy">{partners.map(p => <option key={p.Slug} value={p.Slug}>{p.PartnerName}</option>)}</optgroup>
                      </select>
                  </div>
                  {partnerBlocks.map(block => <LineEditor key={block.id} block={block} bgColor={editingPartnerSlug !== 'default' ? 'bg-white' : 'bg-slate-50 opacity-70'} borderColor={editingPartnerSlug !== 'default' ? 'border-indigo-200 ring-2 ring-indigo-50' : 'border-slate-200'} />)}
                  {partnerBlocks.length === 0 && <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-xl"><p className="text-slate-400 text-sm font-bold">Brak linii 'Partner Specific'.</p></div>}
              </div>
          </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};
