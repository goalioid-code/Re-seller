/**
 * ERP Service - Mock Data Provider
 * 
 * Service ini memberikan mock data dari "ERP Super Apps CALSUB"
 * Di production, akan di-replace dengan real ERP API calls
 * 
 * Toggle: Gunakan env var USE_MOCK_ERP=true untuk mock
 */

const prisma = require('../lib/prisma');

// Mock data untuk testing
const mockOrders = [
  {
    id: 'erp-ord-001',
    po_number: 'PO-ERP-20260401-001',
    customer_name: 'PT Bintang Jaya',
    brand_name: 'BJ Sports',
    order_date: '2026-04-01T00:00:00Z',
    due_date: '2026-04-15T00:00:00Z',
    order_type: 'BASIC',
    status: 'processing',
    items: [
      {
        product_name: 'Jersey BASIC v2',
        quantity: 100,
        unit_price: 75000,
        collar_type: 'Kerah Berdiri',
        pattern: 'Custom Print',
        fabric_type: 'Cotton 100%',
      }
    ],
    subtotal: 7500000,
    discount: 0,
    total_amount: 7500000,
  },
  {
    id: 'erp-ord-002',
    po_number: 'PO-ERP-20260402-002',
    customer_name: 'Sekolah SMA Al-Azhar',
    brand_name: 'SMAA Uniformes',
    order_date: '2026-04-02T00:00:00Z',
    due_date: '2026-04-20T00:00:00Z',
    order_type: 'LIGA',
    status: 'design',
    items: [
      {
        product_name: 'Jersey LIGA Premium',
        quantity: 50,
        unit_price: 150000,
        collar_type: 'Kerah V-Neck',
        pattern: 'Logo Sekolah',
        fabric_type: 'Polyester Dry-fit',
      }
    ],
    subtotal: 7500000,
    discount: 750000,
    total_amount: 6750000,
  },
  {
    id: 'erp-ord-003',
    po_number: 'PO-ERP-20260403-003',
    customer_name: 'Tim Bola Voli Garuda',
    brand_name: 'GarudaVolley',
    order_date: '2026-04-03T00:00:00Z',
    due_date: '2026-04-25T00:00:00Z',
    order_type: 'MAKLOON',
    status: 'layout',
    items: [
      {
        product_name: 'Jersey MAKLOON Custom',
        quantity: 30,
        unit_price: 200000,
        collar_type: 'Kerah Berdiri',
        pattern: 'Custom Full Design',
        fabric_type: 'Mesh Breathable',
      }
    ],
    subtotal: 6000000,
    discount: 0,
    total_amount: 6000000,
  },
];

const mockWorkOrders = [
  {
    id: 'lk-001',
    order_id: 'erp-ord-001',
    lk_number: 'LK-20260405-001',
    status: 'ready_for_review',
    size_run: 'S(5) M(30) L(40) XL(25)',
    back_name: 'BINTANG JAYA',
    back_number: '1-100',
    approved_at: null,
  },
  {
    id: 'lk-002',
    order_id: 'erp-ord-002',
    lk_number: 'LK-20260407-002',
    status: 'approved',
    size_run: 'S(10) M(20) L(15) XL(5)',
    back_name: 'SMAA',
    back_number: '1-50',
    approved_at: '2026-04-08T10:30:00Z',
  },
];

const mockProductionStages = [
  { id: 'stage-1', name: 'Desain', order_index: 1, description: 'Proses desain awal' },
  { id: 'stage-2', name: 'Layout', order_index: 2, description: 'Tata letak desain' },
  { id: 'stage-3', name: 'Print', order_index: 3, description: 'Proses printing' },
  { id: 'stage-4', name: 'Roll Press', order_index: 4, description: 'Pengepresan roll' },
  { id: 'stage-5', name: 'Potong Pola', order_index: 5, description: 'Pemotongan pola' },
  { id: 'stage-6', name: 'Konveksi', order_index: 6, description: 'Proses penjahitan' },
  { id: 'stage-7', name: 'QC dan Finishing', order_index: 7, description: 'Quality control & finishing' },
  { id: 'stage-8', name: 'Selesai', order_index: 8, description: 'Produksi selesai' },
];

