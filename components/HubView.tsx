
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Partner, Handlowiec, UserRole } from '../types';
import { Loader2 } from 'lucide-react';

// Imported modular components
import { HubSidebar } from './hub/HubSidebar';
import { AdminView } from './hub/AdminView';
import { SalesPanel } from './hub/SalesPanel';
import { PartnerDashboard } from './hub/PartnerDashboard';

const HubView: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, profile, signOut } = useAuth(); // REAL AUTH
  
  // DETERMINE ROLE & IDENTITY
  let role: UserRole = profile?.role || 'KLIENT';
  if (!session && location.state?.mockRole) {
      role = location.state.mockRole;
  }

  // --- LOCAL STATE (Global Data) ---
  const [partners, setPartners] = useState<Partner[]>([]);
  const [salespeople, setSalespeople] = useState<Handlowiec[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- VIEW STATE (Navigation) ---
  const [adminSection, setAdminSection] = useState<'PARTNERS' | 'SALES'>('PARTNERS');
  
  // Impersonation State
  const [viewingAsSlug, setViewingAsSlug] = useState<string | null>(null);
  const [viewingSalesperson, setViewingSalesperson] = useState<Handlowiec | null>(null);
  
  // Partner Tabs State
  const [activeTab, setActiveTab] = useState<'OFFER' | 'SETTLEMENTS' | 'MODS'>('OFFER');

  useEffect(() => {
    const initialize = async () => {
        setLoading(true);
        try {
            // Admin always needs this data
            if (role === 'ADMIN') {
                const [partnersRes, salesRes] = await Promise.all([
                    supabase.schema('PartnersApp').from('Partners').select('*'),
                    supabase.schema('PartnersApp').from('Handlowcy').select('*')
                ]);
                setPartners(partnersRes.data || []);
                setSalespeople(salesRes.data || []);
            } else if (role === 'PARTNER' && profile?.partner_id) {
                // Partner fetches their own data
                const { data } = await supabase.schema('PartnersApp').from('Partners').select('*').eq('Id', profile.partner_id).single();
                if (data) {
                    setPartners([data]); // Keep in array for consistency
                    setViewingAsSlug(data.Slug);
                }
            } else if (location.state?.mockPartnerSlug) {
                // Mock Partner Logic
                setViewingAsSlug(location.state.mockPartnerSlug);
                const { data } = await supabase.schema('PartnersApp').from('Partners').select('*').eq('Slug', location.state.mockPartnerSlug).single();
                if (data) setPartners([data]);
            }

        } catch (e) {
            console.error("Hub init error:", e);
        } finally {
            setLoading(false);
        }
    };

    if (!session && !location.state?.mockRole) {
        navigate('/');
    } else {
        initialize();
    }

  }, [session, profile, role, location.state, navigate]);

  const handleLogout = async () => {
      if (session) await signOut();
      navigate('/');
  };

  // Helper: Find current partner object
  const viewingPartner = partners.find(p => p.Slug === viewingAsSlug);

  // --- RENDER ---
  if (loading) return <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center"><Loader2 className="animate-spin text-slate-400" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex flex-col md:flex-row font-sans text-slate-800">
        
        {/* SIDEBAR */}
        <HubSidebar 
            role={role}
            session={session}
            adminSection={adminSection}
            setAdminSection={setAdminSection}
            viewingAsSlug={viewingAsSlug}
            viewingSalesperson={viewingSalesperson}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onResetView={() => {
                setViewingAsSlug(null);
                setViewingSalesperson(null);
            }}
            onLogout={handleLogout}
            partnerName={viewingPartner?.PartnerName || viewingAsSlug || ''}
        />

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
            
            {/* 1. ADMIN DASHBOARD */}
            {role === 'ADMIN' && !viewingAsSlug && !viewingSalesperson && (
                <AdminView 
                    partners={partners}
                    salespeople={salespeople}
                    activeSection={adminSection}
                    onViewPartner={(slug) => {
                        setViewingAsSlug(slug);
                        setActiveTab('OFFER');
                    }}
                    onViewSalesperson={setViewingSalesperson}
                />
            )}

            {/* 2. ADMIN IMPERSONATING SALESPERSON (OR REAL SALESPERSON) */}
            {viewingSalesperson && (
                <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-8 flex items-center justify-between">
                         <div>
                             <h2 className="text-3xl font-display font-black text-slate-900 mb-1">
                                 Podgląd Handlowca
                             </h2>
                             <p className="text-slate-500 font-medium">
                                 Oglądasz panel: <span className="text-slate-900 font-bold">{viewingSalesperson.imie} {viewingSalesperson.nazwisko}</span>
                             </p>
                         </div>
                         <button 
                            onClick={() => setViewingSalesperson(null)}
                            className="text-xs font-bold bg-slate-200 hover:bg-slate-300 px-3 py-1 rounded text-slate-600"
                         >
                             Zamknij podgląd
                         </button>
                    </div>
                    <SalesPanel salespersonId={viewingSalesperson.id} salespersonName={`${viewingSalesperson.imie} ${viewingSalesperson.nazwisko}`} />
                </div>
            )}

            {/* 3. REAL SALESPERSON (Login) */}
            {role === 'HANDLOWIEC' && profile?.handlowiec_id && (
                <SalesPanel 
                    salespersonId={profile.handlowiec_id} 
                    salespersonName={session?.user.email} 
                />
            )}

            {/* 4. PARTNER DASHBOARD (Real or Impersonated) */}
            {viewingAsSlug && viewingPartner && (
                <PartnerDashboard 
                    partner={viewingPartner}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    isAdminView={role === 'ADMIN'}
                    onCloseAdminView={() => setViewingAsSlug(null)}
                />
            )}

        </main>
    </div>
  );
};

export default HubView;
