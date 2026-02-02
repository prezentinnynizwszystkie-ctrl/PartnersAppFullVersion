import React from 'react';
import VideoHero from './VideoHero';

interface VideoSectionProps {
  centerName: string;
}

const VideoSection: React.FC<VideoSectionProps> = ({ centerName }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center px-4 md:px-8">
      {/* Zmiana max-w-7xl na w-[95%] max-w-[1800px] dla lepszego wypełnienia dużych ekranów */}
      <div className="w-[95%] max-w-[1800px] mx-auto z-10 md:reveal flex flex-col items-center justify-center h-full gap-4 md:gap-6">
         
         {/* Napis główny */}
         <h2 className="text-xl md:text-3xl font-black text-slate-900 uppercase italic tracking-tight text-center">
            ZOBACZ JAK TO DZIAŁA!
         </h2>

         {/* Napis przeniesiony NAD wideo */}
         <div className="text-center mb-2">
             <p className="text-sm md:text-lg text-slate-500 font-medium inline-block mr-1">
                Scenariusz każdej bajki zostanie spersonalizowany pod kątem
             </p>
             <span className="text-blue-900 font-black italic text-sm md:text-lg uppercase tracking-wider">
                {centerName || 'Twojego Centrum'}
             </span>
         </div>
         
         {/* Komponent wideo */}
         <VideoHero />

      </div>
    </div>
  );
};

export default VideoSection;
