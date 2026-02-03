
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GeneratorState, StoryBlock, StoryLector } from '../types';
import { supabase } from '../../../utils/supabaseClient';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  ArrowLeft, User, Users, Globe, Save, Loader2, Building2, Lock, 
  CheckCircle2, ImagePlus, X, Image as ImageIcon, Sparkles, 
  Eye, BookOpen, Music, Clock, Mic2, LayoutList, ChevronRight, ZoomIn, Code, Database, Terminal, FileJson
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductionStepProps {
  state: GeneratorState;
  onUpdateState: (updates: Partial<GeneratorState>) => void;
  onBack: () => void;
  onSave?: () => Promise<boolean>;
}

// --- HELPERS FOR PREVIEW GENERATION ---
const getScenarioDSL = (blocks: StoryBlock[]) => {
    let output = "";
    let episodeOpen = false;
    let chapterOpen = false;
    let bgOpen = false;

    // Detect if we have an episode layer to adjust indentation
    const hasEpisode = blocks.some(b => b.type === 'EPISODE');

    // Dynamic indentation helpers
    const getIndent = (level: 'CHAPTER' | 'BACKGROUND' | 'LINE') => {
        if (level === 'CHAPTER') return hasEpisode ? "    " : "";
        if (level === 'BACKGROUND') return hasEpisode ? "        " : "    ";
        if (level === 'LINE') return hasEpisode ? "            " : "        ";
        return "";
    };

    const closeBg = () => { if(bgOpen) { output += `${getIndent('BACKGROUND')}End\n`; bgOpen = false; } };
    const closeChapter = () => { closeBg(); if(chapterOpen) { output += `${getIndent('CHAPTER')}End\n`; chapterOpen = false; } };
    const closeEpisode = () => { closeChapter(); if(episodeOpen) { output += "End\n"; episodeOpen = false; } };

    blocks.forEach(block => {
        if (block.type === 'EPISODE') {
            closeEpisode();
            output += `Episode:\n`;
            episodeOpen = true;
        } else if (block.type === 'CHAPTER') {
            closeChapter();
            output += `${getIndent('CHAPTER')}Chapter: ${block.content}\n`;
            chapterOpen = true;
        } else if (block.type === 'BACKGROUND') {
            closeBg();
            const fadeIn = block.metadata?.fadeIn || '00:00:01';
            output += `${getIndent('BACKGROUND')}BackgroundSampleLine: Code=${block.content}, FadeIn=${fadeIn}, FadeOut=00:00:02\n`;
            bgOpen = true;
        } else if (block.type === 'PAUSE') {
            const dur = block.metadata?.duration || 2;
            output += `${getIndent('LINE')}PauseLine: 00:00:0${dur}\n`;
        } else if (block.type === 'LINE') {
            const rawCode = block.code ? block.code.trim() : '';
            const finalCode = block.isPartnerSpecific ? `${rawCode}[Slug]` : rawCode;
            const indent = getIndent('LINE');

            if (rawCode.toUpperCase().startsWith('Z')) {
                output += `${indent}DynamicSampleLine: Code=${finalCode}\n`;
            } else if (rawCode) {
                output += `${indent}SampleLine: Code=${finalCode}\n`;
            }
        }
    });
    closeEpisode();
    return output;
};

const getDynamicJSON = (state: GeneratorState) => {
    const dynamicLinesPayload: Record<string, any> = {};
    
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
                elevenId: elevenId
            };
        }
    });
    return dynamicLinesPayload;
};

