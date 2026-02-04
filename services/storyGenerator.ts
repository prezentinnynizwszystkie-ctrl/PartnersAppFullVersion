
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
  console.log("StoryGenerator: Pobieranie szablonu (AI wyłączone)...");

  try {
    // Pobranie szablonu z Supabase
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

    // Zwracamy czysty scenariusz, bo AI jest wyłączone
    // Można tu w przyszłości dodać prostą podmianę tekstową (replace) bez użycia AI
    let scenario = storyData.Scenario?.content || "";
    
    // Prosta podmiana podstawowych tagów (fallback bez AI)
    const replacements: Record<string, string> = {
        "[RecipientName]": params.name,
        "[KidAge]": params.age,
        "[Hobby]": params.hobby,
        "[BestFriend]": params.bestFriend,
        "[PositiveAttribute]": params.positiveTrait
    };

    Object.entries(replacements).forEach(([key, value]) => {
         // Escaping brackets for regex
         const escapedKey = key.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
         scenario = scenario.replace(new RegExp(escapedKey, 'g'), value);
    });

    return scenario;

  } catch (error) {
    console.error("StoryGenerator Error:", error);
    return null;
  }
};
