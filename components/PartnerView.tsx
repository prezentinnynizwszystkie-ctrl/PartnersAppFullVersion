
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { Partner } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ArrowRight, BookOpen, Brain } from 'lucide-react';
import Wizard from './Wizard';

const PartnerView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [partnerAgeGroups, setPartnerAgeGroups] = useState<string[]>([]); // New State for joined data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  useEffect(() => {
    const fetchPartner = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        // ZAPYTANIE Z JOINEM: Pobieramy Partnera ORAZ połączone grupy wiekowe
        // Składnia: *, TabelaŁącząca ( TabelaDocelowa ( Kolumna ) )
        const { data, error } = await supabase
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
          .eq('Slug', slug)
          .single();

        if (error || !data) {
          setError(true);
        } else {
          setPartner(data);
          
          // Transformacja danych z zagnieżdżonego obiektu na prostą tablicę stringów
          // data.PartnerAgeGroups = [{ AgeGroups: { AgeGroup: "3-5" } }, ...]
          if (data.PartnerAgeGroups && Array.isArray(data.PartnerAgeGroups)) {
             const groups = data.PartnerAgeGroups
                .map((item: any) => item.AgeGroups?.AgeGroup)
                .filter(Boolean); // Usuwamy null/undefined
             setPartnerAgeGroups(groups);
          } else {
             setPartnerAgeGroups([]);
          }
        }
      } catch (e) {
        console.error(e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPartner();
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-[#eeeef5]" />;
  if (error || !partner) return <div className="min-h-screen bg-[#eeeef5] p-8 text-center">404</div>;

  const primaryColor = partner.Theme?.primaryColor || '#3b82f6'; 
  const accentColor = partner.Theme?.accentColor || '#ec4899'; 
  
  const dynamicStyle = {
    '--primary': primaryColor,
    '--accent': accentColor,
  } as React.CSSProperties;

  // Przekazujemy "zmutowanego" partnera do Wizarda (dodajemy mu AgeGroups "na sztywno" żeby pasował do propsów Wizarda, 
  // choć Wizard w Step7Selection powinien teraz korzystać z przekazanej tablicy, a nie propsa partner.AgeGroups, 
  // ale dla kompatybilności przekazujemy to w obiekcie partnera również, jeśli Wizard tego oczekuje).
  const partnerWithGroups = {
      ...partner,
      AgeGroups: partnerAgeGroups
  };

  return (
    <div style={dynamicStyle} className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden relative">
      
      <AnimatePresence>
        {isWizardOpen && (
          <Wizard 
            onClose={() => setIsWizardOpen(false)} 
            partner={partnerWithGroups} // Przekazujemy przetworzone dane
            primaryColor={primaryColor}
            accentColor={accentColor}
          />
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative w-full">
        <div 
          className="relative aspect-[21/9] w-full overflow-hidden bg-slate-100"
          style={{
            maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)'
          }}
        >
          <img 
            src="https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/UniversalPhotos/BlogArticleHero.webp" 
            alt="Hero" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-16 pb-12 md:pb-24">
            <div className="max-w-7xl mx-auto w-full">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl"
              >
                <div className="inline-block md:block md:bg-transparent bg-black/30 backdrop-blur-sm md:backdrop-blur-none p-3 md:p-0 rounded-2xl md:rounded-none">
                  <h1 className="text-2xl md:text-6xl lg:text-7xl font-display font-black leading-tight text-white mb-0 md:mb-4">
                    Twoja <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">przygoda czeka.</span>
                  </h1>
                </div>
                <p className="hidden md:block text-lg md:text-xl text-white/80 max-w-2xl font-medium mt-2">
                  Zostań głównym bohaterem personalizowanej bajki. Uzupełnij dane i odbierz pamiątkę z urodzin w {partner.PartnerName}.
                </p>
              </motion.div>
            </div>
          </div>

          <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20">
            <Link to={`/${slug}`} className="flex items-center gap-2 text-[10px] md:text-sm font-semibold text-white bg-black/40 hover:bg-black/60 backdrop-blur-md px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-white/20 transition-all">
              <ChevronLeft size={14} className="md:w-4 md:h-4" /> Wróć
            </Link>
          </div>
        </div>

        <div className="absolute left-1/2 -bottom-10 md:-bottom-12 -translate-x-1/2 z-30">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 md:w-32 md:h-32 bg-white rounded-full shadow-2xl border-4 border-white flex items-center justify-center p-3 md:p-4 overflow-hidden"
          >
             {partner.LogoUrl ? (
                <img src={partner.LogoUrl} alt={partner.PartnerName} className="w-full h-full object-contain" />
             ) : (
                <span className="font-display font-bold text-xl md:text-2xl text-slate-900">{partner.PartnerName.charAt(0)}</span>
             )}
          </motion.div>
        </div>
      </section>

      {/* Main Content Simplified */}
      <main className="relative z-10 w-full max-w-4xl mx-auto px-6 pt-16 md:pt-20 pb-20 flex flex-col items-center space-y-12 text-center">
        
        <div className="max-w-3xl">
          <h2 className="text-xl md:text-3xl font-display font-black text-slate-900 mb-4 leading-tight">
            Przejdź przez krótki konfigurator, aby stworzyć Multibajkę
          </h2>
          <p className="text-slate-500 font-medium md:text-lg">
            Potrzebujemy zaledwie kilku minut Twojego czasu, aby przygotować profesjonalne nagranie audio-wideo, w którym Twoje dziecko usłyszy swoje imię i wyruszy na ratunek mieszkańcom Nibylandii.
          </p>
        </div>

        {/* Short list of what will happen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-900 font-black mx-auto mb-3 shadow-sm">1</div>
                <p className="text-sm font-bold text-slate-700">Wybierz płeć i imię bohatera</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-900 font-black mx-auto mb-3 shadow-sm">2</div>
                <p className="text-sm font-bold text-slate-700">Podaj szczegóły urodzin</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-900 font-black mx-auto mb-3 shadow-sm">3</div>
                <p className="text-sm font-bold text-slate-700">Odbierz bajkę w 24h</p>
            </div>
        </div>

        <div className="w-full pt-4 flex justify-center">
           <button 
            onClick={() => setIsWizardOpen(true)}
            className="group relative inline-flex items-center justify-center px-12 py-6 text-xl md:text-2xl font-black text-white bg-slate-900 rounded-[2rem] hover:scale-105 transition-all overflow-hidden w-full md:w-auto shadow-2xl"
           >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity"></span>
              <span className="relative flex items-center gap-3">Rozpocznij Konfigurację <ArrowRight size={26} /></span>
           </button>
        </div>

        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
           To zajmie tylko chwilę • Personalizacja 100%
        </p>

      </main>
    </div>
  );
};

export default PartnerView;
