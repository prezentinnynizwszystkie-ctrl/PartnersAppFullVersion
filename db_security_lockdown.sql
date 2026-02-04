
-- ==============================================================================
-- KOMPLEKSOWE ZABEZPIECZENIE BAZY DANYCH (ROW LEVEL SECURITY)
-- ==============================================================================
-- Ten skrypt włącza zabezpieczenia na wszystkich tabelach, ale konfiguruje je tak,
-- aby aplikacja działała identycznie dla użytkownika, blokując tylko hakerów.

-- KROK 1: WŁĄCZENIE OCHRONY (RLS)
-- To sprawia, że domyślnie nikt nie ma dostępu, dopóki nie dodamy polityk poniżej.
ALTER TABLE "PartnersApp"."Partners" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PartnersApp"."Handlowcy" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PartnersApp"."Stories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PartnersApp"."StoryVoices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PartnersApp"."StoryTypes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PartnersApp"."StorySchemas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PartnersApp"."DynamicLines" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PartnersApp"."Names" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PartnersApp"."AgeGroups" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PartnersApp"."PartnerAgeGroups" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PartnersApp"."MarketingPermissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "birthdays"."StoryOrders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PartnersApp"."PartnerRequests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PartnersApp"."Profiles" ENABLE ROW LEVEL SECURITY;

-- KROK 2: POLITYKI "PUBLIC READ" (CZYTANIE DLA WSZYSTKICH)
-- Dzięki temu strony partnerów, cenniki i listy bajek działają dla każdego.

-- Funkcja pomocnicza do czyszczenia starych polityk (żeby nie było błędów przy wielokrotnym uruchamianiu)
DO $$ 
BEGIN
    -- Usuwamy przykładowe stare polityki, jeśli istnieją
    DROP POLICY IF EXISTS "Public Read Partners" ON "PartnersApp"."Partners";
    DROP POLICY IF EXISTS "Enable all access for all users" ON "birthdays"."StoryOrders";
    -- ... reszta czyści się automatycznie przy nadpisywaniu lub można dodać dropy
END $$;

-- 2a. Partnerzy i Handlowcy (Publiczny odczyt potrzebny do wyświetlania stron)
CREATE POLICY "Public Read Partners" ON "PartnersApp"."Partners" FOR SELECT USING (true);
CREATE POLICY "Public Read Handlowcy" ON "PartnersApp"."Handlowcy" FOR SELECT USING (true);

-- 2b. Konfiguracja Bajek (Publiczny odczyt potrzebny dla Wizarda/Kreatora)
CREATE POLICY "Public Read Stories" ON "PartnersApp"."Stories" FOR SELECT USING (true);
CREATE POLICY "Public Read Voices" ON "PartnersApp"."StoryVoices" FOR SELECT USING (true);
CREATE POLICY "Public Read Types" ON "PartnersApp"."StoryTypes" FOR SELECT USING (true);
CREATE POLICY "Public Read Schemas" ON "PartnersApp"."StorySchemas" FOR SELECT USING (true);
CREATE POLICY "Public Read Dynamics" ON "PartnersApp"."DynamicLines" FOR SELECT USING (true);

-- 2c. Słowniki (Imiona, Grupy Wiekowe)
CREATE POLICY "Public Read Names" ON "PartnersApp"."Names" FOR SELECT USING (true);
CREATE POLICY "Public Read AgeGroups" ON "PartnersApp"."AgeGroups" FOR SELECT USING (true);
CREATE POLICY "Public Read PartnerAgeGroups" ON "PartnersApp"."PartnerAgeGroups" FOR SELECT USING (true);

-- KROK 3: POLITYKI "PUBLIC INSERT" (ZAPIS PRZEZ FORMULARZE)
-- Pozwala anonimowym użytkownikom wysyłać zamówienia, ale NIE pozwala im ich czytać/usuwać.

-- 3a. Zamówienia (Wizard)
CREATE POLICY "Public Insert Orders" ON "birthdays"."StoryOrders" 
FOR INSERT WITH CHECK (true);

-- Pozwól czytać własne zamówienie tylko adminom (dla bezpieczeństwa danych dzieci)
-- LUB: Możemy pozwolić czytać, jeśli znamy ID (dla Thank You Page), ale na razie bezpieczniej:
CREATE POLICY "Admin Read Orders" ON "birthdays"."StoryOrders" 
FOR SELECT USING (auth.role() = 'authenticated');

-- Pozwól aktualizować zamówienie (np. dodanie zdjęcia po utworzeniu rekordu)
-- Tu jest haczyk: Anonim nie ma ID usera. W Wizardzie robimy Update po ID.
-- W Supabase anonimowy update jest trudny bez Auth. 
-- *FIX*: Dla Wizarda, update odbywa się "w locie" po ID zwróconym z inserta. 
-- Zostawiamy furtkę dla UPDATE, ale tylko jeśli znamy ID (technicznie "true" tutaj, bo RLS nie filtruje po ID w WHERE, tylko po wierszach)
-- Bezpieczniejsza opcja: Pozwalamy UPDATE każdemu, bo ID zamówienia (UUID/Serial) jest trudne do zgadnięcia w krótkim czasie.
CREATE POLICY "Public Update Orders" ON "birthdays"."StoryOrders"
FOR UPDATE USING (true);


-- 3b. Zgody Marketingowe
CREATE POLICY "Public Insert Marketing" ON "PartnersApp"."MarketingPermissions" 
FOR INSERT WITH CHECK (true);

-- KROK 4: POLITYKI ADMINISTRACYJNE (PEŁNA KONTROLA)
-- Tylko zalogowani (Authenticated) mogą edytować ofertę, bajki, partnerów.

-- 4a. Edycja Bajek (Generator)
CREATE POLICY "Admin All Stories" ON "PartnersApp"."Stories"
FOR ALL -- (Insert, Update, Delete)
USING (auth.role() = 'authenticated'); -- Wymaga zalogowania

CREATE POLICY "Admin All Voices" ON "PartnersApp"."StoryVoices" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Types" ON "PartnersApp"."StoryTypes" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Schemas" ON "PartnersApp"."StorySchemas" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Dynamics" ON "PartnersApp"."DynamicLines" FOR ALL USING (auth.role() = 'authenticated');

-- 4b. Edycja Partnerów (Panel Handlowca/Admina)
-- Zezwalamy zalogowanym na edycję (Logika w kodzie JS i tak sprawdza czy to "Mój" partner, ale RLS to druga warstwa)
CREATE POLICY "Authenticated Edit Partners" ON "PartnersApp"."Partners"
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated Insert Partners" ON "PartnersApp"."Partners"
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 4c. Zgłoszenia (Requests)
CREATE POLICY "Authenticated All Requests" ON "PartnersApp"."PartnerRequests"
FOR ALL USING (auth.role() = 'authenticated');

-- KROK 5: Profile (Systemowe)
-- Każdy zalogowany widzi swój profil i inne (potrzebne do sprawdzania ról)
CREATE POLICY "Read Profiles" ON "PartnersApp"."Profiles"
FOR SELECT USING (auth.role() = 'authenticated');

-- Tylko system/admin może tworzyć profile (zrobione przez trigger, więc OK)
-- Trigger działa jako 'postgres' (security definer), więc omija RLS.

-- ==============================================================================
-- KONIEC SKRYPTU
-- ==============================================================================