const getVoicesSQL = (lectors: StoryLector[]) => {
    const settingsJSON = JSON.stringify({
        "Speed": 0.87,
        "Style": 0.34,
        "Stability": 0.5,
        "SimilarityBoost": 0.75,
        "UseSpeakerBoost": true
    });

    if (lectors.length === 0) return "-- Brak zdefiniowanych lektorów";

    const values = lectors.map(l => {
        const safeId = (l.elevenId || '').replace(/'/g, "''");
        const safeName = (l.name || '').replace(/'/g, "''");
        const safeSettings = settingsJSON.replace(/'/g, "''");
        
        return `    ('${safeId}', '${safeName}', '${safeSettings}')`;
    }).join(',\n');

    return `INSERT INTO "PartnersApp"."StoryVoices" ("VoiceId", "Name", "Settings") VALUES\n${values};`;
};

const getStoryTypeSQL = (title: string, lectors: StoryLector[], ageGroup: string, description: string) => {
    const mainLector = lectors[0];
    if (!mainLector || !mainLector.elevenId) return "-- Brak głównego lektora lub brak ElevenID";

    const safeTitle = title.replace(/'/g, "''");
    const safeVoiceId = mainLector.elevenId.replace(/'/g, "''");
    const safeAgeGroup = ageGroup.replace(/'/g, "''");
    const safeDescription = description.replace(/'/g, "''");

    return `INSERT INTO "PartnersApp"."StoryTypes" ("Code", "VoiceId", "Type", "AgeGroup", "StoryDescription")
VALUES (
    '${safeTitle}',
    (SELECT "Id" FROM "PartnersApp"."StoryVoices" WHERE "VoiceId" = '${safeVoiceId}' LIMIT 1),
    'Video',
    '${safeAgeGroup}',
    '${safeDescription}'
);`;
};

const getSchemaSQL = (title: string, blocks: StoryBlock[]) => {
    const dsl = getScenarioDSL(blocks);
    const safeTitle = title.replace(/'/g, "''");
    const safeSchema = dsl.replace(/'/g, "''");

    return `INSERT INTO "PartnersApp"."StorySchemas" ("StoryId", "Schema")
VALUES (
    (SELECT "Id" FROM "PartnersApp"."StoryTypes" WHERE "Code" = '${safeTitle}' LIMIT 1),
    '${safeSchema}'
);`;
};

const getDynamicsSQL = (title: string, blocks: StoryBlock[], lectors: StoryLector[]) => {
    const safeTitle = title.replace(/'/g, "''");
    const values: string[] = [];

    // Helper: Znajdź VoiceId (SQL subquery) dla danego lektora. 
    // Jeśli to główny lektor (index 0) lub brak przypisania -> NULL.
    const getVoiceSql = (lectorId?: string) => {
        if (!lectorId) return "NULL";
        const index = lectors.findIndex(l => l.id === lectorId);
        // Jeśli to pierwszy lektor (0) lub nie znaleziono -> NULL
        if (index <= 0) return "NULL";
        
        const lector = lectors[index];
        if (!lector.elevenId) return "NULL";

        return `(SELECT "Id" FROM "PartnersApp"."StoryVoices" WHERE "VoiceId" = '${lector.elevenId}' LIMIT 1)`;
    };

    // Subquery dla SchemaId
    const schemaIdSql = `(SELECT "Id" FROM "PartnersApp"."StorySchemas" WHERE "StoryId" = (SELECT "Id" FROM "PartnersApp"."StoryTypes" WHERE "Code" = '${safeTitle}' LIMIT 1) LIMIT 1)`;

    blocks.forEach(block => {
        // FILTER: Only include 'Z' lines
        if (block.type === 'LINE' && block.code && block.code.toUpperCase().startsWith('Z')) {
            const safeCode = block.code.trim().replace(/'/g, "''");
            const voiceSql = getVoiceSql(block.lectorId);

            // Wariant dla Chłopca (He)
            const textBoy = (block.contentVariants?.boy || block.content).replace(/'/g, "''");
            values.push(`    ('${safeCode}', '${textBoy}', ${schemaIdSql}, ${voiceSql}, 'He')`);

            // Wariant dla Dziewczynki (She)
            const textGirl = (block.contentVariants?.girl || block.content).replace(/'/g, "''");
            values.push(`    ('${safeCode}', '${textGirl}', ${schemaIdSql}, ${voiceSql}, 'She')`);
        }
    });

    if (values.length === 0) return "-- Brak linii dynamicznych (Z)";

    return `INSERT INTO "PartnersApp"."DynamicLines" ("Code", "Text", "SchemaId", "VoiceId", "Relation") VALUES\n${values.join(',\n')};`;
};

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
            
            return `${data.publicUrl}?t=${Date.now()}`;
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
  const TimelineModal = () => {
    const [expandedImg, setExpandedImg] = useState<string | null>(null);
    const [modalView, setModalView] = useState<'TIMELINE' | 'SCHEMA' | 'DYNAMICS' | 'SQL_VOICES' | 'SQL_STORY_TYPE' | 'SQL_SCHEMA' | 'SQL_DYNAMICS'>('TIMELINE');

    const previewScenarioDSL = useMemo(() => getScenarioDSL(state.blocks), [state.blocks]);
    const previewDynamicJSON = useMemo(() => getDynamicJSON(state), [state.blocks]);
    const previewVoicesSQL = useMemo(() => getVoicesSQL(state.lectors), [state.lectors]);
    const previewStoryTypeSQL = useMemo(() => getStoryTypeSQL(state.title, state.lectors, state.ageGroup, state.description), [state.title, state.lectors, state.ageGroup, state.description]);
    const previewSchemaSQL = useMemo(() => getSchemaSQL(state.title, state.blocks), [state.title, state.blocks]);
    const previewDynamicsSQL = useMemo(() => getDynamicsSQL(state.title, state.blocks, state.lectors), [state.title, state.blocks, state.lectors]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
            {/* LIGHTBOX FOR EXPANDED IMAGE */}
            <AnimatePresence>
                {expandedImg && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[150] flex items-center justify-center p-8 bg-black/95 cursor-zoom-out"
                        onClick={() => setExpandedImg(null)}
                    >
                        <motion.img 
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            src={expandedImg} 
                            className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain border-2 border-white/20"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button onClick={() => setExpandedImg(null)} className="absolute top-6 right-6 p-4 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
                            <X size={32} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-slate-50 w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-white"
            >
                {/* Modal Header */}
                <div className="p-6 bg-white border-b border-slate-100 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <BookOpen size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-black text-slate-900 leading-none">Oś Czasu</h2>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Bajka: {state.title}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        
                        {/* VIEW TOGGLE */}
                        <div className="flex bg-slate-100 p-1 rounded-xl mr-2">
                            <button onClick={() => setModalView('TIMELINE')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 ${modalView === 'TIMELINE' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
                                <LayoutList size={14} /> Timeline
                            </button>
                            <button onClick={() => setModalView('SCHEMA')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 ${modalView === 'SCHEMA' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
                                <Database size={14} /> Schemat
                            </button>
                            <button onClick={() => setModalView('DYNAMICS')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 ${modalView === 'DYNAMICS' ? 'bg-white shadow-sm text-green-600' : 'text-slate-400 hover:text-slate-600'}`}>
                                <Code size={14} /> Dynamics
                            </button>
                        </div>

                        {/* GENDER TOGGLE */}
                        <div className="flex bg-slate-100 p-1 rounded-xl mr-4">
                            <button onClick={() => setActiveGender('boy')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${activeGender === 'boy' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}>Chłopiec</button>
                            <button onClick={() => setActiveGender('girl')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${activeGender === 'girl' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-400'}`}>Dziewczynka</button>
                        </div>
                        
                        <button onClick={() => setShowTimeline(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Modal Content - Switcher */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 relative">
                    
                    {/* VIEW: TIMELINE */}
                    {modalView === 'TIMELINE' && (
                        <div className="p-4 md:p-6 max-w-4xl mx-auto relative">
                            {/* Vertical Connecting Line */}
                            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200 rounded-full" />

                            <div className="space-y-1"> {/* Minimal vertical space */}
                                {(() => {
                                    // Variable to hold the current persistent image across iterations
                                    let activeContextImage: string | null = null;

                                    return state.blocks.map((block, idx) => {
                                        const specificImage = getBlockImageUrl(block);
                                        
                                        // Update context image only if the current block has one defined
                                        if (specificImage) {
                                            activeContextImage = specificImage;
                                        }

                                        // Use the persistent context image for display
                                        const displayImage = activeContextImage;
                                        const text = getBlockValue(block);

                                        if (block.type === 'EPISODE') return (
                                            <div key={block.id} className="relative z-10 flex items-center gap-6 group py-2 mt-4">
                                                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-xl ring-4 ring-slate-50">
                                                    <LayoutList size={20} />
                                                </div>
                                                <h3 className="text-2xl font-black text-purple-900 uppercase tracking-tighter">{block.content}</h3>
                                            </div>
                                        );

                                        if (block.type === 'CHAPTER') return (
                                            <div key={block.id} className="relative z-10 flex items-center gap-6 group py-1 mt-2">
                                                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg ring-4 ring-slate-50">
                                                    <ChevronRight size={22} />
                                                </div>
                                                <div className="bg-blue-600 text-white px-4 py-1.5 rounded-xl shadow-md">
                                                    <h4 className="text-sm font-black uppercase tracking-wide">{block.content}</h4>
                                                </div>
                                            </div>
                                        );

                                        if (block.type === 'BACKGROUND') return (
                                            <div key={block.id} className="relative z-10 flex items-center gap-6 pl-4 py-1">
                                                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 ring-2 ring-slate-50">
                                                    <Music size={14} />
                                                </div>
                                                <div className="flex items-center gap-2 bg-pink-50 border border-pink-100 px-3 py-1 rounded-full">
                                                    <span className="text-[9px] font-black uppercase text-pink-400">Audio:</span>
                                                    <span className="text-xs font-bold text-pink-700">{block.content}</span>
                                                    {block.metadata?.fadeIn && <span className="ml-2 text-[9px] font-mono text-pink-300">Fade: {block.metadata.fadeIn}</span>}
                                                </div>
                                            </div>
                                        );

                                        if (block.type === 'PAUSE') return (
                                            <div key={block.id} className="relative z-10 flex items-center gap-6 pl-4 py-1">
                                                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 ring-2 ring-slate-50">
                                                    <Clock size={14} />
                                                </div>
                                                <div className="bg-amber-50 border border-amber-100 border-dashed px-3 py-1 rounded-full text-[10px] font-bold text-amber-700">
                                                    Cisza {block.metadata?.duration}s
                                                </div>
                                            </div>
                                        );

                                        // LINE (HORIZONTAL LAYOUT: ICON | CONTENT_BOX [TEXT | IMAGE])
                                        return (
                                            <div key={block.id} className="relative z-10 flex gap-4 items-stretch group py-1">
                                                {/* Icon (Left Side - Outside Box) */}
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ring-2 ring-slate-50 shrink-0 ml-2 mt-1 ${block.code?.startsWith('Z') ? 'bg-amber-100 text-amber-600' : 'bg-white text-slate-400 border border-slate-100'}`}>
                                                    {block.code?.startsWith('Z') ? <Sparkles size={14} /> : <Mic2 size={14} />}
                                                </div>
                                                
                                                {/* Content Strip (Row Layout) */}
                                                <div className={`flex-1 rounded-lg border shadow-sm transition-all flex flex-row overflow-hidden ${block.code?.startsWith('Z') ? 'bg-white border-amber-200' : 'bg-white border-slate-200'}`}>
                                                    
                                                    {/* LEFT SIDE: TEXT CONTENT (Expands height) */}
                                                    <div className="flex-1 p-3 flex flex-col justify-center gap-2">
                                                        <div className="flex items-center gap-2">
                                                            {/* Code Badge */}
                                                            <span className="text-[9px] font-black uppercase text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 min-w-[24px] text-center">{block.code}</span>
                                                            {block.isPartnerSpecific && <span className="text-[8px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">Partner</span>}
                                                        </div>

                                                        {/* Text */}
                                                        <p className={`text-xs leading-relaxed ${block.code?.startsWith('Z') ? 'font-bold text-amber-900' : 'text-slate-700 font-medium'}`}>
                                                            {text}
                                                        </p>
                                                    </div>

                                                    {/* RIGHT SIDE: IMAGE THUMBNAIL (Matches Height) */}
                                                    {displayImage && (
                                                        <div 
                                                            onClick={() => setExpandedImg(displayImage)}
                                                            className="w-24 border-l border-slate-100 bg-slate-50 relative group/img cursor-zoom-in shrink-0 self-stretch"
                                                            title="Kliknij, aby powiększyć"
                                                        >
                                                            <img 
                                                                src={displayImage} 
                                                                alt="" 
                                                                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover/img:opacity-100 transition-opacity" 
                                                            />
                                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/10">
                                                                <ZoomIn size={16} className="text-white drop-shadow-md" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    )}

                    {/* VIEW: SCHEMA DSL */}
                    {modalView === 'SCHEMA' && (
                        <div className="p-4 md:p-6 h-full bg-slate-900">
                            <pre className="text-xs font-mono text-blue-300 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                                {previewScenarioDSL}
                            </pre>
                        </div>
                    )}

                    {/* VIEW: DYNAMICS JSON */}
                    {modalView === 'DYNAMICS' && (
                        <div className="p-4 md:p-6 h-full bg-slate-900">
                            <pre className="text-xs font-mono text-emerald-400 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                                {JSON.stringify(previewDynamicJSON, null, 2)}
                            </pre>
                        </div>
                    )}

                    {/* VIEW: SQL VOICES */}
                    {modalView === 'SQL_VOICES' && (
                        <div className="p-4 md:p-6 h-full bg-slate-900">
                            <pre className="text-xs font-mono text-amber-300 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                                {previewVoicesSQL}
                            </pre>
                        </div>
                    )}

                    {/* VIEW: SQL STORY TYPE */}
                    {modalView === 'SQL_STORY_TYPE' && (
                        <div className="p-4 md:p-6 h-full bg-slate-900">
                            <pre className="text-xs font-mono text-pink-300 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                                {previewStoryTypeSQL}
                            </pre>
                        </div>
                    )}

                    {/* VIEW: SQL SCHEMA */}
                    {modalView === 'SQL_SCHEMA' && (
                        <div className="p-4 md:p-6 h-full bg-slate-900">
                            <pre className="text-xs font-mono text-cyan-300 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                                {previewSchemaSQL}
                            </pre>
                        </div>
                    )}

                    {/* VIEW: SQL DYNAMICS */}
                    {modalView === 'SQL_DYNAMICS' && (
                        <div className="p-4 md:p-6 h-full bg-slate-900">
                            <pre className="text-xs font-mono text-purple-300 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                                {previewDynamicsSQL}
                            </pre>
                        </div>
                    )}

                </div>
                
                {/* Modal Footer */}
                <div className="p-4 bg-white border-t border-slate-100 flex justify-center gap-4 flex-wrap">
                    <button onClick={() => setModalView('SQL_VOICES')} className={`px-4 py-2 rounded-xl font-black uppercase tracking-widest text-xs transition-colors border ${modalView === 'SQL_VOICES' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}>
                        SQL Lektorzy
                    </button>
                    <button onClick={() => setModalView('SQL_STORY_TYPE')} className={`px-4 py-2 rounded-xl font-black uppercase tracking-widest text-xs transition-colors border ${modalView === 'SQL_STORY_TYPE' ? 'bg-pink-100 text-pink-700 border-pink-200' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}>
                        SQL StoryType
                    </button>
                    <button onClick={() => setModalView('SQL_SCHEMA')} className={`px-4 py-2 rounded-xl font-black uppercase tracking-widest text-xs transition-colors border ${modalView === 'SQL_SCHEMA' ? 'bg-cyan-100 text-cyan-700 border-cyan-200' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}>
                        SQL Schema
                    </button>
                    <button onClick={() => setModalView('SQL_DYNAMICS')} className={`px-4 py-2 rounded-xl font-black uppercase tracking-widest text-xs transition-colors border ${modalView === 'SQL_DYNAMICS' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}>
                        SQL Dynamics
                    </button>
                </div>
            </motion.div>
        </div>
    );
  };

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
                  <button onClick={onSave} disabled={state.isSaving} className="px-6 py-2 bg-green-600 text-white rounded-xl font-black text-sm flex items-center gap-2 hover:bg-green-700 transition-colors shadow-md disabled:opacity-70" title="Zapisz obecny stan w bazie danych">
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
