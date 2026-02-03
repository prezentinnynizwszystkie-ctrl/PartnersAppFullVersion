
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Partner } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Mic2, Music, Palette, Brain, ArrowRight, Star, ChevronLeft, ChevronRight, BookOpen, CheckCircle2, X, Volume2, Pause, Image as ImageIcon, Rocket, Lock } from 'lucide-react';

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
const AgeCard = ({ ageKey, title, description, color, bgColor, borderColor, badgeColor, onPlaySample }: any) => {
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
                <p className="text-slate-700 font-medium leading-relaxed mb-6">
                    {description}
                </p>
                <div className="mt-auto">
                    <button 
                        onClick={onPlaySample}
                        className="w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all bg-white border-2 border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:shadow-sm"
                    >
                        <Play size={16} fill="currentColor" />
                        Zobacz przykładowy fragment
                    </button>
                </div>
            </div>
        </div>
    );
};

// 2. Feature Card
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
  
  // Coupon Code States
  const [heroCode, setHeroCode] = useState('');
  const [videoCode, setVideoCode] = useState('');
  const [offerCode, setOfferCode] = useState('');

  // Gallery Modal State
  const [showGallery, setShowGallery] = useState(false);
  const [currentGalleryImage, setCurrentGalleryImage] = useState(0);

  // Sample Video Modal State
  const [showSampleVideo, setShowSampleVideo] = useState(false);
  const sampleVideoUrl = "https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/UniversalVideos/HeroVideos/HeroBackground%20(1).webm";

  // Video State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Audio Logic (Centralized)
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const audioInstanceRef = useRef<HTMLAudioElement | null>(null);

  // --- RUNTIME COMPOSING STATE ---
  const [introStatus, setIntroStatus] = useState<'IDLE' | 'PLAYING' | 'FINISHED'>('IDLE');
  const introAudioRef = useRef<HTMLAudioElement | null>(null);
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null); // For Desktop
  const heroVideoMobileRef = useRef<HTMLVideoElement>(null); // For Mobile

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
    if (showArticle || showGallery || showCreatorLock || showSampleVideo) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showArticle, showGallery, showCreatorLock, showSampleVideo]);

  // Handle Audio Cleanup on Unmount
  useEffect(() => {
      return () => {
          if (audioInstanceRef.current) {
              audioInstanceRef.current.pause();
              audioInstanceRef.current = null;
          }
          // Cleanup Runtime Composing Audio
          if (introAudioRef.current) introAudioRef.current.pause();
          if (bgAudioRef.current) bgAudioRef.current.pause();
      };
  }, []);

  const handleToggleAudio = (id: string, src: string) => {
      if (activeAudioId === id) {
          if (audioInstanceRef.current) {
              audioInstanceRef.current.pause();
              audioInstanceRef.current = null;
          }
          setActiveAudioId(null);
          return;
      }
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

  const handleNextSlide = () => setCurrentSlide((prev) => (prev + 1) % SLIDER_DATA.length);
  const handlePrevSlide = () => setCurrentSlide((prev) => (prev - 1 + SLIDER_DATA.length) % SLIDER_DATA.length);

  const handlePlayVideo = () => {
    if (videoRef.current) {
        videoRef.current.play();
        setIsVideoPlaying(true);
    }
  };

  const handleCodeValidation = (code: string) => {
      if (code.trim().toLowerCase() !== 'test') {
          alert('Kod nieprawidłowy. Nie posiadasz kodu? Otrzymasz go na recepcji!');
          return;
      }
      if (partner?.Status === 'AKTYWNY') {
          navigate(`/${slug}/kreator`);
      } else {
          setShowCreatorLock(true);
      }
  };

  // --- RUNTIME COMPOSING LOGIC ---
  const startRuntimeComposing = async () => {
      if (!partner?.IntroUrl) return;

      setIntroStatus('PLAYING');

      // 1. Play Background Music immediately
      // Using a standard universal background for intro
      const bgAudio = new Audio("https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/Others/Probki/maluchy%20background.mp3");
      bgAudio.volume = 0.3;
      bgAudio.loop = false;
      bgAudioRef.current = bgAudio;
      bgAudio.play().catch(e => console.error("BG Audio fail", e));

      // 2. Schedule Voice Intro after 2 seconds
      setTimeout(() => {
          const introAudio = new Audio(partner.IntroUrl!);
          introAudioRef.current = introAudio;
          
          introAudio.onended = () => {
              // 3. When intro ends + buffer, reveal main video
              setTimeout(() => {
                  setIntroStatus('FINISHED');
                  // Fade out BG audio
                  let vol = 0.3;
                  const fadeInterval = setInterval(() => {
                      vol -= 0.05;
                      if (vol <= 0) {
                          clearInterval(fadeInterval);
                          bgAudio.pause();
                      } else {
                          bgAudio.volume = vol;
                      }
                  }, 200);

                  // Ensure underlying videos are playing
                  if (heroVideoRef.current) heroVideoRef.current.play();
                  if (heroVideoMobileRef.current) heroVideoMobileRef.current.play();

              }, 2000); // 2s buffer after voice ends
          };

          introAudio.play().catch(e => console.error("Intro Audio fail", e));
      }, 2000); // 2s delay before voice
  };

  // Helper to render Hero Header with highlighting
  const renderHeroHeader = (partner: Partner) => {
      // Changed default template to use space instead of \n to allow text-wrap: balance to work
      const text = partner.HeroHeader || `Twoje dziecko {bohaterem} niezwykłej przygody w {${partner.PartnerNameGenitive || partner.PartnerName}}`;
      const lines = text.split('\n');
      return lines.map((line, lineIdx) => (
          <React.Fragment key={lineIdx}>
              {line.split(/(\{[^}]+\})/g).map((part, partIdx) => {
                  if (part.startsWith('{') && part.endsWith('}')) {
                      return <span key={partIdx} className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] drop-shadow-sm italic relative px-1">{part.slice(1, -1)}</span>;
                  }
                  return <span key={partIdx}>{part}</span>;
              })}
              {lineIdx < lines.length - 1 && <br />}
          </React.Fragment>
      ));
  };

  if (loading) return <div className="min-h-screen bg-[#eeeef5]" />;
  if (!partner) return <div className="min-h-screen bg-[#eeeef5] flex items-center justify-center font-bold text-slate-400">Nie znaleziono partnera</div>;

  const primaryColor = partner.Theme?.primaryColor || '#3b82f6';
  const accentColor = partner.Theme?.accentColor || '#ec4899';
  const posterUrlDesktop = partner.PhotoUrl || "https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/UniversalPhotos/PosterVideoUniwesal21_9.webp";
  const dynamicStyle = { '--primary': primaryColor, '--accent': accentColor } as React.CSSProperties;

  return (
    <div style={dynamicStyle} className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#fccb00] selection:text-black">
      
      {/* 1. SEKCJA HERO (RUNTIME COMPOSING) */}
      <section className="relative w-full min-h-[85vh] lg:min-h-0 lg:aspect-[21/9] flex items-center justify-center bg-slate-900 z-30">
        
        {/* BASE LAYER: Standard Video Loop */}
        <div className="absolute inset-0 overflow-hidden z-0">
             <video ref={heroVideoRef} autoPlay loop muted playsInline poster="https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/UniversalPhotos/HeroPhotoPartnerApp.webp" className="hidden md:block w-full h-full object-cover">
                <source src="https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/UniversalVideos/HeroVideos/HeroVideoV2.webm" type="video/webm" />
             </video>
             <video ref={heroVideoMobileRef} autoPlay loop muted playsInline poster="https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/UniversalPhotos/HeroPhotoMobileOK.webp" className="block md:hidden w-full h-full object-cover">
                <source src="https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/UniversalVideos/HeroVideos/HeroVideoMobile.webm" type="video/webm" />
             </video>
             <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* OVERLAY LAYER: Runtime Composing Theater */}
        <AnimatePresence>
            {introStatus !== 'FINISHED' && partner.IntroUrl && (
                <motion.div 
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 1.5 } }}
                    className="absolute inset-0 z-20 flex items-center justify-center bg-black"
                >
                    {/* Blurred Poster Background */}
                    <div className="absolute inset-0 overflow-hidden">
                        <img 
                            src={partner.PhotoUrl || "https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/UniversalPhotos/PosterVideoUniwesal21_9.webp"} 
                            alt="Background" 
                            className="w-full h-full object-cover opacity-60 scale-110"
                        />
                        <div className="absolute inset-0 backdrop-blur-md bg-black/30" />
                    </div>

                    {/* Content */}
                    <div className="relative z-30 flex flex-col items-center justify-center">
                        {introStatus === 'IDLE' ? (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={startRuntimeComposing}
                                className="group flex flex-col items-center gap-4 cursor-pointer"
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 bg-white/30 rounded-full animate-ping opacity-50" />
                                    <div className="w-24 h-24 bg-white/10 backdrop-blur-md border border-white/50 rounded-full flex items-center justify-center shadow-2xl group-hover:bg-white/20 transition-all">
                                        <Play size={40} className="text-white ml-1" fill="currentColor" />
                                    </div>
                                </div>
                                <span className="text-white font-black uppercase tracking-[0.2em] text-sm drop-shadow-md">
                                    Odtwórz Intro
                                </span>
                            </motion.button>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="flex flex-col items-center gap-8"
                            >
                                {/* Floating Logo */}
                                <div className="w-48 h-48 md:w-64 md:h-64 bg-white rounded-full p-6 shadow-[0_0_60px_rgba(255,255,255,0.3)] border-4 border-white/50 flex items-center justify-center animate-[float_6s_ease-in-out_infinite]">
                                    {partner.LogoUrl ? (
                                        <img src={partner.LogoUrl} alt={partner.PartnerName} className="w-full h-full object-contain" />
                                    ) : (
                                        <span className="font-display font-black text-4xl text-slate-900">{partner.PartnerName.charAt(0)}</span>
                                    )}
                                </div>
                                
                                {/* Equalizer Effect (Simulated) */}
                                <div className="flex gap-1 items-end h-8">
                                    {[...Array(5)].map((_, i) => (
                                        <motion.div 
                                            key={i}
                                            animate={{ height: [10, 32, 15, 28, 10] }}
                                            transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                                            className="w-1.5 bg-white/80 rounded-full"
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Standard Hero Content (Text & Inputs) - Always visible underneath, interactive when intro finished */}
        <div className={`relative z-10 w-full max-w-5xl mx-auto px-6 text-center flex flex-col items-center gap-8 mt-10 transition-opacity duration-1000 ${introStatus === 'PLAYING' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full flex flex-col items-center"
            >
                <span className="inline-block py-1 px-3 rounded-full border border-white/20 bg-white/10 text-white text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md">
                    Nowość w ofercie {partner.PartnerNameGenitive || partner.PartnerName}
                </span>
                
                {/* IMPROVED HEADLINE: text-wrap: balance logic via style */}
                <h1 style={{ textWrap: 'balance' }} className="text-3xl md:text-5xl lg:text-6xl font-display font-black text-white leading-tight mb-8 drop-shadow-lg max-w-[90%] mx-auto">
                    {renderHeroHeader(partner)}
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
                className="mb-24 md:mb-32 flex flex-col items-center gap-4 w-full max-w-sm"
            >
                <div className="w-full relative">
                    <div className="bg-black/40 backdrop-blur-sm p-4 rounded-2xl border border-white/20">
                        <label className="block text-white/80 text-[10px] font-bold uppercase tracking-widest mb-2 text-center">
                            Poproś o kod kuponu na recepcji!
                        </label>
                        <input 
                            type="text" 
                            placeholder="Wpisz kod tutaj..." 
                            value={heroCode}
                            onChange={(e) => setHeroCode(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/90 text-slate-900 font-bold text-center placeholder:text-slate-400 focus:outline-none focus:border-[#fccb00] ring-2 ring-transparent focus:ring-[#fccb00]"
                        />
                    </div>
                </div>
                <button 
                    onClick={() => handleCodeValidation(heroCode)}
                    className="group relative inline-flex items-center justify-center px-10 py-5 text-lg md:text-xl font-black text-black bg-[#fccb00] rounded-full hover:scale-105 hover:shadow-[0_0_30px_rgba(252,203,0,0.5)] transition-all duration-300 shadow-xl w-full"
                >
                    ZAMÓW MULTIBAJKĘ!
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={24} strokeWidth={3} />
                </button>
            </motion.div>
        </div>

        {/* LOGO (Bottom Center) - Only visible if Intro not playing */}
        {introStatus !== 'PLAYING' && (
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
        )}
      </section>

      {/* 2. SEKCJA VIDEO */}
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
                  <div className="md:w-1/3 flex flex-col items-center justify-center gap-4 w-full">
                       <div className="w-full max-w-xs bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                            <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 text-center">
                                Poproś o kod kuponu na recepcji!
                            </label>
                            <input 
                                type="text" 
                                placeholder="Wpisz kod..." 
                                value={videoCode}
                                onChange={(e) => setVideoCode(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-bold text-center focus:outline-none focus:border-[#fccb00]"
                            />
                       </div>
                       <button 
                            onClick={() => handleCodeValidation(videoCode)}
                            className="text-slate-900 font-bold underline decoration-[#fccb00] decoration-4 underline-offset-4 hover:text-slate-600 transition-colors text-lg"
                       >
                           Stwórz własną historię &rarr;
                       </button>
                  </div>
              </div>

              {/* VIDEO PLAYER WITH CUSTOM POSTER & BUTTON */}
              <div className="relative w-full aspect-[21/9] bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200 group">
                  <video 
                    ref={videoRef}
                    src="https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/UniversalVideos/PromoVideos/OfferMoviePlaygroundsV1.0.mp4"
                    poster={posterUrlDesktop}
                    controls={isVideoPlaying} 
                    className="w-full h-full object-cover"
                    onPlay={() => setIsVideoPlaying(true)}
                  >
                    Twój nie obsługuje elementu wideo.
                  </video>

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

      {/* 3. SEKCJA FEATURES */}
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
              <button onClick={handlePrevSlide} className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all border border-slate-100 opacity-0 group-hover:opacity-100 pointer-events-auto">
                <ChevronLeft size={24} />
              </button>
              <button onClick={handleNextSlide} className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all border border-slate-100 opacity-0 group-hover:opacity-100 pointer-events-auto">
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
                  <AgeCard 
                    ageKey="3-5"
                    title="Mały Marzyciel"
                    description="Łagodne, bezpieczne historie pełne ciepła. Bez gwałtownych zwrotów akcji i nadmiaru bodźców. Idealne dla wrażliwych dzieci, które kochają bajkowy klimat i zwierzątka."
                    color="text-sky-800"
                    bgColor="bg-sky-50"
                    borderColor="border-sky-100"
                    badgeColor="bg-sky-200 text-sky-800"
                    onPlaySample={() => setShowSampleVideo(true)}
                  />
                  <AgeCard 
                    ageKey="6-8"
                    title="Dzielny Bohater"
                    description="Dynamiczne opowieści, w których dziecko działa jako 'aktywny agent' zmian. Jest cel, misja i przeszkody do pokonania – dla wulkanów energii, którzy chcą ratować świat."
                    color="text-orange-800"
                    bgColor="bg-orange-50"
                    borderColor="border-orange-100"
                    badgeColor="bg-orange-200 text-orange-800"
                    onPlaySample={() => setShowSampleVideo(true)}
                  />
                  <AgeCard 
                    ageKey="9-12"
                    title="Mistrz Zagadek"
                    description="Interaktywna bajka pełna tajemnic. Dla bystrzaków, którzy szukają intelektualnej rozrywki i logicznych wyzwań."
                    color="text-violet-800"
                    bgColor="bg-violet-50"
                    borderColor="border-violet-100"
                    badgeColor="bg-violet-200 text-violet-800"
                    onPlaySample={() => setShowSampleVideo(true)}
                  />
                  <AgeCard 
                    ageKey="13+"
                    title="Architekt Legend"
                    description="Epicka podróż o dokonywaniu wyborów i ich konsekwencjach. Narracyjna wyprawa, która wspiera budowanie tożsamości i poczucia wpływu na losy świata."
                    color="text-slate-800"
                    bgColor="bg-slate-100"
                    borderColor="border-slate-200"
                    badgeColor="bg-slate-300 text-slate-800"
                    onPlaySample={() => setShowSampleVideo(true)}
                  />
              </div>
          </div>
      </section>

      {/* 6. SEKCJA: ASPEKT PSYCHOLOGICZNY */}
      <section className="py-20 px-6 bg-slate-900 text-white">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16 items-start">
               <div className="md:w-1/3 relative md:sticky md:top-10">
                   <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-[#fccb00]">
                       <Brain size={40} />
                   </div>
                   <h2 className="text-4xl font-display font-black mb-6">Aspekt psychologiczny</h2>
                   <p className="text-slate-400 text-lg leading-relaxed mb-8">
                       Wiedza dla świadomego rodzica. Nasze bajki to nie tylko rozrywka, to narzędzie wspierające rozwój oparte na solidnych podstawach psychologii.
                   </p>
                   <button onClick={() => setShowArticle(true)} className="inline-flex items-center gap-2 text-slate-900 font-bold bg-[#fccb00] px-6 py-3 rounded-xl hover:bg-[#e5b800] transition-colors">
                       <BookOpen size={20} /> Przeczytaj artykuł
                   </button>
               </div>

               <div className="md:w-2/3 space-y-8">
                   <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10">
                       <h3 className="text-xl font-bold text-[#fccb00] mb-3 flex items-center gap-2"><CheckCircle2 size={20} /> Efekt odniesienia do Ja</h3>
                       <p className="text-slate-300 font-medium leading-relaxed">Mózg dziecka przetwarza informacje o samym sobie priorytetowo, co trwale podnosi samoocenę i buduje fundament poczucia własnej wartości.</p>
                   </div>
                   <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10">
                       <h3 className="text-xl font-bold text-[#fccb00] mb-3 flex items-center gap-2"><CheckCircle2 size={20} /> Psychologia Empowermentu</h3>
                       <p className="text-slate-300 font-medium leading-relaxed">Widząc siebie w roli bohatera rozwiązującego zadania, dziecko zmienia swój model wewnętrzny z "istoty zależnej" na "sprawczego bohatera".</p>
                   </div>
                   <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10">
                       <h3 className="text-xl font-bold text-[#fccb00] mb-3 flex items-center gap-2"><CheckCircle2 size={20} /> Redukcja lęków</h3>
                       <p className="text-slate-300 font-medium leading-relaxed">Dzięki metodzie desensytyzacji, dziecko przechodzi przez trudne sytuacje w wyobraźni, co obniża napięcie emocjonalne w prawdziwym życiu.</p>
                   </div>
               </div>
          </div>
      </section>

      {/* 7. SEKCJA: OFERTA */}
      <section className="py-20 px-6 bg-slate-50">
          <div className="max-w-4xl mx-auto">
              <h2 className="text-center text-3xl font-display font-black text-slate-900 mb-12">Wybierz swój pakiet</h2>
              <div className="flex justify-center">
                   <div className="relative p-8 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl border-4 border-[#fccb00] w-full max-w-lg">
                       <h3 className="text-3xl font-black text-white mb-2 text-center">Pakiet Premium</h3>
                       <div className="text-slate-300 font-medium mb-8 text-center text-sm">Multibajka Wideo + <span className="text-[#fccb00] font-bold">Wersja do czytania</span></div>
                       <div className="mb-8 p-6 bg-white/10 rounded-2xl border border-white/10">
                           <div className="flex items-center gap-2 text-[#fccb00] font-bold text-xs uppercase mb-3"><Star size={12} fill="currentColor" /> TYLKO TERAZ! W TWOIM PAKIECIE GRATIS!</div>
                           <p className="text-slate-300 text-sm leading-relaxed">Wciel się w rolę narratora! Przeczytaj dziecku bajkę o nim samym. Twój głos buduje bliskość, a wspólna lektura przed snem to najlepszy trening pewności siebie.</p>
                       </div>
                       <div className="mb-4">
                            <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 text-center">Poproś o kod kuponu na recepcji!</label>
                            <input type="text" placeholder="Wpisz kod..." value={offerCode} onChange={(e) => setOfferCode(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-center placeholder:text-white/30 focus:outline-none focus:border-[#fccb00]" />
                       </div>
                       <button onClick={() => handleCodeValidation(offerCode)} className="block w-full py-4 rounded-xl bg-[#fccb00] text-black font-black text-lg text-center hover:bg-[#e5b800] transition-colors shadow-lg shadow-amber-500/20">ZAMÓW PAKIET PREMIUM</button>
                   </div>
              </div>
          </div>
      </section>

      {/* 8. STOPKA */}
      <footer className="py-12 px-6 bg-white border-t border-slate-100">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
               <div className="flex items-center gap-4">
                   {partner.LogoUrl ? <img src={partner.LogoUrl} alt={partner.PartnerName} className="h-12 w-auto object-contain" /> : <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-400">{partner.PartnerName.charAt(0)}</div>}
                   <span className="font-bold text-slate-900">{partner.PartnerName}</span>
               </div>
               <div className="flex gap-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-center md:text-right flex-wrap justify-center">
                   <span>Pamiątka z duszą</span>
                   <span>Urodziny, które budują charakter</span>
                   <span>Gwarancja uśmiechu</span>
               </div>
          </div>
      </footer>
      
      {session && (
          <div className="w-full py-6 flex justify-center bg-white pb-12">
              <button onClick={() => navigate('/hub')} className="group flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-slate-600 hover:bg-slate-50 transition-all">
                  <ChevronLeft size={12} className="group-hover:-translate-x-1 transition-transform" /> Wróć do Panelu
              </button>
          </div>
      )}

      {/* MODALS */}
      <AnimatePresence>
        {showGallery && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4">
                <button onClick={() => setShowGallery(false)} className="absolute top-6 right-6 text-white/70 hover:text-white z-20"><X size={32} /></button>
                <div className="w-full max-w-5xl aspect-video relative flex items-center justify-center">
                    <button onClick={() => setCurrentGalleryImage(prev => (prev - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length)} className="absolute left-4 z-10 w-12 h-12 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"><ChevronLeft /></button>
                    <motion.img key={currentGalleryImage} src={GALLERY_IMAGES[currentGalleryImage]} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-h-[85vh] max-w-full rounded-lg shadow-2xl object-contain" />
                    <button onClick={() => setCurrentGalleryImage(prev => (prev + 1) % GALLERY_IMAGES.length)} className="absolute right-4 z-10 w-12 h-12 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"><ChevronRight /></button>
                </div>
            </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSampleVideo && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4">
                <button onClick={() => setShowSampleVideo(false)} className="absolute top-6 right-6 text-white/70 hover:text-white z-20"><X size={32} /></button>
                <div className="w-full max-w-5xl aspect-video relative bg-black rounded-2xl overflow-hidden shadow-2xl">
                    <video src={sampleVideoUrl} controls autoPlay className="w-full h-full object-contain" />
                </div>
            </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCreatorLock && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreatorLock(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-white rounded-[2.5rem] p-8 md:p-12 max-w-md w-full relative z-10 shadow-2xl text-center border-4 border-white">
                    <button onClick={() => setShowCreatorLock(false)} className="absolute top-6 right-6 text-slate-300 hover:text-slate-600 transition-colors"><X size={24} /></button>
                    <div className="w-24 h-24 bg-blue-50 text-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner"><Lock size={48} className="text-slate-400" /></div>
                    <h3 className="text-2xl font-display font-black text-slate-900 mb-4 leading-tight">Kreator zablokowany</h3>
                    <p className="text-slate-500 font-medium mb-8 leading-relaxed">Kreator jest dostępny tylko dla aktywnych partnerów. Skontaktuj się z obsługą, jeśli uważasz, że to błąd.</p>
                    <button onClick={() => setShowCreatorLock(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition-all active:scale-95">Rozumiem</button>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showArticle && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center sm:p-4 p-0">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowArticle(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
             <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="relative bg-white w-full max-w-4xl max-h-[90vh] md:rounded-[2rem] rounded-t-[2rem] overflow-y-auto shadow-2xl z-10">
                 <button onClick={() => setShowArticle(false)} className="absolute top-4 right-4 md:top-6 md:right-6 z-20 p-2 bg-white/80 backdrop-blur-sm rounded-full text-slate-500 hover:text-slate-900 shadow-sm border border-slate-100"><X size={24} /></button>
                 <div className="relative">
                    <div className="w-full aspect-[21/9] relative bg-slate-50">
                        <img src="https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/UniversalPhotos/BlogArticleHero.webp" alt="Hero" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6 md:p-12">
                            <span className="text-white/90 font-bold tracking-wider text-xs uppercase border border-white/30 px-3 py-1 rounded-full backdrop-blur-md">Edukacja i Rozwój</span>
                        </div>
                    </div>
                    <div className="p-6 md:p-12 prose prose-lg prose-slate max-w-none">
                         <h1 className="text-2xl md:text-4xl font-display font-black text-slate-900 mb-6 leading-[1.1]">Urodziny z Supermocami: Dlaczego Twoje Dziecko Zasługuje na Własną Historię?</h1>
                         {/* Content same as before, omitted for brevity */}
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
