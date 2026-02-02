import React, { useState } from 'react';

interface HeroProps {
  centerName: string;
  setCenterName: (name: string) => void;
}

const Hero: React.FC<HeroProps> = ({ centerName, setCenterName }) => {
  const [videoEnded, setVideoEnded] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    // Root: Używamy DIV zamiast SECTION.
    <div className="relative w-full h-auto md:h-full overflow-hidden bg-[#eeeef5] flex items-center justify-center">
      
      {/* --- DESKTOP VERSION (FULL WIDTH, FIT CONTENT) --- */}
      <div className="hidden md:flex w-full h-full items-center justify-center p-0">
         {/* Kontener dla wideo - centruje i pozwala zachować proporcje */}
         <div className="relative w-full h-full flex items-center justify-center">
             
             {/* Fallback Image */}
             <img 
                src="https://pbyfajvltehsuugpayej.supabase.co/storage/v1/object/public/MainApp/HeroPhotos/vfinalhero.webp" 
                alt="Hero Final Frame" 
                className={`w-full h-auto max-h-screen object-contain transition-opacity duration-500 ${videoLoaded && !videoEnded ? 'hidden' : 'block'}`}
             />

             {/* WIDEO:
                 w-full: dąży do pełnej szerokości
                 h-auto: zachowuje proporcje
                 max-h-screen: nie wychodzi poza ekran w pionie
                 object-contain: gwarantuje, że całość jest widoczna (brak ucięć)
             */}
             <video
                autoPlay
                muted
                playsInline
                onLoadedData={() => setVideoLoaded(true)}
                onEnded={() => setVideoEnded(true)}
                className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-1000 ${videoLoaded && !videoEnded ? 'opacity-100' : 'opacity-0'}`}
             >
                <source src="https://pbyfajvltehsuugpayej.supabase.co/storage/v1/object/public/MainApp/HeroPhotos/vfinalhero.webm" type="video/webm" />
             </video>
         </div>
      </div>


      {/* --- MOBILE VERSION (Bez zmian) --- */}
      <div className="md:hidden w-full flex flex-col pt-24 pb-0 relative z-30 h-auto">
          
          {/* 1. INPUT NA SAMEJ GÓRZE */}
          <div className="w-full px-4 flex flex-col items-center justify-center mb-2 z-40 relative">
             <label className="text-[#1e3a8a] text-xs font-black uppercase tracking-[0.15em] mb-2 drop-shadow-sm bg-white/50 backdrop-blur-sm px-3 py-1 rounded-full border border-white/40">
                Wpisz nazwę centrum!
            </label>
            <input
                type="text"
                value={centerName}
                onChange={(e) => setCenterName(e.target.value)}
                placeholder="np. Sala Zabaw Hopsasa"
                className="bg-white/90 backdrop-blur-md text-blue-900 font-bold text-center text-base px-6 py-3 rounded-2xl shadow-lg border-2 border-white/80 focus:outline-none focus:border-blue-500 w-full max-w-xs placeholder:text-blue-900/30"
            />
          </div>

          {/* 2. WIDEO PEŁNA SZEROKOŚĆ i AUTO WYSOKOŚĆ */}
          <div className="relative w-full mt-0">
                <img 
                    src="https://pbyfajvltehsuugpayej.supabase.co/storage/v1/object/public/MainApp/HeroPhotos/vfinalhero.webp" 
                    alt="Hero Final Frame" 
                    className="absolute inset-0 w-full h-full object-cover z-0"
                />
                
                <video
                    autoPlay
                    muted
                    playsInline
                    onLoadedData={() => setVideoLoaded(true)}
                    onEnded={() => setVideoEnded(true)}
                    className={`relative w-full h-auto block z-10 transition-opacity duration-1000 ${videoLoaded && !videoEnded ? 'opacity-100' : 'opacity-0'}`}
                >
                    <source src="https://pbyfajvltehsuugpayej.supabase.co/storage/v1/object/public/MainApp/HeroPhotos/vfinalhero.webm" type="video/webm" />
                </video>
          </div>
      </div>

    </div>
  );
};

export default Hero;