
import React from 'react';
import { Partner } from '../../types';
import { Link } from 'react-router-dom';
import { PartnerSettlements } from './PartnerSettlements';
import { PartnerModifications } from './PartnerModifications';
import { Building2, ArrowRight, Settings } from 'lucide-react';

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 bg-blue-600 text-white rounded-[2rem] shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black mb-2">Twoja Oferta Online</h3>
                            <p className="opacity-80 mb-8 text-sm">Twoja dedykowana strona lądowania jest aktywna i gotowa do przyjmowania zamówień.</p>
                            <Link 
                                to={`/${partner.Slug}`} 
                                className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors"
                            >
                                Zobacz stronę <ArrowRight size={18} />
                            </Link>
                        </div>
                        <Building2 className="absolute -bottom-6 -right-6 text-blue-500 w-40 h-40 opacity-50 rotate-12" />
                    </div>

                    <div className="p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex flex-col justify-center items-start">
                        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-4">
                            <Settings size={24} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">Potrzebujesz zmian?</h3>
                        <p className="text-slate-500 text-sm mb-6">Chcesz zaktualizować ceny, opis lub zdjęcia w swojej ofercie?</p>
                        <button 
                            onClick={() => setActiveTab('MODS')}
                            className="font-bold text-slate-900 hover:text-blue-600 underline decoration-2 underline-offset-4"
                        >
                            Przejdź do formularza zmian
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
