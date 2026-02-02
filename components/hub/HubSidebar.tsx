
import React from 'react';
import { UserRole } from '../../types.ts';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, UserCircle, LogOut, FileText, ArrowRight, Receipt, Settings, BookOpen } from 'lucide-react';

interface HubSidebarProps {
    role: UserRole;
    session: any;
    adminSection?: 'PARTNERS' | 'SALES';
    setAdminSection?: (section: 'PARTNERS' | 'SALES') => void;
    viewingAsSlug?: string | null;
    viewingSalesperson?: any;
    activeTab?: 'OFFER' | 'SETTLEMENTS' | 'MODS';
    setActiveTab?: (tab: 'OFFER' | 'SETTLEMENTS' | 'MODS') => void;
    onResetView?: () => void;
    onLogout: () => void;
    partnerName?: string;
    // New prop for instructions
    showInstructions?: boolean;
    setShowInstructions?: (show: boolean) => void;
}

export const HubSidebar: React.FC<HubSidebarProps> = ({ 
    role, session, adminSection, setAdminSection, viewingAsSlug, viewingSalesperson, 
    activeTab, setActiveTab, onResetView, onLogout, partnerName,
    showInstructions, setShowInstructions
}) => {
    return (
        <aside className="w-full md:w-72 bg-slate-900 text-white p-6 flex flex-col justify-between flex-shrink-0">
            <div>
                <div className="mb-10 px-2">
                    <h1 className="text-2xl font-display font-black tracking-tight">MultiBajka<span className="text-blue-500">.</span></h1>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                        {role === 'ADMIN' ? 'Admin Panel' : role === 'HANDLOWIEC' ? 'Handlowiec' : 'Strefa Partnera'}
                        {!session && <span className="text-yellow-500 ml-1">(DEV)</span>}
                    </p>
                </div>

                <nav className="space-y-2">
                    {/* Admin Navigation */}
                    {role === 'ADMIN' && onResetView && setAdminSection && setShowInstructions && (
                        <>
                             <div className="px-4 py-2 text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Zarządzanie</div>
                            <button 
                                onClick={() => {
                                    setAdminSection('PARTNERS');
                                    onResetView();
                                    setShowInstructions(false);
                                }}
                                className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-colors flex items-center gap-3 ${adminSection === 'PARTNERS' && !viewingAsSlug && !viewingSalesperson && !showInstructions ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}
                            >
                                <LayoutDashboard size={20} /> Lista Partnerów
                            </button>
                            <button 
                                onClick={() => {
                                    setAdminSection('SALES');
                                    onResetView();
                                    setShowInstructions(false);
                                }}
                                className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-colors flex items-center gap-3 ${adminSection === 'SALES' && !viewingSalesperson && !showInstructions ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}
                            >
                                <Users size={20} /> Zespół Sprzedaży
                            </button>
                            <button 
                                onClick={() => {
                                    onResetView();
                                    setShowInstructions(true);
                                }}
                                className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-colors flex items-center gap-3 ${showInstructions ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}
                            >
                                <BookOpen size={20} /> Instrukcje i Wiedza
                            </button>
                        </>
                    )}

                    {/* Partner Navigation (Visible if viewing as partner or is partner) */}
                    {(viewingAsSlug || role === 'PARTNER') && setActiveTab && activeTab && (
                        <>
                            {viewingAsSlug && (
                                <div className="px-4 py-2 text-xs font-black text-slate-500 uppercase tracking-widest mt-6 mb-2">
                                    Menu: {partnerName || viewingAsSlug}
                                </div>
                            )}
                            
                            <button
                                onClick={() => setActiveTab('OFFER')}
                                className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-colors flex items-center gap-3 ${activeTab === 'OFFER' ? 'bg-white/20 text-white' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}
                            >
                                <LayoutDashboard size={20} /> Pulpit
                            </button>

                            {/* "Moja Oferta" - External Link */}
                            <Link 
                                to={`/${viewingAsSlug || partnerName}`} // Note: partnerName here acts as slug fallback if passed correctly
                                className="block w-full text-left px-4 py-3 rounded-xl font-bold text-slate-400 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-3"
                            >
                                <FileText size={20} /> Moja oferta <ArrowRight size={14} className="ml-auto opacity-50" />
                            </Link>

                            <button 
                                onClick={() => setActiveTab('SETTLEMENTS')}
                                className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-colors flex items-center gap-3 ${activeTab === 'SETTLEMENTS' ? 'bg-white/20 text-white' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}
                            >
                                <Receipt size={20} /> Rozliczenia
                            </button>

                            <button 
                                onClick={() => setActiveTab('MODS')}
                                className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-colors flex items-center gap-3 ${activeTab === 'MODS' ? 'bg-white/20 text-white' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}
                            >
                                <Settings size={20} /> Modyfikacja oferty
                            </button>
                        </>
                    )}

                    {role === 'HANDLOWIEC' && setShowInstructions && (
                        <>
                            <button 
                                onClick={() => setShowInstructions(false)}
                                className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${!showInstructions ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}
                            >
                                <UserCircle size={20} /> Twoi Partnerzy
                            </button>
                            <button 
                                onClick={() => setShowInstructions(true)}
                                className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${showInstructions ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}
                            >
                                <BookOpen size={20} /> Instrukcje i Wiedza
                            </button>
                        </>
                    )}
                </nav>
            </div>

            <div className="space-y-4">
                {session && (
                    <div className="px-4 py-3 bg-white/5 rounded-xl text-xs text-slate-400">
                        Zalogowany jako:<br/>
                        <strong className="text-white">{session.user.email}</strong>
                    </div>
                )}
                <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white font-bold transition-colors">
                    <LogOut size={20} /> Wyloguj
                </button>
            </div>
        </aside>
    );
};
