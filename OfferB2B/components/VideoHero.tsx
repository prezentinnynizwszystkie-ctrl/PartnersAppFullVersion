import React, { useState, useRef } from 'react';

const VideoHero: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    // Usunięto max-w-6xl, ustawiono w-full, aby wypełniał kontener rodzica (VideoSection)
    <div className="relative w-full mx-auto group">
      <div className={`relative overflow-hidden rounded-[2rem] md:rounded-[3rem] shadow-2xl border-[6px] md:border-[10px] border-white bg-white transition-all duration-500 ${!isPlaying ? 'cursor-pointer hover:scale-[1.01]' : ''}`}
           onClick={!isPlaying ? handlePlay : undefined}>
        
        <video
          ref={videoRef}
          className="w-full h-auto block"
          poster="https://pbyfajvltehsuugpayej.supabase.co/storage/v1/object/public/PartnersApp/Video/posterending1.webp"
          controls={isPlaying}
          playsInline
        >
          <source src="https://pbyfajvltehsuugpayej.supabase.co/storage/v1/object/public/PartnersApp/Video/Ofertowe/OfferMoviePlaygroundsV1.0.mp4" type="video/mp4" />
        </video>

        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/5 transition-colors group-hover:bg-black/10">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-xl scale-125 animate-pulse"></div>
              <button 
                className="relative w-16 h-16 md:w-24 md:h-24 bg-white/10 backdrop-blur-md text-white rounded-full flex items-center justify-center text-xl md:text-3xl shadow-2xl border border-white/40 transition-all duration-500 group-hover:bg-white/20 group-hover:scale-110"
              >
                <i className="fa-solid fa-play ml-1"></i>
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="absolute -inset-4 bg-blue-400/10 blur-3xl -z-10 rounded-full opacity-50"></div>
    </div>
  );
};

export default VideoHero;
