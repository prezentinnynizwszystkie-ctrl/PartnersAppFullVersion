
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import { Partner } from '../types';
import { generatePersonalizedStory } from '../services/storyGenerator';

// Import steps
import { Step1Gender } from './wizard/Step1Gender';
import { Step2Name } from './wizard/Step2Name';
import { Step4Avatar } from './wizard/Step4Avatar';
import { Step5Details } from './wizard/Step5Details';
import { Step6Party } from './wizard/Step6Party';
import { Step6Audio } from './wizard/Step6Audio';
import { Step7Selection } from './wizard/Step7Selection';
import { Step8Shipping } from './wizard/Step8Shipping';
import { Step9ThankYou } from './wizard/Step9ThankYou';

interface WizardProps {
  onClose: () => void;
  primaryColor: string;
  accentColor: string;
  partner: Partner & { AgeGroups?: string[] };
}

// Constants
const HOBBIES = ["Klocki LEGO", "Rysowanie", "Gra w piłkę", "Taniec", "Czytanie książek"];
const TRAITS = ["Odwaga", "Kreatywność", "Pomocność", "Dobroć", "Cierpliwość"];
const ATTRACTIONS = ["Tort", "Piniata", "Malowanie twarzy", "Tatuaże", "Skręcanie balonów", "Wizyta maskotki"];

const AVATARS_1_5 = {
  boy: [
    "https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/UniversalVideos/Avatars/3-5/BoyBlonde.mp4",
    "https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/UniversalVideos/Avatars/3-5/BoyBrownVideo.mp4",
    "https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/UniversalVideos/Avatars/3-5/BoyRed.mp4"
  ],
  girl: [
    "https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/UniversalVideos/Avatars/3-5/GirlRed.mp4",
    "https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/UniversalVideos/Avatars/3-5/GirlRed.mp4",
    "https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/UniversalVideos/Avatars/3-5/GirlRed.mp4"
  ]
};

