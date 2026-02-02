import React, { useState } from 'react';

interface Story {
  id: number;
  title: string;
  duration: string;
  category: 'Dla Najmłodszych' | 'Dla Starszaków' | 'Dla Nastolatków';
  target: 'Chłopiec' | 'Dziewczynka';
  summary: string;
  thumbnail: string;
  videoUrl: string;
}

interface SampleStoriesProps {
  onBack: () => void;
}

// Opisy kategorii
const CATEGORY_DESCRIPTIONS = {
  'Dla Najmłodszych': "Pełne ciepła, pogodne historie z mądrym morałem, które budują poczucie bezpieczeństwa i rozwijają wyobraźnię. To spokojne opowieści idealne do wyciszenia, pozbawione gwałtownych zwrotów akcji, gdzie liczy się przyjaźń i dobra zabawa.",
  'Dla Starszaków': "Dynamiczne przygody, w których Twoje dziecko nie tylko słucha, ale otrzymuje ważną misję, by aktywnie pomagać innym. Mały bohater staje przed wyzwaniami, które uczą odwagi i sprawczości, angażując go w ratowanie bajkowego świata.",
  'Dla Nastolatków': "Intrygujące opowieści pełne tajemnic, które wymagają od dziecka sprytu, skupienia i logicznego myślenia. To interaktywna przygoda, w której aby odblokować dalszą część historii, trzeba rozwiązać zagadkę i wpisać poprawną odpowiedź w aplikacji."
};

// Dane na sztywno (Hardcoded data)
const STORIES: Story[] = [
  // Kategoria Dla Najmłodszych
  {
    id: 1,
    category: 'Dla Najmłodszych',
    title: "Urodziny w Krainie Czarów",
    duration: "04:30",
    target: "Dziewczynka",
    summary: "Mała Zosia trafia do magicznego lasu, gdzie zwierzątka przygotowują dla niej przyjęcie niespodziankę. Wszystko dzieje się w scenerii Twojej bawialni, która zamienia się w baśniową krainę pełną kolorów i muzyki.",
    thumbnail: "https://pbyfajvltehsuugpayej.supabase.co/storage/v1/object/public/MainApp/BirthdayApp/PosterVideoHero3.webp",
    videoUrl: "https://pbyfajvltehsuugpayej.supabase.co/storage/v1/object/public/MainApp/BirthdayApp/PromoBirthdayParentsFinal.mp4"
  },
  {
    id: 2,
    category: 'Dla Najmłodszych',
    title: "Kosmiczna Misja",
    duration: "04:15",
    target: "Chłopiec",
    summary: "Krzyś zostaje kapitanem statku kosmicznego. Jego misją jest odnalezienie zaginionej gwiazdki, która ukryła się w basenie z kulkami. To ciepła opowieść o odwadze i pomaganiu innym.",
    thumbnail: "https://pbyfajvltehsuugpayej.supabase.co/storage/v1/object/public/MainApp/BirthdayApp/PosterVideoHero3.webp",
    videoUrl: "https://pbyfajvltehsuugpayej.supabase.co/storage/v1/object/public/MainApp/BirthdayApp/PromoBirthdayParentsFinal.mp4"
  },
  // Kategoria Dla Starszaków
  {
    id: 5,
    category: 'Dla Starszaków',
    title: "Detektywi Tajemnic",
    duration: "06:10",
    target: "Chłopiec",
    summary: "W centrum rozrywki ginie klucz do sali zabaw. Janek musi rozwiązać serię zagadek logicznych, aby uratować imprezę. Angażująca historia z elementami edukacyjnymi.",
    thumbnail: "https://pbyfajvltehsuugpayej.supabase.co/storage/v1/object/public/MainApp/BirthdayApp/PosterVideoHero3.webp",
    videoUrl: "https://pbyfajvltehsuugpayej.supabase.co/storage/v1/object/public/MainApp/BirthdayApp/PromoBirthdayParentsFinal.mp4"
  },
  {
    id: 6,
    category: 'Dla Starszaków',
    title: "Szkoła Magii",
    duration: "05:50",
    target: "Dziewczynka",
    summary: "Maja otrzymuje list ze szkoły czarów. Okazuje się, że zjeżdżalnie to tak naprawdę magiczne portale. Historia o odkrywaniu własnych talentów.",
    thumbnail: "https://pbyfajvltehsuugpayej.supabase.co/storage/v1/object/public/MainApp/BirthdayApp/PosterVideoHero3.webp",
    videoUrl: "https://pbyfajvltehsuugpayej.supabase.co/storage/v1/object/public/MainApp/BirthdayApp/PromoBirthdayParentsFinal.mp4"
  },
  // Kategoria Dla Nastolatków
  {
    id: 9,
    category: 'Dla Nastolatków',
    title: "Cyber-Przygoda",
    duration: "07:20",
    target: "Chłopiec",
    summary: "Piotrek zostaje wciągnięty do gry komputerowej. Musi przejść kolejne poziomy (atrakcje w Twoim lokalu), by pokonać wirusa i wrócić do rzeczywistości. Nowoczesna i dynamiczna.",
    thumbnail: "https://pbyfajvltehsuugpayej.supabase.co/storage/v1/object/public/MainApp/BirthdayApp/PosterVideoHero3.webp",
    videoUrl: "https://pbyfajvltehsuugpayej.supabase.co/storage/v1/object/public/MainApp/BirthdayApp/PromoBirthdayParentsFinal.mp4"
  },
  {
    id: 10,
    category: 'Dla Nastolatków',
    title: "Gwiazda Estrady",
    duration: "06:45",
    target: "Dziewczynka",
    summary: "Kasia marzy o karierze piosenkarki. Bajka opowiada o jej drodze na szczyt, tremie przed występem i wielkim finale na scenie karaoke w Twoim centrum.",
    thumbnail: "https://pbyfajvltehsuugpayej.supabase.co/storage/v1/object/public/MainApp/BirthdayApp/PosterVideoHero3.webp",
    videoUrl: "https://pbyfajvltehsuugpayej.supabase.co/storage/v1/object/public/MainApp/BirthdayApp/PromoBirthdayParentsFinal.mp4"
  }
];

