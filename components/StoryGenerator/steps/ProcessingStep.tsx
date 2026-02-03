
import React, { useEffect, useState, useRef } from 'react';
import { GeneratorState, StoryBlock, BlockType } from '../types';
import { parseScriptToBlocks } from '../utils';
import { 
  Play, Pause, Music, Mic2, MessageSquare, GripVertical, 
  Plus, Trash2, Hash, AlignLeft, Clock, ArrowLeft, ArrowRight, ToggleLeft, ToggleRight, Users
} from 'lucide-react';

interface ProcessingStepProps {
  state: GeneratorState;
  updateState: (updates: Partial<GeneratorState>) => void;
  onBack?: () => void;
  onNext?: () => void;
}

const AutoResizingTextarea = ({ value, onChange, className }: { value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, className?: string }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto'; 
            textarea.style.height = `${textarea.scrollHeight}px`; 
        }
    }, [value]);
    return <textarea ref={textareaRef} value={value} onChange={onChange} rows={1} className={`${className} resize-none overflow-hidden`} style={{ minHeight: '38px' }} />;
};

const Adder = ({ index, onAdd }: { index: number, onAdd: (idx: number, type: BlockType) => void }) => (
    <div className="group/adder relative py-2 flex items-center justify-center hover:py-4 transition-all cursor-pointer z-10">
        <div className="absolute inset-x-12 h-[2px] bg-slate-100 group-hover/adder:bg-indigo-100 transition-colors"></div>
        <div className="relative z-10 bg-white border border-slate-200 text-slate-300 p-1.5 rounded-full flex gap-2 opacity-0 group-hover/adder:opacity-100 transition-all shadow-sm transform scale-90 group-hover/adder:scale-100 hover:shadow-md">
            <button onClick={() => onAdd(index, 'LINE')} className="p-2 hover:bg-slate-50 hover:text-indigo-600 rounded-full transition-colors" title="Dodaj Dialog"><MessageSquare size={16} /></button>
            <button onClick={() => onAdd(index, 'CHAPTER')} className="p-2 hover:bg-slate-50 hover:text-blue-600 rounded-full transition-colors" title="Dodaj Rozdział"><AlignLeft size={16} /></button>
            <button onClick={() => onAdd(index, 'BACKGROUND')} className="p-2 hover:bg-slate-50 hover:text-pink-600 rounded-full transition-colors" title="Dodaj Tło"><Music size={16} /></button>
            <button onClick={() => onAdd(index, 'PAUSE')} className="p-2 hover:bg-slate-50 hover:text-amber-600 rounded-full transition-colors" title="Dodaj Pauzę"><Clock size={16} /></button>
        </div>
        <div className="absolute z-0 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-300 opacity-100 group-hover/adder:opacity-0 transition-opacity">
            <Plus size={14} />
        </div>
    </div>
);