const Wizard: React.FC<WizardProps> = ({ onClose, primaryColor, accentColor, partner }) => {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Data State
  const [gender, setGender] = useState<'boy' | 'girl' | null>(null);
  const [name, setName] = useState('');
  const [nameSearch, setNameSearch] = useState('');
  const [age, setAge] = useState<string>('');

  const [hobby, setHobby] = useState('');
  
  // Friend State
  const [friendGender, setFriendGender] = useState<'boy' | 'girl'>('boy');
  const [bestFriend, setBestFriend] = useState('');
  
  const [positiveTrait, setPositiveTrait] = useState('');
  const [childFile, setChildFile] = useState<File | null>(null);

  const [partyDate, setPartyDate] = useState('');
  const [partyFile, setPartyFile] = useState<File | null>(null);
  const [guestList, setGuestList] = useState<string[]>([]);
  const [selectedAttractions, setSelectedAttractions] = useState<string[]>([]);
  
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [skipRecording, setSkipRecording] = useState(false);

  // Changed from Title string to ID number
  const [selectedStoryId, setSelectedStoryId] = useState<number | null>(null);

  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  
  // New State for Agreements (Lifted from Step 8)
  const [marketingAgree, setMarketingAgree] = useState(false);
  const [regulationsAgree, setRegulationsAgree] = useState(false);

  // AI Story Generation State
  const [generatedStoryText, setGeneratedStoryText] = useState<string | null>(null);

  // Carousel State (Avatar)
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const currentAvatars = gender ? AVATARS_1_5[gender] : [];

  // Reset Carousel when entering avatar step
  useEffect(() => {
    if (step === 3) setActiveIndex(0);
  }, [step]);

  const handleNextAvatar = () => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % currentAvatars.length);
  };

  const handlePrevAvatar = () => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + currentAvatars.length) % currentAvatars.length);
  };

  const addGuest = (guestName: string) => {
    if (guestName) {
      setGuestList(prev => [...prev, guestName]);
    }
  };

  const handleSubmitOrder = async (wantsStory: boolean) => {
    setIsSubmitting(true);
    setSubmissionError(null);
    console.log("Wizard: Starting submission...");

    try {
      // 1. Marketing Permissions
      const { error: marketingError } = await supabase
        .schema('PartnersApp')
        .from('MarketingPermissions')
        .insert({
          Name: parentName,
          Phone: parentPhone,
          Mail: parentEmail,
          MarketingAgree: marketingAgree,
          RegulationsAgree: regulationsAgree
        });

      if (marketingError) console.error("Marketing permissions error (non-fatal):", marketingError);

      // 2. Prepare Questionnaire
      const questionnaire: any = {
        Hobby: hobby,
        KidAge: age,
        BestFriend: bestFriend,
        BestFriendGender: friendGender === 'boy' ? 'Chłopiec' : 'Dziewczynka',
        PositiveAttribute: positiveTrait,
        RecipientSex: gender === 'boy' ? 'Chłopiec' : 'Dziewczynka',
        RecipientName: name,
        PhotoYesNo: childFile ? "True" : "False",
        PartyDate: partyDate,
        ExtraAttractions: selectedAttractions.join(', '),
        Avatar: currentAvatars[activeIndex] || "",
        ...guestList.reduce((acc, guest, index) => ({ ...acc, [`Guest${index + 1}`]: guest }), {}),
        PhotoUrl: "",
        PhotoUrl1: "",
        RecordUrl: skipRecording ? "Universal" : "" 
      };

      // 3. Insert Order
      const { data: orderData, error: orderError } = await supabase
        .schema('birthdays')
        .from('StoryOrders')
        .insert({
          StoryId: selectedStoryId,
          PartnerId: partner.Id,
          Questionnaire: questionnaire,
          Status: 'QuestionnaireToApprove' 
        })
        .select() 
        .single();

      if (orderError) throw orderError;
      if (!orderData) throw new Error("Nie udało się utworzyć zamówienia.");
      
      const orderId = orderData.OrderId || orderData.orderid || orderData.id || orderData.ID || orderData.Id;
      console.log("Order created with ID:", orderId);

      // 4. File Uploads
      const updates: any = {};
      const storagePath = `Orders/${orderId}`;
      const bucketName = 'PartnersApp';
      const uploadPromises = [];

      if (childFile) {
        const fileExt = childFile.name.split('.').pop();
        uploadPromises.push(
           supabase.storage.from(bucketName).upload(`${storagePath}/child.${fileExt}`, childFile, { upsert: true })
           .then(({ data }) => {
              if(data) {
                 const { data: publicUrl } = supabase.storage.from(bucketName).getPublicUrl(data.path);
                 updates.PhotoUrl = publicUrl.publicUrl;
              }
           })
        );
      }

      if (partyFile) {
         const fileExt = partyFile.name.split('.').pop();
         uploadPromises.push(
            supabase.storage.from(bucketName).upload(`${storagePath}/party.${fileExt}`, partyFile, { upsert: true })
            .then(({ data }) => {
                if(data) {
                    const { data: publicUrl } = supabase.storage.from(bucketName).getPublicUrl(data.path);
                    updates.PhotoUrl1 = publicUrl.publicUrl;
                }
            })
         );
      }

      if (audioBlob && !skipRecording) {
         uploadPromises.push(
            supabase.storage.from(bucketName).upload(`${storagePath}/wishes.webm`, audioBlob, { upsert: true })
            .then(({ data }) => {
                if(data) {
                    const { data: publicUrl } = supabase.storage.from(bucketName).getPublicUrl(data.path);
                    updates.RecordUrl = publicUrl.publicUrl;
                }
            })
         );
      }

      await Promise.all(uploadPromises);

      // 5. Update Order with File URLs
      if (Object.keys(updates).length > 0) {
        const finalQuestionnaire = { ...questionnaire, ...updates };
        const matchQuery: any = {};
        if (orderData.OrderId) matchQuery.OrderId = orderId;
        else matchQuery.id = orderId;

        await supabase
          .schema('birthdays')
          .from('StoryOrders')
          .update({ Questionnaire: finalQuestionnaire })
          .match(matchQuery);
      }

      // 6. AI Generation (Jeśli użytkownik chce bajkę)
      if (wantsStory && selectedStoryId) {
         console.log("Użytkownik chce bajkę. Wywołuję generator...");
         try {
             const story = await generatePersonalizedStory(selectedStoryId, {
                 name,
                 age,
                 hobby,
                 bestFriend,
                 positiveTrait,
                 guestList
             });
             setGeneratedStoryText(story);
         } catch (aiError) {
             console.error("Critical AI Failure (handled):", aiError);
             setGeneratedStoryText(null); 
         }
      } else {
         setGeneratedStoryText(null);
      }

      setStep(9);

    } catch (error: any) {
      console.error("Submission fatal error:", error);
      setSubmissionError(error.message || "Wystąpił nieznany błąd podczas zapisu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepTitle = (s: number) => {
      switch(s) {
          case 1: return "Płeć";
          case 2: return "Bohater";
          case 3: return "Awatar";
          case 4: return "Szczegóły";
          case 5: return "Przyjęcie";
          case 6: return "Nagranie";
          case 7: return "Historia";
          case 8: return "Dostawa";
          case 9: return "Gotowe";
          default: return "";
      }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 flex flex-col overflow-hidden transition-colors duration-500 ${step >= 3 ? 'bg-[#dbeafe]' : 'bg-[#eeeef5]'}`}
    >
      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="absolute inset-0 z-[60] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-xl font-bold text-slate-800">
             {step === 8 ? "Zapisywanie..." : "Przetwarzanie..."}
          </p>
          {step === 8 && <p className="text-sm text-slate-500 font-medium mt-2">To może chwilę potrwać (AI pracuje nad bajką!)</p>}
        </div>
      )}

      {/* Error Modal */}
      <AnimatePresence>
        {submissionError && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            >
                 <div className="bg-white p-8 rounded-3xl max-w-md w-full text-center shadow-2xl">
                     <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={32} />
                     </div>
                     <h3 className="text-2xl font-black text-slate-900 mb-2">Ups! Coś poszło nie tak</h3>
                     <p className="text-slate-600 font-medium mb-6 leading-relaxed">
                         {submissionError}
                     </p>
                     <button 
                        onClick={() => setSubmissionError(null)} 
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors"
                     >
                        Zamknij
                     </button>
                 </div>
            </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-30 px-8 pt-10 pb-4 flex-shrink-0">
        <div className="flex justify-between items-end mb-1">
          <div>
            <h1 className="text-[28px] font-display font-black text-slate-900 leading-none">
              {step === 9 && generatedStoryText ? "Twoja Bajka" : getStepTitle(step)}
            </h1>
            <p className="text-[13px] text-slate-400 font-bold mt-1 uppercase tracking-tight">Krok {step} z 9</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/60 hover:bg-white text-slate-600 transition-colors shadow-sm"><X size={20} /></button>
        </div>
        <div className="w-full h-[3px] bg-slate-200/50 rounded-full mt-3 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(step / 9) * 100}%` }}
            className="h-full bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]"
          />
        </div>
      </div>

      <div className="flex-1 relative flex flex-col min-h-0 overflow-hidden">
        {step !== 3 ? (
          <div className="flex-1 overflow-y-auto overflow-x-hidden pb-10">
            {step === 1 && <Step1Gender onSelect={(g) => { setGender(g); setStep(2); }} />}
            
            {step === 2 && gender && (
              <Step2Name 
                gender={gender} name={name} nameSearch={nameSearch}
                onNameSearchChange={setNameSearch} onSelectName={setName}
                age={age} onAgeChange={setAge}
                onBack={() => setStep(1)} onNext={() => setStep(3)}
              />
            )}

            {step === 4 && (
              <Step5Details 
                name={name} hobby={hobby} onHobbyChange={setHobby}
                friendGender={friendGender} onFriendGenderChange={setFriendGender}
                bestFriend={bestFriend} onFriendChange={setBestFriend}
                positiveTrait={positiveTrait} onTraitChange={setPositiveTrait}
                childFile={childFile} onFileSelect={setChildFile}
                onBack={() => setStep(3)} onNext={() => setStep(5)}
                hobbies={HOBBIES} traits={TRAITS} 
              />
            )}

            {step === 5 && (
              <Step6Party 
                partyDate={partyDate} onDateChange={setPartyDate}
                partyFile={partyFile} onPartyFileSelect={setPartyFile}
                onAddGuest={addGuest} guestList={guestList}
                onRemoveGuest={(indexToRemove) => setGuestList(prev => prev.filter((_, i) => i !== indexToRemove))}
                attractions={ATTRACTIONS} selectedAttractions={selectedAttractions}
                onToggleAttraction={(a) => setSelectedAttractions(prev => prev.includes(a) ? prev.filter(attr => attr !== a) : [...prev, a])}
                onBack={() => setStep(4)} onNext={() => setStep(6)}
              />
            )}

            {step === 6 && (
                <Step6Audio 
                    audioBlob={audioBlob}
                    onAudioRecorded={(blob) => { setAudioBlob(blob); setSkipRecording(false); }}
                    onSkip={() => { setSkipRecording(true); setAudioBlob(null); setStep(7); }}
                    onNext={() => setStep(7)}
                    onBack={() => setStep(5)}
                />
            )}

            {step === 7 && (
              <Step7Selection 
                partnerAgeGroups={partner.AgeGroups || []}
                selectedStoryId={selectedStoryId}
                onStorySelect={setSelectedStoryId}
                onBack={() => setStep(6)}
                onNext={() => setStep(8)}
              />
            )}

            {step === 8 && (
              <Step8Shipping 
                parentName={parentName} onNameChange={setParentName}
                parentEmail={parentEmail} onEmailChange={setParentEmail}
                parentPhone={parentPhone} onPhoneChange={setParentPhone}
                marketingAgree={marketingAgree}
                onMarketingAgreeChange={setMarketingAgree}
                regulationsAgree={regulationsAgree}
                onRegulationsAgreeChange={setRegulationsAgree}
                onBack={() => setStep(7)}
                onNext={handleSubmitOrder}
              />
            )}

            {step === 9 && (
                <Step9ThankYou 
                    name={name} 
                    onClose={onClose} 
                    generatedStory={generatedStoryText}
                />
            )}
          </div>
        ) : (
          <Step4Avatar 
            currentAvatars={currentAvatars} activeIndex={activeIndex} direction={direction}
            onPrev={handlePrevAvatar} onNext={handleNextAvatar}
            onBack={() => setStep(2)} onComplete={() => setStep(4)}
          />
        )}
      </div>
    </motion.div>
  );
};

export default Wizard;
