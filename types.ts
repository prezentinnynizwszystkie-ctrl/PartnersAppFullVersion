
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
  contact_number?: string | null;
  IdOpiekuna: number | null;
  Opiekun: any | null; // JSONB
  ContactPerson: any | null; // JSONB
  Informacje: any | null; // JSONB
  Status: 'AKTYWNY' | 'NIEAKTYWNY' | 'BRAK';
  Model: 'PROWIZJA' | 'PAKIET' | 'BRAK';
  Miasto?: string | null;
  UmowaUrl?: string | null;
  // Pola Umowy
  ContractStatus?: 'PODPISANA' | 'BRAK' | null;
  ContractSignedDate?: string | null;
  ContractDuration?: number | null; // w miesiącach
  ContractEndDate?: string | null;
  
  SellPrice: number | null;
  Prowizja: number | null;
  ProwizjaObsluga: number | null;
  SprzedazIlosc: number | null;
  SprzedazWartosc: number | null;
  Slug: string;
  LogoUrl: string | null;
  PhotoUrl?: string | null; // Zdjęcie obiektu/partnera (Poster)
  IntroUrl?: string | null; // URL do pliku MP3 z Intro
  HeroHeader?: string | null; // Nagłówek w sekcji Hero
  Theme: ThemeConfig | null; // JSONB
  PartnerAgeGroups?: { AgeGroups: { AgeGroup: string } }[];
}

export interface Handlowiec {
  id: number;
  imie: string;
  nazwisko: string;
  email: string;
  telefon: string;
  SprzedazSuma?: number;
  PhotoUrl?: string | null; // Zdjęcie profilowe (bez tła)
}

export interface Story {
  Id: number;
  StoryTitle: string;
  StoryHeroUrl?: string;
  StoryDescription?: string;
  AgeGroup: string;
  CoverUrl?: string;
  DynamicLines?: any; // JSONB
  Scenario?: any; // JSONB lub TEXT w zależności od etapu
  Lektorzy?: any; // JSONB - Tablica lektorów (POPRAWIONE)
}

export interface StoryOrder {
  OrderId: number;
  created_at: string;
  Status: string;
  Questionnaire: any; // JSONB
  StoryId: number | null;
  PartnerId: number | null;
  PhotoUrl?: string | null;
  PhotoUrl1?: string | null;
  RecordUrl?: string | null;
}

export type UserRole = 'ADMIN' | 'HANDLOWIEC' | 'PARTNER' | 'KLIENT';

export interface UserProfile {
  id: string; // UUID from Supabase Auth
  email: string;
  role: UserRole;
  partner_id?: number | null;
  handlowiec_id?: number | null;
}