const mockProductionStatus = {
  'erp-ord-001': [
    { stage_id: 'stage-1', status: 'completed', started_at: '2026-04-02T08:00:00Z', completed_at: '2026-04-03T16:00:00Z', duration_minutes: 1440 },
    { stage_id: 'stage-2', status: 'completed', started_at: '2026-04-04T08:00:00Z', completed_at: '2026-04-05T12:00:00Z', duration_minutes: 1080 },
    { stage_id: 'stage-3', status: 'in_progress', started_at: '2026-04-06T08:00:00Z', completed_at: null, duration_minutes: null },
    { stage_id: 'stage-4', status: 'pending', started_at: null, completed_at: null, duration_minutes: null },
    { stage_id: 'stage-5', status: 'pending', started_at: null, completed_at: null, duration_minutes: null },
    { stage_id: 'stage-6', status: 'pending', started_at: null, completed_at: null, duration_minutes: null },
    { stage_id: 'stage-7', status: 'pending', started_at: null, completed_at: null, duration_minutes: null },
    { stage_id: 'stage-8', status: 'pending', started_at: null, completed_at: null, duration_minutes: null },
  ],
  'erp-ord-002': [
    { stage_id: 'stage-1', status: 'completed', started_at: '2026-04-03T08:00:00Z', completed_at: '2026-04-04T16:00:00Z', duration_minutes: 1440 },
    { stage_id: 'stage-2', status: 'completed', started_at: '2026-04-05T08:00:00Z', completed_at: '2026-04-06T14:00:00Z', duration_minutes: 1080 },
    { stage_id: 'stage-3', status: 'completed', started_at: '2026-04-07T08:00:00Z', completed_at: '2026-04-08T18:00:00Z', duration_minutes: 1320 },
    { stage_id: 'stage-4', status: 'completed', started_at: '2026-04-09T08:00:00Z', completed_at: '2026-04-10T16:00:00Z', duration_minutes: 1440 },
    { stage_id: 'stage-5', status: 'in_progress', started_at: '2026-04-11T08:00:00Z', completed_at: null, duration_minutes: null },
    { stage_id: 'stage-6', status: 'pending', started_at: null, completed_at: null, duration_minutes: null },
    { stage_id: 'stage-7', status: 'pending', started_at: null, completed_at: null, duration_minutes: null },
    { stage_id: 'stage-8', status: 'pending', started_at: null, completed_at: null, duration_minutes: null },
  ],
  'erp-ord-003': [
    { stage_id: 'stage-1', status: 'completed', started_at: '2026-04-04T08:00:00Z', completed_at: '2026-04-05T14:00:00Z', duration_minutes: 1080 },
    { stage_id: 'stage-2', status: 'in_progress', started_at: '2026-04-06T08:00:00Z', completed_at: null, duration_minutes: null },
    { stage_id: 'stage-3', status: 'pending', started_at: null, completed_at: null, duration_minutes: null },
    { stage_id: 'stage-4', status: 'pending', started_at: null, completed_at: null, duration_minutes: null },
    { stage_id: 'stage-5', status: 'pending', started_at: null, completed_at: null, duration_minutes: null },
    { stage_id: 'stage-6', status: 'pending', started_at: null, completed_at: null, duration_minutes: null },
    { stage_id: 'stage-7', status: 'pending', started_at: null, completed_at: null, duration_minutes: null },
    { stage_id: 'stage-8', status: 'pending', started_at: null, completed_at: null, duration_minutes: null },
  ],
};

/**
 * Get orders dari ERP
 * @param {Object} options - Filter options (customer_name, status, etc)
 * @returns {Promise<Array>}
 */
const getOrdersFromERP = async (options = {}) => {
  try {
    if (process.env.USE_MOCK_ERP !== 'true' && process.env.NODE_ENV === 'production') {
      // Production: call real ERP API
      // TODO: Implement real ERP API call
      throw new Error('Real ERP integration not implemented yet');
    }

    // Development/Test: return mock data
    let orders = [...mockOrders];

    // Filter jika ada options
    if (options.status) {
      orders = orders.filter(o => o.status === options.status);
    }
    if (options.customer_name) {
      orders = orders.filter(o => o.customer_name.includes(options.customer_name));
    }

    return orders;
  } catch (error) {
    console.error('[ERP Service] Get orders error:', error);
    throw error;
  }
};

/**
 * Get work orders (Lembar Kerja) dari ERP
 * @returns {Promise<Array>}
 */
const getWorkOrdersFromERP = async () => {
  try {
    if (process.env.USE_MOCK_ERP !== 'true' && process.env.NODE_ENV === 'production') {
      // Production: call real ERP API
      throw new Error('Real ERP integration not implemented yet');
    }

    // Development/Test: return mock data
    return mockWorkOrders;
  } catch (error) {
    console.error('[ERP Service] Get work orders error:', error);
    throw error;
  }
};

/**
 * Get production status dari ERP
 * @param {String} orderId - Order ID
 * @returns {Promise<Array>}
 */
const getProductionStatusFromERP = async (orderId) => {
  try {
    if (process.env.USE_MOCK_ERP !== 'true' && process.env.NODE_ENV === 'production') {
      // Production: call real ERP API
      throw new Error('Real ERP integration not implemented yet');
    }

    // Development/Test: return mock data
    const status = mockProductionStatus[orderId] || [];
    return status;
  } catch (error) {
    console.error('[ERP Service] Get production status error:', error);
    throw error;
  }
};

/**
 * Get production stages (8 tahapan)
 * @returns {Promise<Array>}
 */
const getProductionStagesFromERP = async () => {
  try {
    if (process.env.USE_MOCK_ERP !== 'true' && process.env.NODE_ENV === 'production') {
      // Production: call real ERP API
      throw new Error('Real ERP integration not implemented yet');
    }

    // Development/Test: return mock data
    return mockProductionStages;
  } catch (error) {
    console.error('[ERP Service] Get production stages error:', error);
    throw error;
  }
};

module.exports = {
  getOrdersFromERP,
  getWorkOrdersFromERP,
  getProductionStatusFromERP,
  getProductionStagesFromERP,
};
