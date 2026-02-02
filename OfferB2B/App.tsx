
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom'; // Added for routing
import { supabase } from '../utils/supabaseClient'; // Fixed import path to main utils
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import VideoSection from './components/VideoSection';
import SampleStories from './components/SampleStories';
import Benefits from './components/Benefits';
import Reviews from './components/Reviews';
import ProfitModel from './components/ProfitModel';
import ImplementationSection from './components/ImplementationSection';
import MarketingPackageSection from './components/MarketingPackageSection';
import FAQ from './components/FAQ';
import Contact from './components/Contact';

// Wrapper dla pojedynczego slajdu
const Slide = ({ children, id, className = "", nextSection }: { children?: React.ReactNode, id: string, className?: string, nextSection?: string }) => {
  // Sprawdzamy czy to sekcja Hero, aby zastosować specjalny layout (bez paddingów, strzałka absolutna)
  const isHero = id === 'magia';

  return (
    <section 
      id={id} 
      className={`w-full relative flex flex-col md:h-[100vh] md:snap-start md:overflow-y-auto md:overflow-x-hidden ${isHero ? 'pt-0' : 'pt-2 md:pt-20'} overscroll-contain ${className}`}
    >
      <div className="min-h-full w-full flex flex-col justify-start relative">
        {/* Dla Hero usuwamy padding dolny i wymuszamy h-full na desktopie, żeby content absolutny się wyświetlał */}
        <div className={`w-full my-auto ${isHero ? 'pb-0 md:h-full' : 'pb-8'}`}>
          {children}
        </div>

        {/* Pulsująca strzałka w dół - Tylko Desktop */}
        {nextSection && (
          <div className={`hidden md:flex w-full justify-center pb-6 shrink-0 z-20 pointer-events-none ${isHero ? 'absolute bottom-0 left-0' : 'mt-auto'}`}>
             <button 
               onClick={() => {
                 const el = document.getElementById(nextSection);
                 if(el) el.scrollIntoView({ behavior: 'smooth' });
               }}
               className="pointer-events-auto w-10 h-10 md:w-12 md:h-12 bg-white/80 hover:bg-white backdrop-blur-md rounded-full flex items-center justify-center text-blue-900 shadow-lg border border-slate-200 transition-all hover:scale-110 animate-bounce cursor-pointer group"
               aria-label="Przejdź dalej"
             >
               <i className="fa-solid fa-chevron-down group-hover:text-blue-600 transition-colors"></i>
             </button>
          </div>
        )}
      </div>
    </section>
  );
};

