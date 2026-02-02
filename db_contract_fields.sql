
-- 1. Add Contract specific columns to Partners table
ALTER TABLE "PartnersApp"."Partners" 
ADD COLUMN IF NOT EXISTS "ContractStatus" TEXT, -- 'PODPISANA' or 'BRAK'
ADD COLUMN IF NOT EXISTS "ContractSignedDate" TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS "ContractDuration" INTEGER, -- months
ADD COLUMN IF NOT EXISTS "ContractEndDate" TIMESTAMP WITH TIME ZONE;

-- 2. Reload PostgREST schema cache
NOTIFY pgrst, 'reload config';
