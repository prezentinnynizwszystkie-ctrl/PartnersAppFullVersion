
import React from 'react';
import { Partner, Handlowiec } from '../../types';
import { ChevronRight, Briefcase, ArrowRight } from 'lucide-react';

interface AdminViewProps {
    partners: Partner[];
    salespeople: Handlowiec[];
    activeSection: 'PARTNERS' | 'SALES';
    onViewPartner: (slug: string) => void;
    onViewSalesperson: (person: Handlowiec) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ partners, salespeople, activeSection, onViewPartner, onViewSalesperson }) => {
    
    if (activeSection === 'PARTNERS') {
        return (
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-2">
                <h2 className="text-3xl font-display font-black text-slate-900 mb-8">Oferty Partnerów</h2>
                <div className="grid gap-4">
                    {partners.map(p => (
                        <button
                            key={p.Id}
                            onClick={() => onViewPartner(p.Slug)}
                            className="group relative p-6 bg-white border border-slate-200 rounded-2xl transition-all duration-300 hover:shadow-lg flex items-center justify-between text-left hover:scale-[1.01]"
                        >
                            <div className="flex items-center gap-5">
                                <div 
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold font-display shadow-sm overflow-hidden bg-slate-50 border border-slate-100"
                                    style={{ color: p.Theme?.primaryColor || '#64748b' }}
                                >
                                    {p.LogoUrl ? (
                                        <img src={p.LogoUrl} alt="" className="w-full h-full object-cover p-2" />
                                    ) : (
                                        p.PartnerName.charAt(0)
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                        {p.PartnerName}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                                        <span className="bg-slate-100 px-2 py-0.5 rounded">{p.Slug}</span>
                                        <span>•</span>
                                        <span>{p.PartnerType || 'Partner'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                <ChevronRight size={20} />
                            </div>
                        </button>
                    ))}
                </div>
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
                            className="p-6 bg-white border border-slate-200 rounded-[2rem] text-left hover:shadow-lg hover:scale-[1.02] transition-all group"
                        >
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                                <Briefcase size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                                {s.imie} {s.nazwisko}
                            </h3>
                            <p className="text-sm text-slate-500 font-medium mb-4">{s.email}</p>
                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                                <span>Sprzedaż: {s.SprzedazSuma || 0} PLN</span>
                                <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return null;
};
