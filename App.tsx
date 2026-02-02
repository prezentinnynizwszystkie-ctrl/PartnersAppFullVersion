
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginView from './components/LoginView';
import HubView from './components/HubView';
import PartnerView from './components/PartnerView';
import PartnerLanding from './components/PartnerLanding';
import ArticleView from './components/ArticleView';
import GeneratedTale from './components/GeneratedTale';

const App: React.FC = () => {
  return (
    <AuthProvider>
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

          {/* The Wizard (Old PartnerView) moved to a sub-route */}
          <Route path="/:slug/kreator" element={<PartnerView />} />

          {/* Partner Landing Page */}
          <Route path="/:slug" element={<PartnerLanding />} />

        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
