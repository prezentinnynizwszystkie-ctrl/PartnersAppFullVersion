
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, StopCircle, RefreshCw, CheckCircle2, ChevronLeft, Shell } from 'lucide-react';

interface Step6AudioProps {
  audioBlob: Blob | null;
  onAudioRecorded: (blob: Blob | null) => void;
  onSkip: () => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step6Audio: React.FC<Step6AudioProps> = ({ 
  audioBlob, onAudioRecorded, onSkip, onNext, onBack 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Twoja przeglądarka nie obsługuje nagrywania dźwięku.");
        return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onAudioRecorded(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Nie udało się uzyskać dostępu do mikrofonu.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const resetRecording = () => {
    onAudioRecorded(null);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="p-8 w-full max-w-2xl mx-auto flex flex-col h-full">
      <button onClick={onBack} className="text-slate-400 mb-6 flex items-center gap-1 text-sm font-bold uppercase self-start"><ChevronLeft size={16} /> Wróć</button>
      
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-black text-slate-900 mb-4">Nagranie głosowe</h2>
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl text-left relative overflow-hidden">
            <Shell className="absolute -top-4 -right-4 text-blue-200 w-32 h-32 opacity-50 rotate-12" />
            <p className="text-slate-700 font-medium leading-relaxed relative z-10">
                Możesz nagrać życzenia klikając w poniższy przycisk. Dziecko usłyszy je w odpowiednim momencie bajki w zależności od wybranego przez Ciebie tytułu w kolejnym kroku. 
            </p>
            <p className="text-blue-600 font-bold mt-3 relative z-10 text-sm">
                Np. podczas podwodnej przygody dziecko przyłoży muszelkę do ucha i usłyszy Twój głos!
            </p>
        </div>
      </div>

      <div className="space-y-4 flex-1 flex flex-col justify-center">
         {!audioBlob && !isRecording && (
          <button onClick={startRecording} className="w-full py-12 rounded-[2.5rem] border-4 border-dashed border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50 transition-all group flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-slate-100 group-hover:bg-blue-200 group-hover:text-blue-700 text-slate-400 flex items-center justify-center transition-colors">
                <Mic size={40} />
            </div>
            <span className="font-black text-xl text-slate-600 group-hover:text-blue-800">Rozpocznij nagrywanie</span>
          </button>
        )}

        {isRecording && (
          <button onClick={stopRecording} className="w-full py-12 rounded-[2.5rem] bg-red-50 border-4 border-red-100 animate-pulse flex flex-col items-center gap-4">
             <div className="w-20 h-20 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-300/50">
                <StopCircle size={40} />
             </div>
             <span className="font-black text-xl text-red-600">Nagrywanie trwa... (Stop)</span>
          </button>
        )}

        {audioBlob && (
           <div className="w-full py-10 bg-green-50 border-2 border-green-200 rounded-[2.5rem] flex flex-col items-center gap-6">
              <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg"><CheckCircle2 size={28} /></div>
                  <span className="font-black text-2xl text-green-800">Nagranie gotowe!</span>
              </div>
              <button onClick={resetRecording} className="flex items-center gap-2 text-slate-500 hover:text-red-500 font-bold uppercase text-xs tracking-widest bg-white px-4 py-2 rounded-full shadow-sm">
                  <RefreshCw size={14} /> Nagraj ponownie
              </button>
           </div>
        )}
      </div>

      <div className="flex gap-4 mt-8">
        <button 
            onClick={onSkip} 
            className={`flex-1 py-4 rounded-2xl font-bold text-lg border-2 transition-all ${audioBlob ? 'bg-slate-100 text-slate-400 border-transparent opacity-50' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
        >
            NIE CHCĘ NAGRYWAĆ
        </button>
        <button 
            onClick={onNext} 
            disabled={!audioBlob} 
            className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-xl disabled:opacity-0 disabled:translate-y-4 transition-all"
        >
            ZATWIERDŹ
        </button>
      </div>
    </motion.div>
  );
};
