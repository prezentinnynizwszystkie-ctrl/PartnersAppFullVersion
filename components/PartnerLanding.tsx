
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Partner } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Mic2, Music, Palette, Brain, ArrowRight, Star, ChevronLeft, ChevronRight, BookOpen, CheckCircle2, X, Volume2, Pause, Image as ImageIcon, Rocket } from 'lucide-react';

// --- DATA CONSTANTS ---

const AGE_GROUP_IMAGES: Record<string, string[]> = {
  '3-5': [
    "https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/UniversalPhotos/RealityVSvirtual/3-5Boy1.webp",
    "https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/UniversalPhotos/RealityVSvirtual/3-5Girl1.webp"
  ],
  '6-8': [
    "https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/UniversalPhotos/RealityVSvirtual/6-8Girl1.webp", 
    "https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/UniversalPhotos/RealityVSvirtual/6-8Girl1.webp"
  ].map((url, i) => i === 0 ? url.replace('Girl1', 'Boy1') : url), 
  '9-12': [
    "https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/UniversalPhotos/RealityVSvirtual/9-12Boy1.webp",
    "https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/UniversalPhotos/RealityVSvirtual/9-12Girl1.webp"
  ],
  '13+': [
    "https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/UniversalPhotos/RealityVSvirtual/13+Boy1.webp",
    "https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/UniversalPhotos/RealityVSvirtual/13+Girl1.webp"
  ]
};

const GALLERY_IMAGES = [
    "https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/Others/Probki/hf_20260202_022236_d0393c54-ad42-4d81-aa60-5254d8936432.webp",
    "https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/Others/Probki/hf_20260202_022401_0b9d84ac-3a01-45f9-8e13-f7c399165cc5.webp",
    "https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/Others/Probki/hf_20260202_022438_31bd24a4-392f-43ec-b0eb-fb1cce7732b0.webp",
    "https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/Others/Probki/wgrane2.webp",
    "https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/Others/Probki/wgrane3.webp"
];

const SLIDER_DATA = [
  {
    id: 'voice',
    title: "Magia profesjonalnego głosu (Lektorzy)",
    icon: <Mic2 size={32} />,
    color: "bg-blue-50 text-blue-600",
    description: "W naszych Multibajkach ożywiamy postacie dzięki głosom profesjonalnych lektorów, którzy nadają historii wyjątkowy charakter.",
    bullets: [
      "Efekt Wow: Usłyszenie swojej własnej historii, buduje u dziecka ogromne poczucie ważności i sprawstwa.",
      "Wspólne przeżywanie: Rodzice mogą również samodzielnie przeczytać bajkę dziecku, co wzmacnia więzi emocjonalne."
    ],
    actionType: 'audio',
    actionLabel: 'Posłuchaj głosu naszych lektorów',
    actionSrc: 'https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/Others/Probki/malilektor.mp3'
  },
  {
    id: 'music',
    title: "Emocjonalna ścieżka dźwiękowa (Muzyka)",
    icon: <Music size={32} />,
    color: "bg-purple-50 text-purple-600",
    description: "Za głębię doznań odpowiadają autorskie utwory muzyczne, komponowane specjalnie pod konkretne historie.",
    bullets: [
      "Stymulacja zmysłów: Muzyka i udźwiękowienie rozwijają wyobraźnię oraz pobudzają wrażliwość dziecka, pomagając mu lepiej zrozumieć emocje bohaterów.",
      "Atmosfera przygody: Dźwięki budują napięcie podczas „misji ratunkowych” i koją podczas szczęśliwego zakończenia, ucząc dziecko rozpoznawania nastrojów."
    ],
    actionType: 'audio',
    actionLabel: 'Posłuchaj przykładowej muzyki',
    actionSrc: 'https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/Others/Probki/maluchy%20background.mp3'
  },
  {
    id: 'art',
    title: "Edukacja estetyczna (Ilustracje)",
    icon: <Palette size={32} />,
    color: "bg-pink-50 text-pink-600",
    description: "Wyświetlane piękne, statyczne obrazy to fundament „edukacji estetycznej od najmłodszych lat”.",
    bullets: [
      "Koncentracja bez przebodźcowania: W przeciwieństwie do szybkich kreskówek, statyczne ilustracje pomagają dziecku skupić uwagę i wyciszyć się po intensywnej zabawie.",
      "Rozwój percepcji: Multibajka to doskonałe narzędzie do treningu uważności, pozwalające na właściwą stymulację percepcji słuchowej i wzrokowej jednocześnie."
    ],
    actionType: 'gallery',
    actionLabel: 'Zobacz przykładowe obrazy',
    actionSrc: '' // Handled by gallery modal
  }
];

// --- SUB-COMPONENTS ---

