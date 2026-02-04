
-- Dodanie nowych kolumn do tabeli StoryTypes
ALTER TABLE "PartnersApp"."StoryTypes"
ADD COLUMN IF NOT EXISTS "CoverUrl" TEXT,
ADD COLUMN IF NOT EXISTS "AgeGroup" TEXT REFERENCES "PartnersApp"."AgeGroups"("AgeGroup"),
ADD COLUMN IF NOT EXISTS "StoryDescription" TEXT;

-- Odświeżenie API
NOTIFY pgrst, 'reload config';
