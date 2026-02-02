
-- 1. Create the bucket 'PartnersApp' if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('PartnersApp', 'PartnersApp', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policy to avoid conflict before recreating
DROP POLICY IF EXISTS "Public Access PartnersApp" ON storage.objects;

-- 3. Create a permissive policy for public uploads (Insert) and downloads (Select)
-- WARNING: This allows anyone to upload/read/update in this bucket.
-- For a production app, you might want to restrict 'update'/'delete'.
CREATE POLICY "Public Access PartnersApp"
ON storage.objects FOR ALL
USING ( bucket_id = 'PartnersApp' )
WITH CHECK ( bucket_id = 'PartnersApp' );
