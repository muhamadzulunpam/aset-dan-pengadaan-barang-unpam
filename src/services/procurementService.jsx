// src/services/procurementService.js
import api2 from '../store/api2';

export const procurementService = {
  // ========== FUNGSI DASAR CRUD ==========
  
  getAllProcurements: async (params = {}) => {
    try {
      // Default parameters
      const defaultParams = {
        page: params.page || 1,
        per_page: params.per_page || 10
      };
      
      // Add optional parameters
      if (params.status) defaultParams.status = params.status;
      if (params.search) defaultParams.search = params.search;
      
      console.log('API Request params:', defaultParams);
      
      const response = await api2.get('/api/procurements', { 
        params: defaultParams 
      });
      
      console.log('API Response structure:', {
        hasData: !!response.data.data,
        isDataArray: Array.isArray(response.data.data),
        hasMeta: !!response.data.meta,
        fullResponseKeys: Object.keys(response.data)
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching procurements:', error);
      throw error;
    }
  },


  getProcurementById: async (id) => {
    try {
      const response = await api2.get(`/api/procurements/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching procurement detail:', error);
      throw error;
    }
  },

  createProcurement: async (data) => {
    try {
      const response = await api2.post('/api/procurements', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating procurement:', error);
      throw error;
    }
  },

  updateProcurement: async (id, data) => {
    try {
      const response = await api2.post(`/api/procurements/${id}?_method=PUT`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating procurement:', error);
      throw error;
    }
  },

  deleteProcurement: async (id) => {
    try {
      const response = await api2.delete(`/api/procurements/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting procurement:', error);
      throw error;
    }
  },

  // ========== FUNGSI APPROVAL ==========
  approveProcurement: async (procurementId, approvalField) => {
    try {
      console.log('Sending approval request:', {
        procurementId,
        approvalField
      });

      const response = await api2.put(
        `/api/procurements/${procurementId}/approve`,
        null,
        {
          params: {
            'approval-field': approvalField
          }
        }
      );

      console.log('Approval response:', response);
      return response.data;
    } catch (error) {
      console.error('Approval error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  // Fungsi untuk approve procurement item (backward compatibility)
  approveProcurementItem: async (procurementId, approvalData) => {
    try {
      // Jika approvalData berisi approval_type, konversi ke approval-field
      let approvalField = approvalData.approval_type;
      
      // Mapping dari frontend ke backend naming convention
      const fieldMapping = {
        'structural_requester': 'structural requester',
        'building_manager': 'building manager',
        'it': 'it',
        'finance': 'finance',
        'procurement_staff': 'procurement staff',
        'warehouse_manager': 'warehouse manager'
      };
      
      if (fieldMapping[approvalField]) {
        approvalField = fieldMapping[approvalField];
      }
      
      const response = await api2.put(
        `/api/procurements/${procurementId}/approve`,
        null,
        {
          params: {
            'approval-field': approvalField
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error approving procurement item:', error);
      throw error;
    }
  },

  // ========== FUNGSI TAMBAHAN ==========
  
  markAsReceived: async (procurementId) => {
    try {
      const response = await api2.put(
        `/api/procurements/${procurementId}/mark-as-received`
      );
      return response.data;
    } catch (error) {
      console.error('Mark as received error:', error);
      throw error;
    }
  },

  // ========== FUNGSI UNTUK FILTER LANJUTAN ==========
  
  getProcurementsByStatus: async (status, page = 1) => {
    try {
      const response = await api2.get('/api/procurements', {
        params: {
          status,
          page,
          per_page: 10
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching procurements by status:', error);
      throw error;
    }
  },

  searchProcurements: async (searchTerm, page = 1) => {
    try {
      const response = await api2.get('/api/procurements', {
        params: {
          search: searchTerm,
          page,
          per_page: 10
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching procurements:', error);
      throw error;
    }
  }
};