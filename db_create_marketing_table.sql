
-- 1. Create Table in PartnersApp schema
CREATE TABLE IF NOT EXISTS "PartnersApp"."MarketingPermissions" (
    "Id" SERIAL PRIMARY KEY,
    "Name" TEXT,
    "Phone" TEXT,
    "Mail" TEXT,
    "MarketingAgree" BOOLEAN DEFAULT FALSE,
    "RegulationsAgree" BOOLEAN DEFAULT FALSE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Disable Row Level Security (RLS) to allow public inserts
ALTER TABLE "PartnersApp"."MarketingPermissions" DISABLE ROW LEVEL SECURITY;

-- 3. Grant Permissions
GRANT ALL ON "PartnersApp"."MarketingPermissions" TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE "PartnersApp"."MarketingPermissions_Id_seq" TO anon, authenticated, service_role;
