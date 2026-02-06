
import React, { useState, useEffect } from 'react';
import { Partner, Handlowiec } from '../../types';
import { Search, Mail, Send, Loader2, CheckCircle2, ArrowRight, X, AlertTriangle, UserPlus, ChevronDown, AlertCircle, PenTool, Eye, User } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import { getPostMeetingTemplate } from '../../utils/emailTemplates';

interface AdminMailViewProps {
    partners: Partner[];
    salespeople: Handlowiec[];
}

const VERIFIED_SENDERS = [
    'biuro@PrezentInnyNizWszystkie.pl',
    'grzegorz@PrezentInnyNizWszystkie.pl',
    'piotr@PrezentInnyNizWszystkie.pl'
];

export const AdminMailView: React.FC<AdminMailViewProps> = ({ partners, salespeople }) => {
    const [step, setStep] = useState<1 | 2>(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
    
    // Form State
    const [senderEmail, setSenderEmail] = useState(VERIFIED_SENDERS[0]);
    const [selectedSignerId, setSelectedSignerId] = useState<number | ''>(''); // ID Handlowca
    const [recipientEmail, setRecipientEmail] = useState('');
    const [recipientName, setRecipientName] = useState(''); // NOWE POLE: Imię do powitania
    const [template, setTemplate] = useState<'EMPTY' | 'POST_MEETING'>('EMPTY');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    
    const [isSending, setIsSending] = useState(false);
    const [sentSuccess, setSentSuccess] = useState(false);

    // Notification State
    const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

    // Auto-dismiss notification
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // Filter Partners
    const filteredPartners = partners.filter(p => 
        p.PartnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.contact_email || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Set default signer based on partner's guardian when selecting partner
    useEffect(() => {
        if (selectedPartner && selectedPartner.IdOpiekuna) {
            setSelectedSignerId(selectedPartner.IdOpiekuna);
        } else if (!selectedPartner && salespeople.length > 0) {
            // Default to first salesperson if custom recipient
            setSelectedSignerId(salespeople[0].id);
        }
    }, [selectedPartner, salespeople]);

    // Update content when template, signer or RECIPIENT NAME changes
    useEffect(() => {
        if (template === 'POST_MEETING') {
            setSubject('Podsumowanie rozmowy - MultiBajka');
            
            // Używamy wpisanego ręcznie imienia lub nazwy partnera
            const nameToUse = recipientName.trim() || (selectedPartner ? selectedPartner.PartnerName : 'Partnerze');
            
            // Generate Dynamic Link to Proposal
            const baseUrl = window.location.origin;
            const proposalLink = selectedPartner ? `${baseUrl}/#/${selectedPartner.Slug}/propozycja` : `${baseUrl}/#/demo/propozycja`;
            
            // Default signer info if none selected
            let signerName = 'Zespół MultiBajka';
            let signerPhone = '';

            if (selectedSignerId) {
                const signer = salespeople.find(s => s.id === Number(selectedSignerId));
                if (signer) {
                    signerName = `${signer.imie} ${signer.nazwisko}`;
                    signerPhone = signer.telefon;
                }
            }

            setBody(getPostMeetingTemplate(nameToUse, signerName, signerPhone, proposalLink));
        } else {
            if (template === 'EMPTY' && subject === 'Podsumowanie rozmowy - MultiBajka') {
               setSubject('');
               setBody('');
            }
        }
    }, [template, selectedPartner, selectedSignerId, salespeople, recipientName]);

    const handleSelectPartner = (p: Partner) => {
        if (!p.contact_email) {
            if(!confirm("Ten partner nie ma przypisanego maila w bazie. Czy chcesz przejść dalej i wpisać go ręcznie?")) return;
        }
        setSelectedPartner(p);
        setRecipientEmail(p.contact_email || '');
        setRecipientName(p.PartnerName); // Domyślnie nazwa firmy
        setStep(2);
        setSentSuccess(false);
        setNotification(null);
    };

    const handleSelectCustom = () => {
        setSelectedPartner(null);
        setRecipientEmail('');
        setRecipientName(''); // Puste dla custom
        setTemplate('EMPTY');
        setSubject('');
        setBody('');
        setStep(2);
        setSentSuccess(false);
        setNotification(null);
    };

    const handleSend = async () => {
        setNotification(null);

        // Validations
        if (!recipientEmail || !recipientEmail.includes('@')) {
            setNotification({ type: 'error', message: "Wpisz poprawny adres e-mail odbiorcy." });
            return;
        }
        if (!subject) {
            setNotification({ type: 'error', message: "Uzupełnij temat wiadomości." });
            return;
        }
        if (!body) {
            setNotification({ type: 'error', message: "Treść wiadomości nie może być pusta." });
            return;
        }

        setIsSending(true);
        try {
            console.log("Wysyłanie maila (Funkcja: send_email_via_postmark)...", { senderEmail, recipientEmail, subject });

            // Używamy nowej nazwy funkcji, aby uniknąć problemów z cache
            const { data, error } = await supabase.rpc('send_email_via_postmark', {
                sender_email: senderEmail,
                recipient_email: recipientEmail,
                email_subject: subject,
                email_html_body: body
            });

            if (error) {
                console.error("Supabase RPC Error Details:", error);
                throw error;
            }

            console.log("Wynik wysyłki:", data);

            if (data && data.error) {
                throw new Error(data.error);
            }

            setSentSuccess(true);
            setNotification({ type: 'success', message: "Wiadomość została wysłana pomyślnie!" });

            setTimeout(() => {
                setStep(1);
                setSelectedPartner(null);
                setTemplate('EMPTY');
                setSubject('');
                setBody('');
                setRecipientEmail('');
                setRecipientName('');
                setSentSuccess(false);
                setNotification(null);
            }, 3000);

        } catch (err: any) {
            console.error("Critical Email Error:", err);
            let errorMessage = "Wystąpił nieznany błąd podczas wysyłki.";
            if (err.message) {
                errorMessage = `Błąd: ${err.message}`;
            } else if (typeof err === 'string') {
                errorMessage = err;
            }
            setNotification({ type: 'error', message: errorMessage });
        } finally {
            setIsSending(false);
        }
    };

    const openProposalPreview = () => {
        if (selectedPartner) {
            window.open(`/#/${selectedPartner.Slug}/propozycja`, '_blank');
        } else {
            alert("Wybierz najpierw partnera z listy.");
        }
    };

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-2 min-h-[600px] relative">
            
            {/* TOAST NOTIFICATION */}
            {notification && (
                <div className={`fixed bottom-6 right-6 max-w-md p-4 rounded-xl shadow-2xl flex items-start gap-3 z-[100] animate-in slide-in-from-bottom-4 ${notification.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
                    <div className="mt-0.5">
                        {notification.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-sm uppercase tracking-wide mb-1">
                            {notification.type === 'error' ? 'Błąd Wysyłki' : 'Sukces'}
                        </h4>
                        <p className="text-sm font-medium opacity-90 leading-relaxed">
                            {notification.message}
                        </p>
                    </div>
                    <button onClick={() => setNotification(null)} className="opacity-50 hover:opacity-100 transition-opacity">
                        <X size={18} />
                    </button>
                </div>
            )}

            <div className="mb-8">
                <h2 className="text-3xl font-display font-black text-slate-900 mb-2 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Mail size={20} />
                    </div>
                    Centrum Wiadomości
                </h2>
                <p className="text-slate-500 font-medium">Wyślij wiadomości bezpośrednio do partnerów lub klientów.</p>
            </div>

            {/* STEP 1: SELECT RECIPIENT */}
            {step === 1 && (
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
                    <div className="mb-6 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Szukaj partnera (nazwa, email)..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium bg-slate-50"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {/* Option: Custom Recipient */}
                        <button 
                            onClick={handleSelectCustom}
                            className="text-left p-4 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 transition-all group flex flex-col justify-center items-center text-center min-h-[100px]"
                        >
                            <div className="w-10 h-10 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                <UserPlus size={20} />
                            </div>
                            <h3 className="font-bold text-blue-900">Napisz do dowolnego adresata</h3>
                            <p className="text-xs text-blue-600 mt-1">Wpisz mail ręcznie</p>
                        </button>

                        {/* Partners List */}
                        {filteredPartners.map(p => (
                            <button 
                                key={p.Id}
                                onClick={() => handleSelectPartner(p)}
                                className="text-left p-4 rounded-xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50 transition-all group relative bg-white"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-slate-900 group-hover:text-blue-700">{p.PartnerName}</h3>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${p.Status === 'AKTYWNY' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {p.Status}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 truncate">{p.contact_email || 'Brak emaila'}</p>
                            </button>
                        ))}
                        
                        {filteredPartners.length === 0 && searchQuery && (
                            <div className="col-span-full text-center py-10 text-slate-400 italic">Brak partnerów pasujących do wyszukiwania.</div>
                        )}
                    </div>
                </div>
            )}

            {/* STEP 2: COMPOSE */}
            {step === 2 && (
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row h-[850px]">
                    
                    {/* Left: Form */}
                    <div className="w-full md:w-1/2 p-8 flex flex-col border-r border-slate-100 overflow-y-auto custom-scrollbar">
                        <button onClick={() => setStep(1)} className="text-slate-400 hover:text-slate-800 font-bold text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                            <ArrowRight className="rotate-180" size={14} /> Zmień Odbiorcę
                        </button>

                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-6 space-y-4">
                            {/* Sender Selection (Email) */}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Nadawca Email (From)</label>
                                <div className="relative">
                                    <select 
                                        value={senderEmail}
                                        onChange={(e) => setSenderEmail(e.target.value)}
                                        className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:border-blue-500 appearance-none pr-10 text-sm"
                                    >
                                        {VERIFIED_SENDERS.map(email => (
                                            <option key={email} value={email}>{email}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                </div>
                            </div>

                            {/* Signer Selection (Footer) */}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1 flex items-center gap-1">
                                    <PenTool size={12} /> Podpisz jako (Stopka)
                                </label>
                                <div className="relative">
                                    <select 
                                        value={selectedSignerId}
                                        onChange={(e) => setSelectedSignerId(e.target.value ? Number(e.target.value) : '')}
                                        className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:border-blue-500 appearance-none pr-10 text-sm"
                                    >
                                        {salespeople.map(s => (
                                            <option key={s.id} value={s.id}>{s.imie} {s.nazwisko}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                </div>
                            </div>

                            {/* Recipient Input - Email */}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Odbiorca Email (To)</label>
                                <input 
                                    type="email"
                                    value={recipientEmail}
                                    onChange={(e) => setRecipientEmail(e.target.value)}
                                    placeholder="adres@odbiorcy.pl"
                                    className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-blue-500 text-sm"
                                />
                            </div>

                            {/* Recipient Input - NAME (Greeting) */}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1 flex items-center gap-1">
                                    <User size={12} /> Imię Odbiorcy (do powitania)
                                </label>
                                <input 
                                    type="text"
                                    value={recipientName}
                                    onChange={(e) => setRecipientName(e.target.value)}
                                    placeholder="np. Anno (użyte w 'Cześć Anno,')"
                                    className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-blue-500 text-sm"
                                />
                                {selectedPartner && (
                                    <div className="mt-1 text-[10px] text-slate-400 font-medium px-1">
                                        Partner z bazy: <span className="text-blue-600 font-bold">{selectedPartner.PartnerName}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4 flex-1">
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Szablon</label>
                                    <select 
                                        value={template} 
                                        onChange={(e: any) => setTemplate(e.target.value)}
                                        className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:border-blue-500 text-sm"
                                    >
                                        <option value="EMPTY">Pusty (Własna treść)</option>
                                        <option value="POST_MEETING">Po spotkaniu (Załącznik: Landing Page)</option>
                                    </select>
                                </div>
                                {selectedPartner && template === 'POST_MEETING' && (
                                    <div className="pt-5">
                                        <button 
                                            onClick={openProposalPreview}
                                            className="px-4 py-3 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors flex items-center gap-2 whitespace-nowrap"
                                        >
                                            <Eye size={16} /> Zobacz Landing Page
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Temat</label>
                                <input 
                                    type="text" 
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full p-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="flex-1 flex flex-col">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Treść (HTML)</label>
                                <textarea 
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    className="w-full flex-1 min-h-[200px] p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-700 focus:outline-none focus:border-blue-500 resize-none"
                                />
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100">
                            {!sentSuccess ? (
                                <button 
                                    onClick={handleSend}
                                    disabled={isSending}
                                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-lg shadow-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isSending ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                                    {isSending ? 'Wysyłanie...' : 'Wyślij Wiadomość'}
                                </button>
                            ) : (
                                <div className="w-full py-4 bg-green-100 text-green-700 rounded-xl font-bold text-lg flex items-center justify-center gap-2 animate-in zoom-in">
                                    <CheckCircle2 size={24} /> Wysłano pomyślnie!
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Preview */}
                    <div className="w-full md:w-1/2 bg-slate-100 p-8 flex flex-col">
                        <div className="mb-4 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Podgląd Odbiorcy</span>
                        </div>
                        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative flex flex-col">
                            {/* Email Header Simulation */}
                            <div className="bg-slate-50 border-b border-slate-100 p-4 text-xs space-y-1">
                                <div className="flex gap-2">
                                    <span className="font-bold text-slate-500 w-12 text-right">Od:</span>
                                    <span className="text-slate-800">{senderEmail}</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="font-bold text-slate-500 w-12 text-right">Do:</span>
                                    <span className="text-slate-800 font-medium">{recipientEmail || '(brak)'}</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="font-bold text-slate-500 w-12 text-right">Temat:</span>
                                    <span className="text-slate-900 font-bold">{subject || '(brak)'}</span>
                                </div>
                            </div>
                            
                            {/* Email Body Preview */}
                            <iframe 
                                srcDoc={body || '<div style="color:#ccc;font-family:sans-serif;padding:20px;text-align:center;">Tu pojawi się treść wiadomości...</div>'} 
                                className="w-full flex-1 border-0" 
                                title="Email Preview"
                                sandbox="allow-same-origin"
                            />
                        </div>
                    </div>

                </div>
            )}
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>
        </div>
    );
};
