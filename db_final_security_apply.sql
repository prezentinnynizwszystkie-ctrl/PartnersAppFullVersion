
-- ============================================================================
-- SKRYPT ZABEZPIECZAJĄCY (SECURITY LOCKDOWN)
-- Uruchom ten skrypt raz w SQL Editor, aby zabezpieczyć całą aplikację.
-- ============================================================================

BEGIN; -- Rozpoczęcie transakcji (wszystko albo nic)

-- ----------------------------------------------------------------------------
-- CZĘŚĆ 1: BAZA DANYCH (Row Level Security)
-- ----------------------------------------------------------------------------

-- 1. Włączamy "bramkarza" (RLS) na wszystkich tabelach
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

-- 2. Czyścimy stare zasady (dla pewności, żeby się nie dublowały)
DROP POLICY IF EXISTS "Public Read Partners" ON "PartnersApp"."Partners";
DROP POLICY IF EXISTS "Public Read Handlowcy" ON "PartnersApp"."Handlowcy";
DROP POLICY IF EXISTS "Public Insert Orders" ON "birthdays"."StoryOrders";
DROP POLICY IF EXISTS "Enable all access for all users" ON "birthdays"."StoryOrders";
-- (Supabase usunie też inne polityki, jeśli były zależne, ale te są najważniejsze)

-- 3. ZASADY PUBLICZNEGO ODCZYTU (Każdy widzi ofertę)
-- Pozwalamy czytać (SELECT), ale NIE usuwać (DELETE) ani edytować (UPDATE)
CREATE POLICY "Public Read Partners" ON "PartnersApp"."Partners" FOR SELECT USING (true);
CREATE POLICY "Public Read Handlowcy" ON "PartnersApp"."Handlowcy" FOR SELECT USING (true);
CREATE POLICY "Public Read Stories" ON "PartnersApp"."Stories" FOR SELECT USING (true);
CREATE POLICY "Public Read Voices" ON "PartnersApp"."StoryVoices" FOR SELECT USING (true);
CREATE POLICY "Public Read Types" ON "PartnersApp"."StoryTypes" FOR SELECT USING (true);
CREATE POLICY "Public Read Schemas" ON "PartnersApp"."StorySchemas" FOR SELECT USING (true);
CREATE POLICY "Public Read Dynamics" ON "PartnersApp"."DynamicLines" FOR SELECT USING (true);
CREATE POLICY "Public Read Names" ON "PartnersApp"."Names" FOR SELECT USING (true);
CREATE POLICY "Public Read AgeGroups" ON "PartnersApp"."AgeGroups" FOR SELECT USING (true);
CREATE POLICY "Public Read PartnerAgeGroups" ON "PartnersApp"."PartnerAgeGroups" FOR SELECT USING (true);

-- 4. ZASADY PUBLICZNEGO ZAPISU (Formularze)
-- Pozwalamy wrzucać nowe zamówienia (INSERT), ale nie podglądać cudzych (SELECT z blokadą)

-- Zamówienia: Każdy może dodać
CREATE POLICY "Public Insert Orders" ON "birthdays"."StoryOrders" 
FOR INSERT WITH CHECK (true);

-- Zamówienia: Tylko zalogowany admin/system widzi listę (ochrona danych dzieci)
CREATE POLICY "Admin Read Orders" ON "birthdays"."StoryOrders" 
FOR SELECT USING (auth.role() = 'authenticated');

-- Zamówienia: Pozwalamy na UPDATE każdemu, żeby Wizard mógł zaktualizować rekord po wgraniu zdjęć
-- (To jest kompromis dla Wizarda bez logowania. ID zamówienia jest trudne do zgadnięcia)
CREATE POLICY "Public Update Orders" ON "birthdays"."StoryOrders"
FOR UPDATE USING (true);

-- Marketing: Każdy może wysłać zgodę
CREATE POLICY "Public Insert Marketing" ON "PartnersApp"."MarketingPermissions" 
FOR INSERT WITH CHECK (true);

-- 5. ZASADY ADMINISTRACYJNE (Tylko zalogowani mają pełną władzę)
-- Jeśli jesteś zalogowany w panelu (role = authenticated), możesz wszystko.

CREATE POLICY "Admin All Stories" ON "PartnersApp"."Stories" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Voices" ON "PartnersApp"."StoryVoices" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Types" ON "PartnersApp"."StoryTypes" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Schemas" ON "PartnersApp"."StorySchemas" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Dynamics" ON "PartnersApp"."DynamicLines" FOR ALL USING (auth.role() = 'authenticated');

-- Partnerzy: Zalogowani mogą edytować (logika JS sprawdzi czy to 'ich' partner)
CREATE POLICY "Authenticated Edit Partners" ON "PartnersApp"."Partners" FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated Insert Partners" ON "PartnersApp"."Partners" FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Profile: Każdy zalogowany widzi profile (potrzebne do sprawdzania ról)
CREATE POLICY "Read Profiles" ON "PartnersApp"."Profiles" FOR SELECT USING (auth.role() = 'authenticated');

-- ----------------------------------------------------------------------------
-- CZĘŚĆ 2: PLIKI (STORAGE)
-- ----------------------------------------------------------------------------

-- 1. Reset polityk Storage
DROP POLICY IF EXISTS "Public Access PartnersApp" ON storage.objects;
DROP POLICY IF EXISTS "Public Select PartnersApp" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert PartnersApp" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated All PartnersApp" ON storage.objects;

-- 2. PUBLIC READ (Każdy może pobrać zdjęcie ze strony)
CREATE POLICY "Public Select PartnersApp"
ON storage.objects FOR SELECT
USING ( bucket_id = 'PartnersApp' );

-- 3. PUBLIC INSERT (Każdy może WGRAĆ zdjęcie w Wizardzie)
CREATE POLICY "Public Insert PartnersApp"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'PartnersApp' );

-- 4. AUTHENTICATED ALL (Tylko zalogowani mogą USUWAĆ lub PODMIENIAĆ pliki)
-- To chroni przed wyczyszczeniem bucketu przez hakera
CREATE POLICY "Authenticated All PartnersApp"
ON storage.objects FOR ALL
USING ( bucket_id = 'PartnersApp' AND auth.role() = 'authenticated' )
WITH CHECK ( bucket_id = 'PartnersApp' AND auth.role() = 'authenticated' );

COMMIT; -- Zatwierdzenie zmian
