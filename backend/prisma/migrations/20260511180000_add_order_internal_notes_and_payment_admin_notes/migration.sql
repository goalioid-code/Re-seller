-- No-op: user `DATABASE_URL` sering bukan OWNER tabel → ALTER gagal (42501).
-- Tambah kolom jalankan manual sebagai owner Postgres / service role Supabase:
--   ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "internal_notes" TEXT;
--   ALTER TABLE "order_payments" ADD COLUMN IF NOT EXISTS "admin_notes" TEXT;
-- Setelah kolom ada, bisa aktifkan lagi `internal_notes` di select admin (adminOpsController).

SELECT 1;
