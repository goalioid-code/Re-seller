const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
   * GET request
   */
  get(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
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
  getResellers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return adminApiClient.get(`/admin/resellers${query ? '?' + query : ''}`);
  },
  getResellerDetail: (resellerId) => adminApiClient.get(`/admin/resellers/${resellerId}`),
  approveReseller: (resellerId) => adminApiClient.post(`/admin/resellers/${resellerId}/approve`),
  rejectReseller: (resellerId, reason) => adminApiClient.post(`/admin/resellers/${resellerId}/reject`, { reason }),
  setResellerTier: (resellerId, tierId) => adminApiClient.put(`/admin/resellers/${resellerId}/tier`, { tier_id: tierId }),
};

// Order API (Admin)
export const adminOrderAPI = {
  getOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return adminApiClient.get(`/admin/orders${query ? '?' + query : ''}`);
  },
  getOrderDetail: (orderId) => adminApiClient.get(`/admin/orders/${orderId}`),
  updateOrderStatus: (orderId, status) => adminApiClient.patch(`/admin/orders/${orderId}/status`, { status }),
  updateProductionStatus: (orderId, stageId, status) =>
    adminApiClient.patch(`/admin/orders/${orderId}/production/${stageId}`, { status }),
  cancelOrder: (orderId, reason) => adminApiClient.post(`/admin/orders/${orderId}/cancel`, { reason }),
};

// Payment API (Admin)
export const adminPaymentAPI = {
  getPendingPayments: (params = {}) => adminApiClient.get('/admin/payments/pending', { params }),
  confirmPayment: (paymentId) => adminApiClient.post(`/admin/payments/${paymentId}/confirm`),
  rejectPayment: (paymentId, reason) => adminApiClient.post(`/admin/payments/${paymentId}/reject`, { reason }),
  getWithdrawals: (params = {}) => adminApiClient.get('/admin/withdrawals', { params }),
  approveWithdrawal: (withdrawalId) => adminApiClient.post(`/admin/withdrawals/${withdrawalId}/approve`),
  rejectWithdrawal: (withdrawalId, reason) => adminApiClient.post(`/admin/withdrawals/${withdrawalId}/reject`, { reason }),
};

// Reports API (Admin)
export const adminReportsAPI = {
  getDashboard: () => adminApiClient.get('/admin/reports/dashboard'),
  getOrderReport: (params = {}) => adminApiClient.get('/admin/reports/orders', { params }),
  getResellerPerformance: (params = {}) => adminApiClient.get('/admin/reports/resellers', { params }),
  getFinancialReport: (params = {}) => adminApiClient.get('/admin/reports/financial', { params }),
};

export default adminApiClient;
