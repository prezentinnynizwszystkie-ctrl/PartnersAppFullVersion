
-- 1. Ensure RLS is enabled on Partners (Security)
ALTER TABLE "PartnersApp"."Partners" ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing INSERT policies to avoid conflicts or stale definitions
DROP POLICY IF EXISTS "Handlowcy Create Partners" ON "PartnersApp"."Partners";
DROP POLICY IF EXISTS "Partners Insert Requests" ON "PartnersApp"."Partners"; -- Just in case

-- 3. Create a robust INSERT policy
-- We cast 'role' to TEXT to allow comparison regardless of whether the column is ENUM or TEXT type in the DB.
CREATE POLICY "Handlowcy Create Partners" ON "PartnersApp"."Partners"
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "PartnersApp"."Profiles"
    WHERE id = auth.uid() 
    AND (role::text = 'HANDLOWIEC' OR role::text = 'ADMIN')
  )
);

-- 4. Ensure Select policy exists (Public Read)
DROP POLICY IF EXISTS "Public Read Partners" ON "PartnersApp"."Partners";
CREATE POLICY "Public Read Partners" ON "PartnersApp"."Partners"
FOR SELECT USING (true);

-- 5. Ensure Update policy exists
DROP POLICY IF EXISTS "Handlowcy Update Own Partners" ON "PartnersApp"."Partners";
CREATE POLICY "Handlowcy Update Own Partners" ON "PartnersApp"."Partners"
FOR UPDATE
USING (
  "IdOpiekuna" IN (
    SELECT handlowiec_id FROM "PartnersApp"."Profiles" WHERE id = auth.uid()
  )
  OR
  EXISTS (SELECT 1 FROM "PartnersApp"."Profiles" WHERE id = auth.uid() AND role::text = 'ADMIN')
);

-- 6. Grant necessary permissions (CRUD) to authenticated users
GRANT ALL ON "PartnersApp"."Partners" TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE "PartnersApp"."Partners_Id_seq" TO authenticated;

-- 7. Ensure Profiles are readable by authenticated users (needed for the policy check)
GRANT SELECT ON "PartnersApp"."Profiles" TO authenticated;
