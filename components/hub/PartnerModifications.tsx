
import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { Settings, Loader2, Send, Clock, CheckCircle2 } from 'lucide-react';

interface PartnerModificationsProps {
    partnerId: number | undefined;
    partnerName: string;
}

export const PartnerModifications: React.FC<PartnerModificationsProps> = ({ partnerId, partnerName }) => {
    const [section, setSection] = useState('Sekcja Hero (Nagłówek)');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sent, setSent] = useState(false);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        if (!partnerId) return;
        const fetchHistory = async () => {
            const { data } = await supabase
                .schema('PartnersApp')
                .from('PartnerRequests')
                .select('*')
                .eq('partner_id', partnerId)
                .order('created_at', { ascending: false });
            if (data) setHistory(data);
        };
        fetchHistory();
    }, [partnerId, sent]); 
  
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!partnerId) {
            alert("Błąd: Nie znaleziono ID partnera.");
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .schema('PartnersApp')
                .from('PartnerRequests')
                .insert({
                    partner_id: partnerId,
                    request_type: section,
                    description: description,
                    status: 'OCZEKUJE'
                });

            if (error) throw error;
            setSent(true);
        } catch (err: any) {
            alert('Wystąpił błąd: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };
  
    if (sent) return (
        <div className="p-12 bg-white rounded-[2rem] shadow-sm border border-slate-100 text-center animate-in fade-in zoom-in max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 mx-auto">
                <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Zgłoszenie wysłane!</h2>
            <p className="text-slate-500 mb-6">Nasz zespół otrzymał Twoją prośbę o zmianę dla {partnerName}.</p>
            <button onClick={() => { setSent(false); setDescription(''); }} className="font-bold text-blue-600 hover:underline">Wyślij kolejne zgłoszenie</button>
        </div>
    );
  
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-8 bg-white rounded-[2rem] shadow-sm border border-slate-100">
                <h2 className="text-2xl font-display font-black text-slate-900 mb-6 flex items-center gap-3">
                    <Settings className="text-slate-400" /> Nowe zgłoszenie
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Wybierz sekcję do zmiany</label>
                        <select 
                            value={section}
                            onChange={(e) => setSection(e.target.value)}
                            className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700 focus:border-blue-500 focus:outline-none"
                        >
                            <option>Sekcja Hero (Nagłówek)</option>
                            <option>Sekcja Wideo</option>
                            <option>Opisy Pakietów / Ceny</option>
                            <option>Sekcja "O nas"</option>
                            <option>Dane kontaktowe</option>
                            <option>Inne</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Opisz co chcesz zmienić</label>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Np. Proszę o zmianę ceny pakietu Premium na 59 PLN..."
                            className="w-full p-4 h-40 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-700 focus:border-blue-500 focus:outline-none resize-none"
                            required
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-70"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Wyślij zgłoszenie</>}
                    </button>
                </form>
            </div>

            <div className="p-8 bg-white rounded-[2rem] shadow-sm border border-slate-100 flex flex-col">
                <h2 className="text-2xl font-display font-black text-slate-900 mb-6 flex items-center gap-3">
                    <Clock className="text-slate-400" /> Historia zgłoszeń
                </h2>
                <div className="flex-1 overflow-y-auto max-h-[500px] space-y-4 pr-2 custom-scrollbar">
                    {history.length === 0 ? (
                        <p className="text-slate-400 font-medium text-center py-10">Brak wcześniejszych zgłoszeń.</p>
                    ) : (
                        history.map((req) => (
                            <div key={req.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase">{new Date(req.created_at).toLocaleDateString()}</span>
                                    <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${
                                        req.status === 'ZROBIONE' ? 'bg-green-100 text-green-700' : 
                                        req.status === 'W_TRAKCIE' ? 'bg-blue-100 text-blue-700' : 
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {req.status}
                                    </span>
                                </div>
                                <h4 className="font-bold text-slate-800 mb-1">{req.request_type}</h4>
                                <p className="text-sm text-slate-600 leading-relaxed">{req.description}</p>
                            </div>
                        ))
                    )}
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
