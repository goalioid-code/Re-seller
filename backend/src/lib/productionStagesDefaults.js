/**
 * 8 tahap produksi (selaras order.calsub.id / Modul 4).
 * Dipakai saat DB kosong agar GET /production/:id bisa langsung membuat timeline.
 */
const DEFAULT_PRODUCTION_STAGES = [
  { name: 'Desain', order_index: 1, description: 'Proses desain jersey' },
  { name: 'Layout', order_index: 2, description: 'Persiapan layout untuk printing' },
  { name: 'Print', order_index: 3, description: 'Proses printing' },
  { name: 'Roll Press', order_index: 4, description: 'Pressing kain setelah print' },
  { name: 'Potong Pola', order_index: 5, description: 'Memotong pola sesuai ukuran' },
  { name: 'Konveksi', order_index: 6, description: 'Proses jahit/konveksi' },
  { name: 'QC dan Finishing', order_index: 7, description: 'Quality control dan finishing' },
  { name: 'Selesai', order_index: 8, description: 'Produk siap dikirim' },
];

/**
 * Pastikan baris master ada (idempotent per order_index).
 */
async function ensureDefaultProductionStages(prisma) {
  for (const stage of DEFAULT_PRODUCTION_STAGES) {
    const existing = await prisma.productionStage.findFirst({
      where: { order_index: stage.order_index },
    });
    if (existing) {
      await prisma.productionStage.update({
        where: { id: existing.id },
        data: { name: stage.name, description: stage.description, order_index: stage.order_index },
      });
    } else {
      await prisma.productionStage.create({ data: stage });
    }
  }
}

module.exports = {
  DEFAULT_PRODUCTION_STAGES,
  ensureDefaultProductionStages,
};
