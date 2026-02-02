
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { Partner } from '../types';
import { motion } from 'framer-motion';
import { ChevronLeft, ArrowRight } from 'lucide-react';

const ArticleView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartner = async () => {
      if (!slug) return;
      try {
        const { data } = await supabase
          .schema('PartnersApp')
          .from('Partners')
          .select('*')
          .eq('Slug', slug)
          .single();
        setPartner(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPartner();
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-[#eeeef5]" />;

  const primaryColor = partner?.Theme?.primaryColor || '#3b82f6';
  const accentColor = partner?.Theme?.accentColor || '#ec4899';

  return (
    <div className="min-h-screen bg-[#eeeef5] text-slate-800 font-sans selection:bg-slate-200 bg-noise">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
         <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-gradient-to-b from-white/80 to-transparent opacity-60" />
         <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] rounded-full blur-[100px] opacity-20" style={{backgroundColor: primaryColor}} />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] rounded-full blur-[100px] opacity-10" style={{backgroundColor: accentColor}} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
            <Link to={`/${slug}`} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors bg-white/50 hover:bg-white px-4 py-2 rounded-full backdrop-blur-sm shadow-sm ring-1 ring-slate-200/50">
                <ChevronLeft size={16} /> Powrót do {partner?.PartnerName}
            </Link>
            {partner?.LogoUrl && (
                <img src={partner.LogoUrl} alt="Logo" className="h-10 opacity-80" />
            )}
        </div>

        {/* Article Container */}
        <motion.article 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden"
        >
            {/* Hero Image - 21:9 Aspect Ratio */}
            <div className="w-full aspect-[21/9] relative overflow-hidden bg-slate-50">
                <img 
                    src="https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/UniversalPhotos/BlogArticleHero.webp" 
                    alt="Happy child with cape" 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6 md:p-12">
                    <span className="text-white/90 font-bold tracking-wider text-xs uppercase border border-white/30 px-3 py-1 rounded-full backdrop-blur-md">
                        Edukacja i Rozwój
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-8 md:p-16">
                <h1 className="text-3xl md:text-5xl font-display font-black text-slate-900 mb-8 leading-[1.1]">
                    Urodziny z Supermocami: Dlaczego Twoje Dziecko Zasługuje na Własną Historię?
                </h1>

                <div className="prose prose-lg prose-slate max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-blue-600">
                    <p className="lead text-xl text-slate-600 mb-8 font-medium">
                        Większość urodzin w salach zabaw wygląda podobnie: radosny pisk, tona energii, tort, a na koniec plastikowy gadżet w torebce prezentowej, który po dwóch dniach ląduje w kącie. A gdyby tak tym razem jubilat zabrał ze sobą coś, co zostanie w jego sercu (i głowie) na lata?
                    </p>

                    <p className="mb-8">
                        Wprowadzamy nowość, która zmienia zasady gry: <strong>Personalizowaną Multibajkę</strong>. To nie jest zwykła animacja. To narzędzie psychologiczne ubrane w szaty pięknej opowieści, w której to <strong>Twoje dziecko ratuje świat.</strong>
                    </p>

                    <hr className="my-12 border-slate-100" />

                    <h3 className="text-2xl text-slate-800 mb-4 flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">1</span>
                        Magia „Efektu Odniesienia do Ja”
                    </h3>
                    
                    <p className="mb-6">
                        Czy zauważyłeś, jak Twoje dziecko rozkwita, gdy słyszy swoje imię? W psychologii nazywamy to <strong>efektem odniesienia do Ja</strong> (<em>self-referential effect</em>). Nasze mózgi są zaprogramowane tak, by priorytetowo traktować informacje o nas samych.
                    </p>
                    
                    <p className="mb-6">
                        Kiedy jubilat słyszy w głośnikach: <em>„Tylko Ty, [Imię Dziecka], możesz pomóc mieszkańcom oceanu!”</em>, dzieje się coś niezwykłego:
                    </p>

                    <ul className="space-y-3 mb-10 pl-4 border-l-4 border-slate-100">
                        <li className="flex items-start gap-3">
                            <ArrowRight className="text-green-500 mt-1 shrink-0" size={18} /> 
                            <span><strong>Koncentracja rośnie do maksimum.</strong></span>
                        </li>
                        <li className="flex items-start gap-3">
                             <ArrowRight className="text-green-500 mt-1 shrink-0" size={18} /> 
                            <span>Dziecko przestaje być tylko widzem, a staje się sprawcą.</span>
                        </li>
                        <li className="flex items-start gap-3">
                             <ArrowRight className="text-green-500 mt-1 shrink-0" size={18} /> 
                            <span>Buduje się silne poczucie własnej wartości.</span>
                        </li>
                    </ul>

                    {/* Image Break */}
                    <div className="my-10 rounded-2xl overflow-hidden shadow-lg h-64 md:h-80">
                         <img src="https://idbvgxjvitowbysvpjlk.supabase.co/storage/v1/object/public/PartnersApp/UniversalPhotos/RealityVSvirtual/6-8Boy1.webp" alt="Imagination" className="w-full h-full object-cover" />
                    </div>

                    <h3 className="text-2xl text-slate-800 mb-4 flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 text-sm font-bold">2</span>
                        Więcej niż zabawa – to trening odwagi
                    </h3>

                    <p className="mb-6">
                        W świecie Multibajki dziecko staje przed wyzwaniami: musi posprzątać ocean z plastiku lub pomóc zagubionym zwierzętom. Dzięki mechanizmowi <strong>transportu narracyjnego</strong> dziecko „wchodzi” w historię całym sobą.
                    </p>

                    <blockquote className="p-6 bg-slate-50 rounded-xl border-l-4 mb-10" style={{borderColor: primaryColor}}>
                        <p className="italic text-slate-700 font-medium m-0">
                            <strong>Co to oznacza w praktyce?</strong> Jeśli dziecko poradzi sobie z problemem w bajce, jego podświadomość koduje prosty komunikat: <em>„Jestem odważny. Potrafię rozwiązywać problemy”</em>. To tzw. <strong>empowerment</strong>, czyli budowanie poczucia sprawstwa, które dzieci przenoszą potem na plac zabaw i do szkoły.
                        </p>
                    </blockquote>

                    <h3 className="text-2xl text-slate-800 mb-4 flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-100 text-pink-600 text-sm font-bold">3</span>
                        Pamiątka, która wycisza i koi
                    </h3>

                    <p className="mb-6">
                        Urodziny w parku trampolin czy sali zabaw to ogromna dawka bodźców. Multibajka, którą otrzymujecie po imprezie, to idealny sposób na <strong>powrót do równowagi</strong>.
                    </p>

                    <ul className="list-disc pl-5 space-y-2 mb-10 text-slate-700">
                        <li><strong>Wieczorny rytuał:</strong> Słuchanie o własnych przygodach przed snem pomaga obniżyć napięcie i lęk.</li>
                        <li><strong>Wsparcie terapeutyczne:</strong> Dzięki metodzie desensytyzacji (oswajania lęków poprzez historię), dziecko uczy się, że nawet trudne sytuacje mają szczęśliwe zakończenie.</li>
                    </ul>

                    <h3 className="text-2xl font-bold mb-6 mt-12">Dlaczego warto dodać Multibajkę do pakietu urodzinowego?</h3>
                    
                    <div className="overflow-hidden rounded-xl border border-slate-200 mb-12">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-900 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="p-4 border-b border-slate-200">Cecha</th>
                                    <th className="p-4 border-b border-slate-200">Korzyść dla dziecka</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr className="bg-white">
                                    <td className="p-4 font-semibold text-slate-900">Personalizacja</td>
                                    <td className="p-4 text-slate-600">Czuje się wyjątkowe i ważne – nie tylko „jednym z gości”.</td>
                                </tr>
                                <tr className="bg-slate-50/50">
                                    <td className="p-4 font-semibold text-slate-900">Głos Lektora + Obraz</td>
                                    <td className="p-4 text-slate-600">Stymulacja rozwoju językowego i wyobraźni.</td>
                                </tr>
                                <tr className="bg-white">
                                    <td className="p-4 font-semibold text-slate-900">Trwałość</td>
                                    <td className="p-4 text-slate-600">To pamiątka, do której można wracać setki razy.</td>
                                </tr>
                                <tr className="bg-slate-50/50">
                                    <td className="p-4 font-semibold text-slate-900">Budowanie empatii</td>
                                    <td className="p-4 text-slate-600">Misje ratunkowe uczą wrażliwości na los innych i ekologii.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white text-center">
                        <h4 className="text-2xl font-display font-bold mb-4">Podaruj dziecku dowód na to, że jest Bohaterem</h4>
                        <p className="mb-6 opacity-90 leading-relaxed">
                            Skakanie w basenie z gąbkami to genialna frajda, ale połączenie tej energii z refleksją, jaką daje personalizowana opowieść, to prezent kompletny. Chcemy, aby każde dziecko wychodziło z naszej sali nie tylko wybiegane, ale też pewniejsze siebie.
                        </p>
                        <p className="font-bold text-lg text-[var(--accent)]" style={{color: accentColor}}>
                            Bo w {partner?.PartnerName || 'naszej sali zabaw'} każde dziecko jest głównym bohaterem swojej własnej przygody.
                        </p>
                    </div>

                </div>
            </div>
        </motion.article>
      </div>
    </div>
  );
};

export default ArticleView;
