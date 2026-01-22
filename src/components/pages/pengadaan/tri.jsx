// src/pages/Pengadaan.js
import { useNavigate } from "react-router-dom";
import Sidebar from "../../layouts/Sidebar";
import Header from "../../layouts/Header";
import { procurementService } from "../../../services/procurementService";
import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { useAuthStore } from "../../../store/useAuthStore";

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
  });
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState("");

  console.log("User:", user);

  // Fetch data procurement dari API
  const fetchProcurements = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await procurementService.getAllProcurements(page);

      setProcurements(response.data);
      setPagination(response.meta);
    } catch (err) {
      console.error("Error fetching procurements:", err);
      setError("Gagal memuat data procurement. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcurements();
  }, []);

  const truncateString = (str, maxLength) => {
    return str.length > maxLength ? str.slice(0, maxLength) + "..." : str;
  };

  // Format status untuk tampilan
  const formatStatus = (status) => {
    const statusMap = {
      draft: "Draft",
      approved: "Disetujui",
      received: "Diterima",
    };
    return statusMap[status] || status;
  };

  // Warna status
  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-slate-50 text-slate-700 border border-slate-200",
      approved: "bg-green-50 text-green-700 border border-green-200",
      received: "bg-blue-50 text-blue-700 border border-blue-200", // Ditambahkan untuk 'received'
    };
    return colors[status] || "bg-slate-50 text-slate-700";
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Render icon untuk status persetujuan
  const renderApprovalIcon = (approvalAt) => {
    if (approvalAt === null) {
      return <Clock className="w-5 h-5 text-slate-500" />;
    } else {
      return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    }
  };

  // Filter data berdasarkan pencarian DAN status
  const filteredData = procurements.filter((item) => {
    // Filter pencarian
    const searchMatch =
      item.procurement_item?.item_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      item.procurement_item?.notes
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      item.status?.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter status
    const statusMatch = statusFilter === "" || item.status === statusFilter;

    return searchMatch && statusMatch;
  });

  // Hitung stats dari data real (diperbaiki)
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

    // Return stats object
    return {
      totalProcurement,
      pendingItems,
      approvedThisMonth
    };
  };

  const stats = calculateStats(); // Simpan stats ke variable

  // Handle pagination
  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.last_page) {
      fetchProcurements(page);
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
        fetchProcurements(pagination.current_page);
      } catch (err) {
        console.error("Error deleting procurement:", err);
        alert("Gagal menghapus procurement. Silakan coba lagi.");
      }
    }
  };

  // Buat array untuk mapping kolom
  const approvalColumns = [
    {
      key: 'structural_requester',
      title: 'Kaprodi',
      approvalField: 'approved_by_structural_requester_at',
      role: 'structural requester'
    },
    {
      key: 'building_manager',
      title: 'Kepala Gedung',
      approvalField: 'approved_by_building_manager_at',
      role: 'building manager'
    },
    {
      key: 'it',
      title: 'IT',
      approvalField: 'approved_by_it_at',
      role: 'it'
    },
    {
      key: 'finance',
      title: 'Keuangan',
      approvalField: 'approved_by_finance_at',
      role: 'finance'
    },
    {
      key: 'procurement_staff',
      title: 'Pengadaan',
      approvalField: 'approved_by_procurement_staff_at',
      role: 'procurement staff'
    },
    {
      key: 'warehouse_manager',
      title: 'Kepala Gudang',
      approvalField: 'received_by_warehouse_manager_at',
      role: 'warehouse manager'
    }
  ];

  // Fungsi renderApprovalButton yang lebih sederhana
  const renderApprovalButton = (procurementItem, userRole, columnKey) => {
    const column = approvalColumns.find(col => col.key === columnKey);
    if (!column) return null;

    const isApproved = procurementItem?.[column.approvalField] !== null;
    const canApprove = userRole === column.role || userRole === 'super admin';

    if (canApprove && !isApproved) {
      const isSuperAdmin = userRole === 'super admin';
      
      return (
        <button 
          className={`
            relative
            px-3 py-1.5 text-xs font-medium text-white rounded-lg 
            transition-all duration-200 ease-out mt-2
            cursor-pointer
            bg-gradient-to-r 
            ${isSuperAdmin 
              ? 'from-purple-500 to-purple-600' 
              : 'from-blue-500 to-blue-600'
            }
            hover:shadow-lg
            ${isSuperAdmin 
              ? 'hover:shadow-purple-500/30 hover:from-purple-600 hover:to-purple-700' 
              : 'hover:shadow-blue-500/30 hover:from-blue-600 hover:to-blue-700'
            }
            active:scale-[0.98]
            focus:outline-none focus:ring-2 focus:ring-offset-1
            ${isSuperAdmin ? 'focus:ring-purple-400' : 'focus:ring-blue-400'}
            disabled:opacity-50 disabled:cursor-not-allowed
            group
          `}
          onClick={() => handleApproval(columnKey, procurementItem.id)}
          title={`Setujui sebagai ${column.title}`}
        >
          <span className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
          
          <span className="relative flex items-center justify-center">
            {isSuperAdmin ? 'Setujui Semua' : 'Setujui'}
          </span>
        </button>
      );
    }

    return null;
  };
  
  // Fungsi untuk mendapatkan role user dari data
  const getUserRole = (userData) => {
    console.log("Getting role from:", userData);

    if (userData?.data?.role) {
      console.log("Found role in user.data.role:", userData.data.role);
      return userData.data.role.toLowerCase();
    }

    if (userData?.data?.abilities) {
      const abilities = userData.data.abilities;
      console.log("Abilities:", abilities);

      for (let ability of abilities) {
        if (ability.includes("super admin")) return "super admin";
        if (ability.includes("structural requester")) return "structural requester";
        if (ability.includes("building manager")) return "building manager";
        if (ability.includes("it")) return "it";
        if (ability.includes("finance")) return "finance";
        if (ability.includes("procurement staff")) return "procurement staff";
        if (ability.includes("warehouse manager")) return "warehouse manager";
        if (ability.includes("technician")) return "technician";
        if (ability.includes("requester")) return "requester";
      }

      for (let ability of abilities) {
        if (ability.includes("super-admin")) return "super admin";
        if (ability.includes("structural-requester")) return "structural requester";
        if (ability.includes("building-manager")) return "building manager";
        if (ability.includes("procurement-staff")) return "procurement staff";
        if (ability.includes("warehouse-manager")) return "warehouse manager";
      }
    }

    console.log("No role found, defaulting to requester");
    return "requester";
  };

  // Fungsi handleApproval
  const handleApproval = async (approvalType, procurementId) => {
    try {
      console.log('Starting approval...');
      
      // 1. Optimistic update
      setProcurements(prev => prev.map(item => {
        if (item.id === procurementId && item.procurement_item) {
          const column = approvalColumns.find(col => col.key === approvalType);
          if (column) {
            return {
              ...item,
              procurement_item: {
                ...item.procurement_item,
                [column.approvalField]: new Date().toISOString()
              }
            };
          }
        }
        return item;
      }));
      
      // 2. Send request
      const response = await procurementService.approveProcurementItem(procurementId, {
        approval_type: approvalType,
        approved_by_role: getUserRole(user)
      });
      
      console.log('API Response:', response);
      
      // 3. Assume success if no error thrown
      alert('Berhasil menyetujui!');
      
      // 4. Refresh data after delay
      setTimeout(() => {
        fetchProcurements(pagination.current_page);
      }, 500);
      
    } catch (err) {
      console.error("Approval error:", err);
      
      const errorMsg = err.response?.data?.message || 
                      err.response?.data?.error || 
                      err.message || 
                      'Terjadi kesalahan';
      
      alert("Gagal menyetujui: " + errorMsg);
      
      // Refresh to get actual state
      fetchProcurements(pagination.current_page);
    }
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

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl">
                {error}
                <button
                  onClick={() => fetchProcurements()}
                  className="ml-2 text-rose-600 hover:text-rose-800 underline"
                >
                  Coba lagi
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
                      Kelola semua proses pengadaan perusahaan
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
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 w-full lg:w-64"
                      />
                    </div>

                    {/* Filter Status dan Actions */}
                    <div className="flex items-center space-x-2">
                      {/* Filter Status dengan Badge */}
                      <div className="relative group">
                        <div className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl hover:border-blue-300 transition-all duration-300 cursor-pointer group-hover:shadow-sm">
                          <Filter className="w-4 h-4 text-slate-500" />
                          <span className="text-sm text-slate-700 font-medium">
                            {statusFilter 
                              ? statusFilter === "draft" ? "Draft" 
                                : statusFilter === "approved" ? "Disetujui" 
                                : "Diterima"
                              : "Filter Status"
                            }
                          </span>
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        </div>
                        
                        {/* Dropdown Menu */}
                        <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                          <div className="py-2">
                            <button
                              onClick={() => setStatusFilter("")}
                              className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors ${
                                statusFilter === "" ? "text-blue-600 font-medium" : "text-slate-700"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span>Semua Status</span>
                                {statusFilter === "" && <CheckCircle className="w-4 h-4" />}
                              </div>
                            </button>
                            <button
                              onClick={() => setStatusFilter("draft")}
                              className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors ${
                                statusFilter === "draft" ? "text-blue-600 font-medium" : "text-slate-700"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span>Draft</span>
                                {statusFilter === "draft" && <CheckCircle className="w-4 h-4" />}
                              </div>
                            </button>
                            <button
                              onClick={() => setStatusFilter("approved")}
                              className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors ${
                                statusFilter === "approved" ? "text-blue-600 font-medium" : "text-slate-700"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span>Disetujui</span>
                                {statusFilter === "approved" && <CheckCircle className="w-4 h-4" />}
                              </div>
                            </button>
                            <button
                              onClick={() => setStatusFilter("received")}
                              className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors ${
                                statusFilter === "received" ? "text-blue-600 font-medium" : "text-slate-700"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span>Diterima</span>
                                {statusFilter === "received" && <CheckCircle className="w-4 h-4" />}
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>

                      <button className="p-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>

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
                        {filteredData.map((procurement) => {
                          return (
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
                                  {procurement?.procurement_item?.approved_by_structural_requester_at !== null
                                    ? "Disetujui"
                                    : "Menunggu"}
                                </div>
                                {renderApprovalButton(
                                  procurement?.procurement_item,
                                  getUserRole(user),
                                  'structural_requester'
                                )}
                              </td>

                              {/* Kolom Persetujuan - Kepala Gedung */}
                              <td className="px-6 py-4 whitespace-nowrap text-center border border-slate-300">
                                <div className="flex justify-center">
                                  {renderApprovalIcon(
                                    procurement?.procurement_item?.approved_by_building_manager_at
                                  )}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                  {procurement?.procurement_item?.approved_by_building_manager_at !== null
                                    ? "Disetujui"
                                    : "Menunggu"}
                                </div>
                                {renderApprovalButton(
                                  procurement?.procurement_item,
                                  getUserRole(user),
                                  'building_manager'
                                )}
                              </td>

                              {/* Kolom Persetujuan - IT */}
                              <td className="px-6 py-4 whitespace-nowrap text-center border border-slate-300">
                                <div className="flex justify-center">
                                  {renderApprovalIcon(
                                    procurement?.procurement_item?.approved_by_it_at
                                  )}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                  {procurement?.procurement_item?.approved_by_it_at !== null
                                    ? "Disetujui"
                                    : "Menunggu"}
                                </div>
                                {renderApprovalButton(
                                  procurement?.procurement_item,
                                  getUserRole(user),
                                  'it'
                                )}
                              </td>

                              {/* Kolom Persetujuan - Keuangan */}
                              <td className="px-6 py-4 whitespace-nowrap text-center border border-slate-300">
                                <div className="flex justify-center">
                                  {renderApprovalIcon(
                                    procurement?.procurement_item?.approved_by_finance_at
                                  )}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                  {procurement?.procurement_item?.approved_by_finance_at !== null
                                    ? "Disetujui"
                                    : "Menunggu"}
                                </div>
                                {renderApprovalButton(
                                  procurement?.procurement_item,
                                  getUserRole(user),
                                  'finance'
                                )}
                              </td>

                              {/* Kolom Persetujuan - Pengadaan */}
                              <td className="px-6 py-4 whitespace-nowrap text-center border border-slate-300">
                                <div className="flex justify-center">
                                  {renderApprovalIcon(
                                    procurement?.procurement_item?.approved_by_procurement_staff_at
                                  )}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                  {procurement?.procurement_item?.approved_by_procurement_staff_at !== null
                                    ? "Disetujui"
                                    : "Menunggu"}
                                </div>
                                {renderApprovalButton(
                                  procurement?.procurement_item,
                                  getUserRole(user),
                                  'procurement_staff'
                                )}
                              </td>

                              {/* Kolom Persetujuan - Kepala Gudang */}
                              <td className="px-6 py-4 whitespace-nowrap text-center border border-slate-300">
                                <div className="flex justify-center">
                                  {renderApprovalIcon(
                                    procurement?.procurement_item?.received_by_warehouse_manager_at
                                  )}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                  {procurement?.procurement_item?.received_by_warehouse_manager_at !== null
                                    ? "Disetujui"
                                    : "Menunggu"}
                                </div>
                                {renderApprovalButton(
                                  procurement?.procurement_item,
                                  getUserRole(user),
                                  'warehouse_manager'
                                )}
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
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Footer dengan Pagination */}
                  <div className="px-6 py-4 border-t border-slate-200/60 bg-white/50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-sm text-slate-600 mb-4 sm:mb-0">
                        Menampilkan{" "}
                        <span className="font-semibold">
                          {filteredData.length}
                        </span>{" "}
                        dari{" "}
                        <span className="font-semibold">
                          {pagination.total}
                        </span>{" "}
                        pengadaan
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePageChange(pagination.current_page - 1)}
                          disabled={pagination.current_page === 1}
                          className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                          Sebelumnya
                        </button>

                        {[...Array(pagination.last_page)].map((_, index) => (
                          <button
                            key={index + 1}
                            onClick={() => handlePageChange(index + 1)}
                            className={`px-4 py-2 rounded-xl font-medium ${
                              pagination.current_page === index + 1
                                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                                : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                            } transition-colors`}
                          >
                            {index + 1}
                          </button>
                        ))}

                        <button
                          onClick={() => handlePageChange(pagination.current_page + 1)}
                          disabled={pagination.current_page === pagination.last_page}
                          className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                          Selanjutnya
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Empty State */}
              {!loading && filteredData.length === 0 && (
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