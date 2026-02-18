// src/services/maintenanceService.js
import api2 from "../store/api2";

export const maintenanceService = {
  // Get all maintenances with pagination and filters
  async getAllMaintenances(params = {}) {
    try {
      const response = await api2.get("/api/maintenance-assets", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching maintenances:", error);
      throw error;
    }
  },

  // Get single maintenance by ID
  async getMaintenanceById(id) {
    try {
      const response = await api2.get(`/api/maintenance-assets/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching maintenance ${id}:`, error);
      throw error;
    }
  },

  // Update maintenance - menggunakan POST dengan _method=PUT untuk multipart/form-data
  async updateMaintenance(id, data) {
    try {
      // Gunakan POST dengan _method=PUT di body untuk multipart/form-data
      const response = await api2.post(`/api/maintenance-assets/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating maintenance ${id}:`, error);
      throw error;
    }
  },

  // Optional: Delete maintenance (jika diperlukan)
  async deleteMaintenance(id) {
    try {
      const response = await api2.delete(`/api/maintenance-assets/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting maintenance ${id}:`, error);
      throw error;
    }
  }
};