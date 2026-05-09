-- =============================================================================
-- Tambah kolom password_hash di tabel resellers.
-- Dipakai untuk login email + password (PBKDF2 dengan format pbkdf2$iter$salt$hash).
-- Jalankan di Supabase Studio > SQL Editor.
-- =============================================================================

ALTER TABLE public.resellers
  ADD COLUMN IF NOT EXISTS password_hash TEXT;
