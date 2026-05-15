-- Master 8 tahapan produksi (selaras order.calsub.id / Modul 4).
-- Idempotent: hanya mengisi order_index yang belum ada (seed / bootstrap runtime tetap kompatibel).

INSERT INTO "production_stages" ("id", "name", "order_index", "description", "created_at")
SELECT gen_random_uuid()::text, 'Desain', 1, 'Proses desain jersey', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "production_stages" WHERE "order_index" = 1);

INSERT INTO "production_stages" ("id", "name", "order_index", "description", "created_at")
SELECT gen_random_uuid()::text, 'Layout', 2, 'Persiapan layout untuk printing', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "production_stages" WHERE "order_index" = 2);

INSERT INTO "production_stages" ("id", "name", "order_index", "description", "created_at")
SELECT gen_random_uuid()::text, 'Print', 3, 'Proses printing', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "production_stages" WHERE "order_index" = 3);

INSERT INTO "production_stages" ("id", "name", "order_index", "description", "created_at")
SELECT gen_random_uuid()::text, 'Roll Press', 4, 'Pressing kain setelah print', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "production_stages" WHERE "order_index" = 4);

INSERT INTO "production_stages" ("id", "name", "order_index", "description", "created_at")
SELECT gen_random_uuid()::text, 'Potong Pola', 5, 'Memotong pola sesuai ukuran', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "production_stages" WHERE "order_index" = 5);

INSERT INTO "production_stages" ("id", "name", "order_index", "description", "created_at")
SELECT gen_random_uuid()::text, 'Konveksi', 6, 'Proses jahit/konveksi', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "production_stages" WHERE "order_index" = 6);

INSERT INTO "production_stages" ("id", "name", "order_index", "description", "created_at")
SELECT gen_random_uuid()::text, 'QC dan Finishing', 7, 'Quality control dan finishing', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "production_stages" WHERE "order_index" = 7);

INSERT INTO "production_stages" ("id", "name", "order_index", "description", "created_at")
SELECT gen_random_uuid()::text, 'Selesai', 8, 'Produk siap dikirim', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "production_stages" WHERE "order_index" = 8);
