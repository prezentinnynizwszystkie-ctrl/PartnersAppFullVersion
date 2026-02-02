
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Partner, Handlowiec } from '../../types';
import { ChevronRight, Briefcase, ArrowRight, Search, MapPin, User, Wallet, CheckCircle2, XCircle, AlertCircle, Smartphone, ExternalLink, Rocket } from 'lucide-react';

interface AdminViewProps {
    partners: Partner[];
    salespeople: Handlowiec[];
    activeSection: 'PARTNERS' | 'SALES';
    onViewPartner: (slug: string) => void;
    onViewSalesperson: (person: Handlowiec) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ partners, salespeople, activeSection, onViewPartner, onViewSalesperson }) => {
    const [searchQuery, setSearchQuery] = useState('');

    // Helper: Znajdź opiekuna dla partnera
    const getSalesperson = (id: number | null) => {
        if (!id) return null;
        return salespeople.find(s => s.id === id);
    };

    // Filter Logic
    const filteredPartners = partners.filter(p => {
        const query = searchQuery.toLowerCase();
        const salesperson = getSalesperson(p.IdOpiekuna);
        const salespersonName = salesperson ? `${salesperson.imie} ${salesperson.nazwisko}`.toLowerCase() : '';

        return (
            p.PartnerName.toLowerCase().includes(query) ||
            (p.Miasto || '').toLowerCase().includes(query) ||
            p.Slug.toLowerCase().includes(query) ||
            salespersonName.includes(query)
        );
    });

    if (activeSection === 'PARTNERS') {
        return (
            <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2">
                
                {/* --- DEV TOOLS SECTION (HARDCODED PREVIEW) --- */}
                <div className="mb-10 bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl border border-slate-700">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Rocket size={120} />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="bg-blue-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full">DEV TOOLS</span>
                                <h2 className="text-2xl font-display font-black">Szybki Podgląd: Nibylandia</h2>
                            </div>
                            <p className="text-slate-400 font-medium max-w-lg">
                                Użyj tych przycisków, aby szybko sprawdzić jak wyglądają zmiany w aplikacji B2C (dla klienta) oraz ofercie B2B (dla partnera).
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <a 
                                href="/#/nibylandia" 
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-3 bg-white text-slate-900 px-6 py-4 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg"
                            >
                                <Smartphone size={20} className="text-blue-600" />
                                Aplikacja B2C
                            </a>
                            <a 
                                href="/#/nibylandia/oferta-b2b" 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-center gap-3 bg-[#fccb00] text-slate-900 px-6 py-4 rounded-xl font-bold hover:bg-[#e5b800] transition-colors shadow-lg"
                            >
                                <Briefcase size={20} className="text-slate-900" />
                                Oferta B2B
                            </a>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-display font-black text-slate-900 mb-1">Baza Partnerów</h2>
                        <p className="text-slate-500 font-medium">Zarządzaj obiektami i monitoruj wyniki.</p>
                    </div>
                    
                    {/* Wyszukiwarka */}
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Szukaj (nazwa, miasto, opiekun)..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium shadow-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPartners.map(p => {
                        const opiekun = getSalesperson(p.IdOpiekuna);
                        
                        return (
                            <div
                                key={p.Id}
                                className="group relative bg-white border border-slate-200 rounded-[2rem] text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-blue-200 flex flex-col h-full overflow-hidden"
                            >
                                {/* Ciało Kafelka (Klikalne -> Szczegóły) */}
                                <div 
                                    onClick={() => onViewPartner(p.Slug)}
                                    className="p-6 flex-1 cursor-pointer"
                                >
                                    {/* Header: Logo + Status */}
                                    <div className="flex justify-between items-start mb-4 w-full">
                                        <div 
                                            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold font-display shadow-sm overflow-hidden bg-slate-50 border border-slate-100"
                                            style={{ color: p.Theme?.primaryColor || '#64748b' }}
                                        >
                                            {p.LogoUrl ? (
                                                <img src={p.LogoUrl} alt="" className="w-full h-full object-cover p-2" />
                                            ) : (
                                                p.PartnerName.charAt(0)
                                            )}
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                                            p.Status === 'AKTYWNY' ? 'bg-green-100 text-green-700' : 
                                            p.Status === 'NIEAKTYWNY' ? 'bg-red-100 text-red-700' : 
                                            'bg-slate-100 text-slate-500'
                                        }`}>
                                            {p.Status === 'AKTYWNY' && <CheckCircle2 size={12} />}
                                            {p.Status === 'NIEAKTYWNY' && <XCircle size={12} />}
                                            {p.Status === 'BRAK' && <AlertCircle size={12} />}
                                            {p.Status}
                                        </span>
                                    </div>

                                    {/* Main Info */}
                                    <div className="mb-2">
                                        <h3 className="text-xl font-black text-slate-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors">
                                            {p.PartnerName}
                                        </h3>
                                        <div className="flex items-center gap-1 text-slate-400 text-xs font-bold uppercase tracking-wide mb-3">
                                            <MapPin size={12} /> {p.Miasto || 'Brak lokalizacji'}
                                        </div>
                                        
                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-500 font-medium flex items-center gap-1.5"><User size={12}/> Opiekun:</span>
                                                <span className="text-slate-900 font-bold">{opiekun ? `${opiekun.imie} ${opiekun.nazwisko}` : '-'}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-500 font-medium flex items-center gap-1.5"><Wallet size={12}/> Przychód:</span>
                                                <span className="text-emerald-600 font-black">{p.SprzedazWartosc || 0} PLN</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-end mt-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 hover:text-blue-600 transition-colors">
                                            Edytuj dane <ChevronRight size={12} />
                                        </span>
                                    </div>
                                </div>

                                {/* Footer (Akcje Podglądu) */}
                                <div className="bg-slate-50 border-t border-slate-100 p-3 grid grid-cols-2 gap-3">
                                    <Link 
                                        to={`/${p.Slug}`} 
                                        target="_blank"
                                        className="flex items-center justify-center gap-2 py-2 rounded-xl bg-white border border-slate-200 text-blue-700 text-xs font-bold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                                        title="Zobacz Aplikację (B2C)"
                                    >
                                        <Smartphone size={14} /> App B2C
                                    </Link>
                                    <Link 
                                        to={`/${p.Slug}/oferta-b2b`}
                                        target="_blank"
                                        className="flex items-center justify-center gap-2 py-2 rounded-xl bg-white border border-slate-200 text-amber-600 text-xs font-bold hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all shadow-sm"
                                        title="Zobacz Ofertę (B2B)"
                                    >
                                        <Briefcase size={14} /> Oferta B2B
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                {filteredPartners.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
                        <div className="text-slate-300 mb-2"><Search size={48} className="mx-auto" /></div>
                        <h3 className="text-lg font-bold text-slate-900">Brak wyników</h3>
                        <p className="text-slate-500">Nie znaleziono partnerów spełniających kryteria.</p>
                    </div>
                )}
            </div>
        );
    }

    if (activeSection === 'SALES') {
        return (
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-2">
                <h2 className="text-3xl font-display font-black text-slate-900 mb-8">Zespół Sprzedaży</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {salespeople.map(s => (
                        <button
                            key={s.id}
                            onClick={() => onViewSalesperson(s)}
                            className="p-6 bg-white border border-slate-200 rounded-[2rem] text-left hover:shadow-lg hover:scale-[1.02] transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-10 -mt-10 opacity-50 group-hover:scale-150 transition-transform duration-500" />
                            
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                                    <Briefcase size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                                    {s.imie} {s.nazwisko}
                                </h3>
                                <p className="text-sm text-slate-500 font-medium mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    {s.email}
                                </p>
                                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                                    <span>Sprzedaż: <span className="text-slate-900">{s.SprzedazSuma || 0} PLN</span></span>
                                    <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500" />
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return null;
};
