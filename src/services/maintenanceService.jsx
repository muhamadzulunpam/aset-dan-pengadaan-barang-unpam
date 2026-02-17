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

  // Update maintenance
  async updateMaintenance(id, data) {
    try {
      const response = await api2.put(`/api/maintenance-assets/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating maintenance ${id}:`, error);
      throw error;
    }
  }
};