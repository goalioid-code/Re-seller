/**
 * ERP Sync Controller
 * Endpoints untuk sync data dari ERP ke aplikasi Reseller
 */

const erpService = require('../services/erpService');
const prisma = require('../lib/prisma');

/**
 * GET /erp-sync/orders
 * Dapatkan daftar orders dari ERP
 */
const getERPOrders = async (req, res) => {
  try {
    const { status, customer_name } = req.query;

    const orders = await erpService.getOrdersFromERP({
      status,
      customer_name,
    });

    return res.status(200).json({
      success: true,
      source: process.env.NODE_ENV === 'development' ? 'mock' : 'production',
      orders,
      total: orders.length,
    });
  } catch (error) {
    console.error('[ERP Sync] Get orders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data orders dari ERP.',
    });
  }
};

/**
 * GET /erp-sync/work-orders
 * Dapatkan daftar lembar kerja (work orders) dari ERP
 */
const getERPWorkOrders = async (req, res) => {
  try {
    const workOrders = await erpService.getWorkOrdersFromERP();

    return res.status(200).json({
      success: true,
      source: process.env.NODE_ENV === 'development' ? 'mock' : 'production',
      work_orders: workOrders,
      total: workOrders.length,
    });
  } catch (error) {
    console.error('[ERP Sync] Get work orders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data work orders dari ERP.',
    });
  }
};

/**
 * GET /erp-sync/production-status/:order_id
 * Dapatkan status produksi untuk order tertentu
 */
const getERPProductionStatus = async (req, res) => {
  try {
    const { order_id } = req.params;

    if (!order_id) {
      return res.status(400).json({
        success: false,
        message: 'Order ID harus diisi.',
      });
    }

    const productionStatus = await erpService.getProductionStatusFromERP(order_id);
    const stages = await erpService.getProductionStagesFromERP();

    // Format response dengan stage info
    const timeline = productionStatus.map((ps) => {
      const stage = stages.find(s => s.id === ps.stage_id);
      return {
        stage: stage,
        status: ps.status,
        started_at: ps.started_at,
        completed_at: ps.completed_at,
        duration_minutes: ps.duration_minutes,
      };
    });

    // Get current stage
    const currentStage = timeline.find(t => t.status !== 'completed') || timeline[timeline.length - 1];

    return res.status(200).json({
      success: true,
      source: process.env.NODE_ENV === 'development' ? 'mock' : 'production',
      production: {
        order_id,
        current_stage: currentStage,
        timeline,
        last_updated: new Date(),
      },
    });
  } catch (error) {
    console.error('[ERP Sync] Get production status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil status produksi dari ERP.',
    });
  }
};

/**
 * GET /erp-sync/production-stages
 * Dapatkan daftar semua tahapan produksi
 */
const getERPProductionStages = async (req, res) => {
  try {
    const stages = await erpService.getProductionStagesFromERP();

    return res.status(200).json({
      success: true,
      source: process.env.NODE_ENV === 'development' ? 'mock' : 'production',
      stages,
      total: stages.length,
    });
  } catch (error) {
    console.error('[ERP Sync] Get production stages error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil tahapan produksi dari ERP.',
    });
  }
};

/**
 * POST /erp-sync/sync-to-db
 * Sinkronisasi data ERP ke database lokal (untuk testing)
 * Development only - untuk populate database dengan mock data
 */
const syncERPToDatabase = async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({
        success: false,
        message: 'Endpoint ini hanya tersedia di mode development.',
      });
    }

    const { type = 'all' } = req.query; // all, stages

    let synced = {};

    // Sync production stages (tahapan produksi)
    if (type === 'all' || type === 'stages') {
      const stages = await erpService.getProductionStagesFromERP();
      
      for (const stage of stages) {
        await prisma.productionStage.upsert({
          where: { id: stage.id },
          update: {
            name: stage.name,
            description: stage.description,
          },
          create: {
            id: stage.id,
            name: stage.name,
            order_index: stage.order_index,
            description: stage.description,
          },
        });
      }

      synced.production_stages = stages.length;
    }

    return res.status(200).json({
      success: true,
      message: 'Data ERP berhasil disinkronisasi ke database.',
      synced,
    });
  } catch (error) {
    console.error('[ERP Sync] Sync to DB error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat sinkronisasi data.',
    });
  }
};

module.exports = {
  getERPOrders,
  getERPWorkOrders,
  getERPProductionStatus,
  getERPProductionStages,
  syncERPToDatabase,
};
