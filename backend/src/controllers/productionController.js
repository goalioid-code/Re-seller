const prisma = require('../lib/prisma');

/**
 * GET /production/:order_id
 * Mendapatkan status produksi per order dengan semua tahapan
 */
const getProductionStatus = async (req, res) => {
  try {
    const { order_id } = req.params;
    const resellerId = req.reseller.id;

    // Verify order belongs to reseller
    const order = await prisma.order.findUnique({
      where: { id: order_id },
    });

    if (!order || order.reseller_id !== resellerId) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak.',
      });
    }

    // Get all production statuses with stage info
    const productionStatuses = await prisma.productionStatus.findMany({
      where: { order_id },
      include: { stage: true },
      orderBy: { stage: { order_index: 'asc' } },
    });

    // Format response
    const timeline = productionStatuses.map((ps) => ({
      id: ps.id,
      stage: {
        id: ps.stage.id,
        name: ps.stage.name,
        order_index: ps.stage.order_index,
        description: ps.stage.description,
      },
      status: ps.status, // pending | in_progress | completed
      started_at: ps.started_at,
      completed_at: ps.completed_at,
      duration_minutes: ps.duration_minutes,
      notes: ps.notes,
      updated_at: ps.updated_at,
    }));

    // Get current stage (first incomplete or last completed)
    const currentStage = timeline.find((t) => t.status !== 'completed') || timeline[timeline.length - 1];

    return res.status(200).json({
      success: true,
      production: {
        order_id,
        current_stage: currentStage,
        timeline,
        last_updated: new Date(),
      },
    });
  } catch (error) {
    console.error('[Production] Get status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil status produksi.',
    });
  }
};

/**
 * GET /work-orders/:order_id
 * Mendapatkan lembar kerja (work order) untuk order
 */
const getWorkOrder = async (req, res) => {
  try {
    const { order_id } = req.params;
    const resellerId = req.reseller.id;

    // Verify order belongs to reseller
    const order = await prisma.order.findUnique({
      where: { id: order_id },
    });

    if (!order || order.reseller_id !== resellerId) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak.',
      });
    }

    const workOrder = await prisma.workOrder.findUnique({
      where: { order_id },
    });

    if (!workOrder) {
      return res.status(404).json({
        success: false,
        message: 'Lembar kerja tidak ditemukan.',
      });
    }

    return res.status(200).json({
      success: true,
      work_order: workOrder,
    });
  } catch (error) {
    console.error('[Production] Get work order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil lembar kerja.',
    });
  }
};

/**
 * PUT /work-orders/:order_id/approve
 * Reseller approve/confirm lembar kerja
 */
const approveWorkOrder = async (req, res) => {
  try {
    const { order_id } = req.params;
    const resellerId = req.reseller.id;

    // Verify order belongs to reseller
    const order = await prisma.order.findUnique({
      where: { id: order_id },
    });

    if (!order || order.reseller_id !== resellerId) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak.',
      });
    }

    const workOrder = await prisma.workOrder.findUnique({
      where: { order_id },
    });

    if (!workOrder) {
      return res.status(404).json({
        success: false,
        message: 'Lembar kerja tidak ditemukan.',
      });
    }

    // Update work order status
    const updatedWorkOrder = await prisma.workOrder.update({
      where: { order_id },
      data: {
        status: 'approved',
        approved_at: new Date(),
        approved_by_reseller: true,
      },
    });

    // Update order LK approved flag
    await prisma.order.update({
      where: { id: order_id },
      data: { lk_approved: true, status: 'production' },
    });

    return res.status(200).json({
      success: true,
      message: 'Lembar kerja berhasil diapprove.',
      work_order: updatedWorkOrder,
    });
  } catch (error) {
    console.error('[Production] Approve work order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat meng-approve lembar kerja.',
    });
  }
};

/**
 * GET /orders/:order_id/latest-production
 * Mendapatkan status produksi terbaru (untuk notifikasi push)
 */
const getLatestProductionUpdate = async (req, res) => {
  try {
    const { order_id } = req.params;
    const resellerId = req.reseller.id;

    // Verify order belongs to reseller
    const order = await prisma.order.findUnique({
      where: { id: order_id },
    });

    if (!order || order.reseller_id !== resellerId) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak.',
      });
    }

    const latestUpdate = await prisma.productionStatus.findFirst({
      where: { order_id },
      include: { stage: true },
      orderBy: { updated_at: 'desc' },
    });

    if (!latestUpdate) {
      return res.status(404).json({
        success: false,
        message: 'Belum ada update produksi.',
      });
    }

    return res.status(200).json({
      success: true,
      update: {
        stage: latestUpdate.stage.name,
        status: latestUpdate.status,
        updated_at: latestUpdate.updated_at,
        duration: latestUpdate.duration_minutes,
      },
    });
  } catch (error) {
    console.error('[Production] Get latest update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil update produksi.',
    });
  }
};

module.exports = {
  getProductionStatus,
  getWorkOrder,
  approveWorkOrder,
  getLatestProductionUpdate,
};
