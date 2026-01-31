// src/pages/Assets.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../layouts/Sidebar";
import Header from "../../layouts/Header";
import { assetService } from "../../../services/assetService";
import {
  Package,
  PackageCheck,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Building,
  MapPin,
  Tag,
  Barcode,
  Home,
  Server,
  Monitor,
  Printer,
  Smartphone,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Activity,
  Users,
  Archive,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { useAuthStore } from "../../../store/useAuthStore";
import debounce from "lodash/debounce";

const Assets = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: null,
    to: null,
  });
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState([]);

  // Fetch data assets dari API
  const fetchAssets = useCallback(async (page = 1, status = "", search = "", category = "") => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: page,
        per_page: 10,
        ...(status && { status: status }),
        ...(search && { search: search }),
        ...(category && { category_id: category })
      };

      console.log("Fetching assets with params:", params);
      
      const response = await assetService.getAllAssets(params);

      console.log("Full API Response for assets:", response);
      
      // Handle response structure
      let dataToSet = [];
      let metaToSet = {};

      // Case 1: Response langsung berisi data array dan meta
      if (response.data && Array.isArray(response.data)) {
        dataToSet = response.data;
        metaToSet = response.meta || {};
      }
      // Case 2: Laravel pagination default (data ada di response.data.data)
      else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        dataToSet = response.data.data;
        metaToSet = response.data.meta || response.data || {};
      }
      // Case 3: Response adalah array langsung
      else if (Array.isArray(response)) {
        dataToSet = response;
        metaToSet = {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: response.length,
          from: 1,
          to: response.length,
        };
      }
      // Case 4: Data dari Postman contoh
      else if (response.data && Array.isArray(response.data) && response.meta) {
        dataToSet = response.data;
        metaToSet = response.meta;
      }

      console.log("Assets data to set:", dataToSet);
      console.log("Meta to set:", metaToSet);

      setAssets(dataToSet);
      
      setPagination({
        current_page: metaToSet.current_page || 1,
        last_page: metaToSet.last_page || 1,
        per_page: metaToSet.per_page || 10,
        total: metaToSet.total || dataToSet.length,
        from: metaToSet.from || null,
        to: metaToSet.to || null,
      });

    } catch (err) {
      console.error("Error fetching assets:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response,
        status: err.response?.status
      });
      
      setError(err.response?.data?.message || "Gagal memuat data assets. Silakan coba lagi.");
      setAssets([]);
      setPagination({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
        from: null,
        to: null,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      // Fetch categories
      const categoriesResponse = await assetService.getAssetCategories();
      console.log("Categories API response:", categoriesResponse);
      
      let categoriesData = [];
      
      // Debug struktur response
      if (categoriesResponse) {
        console.log("Categories response structure:", {
          hasData: !!categoriesResponse.data,
          isDataArray: Array.isArray(categoriesResponse.data),
          hasMeta: !!categoriesResponse.meta,
          dataType: typeof categoriesResponse.data,
          keys: Object.keys(categoriesResponse)
        });
      }
      
      // Handle berbagai struktur response
      if (categoriesResponse.data && Array.isArray(categoriesResponse.data)) {
        // Case 1: categoriesResponse.data adalah array langsung
        categoriesData = categoriesResponse.data;
      } else if (categoriesResponse.data && categoriesResponse.data.data && Array.isArray(categoriesResponse.data.data)) {
        // Case 2: categoriesResponse.data.data adalah array (Laravel pagination)
        categoriesData = categoriesResponse.data.data;
      } else if (Array.isArray(categoriesResponse)) {
        // Case 3: Response langsung array
        categoriesData = categoriesResponse;
      } else if (categoriesResponse && categoriesResponse.meta && categoriesResponse.meta.code === 200) {
        // Case 4: Response dengan meta
        categoriesData = categoriesResponse.data || [];
      }
      
      console.log("Processed categories data:", categoriesData);
      
      // Validasi dan set data
      if (Array.isArray(categoriesData) && categoriesData.length > 0) {
        console.log("Setting categories with", categoriesData.length, "items");
        console.log("Sample category:", categoriesData[0]);
        setCategories(categoriesData);
      } else {
        console.warn("No valid categories data found");
        setCategories([]);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchAssets(1, "", "");
    fetchCategories();
  }, [fetchAssets, fetchCategories]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      fetchAssets(1, statusFilter, searchValue, categoryFilter);
    }, 2000),
    [statusFilter, categoryFilter, fetchAssets]
  );

  // Handle search input change
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    fetchAssets(1, value, searchTerm, categoryFilter);
  };

  // Handle category filter change
  const handleCategoryFilterChange = (value) => {
    setCategoryFilter(value);
    fetchAssets(1, statusFilter, searchTerm, value);
  };

  const truncateString = (str, maxLength) => {
    if (!str) return "N/A";
    return str.length > maxLength ? str.slice(0, maxLength) + "..." : str;
  };

  // Format status untuk tampilan
  const formatStatus = (status) => {
    const statusMap = {
      available: "Tersedia",
      in_use: "Digunakan",
      in_transit: "Dalam Perjalanan",
      maintenance: "Perawatan",
      damaged: "Rusak",
      lost: "Hilang",
      disposed: "Dibuang",
    };
    return statusMap[status] || status;
  };

  // Warna status
  const getStatusColor = (status) => {
    const colors = {
      available: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      in_use: "bg-blue-50 text-blue-700 border border-blue-200",
      in_transit: "bg-yellow-50 text-yellow-700 border border-yellow-200",
      maintenance: "bg-orange-50 text-orange-700 border border-orange-200",
      damaged: "bg-rose-50 text-rose-700 border border-rose-200",
      lost: "bg-slate-50 text-slate-700 border border-slate-200",
      disposed: "bg-gray-50 text-gray-700 border border-gray-200",
    };
    return colors[status] || "bg-slate-50 text-slate-700";
  };

  // Icon untuk status
  const getStatusIcon = (status) => {
    const icons = {
      available: <CheckCircle className="w-4 h-4 text-emerald-500" />,
      in_use: <Users className="w-4 h-4 text-blue-500" />,
      in_transit: <Activity className="w-4 h-4 text-yellow-500" />,
      maintenance: <AlertTriangle className="w-4 h-4 text-orange-500" />,
      damaged: <XCircle className="w-4 h-4 text-rose-500" />,
      lost: <Archive className="w-4 h-4 text-slate-500" />,
      disposed: <ShieldCheck className="w-4 h-4 text-gray-500" />,
    };
    return icons[status] || <Package className="w-4 h-4 text-slate-500" />;
  };

  // Icon untuk kategori
  const getCategoryIcon = (categoryName) => {
    const icons = {
      "Teknologi": <Server className="w-4 h-4 text-blue-500" />,
      "Alat Tulis Kantor": <Package className="w-4 h-4 text-emerald-500" />,
      "Elektronik": <Monitor className="w-4 h-4 text-purple-500" />,
      "Furniture": <Home className="w-4 h-4 text-amber-500" />,
      "Kendaraan": <Activity className="w-4 h-4 text-red-500" />,
      "Perlengkapan": <PackageCheck className="w-4 h-4 text-cyan-500" />,
    };
    return icons[categoryName] || <Package className="w-4 h-4 text-slate-500" />;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Format lokasi lengkap
  const formatLocation = (location) => {
    if (!location) return "N/A";
    
    let fullLocation = "";
    
    // Tambahkan parent hierarchy
    const addParent = (loc) => {
      if (loc) {
        if (loc.parent) {
          addParent(loc.parent);
        }
        if (loc.name) {
          fullLocation += fullLocation ? " > " + loc.name : loc.name;
        }
      }
    };
    
    addParent(location);
    
    return fullLocation || location.name || "N/A";
  };

  // Hitung stats dari data real
  const calculateStats = () => {
    const totalAssets = assets.length;
    const availableAssets = assets.filter(item => item.status === "available").length;
    const inUseAssets = assets.filter(item => item.status === "in_use").length;
    const maintenanceAssets = assets.filter(item => item.status === "maintenance").length;

    return {
      totalAssets,
      availableAssets,
      inUseAssets,
      maintenanceAssets
    };
  };

  const stats = calculateStats();

  // Handle pagination
  const handlePageChange = (page) => {
    console.log("Page change requested to:", page);
    console.log("Current pagination:", pagination);
    
    if (page >= 1 && page <= pagination.last_page) {
      fetchAssets(page, statusFilter, searchTerm, categoryFilter);
    } else {
      console.warn("Invalid page number:", page);
    }
  };

  // Handle view detail
  const handleViewDetail = (code) => {
    navigate(`/assets/view/${code}`);
  };

  const handleEdit = (code) => {
    navigate(`/assets/update/${code}`);
  };

  // Handle delete
  const handleDelete = async (code) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus asset ini?")) {
      try {
        await assetService.deleteAsset(code);
        alert("Asset berhasil dihapus");
        fetchAssets(pagination.current_page, statusFilter, searchTerm, categoryFilter);
      } catch (err) {
        console.error("Error deleting asset:", err);
        alert(err.response?.data?.message || "Gagal menghapus asset. Silakan coba lagi.");
      }
    }
  };

  // Fungsi untuk menghasilkan array halaman dengan maksimal 5
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
    
    console.log("Rendering pagination info:", pagination);
    
    if (total === 0) {
      return "Tidak ada data assets";
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
        assets
        <span className="text-slate-500 ml-2">
          (Halaman {current_page} dari {last_page})
        </span>
        {(statusFilter || searchTerm || categoryFilter) && (
          <span className="text-blue-600 text-xs ml-2 bg-blue-50 px-2 py-1 rounded">
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
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
          <div className="max-w-7xl mx-auto">
            {/* Page Title */}
            <div className="mb-8 animate-fade-in">
              <div className="flex items-center mb-3">
                <Package className="w-8 h-8 text-emerald-600 mr-3" />
                <h1 className="text-3xl font-bold text-slate-900">
                  Assets
                </h1>
              </div>
              <p className="text-slate-600 text-lg">
                Kelola inventory dan tracking aset perusahaan
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Assets */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Total Assets</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.totalAssets}</p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl">
                    <Package className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </div>

              {/* Available Assets */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Tersedia</p>
                    <p className="text-2xl font-bold text-emerald-700">{stats.availableAssets}</p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </div>

              {/* In Use Assets */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Sedang Digunakan</p>
                    <p className="text-2xl font-bold text-blue-700">{stats.inUseAssets}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Maintenance Assets */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Dalam Perawatan</p>
                    <p className="text-2xl font-bold text-orange-700">{stats.maintenanceAssets}</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-xl">
                    <AlertTriangle className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Assets Table */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              {/* Table Header */}
              <div className="px-6 py-4 border-b border-slate-200/60 bg-white/50">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="mb-4 lg:mb-0">
                    <h2 className="text-xl font-bold text-slate-900">
                      Daftar Assets
                    </h2>
                    <p className="text-slate-600 text-sm">
                      Total: {pagination.total} assets
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
                        className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-300 w-full lg:w-64"
                      />
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-2">
                      {/* Status Filter - Icon Only */}
                      <div className="relative">
                        <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2 z-10" />
                        <select
                          value={statusFilter}
                          onChange={(e) => handleStatusFilterChange(e.target.value)}
                          className="pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-300 appearance-none cursor-pointer w-32"
                          title="Filter berdasarkan status asset"
                        >
                          <option value="">Semua Status</option>
                          <option value="available">Tersedia</option>
                          <option value="in_transit">Sedang Dipindahkan</option>
                          <option value="in_use">Digunakan</option>
                          <option value="in_repair">Dalam Perbaikan</option>
                          <option value="damaged">Rusak</option>
                          <option value="lost">Hilang</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                      </div>

                      {/* Category Filter */}
                      <div className="relative">
                        <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2 z-10" />
                        <select
                          value={categoryFilter}
                          onChange={(e) => handleCategoryFilterChange(e.target.value)}
                          className="pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-300 appearance-none cursor-pointer w-32"
                        >
                          <option value="">Semua Kategori</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate("/assets/create")}
                          className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 flex items-center"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Tambah Asset
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                  <span className="ml-3 text-slate-600">Memuat data assets...</span>
                </div>
              )}

              {/* Table Content */}
              {!loading && (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-100/70 backdrop-blur-sm">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Nama Asset
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Kode Asset
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Kategori
                          </th>
                          <th className="px8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Lokasi
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Tanggal Dibuat
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Aksi
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-200/60">
                        {assets.length > 0 ? (
                          assets.map((asset) => (
                            <tr
                              key={asset.id}
                              className="hover:bg-slate-50/50 transition-colors duration-300"
                            >
                              {/* Nama Asset */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-3">
                                  <div className="flex-shrink-0">
                                    {getCategoryIcon(asset.category?.name)}
                                  </div>
                                  <div>
                                    <div className="text-sm font-semibold text-slate-900">
                                      {truncateString(asset.name || "No Name", 20)}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      ID: {asset.id}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Kode Asset */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <Barcode className="w-4 h-4 text-slate-400 mr-2" />
                                  <code className="text-sm font-mono text-slate-700 bg-slate-50 px-2 py-1 rounded">
                                    {asset.code || "N/A"}
                                  </code>
                                </div>
                              </td>

                              {/* Kategori */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 mr-2">
                                    {getCategoryIcon(asset.category?.name)}
                                  </div>
                                  <span className="text-sm text-slate-700">
                                    {asset.category?.name || "N/A"}
                                  </span>
                                </div>
                              </td>

                              {/* Lokasi */}
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <MapPin className="w-8 h-4 text-slate-400 mr-2 flex-shrink-0" />
                                  <div className="text-sm text-slate-700">
                                    {truncateString(formatLocation(asset.location), 40)}
                                  </div>
                                </div>
                              </td>

                              {/* Status */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 mr-2">
                                    {getStatusIcon(asset.status)}
                                  </div>
                                  <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                      asset.status
                                    )}`}
                                  >
                                    {formatStatus(asset.status)}
                                  </span>
                                </div>
                              </td>

                              {/* Tanggal Dibuat */}
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 text-slate-400 mr-2" />
                                  {formatDate(asset.created_at)}
                                </div>
                              </td>

                              {/* Aksi */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleViewDetail(asset.code)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                    title="Lihat Detail"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleEdit(asset.code)}
                                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                                    title="Edit"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(asset.code)}
                                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                    title="Hapus"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                              <div className="flex flex-col items-center">
                                <Package className="w-16 h-16 text-slate-400 mb-4" />
                                <p className="text-lg font-medium text-slate-600 mb-2">
                                  Tidak ada data assets
                                </p>
                                <p className="text-sm text-slate-500 mb-4">
                                  {searchTerm || statusFilter || categoryFilter
                                    ? "Coba ubah filter pencarian Anda"
                                    : "Mulai dengan menambahkan asset pertama Anda"}
                                </p>
                                <button
                                  onClick={() => navigate("/assets/create")}
                                  className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
                                >
                                  Tambah Asset Pertama
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Footer dengan Pagination */}
                  {pagination.total > 0 && pagination.last_page > 1 && (
                    <div className="px-6 py-4 border-t border-slate-200/60 bg-white/50">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm text-slate-600 mb-4 sm:mb-0">
                          {renderPaginationInfo()}
                        </div>
                        <div className="flex items-center space-x-2">
                          {/* Tombol Sebelumnya */}
                          <button
                            onClick={() => handlePageChange(pagination.current_page - 1)}
                            disabled={pagination.current_page === 1}
                            className="flex items-center px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                          >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Sebelumnya
                          </button>

                          {/* Generate pagination numbers */}
                          {(() => {
                            const pageNumbers = generatePageNumbers();
                            
                            if (pageNumbers.length === 0) return null;
                            
                            return (
                              <>
                                {/* Tombol halaman pertama jika tidak termasuk dalam range */}
                                {pageNumbers[0] > 1 && (
                                  <>
                                    <button
                                      onClick={() => handlePageChange(1)}
                                      className={`px-3 py-2 rounded-lg font-medium text-sm ${
                                        pagination.current_page === 1
                                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                                          : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                                      } transition-colors`}
                                    >
                                      1
                                    </button>
                                    {pageNumbers[0] > 2 && (
                                      <span className="px-1 text-slate-500">...</span>
                                    )}
                                  </>
                                )}

                                {/* Tombol halaman tengah */}
                                {pageNumbers.map((pageNum) => (
                                  <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`px-3 py-2 rounded-lg font-medium text-sm min-w-[40px] ${
                                      pagination.current_page === pageNum
                                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                                        : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                                    } transition-colors`}
                                  >
                                    {pageNum}
                                  </button>
                                ))}

                                {/* Tombol halaman terakhir jika tidak termasuk dalam range */}
                                {pageNumbers[pageNumbers.length - 1] < pagination.last_page && (
                                  <>
                                    {pageNumbers[pageNumbers.length - 1] < pagination.last_page - 1 && (
                                      <span className="px-1 text-slate-500">...</span>
                                    )}
                                    <button
                                      onClick={() => handlePageChange(pagination.last_page)}
                                      className={`px-3 py-2 rounded-lg font-medium text-sm ${
                                        pagination.current_page === pagination.last_page
                                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                                          : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                                    } transition-colors`}
                                    >
                                      {pagination.last_page}
                                    </button>
                                  </>
                                )}
                              </>
                            );
                          })()}

                          {/* Tombol Selanjutnya */}
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
    </div>
  );
};

export default Assets;