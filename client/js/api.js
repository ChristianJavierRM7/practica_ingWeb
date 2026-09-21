/* =============================================================================
   TECHFIX CLIENT - API SERVICE MODULE (FETCH API + JWT)
   ============================================================================= */
const API_BASE_URL = window.location.origin + '/api';

class ApiService {
  static getHeaders() {
    const token = localStorage.getItem('techfix_token');
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = this.getHeaders();

    const config = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en la petición al servidor.');
      }

      return data;
    } catch (error) {
      console.error(`❌ Error en API (${endpoint}):`, error.message);
      throw error;
    }
  }

  // --- AUTENTICACIÓN ---
  static async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  static async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  static async getMe() {
    return this.request('/auth/me');
  }

  // --- DASHBOARD ---
  static async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  // --- ÓRDENES DE REPARACIÓN ---
  static async getRepairs(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/repairs${query ? `?${query}` : ''}`);
  }

  static async getRepairById(id) {
    return this.request(`/repairs/${id}`);
  }

  static async createRepair(repairData) {
    return this.request('/repairs', {
      method: 'POST',
      body: JSON.stringify(repairData),
    });
  }

  static async updateRepair(id, repairData) {
    return this.request(`/repairs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(repairData),
    });
  }

  static async updateRepairStatus(id, status) {
    return this.request(`/repairs/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  static async addRepairItem(repairId, inventoryId, quantity) {
    return this.request(`/repairs/${repairId}/items`, {
      method: 'POST',
      body: JSON.stringify({ inventory_id: inventoryId, quantity }),
    });
  }

  static async removeRepairItem(repairId, itemId) {
    return this.request(`/repairs/${repairId}/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  static async deleteRepair(id) {
    return this.request(`/repairs/${id}`, {
      method: 'DELETE',
    });
  }

  // --- INVENTARIO Y SERVICIOS ---
  static async getInventory(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/inventory${query ? `?${query}` : ''}`);
  }

  static async createInventory(itemData) {
    return this.request('/inventory', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  static async updateInventory(id, itemData) {
    return this.request(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    });
  }

  static async deleteInventory(id) {
    return this.request(`/inventory/${id}`, {
      method: 'DELETE',
    });
  }

  // --- USUARIOS ---
  static async getUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/users${query ? `?${query}` : ''}`);
  }

  static async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  static async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  static async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }
}
