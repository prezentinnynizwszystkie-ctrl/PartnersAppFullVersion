import React, { useState, useEffect } from 'react';

interface NavbarProps {
  customScroll?: (id: string) => void;
  centerName?: string;
  setCenterName?: (name: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ customScroll, centerName, setCenterName }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setScrolled(true);
  }, []);

  const navLinks = [
    { label: "START", href: "#magia" },
    { label: "Co zyskam?", href: "#korzysci" },
    { label: "Modele współpracy", href: "#cennik" }, 
    { label: "WDROŻENIE", href: "#wdrozenie" },
    { label: "Opinie", href: "#opinie" },
    { label: "FAQ", href: "#faq" },
    { label: "KONTAKT", href: "#kontakt" },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    
    const targetId = href.replace('#', '');
    
    if (customScroll) {
      customScroll(targetId);
    } else {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${scrolled ? 'bg-white/90 backdrop-blur-md py-3 shadow-sm border-b border-slate-100' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* LOGO - TYLKO MOBILE (lg:hidden) */}
        <a 
          href="#magia" 
          className="lg:hidden relative z-[110] transition-transform active:scale-95 flex-shrink-0" 
          onClick={(e) => handleNavClick(e, '#magia')}
        >
          <img 
            src="https://pbyfajvltehsuugpayej.supabase.co/storage/v1/object/public/MainApp/BirthdayApp/LogoBajkaNaPrezent.png" 
            alt="Logo" 
            className="h-8 w-auto object-contain"
          />
        </a>

        {/* INPUT NAZWY CENTRUM - TYLKO DESKTOP (hidden lg:flex) - Zamiast Logo */}
        <div className="hidden lg:flex items-center">
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <i className="fa-solid fa-pen-to-square text-blue-900/40 group-focus-within:text-blue-600 transition-colors"></i>
                </div>
                <input
                    type="text"
                    value={centerName || ''}
                    onChange={(e) => setCenterName && setCenterName(e.target.value)}
                    placeholder="WPISZ NAZWĘ CENTRUM..."
                    className="pl-9 pr-4 py-2 w-64 bg-slate-100/50 border border-slate-200 rounded-full text-sm font-bold text-blue-900 placeholder:text-slate-400 placeholder:font-semibold focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all uppercase tracking-wide"
                />
            </div>
        </div>

        {/* DESKTOP NAVIGATION (POZIOMA) */}
        <div className="hidden lg:flex items-center space-x-1">
          {navLinks.map((link) => (
            <a 
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="px-3 py-2 text-[11px] font-black text-slate-600 uppercase tracking-wider hover:text-blue-900 transition-colors relative group"
            >
              {link.label}
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-blue-900 transition-all duration-300 group-hover:w-1/2"></span>
            </a>
          ))}
        </div>

        {/* MOBILE MENU - USUNIĘTE */}
      </div>
    </nav>
  );
};

export default Navbar;