export const ProcessingStep: React.FC<ProcessingStepProps> = ({ state, updateState, onBack, onNext }) => {
  
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [draggableBlockId, setDraggableBlockId] = useState<string | null>(null);

  useEffect(() => {
    if (state.blocks && state.blocks.length === 0 && state.rawScript) {
        const parsed = parseScriptToBlocks(state.rawScript, state.lectors);
        updateState({ blocks: parsed });
    }
  }, []);

  const handleUpdateBlock = (id: string, field: keyof StoryBlock | 'metadata.duration' | 'metadata.fadeIn', value: any) => {
    const updatedBlocks = state.blocks.map(b => {
        if (b.id !== id) return b;
        if (field === 'metadata.duration') return { ...b, metadata: { ...b.metadata, duration: parseInt(value) || 0 } };
        if (field === 'metadata.fadeIn') return { ...b, metadata: { ...b.metadata, fadeIn: value } };
        return { ...b, [field]: value };
    });
    updateState({ blocks: updatedBlocks });
  };

  const handleRemoveBlock = (id: string) => {
    if (confirm('Czy na pewno usunąć ten blok?')) {
        updateState({ blocks: state.blocks.filter(b => b.id !== id) });
    }
  };

  const handleAddBlock = (index: number, type: BlockType) => {
    const newBlock: StoryBlock = {
      id: crypto.randomUUID(),
      type,
      content: type === 'LINE' ? '' : type === 'PAUSE' ? 'Pauza' : type === 'CHAPTER' ? 'Nowy Rozdział' : 'Tło Muzyczne',
      lectorId: state.lectors[0]?.id,
      metadata: type === 'PAUSE' ? { duration: 2 } : type === 'BACKGROUND' ? { fadeIn: '00:00:01' } : {}
    };
    const newBlocks = [...state.blocks];
    newBlocks.splice(index, 0, newBlock);
    updateState({ blocks: newBlocks });
  };

  const onDragEnd = () => {
    const dragIndex = dragItem.current;
    const hoverIndex = dragOverItem.current;
    if (dragIndex !== null && hoverIndex !== null && dragIndex !== hoverIndex) {
        const _blocks = [...state.blocks];
        const draggedItemContent = _blocks.splice(dragIndex, 1)[0];
        _blocks.splice(hoverIndex, 0, draggedItemContent);
        updateState({ blocks: _blocks });
    }
    dragItem.current = null;
    dragOverItem.current = null;
    setDraggableBlockId(null);
  };

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col">
      
      {/* HEADER: Buttons on TOP */}
      <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200 sticky top-0 z-20">
          <button onClick={onBack} className="px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold flex items-center gap-2 text-sm hover:bg-slate-50 transition-colors">
              <ArrowLeft size={16} /> Wróć
          </button>
          
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest hidden md:block">Montaż Scenariusza</h2>
          
          <div className="flex gap-2">
              <button onClick={() => updateState({ blocks: [] })} className="px-4 py-2 text-xs font-bold text-red-400 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">Reset</button>
              {onNext && <button onClick={onNext} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">Dalej <ArrowRight size={16} /></button>}
          </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-0 pb-20 pr-2 custom-scrollbar">
          {state.blocks.length === 0 && (
              <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
                  <p className="mb-4">Scenariusz jest pusty.</p>
                  <button onClick={() => handleAddBlock(0, 'LINE')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm">Dodaj pierwszą linię</button>
              </div>
          )}

          {state.blocks.map((block, index) => (
              <div 
                key={block.id} 
              >
                  <Adder index={index} onAdd={handleAddBlock} />
                  
                  <div 
                    className={`group relative p-4 rounded-xl border-2 transition-all flex gap-4 items-start ${block.type === 'EPISODE' ? 'bg-purple-50 border-purple-200' : ''} ${block.type === 'CHAPTER' ? 'bg-blue-50 border-blue-200 ml-4' : ''} ${block.type === 'LINE' ? 'bg-white border-slate-100 hover:border-indigo-200 ml-8 shadow-sm' : ''} ${block.type === 'BACKGROUND' ? 'bg-pink-50 border-pink-100 ml-8' : ''} ${block.type === 'PAUSE' ? 'bg-amber-50 border-amber-100 ml-8' : ''}`}
                    draggable={draggableBlockId === block.id}
                    onDragStart={(e) => { dragItem.current = index; e.dataTransfer.effectAllowed = "move"; }}
                    onDragEnter={() => dragOverItem.current = index}
                    onDragEnd={onDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                  >
                      <div className="mt-2 text-slate-300 cursor-grab p-1" onMouseEnter={() => setDraggableBlockId(block.id)} onMouseLeave={() => setDraggableBlockId(null)}><GripVertical size={16} /></div>

                      <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                          {block.type === 'LINE' && (
                              <>
                                  <div className="col-span-2">
                                      <select value={block.lectorId} onChange={(e) => handleUpdateBlock(block.id, 'lectorId', e.target.value)} className="w-full text-xs font-bold p-2 rounded-lg bg-slate-50 border border-slate-200">
                                          {state.lectors.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                      </select>
                                  </div>
                                  <div className="col-span-1">
                                      <input type="text" value={block.code || ''} onChange={(e) => handleUpdateBlock(block.id, 'code', e.target.value)} placeholder="Kod" className="w-full text-xs font-mono p-2 rounded-lg bg-slate-50 border border-slate-200 text-center" />
                                  </div>
                                  <div className="col-span-7">
                                      <AutoResizingTextarea value={block.content} onChange={(e) => handleUpdateBlock(block.id, 'content', e.target.value)} className="w-full text-sm p-2 rounded-lg border border-transparent focus:border-indigo-200 focus:bg-slate-50" />
                                  </div>
                                  
                                  {/* --- TOGGLES --- */}
                                  <div className="col-span-2 flex justify-end gap-1">
                                      {/* UNIVERSAL GENDER TOGGLE */}
                                      <button 
                                        onClick={() => handleUpdateBlock(block.id, 'isGenderUniversal', !block.isGenderUniversal)}
                                        title={block.isGenderUniversal ? "Linia Uniwersalna Płciowo" : "Zależna od płci (Boy/Girl)"}
                                        className={`p-1.5 rounded-lg transition-colors border ${block.isGenderUniversal ? 'bg-purple-100 text-purple-600 border-purple-200' : 'bg-slate-50 text-slate-300 hover:bg-slate-100 border-transparent'}`}
                                      >
                                          <Users size={18} />
                                      </button>

                                      {/* PARTNER SPECIFIC TOGGLE */}
                                      <button 
                                        onClick={() => handleUpdateBlock(block.id, 'isPartnerSpecific', !block.isPartnerSpecific)}
                                        title={block.isPartnerSpecific ? "Linia Wymienna (Partner Specific)" : "Linia Standardowa"}
                                        className={`p-1.5 rounded-lg transition-colors border ${block.isPartnerSpecific ? 'bg-amber-100 text-amber-600 border-amber-200' : 'bg-slate-50 text-slate-300 hover:bg-slate-100 border-transparent'}`}
                                      >
                                          {block.isPartnerSpecific ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                      </button>
                                  </div>
                              </>
                          )}

                          {block.type === 'BACKGROUND' && (
                              <div className="col-span-12 flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center text-pink-500"><Music size={20}/></div>
                                  <input type="text" value={block.content} onChange={(e) => handleUpdateBlock(block.id, 'content', e.target.value)} className="flex-1 font-bold text-slate-800 bg-transparent border-none focus:outline-none placeholder:text-pink-300" placeholder="Nazwa utworu / Pliku" />
                                  <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-pink-100">
                                      <span className="text-[10px] font-bold text-pink-400 uppercase">Fade In</span>
                                      <input type="text" value={block.metadata?.fadeIn || ''} onChange={(e) => handleUpdateBlock(block.id, 'metadata.fadeIn', e.target.value)} className="w-16 text-xs font-mono text-center outline-none text-pink-600" placeholder="00:00:01" />
                                  </div>
                              </div>
                          )}

                          {block.type === 'PAUSE' && (
                              <div className="col-span-12 flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-500"><Clock size={20}/></div>
                                  <span className="font-bold text-amber-800">Pauza (Cisza)</span>
                                  <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-amber-100">
                                      <span className="text-[10px] font-bold text-amber-400 uppercase">Czas (s)</span>
                                      <input type="number" value={block.metadata?.duration || 0} onChange={(e) => handleUpdateBlock(block.id, 'metadata.duration', e.target.value)} className="w-16 text-xs font-mono text-center outline-none text-amber-600" />
                                  </div>
                              </div>
                          )}

                          {block.type === 'CHAPTER' && (
                              <div className="col-span-12 flex items-center gap-4">
                                  <AlignLeft className="text-blue-400" />
                                  <input type="text" value={block.content} onChange={(e) => handleUpdateBlock(block.id, 'content', e.target.value)} className="flex-1 font-black text-lg text-blue-900 bg-transparent border-none focus:outline-none uppercase tracking-wide" placeholder="TYTUŁ ROZDZIAŁU" />
                              </div>
                          )}
                          
                          {block.type === 'EPISODE' && (
                              <div className="col-span-11"><input type="text" value={block.content} onChange={(e) => handleUpdateBlock(block.id, 'content', e.target.value)} className="w-full font-black text-xl text-purple-900 bg-transparent border-none focus:outline-none" /></div>
                          )}
                      </div>

                      <button onClick={(e) => { e.stopPropagation(); handleRemoveBlock(block.id); }} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 p-2"><Trash2 size={16} /></button>
                  </div>
              </div>
          ))}
          
          {/* Final Adder at the end */}
          <Adder index={state.blocks.length} onAdd={handleAddBlock} />
      </div>
    </div>
  );
};
