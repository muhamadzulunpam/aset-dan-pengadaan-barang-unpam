// src/services/procurementService.js
import api2 from '../store/api2';

export const procurementService = {
  // Ambil semua data procurement
  getAllProcurements: async (page = 1, perPage = 10) => {
    try {
      const response = await api2.get(`/api/procurements?page=${page}&per_page=${perPage}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching procurements:', error);
      throw error;
    }
  },

  // Ambil detail procurement by ID
  getProcurementById: async (id) => {
    try {
      const response = await api2.get(`/api/procurements/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching procurement detail:', error);
      throw error;
    }
  },

  // Buat procurement baru
  createProcurement: async (data) => {
    try {
      const response = await api2.post('/api/procurements', data);
      return response.data;
    } catch (error) {
      console.error('Error creating procurement:', error);
      throw error;
    }
  },

  // Update procurement
  updateProcurement: async (id, data) => {
    try {
      const response = await api2.put(`/api/procurements/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating procurement:', error);
      throw error;
    }
  },

  // Hapus procurement
  deleteProcurement: async (id) => {
    try {
      const response = await api2.delete(`/api/procurements/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting procurement:', error);
      throw error;
    }
  }
};