
import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Link } from 'react-router-dom';
import { Partner } from '../types';
import { Loader2, ArrowRight, BookOpen, Terminal, Eye } from 'lucide-react';

const HomeView: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any | null>(null);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const { data, error } = await supabase
          .schema('PartnersApp')
          .from('Partners')
          .select('*');

        if (error) throw error;
        setPartners(data || []);
      } catch (err: any) {
        console.error('Error fetching partners:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  return (
    <div className="min-h-screen bg-[#eeeef5] text-slate-800 flex flex-col items-center justify-center p-8 relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      
      <div className="z-10 w-full max-w-2xl">
        <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-display font-black mb-4 tracking-tight text-slate-900">
              MultiBajka
              <span className="block text-2xl md:text-3xl font-normal text-slate-500 mt-2 font-sans">Developer Hub</span>
            </h1>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <Loader2 className="animate-spin text-slate-900 w-10 h-10" />
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-2xl shadow-sm text-red-800">
            <h3 className="font-bold text-red-900 mb-1">Błąd połączenia</h3>
            <p className="text-sm">{error.message}</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid gap-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Dostępni Partnerzy</div>
              {partners.map((partner) => (
                <Link
                  key={partner.Id}
                  to={`/${partner.Slug}`}
                  className="group relative p-5 bg-white border border-slate-200 rounded-2xl transition-all duration-300 hover:shadow-lg flex items-center justify-between hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-5">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold font-display shadow-sm overflow-hidden bg-white border border-slate-100"
                      style={{ color: partner.Theme?.primaryColor || '#64748b' }}
                    >
                      {partner.LogoUrl ? (
                           <img src={partner.LogoUrl} alt="" className="w-full h-full object-cover p-2" />
                      ) : (
                           partner.PartnerName.charAt(0)
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">
                        {partner.PartnerName}
                      </h3>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        /{partner.Slug}
                      </p>
                    </div>
                  </div>
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:translate-x-1"
                    style={{ backgroundColor: `${partner.Theme?.primaryColor}15`, color: partner.Theme?.primaryColor }}
                  >
                      <ArrowRight size={20} />
                  </div>
                </Link>
              ))}
            </div>

            {/* Sekcja Developerska */}
            <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-4 flex items-center gap-2">
                    <Terminal size={12} /> Narzędzia Developerskie
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Demo Proposal Link */}
                    <Link
                        to="/demo/propozycja"
                        className="group relative p-5 bg-blue-600 text-white border border-blue-500 rounded-2xl transition-all duration-300 hover:shadow-xl hover:bg-blue-700 flex items-center justify-between hover:scale-[1.02]"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/20 border border-white/10 text-white">
                                <Eye size={24} />
                            </div>
                            <div>
                                <h3 className="text-base font-bold">Podgląd Oferty (Demo)</h3>
                                <p className="text-[10px] text-blue-100">Zobacz szablon bez logowania</p>
                            </div>
                        </div>
                    </Link>

                    {/* Story Gen Link */}
                    <Link
                        to="/test/generated-tale"
                        className="group relative p-5 bg-slate-900 text-white border border-slate-800 rounded-2xl transition-all duration-300 hover:shadow-xl flex items-center justify-between hover:scale-[1.02]"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/10 border border-white/20 text-white">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <h3 className="text-base font-bold">Podgląd Scenariusza</h3>
                                <p className="text-[10px] text-slate-400">Test silnika tekstowego</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeView;
