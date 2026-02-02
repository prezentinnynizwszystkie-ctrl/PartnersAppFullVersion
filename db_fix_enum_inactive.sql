
-- Bezpieczne dodanie wartości do ENUMA (działa nawet jeśli wartość już istnieje, Postgres wyrzuciłby błąd bez tego obejścia w bloku transakcji)
ALTER TYPE "PartnersApp"."partner_status" ADD VALUE IF NOT EXISTS 'NIEAKTYWNY';

-- Odświeżenie konfiguracji API
NOTIFY pgrst, 'reload config';
