// src/pages/maintenance/Index.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../layouts/Sidebar";
import Header from "../../layouts/Header";
import { maintenanceService } from "../../../services/maintenanceService";
import {
  Wrench,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Eye,
  Edit,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Package,
  Building,
  MapPin,
  Tag,
  Calendar as CalendarIcon,
  Users,
  RefreshCw,
  X,
  Info,
  Loader
} from "lucide-react";
import debounce from "lodash/debounce";

// Modal Filter Component
const FilterModal = ({ 
  isOpen, 
  onClose, 
  filters,
  setFilters,
  onApplyFilters 
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  // Helper untuk menghitung filter aktif
  const activeFilterCount = Object.values(localFilters).filter(value => 
    value !== "" && value !== null && value !== undefined
  ).length;

  // Format status untuk tampilan
  const formatStatus = (status) => {
    const statusMap = {
      scheduled: "Terjadwal",
      in_progress: "Sedang Berjalan",
      completed: "Selesai",
      cancelled: "Dibatalkan",
      overdue: "Terlewat"
    };
    return statusMap[status] || status;
  };

  // Handle apply filters
  const handleApply = () => {
    onApplyFilters(localFilters);
  };

  // Handle reset filters
  const handleReset = () => {
    const resetFilters = {
      status: "",
      asset_name: "",
      asset_code: ""
    };
    setLocalFilters(resetFilters);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Background overlay */}
      <div 
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal container */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          {/* Modal content */}
          <div 
            className="relative w-full max-w-md bg-white rounded-2xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-orange-100 to-amber-100 rounded-lg">
                  <Filter className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Filter Maintenance
                  </h3>
                  <p className="text-sm text-slate-500">
                    Filter data maintenance berdasarkan kriteria
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {activeFilterCount > 0 && (
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                    {activeFilterCount} aktif
                  </span>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Status
                </label>
                <select
                  value={localFilters.status || ""}
                  onChange={(e) => setLocalFilters({...localFilters, status: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all duration-300"
                >
                  <option value="">Semua Status</option>
                  <option value="scheduled">Terjadwal</option>
                  <option value="in_progress">Sedang Berjalan</option>
                  <option value="completed">Selesai</option>
                  <option value="cancelled">Dibatalkan</option>
                  <option value="overdue">Terlewat</option>
                </select>
              </div>

              {/* Asset Name Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Nama Asset
                </label>
                <input
                  type="text"
                  value={localFilters.asset_name || ""}
                  onChange={(e) => setLocalFilters({...localFilters, asset_name: e.target.value})}
                  placeholder="Cari berdasarkan nama asset..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all duration-300"
                />
              </div>

              {/* Asset Code Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Kode Asset
                </label>
                <input
                  type="text"
                  value={localFilters.asset_code || ""}
                  onChange={(e) => setLocalFilters({...localFilters, asset_code: e.target.value})}
                  placeholder="Cari berdasarkan kode asset..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all duration-300"
                />
              </div>

              {/* Active filters info */}
              {activeFilterCount > 0 && (
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    Filter Aktif:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {localFilters.status && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-orange-100 text-orange-700">
                        Status: {formatStatus(localFilters.status)}
                      </span>
                    )}
                    {localFilters.asset_name && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                        Asset: {localFilters.asset_name}
                      </span>
                    )}
                    {localFilters.asset_code && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                        Kode: {localFilters.asset_code}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 rounded-b-2xl">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl font-medium transition-colors flex items-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset Semua
                </button>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2.5 text-slate-700 hover:bg-slate-100 rounded-xl font-medium transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleApply}
                    className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500
                              text-white rounded-xl font-semibold
                              hover:shadow-lg hover:shadow-orange-500/25
                              transition-all duration-300"
                  >
                    Terapkan Filter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // State untuk data maintenance
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State untuk statistik
  const [stats, setStats] = useState({
    scheduled_maintenance_assets_count: 0,
    in_progress_maintenance_assets_count: 0,
    completed_maintenance_assets_count: 0,
    overdue_maintenance_assets_count: 0
  });

  // State untuk pagination
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: null,
    to: null,
  });

  // State untuk search dan filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    asset_name: "",
    asset_code: ""
  });
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Refs
  const isInitialMount = useRef(true);

  // Helper untuk menghitung filter aktif
  const activeFilterCount = Object.values(filters).filter(value => 
    value !== "" && value !== null && value !== undefined
  ).length;

  // Fetch data maintenance
  const fetchMaintenances = useCallback(async (page = 1, appliedFilters = {}, search = "") => {
    try {
      setLoading(true);
      setError(null);

      // Build params
      const params = {
        page: page,
        limit: pagination.per_page,
        ...(search && { search: search }),
        ...(appliedFilters.status && { status: appliedFilters.status }),
        ...(appliedFilters.asset_name && { asset_name: appliedFilters.asset_name }),
        ...(appliedFilters.asset_code && { asset_code: appliedFilters.asset_code })
      };

      console.log('Fetching maintenances with params:', params);

      const response = await maintenanceService.getAllMaintenances(params);
      console.log('Maintenances response:', response);

      // Handle response structure
      if (response && response.meta && response.data) {
        setMaintenances(response.data);
        setPagination({
          current_page: response.meta.current_page || 1,
          last_page: response.meta.last_page || 1,
          per_page: response.meta.per_page || 10,
          total: response.meta.total || 0,
          from: response.meta.from || null,
          to: response.meta.to || null,
        });

        // Set stats
        setStats({
          scheduled_maintenance_assets_count: response.scheduled_maintenance_assets_count || 0,
          in_progress_maintenance_assets_count: response.in_progress_maintenance_assets_count || 0,
          completed_maintenance_assets_count: response.completed_maintenance_assets_count || 0,
          overdue_maintenance_assets_count: response.overdue_maintenance_assets_count || 0
        });
      } else {
        setMaintenances([]);
        setPagination({
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 0,
          from: null,
          to: null,
        });
      }

    } catch (err) {
      console.error("Error fetching maintenances:", err);
      setError(err.response?.data?.message || "Gagal memuat data maintenance. Silakan coba lagi.");
      setMaintenances([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.per_page]);

  // Initial load
  useEffect(() => {
    fetchMaintenances(1, filters, searchTerm);
  }, []);

  // Debounced search
  const debouncedSearch = useRef(
    debounce((searchValue) => {
      fetchMaintenances(1, filters, searchValue);
    }, 500)
  ).current;

  // Handle search change
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // Handle filter changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    const timer = setTimeout(() => {
      fetchMaintenances(1, filters, searchTerm);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [filters, searchTerm]);

  // Handle apply filters
  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setShowFilterModal(false);
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.last_page) {
      fetchMaintenances(page, filters, searchTerm);
    }
  };

  // Format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Format status
  const formatStatus = (status) => {
    const statusMap = {
      scheduled: "Terjadwal",
      in_progress: "Sedang Berjalan",
      completed: "Selesai",
      cancelled: "Dibatalkan",
      overdue: "Terlewat"
    };
    return statusMap[status] || status;
  };

  // Warna status
  const getStatusColor = (status) => {
    const colors = {
      scheduled: "bg-blue-50 text-blue-700 border border-blue-200",
      in_progress: "bg-yellow-50 text-yellow-700 border border-yellow-200",
      completed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      cancelled: "bg-slate-50 text-slate-700 border border-slate-200",
      overdue: "bg-rose-50 text-rose-700 border border-rose-200"
    };
    return colors[status] || "bg-slate-50 text-slate-700";
  };

  // Icon status
  const getStatusIcon = (status) => {
    const icons = {
      scheduled: <Calendar className="w-4 h-4 text-blue-500" />,
      in_progress: <Loader className="w-4 h-4 text-yellow-500 animate-spin" />,
      completed: <CheckCircle className="w-4 h-4 text-emerald-500" />,
      cancelled: <XCircle className="w-4 h-4 text-slate-500" />,
      overdue: <AlertTriangle className="w-4 h-4 text-rose-500" />
    };
    return icons[status] || <Clock className="w-4 h-4 text-slate-500" />;
  };

  // Generate page numbers untuk pagination
  const generatePageNumbers = () => {
    const current = pagination.current_page;
    const last = pagination.last_page;
    const maxPages = 5;
    
    if (last <= maxPages) {
      return Array.from({ length: last }, (_, i) => i + 1);
    }
    
    let start = Math.max(1, current - Math.floor(maxPages / 2));
    let end = Math.min(last, start + maxPages - 1);
    
    if (end - start + 1 < maxPages) {
      start = Math.max(1, end - maxPages + 1);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  // Render pagination info
  const renderPaginationInfo = () => {
    const { current_page, last_page, per_page, total, from, to } = pagination;
    
    if (total === 0) {
      return "Tidak ada data maintenance";
    }
    
    const start = from || ((current_page - 1) * per_page + 1);
    const end = to || Math.min(current_page * per_page, total);
    
    return (
      <>
        Menampilkan{" "}
        <span className="font-semibold">
          {start} - {end}
        </span>{" "}
        dari{" "}
        <span className="font-semibold">
          {total}
        </span>{" "}
        maintenance
        <span className="text-slate-500 ml-2">
          (Halaman {current_page} dari {last_page})
        </span>
        {(activeFilterCount > 0 || searchTerm) && (
          <span className="text-orange-600 text-xs ml-2 bg-orange-50 px-2 py-1 rounded">
            difilter
          </span>
        )}
      </>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header setSidebarOpen={setSidebarOpen} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
          <div className="max-w-7xl mx-auto">
            {/* Page Title */}
            <div className="mb-8 animate-fade-in">
              <div className="flex items-center mb-3">
                <Wrench className="w-8 h-8 text-orange-600 mr-3" />
                <h1 className="text-3xl font-bold text-slate-900">
                  Maintenance Assets
                </h1>
              </div>
              <p className="text-slate-600 text-lg">
                Kelola jadwal dan riwayat perawatan aset perusahaan
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Terjadwal */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Terjadwal</p>
                    <p className="text-2xl font-bold text-blue-700">{stats.scheduled_maintenance_assets_count}</p>
                    <p className="text-xs text-slate-500 mt-1">Menunggu pelaksanaan</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Sedang Berjalan */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Sedang Berjalan</p>
                    <p className="text-2xl font-bold text-yellow-700">{stats.in_progress_maintenance_assets_count}</p>
                    <p className="text-xs text-slate-500 mt-1">Dalam proses perawatan</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl">
                    <Loader className="w-6 h-6 text-yellow-600 animate-spin" />
                  </div>
                </div>
              </div>

              {/* Selesai */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Selesai</p>
                    <p className="text-2xl font-bold text-emerald-700">{stats.completed_maintenance_assets_count}</p>
                    <p className="text-xs text-slate-500 mt-1">Perawatan selesai</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </div>

              {/* Terlewat */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Terlewat</p>
                    <p className="text-2xl font-bold text-rose-700">{stats.overdue_maintenance_assets_count}</p>
                    <p className="text-xs text-slate-500 mt-1">Melewati jadwal</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl">
                    <AlertTriangle className="w-6 h-6 text-rose-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Table */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              {/* Table Header */}
              <div className="px-6 py-4 border-b border-slate-200/60 bg-white/50">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="mb-4 lg:mb-0">
                    <h2 className="text-xl font-bold text-slate-900">
                      Daftar Maintenance
                    </h2>
                    <p className="text-slate-600 text-sm">
                      Total: {pagination.total} maintenance
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                    {/* Search */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Cari asset..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all duration-300 w-full lg:w-64"
                      />
                    </div>

                    {/* Filter Button */}
                    <div className="relative">
                      <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <button
                        onClick={() => setShowFilterModal(true)}
                        className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl
                                  focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500
                                  outline-none transition-all duration-300 w-full lg:w-48
                                  flex items-center justify-between text-slate-600 hover:bg-slate-100"
                      >
                        <span>Filter</span>
                        {activeFilterCount > 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                            {activeFilterCount}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  <span className="ml-3 text-slate-600">Memuat data maintenance...</span>
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <div className="flex flex-col items-center justify-center py-12 px-6">
                  <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
                  <p className="text-lg font-medium text-slate-700 mb-2">Terjadi Kesalahan</p>
                  <p className="text-slate-500 mb-4 text-center">{error}</p>
                  <button
                    onClick={() => fetchMaintenances(1, filters, searchTerm)}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Coba Lagi
                  </button>
                </div>
              )}

              {/* Table Content */}
              {!loading && !error && (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-100/70 backdrop-blur-sm">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            ID
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Asset
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Kategori
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Next Maintenance
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Actual Maintenance
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Teknisi
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Aksi
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-200/60">
                        {maintenances.length > 0 ? (
                          maintenances.map((maintenance) => (
                            <tr
                              key={maintenance.id}
                              className="hover:bg-slate-50/50 transition-colors duration-300"
                            >
                              {/* ID */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm font-mono text-slate-700 bg-slate-50 px-2 py-1 rounded">
                                  #{maintenance.id}
                                </span>
                              </td>

                              {/* Asset */}
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <Package className="w-5 h-5 text-slate-400 mr-2 flex-shrink-0" />
                                  <div>
                                    <div className="text-sm font-semibold text-slate-900">
                                      {maintenance.asset?.name || "N/A"}
                                    </div>
                                    <div className="text-xs text-slate-500 font-mono">
                                      {maintenance.asset?.code || "N/A"}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Kategori */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <Tag className="w-4 h-4 text-slate-400 mr-2" />
                                  <span className="text-sm text-slate-700">
                                    {maintenance.asset?.category?.name || "N/A"}
                                  </span>
                                </div>
                              </td>

                              {/* Status */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 mr-2">
                                    {getStatusIcon(maintenance.status)}
                                  </div>
                                  <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                      maintenance.status
                                    )}`}
                                  >
                                    {formatStatus(maintenance.status)}
                                  </span>
                                </div>
                              </td>

                              {/* Next Maintenance */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center text-sm text-slate-600">
                                  <CalendarIcon className="w-4 h-4 text-slate-400 mr-2" />
                                  {formatDate(maintenance.next_maintenance_date)}
                                </div>
                              </td>

                              {/* Actual Maintenance */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center text-sm text-slate-600">
                                  <Clock className="w-4 h-4 text-slate-400 mr-2" />
                                  {formatDate(maintenance.actual_maintenance_date)}
                                </div>
                              </td>

                              {/* Teknisi */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <Users className="w-4 h-4 text-slate-400 mr-2" />
                                  <span className="text-sm text-slate-700">
                                    {maintenance.technician_user?.name || "-"}
                                  </span>
                                </div>
                              </td>

                              {/* Aksi */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => navigate(`/maintenance/view/${maintenance.id}`)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                    title="Lihat Detail"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => navigate(`/maintenance/update/${maintenance.id}`)}
                                    className="p-2 text-orange-600 hover:bg-orange-50 rounded-xl transition-colors"
                                    title="Edit"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                              <div className="flex flex-col items-center">
                                <Wrench className="w-16 h-16 text-slate-400 mb-4" />
                                <p className="text-lg font-medium text-slate-600 mb-2">
                                  Tidak ada data maintenance
                                </p>
                                <p className="text-sm text-slate-500">
                                  {searchTerm || activeFilterCount > 0
                                    ? "Coba ubah filter pencarian Anda"
                                    : "Belum ada jadwal maintenance"}
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {pagination.total > 0 && pagination.last_page > 1 && (
                    <div className="px-6 py-4 border-t border-slate-200/60 bg-white/50">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm text-slate-600 mb-4 sm:mb-0">
                          {renderPaginationInfo()}
                        </div>
                        <div className="flex items-center space-x-2">
                          {/* Previous Button */}
                          <button
                            onClick={() => handlePageChange(pagination.current_page - 1)}
                            disabled={pagination.current_page === 1}
                            className="flex items-center px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                          >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Sebelumnya
                          </button>

                          {/* Page Numbers */}
                          {generatePageNumbers().map((pageNum) => (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-2 rounded-lg font-medium text-sm min-w-[40px] ${
                                pagination.current_page === pageNum
                                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                                  : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                              } transition-colors`}
                            >
                              {pageNum}
                            </button>
                          ))}

                          {/* Next Button */}
                          <button
                            onClick={() => handlePageChange(pagination.current_page + 1)}
                            disabled={pagination.current_page === pagination.last_page}
                            className="flex items-center px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                          >
                            Selanjutnya
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        setFilters={setFilters}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  );
};

export default Index;