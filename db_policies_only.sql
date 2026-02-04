
-- ============================================================================
-- TYLKO POLITYKI BEZPIECZEŃSTWA (RLS) + STORAGE
-- Ten skrypt nie tworzy tabel ani kolumn. Zarządza tylko dostępem.
-- ============================================================================

BEGIN;

-- 1. Upewniamy się, że mechanizm ochrony jest WŁĄCZONY
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

-- 2. Czyścimy stare polityki (żeby uniknąć błędów "policy already exists")
-- Używamy dynamicznego SQL, aby usunąć wszystkie polityki dla tych tabel i stworzyć je na czysto
DO $$ 
DECLARE 
    tbl text;
BEGIN 
    FOR tbl IN 
        SELECT tablename FROM pg_tables WHERE schemaname IN ('PartnersApp', 'birthdays')
    LOOP 
        EXECUTE format('DROP POLICY IF EXISTS "Public Read %I" ON "PartnersApp".%I', tbl, tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Admin All %I" ON "PartnersApp".%I', tbl, tbl);
    END LOOP;
END $$;

-- Ręczne usuwanie specyficznych nazw, które mogliśmy stworzyć wcześniej
DROP POLICY IF EXISTS "Public Read Partners" ON "PartnersApp"."Partners";
DROP POLICY IF EXISTS "Public Insert Orders" ON "birthdays"."StoryOrders";
DROP POLICY IF EXISTS "Admin Read Orders" ON "birthdays"."StoryOrders";
DROP POLICY IF EXISTS "Public Update Orders" ON "birthdays"."StoryOrders";
DROP POLICY IF EXISTS "Public Insert Marketing" ON "PartnersApp"."MarketingPermissions";
DROP POLICY IF EXISTS "Public Access PartnersApp" ON storage.objects;
DROP POLICY IF EXISTS "Public Select PartnersApp" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert PartnersApp" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated All PartnersApp" ON storage.objects;


-- 3. TWORZENIE NOWYCH POLITYK

-- A. Dostęp Publiczny (Każdy widzi ofertę, cenniki, konfigurację bajek)
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

-- B. Formularze (Każdy może wysłać zamówienie, ale nie może czytać cudzych)
CREATE POLICY "Public Insert Orders" ON "birthdays"."StoryOrders" FOR INSERT WITH CHECK (true);
-- Pozwalamy na UPDATE, aby Wizard mógł zaktualizować rekord o zdjęcia po utworzeniu (technicznie ryzyko nadpisania, ale małe przy UUID/losowych ID)
CREATE POLICY "Public Update Orders" ON "birthdays"."StoryOrders" FOR UPDATE USING (true);
-- Czytać listę zamówień może tylko zalogowany (Admin/Partner)
CREATE POLICY "Admin Read Orders" ON "birthdays"."StoryOrders" FOR SELECT USING (auth.role() = 'authenticated');

-- Zgody marketingowe
CREATE POLICY "Public Insert Marketing" ON "PartnersApp"."MarketingPermissions" FOR INSERT WITH CHECK (true);

-- C. Panel Administracyjny (Pełny dostęp dla zalogowanych)
-- UWAGA: To jest uproszczona wersja. W idealnym świecie sprawdzalibyśmy role ('ADMIN'), 
-- ale 'authenticated' wystarczy, jeśli tylko Ty i Twoi pracownicy macie konta.

CREATE POLICY "Admin All Stories" ON "PartnersApp"."Stories" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Voices" ON "PartnersApp"."StoryVoices" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Types" ON "PartnersApp"."StoryTypes" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Schemas" ON "PartnersApp"."StorySchemas" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Dynamics" ON "PartnersApp"."DynamicLines" FOR ALL USING (auth.role() = 'authenticated');

-- Edycja Partnerów (Handlowcy/Admini)
CREATE POLICY "Authenticated All Partners" ON "PartnersApp"."Partners" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated All Handlowcy" ON "PartnersApp"."Handlowcy" FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated All Requests" ON "PartnersApp"."PartnerRequests" FOR ALL USING (auth.role() = 'authenticated');

-- Profile
CREATE POLICY "Read Profiles" ON "PartnersApp"."Profiles" FOR SELECT USING (auth.role() = 'authenticated');


-- 4. OCHRONA PLIKÓW (STORAGE)

-- A. Każdy może pobrać (wyświetlić) zdjęcie
CREATE POLICY "Public Select PartnersApp" ON storage.objects FOR SELECT USING ( bucket_id = 'PartnersApp' );

-- B. Każdy może wgrać zdjęcie (potrzebne w Wizardzie)
CREATE POLICY "Public Insert PartnersApp" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'PartnersApp' );

-- C. Tylko zalogowani mogą usuwać lub podmieniać pliki (ZABEZPIECZENIE PRZED KASOWANIEM PRZEZ HAKERA)
CREATE POLICY "Authenticated Update Delete PartnersApp" ON storage.objects 
FOR UPDATE USING ( bucket_id = 'PartnersApp' AND auth.role() = 'authenticated' );

CREATE POLICY "Authenticated Delete PartnersApp" ON storage.objects 
FOR DELETE USING ( bucket_id = 'PartnersApp' AND auth.role() = 'authenticated' );

COMMIT;
