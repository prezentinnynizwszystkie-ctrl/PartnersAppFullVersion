
-- 1. Uzupełnienie grup wiekowych dla Partnera 'Nibylandia' (3-5 i 6-8)
-- Robimy to bezpiecznie, szukając ID po nazwach
INSERT INTO "PartnersApp"."PartnerAgeGroups" ("partner_id", "age_group_id")
SELECT p."Id", ag."Id"
FROM "PartnersApp"."Partners" p
CROSS JOIN "PartnersApp"."AgeGroups" ag
WHERE p."Slug" = 'nibylandia' 
  AND ag."AgeGroup" IN ('3-5', '6-8')
ON CONFLICT DO NOTHING;

-- 2. Usunięcie starej, "amatorskiej" kolumny JSON
ALTER TABLE "PartnersApp"."Partners" 
DROP COLUMN IF EXISTS "AgeGroups";

-- 3. Odświeżenie cache schema
NOTIFY pgrst, 'reload config';
