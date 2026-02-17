// src/services/assetService.js
import api2 from '../store/api2';

export const assetService = {
  // ========== FUNGSI DASAR CRUD ASSET ==========
  
  getAllAssets: async (params = {}) => {
    try {
      // Transform parameter untuk sesuai dengan backend Laravel
      const backendParams = {
        ...(params.page && { page: params.page }),
        ...(params.limit && { limit: params.limit }),
        ...(params.per_page && { limit: params.per_page }),
        ...(params.search && { search: params.search }),
        ...(params.status && { status: params.status }),
        ...(params.category && { category: params.category }), // Nama kategori
        ...(params.location && { location: params.location }), // ID lokasi (yang utama)
        ...(params.sortBy && { sortBy: params.sortBy }),
        ...(params.sortType && { sortType: params.sortType })
      };
      
      console.log('Sending to backend API (ID-based location):', backendParams);
      
      const response = await api2.get('/api/assets', { 
        params: backendParams 
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching assets:', error);
      console.error('Error details:', error.response?.data);
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

  bulkChangeStatus: async (data) => {
    try {
      const response = await api2.patch(`/api/assets/bulk-change-status`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
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
  },
  getBuildings: async () => {
    try {
      const response = await api2.get('/api/locations/building');
      return response.data;
    } catch (error) {
      console.error('Error fetching buildings:', error);
      throw error;
    }
  },

  // Helper untuk mendapatkan lokasi (root) dari building
  getLocationForBuilding: async (buildingId) => {
    try {
      // Endpoint untuk mendapatkan building dengan parent hierarchy
      const response = await api2.get(`/api/locations/building/${buildingId}/with-parents`);
      return response.data;
    } catch (error) {
      console.error('Error fetching location for building:', error);
      throw error;
    }
  },
  getLocationChildren: async (locationId) => {
    try {
      const response = await api2.get(`/api/locations/${locationId}/getOneLevelChildren`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching children for location ${locationId}:`, error);
      throw error;
    }
  }


};