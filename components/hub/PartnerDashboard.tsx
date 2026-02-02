
import React from 'react';
import { Partner } from '../../types';
import { Link } from 'react-router-dom';
import { PartnerSettlements } from './PartnerSettlements';
import { PartnerModifications } from './PartnerModifications';
import { Building2, ArrowRight, Settings, Smartphone, Briefcase } from 'lucide-react';

interface PartnerDashboardProps {
    partner: Partner;
    activeTab: 'OFFER' | 'SETTLEMENTS' | 'MODS';
    setActiveTab: (tab: 'OFFER' | 'SETTLEMENTS' | 'MODS') => void;
    isAdminView?: boolean;
    onCloseAdminView?: () => void;
}

export const PartnerDashboard: React.FC<PartnerDashboardProps> = ({ partner, activeTab, setActiveTab, isAdminView, onCloseAdminView }) => {
    return (
        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                 <div>
                     <h2 className="text-3xl font-display font-black text-slate-900 mb-1">
                         {activeTab === 'SETTLEMENTS' && 'Twoje Rozliczenia'}
                         {activeTab === 'MODS' && 'Centrum Zmian'}
                         {activeTab === 'OFFER' && 'Pulpit Partnera'}
                     </h2>
                     <p className="text-slate-500 font-medium">
                         Zalogowany jako: <span className="text-slate-900 font-bold">{partner.PartnerName}</span>
                     </p>
                 </div>
                 {isAdminView && onCloseAdminView && (
                     <button 
                        onClick={onCloseAdminView}
                        className="text-xs font-bold bg-slate-200 hover:bg-slate-300 px-3 py-1 rounded text-slate-600"
                     >
                         Zamknij podgląd
                     </button>
                 )}
            </div>

            {/* Content Switcher */}
            {activeTab === 'SETTLEMENTS' && <PartnerSettlements />}
            
            {activeTab === 'MODS' && (
                <PartnerModifications 
                    partnerId={partner.Id} 
                    partnerName={partner.PartnerName} 
                />
            )}
            
            {activeTab === 'OFFER' && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
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
                                    to={`/${partner.Slug}`} 
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
                                    to={`/${partner.Slug}/oferta-b2b`}
                                    target="_blank"
                                    className="mt-auto inline-flex items-center justify-center gap-2 bg-amber-400 text-slate-900 px-6 py-4 rounded-xl font-bold hover:bg-amber-300 transition-colors shadow-lg shadow-amber-400/20"
                                >
                                    WYŚWIETL OFERTĘ <ArrowRight size={18} />
                                </Link>
                            </div>
                            <Building2 className="absolute -bottom-10 -right-10 text-slate-700 w-64 h-64 opacity-20 -rotate-12 group-hover:-rotate-6 transition-transform duration-500" />
                        </div>

                    </div>

                    {/* Sekcja "Potrzebujesz zmian?" przeniesiona niżej jako mniejszy element */}
                    <div className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center">
                                <Settings size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">Potrzebujesz zmian w ofercie?</h3>
                                <p className="text-xs text-slate-500">Zaktualizuj ceny, opisy lub zdjęcia.</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setActiveTab('MODS')}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors"
                        >
                            Przejdź do edycji
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
