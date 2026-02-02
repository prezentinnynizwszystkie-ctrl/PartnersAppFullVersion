
-- 1. Create Profiles Table in PartnersApp schema
-- This table links the secure Supabase "auth.users" (UUID) with our App's "Partners" or "Handlowcy".

CREATE TABLE IF NOT EXISTS "PartnersApp"."Profiles" (
    "id" UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    "email" TEXT,
    "role" TEXT NOT NULL CHECK (role IN ('ADMIN', 'HANDLOWIEC', 'PARTNER', 'KLIENT')),
    
    -- Link to specific entities (Optional, depending on role)
    "partner_id" INTEGER REFERENCES "PartnersApp"."Partners"("Id"),
    "handlowiec_id" INTEGER REFERENCES "PartnersApp"."Handlowcy"("id"),
    
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Security: Enable Row Level Security (RLS)
-- This ensures that access to this table is controlled by policies.
ALTER TABLE "PartnersApp"."Profiles" ENABLE ROW LEVEL SECURITY;

-- 3. Cleanup old policies if they exist (to avoid errors on re-run)
DROP POLICY IF EXISTS "Users can see own profile" ON "PartnersApp"."Profiles";
DROP POLICY IF EXISTS "Authenticated can read profiles" ON "PartnersApp"."Profiles";

-- 4. Create Policies

-- Policy A: A user can always read their OWN profile (to know their role).
CREATE POLICY "Users can see own profile" ON "PartnersApp"."Profiles"
    FOR SELECT 
    USING (auth.uid() = id);

-- Policy B: Authenticated users can read other profiles.
-- (Required for Admin to list users, or Handlowiec to see Partner profiles if needed).
CREATE POLICY "Authenticated can read profiles" ON "PartnersApp"."Profiles"
    FOR SELECT 
    TO authenticated 
    USING (true);

-- Policy C: Only Service Role (or Admin via Supabase UI) can INSERT/UPDATE/DELETE for now.
-- We do not create an INSERT policy for public/anon, because profiles are created by invitations/admin.

-- 5. Grant Permissions
GRANT USAGE ON SCHEMA "PartnersApp" TO authenticated, service_role;
GRANT ALL ON TABLE "PartnersApp"."Profiles" TO service_role, postgres;
GRANT SELECT ON TABLE "PartnersApp"."Profiles" TO authenticated;

-- =================================================================
-- INSTRUKCJA DLA CIEBIE (JAK DODAĆ ADMINA RĘCZNIE PO RAZ PIERWSZY):
-- =================================================================
-- 1. Wejdź w panel Supabase -> Authentication -> Users.
-- 2. Kliknij "Add User" i stwórz konto (np. admin@multibajka.pl).
-- 3. Skopiuj jego "User UID" (wygląda jak: a0eebc99-9c0b...).
-- 4. Uruchom poniższe zapytanie w SQL Editor (podmieniając UID):
--
-- INSERT INTO "PartnersApp"."Profiles" ("id", "email", "role")
-- VALUES ('TWOJE-UID-TUTAJ', 'admin@multibajka.pl', 'ADMIN');