const SampleStories: React.FC<SampleStoriesProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'Dla Najmłodszych' | 'Dla Starszaków' | 'Dla Nastolatków'>('Dla Najmłodszych');
  const [selectedVideo, setSelectedVideo] = useState<Story | null>(null);

  const filteredStories = STORIES.filter(s => s.category === activeTab);

  return (
    <section id="przyklady-bajek" className="pt-32 pb-20 px-6 bg-slate-50 relative overflow-hidden min-h-screen">
      <div className="max-w-7xl mx-auto reveal">
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="mb-8 group flex items-center space-x-2 text-slate-500 hover:text-blue-900 transition-colors px-4 py-2 rounded-full hover:bg-white/50 w-fit"
        >
          <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-xs">
            <i className="fa-solid fa-arrow-left"></i>
          </div>
          <span className="font-bold text-sm uppercase tracking-wider">Wróć do strony głównej</span>
        </button>

        {/* Header */}
        <div className="text-center mb-16 space-y-6">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight italic uppercase">
            Sprawdź jak wyglądają nasze bajki!
          </h2>
          <p className="text-slate-500 text-sm md:text-base max-w-4xl mx-auto font-medium leading-relaxed bg-white/50 p-6 rounded-2xl border border-slate-100">
            Poniżej znajdziesz krótkie fragmenty różnych bajek. Dane personalizacyjne są w nich przykładowe. Każda bajka tworzona jest indywidualnie, zgodnie z wypełnionym formularzem przez rodzica/opiekuna. Każda bajka dzieje się w TWOIM centrum rozrywki, a głównym bohaterem jest solenizant/solenizantka.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-col items-center mb-12">
          <div className="inline-flex bg-white p-1.5 rounded-full border border-slate-200 shadow-sm mb-8 flex-wrap justify-center">
            {[
              { id: 'Dla Najmłodszych', label: 'Dla Najmłodszych' },
              { id: 'Dla Starszaków', label: 'Dla Starszaków' },
              { id: 'Dla Nastolatków', label: 'Dla Nastolatków' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 md:px-6 py-3 rounded-full text-xs md:text-base font-bold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-blue-900 text-white shadow-md'
                    : 'text-slate-500 hover:text-blue-900 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Dynamic Description */}
          <div className="max-w-3xl mx-auto text-center px-4 animate-[fadeInUp_0.3s_ease-out] key={activeTab}">
            <p className="text-slate-600 font-medium leading-relaxed italic">
              {CATEGORY_DESCRIPTIONS[activeTab]}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 justify-center">
          {filteredStories.map((story) => (
            <div key={story.id} className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 hover:shadow-xl transition-all duration-300 group flex flex-col h-full tilt-card">
              {/* Thumbnail Area */}
              <div 
                className="relative aspect-[16/9] cursor-pointer overflow-hidden"
                onClick={() => setSelectedVideo(story)}
              >
                <img 
                  src={story.thumbnail} 
                  alt={story.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 text-white group-hover:scale-110 transition-transform shadow-lg">
                    <i className="fa-solid fa-play ml-1"></i>
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-6 flex flex-col flex-1 space-y-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900 leading-tight mb-1">{story.title}</h3>
                  {/* Usunięto tagi czasu, wieku i płci zgodnie z prośbą */}
                </div>

                <div className="flex-1">
                  <p className="text-xs font-bold uppercase text-slate-400 mb-1 tracking-widest">Skrót fabuły:</p>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium line-clamp-4">
                    {story.summary}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div 
            className="relative w-full max-w-5xl bg-black rounded-2xl overflow-hidden shadow-2xl animate-[fadeInUp_0.3s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-md"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
            <div className="aspect-video">
              <video 
                src={selectedVideo.videoUrl} 
                controls 
                autoPlay 
                className="w-full h-full"
              />
            </div>
            <div className="p-6 bg-white text-left">
              <h3 className="text-2xl font-black text-slate-900 mb-2">{selectedVideo.title}</h3>
              <p className="text-slate-600">{selectedVideo.summary}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SampleStories;