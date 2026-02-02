
export interface ThemeConfig {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
}

export interface Partner {
  Id: number;
  PartnerType: string | null;
  PartnerName: string;
  PartnerNameGenitive?: string | null; // Nazwa w dopełniaczu (np. Nibylandii)
  contact_email?: string | null;
  IdOpiekuna: number | null;
  Opiekun: any | null; // JSONB
  ContactPerson: any | null; // JSONB
  Informacje: any | null; // JSONB
  Status: 'AKTYWNY' | 'NIEAKTYWNY' | 'BRAK';
  Model: 'PROWIZJA' | 'PAKIET' | 'BRAK';
  Miasto?: string | null; // NOWE
  UmowaUrl?: string | null; // NOWE
  SellPrice: number | null;
  Prowizja: number | null;
  ProwizjaObsluga: number | null;
  SprzedazIlosc: number | null;
  SprzedazWartosc: number | null;
  Slug: string;
  LogoUrl: string | null;
  PhotoUrl?: string | null; // Zdjęcie obiektu/partnera
  Theme: ThemeConfig | null; // JSONB
  // AgeGroups usunięte - teraz pobieramy to przez relację
  PartnerAgeGroups?: { AgeGroups: { AgeGroup: string } }[]; // Opcjonalne pole pomocnicze przy pobieraniu z JOIN
}

export interface Handlowiec {
  id: number;
  imie: string;
  nazwisko: string;
  email: string;
  telefon: string;
  SprzedazSuma?: number;
}

export interface Story {
  Id: number;
  StoryTitle: string;
  StoryHeroUrl?: string;
  StoryDescription?: string;
  AgeGroup: string;
  CoverUrl?: string;
  DynamicLines?: any; // JSONB
  Scenario?: any; // JSONB
}

export type UserRole = 'ADMIN' | 'HANDLOWIEC' | 'PARTNER' | 'KLIENT';

export interface UserProfile {
  id: string; // UUID from Supabase Auth
  email: string;
  role: UserRole;
  partner_id?: number | null;
  handlowiec_id?: number | null;
}
