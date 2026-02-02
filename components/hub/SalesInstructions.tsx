
import React from 'react';
import { MonitorPlay, CheckCircle2, AlertTriangle, HelpCircle, FileText, Settings, Upload, Rocket, Camera, FileCheck } from 'lucide-react';

export const SalesInstructions: React.FC = () => {
    return (
        <div className="max-w-5xl mx-auto animate-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="mb-10 text-center md:text-left">
                <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                    Baza Wiedzy
                </span>
                <h1 className="text-3xl md:text-5xl font-display font-black text-slate-900 mb-4 leading-tight">
                    Centrum Dowodzenia <br/>
                    <span className="text-blue-600">MultiBajką</span>
                </h1>
                <p className="text-lg text-slate-600 max-w-3xl">
                    Kompletny przewodnik jak poprawnie skonfigurować partnera, prowadzić proces sprzedaży i obsługiwać system.
                </p>
            </div>

            <div className="space-y-12">
                
                {/* 1. WAŻNY KOMUNIKAT */}
                <div className="bg-amber-50 border border-amber-200 rounded-[2rem] p-8 flex items-start gap-6 shadow-sm">
                    <div className="bg-amber-100 p-3 rounded-xl text-amber-600 shrink-0">
                        <AlertTriangle size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-amber-800 mb-2">Uwaga: Generator Bajek (Wersja Demo)</h3>
                        <p className="text-amber-700 leading-relaxed font-medium">
                            Podczas prezentacji "Aplikacji Partnera" (duży niebieski kafelek) pamiętaj, że <strong>generator bajek jest obecnie w trakcie wdrażania</strong>. 
                            Aplikacja pokazuje pełny proces (wybór imienia, awatara, ścieżkę audio), ale na końcu zamiast wygenerowanego wideo, klient zobaczy planszę "Ciąg dalszy nastąpi". 
                            Poinformuj partnera, że pełna funkcjonalność AI zostanie uruchomiona w ciągu najbliższych dni.
                        </p>
                    </div>
                </div>

                {/* 2. KONFIGURACJA TECHNICZNA (CHECKLISTA) */}
                <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-sm">
                    <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                        <Settings className="text-slate-400" size={32} />
                        Konfiguracja Partnera: Krok po Kroku
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <Step 
                                num="1" title="Dodaj Partnera i Logo" 
                                desc="Przed spotkaniem dodaj partnera w panelu. Obowiązkowo wgraj jego LOGO. Bez logo aplikacja wygląda nieprofesjonalnie. Jeśli nie masz pliku, pobierz go ze strony partnera lub Facebooka."
                            />
                            <Step 
                                num="2" title="Status: AKTYWNY" 
                                desc="Domyślnie partner ma status 'BRAK'. Dopóki nie zmienisz go na 'AKTYWNY', jego aplikacja może nie działać poprawnie dla klientów końcowych. Zmień to dopiero po udanym spotkaniu."
                            />
                            <Step 
                                num="3" title="Model Współpracy" 
                                desc="Wybierz 'PROWIZJA' (płatność po sprzedaży) lub 'PAKIET' (płatność z góry). Jeśli wybierzesz PROWIZJĘ, koniecznie wpisz ustaloną cenę sprzedaży w polu 'Ustalona Cena Sprzedaży (PLN)'."
                            />
                        </div>
                        <div className="space-y-6">
                            <Step 
                                num="4" title="Dane Kontaktowe" 
                                desc="Uzupełnij numer telefonu i e-mail partnera. To kluczowe, by system (w przyszłości) mógł wysyłać powiadomienia o kończących się kodach czy fakturach."
                            />
                            <Step 
                                num="5" title="Załącz Umowę (NOWOŚĆ)" 
                                desc="Możesz wgrać plik PDF/JPG lub użyć nowej funkcji 'Użyj Aparatu'. Pozwala ona zrobić zdjęcia każdej strony umowy bezpośrednio w panelu. System automatycznie zapisze je jako komplet."
                            />
                            <Step 
                                num="6" title="Dobierz Grupy Wiekowe" 
                                desc="To krytyczny punkt (opis poniżej). Nie zaznaczaj wszystkich jak leci! Zapytaj partnera o jego klientelę."
                            />
                        </div>
                    </div>
                </div>

                {/* Nowa Sekcja o Umowach */}
                <div className="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-sm">
                    <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                        <FileCheck className="text-blue-600" size={28} />
                        Jak poprawnie zarchiwizować umowę?
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Camera size={18} className="text-blue-500" /> Opcja 1: Aparat w Panelu (Szybka)</h4>
                            <p className="text-sm text-slate-600 leading-relaxed mb-4">
                                W oknie edycji partnera kliknij przycisk <strong>"Użyj Aparatu"</strong>.
                            </p>
                            <ul className="text-sm text-slate-600 space-y-2 list-disc pl-4">
                                <li>Otworzy się podgląd z kamery Twojego urządzenia.</li>
                                <li>Zrób zdjęcie pierwszej strony.</li>
                                <li>Przewróć kartkę i zrób zdjęcie drugiej strony (itd.).</li>
                                <li>Kliknij "Gotowe". Zdjęcia zostaną zapisane jako komplet.</li>
                            </ul>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Upload size={18} className="text-red-500" /> Opcja 2: Adobe Scan (Profesjonalna)</h4>
                            <p className="text-sm text-slate-600 leading-relaxed mb-4">
                                Jeśli chcesz, aby umowa była idealnym, czytelnym PDF-em, polecamy darmową aplikację <strong>Adobe Scan</strong>.
                            </p>
                            <ul className="text-sm text-slate-600 space-y-2 list-disc pl-4">
                                <li>Zeskanuj wszystkie strony w aplikacji.</li>
                                <li>Aplikacja automatycznie je wyprostuje i połączy w jeden plik PDF.</li>
                                <li>Wyślij plik sobie na maila/dysk.</li>
                                <li>Wgraj ten plik używając przycisku "Wgraj plik" w panelu.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* 3. GRUPY WIEKOWE */}
                <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 md:p-12 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-10">
                        <Rocket size={150} />
                    </div>
                    
                    <h3 className="text-2xl font-black mb-6 relative z-10">Dlaczego Grupy Wiekowe są tak ważne?</h3>
                    <p className="text-slate-300 mb-8 max-w-3xl relative z-10 leading-relaxed">
                        W konfiguracji partnera masz przyciski z wiekiem (3-5, 6-8, itd.). To, co tu zaznaczysz, wpłynie na to, jakie bajki zobaczy klient w kreatorze.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                        <AgeBox age="3-5 lat" desc="Mały Marzyciel. Proste, ciepłe historie. Zwierzątka, chmurki, brak strachów." />
                        <AgeBox age="6-8 lat" desc="Dzielny Bohater. Misje ratunkowe, przygody, akcja. Dziecko ma wpływ na świat." />
                        <AgeBox age="9-12 lat" desc="Mistrz Zagadek. Tajemnice, detektywi, logika. Dla starszaków, którzy nie chcą 'dzidziusiowych' bajek." />
                        <AgeBox age="13+ lat" desc="Architekt Legend. Epickie fantasy/sci-fi. Wybory moralne. Dla młodzieży." />
                    </div>

                    <div className="mt-8 p-4 bg-white/10 rounded-xl border border-white/20 relative z-10">
                        <strong className="text-[#fccb00]">Wskazówka Sprzedażowa:</strong> Zapytaj partnera: <em>"W jakim wieku dzieci najczęściej organizują u Was urodziny?"</em>. Jeśli to sala zabaw dla maluchów, zaznacz tylko 3-5 i 6-8. Jeśli to Laser Tag, zaznacz 9-12 i 13+. Dzięki temu oferta będzie idealnie dopasowana (Personalizacja!).
                    </div>
                </div>

                {/* 4. POJĘCIA (SŁOWNIK) */}
                <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
                    <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                        <MonitorPlay className="text-slate-400" size={32} />
                        Słownik (Żebyśmy mówili tym samym językiem)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="flex items-center gap-2 text-amber-500 font-black uppercase tracking-wide text-sm mb-2">
                                <BriefcaseIcon /> OFERTA B2B
                            </h4>
                            <p className="text-sm text-slate-500 font-bold mb-1">Link: <code>/slug/oferta-b2b</code></p>
                            <p className="text-sm text-slate-600 bg-amber-50 p-4 rounded-xl border border-amber-100">
                                To pokazujesz <strong>Właścicielowi</strong> na spotkaniu. Kalkulator zysków, opis wdrożenia, korzyści biznesowe. To narzędzie do zamknięcia sprzedaży.
                            </p>
                        </div>
                        <div>
                            <h4 className="flex items-center gap-2 text-blue-600 font-black uppercase tracking-wide text-sm mb-2">
                                <SmartphoneIcon /> APLIKACJA PARTNERA (B2C)
                            </h4>
                            <p className="text-sm text-slate-500 font-bold mb-1">Link: <code>/slug</code></p>
                            <p className="text-sm text-slate-600 bg-blue-50 p-4 rounded-xl border border-blue-100">
                                To produkt dla <strong>Klienta (Rodzica)</strong>. To tutaj rodzic zamawia bajkę. Pokazujesz to właścicielowi jako "efekt końcowy" - zobacz co dostaną Twoi klienci.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

const Step = ({ num, title, desc }: { num: string, title: string, desc: string }) => (
    <div className="flex gap-4">
        <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold shrink-0 mt-1 shadow-md">
            {num}
        </div>
        <div>
            <h4 className="font-bold text-slate-900 text-lg mb-1">{title}</h4>
            <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
        </div>
    </div>
);

const AgeBox = ({ age, desc }: { age: string, desc: string }) => (
    <div className="bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 transition-colors">
        <div className="text-[#fccb00] font-black text-xl mb-1">{age}</div>
        <p className="text-slate-300 text-xs leading-relaxed">{desc}</p>
    </div>
);

// Simple Icons
const BriefcaseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
);

const SmartphoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
);
