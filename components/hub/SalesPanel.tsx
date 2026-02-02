
import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient.ts';
import { Partner } from '../../types.ts';
import { Link } from 'react-router-dom';
import { 
  Loader2, Plus, X, Upload, CheckCircle2, FileText, Settings,
  ChevronRight, ChevronLeft, DollarSign, BarChart3, Ticket, FileCheck, Eye, Edit3, ExternalLink, MapPin, Globe, Mail, User, Briefcase, Smartphone, ArrowRight, Building2, Phone
} from 'lucide-react';

interface SalesPanelProps {
    salespersonId: number;
    salespersonName?: string;
}

export const SalesPanel: React.FC<SalesPanelProps> = ({ salespersonId, salespersonName }) => {
    const [myPartners, setMyPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    
    // UI Modes
    const [mode, setMode] = useState<'LIST' | 'FORM' | 'DETAILS'>('LIST');
    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

    // Dictionary Data
    const [ageGroupOptions, setAgeGroupOptions] = useState<{Id: number, AgeGroup: string}[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        genitive: '',
        slug: '',
        email: '',
        phone: '', // NOWE
        city: '',
        type: 'Sala Zabaw',
        status: 'BRAK' as 'AKTYWNY' | 'NIEAKTYWNY' | 'BRAK',
        model: 'BRAK' as 'PAKIET' | 'PROWIZJA' | 'BRAK',
        packetAmount: 0,
        sellPrice: '' as number | '', // NOWE
        ageGroups: [] as string[]
    });
    
    // File State
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [contractFile, setContractFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Details View Extra State
    const [addCodesAmount, setAddCodesAmount] = useState<number | ''>('');

    // Fetch Base Data
    useEffect(() => {
        if (salespersonId) fetchMyPartners();
        fetchAgeGroups();
    }, [salespersonId]);

    const fetchAgeGroups = async () => {
        const { data } = await supabase.schema('PartnersApp').from('AgeGroups').select('Id, AgeGroup');
        if (data) setAgeGroupOptions(data);
    };

    const fetchMyPartners = async () => {
        setLoading(true);
        // FETCH PARTNERS AND THEIR JOINED AGE GROUPS
        const { data } = await supabase
            .schema('PartnersApp')
            .from('Partners')
            .select(`
                *,
                PartnerAgeGroups (
                    AgeGroups (
                        AgeGroup
                    )
                )
            `)
            .eq('IdOpiekuna', salespersonId);
        
        setMyPartners(data || []);
        setLoading(false);
    };

    // --- FORM HANDLERS ---
    
    const handleInitForm = (partner?: Partner) => {
        if (partner) {
            // Edit Mode - Extract Age Groups from Joined Data
            let loadedAgeGroups: string[] = [];
            if (partner.PartnerAgeGroups && Array.isArray(partner.PartnerAgeGroups)) {
                loadedAgeGroups = partner.PartnerAgeGroups
                    .map((item: any) => item.AgeGroups?.AgeGroup)
                    .filter(Boolean);
            }

            setFormData({
                name: partner.PartnerName,
                genitive: partner.PartnerNameGenitive || '',
                slug: partner.Slug,
                email: partner.contact_email || '',
                phone: partner.contact_number || '', // LOAD PHONE
                city: partner.Miasto || '',
                type: partner.PartnerType || 'Sala Zabaw',
                status: partner.Status,
                model: partner.Model || 'BRAK',
                packetAmount: partner.SprzedazIlosc || 0,
                sellPrice: partner.SellPrice || '', // LOAD SELL PRICE
                ageGroups: loadedAgeGroups
            });
            setSelectedPartner(partner);
        } else {
            // New Mode
            setFormData({
                name: '', genitive: '', slug: '', email: '', phone: '', city: '',
                type: 'Sala Zabaw', status: 'BRAK', model: 'BRAK',
                packetAmount: 0, sellPrice: '', ageGroups: []
            });
            setSelectedPartner(null);
        }
        setLogoFile(null);
        setContractFile(null);
        setMode('FORM');
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        // Only auto-generate slug if adding new
        if (!selectedPartner) {
             const slug = val.toLowerCase()
                .replace(/ł/g, 'l').replace(/ś/g, 's').replace(/ć/g, 'c').replace(/ą/g, 'a').replace(/ę/g, 'e').replace(/ó/g, 'o').replace(/ń/g, 'n').replace(/ż/g, 'z').replace(/ź/g, 'z')
                .replace(/[^a-z0-9\s-]/g, '')
                .trim()
                .replace(/\s+/g, '-');
             setFormData(prev => ({ ...prev, name: val, slug }));
        } else {
             setFormData(prev => ({ ...prev, name: val }));
        }
    };

    const toggleAgeGroup = (group: string) => {
        setFormData(prev => {
            if (prev.ageGroups.includes(group)) {
                return { ...prev, ageGroups: prev.ageGroups.filter(g => g !== group) };
            }
            return { ...prev, ageGroups: [...prev.ageGroups, group] };
        });
    };

    const handleSavePartner = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // --- FIX: SANITIZATION FUNCTION ---
            const sanitizeForStorage = (text: string) => {
                return text.toLowerCase()
                    .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e')
                    .replace(/ł/g, 'l').replace(/ń/g, 'n').replace(/ó/g, 'o')
                    .replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z')
                    .replace(/\s+/g, '_')
                    .replace(/[^a-z0-9_]/g, '');
            };

            const cityFolder = formData.city ? sanitizeForStorage(formData.city.trim()) : 'unknown';
            const nameFolder = sanitizeForStorage(formData.name.trim());
            
            const basePath = `Partners/${cityFolder}/${nameFolder}`;
            
            let logoUrl = selectedPartner?.LogoUrl || null;
            let contractUrl = selectedPartner?.UmowaUrl || null;

            if (logoFile) {
                const ext = logoFile.name.split('.').pop();
                const path = `${basePath}/Logo_${nameFolder}.${ext}`;
                const { error: uploadError } = await supabase.storage.from('PartnersApp').upload(path, logoFile, { upsert: true });
                if (uploadError) throw uploadError;
                const { data: publicUrl } = supabase.storage.from('PartnersApp').getPublicUrl(path);
                logoUrl = publicUrl.publicUrl;
            }

            if (contractFile) {
                const ext = contractFile.name.split('.').pop();
                const path = `${basePath}/Umowa_${nameFolder}.${ext}`;
                const { error: uploadError } = await supabase.storage.from('PartnersApp').upload(path, contractFile, { upsert: true });
                if (uploadError) throw uploadError;
                const { data: publicUrl } = supabase.storage.from('PartnersApp').getPublicUrl(path);
                contractUrl = publicUrl.publicUrl;
            }

            const payload = {
                PartnerName: formData.name,
                PartnerNameGenitive: formData.genitive || null,
                Slug: formData.slug,
                contact_email: formData.email,
                contact_number: formData.phone || null, // SAVE PHONE
                PartnerType: formData.type,
                IdOpiekuna: salespersonId,
                Status: formData.status,
                Model: formData.model,
                Miasto: formData.city,
                LogoUrl: logoUrl,
                UmowaUrl: contractUrl,
                SprzedazIlosc: formData.model === 'PAKIET' ? formData.packetAmount : (selectedPartner?.SprzedazIlosc || 0),
                SellPrice: formData.model === 'PROWIZJA' && formData.sellPrice !== '' ? Number(formData.sellPrice) : (selectedPartner?.SellPrice || null) // SAVE PRICE
            };

            let partnerId = selectedPartner?.Id;
            let error;

            if (selectedPartner) {
                const res = await supabase.schema('PartnersApp').from('Partners').update(payload).eq('Id', selectedPartner.Id).select();
                error = res.error;
            } else {
                const res = await supabase.schema('PartnersApp').from('Partners').insert(payload).select();
                error = res.error;
                if (res.data) partnerId = res.data[0].Id;
            }

            if (error) throw error;

            if (partnerId) {
                await supabase.schema('PartnersApp').from('PartnerAgeGroups').delete().eq('partner_id', partnerId);
                
                if (formData.ageGroups.length > 0) {
                    const relationInserts = formData.ageGroups.map(groupStr => {
                        const groupObj = ageGroupOptions.find(opt => opt.AgeGroup === groupStr);
                        return groupObj ? { partner_id: partnerId, age_group_id: groupObj.Id } : null;
                    }).filter(Boolean);

                    if (relationInserts.length > 0) {
                        const { error: relError } = await supabase.schema('PartnersApp').from('PartnerAgeGroups').insert(relationInserts);
                        if (relError) console.error("Błąd zapisu relacji PartnerAgeGroups:", relError);
                    }
                }
            }

            alert(selectedPartner ? 'Partner zaktualizowany!' : 'Partner dodany!');
            setMode('DETAILS'); // Stay in details after edit
            if (!selectedPartner && partnerId) {
                 // If new, switch to details of new partner (simple reload for now)
                 setMode('LIST');
            }
            fetchMyPartners();

        } catch (err: any) {
            console.error(err);
            alert('Błąd zapisu: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // --- DETAILS ACTIONS ---

    const handleAddCodes = () => {
        if (!addCodesAmount || Number(addCodesAmount) <= 0) return;
        alert(`KODY ZOSTAŁY POMYŚLNIE DODANE (${addCodesAmount} szt.) ORAZ WYSŁANE NA ADRES MAILOWY PARTNERA.`);
        setAddCodesAmount('');
    };

    // --- RENDER HELPERS ---
    
    const simulateStats = (partner: Partner) => {
        const revenue = 1000;
        const commission = Math.round((revenue / 2) * 0.20);
        const totalCodes = partner.SprzedazIlosc || 0;
        const usedCodes = Math.floor(totalCodes * 0.4);
        const availableCodes = totalCodes - usedCodes;
        return { revenue, commission, totalCodes, usedCodes, availableCodes };
    };
    
    // UI Component for Detail Row (Replica of screenshot style)
    const InfoRow = ({ icon, label, value, isFile, isList }: { icon: any, label: string, value: any, isFile?: boolean, isList?: boolean }) => (
        <div className="flex items-start gap-4">
            <div className="mt-1 text-slate-300">
                {icon}
            </div>
            <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</div>
                <div className="font-bold text-slate-800 text-sm">
                    {isFile ? (
                        value ? <a href={value} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">Zobacz plik</a> : <span className="text-slate-400 italic">Brak pliku</span>
                    ) : isList ? (
                         Array.isArray(value) && value.length > 0 ? (
                            <div className="flex flex-wrap gap-1 mt-1">
                                {value.map((v: string) => <span key={v} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-bold">{v}</span>)}
                            </div>
                         ) : <span className="text-slate-400 italic">Brak danych</span>
                    ) : (
                        value || <span className="text-slate-400 italic">Brak danych</span>
                    )}
                </div>
            </div>
        </div>
    );

    if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-slate-300" /></div>;

    // --- VIEW: LIST ---
    if (mode === 'LIST') return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-display font-black text-slate-900 mb-1">Twoi Partnerzy</h2>
                    <p className="text-slate-500 font-medium">
                        Zarządzaj bazą. Liczba partnerów: <strong className="text-slate-900">{myPartners.length}</strong>
                    </p>
                </div>
                <button 
                    onClick={() => handleInitForm()}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                >
                    <Plus size={20} /> Dodaj Partnera
                </button>
            </div>

            {myPartners.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myPartners.map(p => (
                        <div key={p.Id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative cursor-pointer" onClick={() => { setSelectedPartner(p); setMode('DETAILS'); }}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center text-lg font-bold text-slate-700 overflow-hidden border border-slate-100">
                                     {p.LogoUrl ? <img src={p.LogoUrl} className="w-full h-full object-cover" /> : p.PartnerName.charAt(0)}
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${p.Status === 'AKTYWNY' ? 'bg-green-100 text-green-700' : p.Status === 'BRAK' ? 'bg-slate-100 text-slate-500' : 'bg-red-100 text-red-700'}`}>
                                        {p.Status}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{p.Miasto || 'Brak miasta'}</span>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{p.PartnerName}</h3>
                            <p className="text-sm text-slate-500 font-medium truncate">{p.contact_email}</p>
                            
                            <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-400 uppercase">{p.Model}</span>
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                    <ChevronRight size={16} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-12 text-center bg-white rounded-[2rem] border border-dashed border-slate-300">
                    <p className="text-slate-400 font-medium">Brak partnerów.</p>
                </div>
            )}
        </div>
    );

    // --- VIEW: FORM (ADD/EDIT) ---
    if (mode === 'FORM') return (
        <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-4 bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 relative">
             <button onClick={() => setMode(selectedPartner ? 'DETAILS' : 'LIST')} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800"><X size={24} /></button>
             <h3 className="text-2xl font-black text-slate-900 mb-6">{selectedPartner ? 'Edytuj Partnera' : 'Nowy Partner'}</h3>
             
             <form onSubmit={handleSavePartner} className="space-y-6">
                {/* Form fields same as before... keeping it concise */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nazwa Firmy <span className="text-red-500">*</span></label>
                        <input required type="text" value={formData.name} onChange={handleNameChange} className="input-std" placeholder="np. Kraina Zabawy" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Miasto <span className="text-red-500">*</span></label>
                        <input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="input-std" placeholder="np. Warszawa" />
                     </div>
                </div>
                
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nazwa w dopełniaczu (dla nagłówka)</label>
                    <input type="text" value={formData.genitive} onChange={e => setFormData({...formData, genitive: e.target.value})} className="input-std" placeholder="np. Krainy Zabawy" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Slug (URL) <span className="text-red-500">*</span></label>
                        <input required type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="input-std bg-slate-50 text-slate-500" readOnly={!!selectedPartner} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email kontaktowy <span className="text-red-500">*</span></label>
                        <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="input-std" placeholder="mail@firma.pl" />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telefon Kontaktowy</label>
                    <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="input-std" placeholder="np. 600 500 400" />
                </div>

                <div className="p-6 bg-slate-50 rounded-2xl space-y-4 border border-slate-100">
                    <h4 className="font-black text-slate-800 text-sm uppercase flex items-center gap-2"><Settings size={14}/> Konfiguracja</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                            <select value={formData.status} onChange={(e: any) => setFormData({...formData, status: e.target.value})} className="input-std">
                                <option value="BRAK">BRAK</option>
                                <option value="AKTYWNY">AKTYWNY</option>
                                <option value="NIEAKTYWNY">NIEAKTYWNY</option>
                            </select>
                        </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Model</label>
                            <select value={formData.model} onChange={(e: any) => setFormData({...formData, model: e.target.value})} className="input-std">
                                <option value="BRAK">BRAK</option>
                                <option value="PROWIZJA">PROWIZJA</option>
                                <option value="PAKIET">PAKIET</option>
                            </select>
                        </div>
                    </div>
                    {formData.model === 'PAKIET' && (
                         <div className="space-y-1 animate-in fade-in">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Zakupiona ilość kodów</label>
                            <input type="number" value={formData.packetAmount} onChange={e => setFormData({...formData, packetAmount: Number(e.target.value)})} className="input-std bg-white border-blue-200 text-blue-800" />
                         </div>
                    )}
                    {formData.model === 'PROWIZJA' && (
                         <div className="space-y-1 animate-in fade-in">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ustalona Cena Sprzedaży (PLN)</label>
                            <input 
                                type="number" 
                                value={formData.sellPrice} 
                                onChange={e => setFormData({...formData, sellPrice: e.target.value === '' ? '' : Number(e.target.value)})} 
                                className="input-std bg-white border-green-200 text-green-800 font-bold" 
                                placeholder="np. 149"
                            />
                         </div>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grupy Wiekowe</label>
                    <div className="flex flex-wrap gap-2">
                        {ageGroupOptions.length > 0 ? (
                            ageGroupOptions.map(opt => (
                                <button 
                                    key={opt.Id} type="button" 
                                    onClick={() => toggleAgeGroup(opt.AgeGroup)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${formData.ageGroups.includes(opt.AgeGroup) ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                                >
                                    {opt.AgeGroup} lat
                                </button>
                            ))
                        ) : (
                            <div className="text-xs text-slate-400">Ładowanie grup wiekowych...</div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Logo</label>
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50 transition-colors relative">
                            <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                            <div className="flex flex-col items-center gap-1">
                                {logoFile ? <CheckCircle2 className="text-green-500" /> : <Upload className="text-slate-300" />}
                                <span className="text-xs font-bold text-slate-500 truncate max-w-full">{logoFile ? logoFile.name : 'Wgraj plik'}</span>
                            </div>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Umowa</label>
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50 transition-colors relative">
                            <input type="file" accept=".pdf,image/*" onChange={e => setContractFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                            <div className="flex flex-col items-center gap-1">
                                {contractFile ? <CheckCircle2 className="text-green-500" /> : <FileText className="text-slate-300" />}
                                <span className="text-xs font-bold text-slate-500 truncate max-w-full">{contractFile ? contractFile.name : 'Wgraj plik'}</span>
                            </div>
                        </div>
                     </div>
                </div>

                <button disabled={submitting} type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-black shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    {submitting ? <Loader2 className="animate-spin" /> : 'Zapisz Partnera'}
                </button>
             </form>
             <style>{` .input-std { width: 100%; padding: 0.75rem 1rem; border-radius: 0.75rem; background-color: #f8fafc; border: 1px solid #e2e8f0; font-weight: 600; color: #334155; outline: none; transition: all 0.2s; } .input-std:focus { border-color: #3b82f6; background-color: #ffffff; } `}</style>
        </div>
    );

    // --- VIEW: DETAILS (REDESIGNED) ---
    if (mode === 'DETAILS' && selectedPartner) {
        const stats = simulateStats(selectedPartner);
        
        let displayAgeGroups: string[] = [];
        if (selectedPartner.PartnerAgeGroups && Array.isArray(selectedPartner.PartnerAgeGroups)) {
            displayAgeGroups = selectedPartner.PartnerAgeGroups.map((item: any) => item.AgeGroups?.AgeGroup).filter(Boolean);
        }

        return (
            <div className="max-w-6xl mx-auto animate-in slide-in-from-right-4 pb-20">
                {/* 1. HEADER */}
                <div className="mb-8 flex items-center gap-4">
                    <button onClick={() => setMode('LIST')} className="bg-white p-3 rounded-full shadow-sm text-slate-500 hover:text-slate-900 transition-colors"><ChevronLeft size={20}/></button>
                    <div>
                        <h2 className="text-3xl lg:text-4xl font-display font-black text-slate-900 leading-none">{selectedPartner.PartnerName}</h2>
                        <div className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">{selectedPartner.Miasto || 'Brak Miasta'}</div>
                    </div>
                </div>

                {/* 2. TILES SECTION (NEW) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    
                    {/* KAFELEK 1: APLIKACJA PARTNERA (B2C) */}
                    <div className="p-8 bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-[2rem] shadow-xl relative overflow-hidden group hover:scale-[1.01] transition-transform">
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                                <Smartphone size={32} className="text-white" />
                            </div>
                            <h3 className="text-2xl font-black mb-2 uppercase tracking-wide">ZOBACZ WZÓR APLIKACJI PARTNERA</h3>
                            <p className="opacity-80 mb-8 text-sm font-medium leading-relaxed">
                                Podgląd jak będzie wyglądała spersonalizowana aplikacja partnera - którą będzie przedstawiał swoim klientom.
                            </p>
                            <Link 
                                to={`/${selectedPartner.Slug}`} 
                                target="_blank"
                                className="mt-auto inline-flex items-center justify-center gap-2 bg-white text-blue-800 px-6 py-4 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg"
                            >
                                WYŚWIETL APLIKACJĘ <ArrowRight size={18} />
                            </Link>
                        </div>
                        <Smartphone className="absolute -bottom-10 -right-10 text-white w-64 h-64 opacity-10 rotate-12 group-hover:rotate-6 transition-transform duration-500" />
                    </div>

                    {/* KAFELEK 2: OFERTA B2B */}
                    <div className="p-8 bg-slate-900 text-white rounded-[2rem] shadow-xl relative overflow-hidden border-2 border-slate-800 group hover:scale-[1.01] transition-transform">
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/10">
                                <Briefcase size={32} className="text-amber-400" />
                            </div>
                            <h3 className="text-2xl font-black mb-2 uppercase tracking-wide text-amber-400">ZOBACZ OFERTĘ DLA PARTNERA</h3>
                            <p className="text-slate-400 mb-8 text-sm font-medium leading-relaxed">
                                Podgląd spersonalizowanej oferty B2B dla partnera.
                            </p>
                            <Link 
                                to={`/${selectedPartner.Slug}/oferta-b2b`}
                                target="_blank"
                                className="mt-auto inline-flex items-center justify-center gap-2 bg-amber-400 text-slate-900 px-6 py-4 rounded-xl font-bold hover:bg-amber-300 transition-colors shadow-lg shadow-amber-400/20"
                            >
                                WYŚWIETL OFERTĘ <ArrowRight size={18} />
                            </Link>
                        </div>
                        <Building2 className="absolute -bottom-10 -right-10 text-slate-700 w-64 h-64 opacity-20 -rotate-12 group-hover:-rotate-6 transition-transform duration-500" />
                    </div>

                </div>

                {/* 3. DATA GRID (Like Screenshot) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    
                    {/* LEFT CARD: Dane Partnera */}
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2"><User size={20} /> Dane Partnera</h3>
                            <button onClick={() => handleInitForm(selectedPartner!)} className="text-blue-600 text-xs font-bold hover:underline">Edytuj sekcję</button>
                        </div>
                        <div className="space-y-6 flex-1">
                            <InfoRow icon={<Settings size={18}/>} label="Nazwa Firmy" value={selectedPartner.PartnerName} />
                            <InfoRow icon={<FileText size={18}/>} label="Dopełniacz (Nagłówek)" value={selectedPartner.PartnerNameGenitive} />
                            <InfoRow icon={<Globe size={18}/>} label="Slug (Link)" value={selectedPartner.Slug} />
                            <InfoRow icon={<MapPin size={18}/>} label="Miasto" value={selectedPartner.Miasto} />
                            <InfoRow icon={<Mail size={18}/>} label="Email Kontaktowy" value={selectedPartner.contact_email} />
                            <InfoRow icon={<Phone size={18}/>} label="Telefon Kontaktowy" value={selectedPartner.contact_number} />
                        </div>
                    </div>

                    {/* RIGHT CARD: Konfiguracja */}
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col">
                         <div className="flex justify-between items-center mb-8">
                            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2"><Settings size={20} /> Konfiguracja</h3>
                            <button onClick={() => handleInitForm(selectedPartner!)} className="text-blue-600 text-xs font-bold hover:underline">Edytuj sekcję</button>
                        </div>
                        <div className="space-y-6 flex-1">
                            <InfoRow icon={<CheckCircle2 size={18}/>} label="Status" value={selectedPartner.Status} />
                            <InfoRow icon={<DollarSign size={18}/>} label="Model Rozliczeń" value={selectedPartner.Model} />
                            {selectedPartner.Model === 'PROWIZJA' && (
                                <InfoRow icon={<DollarSign size={18}/>} label="Cena Sprzedaży" value={selectedPartner.SellPrice ? `${selectedPartner.SellPrice} PLN` : 'Nie ustalono'} />
                            )}
                            <InfoRow icon={<Settings size={18}/>} label="Grupy Wiekowe" value={displayAgeGroups} isList />
                            <InfoRow icon={<Upload size={18}/>} label="Logo" value={selectedPartner.LogoUrl} isFile />
                            <InfoRow icon={<FileText size={18}/>} label="Umowa" value={selectedPartner.UmowaUrl} isFile />
                        </div>
                    </div>
                </div>

                {/* 4. CODE MANAGEMENT */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 mb-8">
                     <div className="flex items-center justify-between mb-8">
                         <h3 className="text-xl font-black text-slate-900 flex items-center gap-2"><Ticket size={22} className="text-slate-400" /> Zarządzanie Kodami</h3>
                         <div className="text-right">
                             <div className="text-xs font-bold text-slate-400 uppercase">Model</div>
                             <div className="font-bold text-slate-900">{selectedPartner.Model}</div>
                         </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                         <div className="p-4 bg-slate-50 rounded-2xl text-center">
                             <div className="text-2xl font-black text-slate-900">{stats.totalCodes}</div>
                             <div className="text-[10px] font-bold text-slate-400 uppercase">Wszystkie</div>
                         </div>
                         <div className="p-4 bg-green-50 rounded-2xl text-center border border-green-100">
                             <div className="text-2xl font-black text-green-700">{stats.availableCodes}</div>
                             <div className="text-[10px] font-bold text-green-600 uppercase">Dostępne</div>
                         </div>
                         <div className="p-4 bg-slate-50 rounded-2xl text-center opacity-60">
                             <div className="text-2xl font-black text-slate-900">{stats.usedCodes}</div>
                             <div className="text-[10px] font-bold text-slate-400 uppercase">Użyte</div>
                         </div>
                     </div>

                     <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                         <h4 className="font-bold text-slate-700 mb-4 text-sm">Dodaj pule kodów</h4>
                         <div className="flex gap-4">
                             <input 
                                type="number" 
                                placeholder="Ilość np. 50" 
                                value={addCodesAmount}
                                onChange={e => setAddCodesAmount(e.target.value === '' ? '' : Number(e.target.value))}
                                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-bold"
                             />
                             <button onClick={handleAddCodes} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors">
                                 Dodaj i wyślij
                             </button>
                         </div>
                     </div>
                </div>

                {/* 5. FINANCIAL SECTION */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                     <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2"><DollarSign size={22} className="text-slate-400" /> Finanse (Symulacja)</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-6 rounded-[1.5rem] flex items-center gap-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><DollarSign size={24}/></div>
                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase">Przychód Partnera</div>
                                <div className="text-2xl font-black text-slate-900">{stats.revenue} PLN</div>
                            </div>
                        </div>
                        <div className="bg-emerald-50 p-6 rounded-[1.5rem] flex items-center gap-4 border border-emerald-100">
                            <div className="p-3 bg-white text-emerald-600 rounded-xl shadow-sm"><BarChart3 size={24}/></div>
                            <div>
                                <div className="text-xs font-bold text-emerald-600 uppercase">Twoja Prowizja</div>
                                <div className="text-2xl font-black text-emerald-800">{stats.commission} PLN</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        );
    }

    return null;
};
