-- =============================================================================
-- Fix: permission denied for table resellers (PostgreSQL 42501)
-- =============================================================================
-- User di DATABASE_URL backend harus punya hak INSERT (dan SELECT/UPDATE/DELETE)
-- pada public.resellers.
--
-- Jalankan sebagai superuser ke database yang sama dengan DATABASE_URL.
-- Ganti nama role di bawah sesuai user di URL (setelah postgresql://, sebelum :).
-- Jika username ada titik (mis. Supabase pooler), pakai double quotes:
--   GRANT ... TO "postgres.xxxxx";
-- =============================================================================

-- Contoh user biasa (ganti postgres jika perlu):
GRANT USAGE ON SCHEMA public TO postgres;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.resellers TO postgres;
GRANT SELECT ON TABLE public.commission_tiers TO postgres;