// 1. Age Card with Slideshow
const AgeCard = ({ ageKey, title, description, color, bgColor, borderColor, badgeColor }: any) => {
    const images = AGE_GROUP_IMAGES[ageKey] || [];
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % images.length);
        }, 4000); // Change every 4 seconds
        return () => clearInterval(interval);
    }, [images.length]);

    return (
        <div className={`rounded-[2rem] overflow-hidden border ${borderColor} ${bgColor} flex flex-col h-full`}>
            {/* Image Slider Header */}
            <div className="relative w-full aspect-[21/9] bg-slate-200 overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.img
                        key={index}
                        src={images[index]}
                        alt={`${title} hero`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                </AnimatePresence>
                {/* Gradient Overlay for text readability if needed, or just aesthetic */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
            </div>

            <div className="p-8 flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-3">
                    <span className={`${badgeColor} text-xs font-black px-3 py-1 rounded-full uppercase`}>{ageKey} lat</span>
                    <h3 className="text-xl font-black text-slate-900 uppercase">{title}</h3>
                </div>
                <p className="text-slate-700 font-medium leading-relaxed">
                    {description}
                </p>
            </div>
        </div>
    );
};

// 2. Feature Card with Interactive Elements (Now stateless about playing audio, fully controlled by parent)
interface FeatureCardProps {
    item: typeof SLIDER_DATA[0];
    isPlaying: boolean;
    onToggleAudio: () => void;
    onOpenGallery: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ item, isPlaying, onToggleAudio, onOpenGallery }) => {
    return (
        <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="flex flex-col gap-6 mb-4">
                <div className={`w-16 h-16 rounded-3xl ${item.color} shadow-sm flex items-center justify-center shrink-0`}>
                    {item.icon}
                </div>
                <h3 className="text-xl font-display font-black text-slate-900 leading-tight min-h-[3.5rem] flex items-center">
                    {item.title}
                </h3>
            </div>

            <div className="space-y-6 flex-1 flex flex-col">
                <p className="text-slate-700 font-semibold leading-relaxed">
                    {item.description}
                </p>
                <ul className="space-y-3">
                    {item.bullets.map((bullet, idx) => (
                        <li key={idx} className="flex gap-3 text-slate-600 font-medium text-sm leading-relaxed">
                            <span className="text-[var(--primary)] text-lg shrink-0">•</span>
                            <span>{bullet}</span>
                        </li>
                    ))}
                </ul>

                {/* Interactive Button at the bottom */}
                <div className="mt-auto pt-6">
                    {item.actionType === 'audio' && (
                        <button 
                            onClick={onToggleAudio}
                            className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${isPlaying ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600'}`}
                        >
                            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Volume2 size={18} />}
                            {isPlaying ? 'Zatrzymaj' : item.actionLabel}
                        </button>
                    )}
                    {item.actionType === 'gallery' && (
                        <button 
                            onClick={onOpenGallery}
                            className="w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all bg-white border-2 border-slate-200 text-slate-600 hover:border-pink-400 hover:text-pink-600"
                        >
                            <ImageIcon size={18} />
                            {item.actionLabel}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};


const PartnerLanding: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { session } = useAuth(); 
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showArticle, setShowArticle] = useState(false);
  const [showCreatorLock, setShowCreatorLock] = useState(false);
  
  // Gallery Modal State
  const [showGallery, setShowGallery] = useState(false);
  const [currentGalleryImage, setCurrentGalleryImage] = useState(0);

  // Video State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Audio Logic (Centralized)
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const audioInstanceRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchPartner = async () => {
      if (!slug) return;
      try {
        const { data } = await supabase
          .schema('PartnersApp')
          .from('Partners')
          .select('*')
          .eq('Slug', slug)
          .single();
        setPartner(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPartner();
  }, [slug]);

  useEffect(() => {
    if (showArticle || showGallery || showCreatorLock) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showArticle, showGallery, showCreatorLock]);

  // Handle Audio Cleanup on Unmount
  useEffect(() => {
      return () => {
          if (audioInstanceRef.current) {
              audioInstanceRef.current.pause();
              audioInstanceRef.current = null;
          }
      };
  }, []);

  const handleToggleAudio = (id: string, src: string) => {
      // 1. If same ID is playing, pause it.
      if (activeAudioId === id) {
          if (audioInstanceRef.current) {
              audioInstanceRef.current.pause();
              audioInstanceRef.current = null;
          }
          setActiveAudioId(null);
          return;
      }

      // 2. If different ID is playing (or nothing), stop previous and start new.
      if (audioInstanceRef.current) {
          audioInstanceRef.current.pause();
      }

      const newAudio = new Audio(src);
      audioInstanceRef.current = newAudio;
      setActiveAudioId(id);

      newAudio.play().catch(e => {
          console.error("Audio play failed", e);
          setActiveAudioId(null);
      });

      newAudio.onended = () => {
          setActiveAudioId(null);
          audioInstanceRef.current = null;
      };
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDER_DATA.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDER_DATA.length) % SLIDER_DATA.length);
  };

  const handlePlayVideo = () => {
    if (videoRef.current) {
        videoRef.current.play();
        setIsVideoPlaying(true);
    }
  };

  const handleCreatorClick = (e: React.MouseEvent) => {
      e.preventDefault();
      setShowCreatorLock(true);
  };

  if (loading) return <div className="min-h-screen bg-[#eeeef5]" />;
  if (!partner) return <div className="min-h-screen bg-[#eeeef5] flex items-center justify-center font-bold text-slate-400">Nie znaleziono partnera</div>;

  const primaryColor = partner.Theme?.primaryColor || '#3b82f6';
  const accentColor = partner.Theme?.accentColor || '#ec4899';
  
  // Poster URL Logic: Priority to Partner's PhotoUrl, fallback to Universal Default (Desktop)
  const posterUrlDesktop = partner.PhotoUrl || "https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/UniversalPhotos/PosterVideoUniwesal21_9.webp";

  const dynamicStyle = {
    '--primary': primaryColor,
    '--accent': accentColor,
  } as React.CSSProperties;

  return (
    <div style={dynamicStyle} className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#fccb00] selection:text-black">
      
      {/* 1. SEKCJA HERO */}
      {/* UPDATE: Added md:aspect-[21/9] to enforce aspect ratio on desktop, z-30 for stacking context, removed overflow-hidden from parent to let logo hang out */}
      <section className="relative w-full min-h-[85vh] md:min-h-0 md:aspect-[21/9] flex items-center justify-center bg-slate-900 z-30">
        
        {/* Wrapper for video to clip it without clipping the logo */}
        <div className="absolute inset-0 overflow-hidden">
             {/* 
                UPDATE 1 & 2: Split Video for Mobile vs Desktop 
                Mobile: Uses UniversalPhotos/HeroPhotoMobileOK.webp as poster and UniversalVideos/HeroVideos/HeroVideoMobile.webm as source
             */}
             
             {/* DESKTOP VIDEO (Hidden on Mobile) */}
             <video
                autoPlay
                loop
                muted
                playsInline
                poster="https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/UniversalPhotos/HeroPhotoPartnerApp.webp"
                className="hidden md:block w-full h-full object-cover"
             >
                <source src="https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/UniversalVideos/HeroVideos/HeroVideoV2.webm" type="video/webm" />
             </video>

             {/* MOBILE VIDEO (Visible only on Mobile) */}
             <video
                autoPlay
                loop
                muted
                playsInline
                poster="https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/UniversalPhotos/HeroPhotoMobileOK.webp"
                className="block md:hidden w-full h-full object-cover"
             >
                <source src="https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/UniversalVideos/HeroVideos/HeroVideoMobile.webm" type="video/webm" />
             </video>

             {/* Gradient overlay inside the clipped area */}
             <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center gap-8 mt-10">
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <span className="inline-block py-1 px-3 rounded-full border border-white/20 bg-white/10 text-white text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md">
                    Nowość w ofercie {partner.PartnerNameGenitive || partner.PartnerName}
                </span>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-black text-white leading-[1.2] mb-8 drop-shadow-lg">
                    Twoje dziecko <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] drop-shadow-sm italic relative px-1">bohaterem</span> <br />
                    niezwykłej historii w <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] drop-shadow-sm italic relative px-1">{partner.PartnerNameGenitive || partner.PartnerName}</span>
                </h1>
                <p className="text-white/80 uppercase tracking-[0.2em] font-bold text-xs md:text-sm drop-shadow-md">
                    PAMIĄTKA, KTÓRA BUDUJE CHARAKTER I ZOSTAJE NA LATA.
                </p>
                <p className="text-lg md:text-xl text-white max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-md mt-6">
                    Zamień wizytę w {partner.PartnerNameGenitive || partner.PartnerName} w personalizowaną Multibajkę. To emocjonalna podróż, która rozwija wyobraźnię i wzmacnia pewność siebie.
                </p>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mb-16"
            >
                <Link 
                    to={`/${slug}/kreator`}
                    onClick={handleCreatorClick}
                    className="group relative inline-flex items-center justify-center px-10 py-5 text-lg md:text-xl font-black text-black bg-[#fccb00] rounded-full hover:scale-105 hover:shadow-[0_0_30px_rgba(252,203,0,0.5)] transition-all duration-300 shadow-xl"
                >
                    ZAMÓW MULTIBAJKĘ!
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={24} strokeWidth={3} />
                </Link>
            </motion.div>
        </div>

        {/* LOGO OVERLAP - Absolute positioning relative to the section */}
        {/* Increased Z-index to 40 to ensure it's above the next section (which has z-20) */}
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 z-40">
            <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-full p-4 shadow-2xl border-4 border-white flex items-center justify-center overflow-hidden"
            >
                {partner.LogoUrl ? (
                    <img src={partner.LogoUrl} alt={partner.PartnerName} className="w-full h-full object-contain" />
                ) : (
                    <span className="font-display font-black text-3xl text-slate-900">{partner.PartnerName.charAt(0)}</span>
                )}
            </motion.div>
        </div>
      </section>

      {/* 2. SEKCJA VIDEO */}
      {/* Added relative and z-20 to manage stacking context relative to the logo above */}
      <section className="pt-28 pb-20 px-6 bg-slate-50 border-b border-slate-200 relative z-20">
          <div className="max-w-6xl mx-auto">
              
              <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left mb-12">
                  <div className="flex-1">
                      <h2 className="text-3xl font-display font-black text-slate-900 mb-4">Wspomnienia, które dają siłę.</h2>
                      <p className="text-slate-600 text-lg leading-relaxed font-medium">
                          Spraw, by Twoje dziecko poczuło się wyjątkowe. Personalizowana przygoda, w której staje się bohaterem, to prezent o wielkiej mocy – buduje odwagę i zostawia trwały ślad w pamięci.
                      </p>
                  </div>
                  <div className="hidden md:block w-px h-24 bg-slate-200"></div>
                  <div className="md:w-1/3 flex justify-center">
                       <Link 
                            to={`/${slug}/kreator`} 
                            onClick={handleCreatorClick}
                            className="text-slate-900 font-bold underline decoration-[#fccb00] decoration-4 underline-offset-4 hover:text-slate-600 transition-colors"
                       >
                           Stwórz własną historię &rarr;
                       </Link>
                  </div>
              </div>

              {/* VIDEO PLAYER WITH CUSTOM POSTER & BUTTON */}
              <div className="relative w-full aspect-[21/9] bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200 group">
                  <video 
                    ref={videoRef}
                    src="https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/UniversalVideos/PromoVideos/OfferMoviePlaygroundsV1.0.mp4"
                    poster={posterUrlDesktop}
                    controls={isVideoPlaying} // Controls appear only after playing
                    className="w-full h-full object-cover"
                    onPlay={() => setIsVideoPlaying(true)}
                  >
                    Twój nie obsługuje elementu wideo.
                  </video>

                  {/* CUSTOM PLAY BUTTON OVERLAY */}
                  {!isVideoPlaying && (
                    <div 
                        onClick={handlePlayVideo}
                        className="absolute inset-0 z-20 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors cursor-pointer group"
                    >
                         <div className="relative">
                            <div className="absolute inset-0 bg-white/60 rounded-full animate-ping opacity-75"></div>
                            <div className="relative w-20 h-20 md:w-24 md:h-24 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl transition-transform transform group-hover:scale-110">
                                <Play size={36} className="text-slate-900 ml-1" fill="currentColor" />
                            </div>
                         </div>
                    </div>
                  )}
              </div>

          </div>
      </section>

      {/* 3. SEKCJA FEATURES (Responsive: Slider on Mobile, Grid on Desktop) */}
      <section className="py-20 px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-center space-y-12">
          
          <div className="text-center max-w-3xl">
            <h2 className="text-2xl md:text-4xl font-display font-black text-slate-900 mb-4 leading-tight">
              Czym jest Personalizowana Multibajka z urodzin i dlaczego warto ją wybrać?
            </h2>
            <p className="text-slate-500 font-medium md:text-lg">
              Multibajka to unikalne połączenie tradycyjnego opowiadania z nowoczesną technologią, gdzie głównym bohaterem przygody staje się Twoje dziecko.
            </p>
          </div>

          {/* MOBILE SLIDER (< md) */}
          <div className="w-full relative group md:hidden">
            <div className="flex flex-col gap-6 relative">
              <button 
                onClick={handlePrevSlide}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all border border-slate-100 opacity-0 group-hover:opacity-100 pointer-events-auto"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={handleNextSlide}
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all border border-slate-100 opacity-0 group-hover:opacity-100 pointer-events-auto"
              >
                <ChevronRight size={24} />
              </button>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="w-full"
                >
                   {/* UPDATE 4: Pass managed state to FeatureCard */}
                   <FeatureCard 
                        item={SLIDER_DATA[currentSlide]} 
                        isPlaying={activeAudioId === SLIDER_DATA[currentSlide].id}
                        onToggleAudio={() => handleToggleAudio(SLIDER_DATA[currentSlide].id, SLIDER_DATA[currentSlide].actionSrc)}
                        onOpenGallery={() => setShowGallery(true)} 
                   />
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center justify-center gap-3">
                {SLIDER_DATA.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-10 bg-slate-900' : 'w-2 bg-slate-200 hover:bg-slate-300'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* DESKTOP GRID (>= md) */}
          <div className="hidden md:grid grid-cols-3 gap-6 w-full">
            {SLIDER_DATA.map((item, index) => (
              /* UPDATE 4: Pass managed state to FeatureCard */
              <FeatureCard 
                key={index} 
                item={item} 
                isPlaying={activeAudioId === item.id}
                onToggleAudio={() => handleToggleAudio(item.id, item.actionSrc)}
                onOpenGallery={() => setShowGallery(true)} 
              />
            ))}
          </div>

          <motion.div 
             initial={{ opacity: 0, y: 10 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="max-w-3xl mx-auto text-center py-8 px-6 bg-slate-50/50 rounded-[2rem] border border-slate-100"
          >
             <h4 className="text-xl font-display font-black text-slate-900 mb-4">Podsumowując: Dlaczego warto?</h4>
             <p className="text-slate-600 font-medium leading-relaxed md:text-lg">
               Wybierając Multibajkę jako element urodzin, dajesz dziecku coś więcej niż tylko rozrywkę. Dajesz mu dowód na to, że jest bohaterem.
             </p>
          </motion.div>

        </div>
      </section>

      {/* 5. SEKCJA: WIEK (GRID) */}
      <section className="py-20 px-6 bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50 skew-x-12 translate-x-20 z-0" />
          <div className="max-w-6xl mx-auto relative z-10">
              <h2 className="text-3xl font-display font-black text-slate-900 mb-12">Przygoda dopasowana do wieku</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* 3-5 */}
                  <AgeCard 
                    ageKey="3-5"
                    title="Mały Marzyciel"
                    description="Łagodne, bezpieczne historie pełne ciepła. Bez gwałtownych zwrotów akcji i nadmiaru bodźców. Idealne dla wrażliwych dzieci, które kochają bajkowy klimat i zwierzątka."
                    color="text-sky-800"
                    bgColor="bg-sky-50"
                    borderColor="border-sky-100"
                    badgeColor="bg-sky-200 text-sky-800"
                  />

                  {/* 6-8 */}
                  <AgeCard 
                    ageKey="6-8"
                    title="Dzielny Bohater"
                    description="Dynamiczne opowieści, w których dziecko działa jako 'aktywny agent' zmian. Jest cel, misja i przeszkody do pokonania – dla wulkanów energii, którzy chcą ratować świat."
                    color="text-orange-800"
                    bgColor="bg-orange-50"
                    borderColor="border-orange-100"
                    badgeColor="bg-orange-200 text-orange-800"
                  />

                  {/* 9-12 */}
                  <AgeCard 
                    ageKey="9-12"
                    title="Mistrz Zagadek"
                    description="Interaktywna bajka pełna tajemnic. Dla bystrzaków, którzy szukają intelektualnej rozrywki i logicznych wyzwań."
                    color="text-violet-800"
                    bgColor="bg-violet-50"
                    borderColor="border-violet-100"
                    badgeColor="bg-violet-200 text-violet-800"
                  />

                  {/* 13+ */}
                  <AgeCard 
                    ageKey="13+"
                    title="Architekt Legend"
                    description="Epicka podróż o dokonywaniu wyborów i ich konsekwencjach. Narracyjna wyprawa, która wspiera budowanie tożsamości i poczucia wpływu na losy świata."
                    color="text-slate-800"
                    bgColor="bg-slate-100"
                    borderColor="border-slate-200"
                    badgeColor="bg-slate-300 text-slate-800"
                  />
              </div>
          </div>
      </section>

      {/* 6. SEKCJA: ASPEKT PSYCHOLOGICZNY (Była: Dlaczego to działa?) */}
      <section className="py-20 px-6 bg-slate-900 text-white">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16 items-start">
               {/* UPDATE 3: Fixed sticky overlap on mobile by removing sticky on small screens (md:sticky) */}
               <div className="md:w-1/3 relative md:sticky md:top-10">
                   <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-[#fccb00]">
                       <Brain size={40} />
                   </div>
                   <h2 className="text-4xl font-display font-black mb-6">Aspekt psychologiczny</h2>
                   <p className="text-slate-400 text-lg leading-relaxed mb-8">
                       Wiedza dla świadomego rodzica. Nasze bajki to nie tylko rozrywka, to narzędzie wspierające rozwój oparte na solidnych podstawach psychologii.
                   </p>
                   
                   <button 
                    onClick={() => setShowArticle(true)}
                    className="inline-flex items-center gap-2 text-slate-900 font-bold bg-[#fccb00] px-6 py-3 rounded-xl hover:bg-[#e5b800] transition-colors"
                   >
                       <BookOpen size={20} /> Przeczytaj artykuł
                   </button>
               </div>

               <div className="md:w-2/3 space-y-8">
                   <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10">
                       <h3 className="text-xl font-bold text-[#fccb00] mb-3 flex items-center gap-2">
                           <CheckCircle2 size={20} /> Efekt odniesienia do Ja
                       </h3>
                       <p className="text-slate-300 font-medium leading-relaxed">
                           Mózg dziecka przetwarza informacje o samym sobie priorytetowo, co trwale podnosi samoocenę i buduje fundament poczucia własnej wartości.
                       </p>
                   </div>
                   <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10">
                       <h3 className="text-xl font-bold text-[#fccb00] mb-3 flex items-center gap-2">
                           <CheckCircle2 size={20} /> Psychologia Empowermentu
                       </h3>
                       <p className="text-slate-300 font-medium leading-relaxed">
                           Widząc siebie w roli bohatera rozwiązującego zadania, dziecko zmienia swój model wewnętrzny z "istoty zależnej" na "sprawczego bohatera".
                       </p>
                   </div>
                   <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10">
                       <h3 className="text-xl font-bold text-[#fccb00] mb-3 flex items-center gap-2">
                           <CheckCircle2 size={20} /> Redukcja lęków
                       </h3>
                       <p className="text-slate-300 font-medium leading-relaxed">
                           Dzięki metodzie desensytyzacji, dziecko przechodzi przez trudne sytuacje w wyobraźni, co obniża napięcie emocjonalne w prawdziwym życiu.
                       </p>
                   </div>
               </div>
          </div>
      </section>

      {/* 7. SEKCJA: OFERTA */}
      <section className="py-20 px-6 bg-slate-50">
          <div className="max-w-4xl mx-auto">
              <h2 className="text-center text-3xl font-display font-black text-slate-900 mb-12">Wybierz swój pakiet</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                   <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center opacity-70 hover:opacity-100 transition-opacity">
                       <h3 className="text-xl font-black text-slate-900 mb-2">Pakiet Standard</h3>
                       <p className="text-slate-500 font-medium mb-6">Multibajka Wideo (Dostawa w 24h)</p>
                       <div className="text-3xl font-black text-slate-900 mb-8">49 PLN</div>
                       <Link 
                            to={`/${slug}/kreator`} 
                            onClick={handleCreatorClick}
                            className="block w-full py-4 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200"
                        >
                            Wybieram Standard
                        </Link>
                   </div>

                   <div className="relative p-8 rounded-3xl bg-slate-900 text-white shadow-2xl scale-105 border-2 border-[#fccb00]">
                       <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#fccb00] text-black text-xs font-black px-4 py-1 rounded-full uppercase">
                           Najczęściej wybierany
                       </div>
                       <h3 className="text-2xl font-black text-white mb-2 text-center">Pakiet Premium</h3>
                       <div className="text-slate-300 font-medium mb-6 text-center text-sm">
                           Multibajka Wideo + <span className="text-[#fccb00] font-bold">Wersja do czytania</span>
                       </div>
                       
                       <div className="mb-8 p-4 bg-white/10 rounded-xl border border-white/10">
                           <div className="flex items-center gap-2 text-[#fccb00] font-bold text-xs uppercase mb-2">
                               <Star size={12} fill="currentColor" /> TYLKO TERAZ! W TWOIM PAKIECIE GRATIS!
                           </div>
                           <p className="text-slate-300 text-sm leading-relaxed">
                               Wciel się w rolę narratora! Przeczytaj dziecku bajkę o nim samym. Twój głos buduje bliskość, a wspólna lektura przed snem to najlepszy trening pewności siebie.
                           </p>
                       </div>

                       <Link 
                          to={`/${slug}/kreator`} 
                          onClick={handleCreatorClick}
                          className="block w-full py-4 rounded-xl bg-[#fccb00] text-black font-black text-center hover:bg-[#e5b800] transition-colors"
                       >
                           ZAMÓW PAKIET PREMIUM
                       </Link>
                   </div>
              </div>
          </div>
      </section>

      {/* 8. STOPKA */}
      <footer className="py-12 px-6 bg-white border-t border-slate-100">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
               <div className="flex items-center gap-4">
                   {partner.LogoUrl ? (
                       <img src={partner.LogoUrl} alt={partner.PartnerName} className="h-12 w-auto object-contain" />
                   ) : (
                       <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-400">
                           {partner.PartnerName.charAt(0)}
                       </div>
                   )}
                   <span className="font-bold text-slate-900">{partner.PartnerName}</span>
               </div>
               
               <div className="flex gap-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-center md:text-right flex-wrap justify-center">
                   <span>Pamiątka z duszą</span>
                   <span>Urodziny, które budują charakter</span>
                   <span>Gwarancja uśmiechu</span>
               </div>
          </div>
      </footer>
      
      {/* 9. DISCREET BACK BUTTON (Visible ONLY to Logged In Users) */}
      {session && (
          <div className="w-full py-6 flex justify-center bg-white pb-12">
              <button 
                  onClick={() => navigate('/hub')}
                  className="group flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-slate-600 hover:bg-slate-50 transition-all"
              >
                  <ChevronLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
                  Wróć do Panelu
              </button>
          </div>
      )}

      {/* GALLERY MODAL */}
      <AnimatePresence>
        {showGallery && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4">
                <button 
                    onClick={() => setShowGallery(false)}
                    className="absolute top-6 right-6 text-white/70 hover:text-white z-20"
                >
                    <X size={32} />
                </button>

                <div className="w-full max-w-5xl aspect-video relative flex items-center justify-center">
                    <button 
                        onClick={() => setCurrentGalleryImage(prev => (prev - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length)}
                        className="absolute left-4 z-10 w-12 h-12 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"
                    >
                        <ChevronLeft />
                    </button>
                    
                    <motion.img 
                        key={currentGalleryImage}
                        src={GALLERY_IMAGES[currentGalleryImage]}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="max-h-[85vh] max-w-full rounded-lg shadow-2xl object-contain"
                    />

                    <button 
                        onClick={() => setCurrentGalleryImage(prev => (prev + 1) % GALLERY_IMAGES.length)}
                        className="absolute right-4 z-10 w-12 h-12 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"
                    >
                        <ChevronRight />
                    </button>
                </div>
                
                {/* Thumbnails */}
                <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 overflow-x-auto px-4">
                    {GALLERY_IMAGES.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentGalleryImage(idx)}
                            className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${currentGalleryImage === idx ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`}
                        >
                            <img src={img} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            </div>
        )}
      </AnimatePresence>

      {/* CREATOR LOCK MODAL */}
      <AnimatePresence>
        {showCreatorLock && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    onClick={() => setShowCreatorLock(false)}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />
                
                {/* Modal Content */}
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                    animate={{ scale: 1, opacity: 1, y: 0 }} 
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-white rounded-[2.5rem] p-8 md:p-12 max-w-md w-full relative z-10 shadow-2xl text-center border-4 border-white"
                >
                    <button 
                        onClick={() => setShowCreatorLock(false)}
                        className="absolute top-6 right-6 text-slate-300 hover:text-slate-600 transition-colors"
                    >
                        <X size={24} />
                    </button>

                    <div className="w-24 h-24 bg-blue-50 text-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <Rocket size={48} className="animate-pulse" />
                    </div>

                    <h3 className="text-2xl font-display font-black text-slate-900 mb-4 leading-tight">
                        Kreator w przygotowaniu
                    </h3>
                    
                    {/* UPDATE 5: New message text */}
                    <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                        Dostępne Tylko dla aktywnych partnerów
                    </p>

                    <button 
                        onClick={() => setShowCreatorLock(false)}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition-all active:scale-95"
                    >
                        Rozumiem, czekam!
                    </button>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* ARTICLE MODAL */}
      <AnimatePresence>
        {showArticle && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center sm:p-4 p-0">
             {/* Backdrop */}
             <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowArticle(false)}
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
             />

             {/* Content */}
             <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative bg-white w-full max-w-4xl max-h-[90vh] md:rounded-[2rem] rounded-t-[2rem] overflow-y-auto shadow-2xl z-10"
             >
                 {/* Close Button */}
                 <button 
                    onClick={() => setShowArticle(false)}
                    className="absolute top-4 right-4 md:top-6 md:right-6 z-20 p-2 bg-white/80 backdrop-blur-sm rounded-full text-slate-500 hover:text-slate-900 shadow-sm border border-slate-100"
                 >
                    <X size={24} />
                 </button>

                 {/* Article Content copied from ArticleView */}
                 <div className="relative">
                    {/* Hero Image in Modal */}
                    <div className="w-full aspect-[21/9] relative bg-slate-50">
                        <img 
                            src="https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/UniversalPhotos/BlogArticleHero.webp" 
                            alt="Hero" 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6 md:p-12">
                            <span className="text-white/90 font-bold tracking-wider text-xs uppercase border border-white/30 px-3 py-1 rounded-full backdrop-blur-md">
                                Edukacja i Rozwój
                            </span>
                        </div>
                    </div>

                    <div className="p-6 md:p-12 prose prose-lg prose-slate max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-blue-600">
                         <h1 className="text-2xl md:text-4xl font-display font-black text-slate-900 mb-6 leading-[1.1]">
                            Urodziny z Supermocami: Dlaczego Twoje Dziecko Zasługuje na Własną Historię?
                        </h1>

                        <p className="lead text-lg text-slate-600 mb-6 font-medium">
                            Większość urodzin w salach zabaw wygląda podobnie: radosny pisk, tona energii, tort, a na koniec plastikowy gadżet w torebce prezentowej, który po dwóch dniach ląduje w kącie. A gdyby tak tym razem jubilat zabrał ze sobą coś, co zostanie w jego sercu (i głowie) na lata?
                        </p>

                        <p className="mb-6">
                            Wprowadzamy nowość, która zmienia zasady gry: <strong>Personalizowaną Multibajkę</strong>. To nie jest zwykła animacja. To narzędzie psychologiczne ubrane w szaty pięknej opowieści, w której to <strong>Twoje dziecko ratuje świat.</strong>
                        </p>

                        <hr className="my-8 border-slate-100" />

                        <h3 className="text-xl text-slate-800 mb-3 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-bold shrink-0">1</span>
                            Magia „Efektu Odniesienia do Ja”
                        </h3>
                        
                        <p className="mb-4">
                            Czy zauważyłeś, jak Twoje dziecko rozkwita, gdy słyszy swoje imię? W psychologii nazywamy to <strong>efektem odniesienia do Ja</strong> (<em>self-referential effect</em>). Nasze mózgi są zaprogramowane tak, by priorytetowo traktować informacje o nas samych.
                        </p>
                        
                        <p className="mb-4">
                            Kiedy jubilat słyszy w głośnikach: <em>„Tylko Ty, [Imię Dziecka], możesz pomóc mieszkańcom oceanu!”</em>, dzieje się coś niezwykłego:
                        </p>

                        <ul className="space-y-2 mb-8 pl-0 list-none">
                            <li className="flex items-start gap-3">
                                <ArrowRight className="text-green-500 mt-1.5 shrink-0" size={18} /> 
                                <span><strong>Koncentracja rośnie do maksimum.</strong></span>
                            </li>
                            <li className="flex items-start gap-3">
                                 <ArrowRight className="text-green-500 mt-1.5 shrink-0" size={18} /> 
                                <span>Dziecko przestaje być tylko widzem, a staje się sprawcą.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                 <ArrowRight className="text-green-500 mt-1.5 shrink-0" size={18} /> 
                                <span>Buduje się silne poczucie własnej wartości.</span>
                            </li>
                        </ul>

                        <div className="my-8 rounded-2xl overflow-hidden shadow-lg h-48 md:h-72">
                             <img src="https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/UniversalPhotos/RealityVSvirtual/6-8Boy1.webp" alt="Imagination" className="w-full h-full object-cover" />
                        </div>

                        <h3 className="text-xl text-slate-800 mb-3 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 text-sm font-bold shrink-0">2</span>
                            Więcej niż zabawa – to trening odwagi
                        </h3>

                        <p className="mb-4">
                            W świecie Multibajki dziecko staje przed wyzwaniami: musi posprzątać ocean z plastiku lub pomóc zagubionym zwierzętom. Dzięki mechanizmowi <strong>transportu narracyjnego</strong> dziecko „wchodzi” w historię całym sobą.
                        </p>

                        <blockquote className="p-6 bg-slate-50 rounded-xl border-l-4 mb-8" style={{borderColor: primaryColor}}>
                            <p className="italic text-slate-700 font-medium m-0 text-base">
                                <strong>Co to oznacza w praktyce?</strong> Jeśli dziecko poradzi sobie z problemem w bajce, jego podświadomość koduje prosty komunikat: <em>„Jestem odważny. Potrafię rozwiązywać problemy”</em>. To tzw. <strong>empowerment</strong>, czyli budowanie poczucia sprawstwa, które dzieci przenoszą potem na plac zabaw i do szkoły.
                            </p>
                        </blockquote>

                        <h3 className="text-xl text-slate-800 mb-3 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-100 text-pink-600 text-sm font-bold shrink-0">3</span>
                            Pamiątka, która wycisza i koi
                        </h3>

                        <p className="mb-4">
                            Urodziny w parku trampolin czy sali zabaw to ogromna dawka bodźców. Multibajka, którą otrzymujecie po imprezie, to idealny sposób na <strong>powrót do równowagi</strong>.
                        </p>

                        <ul className="list-disc pl-5 space-y-2 mb-8 text-slate-700">
                            <li><strong>Wieczorny rytuał:</strong> Słuchanie o własnych przygodach przed snem pomaga obniżyć napięcie i lęk.</li>
                            <li><strong>Wsparcie terapeutyczne:</strong> Dzięki metodzie desensytyzacji (oswajania lęków poprzez historię), dziecko uczy się, że nawet trudne sytuacje mają szczęśliwe zakończenie.</li>
                        </ul>

                        <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white text-center mt-12 mb-6">
                            <h4 className="text-xl md:text-2xl font-display font-bold mb-4">Podaruj dziecku dowód na to, że jest Bohaterem</h4>
                            <p className="font-bold text-lg" style={{color: accentColor}}>
                                Bo w {partner?.PartnerName || 'naszej sali zabaw'} każde dziecko jest głównym bohaterem swojej własnej przygody.
                            </p>
                        </div>
                    </div>
                 </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default PartnerLanding;
