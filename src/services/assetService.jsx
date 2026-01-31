// src/services/assetService.js
import api2 from '../store/api2';

export const assetService = {
  // ========== FUNGSI DASAR CRUD ASSET ==========
  
  getAllAssets: async (params = {}) => {
    try {
      // Default parameters
      const defaultParams = {
        page: params.page || 1,
        per_page: params.per_page || 10
      };
      
      // Add optional parameters
      if (params.status) defaultParams.status = params.status;
      if (params.search) defaultParams.search = params.search;
      if (params.category_id) defaultParams.category_id = params.category_id;
      if (params.location_id) defaultParams.location_id = params.location_id;
      
      console.log('API Request params for assets:', defaultParams);
      
      const response = await api2.get('/api/assets', { 
        params: defaultParams 
      });
      
      console.log('API Response structure for assets:', {
        hasData: !!response.data.data,
        isDataArray: Array.isArray(response.data.data),
        hasMeta: !!response.data.meta,
        fullResponseKeys: Object.keys(response.data)
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching assets:', error);
      throw error;
    }
  },

  getAssetById: async (id) => {
    try {
      const response = await api2.get(`/api/assets/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching asset detail:', error);
      throw error;
    }
  },
  getAssetByCode: async (code) => {
    try {
      const response = await api2.get(`/api/assets/${code}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createAsset: async (data) => {
    try {
      const response = await api2.post('/api/assets', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating asset:', error);
      throw error;
    }
  },

  updateAsset: async (id, data) => {
    try {
      const response = await api2.post(`/api/assets/${id}?_method=PUT`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating asset:', error);
      throw error;
    }
  },
  updateAssetByCode: async (code, formData) => {
  try {
    // Gunakan POST dengan _method=PUT jika PUT tidak bekerja
    const response = await api2.post(`/api/assets/${code}?_method=PUT`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating asset by code:', error);
    throw error;
  }
},

  deleteAsset: async (code) => {
    try {
      const response = await api2.delete(`/api/assets/${code}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting asset:', error);
      throw error;
    }
  },

  // ========== FUNGSI UNTUK FILTER LANJUTAN ==========
  
  getAssetsByStatus: async (status, page = 1) => {
    try {
      const response = await api2.get('/api/assets', {
        params: {
          status,
          page,
          per_page: 10
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching assets by status:', error);
      throw error;
    }
  },

  searchAssets: async (searchTerm, page = 1) => {
    try {
      const response = await api2.get('/api/assets', {
        params: {
          search: searchTerm,
          page,
          per_page: 10
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching assets:', error);
      throw error;
    }
  },

  // ========== FUNGSI TAMBAHAN ==========
  
  getAssetCategories: async () => {
    try {
      const response = await api2.get('/api/categories/all');
      return response.data;
    } catch (error) {
      console.error('Error fetching asset categories:', error);
      throw error;
    }
  },

  getLocations: async () => {
    try {
      const response = await api2.get('/api/locations');
      return response.data;
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  },

  // Fungsi untuk mengubah status asset
  updateAssetStatus: async (id, status) => {
    try {
      const response = await api2.put(`/api/assets/${id}/status`, {
        status: status
      });
      return response.data;
    } catch (error) {
      console.error('Error updating asset status:', error);
      throw error;
    }
  },

  // Fungsi untuk mendapatkan history asset
  getAssetHistory: async (id) => {
    try {
      const response = await api2.get(`/api/assets/${id}/history`);
      return response.data;
    } catch (error) {
      console.error('Error fetching asset history:', error);
      throw error;
    }
  },

  // Fungsi untuk export data asset
  exportAssets: async (params = {}) => {
    try {
      const response = await api2.get('/api/assets/export', {
        params: params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting assets:', error);
      throw error;
    }
  },

  // Fungsi untuk import data asset
  importAssets: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api2.post('/api/assets/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error importing assets:', error);
      throw error;
    }
  }
};