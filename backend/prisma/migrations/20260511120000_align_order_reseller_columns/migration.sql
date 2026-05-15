-- Migrasi no-op: perbaikan 500 POST /orders dilakukan lewat `select` eksplisit di `orderController`
-- (hindari RETURNING kolom yang belum ada di DB).
-- Jika nanti ingin menyelaraskan DB dengan schema (internal_notes, admin_notes, password_hash),
-- jalankan ALTER sebagai owner tabel lalu buat migrasi terpisah.

SELECT 1;
