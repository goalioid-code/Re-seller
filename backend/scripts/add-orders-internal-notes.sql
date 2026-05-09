-- =============================================================================
-- Fix: column orders.internal_notes does not exist (Prisma P2022)
-- Schema Prisma sudah include kolom internal_notes, tapi DB Supabase di VPS
-- belum di-migrate. Jalankan SQL ini di Supabase Studio > SQL Editor.
-- =============================================================================

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- Pastikan migrasi tracking Prisma tetap konsisten (opsional, hanya untuk dokumentasi).
-- Tidak perlu insert ke _prisma_migrations karena ini perubahan ad-hoc.
