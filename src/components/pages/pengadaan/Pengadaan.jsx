// src/pages/Pengadaan.js
import { useNavigate } from "react-router-dom";
import Sidebar from "../../layouts/Sidebar";
import Header from "../../layouts/Header";
import { procurementService } from "../../../services/procurementService";
// src/pages/Pengadaan.js
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
} from "lucide-react";

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
      pending: "Menunggu",
      approved: "Disetujui",
      rejected: "Ditolak",
      completed: "Selesai",
    };
    return statusMap[status] || status;
  };

  // Warna status
  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-slate-50 text-slate-700 border border-slate-200",
      pending: "bg-amber-50 text-amber-700 border border-amber-200",
      approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      rejected: "bg-rose-50 text-rose-700 border border-rose-200",
      completed: "bg-green-50 text-green-700 border border-green-200",
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

  // Simulasi status persetujuan (disesuaikan dengan data real nanti)
  const getApprovalStatus = (procurement) => {
    // Ini adalah contoh - sesuaikan dengan struktur data approval yang sebenarnya
    return {
      kaprodi: procurement.procurement_item?.approved_by_structural_requester_at
        ? "approved"
        : "pending",
      keuangan: Math.random() > 0.5 ? "approved" : "pending",
      pengadaan: Math.random() > 0.3 ? "approved" : "pending",
      it: Math.random() > 0.7 ? "approved" : "pending",
    };
  };

  // Render icon untuk status persetujuan
  const renderApprovalIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-rose-500" />;
      default:
        return <Clock className="w-5 h-5 text-amber-500" />;
    }
  };

  // Filter data berdasarkan pencarian
  const filteredData = procurements.filter(
    (item) =>
      item.procurement_item?.item_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      item.procurement_item?.notes
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      item.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

    // Simulasi total savings (bisa disesuaikan dengan logika bisnis)
    const totalSavings = totalProcurement * 0.1; // 10% dari total procurement

    return [
      {
        title: "Total Procurement",
        value: formatCurrency(totalProcurement),
        change: "+15%",
        trend: "up",
        icon: ShoppingCart,
        color: "blue",
      },
      {
        title: "Pending Items",
        value: pendingItems.toString(),
        change: pendingItems > 0 ? "+2%" : "-2%",
        trend: pendingItems > 0 ? "up" : "down",
        icon: Package,
        color: "amber",
      },
      {
        title: "Approved This Month",
        value: approvedThisMonth.toString(),
        change: "+8%",
        trend: "up",
        icon: Calendar,
        color: "emerald",
      },
      {
        title: "Total Savings",
        value: formatCurrency(totalSavings),
        change: "+22%",
        trend: "up",
        icon: DollarSign,
        color: "green",
      },
    ];
  };

  const stats = calculateStats();

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
    // Navigasi ke halaman update dengan membawa ID
    navigate(`/pengadaan/update/${id}`);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus procurement ini?")) {
      try {
        await procurementService.deleteProcurement(id);
        fetchProcurements(pagination.current_page); // Refresh data
      } catch (err) {
        console.error("Error deleting procurement:", err);
        alert("Gagal menghapus procurement. Silakan coba lagi.");
      }
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

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm hover-lift"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-medium mb-1">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-slate-900 mb-2">
                        {stat.value}
                      </p>
                      <span
                        className={`text-xs font-semibold ${
                          stat.trend === "up"
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        {stat.change}
                      </span>
                    </div>
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-r ${
                        stat.color === "blue"
                          ? "from-blue-500 to-cyan-500"
                          : stat.color === "amber"
                          ? "from-amber-500 to-orange-500"
                          : stat.color === "emerald"
                          ? "from-emerald-500 to-green-500"
                          : "from-green-500 to-emerald-500"
                      }`}
                    >
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

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

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button className="p-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
                        <Filter className="w-4 h-4" />
                      </button>
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
                          const approvalStatus = getApprovalStatus(procurement);

                          return (
                            <tr
                              key={procurement.id}
                              className="hover:bg-slate-50/50 transition-colors duration-300"
                            >
                              {/* Kolom Item */}
                              <td className="px-6 py-4 whitespace-nowrap border border-slate-300">
                                <div className="flex items-center space-x-3">
                                  {procurement.procurement_item?.image_url && (
                                    <img
                                      src={`http://localhost:8000/${procurement.procurement_item.image_url}`}
                                      alt={
                                        procurement.procurement_item.item_name
                                      }
                                      className="w-10 h-10 rounded-lg object-cover"
                                    />
                                  )}
                                  <div>
                                    <div className="text-sm font-semibold text-slate-900">
                                      {truncateString(
                                        procurement.procurement_item?.item_name,
                                        30
                                      ) || "No Item Name"}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      Qty:{" "}
                                      {procurement.procurement_item?.quantity}{" "}
                                      unit
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      {formatCurrency(
                                        procurement.procurement_item
                                          ?.sub_total || 0
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Kolom Persetujuan - Kaprodi */}
                              <td className="px-6 py-4 whitespace-nowrap text-center border border-slate-300">
                                <div className="flex justify-center">
                                  {renderApprovalIcon(approvalStatus.kaprodi)}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                  {approvalStatus.kaprodi === "approved"
                                    ? "Disetujui"
                                    : approvalStatus.kaprodi === "rejected"
                                    ? "Ditolak"
                                    : "Menunggu"}
                                </div>
                              </td>

                              {/* Kolom Persetujuan - Kepala Gedung */}
                              <td className="px-6 py-4 whitespace-nowrap text-center border border-slate-300">
                                <div className="flex justify-center">
                                  {renderApprovalIcon(approvalStatus.it)}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                  {approvalStatus.it === "approved"
                                    ? "Disetujui"
                                    : approvalStatus.it === "rejected"
                                    ? "Ditolak"
                                    : "Menunggu"}
                                </div>
                              </td>

                              {/* Kolom Persetujuan - IT */}
                              <td className="px-6 py-4 whitespace-nowrap text-center border border-slate-300">
                                <div className="flex justify-center">
                                  {renderApprovalIcon(approvalStatus.it)}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                  {approvalStatus.it === "approved"
                                    ? "Disetujui"
                                    : approvalStatus.it === "rejected"
                                    ? "Ditolak"
                                    : "Menunggu"}
                                </div>
                              </td>

                              {/* Kolom Persetujuan - Keuangan */}
                              <td className="px-6 py-4 whitespace-nowrap text-center border border-slate-300">
                                <div className="flex justify-center">
                                  {renderApprovalIcon(approvalStatus.keuangan)}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                  {approvalStatus.keuangan === "approved"
                                    ? "Disetujui"
                                    : approvalStatus.keuangan === "rejected"
                                    ? "Ditolak"
                                    : "Menunggu"}
                                </div>
                              </td>

                              {/* Kolom Persetujuan - Pengadaan */}
                              <td className="px-6 py-4 whitespace-nowrap text-center border border-slate-300">
                                <div className="flex justify-center">
                                  {renderApprovalIcon(approvalStatus.pengadaan)}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                  {approvalStatus.pengadaan === "approved"
                                    ? "Disetujui"
                                    : approvalStatus.pengadaan === "rejected"
                                    ? "Ditolak"
                                    : "Menunggu"}
                                </div>
                              </td>
                              {/* Kolom Persetujuan - Kepala Gedung */}
                              <td className="px-6 py-4 whitespace-nowrap text-center border border-slate-300">
                                <div className="flex justify-center">
                                  {renderApprovalIcon(approvalStatus.pengadaan)}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                  {approvalStatus.pengadaan === "approved"
                                    ? "Disetujui"
                                    : approvalStatus.pengadaan === "rejected"
                                    ? "Ditolak"
                                    : "Menunggu"}
                                </div>
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
                                      procurement.status === "approved"
                                        ? "bg-emerald-500"
                                        : procurement.status === "pending"
                                        ? "bg-amber-500"
                                        : procurement.status === "draft"
                                        ? "bg-slate-500"
                                        : procurement.status === "rejected"
                                        ? "bg-rose-500"
                                        : "bg-green-500"
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
                                    onClick={() =>
                                      handleViewDetail(procurement.id)
                                    }
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
                          onClick={() =>
                            handlePageChange(pagination.current_page - 1)
                          }
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
                          onClick={() =>
                            handlePageChange(pagination.current_page + 1)
                          }
                          disabled={
                            pagination.current_page === pagination.last_page
                          }
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
