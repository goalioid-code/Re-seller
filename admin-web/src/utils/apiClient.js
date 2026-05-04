export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Admin Web API Utility
 */
class AdminApiClient {
  constructor() {
    this.baseURL = API_URL;
  }

  /**
   * Get JWT token from localStorage
   */
  getToken() {
    return localStorage.getItem('adminToken');
  }

  /**
   * Make HTTP request with automatic token injection
   */
  async request(endpoint, options = {}) {
    try {
      const token = this.getToken();
      
      const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || 'API request failed');
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`[Admin API] Error at ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * GET request (options.params → query string)
   */
  get(endpoint, options = {}) {
    let path = endpoint;
    const params = options.params;
    if (params && typeof params === 'object' && Object.keys(params).length > 0) {
      const q = new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
      ).toString();
      if (q) path += (path.includes('?') ? '&' : '?') + q;
    }
    const { params: _p, ...rest } = options;
    return this.request(path, {
      ...rest,
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  post(endpoint, body = {}, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * PUT request
   */
  put(endpoint, body = {}, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  /**
   * PATCH request
   */
  patch(endpoint, body = {}, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  /**
   * DELETE request
   */
  delete(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }
}

export const adminApiClient = new AdminApiClient();

// Reseller API (Admin)
export const adminResellerAPI = {
  getPending: () => adminApiClient.get('/admin/resellers/pending'),
  getResellers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return adminApiClient.get(`/admin/resellers${query ? '?' + query : ''}`);
  },
  getResellerDetail: (resellerId) => adminApiClient.get(`/admin/resellers/${resellerId}`),
  approveReseller: (resellerId) => adminApiClient.put(`/admin/resellers/${resellerId}/approve`, {}),
  rejectReseller: (resellerId, reason) => adminApiClient.put(`/admin/resellers/${resellerId}/reject`, { reason }),
  deactivateReseller: (resellerId) => adminApiClient.put(`/admin/resellers/${resellerId}/deactivate`, {}),
  reactivateReseller: (resellerId) => adminApiClient.put(`/admin/resellers/${resellerId}/reactivate`, {}),
  deleteReseller: (resellerId) => adminApiClient.delete(`/admin/resellers/${resellerId}`),
  setResellerTier: (resellerId, tierId) => adminApiClient.put(`/admin/resellers/${resellerId}/tier`, { tier_id: tierId }),
  getPerformance: (resellerId) => adminApiClient.get(`/admin/resellers/${resellerId}/performance`),
};

// Order API (Admin)
export const adminOrderAPI = {
  getOrders: (params = {}) => adminApiClient.get('/admin/orders', { params }),
  getOrderDetail: (orderId) => adminApiClient.get(`/admin/orders/${orderId}`),
  patchInternalNotes: (orderId, internal_notes) =>
    adminApiClient.patch(`/admin/orders/${orderId}/internal-notes`, { internal_notes }),
};

// Payment & withdrawals (Admin)
export const adminPaymentAPI = {
  getPendingPayments: () => adminApiClient.get('/admin/payments/pending'),
  confirmPayment: (paymentId) => adminApiClient.post(`/admin/payments/${paymentId}/confirm`, {}),
  rejectPayment: (paymentId, reason) => adminApiClient.post(`/admin/payments/${paymentId}/reject`, { reason }),
  getWithdrawals: (params = {}) => adminApiClient.get('/admin/withdrawals', { params }),
  approveWithdrawal: (withdrawalId) => adminApiClient.post(`/admin/withdrawals/${withdrawalId}/approve`, {}),
  rejectWithdrawal: (withdrawalId, reason) =>
    adminApiClient.post(`/admin/withdrawals/${withdrawalId}/reject`, { reason }),
};

// Reports API (Admin)
export const adminReportsAPI = {
  getDashboard: () => adminApiClient.get('/admin/dashboard'),
  getOrderReport: (params = {}) => adminApiClient.get('/admin/reports/orders', { params }),
  getResellerPerformance: (params = {}) => adminApiClient.get('/admin/reports/resellers', { params }),
  getFinancialReport: (params = {}) => adminApiClient.get('/admin/reports/financial', { params }),
};

export const adminSettingsAPI = {
  get: () => adminApiClient.get('/admin/settings'),
  patch: (body) => adminApiClient.patch('/admin/settings', body),
};

export const adminTiersAPI = {
  list: () => adminApiClient.get('/admin/tiers'),
  update: (id, body) => adminApiClient.patch(`/admin/tiers/${id}`, body),
};

export const adminRewardsAPI = {
  list: () => adminApiClient.get('/admin/rewards'),
  create: (body) => adminApiClient.post('/admin/rewards', body),
  update: (id, body) => adminApiClient.patch(`/admin/rewards/${id}`, body),
  delete: (id) => adminApiClient.delete(`/admin/rewards/${id}`),
};

export const adminRedemptionsAPI = {
  list: (params = {}) => adminApiClient.get('/admin/reward-redemptions', { params }),
  approve: (id) => adminApiClient.post(`/admin/reward-redemptions/${id}/approve`, {}),
  reject: (id, reason) => adminApiClient.post(`/admin/reward-redemptions/${id}/reject`, { reason }),
};

export const adminProductionAPI = {
  listStages: () => adminApiClient.get('/admin/production/stages'),
  updateStageStatus: (orderId, stageId, payload) =>
    adminApiClient.patch(`/admin/production/${orderId}/stages/${stageId}`, payload),
};

export default adminApiClient;
