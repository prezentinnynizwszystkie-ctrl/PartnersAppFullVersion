
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, User, Mail, Phone, ArrowRight, ShieldCheck, BookOpen, AlertCircle, X } from 'lucide-react';

interface Step8Props {
  parentName: string;
  onNameChange: (val: string) => void;
  parentEmail: string;
  onEmailChange: (val: string) => void;
  parentPhone: string;
  onPhoneChange: (val: string) => void;
  // Lifted state props
  marketingAgree: boolean;
  onMarketingAgreeChange: (val: boolean) => void;
  regulationsAgree: boolean;
  onRegulationsAgreeChange: (val: boolean) => void;
  onBack: () => void;
  onNext: (wantsStory: boolean) => void;
}

export const Step8Shipping: React.FC<Step8Props> = ({ 
  parentName, onNameChange, parentEmail, onEmailChange, parentPhone, onPhoneChange, 
  marketingAgree, onMarketingAgreeChange, regulationsAgree, onRegulationsAgreeChange,
  onBack, onNext 
}) => {
  const [isReadingVersion, setIsReadingVersion] = useState(true);
  const [showConsentModal, setShowConsentModal] = useState(false);

  const isValid = parentName.length > 2 && parentEmail.includes('@') && regulationsAgree;

  const handleFinishClick = () => {
      // Logic: If reading version is wanted BUT marketing not accepted
      if (isReadingVersion && !marketingAgree) {
          setShowConsentModal(true);
      } else {
          onNext(isReadingVersion);
      }
  };

  const handleModalConsent = () => {
      onMarketingAgreeChange(true);
      setShowConsentModal(false);
      onNext(true); // User agreed, so they want the story
  };

  const handleModalDecline = () => {
      setIsReadingVersion(false);
      setShowConsentModal(false);
      onNext(false); // User declined marketing, so no story
  };

  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="p-8 w-full max-w-xl mx-auto flex flex-col">
      <button onClick={onBack} className="text-slate-400 mb-4 flex items-center gap-1 text-sm font-bold uppercase self-start">
        <ChevronLeft size={16} /> Wróć
      </button>
      
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-black text-slate-900 mb-2">Gdzie wysłać bajkę?</h2>
        <p className="text-slate-500 font-medium">Potrzebujemy Twoich danych, aby przesłać gotowe nagranie.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
            <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Imię Rodzica <span className="text-red-500">*</span></label>
            <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                type="text" 
                placeholder="np. Anna Nowak" 
                value={parentName}
                onChange={(e) => onNameChange(e.target.value)}
                className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-slate-100 bg-white focus:border-blue-500 focus:outline-none font-bold text-slate-700 shadow-sm transition-all"
                />
            </div>
            </div>

            <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Adres E-mail <span className="text-red-500">*</span></label>
            <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                type="email" 
                placeholder="twoj@email.pl" 
                value={parentEmail}
                onChange={(e) => onEmailChange(e.target.value)}
                className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-slate-100 bg-white focus:border-blue-500 focus:outline-none font-bold text-slate-700 shadow-sm transition-all"
                />
            </div>
            </div>

            <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Telefon (Opcjonalnie)</label>
            <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                type="tel" 
                placeholder="600 000 000" 
                value={parentPhone}
                onChange={(e) => onPhoneChange(e.target.value)}
                className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-slate-100 bg-white focus:border-blue-500 focus:outline-none font-bold text-slate-700 shadow-sm transition-all"
                />
            </div>
            </div>
        </div>

        {/* Narrator Card */}
        <div className="bg-white border-2 border-blue-100 rounded-3xl p-6 shadow-xl shadow-blue-50 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                 <BookOpen size={100} className="text-blue-600" />
             </div>
             <div className="relative z-10">
                 <h3 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-2">
                     📖 Zostań narratorem: Bajka do czytania
                 </h3>
                 <p className="text-sm text-slate-600 font-medium mb-4 leading-relaxed">
                     Oprócz Multibajki wideo (dostarczonej w 24h), otrzymasz tę samą historię w formie tekstu. Wciel się w rolę narratora i przeczytaj dziecku o jego własnych przygodach!
                 </p>
                 <ul className="space-y-2 mb-6">
                     <li className="flex items-start gap-2 text-xs font-bold text-slate-500">
                         <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                         <span>Buduj więź: Twój głos to największe wsparcie.</span>
                     </li>
                     <li className="flex items-start gap-2 text-xs font-bold text-slate-500">
                         <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                         <span>Wzmacniaj pewność siebie poprzez pochwały.</span>
                     </li>
                     <li className="flex items-start gap-2 text-xs font-bold text-slate-500">
                         <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                         <span>Idealne na wyciszenie przed snem.</span>
                     </li>
                 </ul>
                 
                 <div className="flex flex-col sm:flex-row gap-3">
                     <button 
                        onClick={() => setIsReadingVersion(true)}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${isReadingVersion ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                     >
                        {isReadingVersion && <ShieldCheck size={16} />}
                        TAK, CHCĘ OTRZYMAĆ
                     </button>
                     <button 
                        onClick={() => setIsReadingVersion(false)}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${!isReadingVersion ? 'bg-slate-800 text-white shadow-lg' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                     >
                        NIE, DZIĘKUJĘ
                     </button>
                 </div>
             </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-4 pt-2">
             <label className="flex items-start gap-3 cursor-pointer group">
                 <div className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors shrink-0 ${regulationsAgree ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-300 group-hover:border-slate-400'}`}>
                     {regulationsAgree && <ShieldCheck size={14} className="text-white" />}
                 </div>
                 <input type="checkbox" className="hidden" checked={regulationsAgree} onChange={() => onRegulationsAgreeChange(!regulationsAgree)} />
                 <span className="text-xs font-medium text-slate-500 leading-tight">
                     Zapoznałem się i akceptuję <a href="https://www.urodzinowabajka.pl/regulamin" target="_blank" rel="noreferrer" className="text-blue-600 font-bold underline decoration-blue-200">Regulamin</a> serwisu. <span className="text-red-500">*</span>
                 </span>
             </label>

             <label className="flex items-start gap-3 cursor-pointer group">
                 <div className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors shrink-0 ${marketingAgree ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-300 group-hover:border-slate-400'}`}>
                     {marketingAgree && <ShieldCheck size={14} className="text-white" />}
                 </div>
                 <input type="checkbox" className="hidden" checked={marketingAgree} onChange={() => onMarketingAgreeChange(!marketingAgree)} />
                 <span className="text-xs font-medium text-slate-500 leading-tight">
                     Wyrażam zgodę na otrzymywanie informacji handlowych drogą elektroniczną (ten checkbox jest dobrowolny, ale <strong className="text-slate-700">niezbędny do uzyskania darmowego dodatku</strong> w postaci bajki do poczytania).
                 </span>
             </label>
        </div>
      </div>

      <div className="pt-10 pb-10">
        <button 
            onClick={handleFinishClick}
            disabled={!isValid}
            className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xl shadow-2xl disabled:opacity-50 hover:scale-105 transition-all flex items-center justify-center gap-3"
        >
            Gotowe! <ArrowRight size={24} />
        </button>
      </div>

      {/* Logic Modal */}
      <AnimatePresence>
          {showConsentModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    onClick={() => setShowConsentModal(false)}
                  />
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-[2rem] p-8 max-w-sm w-full relative z-10 shadow-2xl"
                  >
                      <button onClick={() => setShowConsentModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800"><X size={20} /></button>
                      
                      <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                          <AlertCircle size={32} />
                      </div>
                      
                      <h3 className="text-2xl font-black text-center text-slate-900 mb-4 leading-tight">Wymagana zgoda</h3>
                      <p className="text-center text-slate-600 font-medium mb-8">
                          Aby otrzymać <strong className="text-blue-600">darmową bajkę do poczytania</strong>, wymagana jest zgoda marketingowa. Czy chcesz ją wyrazić?
                      </p>

                      <div className="flex flex-col gap-3">
                          <button 
                            onClick={handleModalConsent}
                            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-slate-800"
                          >
                              Wyraź zgodę i odbierz
                          </button>
                          <button 
                            onClick={handleModalDecline}
                            className="w-full py-4 bg-white text-slate-500 border-2 border-slate-100 rounded-xl font-bold hover:bg-slate-50"
                          >
                              Rezygnuję z dodatku
                          </button>
                      </div>
                  </motion.div>
              </div>
          )}
      </AnimatePresence>

    </motion.div>
  );
};
