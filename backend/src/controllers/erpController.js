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

/**
 * POST /erp-sync/sync-production
 * Sinkronisasi status produksi terbaru dari ERP ke DB lokal (Supabase/Postgres).
 * - Cocokkan data ERP ke local order via po_number.
 * - Upsert timeline status per stage.
 */
const syncRealtimeProductionFromERP = async (req, res) => {
  try {
    const erpOrders = await erpService.getOrdersFromERP();
    const erpStages = await erpService.getProductionStagesFromERP();

    // Pastikan master stage tersedia
    for (const stage of erpStages) {
      await prisma.productionStage.upsert({
        where: { id: stage.id },
        update: {
          name: stage.name,
          order_index: stage.order_index,
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

    const localOrders = await prisma.order.findMany({
      select: { id: true, po_number: true },
    });
    const localByPo = new Map(localOrders.map((o) => [o.po_number, o]));

    let syncedOrders = 0;
    let syncedStatuses = 0;
    let skipped = 0;

    for (const erpOrder of erpOrders) {
      const localOrder = localByPo.get(erpOrder.po_number);
      if (!localOrder) {
        skipped += 1;
        continue;
      }

      const erpTimeline = await erpService.getProductionStatusFromERP(erpOrder.id);
      for (const row of erpTimeline) {
        const existing = await prisma.productionStatus.findFirst({
          where: {
            order_id: localOrder.id,
            stage_id: row.stage_id,
          },
          select: { id: true },
        });
        if (existing) {
          await prisma.productionStatus.update({
            where: { id: existing.id },
            data: {
              status: row.status,
              started_at: row.started_at ? new Date(row.started_at) : null,
              completed_at: row.completed_at ? new Date(row.completed_at) : null,
              duration_minutes: row.duration_minutes ?? null,
            },
          });
        } else {
          await prisma.productionStatus.create({
            data: {
              order_id: localOrder.id,
              stage_id: row.stage_id,
              status: row.status,
              started_at: row.started_at ? new Date(row.started_at) : null,
              completed_at: row.completed_at ? new Date(row.completed_at) : null,
              duration_minutes: row.duration_minutes ?? null,
            },
          });
        }
        syncedStatuses += 1;
      }
      syncedOrders += 1;
    }

    return res.status(200).json({
      success: true,
      message: 'Sinkronisasi realtime produksi selesai.',
      summary: {
        synced_orders: syncedOrders,
        synced_statuses: syncedStatuses,
        skipped_orders_without_local_po_match: skipped,
      },
    });
  } catch (error) {
    console.error('[ERP Sync] Realtime production sync error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat sinkronisasi realtime produksi.',
    });
  }
};

module.exports = {
  getERPOrders,
  getERPWorkOrders,
  getERPProductionStatus,
  getERPProductionStages,
  syncERPToDatabase,
  syncRealtimeProductionFromERP,
};
