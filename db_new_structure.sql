
-- 1. Create AgeGroups Table
CREATE TABLE IF NOT EXISTS "PartnersApp"."AgeGroups" (
    "Id" SERIAL PRIMARY KEY,
    "AgeGroup" TEXT UNIQUE NOT NULL
);

-- Insert fixed Age Groups
INSERT INTO "PartnersApp"."AgeGroups" ("AgeGroup") VALUES 
('3-5'), 
('6-8'), 
('9-12'), 
('13+')
ON CONFLICT ("AgeGroup") DO NOTHING;

-- 2. Create Stories Table
CREATE TABLE IF NOT EXISTS "PartnersApp"."Stories" (
    "Id" SERIAL PRIMARY KEY,
    "StoryTitle" TEXT NOT NULL,
    "StoryHeroUrl" TEXT,
    "StoryDescription" TEXT,
    "AgeGroup" TEXT REFERENCES "PartnersApp"."AgeGroups"("AgeGroup"),
    "CoverUrl" TEXT -- Adding cover URL for display
);

-- 3. Update Partners Table to include AgeGroups selection
ALTER TABLE "PartnersApp"."Partners" ADD COLUMN IF NOT EXISTS "AgeGroups" JSONB;

-- 4. Disable RLS for new tables to ensure public read access
ALTER TABLE "PartnersApp"."AgeGroups" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "PartnersApp"."Stories" DISABLE ROW LEVEL SECURITY;

-- 5. Grant Permissions
GRANT SELECT ON ALL TABLES IN SCHEMA "PartnersApp" TO anon, authenticated, service_role;

-- 6. SEED DATA (Mock Data for demonstration)

-- Update existing partners to have ALL age groups by default
UPDATE "PartnersApp"."Partners"
SET "AgeGroups" = '["3-5", "6-8", "9-12", "13+"]'::jsonb
WHERE "AgeGroups" IS NULL;

-- Insert Mock Stories
INSERT INTO "PartnersApp"."Stories" ("StoryTitle", "AgeGroup", "StoryDescription", "CoverUrl") VALUES
-- 3-5
('Puchate Obłoczki', '3-5', 'Podróż po niebie na grzbiecie najmilszej chmurki świata.', 'https://images.unsplash.com/photo-1504151932400-72d4384f04b3?q=80&w=1958&auto=format&fit=crop'),
('Leśna Drzemka', '3-5', 'O tym jak zwierzątka szykują się do snu w lesie.', 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=2070&auto=format&fit=crop'),
-- 6-8
('Misja na Marsa', '6-8', 'Kosmiczna ekspedycja, w której bohater ratuje bazę.', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop'),
('Skarb Piratów', '6-8', 'Poszukiwania legendarnej skrzyni na rajskiej wyspie.', 'https://images.unsplash.com/photo-1551009175-15bdf9dcb580?q=80&w=2070&auto=format&fit=crop'),
-- 9-12
('Akademia Magii', '9-12', 'Dzień pełen zaklęć i pojedynków na magicznej uczelni.', 'https://images.unsplash.com/photo-1514894780037-2593d84a7ab5?q=80&w=2070&auto=format&fit=crop'),
('Cyber-Świat', '9-12', 'Przygoda wewnątrz gry pełnej robotów i zagadek.', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=2070&auto=format&fit=crop'),
-- 13+
('Ostatni Strażnik', '13+', 'Epicka saga o obronie starożytnego miasta przed cieniem.', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2068&auto=format&fit=crop'),
('Kod Nieśmiertelności', '13+', 'Futurystyczny thriller o wyborach, które zmieniają ludzkość.', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070&auto=format&fit=crop')
ON CONFLICT DO NOTHING;
