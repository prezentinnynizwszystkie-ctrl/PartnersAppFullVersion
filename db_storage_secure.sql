
-- 1. Reset polityk dla Bucketa
DROP POLICY IF EXISTS "Public Access PartnersApp" ON storage.objects;
DROP POLICY IF EXISTS "Public Select PartnersApp" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert PartnersApp" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated All PartnersApp" ON storage.objects;

-- 2. PUBLIC READ (Każdy może pobrać zdjęcie)
CREATE POLICY "Public Select PartnersApp"
ON storage.objects FOR SELECT
USING ( bucket_id = 'PartnersApp' );

-- 3. PUBLIC INSERT (Każdy może WGRAĆ zdjęcie) - potrzebne dla Wizarda
CREATE POLICY "Public Insert PartnersApp"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'PartnersApp' );

-- 4. AUTHENTICATED ALL (Zalogowani mogą usuwać/edytować)
CREATE POLICY "Authenticated All PartnersApp"
ON storage.objects FOR ALL
USING ( bucket_id = 'PartnersApp' AND auth.role() = 'authenticated' )
WITH CHECK ( bucket_id = 'PartnersApp' AND auth.role() = 'authenticated' );