function App() {
  const { slug } = useParams<{ slug: string }>(); // Get slug from URL
  const [currentView, setCurrentView] = useState<'home' | 'stories'>('home');
  const [activeSection, setActiveSection] = useState('magia');
  const [centerName, setCenterName] = useState(''); 
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch Partner Name based on slug for Personalization
  useEffect(() => {
    const fetchPartnerName = async () => {
        if (!slug) return;
        try {
            const { data, error } = await supabase
                .schema('PartnersApp')
                .from('Partners')
                .select('PartnerName')
                .eq('Slug', slug)
                .single();
            
            if (data && data.PartnerName) {
                setCenterName(data.PartnerName);
            }
        } catch (error) {
            console.error("Error fetching partner for personalization:", error);
        }
    };
    fetchPartnerName();
  }, [slug]);

  // Lista sekcji do nawigacji
  const sections = [
    { id: 'magia', label: 'Start' },
    { id: 'demo', label: 'Wideo' },
    { id: 'korzysci', label: 'Korzyści' },
    { id: 'cennik', label: 'Zyski' }, 
    { id: 'wdrozenie', label: 'Wdrożenie' },
    { id: 'pakiet', label: 'Pakiet Start' }, 
    { id: 'opinie', label: 'Opinie' }, 
    { id: 'faq', label: 'FAQ' },
    { id: 'kontakt', label: 'Kontakt' },
  ];

  // Wykrywanie aktywnego slajdu podczas przewijania
  useEffect(() => {
    const container = containerRef.current;
    if (!container || currentView !== 'home') return;

    const handleScroll = () => {
      const scrollPosition = container.scrollTop + (container.clientHeight / 2);
      
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const { offsetTop, offsetHeight } = el;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentView]);

  // Parallax background effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 30;
      const y = (clientY / window.innerHeight - 0.5) * 30;
      document.documentElement.style.setProperty('--px', `${x}px`);
      document.documentElement.style.setProperty('--py', `${y}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="h-screen w-full bg-slate-50 text-slate-800 selection:bg-blue-900 selection:text-white overflow-hidden relative">
      <Navbar customScroll={scrollToSection} centerName={centerName} setCenterName={setCenterName} />
      
      {currentView === 'home' ? (
        <>
          {/* Główny kontener scrollowania - ZMIANA: md:snap-y md:snap-mandatory (Tylko Desktop) */}
          <div 
            ref={containerRef}
            className="h-full w-full overflow-y-scroll md:snap-y md:snap-mandatory scroll-smooth no-scrollbar"
          >
            {/* Sekcja 1: Ciemniejsze tło #eeeef5 */}
            <Slide id="magia" className="bg-[#eeeef5]" nextSection="demo">
              <Hero centerName={centerName} setCenterName={setCenterName} />
            </Slide>

            {/* Sekcja 2: Jasne tło (białe) */}
            <Slide id="demo" className="bg-white" nextSection="korzysci">
              <VideoSection centerName={centerName} />
            </Slide>
            
            <Slide id="korzysci" className="bg-white" nextSection="cennik">
              <Benefits centerName={centerName} />
            </Slide>
            
            <Slide id="cennik" className="bg-white" nextSection="wdrozenie">
              <ProfitModel centerName={centerName} />
            </Slide>

            <Slide id="wdrozenie" className="bg-slate-50" nextSection="pakiet">
              <ImplementationSection centerName={centerName} />
            </Slide>

            <Slide id="pakiet" className="bg-white" nextSection="opinie">
              <MarketingPackageSection />
            </Slide>

            <Slide id="opinie" className="bg-slate-50" nextSection="faq">
              <Reviews />
            </Slide>
            
            <Slide id="faq" className="bg-slate-50" nextSection="kontakt">
              <FAQ />
            </Slide>
            
            <Slide id="kontakt" className="bg-white">
              <Contact />
              <footer id="footer" className="py-8 border-t border-slate-200 opacity-60 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 text-center mt-auto">
                <p>© 2025 Audiobajka.Premium • Rewolucja w branży rozrywkowej</p>
              </footer>
            </Slide>
          </div>

          {/* Nawigacja Kropkowa (Prawa strona) */}
          <div className="fixed right-4 md:right-8 top-1/2 -translate-x-1/2 z-50 flex flex-col space-y-4">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className="group relative flex items-center justify-end"
                aria-label={`Przejdź do sekcji ${section.label}`}
              >
                <span className={`absolute right-8 px-2 py-1 bg-blue-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap uppercase tracking-wider ${activeSection === section.id ? 'opacity-100' : ''}`}>
                  {section.label}
                </span>
                <div 
                  className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                    activeSection === section.id 
                      ? 'bg-blue-900 border-blue-900 scale-125' 
                      : 'bg-transparent border-slate-300 hover:border-blue-900 hover:bg-blue-100'
                  }`}
                />
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="h-full w-full overflow-y-auto">
          <SampleStories onBack={() => setCurrentView('home')} />
        </div>
      )}
      
      {/* Background Ambience with Parallax */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[40vw] h-[40vw] bg-blue-50 rounded-full blur-[150px] opacity-20 animate-pulse parallax-element"></div>
        <div className="absolute bottom-[10%] right-[5%] w-[30vw] h-[30vw] bg-slate-100 rounded-full blur-[120px] opacity-30 parallax-element" style={{ transitionDelay: '0.05s' }}></div>
        
        <div className="absolute top-[15%] left-[10%] w-1.5 h-1.5 bg-blue-200 rounded-full animate-ping"></div>
        <div className="absolute top-[40%] right-[15%] w-1 h-1 bg-slate-300 rounded-full animate-ping delay-1000"></div>
        <div className="absolute bottom-[30%] left-[20%] w-2 h-2 bg-blue-100 rounded-full animate-pulse delay-500"></div>
      </div>
    </div>
  );
}

export default App;
