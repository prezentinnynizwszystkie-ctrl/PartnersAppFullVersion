
# BAZA WIEDZY - STRUKTURA BAZY DANYCH (SUPABASE)
Schemat: "PartnersApp"

## 1. Tabela: Partners
Główna tabela przechowująca dane obiektów/klientów B2B.

| Kolumna w Bazie (SQL) | Typ Danych | Opis / Uwagi | Odpowiednik w JS (SalesPanel) |
|-----------------------|------------|--------------|-------------------------------|
| Id                    | SERIAL (PK)| ID Partnera  | `partner.Id` |
| PartnerName           | TEXT       | Nazwa firmy  | `formData.name` |
| PartnerNameGenitive   | TEXT       | Dopełniacz   | `formData.genitive` |
| Slug                  | TEXT       | Unikalny URL | `formData.slug` |
| Miasto                | TEXT       | Lokalizacja  | `formData.city` |
| contact_email         | TEXT       | Email        | `formData.email` |
| contact_number        | TEXT       | Telefon      | `formData.phone` |
| Status                | ENUM       | 'AKTYWNY', 'NIEAKTYWNY', 'BRAK' | `formData.status` |
| Model                 | ENUM       | 'PAKIET', 'PROWIZJA', 'BRAK' | `formData.model` |
| SprzedazIlosc         | NUMERIC    | Ilość kodów  | `formData.packetAmount` |
| SellPrice             | NUMERIC    | Cena (Prow.) | `formData.sellPrice` |
| LogoUrl               | TEXT       | URL Logo     | `logoUrl` |
| UmowaUrl              | TEXT       | URL PDF      | `contractUrl` |
| PartnerType           | TEXT       | Typ obiektu  | `formData.type` |
| IdOpiekuna            | INTEGER    | FK Handlowiec| `salespersonId` |

**Powiązania:**
- Relacja 1:N z `Handlowcy` (przez `IdOpiekuna`)
- Relacja N:N z `AgeGroups` (przez tabelę `PartnerAgeGroups`)

## 2. Tabela: Handlowcy
Lista pracowników sprzedaży.

| Kolumna | Typ | Uwagi |
|---------|-----|-------|
| id      | SERIAL | PK |
| imie    | TEXT | |
| nazwisko| TEXT | |
| email   | TEXT | Używany do parowania z Auth |
| telefon | TEXT | |

## 3. Tabela: AgeGroups
Słownik grup wiekowych (3-5, 6-8, 9-12, 13+).

| Kolumna  | Typ |
|----------|-----|
| Id       | SERIAL |
| AgeGroup | TEXT |

## 4. Tabela: PartnerAgeGroups
Tabela łącząca (Many-to-Many) Partnerów z Grupami Wiekowymi.

| Kolumna      | Typ |
|--------------|-----|
| id           | SERIAL |
| partner_id   | INT (FK -> Partners.Id) |
| age_group_id | INT (FK -> AgeGroups.Id) |

## 5. Tabela: Profiles
Tabela systemowa łącząca Supabase Auth z rolami w aplikacji.

| Kolumna       | Typ |
|---------------|-----|
| id            | UUID (FK -> auth.users) |
| email         | TEXT |
| role          | ENUM ('ADMIN', 'HANDLOWIEC', 'PARTNER', 'KLIENT') |
| partner_id    | INT |
| handlowiec_id | INT |

## Ważne Uwagi Techniczne
1. **Case Sensitivity:** PostgreSQL w Supabase używa cudzysłowów dla zachowania wielkości liter (np. "PartnerName"). Jeśli kolumna została utworzona jako `contact_number` (małe litery), należy się do niej odwoływać jako `contact_number`.
2. **RLS:** Row Level Security jest włączone na większości tabel. Handlowiec może edytować tylko "swoich" partnerów (gdzie `IdOpiekuna` == jego ID).
