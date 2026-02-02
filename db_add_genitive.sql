
-- 1. Dodajemy kolumnę do przechowywania nazwy odmienionej (Dopełniacz: kogo? czego? np. Nibylandii)
ALTER TABLE "PartnersApp"."Partners" 
ADD COLUMN IF NOT EXISTS "PartnerNameGenitive" TEXT;

-- 2. Odświeżamy cache schematu (dla pewności)
NOTIFY pgrst, 'reload config';
