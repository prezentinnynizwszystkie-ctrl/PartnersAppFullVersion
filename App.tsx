
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginView from './components/LoginView';
import HubView from './components/HubView';
import PartnerView from './components/PartnerView';
import PartnerLanding from './components/PartnerLanding';
import ArticleView from './components/ArticleView';
import GeneratedTale from './components/GeneratedTale';
import OfferB2BApp from './OfferB2B/App';
import { VersionChecker } from './components/VersionChecker';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="relative">
        {/* Auto-Updater Banner */}
        <VersionChecker />

        {/* Debug Version Indicator - Visible in bottom right */}
        <div className="fixed bottom-1 right-1 z-[9998] bg-black/10 text-[10px] text-slate-400 px-1 pointer-events-none">
          System v2.5 (Live)
        </div>
        
        <HashRouter>
          <Routes>
            {/* Entry Point: Login Screen */}
            <Route path="/" element={<LoginView />} />
            
            {/* The Main Hub (Dashboard) */}
            <Route path="/hub" element={<HubView />} />
            
            {/* Test Route for Generated Tale */}
            <Route path="/test/generated-tale" element={<GeneratedTale />} />
            
            {/* Dynamic Route: Article page */}
            <Route path="/:slug/artykul" element={<ArticleView />} />

            {/* New Route: Personalized B2B Offer */}
            <Route path="/:slug/oferta-b2b" element={<OfferB2BApp />} />

            {/* The Wizard (Old PartnerView) moved to a sub-route */}
            <Route path="/:slug/kreator" element={<PartnerView />} />

            {/* Partner Landing Page (Aplikacja Partnera) */}
            <Route path="/:slug" element={<PartnerLanding />} />

          </Routes>
        </HashRouter>
      </div>
    </AuthProvider>
  );
};

export default App;
