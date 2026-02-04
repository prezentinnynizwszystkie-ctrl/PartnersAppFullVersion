
// Typ dla pojedynczego Lektora (Aktor w bajce)
export interface StoryLector {
  id: string;        // Unikalny ID w ramach sesji (np. uuid)
  name: string;      // Nazwa roli, np. "Narrator", "Mama", "Smok"
  elevenId: string;  // ID głosu z ElevenLabs
}

export type BlockType = 'LINE' | 'CHAPTER' | 'BACKGROUND' | 'PAUSE' | 'EPISODE';

export interface ContentVariants {
  boy: string;
  girl: string;
}

export interface ImageVariants {
  boy?: string;
  girl?: string;
}

// Struktura pojedynczego klocka scenariusza
export interface StoryBlock {
  id: string;
  type: BlockType;
  content: string;       // Robocza treść (używana w Kroku 1 i 2 jako baza)
  lectorId?: string;     // ID lektora (dla typu LINE)
  code?: string;         // Kod techniczny np. S1, Z1, Intro_Music
  
  // NOWE POLA DLA LOGIKI PARTNERÓW I PŁCI
  isPartnerSpecific?: boolean; 
  isGenderUniversal?: boolean; // NOWE: Czy linia jest taka sama dla obu płci
  
  // Warianty treści (On/Ona) - wypełniane w Kroku 4
  contentVariants?: ContentVariants;
  
  // Zdjęcia dla linii
  imageUrls?: ImageVariants;
  
  // Nadpisania dla partnerów: { "slug_partnera": { boy: "...", girl: "..." } }
  overrides?: Record<string, ContentVariants>;
  imageOverrides?: Record<string, ImageVariants>;

  metadata?: {
    duration?: number;   // dla PAUSE
    fadeIn?: number | string;     // dla BACKGROUND
    [key: string]: any;
  };
}

// Główny stan generatora
export interface GeneratorState {
  // Metadane rekordu (Database ID - null jeśli nowy)
  dbId?: number | null; 

  // KROK 1: Metadane i Wsad
  title: string;
  ageGroup: string;
  gender: 'Chłopiec' | 'Dziewczynka' | 'Uniwersalna'; 
  description: string;
  coverUrl: string;
  rawScript: string;
  lectors: StoryLector[];

  // KROK 2: Przetwarzanie
  blocks: StoryBlock[]; 
  
  // UI State
  currentStep: number;
  isSaving: boolean;
}

export type AgeGroupOption = '3-5' | '6-8' | '9-12' | '13+';
