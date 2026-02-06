import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { Partner, Handlowiec } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Phone, Mail, Brain, Headphones, 
  CheckCircle2, DollarSign, ExternalLink, ChevronLeft, Loader2,
  Gem, Trophy, Megaphone, ShieldCheck, Layers, Briefcase, Pause,
  ChevronRight, ArrowRight
} from 'lucide-react';

const ProposalView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [salesperson, setSalesperson] = useState<Handlowiec | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Audio Player State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Video State
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Profit Calc State (Domyślnie 50)
  const [parties, setParties] = useState<string>('50');

  // Slider State for Mobile Benefits
  const [currentBenefit, setCurrentBenefit] = useState(0);
  const touchStart = useRef<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;

      try {
        // 1. Fetch Partner
        const { data: partnerData, error } = await supabase
          .schema('PartnersApp')
          .from('Partners')
          .select('*')
          .eq('Slug', slug)
          .single();

        if (error || !partnerData) throw new Error('Partner not found');
        setPartner(partnerData);

        // 2. Fetch Salesperson
        if (partnerData.IdOpiekuna) {
            const { data: salesData } = await supabase
                .schema('PartnersApp')
                .from('Handlowcy')
                .select('*')
                .eq('id', partnerData.IdOpiekuna)
                .single();
            if (salesData) setSalesperson(salesData);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const toggleAudio = () => {
      if (!audioRef.current) return;
      
      if (isPlayingAudio) {
          audioRef.current.pause();
          setIsPlayingAudio(false);
      } else {
          // Reset if ended
          if (audioRef.current.ended) {
              audioRef.current.currentTime = 0;
          }
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
              playPromise
                  .then(() => setIsPlayingAudio(true))
                  .catch(error => {
                      console.error("Audio play failed:", error);
                      setIsPlayingAudio(false);
                  });
          }
      }
  };

  const toggleVideo = () => {
      if (!videoRef.current) return;
      if (isVideoPlaying) {
          videoRef.current.pause();
          setIsVideoPlaying(false);
      } else {
          videoRef.current.play();
          setIsVideoPlaying(true);
      }
  };

  const nextBenefit = () => setCurrentBenefit(prev => (prev + 1) % 3);
  const prevBenefit = () => setCurrentBenefit(prev => (prev - 1 + 3) % 3);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextBenefit();
      else prevBenefit();
    }
    touchStart.current = null;
  };

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="animate-spin text-slate-300" /></div>;
  if (!partner) return <div className="min-h-screen flex items-center justify-center">Nie znaleziono oferty.</div>;

  // Obliczenia zysków
  const estimatedProfit = parties ? Math.round(Number(parties) * 0.67 * 52) : 0;
  const staffCommission = parties ? Math.round(Number(parties) * 0.67 * 22.35) : 0;

  // Fallbacki kolorystyczne
  const primaryColor = partner.Theme?.primaryColor || "#3b82f6";
  
  // Dane Handlowca (Fallback jeśli brak zdjęcia w bazie)
  const salesPhotoUrl = salesperson?.PhotoUrl || "https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/Handlowcy/Siwy1.webp";

  // Audio URL source logic
  const audioSource = partner.IntroUrl || "https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/Others/Probki/maluchy%20background.mp3";

  const benefits = [
    {
      icon: <Gem size={32} />,
      title: "Innowacyjna wartość",
      desc: "Zamiast kolejnego plastiku, dajesz rodzicom produkt innowacyjny, trwały i edukacyjny."
    },
    {
      icon: <Trophy size={32} />,
      title: "Prestiż i Wyróżnienie",
      desc: "Wyróżniasz się na tle konkurencji. Dajesz doświadczenie Premium, o którym mówią rodzice."
    },
    {
      icon: <Megaphone size={32} />,
      title: "Marketing szeptany",
      desc: `Dziecko słucha bajki w domu i chwali się przyjaciołom. Wszyscy słyszą nazwę ${partner.PartnerName}.`
    }
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900 relative pt-16">
      
      {/* HEADER Z POWROTEM - FIXED */}
      <div className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2">
              <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded tracking-widest">LIVE</span>
              <span className="font-bold text-slate-900 text-sm">Propozycja Współpracy</span>
          </div>
          {/* Ten przycisk jest ukryty dla klienta (można dodać warunek admina), ale zostawiamy go dla łatwej nawigacji */}
          <Link to="/hub" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold text-xs uppercase tracking-wide flex items-center gap-2 transition-colors">
              <ChevronLeft size={16}/> Panel
          </Link>
      </div>

      {/* 1. HERO & PERSONAL INTRO */}
      <section className="relative pt-8 pb-20 px-6 overflow-hidden min-h-[85vh] flex flex-col justify-start md:justify-center">
         <div className="absolute top-0 left-0 w-full h-[60vh] bg-gradient-to-b from-blue-50 to-[#FDFBF7] -z-10" />
         
         <div className="max-w-6xl mx-auto w-full h-full">
            {/* Logo Partnera - Bez ramki, mniejszy margin, wyżej */}
            <div className="flex justify-center md:justify-start mb-6">
                 {partner.LogoUrl ? (
                    <img src={partner.LogoUrl} alt={partner.PartnerName} className="h-20 md:h-28 w-auto object-contain drop-shadow-sm" />
                 ) : (
                    <div className="h-20 px-6 bg-white rounded-2xl flex items-center justify-center font-display font-black text-2xl text-slate-800 shadow-sm border border-slate-200">
                        {partner.PartnerName}
                    </div>
                 )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center h-full">
                
                {/* Left: Text Content */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="md:col-span-7 space-y-8 text-center md:text-left z-10"
                >
                    <h1 className="text-4xl md:text-6xl font-display font-black leading-tight text-slate-900">
                        Cześć, <span style={{color: primaryColor}}>Ekipo {partner.PartnerName}!</span>
                    </h1>
                    <div className="space-y-6 text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto md:mx-0">
                        <p>
                            Dziękuję za nasze dzisiejsze spotkanie. Wierzę, że <strong>{partner.PartnerName}</strong> ma potencjał, by stać się miejscem, które dzieci zapamiętają na całe życie – nie tylko jako park rozrywki, ale jako początek ich wielkiej, osobistej przygody.
                        </p>
                        <p>
                            Poniżej zebrałem najważniejsze informacje, o których rozmawialiśmy, oraz przygotowałem wizualizację tego, jak nasze rozwiązanie zadziała u Was.
                        </p>
                    </div>
                    
                    {/* Salesperson Card - HIDDEN ON MOBILE (Desktop only) */}
                    {salesperson && (
                        <div className="hidden md:inline-flex items-center gap-4 bg-white p-4 pr-8 rounded-full shadow-sm border border-slate-200 mt-4">
                            <div className="w-14 h-14 bg-slate-100 rounded-full overflow-hidden border-2 border-white shadow-md relative">
                                <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-xl">
                                    {salesperson.imie.charAt(0)}{salesperson.nazwisko.charAt(0)}
                                </div>
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-slate-900">{salesperson.imie} {salesperson.nazwisko}</div>
                                <div className="text-xs text-slate-500 font-bold uppercase tracking-wide">Twój Opiekun</div>
                            </div>
                            <div className="h-8 w-px bg-slate-200 mx-2" />
                            <a href={`tel:${salesperson.telefon}`} className="flex items-center justify-center w-10 h-10 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors">
                                <Phone size={18} />
                            </a>
                            <a href={`mailto:${salesperson.email}`} className="flex items-center justify-center w-10 h-10 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors">
                                <Mail size={18} />
                            </a>
                        </div>
                    )}
                </motion.div>

                {/* Right: Salesperson Photo */}
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="md:col-span-5 relative h-[50vh] md:h-full flex flex-col items-center justify-end"
                >
                    {/* Blob Background */}
                    <div className="absolute bottom-0 right-0 md:right-10 w-64 h-64 md:w-96 md:h-96 bg-gradient-to-tr from-orange-200 to-amber-200 rounded-full blur-3xl opacity-50 -z-10" />
                    
                    {/* Image */}
                    <img 
                        src={salesPhotoUrl}
                        alt={salesperson?.imie || "Opiekun"} 
                        className="max-h-full w-auto object-contain drop-shadow-2xl z-10"
                        style={{ maskImage: 'linear-gradient(to bottom, black 90%, transparent 100%)' }}
                    />

                    {/* Salesperson Card - MOBILE ONLY (Under Photo) */}
                    {salesperson && (
                        <div className="flex md:hidden items-center gap-3 bg-white p-3 pr-6 rounded-full shadow-lg border border-slate-100 mt-[-20px] relative z-20 mb-4">
                            <div className="text-left pl-2">
                                <div className="font-bold text-slate-900 text-sm">{salesperson.imie} {salesperson.nazwisko}</div>
                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Twój Opiekun</div>
                            </div>
                            <div className="h-6 w-px bg-slate-200 mx-1" />
                            <a href={`tel:${salesperson.telefon}`} className="flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-600 rounded-full">
                                <Phone size={14} />
                            </a>
                            <a href={`mailto:${salesperson.email}`} className="flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-600 rounded-full">
                                <Mail size={14} />
                            </a>
                        </div>
                    )}
                </motion.div>
            </div>
         </div>
      </section>

      {/* 2. VIDEO SECTION (21:9) */}
      <section className="py-12 px-6 bg-slate-900 text-white overflow-hidden">
          <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-display font-black uppercase tracking-wide">Zobacz jak to działa</h2>
              </div>
              
              <div className="relative w-full aspect-[21/9] bg-black rounded-[2rem] overflow-hidden shadow-2xl border-4 border-slate-700 group">
                  <video 
                      ref={videoRef}
                      src="https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/UniversalVideos/PromoVideos/OfferMoviePlaygroundsV1.0.mp4" 
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                      controls={isVideoPlaying}
                      poster={partner.PhotoUrl || "https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/UniversalPhotos/PosterVideoUniwesal21_9.webp"}
                      onPlay={() => setIsVideoPlaying(true)}
                      onPause={() => setIsVideoPlaying(false)}
                  />
                  
                  {!isVideoPlaying && (
                      <button 
                          onClick={toggleVideo}
                          className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/30 transition-colors z-20"
                      >
                          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 shadow-2xl group-hover:scale-110 transition-transform">
                              <Play size={32} fill="white" className="ml-1 text-white" />
                          </div>
                      </button>
                  )}
              </div>
          </div>
      </section>

      {/* 3. BUSINESS BENEFITS - SLIDER FOR MOBILE */}
      <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                  <span className="text-blue-600 font-black text-xs uppercase tracking-[0.2em] mb-3 block">Wartość Biznesowa</span>
                  <h2 className="text-3xl md:text-5xl font-display font-black text-slate-900">
                      Co zyska oferta {partner.PartnerName}?
                  </h2>
              </div>

              {/* MOBILE SLIDER (visible only on mobile) */}
              <div className="md:hidden mb-20" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                  <AnimatePresence mode="wait">
                      <motion.div 
                        key={currentBenefit}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 shadow-sm min-h-[320px] flex flex-col items-center justify-center text-center"
                      >
                          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm mb-6">
                              {benefits[currentBenefit].icon}
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 mb-3">{benefits[currentBenefit].title}</h3>
                          <p className="text-slate-600 leading-relaxed font-medium text-sm">{benefits[currentBenefit].desc}</p>
                      </motion.div>
                  </AnimatePresence>
                  
                  {/* Slider Controls */}
                  <div className="flex justify-center items-center gap-6 mt-6">
                      <button onClick={prevBenefit} className="p-3 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-900 shadow-sm">
                          <ChevronLeft size={20} />
                      </button>
                      <div className="flex gap-2">
                          {benefits.map((_, i) => (
                              <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === currentBenefit ? 'bg-blue-600' : 'bg-slate-200'}`} />
                          ))}
                      </div>
                      <button onClick={nextBenefit} className="p-3 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-900 shadow-sm">
                          <ChevronRight size={20} />
                      </button>
                  </div>
              </div>

              {/* DESKTOP GRID (visible only on desktop) */}
              <div className="hidden md:grid grid-cols-3 gap-8 mb-20">
                  {benefits.map((b, i) => (
                      <div key={i} className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm mb-6">
                              {b.icon}
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 mb-3">{b.title}</h3>
                          <p className="text-slate-600 leading-relaxed font-medium">{b.desc}</p>
                      </div>
                  ))}
              </div>

              {/* 4. COMPARISON TABLE / MOBILE CARDS */}
              <div className="bg-slate-900 rounded-[3rem] p-8 md:p-12 text-white overflow-hidden relative mb-20">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -mr-20 -mt-20" />
                  
                  <div className="text-center mb-10 relative z-10">
                      <h2 className="text-3xl font-display font-black mb-2">Wybierz swój model</h2>
                      <p className="text-slate-400">Dopasuj sposób rozliczeń do swojego biznesu.</p>
                  </div>

                  {/* DESKTOP TABLE */}
                  <div className="hidden md:block overflow-x-auto relative z-10 mb-8">
                      <table className="w-full text-left border-collapse min-w-[600px]">
                          <thead>
                              <tr className="border-b border-slate-700">
                                  <th className="p-4 text-sm font-bold text-slate-400 uppercase tracking-wider w-1/3">Cecha</th>
                                  <th className="p-4 text-lg font-black text-white w-1/3 bg-white/5 rounded-t-2xl border-x border-t border-slate-700/50">
                                      <div className="flex items-center gap-2 justify-center">
                                          <ShieldCheck className="text-green-400" size={20} /> Model Prowizyjny
                                      </div>
                                  </th>
                                  <th className="p-4 text-lg font-black text-white w-1/3">
                                      <div className="flex items-center gap-2 justify-center">
                                          <Layers className="text-blue-400" size={20} /> Model Pakietowy
                                      </div>
                                  </th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                              <tr>
                                  <td className="p-6 font-bold text-slate-300">Koszt startowy</td>
                                  <td className="p-6 text-center font-bold bg-white/5 border-x border-slate-700/50 text-green-400">0 PLN</td>
                                  <td className="p-6 text-center font-bold text-slate-300">od 50 zł za bajkę</td>
                              </tr>
                              <tr>
                                  <td className="p-6 font-bold text-slate-300">Ryzyko</td>
                                  <td className="p-6 text-center font-bold bg-white/5 border-x border-slate-700/50 text-green-400">Brak ryzyka</td>
                                  <td className="p-6 text-center font-bold text-slate-300">Zależne od sprzedaży</td>
                              </tr>
                              <tr>
                                  <td className="p-6 font-bold text-slate-300">Cena dla Klienta</td>
                                  <td className="p-6 text-center font-bold bg-white/5 border-x border-slate-700/50 text-green-300">Sugerowana 149 PLN</td>
                                  <td className="p-6 text-center font-bold text-slate-300">Ty decydujesz</td>
                              </tr>
                              <tr>
                                  <td className="p-6 font-bold text-slate-300">Rozliczenie</td>
                                  <td className="p-6 text-center font-bold bg-white/5 border-x border-slate-700/50 rounded-b-2xl text-green-400">Raz w miesiącu - FV</td>
                                  <td className="p-6 text-center font-bold text-slate-300">Z góry</td>
                              </tr>
                          </tbody>
                      </table>
                  </div>

                  {/* MOBILE CARDS (REPLACING TABLE) */}
                  <div className="md:hidden space-y-6 relative z-10 mb-8">
                      {/* Card 1: Prowizja */}
                      <div className="bg-white/5 border border-slate-700 rounded-3xl p-6 relative overflow-hidden">
                          <div className="absolute top-0 right-0 bg-green-500/20 text-green-400 text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl border-l border-b border-green-500/30">
                              Rekomendowany
                          </div>
                          <h3 className="text-xl font-black text-white flex items-center gap-2 mb-4">
                              <ShieldCheck className="text-green-400" size={24} /> Model Prowizyjny
                          </h3>
                          <ul className="space-y-3 text-sm text-slate-300">
                              <li className="flex justify-between border-b border-slate-800 pb-2">
                                  <span>Koszt startowy</span> <span className="font-bold text-green-400">0 PLN</span>
                              </li>
                              <li className="flex justify-between border-b border-slate-800 pb-2">
                                  <span>Ryzyko</span> <span className="font-bold text-green-400">Brak ryzyka</span>
                              </li>
                              <li className="flex justify-between border-b border-slate-800 pb-2">
                                  <span>Cena dla Klienta</span> <span className="font-bold text-white">149 PLN</span>
                              </li>
                              <li className="flex justify-between pt-1">
                                  <span>Rozliczenie</span> <span className="font-bold text-green-400">Miesięczne FV</span>
                              </li>
                          </ul>
                      </div>

                      {/* Card 2: Pakiet */}
                      <div className="bg-slate-950/50 border border-slate-800 rounded-3xl p-6">
                          <h3 className="text-xl font-black text-white flex items-center gap-2 mb-4">
                              <Layers className="text-blue-400" size={24} /> Model Pakietowy
                          </h3>
                          <ul className="space-y-3 text-sm text-slate-400">
                              <li className="flex justify-between border-b border-slate-800 pb-2">
                                  <span>Koszt startowy</span> <span className="font-bold text-slate-300">od 50 zł/szt</span>
                              </li>
                              <li className="flex justify-between border-b border-slate-800 pb-2">
                                  <span>Ryzyko</span> <span className="font-bold text-slate-300">Średnie</span>
                              </li>
                              <li className="flex justify-between border-b border-slate-800 pb-2">
                                  <span>Cena dla Klienta</span> <span className="font-bold text-white">Twój wybór</span>
                              </li>
                              <li className="flex justify-between pt-1">
                                  <span>Rozliczenie</span> <span className="font-bold text-slate-300">Z góry (Prepaid)</span>
                              </li>
                          </ul>
                      </div>
                  </div>

                  {/* DODATKOWY BUTTON W SEKCJI TABELI */}
                  <div className="flex justify-center relative z-10">
                      <Link 
                          to={`/${partner.Slug}/oferta-b2b`} 
                          target="_blank"
                          className="px-8 py-3 bg-[#fccb00] text-black rounded-xl font-black text-sm hover:bg-[#e5b800] transition-colors shadow-lg flex items-center gap-2"
                      >
                          <Briefcase size={18} /> ZOBACZ PEŁNĄ OFERTĘ B2B
                      </Link>
                  </div>
              </div>

              {/* 5. PROFIT CALCULATOR */}
              <div id="calculator" className="bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-[2.5rem] p-8 md:p-16 text-center border border-slate-200">
                  <span className="text-blue-600 font-black text-xs uppercase tracking-[0.2em] mb-4 block">Kalkulator Zysków (Model Prowizyjny)</span>
                  <h2 className="text-4xl md:text-6xl font-display font-black text-slate-900 mb-6">
                      Ile zarobisz miesięcznie?
                  </h2>

                  {/* TEKST POTENCJAŁ RYNKU */}
                  <div className="max-w-2xl mx-auto mb-10 text-center">
                      <h4 className="text-blue-600 font-bold uppercase tracking-widest text-xs mb-2">Potencjał Rynku</h4>
                      <p className="text-slate-500 font-medium leading-relaxed">
                          Nasze badania rynku wykazały, że ponad <span className="text-slate-900 font-bold">67%</span> rodziców organizujących urodziny w centrach rozrywki, jest zainteresowane zakupem AudioBajki.
                      </p>
                  </div>

                  <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl shadow-xl border border-slate-100 mb-10">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 block">Liczba urodzin w miesiącu</label>
                      <div className="flex items-center justify-center gap-4">
                          <input 
                              type="number" 
                              value={parties}
                              onChange={(e) => setParties(e.target.value)}
                              className="w-32 bg-slate-50 text-slate-900 font-black text-4xl p-4 rounded-2xl text-center focus:outline-none focus:ring-4 focus:ring-blue-100 border-2 border-slate-200"
                          />
                          <span className="text-lg font-bold text-slate-400">imprez</span>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-8">
                      <div className="bg-green-500 text-white p-8 rounded-[2rem] shadow-lg transform hover:scale-105 transition-transform duration-300">
                          <div className="text-green-100 text-sm font-bold uppercase tracking-widest mb-2">Twój Zysk Netto</div>
                          <div className="text-5xl font-black">{estimatedProfit} PLN</div>
                      </div>
                      <div className="bg-white text-slate-900 p-8 rounded-[2rem] shadow-lg border border-slate-100">
                          <div className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">Bonus dla Pracowników</div>
                          <div className="text-4xl font-black text-indigo-600">{staffCommission} PLN</div>
                          <div className="text-slate-400 text-xs mt-2 font-medium">motywacja dla zespołu</div>
                      </div>
                  </div>

                  <p className="text-xs text-slate-400 font-medium max-w-lg mx-auto">
                      *Szacunki: cena 149 zł, konwersja 67%. Prowizja załogi: 15%.
                  </p>
              </div>

          </div>
      </section>

      {/* 6. PSYCHOLOGY & AUDIO */}
      <section className="py-20 px-6 bg-[#f8f9fc] relative border-t border-slate-200">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              
              <div className="order-2 md:order-1 relative">
                  <div className="absolute inset-0 bg-blue-600 rounded-full blur-[100px] opacity-10" />
                  <div className="relative bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
                      <div className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                              <Headphones size={24} />
                          </div>
                          <div>
                              <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Audio Materiał</div>
                              <div className="font-bold text-slate-900">Dlaczego to działa?</div>
                          </div>
                      </div>
                      
                      {/* Fake Waveform */}
                      <div className="flex items-center gap-1 h-12 mb-8 justify-center opacity-50">
                          {[...Array(20)].map((_, i) => (
                              <motion.div 
                                  key={i}
                                  animate={isPlayingAudio ? { height: [16, 48, 16] } : { height: 16 }}
                                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.05 }}
                                  className="w-1.5 bg-slate-900 rounded-full"
                              />
                          ))}
                      </div>

                      <div className="flex justify-center">
                          <button 
                              onClick={toggleAudio}
                              className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                          >
                              {isPlayingAudio ? <div className="w-4 h-4 bg-white rounded-sm" /> : <Play size={24} className="ml-1" fill="white" />}
                          </button>
                      </div>
                      
                      {/* Audio URL from DB or Fallback - ADDED KEY FOR REFRESH */}
                      <audio 
                          key={audioSource} 
                          ref={audioRef} 
                          src={audioSource} 
                          onEnded={() => setIsPlayingAudio(false)} 
                          className="hidden" 
                      />
                  </div>
              </div>

              <div className="order-1 md:order-2 space-y-6">
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
                      <Brain size={28} />
                  </div>
                  <h2 className="text-3xl md:text-5xl font-display font-black text-slate-900 leading-tight">
                      Więcej niż zabawa. <br/> To budowanie <span className="text-purple-600">pewności siebie.</span>
                  </h2>
                  <p className="text-lg text-slate-600 font-medium leading-relaxed">
                      Nasze bajki wykorzystują tzw. "efekt odniesienia do Ja". Dziecko słysząc swoje imię w roli bohatera, buduje silne poczucie sprawczości. To pamiątka, która nie ląduje w kącie po tygodniu.
                  </p>
                  <ul className="space-y-3">
                      <li className="flex items-center gap-3 font-bold text-slate-700">
                          <CheckCircle2 className="text-green-500" /> Wzrost samooceny dziecka
                      </li>
                      <li className="flex items-center gap-3 font-bold text-slate-700">
                          <CheckCircle2 className="text-green-500" /> Budowanie więzi z rodzicem (wspólne czytanie)
                      </li>
                      <li className="flex items-center gap-3 font-bold text-slate-700">
                          <CheckCircle2 className="text-green-500" /> Trwała pamiątka z urodzin w {partner.PartnerName}
                      </li>
                  </ul>
              </div>

          </div>
      </section>

      {/* 7. PREVIEW APP & CTA */}
      <section className="py-20 px-6 bg-slate-900 text-white overflow-hidden">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16 items-center">
              
              <div className="flex-1 space-y-8">
                  <h2 className="text-3xl md:text-5xl font-display font-black leading-tight">
                      Tak wygląda Twoja aplikacja dla rodzica.
                  </h2>
                  <p className="text-slate-400 text-lg leading-relaxed max-w-lg">
                      Przygotowaliśmy już dla Ciebie spersonalizowany widok, który zobaczą Twoi klienci. Jest w pełni gotowy, z Twoim logo i kolorystyką.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <Link 
                          to={`/${partner.Slug}/oferta-b2b`} 
                          target="_blank"
                          className="px-8 py-4 bg-[#fccb00] text-black rounded-2xl font-black text-lg hover:bg-[#e5b800] transition-transform hover:scale-105 shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2"
                      >
                          <DollarSign size={20} /> ZOBACZ PEŁNĄ OFERTĘ B2B
                      </Link>
                      
                      <Link 
                          to={`/${partner.Slug}`} 
                          target="_blank"
                          className="px-8 py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-bold text-lg hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                      >
                          <ExternalLink size={20} /> Otwórz aplikację w nowym oknie
                      </Link>
                  </div>
              </div>

              {/* MOCKUP TELEFONU Z LIVE PREVIEW IFRAME */}
              <div className="relative w-[300px] md:w-[360px] aspect-[9/19] bg-slate-800 rounded-[3rem] border-[8px] border-slate-700 shadow-2xl overflow-hidden shrink-0 transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                  {/* Pasek statusu fake */}
                  <div className="absolute top-0 inset-x-0 h-6 bg-black z-20 flex justify-center">
                      <div className="w-1/3 h-full bg-black rounded-b-xl" />
                  </div>
                  
                  {/* IFRAME: Pointing to /#/slug to load the real app in SPA mode */}
                  <iframe 
                      src={`/#/${partner.Slug}`} 
                      className="w-full h-full bg-white"
                      title="Podgląd Aplikacji"
                  />
              </div>

          </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 text-center text-slate-400 text-sm bg-slate-950 border-t border-slate-900">
          <p>© 2026 MultiBajka Experience dla {partner.PartnerName}. Wszelkie prawa zastrzeżone.</p>
      </footer>

    </div>
  );
};

export default ProposalView;
