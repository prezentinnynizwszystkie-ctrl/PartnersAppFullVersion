
-- 1. Create the Schema 'birthdays' if it doesn't exist
CREATE SCHEMA IF NOT EXISTS "birthdays";

-- 2. Grant Usage Permissions on Schema to public/anon
GRANT USAGE ON SCHEMA "birthdays" TO postgres, anon, authenticated, service_role;

-- 3. Create Table: StoryOrders
-- Note: usage of quote marks "" preserves case sensitivity for column names like "OrderId"
CREATE TABLE IF NOT EXISTS "birthdays"."StoryOrders" (
    "OrderId" SERIAL PRIMARY KEY,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "mail_marketing" TEXT,
    "Story" TEXT,
    "Questionnaire" JSONB,
    "Status" TEXT DEFAULT 'QuestionnaireToApprove',
    "PhotoUrl" TEXT,       -- Optional columns that might be updated later
    "PhotoUrl1" TEXT,
    "RecordUrl" TEXT
);

-- 4. CRITICAL: Disable Row Level Security (RLS)
-- This fixes the 401 Unauthorized error for public inserts
ALTER TABLE "birthdays"."StoryOrders" DISABLE ROW LEVEL SECURITY;

-- 5. Grant Permissions on Table
GRANT ALL ON TABLE "birthdays"."StoryOrders" TO anon, authenticated, service_role;

-- 6. Grant Usage on Sequence (Vital for SERIAL "OrderId" to work)
-- We use ALL SEQUENCES to avoid "relation does not exist" errors if the sequence name varies.
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA "birthdays" TO anon, authenticated, service_role;
