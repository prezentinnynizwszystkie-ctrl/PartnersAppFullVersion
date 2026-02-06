
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { Partner, Handlowiec } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Phone, Mail, Brain, Headphones, 
  CheckCircle2, DollarSign, ExternalLink, ChevronLeft, Loader2,
  Gem, Trophy, Megaphone, ShieldCheck, Layers, Briefcase, Pause,
  ChevronRight, ArrowRight, ChevronDown
} from 'lucide-react';

const DEFAULT_PROPOSAL_PHOTO = "https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/UniversalPhotos/UniversalProposalPhoto3.webp";

const ProposalView: React.FC = () => {
  const { slug, id } = useParams<{ slug?: string; id?: string }>();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [salesperson, setSalesperson] = useState<Handlowiec | null>(null);
  const [customHeader, setCustomHeader] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Audio Player State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Video State
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Slider State for Mobile Benefits
  const [currentBenefit, setCurrentBenefit] = useState(0);
  const touchStart = useRef<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let partnerData: Partner | null = null;

        // SCENARIUSZ A: Link z ID Propozycji (Nowy)
        if (id) {
          const { data: proposal, error: propError } = await supabase
            .schema('PartnersApp')
            .from('Proposals')
            .select('*, Partners(*)')
            .eq('id', id)
            .single();

          if (propError || !proposal) throw new Error('Proposal not found');
          
          partnerData = proposal.Partners;
          setCustomHeader(proposal.custom_header);
        } 
        // SCENARIUSZ B: Link ze Slugiem Partnera (Klasyczny)
        else if (slug) {
          const { data, error } = await supabase
            .schema('PartnersApp')
            .from('Partners')
            .select('*')
            .eq('Slug', slug)
            .single();

          if (error || !data) throw new Error('Partner not found');
          partnerData = data;
          setCustomHeader(null); // Brak niestandardowego nagłówka
        }

        if (partnerData) {
          setPartner(partnerData);

          // Fetch Salesperson
          if (partnerData.IdOpiekuna) {
            const { data: salesData } = await supabase
                .schema('PartnersApp')
                .from('Handlowcy')
                .select('*')
                .eq('id', partnerData.IdOpiekuna)
                .single();
            if (salesData) setSalesperson(salesData);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug, id]);

  const toggleAudio = () => {
      if (!audioRef.current) return;
      if (isPlayingAudio) {
          audioRef.current.pause();
          setIsPlayingAudio(false);
      } else {
          audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(console.error);
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

  const primaryColor = partner.Theme?.primaryColor || "#3b82f6";
  const displayPhotoUrl = partner.ProposalPhotoUrl || DEFAULT_PROPOSAL_PHOTO;
  const audioSource = partner.IntroUrl || "https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/Others/articles/PartnerArticleUniversal.mp3";

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
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900 relative">
      
      {/* HEADER Z POWROTEM - FIXED */}
      <div className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center shadow-sm h-16">
          <div className="flex items-center gap-2">
              <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded tracking-widest">LIVE</span>
              <span className="font-bold text-slate-900 text-sm">Propozycja Współpracy</span>
          </div>
          <Link to="/hub" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold text-xs uppercase tracking-wide flex items-center gap-2 transition-colors">
              <ChevronLeft size={16}/> Panel
          </Link>
      </div>

      {/* 1. HERO & PERSONAL INTRO */}
      <section className="relative pt-24 pb-12 px-6 overflow-hidden min-h-[85vh] flex flex-col justify-start">
         <div className="absolute top-0 left-0 w-full h-[60vh] bg-gradient-to-b from-blue-50 to-[#FDFBF7] -z-10" />
         
         <div className="max-w-6xl mx-auto w-full h-full">
            <div className="flex justify-center md:justify-start mb-4">
                 {partner.LogoUrl ? (
                    <img src={partner.LogoUrl} alt={partner.PartnerName} className="h-16 md:h-24 w-auto object-contain drop-shadow-sm" />
                 ) : (
                    <div className="h-16 px-6 bg-white rounded-2xl flex items-center justify-center font-display font-black text-xl text-slate-800 shadow-sm border border-slate-200">
                        {partner.PartnerName}
                    </div>
                 )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start md:items-center h-full">
                
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="md:col-span-7 space-y-6 text-center md:text-left z-10 pt-2"
                >
                    <h1 className="text-4xl md:text-6xl font-display font-black leading-tight text-slate-900">
                        {customHeader ? customHeader : `Cześć, Ekipo ${partner.PartnerName}!`}
                    </h1>
                    <div className="space-y-4 text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto md:mx-0">
                        <p>
                            Dziękuję za nasze dzisiejsze spotkanie. Wierzę, że <strong>{partner.PartnerName}</strong> ma potencjał, by stać się miejscem, które dzieci zapamiętają na całe życie.
                        </p>
                        <p>
                            Poniżej zebrałem najważniejsze informacje, o których rozmawialiśmy, oraz przygotowałem wizualizację tego, jak nasze rozwiązanie zadziała u Was.
                        </p>
                    </div>
                    
                    {salesperson && (
                        <div className="hidden md:inline-flex items-center gap-4 bg-white p-3 pr-6 rounded-full shadow-sm border border-slate-200 mt-2">
                            <div className="text-left pl-2">
                                <div className="font-bold text-slate-900 text-sm">{salesperson.imie} {salesperson.nazwisko}</div>
                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Twój Opiekun</div>
                            </div>
                            <div className="h-6 w-px bg-slate-200 mx-2" />
                            <a href={`tel:${salesperson.telefon}`} className="flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors">
                                <Phone size={14} />
                            </a>
                            <a href={`mailto:${salesperson.email}`} className="flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors">
                                <Mail size={14} />
                            </a>
                        </div>
                    )}
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="md:col-span-5 relative flex flex-col items-center justify-start md:justify-center mt-4 md:mt-0"
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-80 md:h-80 bg-gradient-to-tr from-blue-200 to-indigo-100 rounded-full blur-3xl opacity-60 -z-10" />
                    <img 
                        src={displayPhotoUrl}
                        alt="Propozycja" 
                        className="w-full max-w-sm md:max-w-md object-contain drop-shadow-2xl rounded-2xl md:rounded-[2rem] z-10 transform md:rotate-2 hover:rotate-0 transition-transform duration-500"
                    />
                </motion.div>
            </div>
         </div>

         <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
            <div className="animate-bounce bg-white/80 backdrop-blur p-2 rounded-full shadow-lg border border-slate-100 text-blue-600">
                <ChevronDown size={24} strokeWidth={3} />
            </div>
         </div>
      </section>

      {/* 2. VIDEO SECTION */}
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
                      <button onClick={toggleVideo} className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/30 transition-colors z-20">
                          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 shadow-2xl group-hover:scale-110 transition-transform">
                              <Play size={32} fill="white" className="ml-1 text-white" />
                          </div>
                      </button>
                  )}
              </div>
          </div>
      </section>

      {/* 3. BENEFITS SLIDER */}
      <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                  <span className="text-blue-600 font-black text-xs uppercase tracking-[0.2em] mb-3 block">Wartość Biznesowa</span>
                  <h2 className="text-3xl md:text-5xl font-display font-black text-slate-900">
                      Co zyska oferta {partner.PartnerName}?
                  </h2>
              </div>

              <div className="md:hidden mb-20" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                  <AnimatePresence mode="wait">
                      <motion.div 
                        key={currentBenefit}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 shadow-sm min-h-[320px] flex flex-col items-center justify-center text-center"
                      >
                          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm mb-6">
                              {benefits[currentBenefit].icon}
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 mb-3">{benefits[currentBenefit].title}</h3>
                          <p className="text-slate-600 leading-relaxed font-medium text-sm">{benefits[currentBenefit].desc}</p>
                      </motion.div>
                  </AnimatePresence>
                  <div className="flex justify-center items-center gap-6 mt-6">
                      <button onClick={prevBenefit} className="p-3 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-900 shadow-sm"><ChevronLeft size={20} /></button>
                      <div className="flex gap-2">{benefits.map((_, i) => (<div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === currentBenefit ? 'bg-blue-600' : 'bg-slate-200'}`} />))}</div>
                      <button onClick={nextBenefit} className="p-3 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-900 shadow-sm"><ChevronRight size={20} /></button>
                  </div>
              </div>

              <div className="hidden md:grid grid-cols-3 gap-8 mb-20">
                  {benefits.map((b, i) => (
                      <div key={i} className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm mb-6">{b.icon}</div>
                          <h3 className="text-xl font-bold text-slate-900 mb-3">{b.title}</h3>
                          <p className="text-slate-600 leading-relaxed font-medium">{b.desc}</p>
                      </div>
                  ))}
              </div>

              <div className="bg-slate-900 rounded-[3rem] p-8 md:p-12 text-white overflow-hidden relative mb-20">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -mr-20 -mt-20" />
                  <div className="text-center mb-10 relative z-10">
                      <h2 className="text-3xl font-display font-black mb-2">Wybierz swój model</h2>
                      <p className="text-slate-400">Dopasuj sposób rozliczeń do swojego biznesu.</p>
                  </div>
                  <div className="overflow-x-auto relative z-10 mb-8">
                      <table className="w-full text-left border-collapse min-w-[600px]">
                          <thead>
                              <tr className="border-b border-slate-700">
                                  <th className="p-4 text-sm font-bold text-slate-400 uppercase tracking-wider w-1/3">Cecha</th>
                                  <th className="p-4 text-lg font-black text-white w-1/3 bg-white/5 rounded-t-2xl border-x border-t border-slate-700/50 text-center"><ShieldCheck className="inline text-green-400 mr-2" size={20} /> Prowizyjny</th>
                                  <th className="p-4 text-lg font-black text-white w-1/3 text-center"><Layers className="inline text-blue-400 mr-2" size={20} /> Pakietowy</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                              <tr><td className="p-6 font-bold text-slate-300">Koszt startowy</td><td className="p-6 text-center font-bold bg-white/5 border-x border-slate-700/50 text-green-400">0 PLN</td><td className="p-6 text-center font-bold text-slate-300">od 50 zł za bajkę</td></tr>
                              <tr><td className="p-6 font-bold text-slate-300">Ryzyko</td><td className="p-6 text-center font-bold bg-white/5 border-x border-slate-700/50 text-green-400">Brak ryzyka</td><td className="p-6 text-center font-bold text-slate-300">Zależne od sprzedaży</td></tr>
                              <tr><td className="p-6 font-bold text-slate-300">Cena dla Klienta</td><td className="p-6 text-center font-bold bg-white/5 border-x border-slate-700/50 text-green-300">Sugerowana 149 PLN</td><td className="p-6 text-center font-bold text-slate-300">Ty decydujesz</td></tr>
                              <tr><td className="p-6 font-bold text-slate-300">Rozliczenie</td><td className="p-6 text-center font-bold bg-white/5 border-x border-slate-700/50 rounded-b-2xl text-green-400">Miesięczne FV</td><td className="p-6 text-center font-bold text-slate-300">Z góry</td></tr>
                          </tbody>
                      </table>
                  </div>
                  <div className="flex justify-center relative z-10">
                      <Link to={`/${partner.Slug}/oferta-b2b`} target="_blank" className="px-8 py-3 bg-[#fccb00] text-black rounded-xl font-black text-sm hover:bg-[#e5b800] transition-colors shadow-lg flex items-center gap-2">
                          <Briefcase size={18} /> ZOBACZ PEŁNĄ OFERTĘ B2B
                      </Link>
                  </div>
              </div>
          </div>
      </section>

      {/* 4. PSYCHOLOGY SECTION */}
      <section className="py-20 px-6 bg-[#f8f9fc] relative border-t border-slate-200">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="order-2 md:order-1 relative">
                  <div className="absolute inset-0 bg-blue-600 rounded-full blur-[100px] opacity-10" />
                  <div className="relative bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-slate-100 text-center">
                      <div className="flex items-center gap-4 mb-6 text-left">
                          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center"><Headphones size={24} /></div>
                          <div><div className="text-xs font-black text-slate-400 uppercase tracking-widest">Audio Materiał</div><div className="font-bold text-slate-900">Dlaczego to działa?</div></div>
                      </div>
                      <div className="flex items-center gap-1 h-12 mb-8 justify-center opacity-50">{[...Array(20)].map((_, i) => (<motion.div key={i} animate={isPlayingAudio ? { height: [16, 48, 16] } : { height: 16 }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.05 }} className="w-1.5 bg-slate-900 rounded-full" />))}</div>
                      <button onClick={toggleAudio} className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">{isPlayingAudio ? <div className="w-4 h-4 bg-white rounded-sm" /> : <Play size={24} className="ml-1" fill="white" />}</button>
                      <audio ref={audioRef} src={audioSource} onEnded={() => setIsPlayingAudio(false)} className="hidden" />
                  </div>
              </div>
              <div className="order-1 md:order-2 space-y-6">
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4"><Brain size={28} /></div>
                  <h2 className="text-3xl md:text-5xl font-display font-black text-slate-900 leading-tight">Więcej niż zabawa. <br/> To budowanie <span className="text-purple-600">pewności siebie.</span></h2>
                  <p className="text-lg text-slate-600 font-medium leading-relaxed">Nasze bajki wykorzystują tzw. "efekt odniesienia do Ja". Dziecko słysząc swoje imię w roli bohatera, buduje silne poczucie sprawczości.</p>
                  <ul className="space-y-3">
                      <li className="flex items-center gap-3 font-bold text-slate-700"><CheckCircle2 className="text-green-500" /> Wzrost samooceny dziecka</li>
                      <li className="flex items-center gap-3 font-bold text-slate-700"><CheckCircle2 className="text-green-500" /> Budowanie więzi z rodzicem</li>
                      <li className="flex items-center gap-3 font-bold text-slate-700"><CheckCircle2 className="text-green-500" /> Trwała pamiątka z urodzin</li>
                  </ul>
              </div>
          </div>
      </section>

      {/* 5. PREVIEW SECTION */}
      <section className="py-20 px-6 bg-slate-900 text-white overflow-hidden">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16 items-center">
              <div className="flex-1 space-y-8">
                  <h2 className="text-3xl md:text-5xl font-display font-black leading-tight">Tak wygląda Twoja aplikacja dla rodzica.</h2>
                  <p className="text-slate-400 text-lg leading-relaxed max-w-lg">Przygotowaliśmy już dla Ciebie spersonalizowany widok, który zobaczą Twoi klienci. Jest w pełni gotowy, z Twoim logo i kolorystyką.</p>
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <Link to={`/${partner.Slug}/oferta-b2b`} target="_blank" className="px-8 py-4 bg-[#fccb00] text-black rounded-2xl font-black text-lg hover:bg-[#e5b800] transition-transform hover:scale-105 shadow-xl flex items-center justify-center gap-2"><DollarSign size={20} /> ZOBACZ PEŁNĄ OFERTĘ B2B</Link>
                      <Link to={`/${partner.Slug}`} target="_blank" className="px-8 py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-bold text-lg hover:bg-white/20 transition-colors flex items-center justify-center gap-2"><ExternalLink size={20} /> Otwórz aplikację</Link>
                  </div>
              </div>
              <div className="relative w-[300px] md:w-[360px] aspect-[9/16] bg-slate-800 rounded-[2.5rem] border-[8px] border-slate-700 shadow-2xl overflow-hidden shrink-0 transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                  <div className="absolute top-0 inset-x-0 h-6 bg-black z-20 flex justify-center"><div className="w-1/3 h-full bg-black rounded-b-xl" /></div>
                  <iframe src={`/#/${partner.Slug}`} className="w-full h-full bg-white" title="Podgląd Aplikacji" />
              </div>
          </div>
      </section>

      <footer className="py-12 text-center text-slate-400 text-sm bg-slate-950 border-t border-slate-900">
          <p>© 2026 MultiBajka Experience dla {partner.PartnerName}.</p>
      </footer>
    </div>
  );
};

export default ProposalView;
