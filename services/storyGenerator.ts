
import { GoogleGenAI, Type } from "@google/genai";
import { supabase } from "../utils/supabaseClient";

interface StoryParams {
  name: string;
  age: string;
  hobby: string;
  bestFriend: string;
  positiveTrait: string;
  guestList: string[];
}

export const generatePersonalizedStory = async (
  storyId: number, 
  params: StoryParams
): Promise<string | null> => {
  console.log("StoryGenerator: Rozpoczynam generowanie dla StoryId:", storyId);

  try {
    // 2. Pobranie szablonu z Supabase
    const { data: storyData, error: storyError } = await supabase
      .schema('PartnersApp')
      .from('Stories')
      .select('DynamicLines, Scenario')
      .eq('Id', storyId)
      .single();

    if (storyError || !storyData) {
      console.error("Supabase Error:", storyError);
      throw new Error("Błąd pobierania bajki z bazy.");
    }

    const dynamicLines = storyData.DynamicLines;
    const scenario = storyData.Scenario?.content || "";

    if (!dynamicLines) {
      console.log("Brak linii dynamicznych, zwracam czysty scenariusz.");
      return scenario;
    }

    // 3. Konfiguracja Gemini
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Przygotowanie danych do promptu
    const replacements = {
        "[RecipientName]": params.name,
        "[KidAge]": params.age,
        "[Hobby]": params.hobby,
        "[BestFriend]": params.bestFriend,
        "[PositiveAttribute]": params.positiveTrait,
        "[Guest1]": params.guestList[0] || "Gość",
        "[Guest2]": params.guestList[1] || "Kolega",
        "[Guest3]": params.guestList[2] || "Przyjaciel"
    };

    const promptData = {
      replacements: replacements,
      dynamicLines: dynamicLines
    };

    const systemInstruction = `
Jesteś ekspertem języka polskiego. Twoim zadaniem jest uzupełnienie fragmentów tekstu ("dynamicLines") danymi ("replacements").
ZASADY:
1. Wstaw wartości z "replacements" w odpowiednie miejsca w "dynamicLines" (np. zamień [RecipientName] na imię dziecka).
2. KLUCZOWE: Odmień wstawiane imiona i rzeczowniki przez przypadki (deklinacja), aby pasowały gramatycznie do zdania.
3. Zwróć wynik jako JSON zawierający listę obiektów, gdzie każdy obiekt ma 'id' (klucz linii) i 'text' (gotowe zdanie).
    `;

    // 4. Wywołanie modelu
    console.log("Wysyłanie zapytania do Gemini...");
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: JSON.stringify(promptData),
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            lines: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  text: { type: Type.STRING }
                },
                required: ["id", "text"]
              }
            }
          }
        }
      }
    });

    // 5. Przetwarzanie odpowiedzi
    const responseText = response.text;
    if (!responseText) throw new Error("Pusta odpowiedź od AI");

    const resultJson = JSON.parse(responseText);
    const processedLinesArray = resultJson.lines || []; // Oczekujemy tablicy [{id: "Z1", text: "..."}, ...]

    // Mapowanie tablicy na obiekt dla łatwiejszego dostępu
    const processedLinesMap: Record<string, string> = {};
    if (Array.isArray(processedLinesArray)) {
        processedLinesArray.forEach((item: any) => {
            if (item.id && item.text) {
                processedLinesMap[item.id] = item.text;
            }
        });
    }

    // 6. Podmiana w scenariuszu
    let finalScenarioText = scenario;
    
    // a) Podmień klucze {Z1}, {Z2}... tekstami z AI
    finalScenarioText = finalScenarioText.replace(/\{Z(\d+)\}/g, (match: string, number: string) => {
      const key = `Z${number}`;
      return processedLinesMap[key] || match;
    });

    // b) Fallback: Podmień surowe tagi [RecipientName] itp., jeśli jakieś zostały w tekście bazowym
    Object.entries(replacements).forEach(([key, value]) => {
         const escapedKey = key.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
         finalScenarioText = finalScenarioText.replace(new RegExp(escapedKey, 'g'), value);
    });

    console.log("Generowanie zakończone sukcesem.");
    return finalScenarioText;

  } catch (error) {
    console.error("StoryGenerator Error:", error);
    // W przypadku błędu zwracamy null, aby UI mogło obsłużyć to jako brak bajki (bez crashowania)
    return null;
  }
};
