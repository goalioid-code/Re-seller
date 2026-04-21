import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * API Utility - handles all HTTP requests with automatic token injection
 */
class ApiClient {
  constructor() {
    this.baseURL = API_URL;
  }

  /**
   * Get JWT token from storage
   */
  async getToken() {
    try {
      return await AsyncStorage.getItem('jwtToken');
    } catch (error) {
      console.error('[API] Error getting token:', error);
      return null;
    }
  }

  /**
   * Make HTTP request with automatic token injection
   */
  async request(endpoint, options = {}) {
    try {
      const token = await this.getToken();
      
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
      console.error(`[API] Error at ${endpoint}:`, error);
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

export const apiClient = new ApiClient();

// Order API calls
export const orderAPI = {
  createOrder: (orderData) => apiClient.post('/orders', orderData),
  getOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/orders${query ? '?' + query : ''}`);
  },
  getOrderDetail: (orderId) => apiClient.get(`/orders/${orderId}`),
  updateOrder: (orderId, data) => apiClient.put(`/orders/${orderId}`, data),
  cancelOrder: (orderId, reason) => apiClient.delete(`/orders/${orderId}`, { body: { reason } }),
};

// Payment API calls
export const paymentAPI = {
  initiatePayment: (orderId, paymentType) =>
    apiClient.post('/payments/initiate', { order_id: orderId, payment_type: paymentType }),
  getPayment: (paymentId) => apiClient.get(`/payments/${paymentId}`),
  confirmPaymentManual: (paymentId, proofUrl) =>
    apiClient.post(`/payments/${paymentId}/confirm`, { proof_url: proofUrl }),
  getPaymentsByOrder: (orderId) => apiClient.get(`/payments/order/${orderId}`),
};

// Reseller API calls
export const resellerAPI = {
  updateProfile: (profileData) => apiClient.put('/resellers/profile', profileData),
  getDashboard: () => apiClient.get('/resellers/dashboard'),
};

export default apiClient;
