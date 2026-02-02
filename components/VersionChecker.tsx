
import React, { useEffect, useState } from 'react';
import { RefreshCw, ArrowRight } from 'lucide-react';

// TA WARTOŚĆ MUSI BYĆ RĘCZNIE ZMIENIANA W KODZIE PRZY KAŻDYM DUŻYM DEPLOYU
// Aby pasowała do wartości w pliku public/version.json
const CURRENT_APP_VERSION = "2.2";

export const VersionChecker: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [serverVersion, setServerVersion] = useState<string>('');

  useEffect(() => {
    const checkVersion = async () => {
      try {
        // Dodajemy timestamp, żeby uniknąć cache'owania samego pliku JSON
        const response = await fetch(`/version.json?t=${new Date().getTime()}`, {
          cache: 'no-store',
          headers: {
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) return;

        const data = await response.json();
        const remoteVersion = data.version;

        if (remoteVersion && remoteVersion !== CURRENT_APP_VERSION) {
          console.log(`Wykryto nową wersję! Obecna: ${CURRENT_APP_VERSION}, Serwer: ${remoteVersion}`);
          setServerVersion(remoteVersion);
          setUpdateAvailable(true);
        }
      } catch (error) {
        console.error("Błąd sprawdzania wersji:", error);
      }
    };

    // Sprawdź przy starcie
    checkVersion();

    // Sprawdzaj co 60 sekund (opcjonalne, przydatne jak siedzisz długo w panelu)
    const interval = setInterval(checkVersion, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    // Czyścimy cache i przeładowujemy
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
          registration.unregister();
        }
      });
    }
    // Hard reload ignoring cache
    window.location.reload(); 
  };

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-blue-600 text-white p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.2)] animate-in slide-in-from-bottom duration-500 flex flex-col md:flex-row items-center justify-between gap-4 md:px-8">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-full animate-spin-slow">
            <RefreshCw size={24} />
        </div>
        <div>
            <h3 className="font-black text-lg leading-tight">Dostępna aktualizacja! (v{serverVersion})</h3>
            <p className="text-blue-100 text-sm font-medium">Pojawiły się nowe funkcje w systemie.</p>
        </div>
      </div>
      
      <button 
        onClick={handleRefresh}
        className="px-6 py-3 bg-white text-blue-700 rounded-xl font-black uppercase tracking-wide text-sm flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-lg whitespace-nowrap w-full md:w-auto justify-center"
      >
        Odśwież teraz <ArrowRight size={16} />
      </button>
    </div>
  );
};
