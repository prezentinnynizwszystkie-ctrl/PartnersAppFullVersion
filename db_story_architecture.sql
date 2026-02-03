
-- 1. Tabela: StoryVoices
CREATE TABLE IF NOT EXISTS "PartnersApp"."StoryVoices" (
    "Id" SERIAL PRIMARY KEY,
    "VoiceId" TEXT,
    "Settings" JSONB,
    "Name" TEXT
);

-- 2. Tabela: StoryTypes
CREATE TABLE IF NOT EXISTS "PartnersApp"."StoryTypes" (
    "Id" SERIAL PRIMARY KEY,
    "Code" VARCHAR,
    "VoiceId" SMALLINT REFERENCES "PartnersApp"."StoryVoices"("Id"), -- int2 zgodnie z prośbą
    "Type" TEXT,
    "Settings" TEXT
);

-- 3. Tabela: StorySchemas
CREATE TABLE IF NOT EXISTS "PartnersApp"."StorySchemas" (
    "Id" SERIAL PRIMARY KEY,
    "StoryId" SMALLINT REFERENCES "PartnersApp"."StoryTypes"("Id"), -- int2 zgodnie z prośbą
    "Schema" TEXT
);

-- 4. Tabela: DynamicLines
CREATE TABLE IF NOT EXISTS "PartnersApp"."DynamicLines" (
    "Id" SERIAL PRIMARY KEY,
    "Code" TEXT,
    "Text" TEXT,
    "SchemaId" INTEGER REFERENCES "PartnersApp"."StorySchemas"("Id"),
    "IsCacheable" BOOLEAN DEFAULT FALSE,
    "Relation" TEXT,
    "VoiceId" INTEGER REFERENCES "PartnersApp"."StoryVoices"("Id") DEFAULT NULL
);

-- 5. Konfiguracja uprawnień (Dostęp publiczny/API)
ALTER TABLE "PartnersApp"."StoryVoices" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "PartnersApp"."StoryTypes" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "PartnersApp"."StorySchemas" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "PartnersApp"."DynamicLines" DISABLE ROW LEVEL SECURITY;

GRANT ALL ON "PartnersApp"."StoryVoices" TO anon, authenticated, service_role;
GRANT ALL ON "PartnersApp"."StoryTypes" TO anon, authenticated, service_role;
GRANT ALL ON "PartnersApp"."StorySchemas" TO anon, authenticated, service_role;
GRANT ALL ON "PartnersApp"."DynamicLines" TO anon, authenticated, service_role;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA "PartnersApp" TO anon, authenticated, service_role;

-- 6. Odświeżenie API
NOTIFY pgrst, 'reload config';
