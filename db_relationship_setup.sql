
-- 1. Utworzenie tabeli łączącej (Many-to-Many)
CREATE TABLE IF NOT EXISTS "PartnersApp"."PartnerAgeGroups" (
    "id" SERIAL PRIMARY KEY,
    "partner_id" INTEGER REFERENCES "PartnersApp"."Partners"("Id") ON DELETE CASCADE,
    "age_group_id" INTEGER REFERENCES "PartnersApp"."AgeGroups"("Id") ON DELETE CASCADE,
    -- Zabezpieczenie przed dublami (taka sama para nie może wystąpić dwa razy)
    CONSTRAINT "unique_partner_age_group" UNIQUE ("partner_id", "age_group_id")
);

-- 2. Wyłączenie RLS (dla ułatwienia dostępu przez API w tej fazie)
ALTER TABLE "PartnersApp"."PartnerAgeGroups" DISABLE ROW LEVEL SECURITY;

-- 3. Nadanie uprawnień
GRANT ALL ON "PartnersApp"."PartnerAgeGroups" TO authenticated, service_role, anon;
GRANT USAGE, SELECT ON SEQUENCE "PartnersApp"."PartnerAgeGroups_id_seq" TO authenticated, service_role, anon;

-- 4. Odświeżenie cache schema
NOTIFY pgrst, 'reload config';
