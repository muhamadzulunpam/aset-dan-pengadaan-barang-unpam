// src/pages/Pengadaan.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../layouts/Sidebar";
import Header from "../../layouts/Header";
import { procurementService } from "../../../services/procurementService";
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  DollarSign,
  Package,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  PackageCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "../../../store/useAuthStore";
import debounce from "lodash/debounce";

const Pengadaan = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [procurements, setProcurements] = useState([]);
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
  const [approving, setApproving] = useState(false);
  const [approvalError, setApprovalError] = useState(null);

  console.log("User data:", user);

  // Fetch data procurement dari API
  const fetchProcurements = useCallback(async (page = 1, status = "", search = "") => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: page,
        per_page: 10,
        ...(status && { status: status }),
        ...(search && { search: search })
      };

      console.log("Fetching procurements with params:", params);
      
      const response = await procurementService.getAllProcurements(params);

      console.log("Full API Response:", response);
      
      // Debug: Tampilkan struktur response
      console.log("Response structure:", {
        hasData: !!response.data,
        isDataArray: Array.isArray(response.data),
        hasMeta: !!response.meta,
        meta: response.meta,
        fullResponse: response
      });

      // PERBAIKAN: Handle berbagai struktur response
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

      console.log("Data to set:", dataToSet);
      console.log("Meta to set:", metaToSet);

      setProcurements(dataToSet);
      
      setPagination({
        current_page: metaToSet.current_page || 1,
        last_page: metaToSet.last_page || 1,
        per_page: metaToSet.per_page || 10,
        total: metaToSet.total || dataToSet.length,
        from: metaToSet.from || null,
        to: metaToSet.to || null,
      });

    } catch (err) {
      console.error("Error fetching procurements:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response,
        status: err.response?.status
      });
      
      setError(err.response?.data?.message || "Gagal memuat data procurement. Silakan coba lagi.");
      setProcurements([]);
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

  // Initial fetch
  useEffect(() => {
    fetchProcurements(1, "", "");
  }, [fetchProcurements]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      fetchProcurements(1, statusFilter, searchValue);
    }, 2000),
    [statusFilter, fetchProcurements]
  );

  // Handle search input change
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    fetchProcurements(1, value, searchTerm);
  };

  const truncateString = (str, maxLength) => {
    if (!str) return "N/A";
    return str.length > maxLength ? str.slice(0, maxLength) + "..." : str;
  };

  // Format status untuk tampilan
  const formatStatus = (status) => {
    const statusMap = {
      draft: "Draft",
      approved: "Disetujui",
      received: "Diterima",
      pending: "Menunggu",
    };
    return statusMap[status] || status;
  };

  // Warna status
  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-slate-50 text-slate-700 border border-slate-200",
      approved: "bg-green-50 text-green-700 border border-green-200",
      received: "bg-blue-50 text-blue-700 border border-blue-200",
      pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    };
    return colors[status] || "bg-slate-50 text-slate-700";
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
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

  // Render icon untuk status persetujuan
  const renderApprovalIcon = (approvalAt) => {
    if (approvalAt === null || !approvalAt) {
      return <Clock className="w-5 h-5 text-slate-500" />;
    } else {
      return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    }
  };

  // Hitung stats dari data real
  const calculateStats = () => {
    const totalProcurement = procurements.reduce(
      (sum, item) => sum + (item.procurement_item?.sub_total || 0),
      0
    );

    const pendingItems = procurements.filter(
      (item) => item.status === "pending" || item.status === "draft"
    ).length;

    const approvedThisMonth = procurements.filter((item) => {
      if (item.status === "approved") {
        const itemDate = new Date(item.date);
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        return (
          itemDate.getMonth() === currentMonth &&
          itemDate.getFullYear() === currentYear
        );
      }
      return false;
    }).length;

    return {
      totalProcurement,
      pendingItems,
      approvedThisMonth
    };
  };

  const stats = calculateStats();

  // Handle pagination
  const handlePageChange = (page) => {
    console.log("Page change requested to:", page);
    console.log("Current pagination:", pagination);
    
    if (page >= 1 && page <= pagination.last_page) {
      fetchProcurements(page, statusFilter, searchTerm);
    } else {
      console.warn("Invalid page number:", page);
    }
  };

  // Handle view detail
  const handleViewDetail = (id) => {
    navigate(`/pengadaan/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/pengadaan/update/${id}`);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus procurement ini?")) {
      try {
        await procurementService.deleteProcurement(id);
        alert("Procurement berhasil dihapus");
        fetchProcurements(pagination.current_page, statusFilter, searchTerm);
      } catch (err) {
        console.error("Error deleting procurement:", err);
        alert(err.response?.data?.message || "Gagal menghapus procurement. Silakan coba lagi.");
      }
    }
  };

  // Buat array untuk mapping kolom
  const approvalColumns = [
    {
      key: 'structural_requester',
      title: 'Kaprodi',
      approvalField: 'approved_by_structural_requester_at',
      role: 'structural requester',
      apiField: 'structural requester'
    },
    {
      key: 'building_manager',
      title: 'Kepala Gedung',
      approvalField: 'approved_by_building_manager_at',
      role: 'building manager',
      apiField: 'building manager'
    },
    {
      key: 'it',
      title: 'IT',
      approvalField: 'approved_by_it_at',
      role: 'it',
      apiField: 'it'
    },
    {
      key: 'finance',
      title: 'Keuangan',
      approvalField: 'approved_by_finance_at',
      role: 'finance',
      apiField: 'finance'
    },
    {
      key: 'procurement_staff',
      title: 'Pengadaan',
      approvalField: 'approved_by_procurement_staff_at',
      role: 'procurement staff',
      apiField: 'procurement staff'
    },
    {
      key: 'warehouse_manager',
      title: 'Kepala Gudang',
      approvalField: 'received_by_warehouse_manager_at',
      role: 'warehouse manager',
      apiField: 'warehouse manager'
    }
  ];

  // Fungsi untuk mendapatkan role user dari data
  const getUserRole = () => {
    if (user?.role) {
      return user.role.toLowerCase();
    }

    if (user?.data?.role) {
      return user.data.role.toLowerCase();
    }

    if (user?.data?.abilities) {
      const abilities = user.data.abilities;
      
      if (abilities.includes('super-admin') || abilities.includes('super admin')) {
        return 'super admin';
      }
      if (abilities.includes('structural-requester') || abilities.includes('structural requester')) {
        return 'structural requester';
      }
      if (abilities.includes('building-manager') || abilities.includes('building manager')) {
        return 'building manager';
      }
      if (abilities.includes('it')) {
        return 'it';
      }
      if (abilities.includes('finance')) {
        return 'finance';
      }
      if (abilities.includes('procurement-staff') || abilities.includes('procurement staff')) {
        return 'procurement staff';
      }
      if (abilities.includes('warehouse-manager') || abilities.includes('warehouse manager')) {
        return 'warehouse manager';
      }
    }

    return "requester";
  };

  // Fungsi handleApproval
  // Fungsi handleApproval yang diperbaiki
  const handleApproval = async (columnKey, procurementId) => {
    try {
      setApproving(true);
      setApprovalError(null);

      console.log('Starting approval process...', {
        columnKey,
        procurementId,
        currentUserRole: getUserRole()
      });

      if (!procurementId) {
        throw new Error("ID procurement tidak ditemukan");
      }

      const column = approvalColumns.find(col => col.key === columnKey);
      if (!column) {
        throw new Error(`Kolom approval tidak ditemukan: ${columnKey}`);
      }

      const currentUserRole = getUserRole();
      const isSuperAdmin = currentUserRole === 'super admin';
      
      // Cek authorization - lebih fleksibel
      if (!isSuperAdmin && currentUserRole !== column.role) {
        throw new Error(`Anda tidak memiliki izin untuk menyetujui sebagai ${column.title}`);
      }

      // Cari procurement yang akan di-approve
      const procurement = procurements.find(p => p.id === procurementId);
      if (!procurement) {
        throw new Error("Data procurement tidak ditemukan");
      }

      // Cek apakah sudah disetujui (cek di procurement_item jika ada)
      const approvalField = column.approvalField;
      const isAlreadyApproved = procurement.procurement_item && 
                                procurement.procurement_item[approvalField] !== null &&
                                procurement.procurement_item[approvalField] !== undefined;

      if (isAlreadyApproved) {
        throw new Error(`Sudah disetujui/diterima oleh ${column.title}`);
      }

      // 1. Optimistic update
      setProcurements(prev => prev.map(item => {
        if (item.id === procurementId) {
          const updatedItem = { ...item };
          
          if (updatedItem.procurement_item) {
            updatedItem.procurement_item = {
              ...updatedItem.procurement_item,
              [approvalField]: new Date().toISOString()
            };
            
            // Update status jika semua sudah disetujui atau diterima
            if (columnKey === 'warehouse_manager') {
              updatedItem.status = 'received';
            } else if (updatedItem.status === 'draft') {
              updatedItem.status = 'pending';
            }
          }
          
          return updatedItem;
        }
        return item;
      }));

      // 2. Kirim request approval ke backend
      let response;
      let successMessage = '';
      
      if (columnKey === 'warehouse_manager') {
        // Gunakan markAsReceived untuk warehouse manager
        response = await procurementService.markAsReceived(procurementId);
        successMessage = `Berhasil menandai sebagai diterima oleh ${column.title}!`;
      } else {
        // Gunakan approveProcurement untuk role lainnya
        response = await procurementService.approveProcurement(
          procurementId,
          column.apiField
        );
        successMessage = `Berhasil menyetujui sebagai ${column.title}!`;
      }

      console.log('Approval response:', response);

      // 3. Tampilkan pesan sukses
      alert(successMessage);

      // 4. Refresh data setelah delay kecil
      setTimeout(() => {
        fetchProcurements(pagination.current_page, statusFilter, searchTerm);
      }, 500);

    } catch (err) {
      console.error("Approval error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });

      // Rollback optimistic update
      fetchProcurements(pagination.current_page, statusFilter, searchTerm);

      let errorMessage = 'Terjadi kesalahan saat proses persetujuan';
      
      // Handle error messages lebih baik
      if (err.response?.data) {
        if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setApprovalError(errorMessage);
      alert("Gagal: " + errorMessage);
    } finally {
      setApproving(false);
    }
  };
  // Fungsi renderApprovalButton yang diperbaiki
  const renderApprovalButton = (procurement, columnKey) => {
    const column = approvalColumns.find(col => col.key === columnKey);
    if (!column || !procurement) return null;

    // Cek apakah sudah disetujui
    const isApproved = procurement?.procurement_item?.[column.approvalField] !== null;
    
    const currentUserRole = getUserRole();
    const isSuperAdmin = currentUserRole === 'super admin';
    
    // Cek apakah user bisa approve berdasarkan role
    const canApproveByRole = isSuperAdmin || currentUserRole === column.role;
    
    // Cek apakah procurement dalam status yang memungkinkan untuk approval
    let canApprove = canApproveByRole && !isApproved;
    
    // Validasi status sebelum menampilkan tombol
    if (canApprove) {
      // Jika ini adalah kolom "Diterima Kepala Gudang" (warehouse_manager)
      if (columnKey === 'warehouse_manager') {
        // Hanya tampilkan tombol "Diterima" jika status sudah "approved"
        if (procurement.status !== 'approved') {
          return null; // Jangan tampilkan tombol sama sekali
        }
      } else {
        // Untuk kolom persetujuan lainnya, hanya tampilkan jika status draft atau pending
        if (!['draft', 'pending'].includes(procurement.status)) {
          return null; // Jangan tampilkan tombol sama sekali
        }
      }
    }

    if (canApprove) {
      // Tentukan teks dan styling berdasarkan jenis tombol
      const isWarehouseManager = columnKey === 'warehouse_manager';
      
      return (
        <button 
          disabled={approving}
          className={`
            relative
            px-3 py-1.5 text-xs font-medium text-white rounded-lg 
            transition-all duration-200 ease-out mt-2
            cursor-pointer
            bg-gradient-to-r 
            ${isSuperAdmin 
              ? 'from-purple-500 to-purple-600' 
              : isWarehouseManager
              ? 'from-green-500 to-green-600'
              : 'from-blue-500 to-blue-600'
            }
            hover:shadow-lg
            ${isSuperAdmin 
              ? 'hover:shadow-purple-500/30 hover:from-purple-600 hover:to-purple-700' 
              : isWarehouseManager
              ? 'hover:shadow-green-500/30 hover:from-green-600 hover:to-green-700'
              : 'hover:shadow-blue-500/30 hover:from-blue-600 hover:to-blue-700'
            }
            active:scale-[0.98]
            focus:outline-none focus:ring-2 focus:ring-offset-1
            ${isSuperAdmin 
              ? 'focus:ring-purple-400' 
              : isWarehouseManager
              ? 'focus:ring-green-400'
              : 'focus:ring-blue-400'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
            group
          `}
          onClick={() => handleApproval(columnKey, procurement.id)}
          title={`${isWarehouseManager ? 'Tandai Diterima' : 'Setujui'} sebagai ${column.title}`}
        >
          <span className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
          
          <span className="relative flex items-center justify-center">
            {approving ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                Menyimpan...
              </>
            ) : (
              <>
                {isSuperAdmin 
                  ? `Setujui (Super Admin)` 
                  : isWarehouseManager
                  ? 'Tandai Diterima'
                  : 'Setujui'
                }
              </>
            )}
          </span>
        </button>
      );
    }

    return null;
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
      return "Tidak ada data pengadaan";
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
        pengadaan
        <span className="text-slate-500 ml-2">
          (Halaman {current_page} dari {last_page})
        </span>
        {(statusFilter || searchTerm) && (
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
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-slate-50 via-white to-cyan-50/30">
          <div className="max-w-7xl mx-auto">
            {/* Page Title */}
            <div className="mb-8 animate-fade-in">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Pengadaan
              </h1>
              <p className="text-slate-600 text-lg">
                Kelola proses pengadaan dan pembelian barang
              </p>
            </div>

            {/* Approval Error */}
            {approvalError && (
              <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>{approvalError}</span>
                <button
                  onClick={() => setApprovalError(null)}
                  className="ml-auto text-amber-600 hover:text-amber-800"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Procurement Table */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              {/* Table Header */}
              <div className="px-6 py-4 border-b border-slate-200/60 bg-white/50">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="mb-4 lg:mb-0">
                    <h2 className="text-xl font-bold text-slate-900">
                      Daftar Pengadaan
                    </h2>
                    <p className="text-slate-600 text-sm">
                      Total: {pagination.total} pengadaan
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                    {/* Search */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Cari pengadaan..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 w-full lg:w-64"
                      />
                    </div>

                    {/* Filter Status */}
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2 z-10" />
                        <select
                          value={statusFilter}
                          onChange={(e) => handleStatusFilterChange(e.target.value)}
                          className="pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 appearance-none cursor-pointer w-full lg:w-48"
                        >
                          <option value="">Semua Status</option>
                          <option value="draft">Draft</option>
                          <option value="approved">Disetujui</option>
                          <option value="received">Diterima</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                      </div>

                      <button
                        onClick={() => navigate("/pengadaan/create")}
                        className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Pengadaan
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-slate-600">Memuat data...</span>
                </div>
              )}

              {/* Table Content */}
              {!loading && (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-slate-300 rounded-lg overflow-hidden">
                      <thead className="bg-slate-100/70 backdrop-blur-sm">
                        <tr>
                          <th
                            rowSpan="2"
                            className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border border-slate-300"
                          >
                            Item
                          </th>

                          {/* Header utama digabung */}
                          <th
                            colSpan="5"
                            className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider border border-slate-300"
                          >
                            Persetujuan
                          </th>

                          <th
                            rowSpan="2"
                            className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border border-slate-300"
                          >
                            Diterima Kepala Gudang
                          </th>
                          <th
                            rowSpan="2"
                            className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border border-slate-300"
                          >
                            Status
                          </th>
                          <th
                            rowSpan="2"
                            className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border border-slate-300"
                          >
                            Tanggal
                          </th>
                          <th
                            rowSpan="2"
                            className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border border-slate-300"
                          >
                            Aksi
                          </th>
                        </tr>

                        {/* Sub-Header */}
                        <tr>
                          <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider border border-slate-300">
                            Kaprodi
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider border border-slate-300">
                            Kepala Gedung
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider border border-slate-300">
                            IT
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider border border-slate-300">
                            Keuangan
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider border border-slate-300">
                            Pengadaan
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-200/60">
                        {procurements.length > 0 ? (
                          procurements.map((procurement) => (
                            <tr
                              key={procurement.id}
                              className="hover:bg-slate-50/50 transition-colors duration-300"
                            >
                              {/* Kolom Item */}
                              <td className="px-6 py-4 whitespace-nowrap border border-slate-300">
                                <div className="flex items-center space-x-3">
                                  {procurement.procurement_item?.image && (
                                    <img
                                      src={`http://localhost:8000/${procurement.procurement_item.image}`}
                                      alt={procurement.procurement_item.item_name}
                                      className="w-10 h-10 rounded-lg object-cover"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                  )}
                                  <div>
                                    <div className="text-sm font-semibold text-slate-900">
                                      {truncateString(
                                        procurement.procurement_item?.item_name || "No Item Name",
                                        30
                                      )}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      Qty: {procurement.procurement_item?.quantity || 0} unit
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      {formatCurrency(procurement.procurement_item?.sub_total || 0)}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Kolom Persetujuan - Kaprodi */}
                              <td className="px-6 py-4 whitespace-nowrap text-center border border-slate-300">
                                <div className="flex justify-center">
                                  {renderApprovalIcon(
                                    procurement?.procurement_item?.approved_by_structural_requester_at
                                  )}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                  {procurement?.procurement_item?.approved_by_structural_requester_at
                                    ? "Disetujui"
                                    : "Menunggu"}
                                </div>
                                {renderApprovalButton(procurement, 'structural_requester')}
                              </td>

                              {/* Kolom Persetujuan - Kepala Gedung */}
                              <td className="px-6 py-4 whitespace-nowrap text-center border border-slate-300">
                                <div className="flex justify-center">
                                  {renderApprovalIcon(
                                    procurement?.procurement_item?.approved_by_building_manager_at
                                  )}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                  {procurement?.procurement_item?.approved_by_building_manager_at
                                    ? "Disetujui"
                                    : "Menunggu"}
                                </div>
                                {renderApprovalButton(procurement, 'building_manager')}
                              </td>

                              {/* Kolom Persetujuan - IT */}
                              <td className="px-6 py-4 whitespace-nowrap text-center border border-slate-300">
                                <div className="flex justify-center">
                                  {renderApprovalIcon(
                                    procurement?.procurement_item?.approved_by_it_at
                                  )}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                  {procurement?.procurement_item?.approved_by_it_at
                                    ? "Disetujui"
                                    : "Menunggu"}
                                </div>
                                {renderApprovalButton(procurement, 'it')}
                              </td>

                              {/* Kolom Persetujuan - Keuangan */}
                              <td className="px-6 py-4 whitespace-nowrap text-center border border-slate-300">
                                <div className="flex justify-center">
                                  {renderApprovalIcon(
                                    procurement?.procurement_item?.approved_by_finance_at
                                  )}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                  {procurement?.procurement_item?.approved_by_finance_at
                                    ? "Disetujui"
                                    : "Menunggu"}
                                </div>
                                {renderApprovalButton(procurement, 'finance')}
                              </td>

                              {/* Kolom Persetujuan - Pengadaan */}
                              <td className="px-6 py-4 whitespace-nowrap text-center border border-slate-300">
                                <div className="flex justify-center">
                                  {renderApprovalIcon(
                                    procurement?.procurement_item?.approved_by_procurement_staff_at
                                  )}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                  {procurement?.procurement_item?.approved_by_procurement_staff_at
                                    ? "Disetujui"
                                    : "Menunggu"}
                                </div>
                                {renderApprovalButton(procurement, 'procurement_staff')}
                              </td>

                              {/* Kolom Persetujuan - Kepala Gudang */}
                              <td className="px-6 py-4 whitespace-nowrap text-center border border-slate-300">
                                <div className="flex justify-center">
                                  {renderApprovalIcon(
                                    procurement?.procurement_item?.received_by_warehouse_manager_at
                                  )}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                  {procurement?.procurement_item?.received_by_warehouse_manager_at
                                    ? "Diterima"
                                    : "Menunggu"}
                                </div>
                                {renderApprovalButton(procurement, 'warehouse_manager')}
                              </td>

                              {/* Kolom Status */}
                              <td className="px-6 py-4 whitespace-nowrap border border-slate-300">
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                    procurement.status
                                  )}`}
                                >
                                  <div
                                    className={`w-1.5 h-1.5 rounded-full mr-2 ${
                                      procurement.status === "draft"
                                        ? "bg-slate-500"
                                        : procurement.status === "approved"
                                        ? "bg-emerald-500"
                                        : procurement.status === "received"
                                        ? "bg-blue-500"
                                        : procurement.status === "pending"
                                        ? "bg-yellow-500"
                                        : "bg-slate-500"
                                    }`}
                                  ></div>
                                  {formatStatus(procurement.status)}
                                </span>
                              </td>

                              {/* Kolom Tanggal */}
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 border border-slate-300">
                                {formatDate(procurement.date)}
                              </td>

                              {/* Kolom Aksi */}
                              <td className="px-6 py-4 whitespace-nowrap border border-slate-300">
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleViewDetail(procurement.id)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                    title="Lihat Detail"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  {procurement.status === 'draft' && (
                                    <>
                                      <button
                                        onClick={() => handleEdit(procurement.id)}
                                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                                        title="Edit"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDelete(procurement.id)}
                                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                        title="Hapus"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="10" className="px-6 py-12 text-center text-slate-500">
                              Tidak ada data pengadaan
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

                          {/* Generate pagination numbers (maksimal 5) */}
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
                                          ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
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
                                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
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
                                          ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
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

              {/* Empty State */}
              {!loading && procurements.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">Tidak ada data pengadaan</p>
                  <button
                    onClick={() => navigate("/pengadaan/create")}
                    className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                  >
                    Buat Pengadaan Pertama
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Pengadaan;