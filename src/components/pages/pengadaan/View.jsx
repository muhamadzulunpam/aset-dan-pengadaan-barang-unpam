// src/pages/procurements/View.js
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Printer,
  Download,
  Share2,
  Package,
  Building,
  MapPin,
  Tag,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  FileText,
  User,
  Phone,
  Mail,
  Home,
  Shield,
  RefreshCw,
  ChevronRight,
  Copy,
  Eye,
  DollarSign,
  Truck,
  Layers,
  CheckSquare,
  Clock,
  FileCheck,
  Building2,
  Cpu,
  Wallet,
  ShoppingCart,
  Warehouse,
  ClipboardCheck,
  TrendingUp,
  Percent,
  PackageCheck,
  AlertTriangle,
  XCircle,
  Circle,
  HardDriveIcon,
  Check,
} from "lucide-react";
import Sidebar from "../../layouts/Sidebar";
import Header from "../../layouts/Header";
import { procurementService } from "../../../services/procurementService";

const ViewProcurement = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [procurement, setProcurement] = useState(null);
  const [copied, setCopied] = useState(false);

  // Status options untuk procurement
  const statusOptions = {
    draft: { 
      label: "Draft", 
      icon: FileText, 
      color: "text-slate-500",
      bgColor: "bg-slate-50",
      borderColor: "border-slate-200",
      textColor: "text-slate-700"
    },
    pending: { 
      label: "Menunggu Persetujuan", 
      icon: Clock, 
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-700"
    },
    approved: { 
      label: "Disetujui", 
      icon: CheckCircle, 
      color: "text-emerald-500",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      textColor: "text-emerald-700"
    },
    rejected: { 
      label: "Ditolak", 
      icon: XCircle, 
      color: "text-rose-500",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-200",
      textColor: "text-rose-700"
    },
    ordered: { 
      label: "Dipesan", 
      icon: ShoppingCart, 
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700"
    },
    delivered: { 
      label: "Dikirim", 
      icon: Truck, 
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-700"
    },
    received: { 
      label: "Diterima", 
      icon: PackageCheck, 
      color: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-700"
    },
    completed: { 
      label: "Selesai", 
      icon: CheckSquare, 
      color: "text-indigo-500",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      textColor: "text-indigo-700"
    }
  };

  // PERBAIKAN: Approval timeline disesuaikan dengan data dari Postman
  const approvalSteps = [
    { 
      key: 'structural_requester', 
      label: 'Structural Requester', 
      icon: User,
      approvedField: 'approved_by_structural_requester_at',
      userField: 'structural_requester_user'
    },
    { 
      key: 'building_manager', 
      label: 'Building Manager', 
      icon: Building2,
      approvedField: 'approved_by_building_manager_at',
      userField: 'building_manager_user'
    },
    { 
      key: 'it', 
      label: 'IT Department', 
      icon: Cpu,
      approvedField: 'approved_by_it_at',
      userField: 'it_user'
    },
    { 
      key: 'finance', 
      label: 'Finance', 
      icon: Wallet,
      approvedField: 'approved_by_finance_at',
      userField: 'finance_user'
    },
    { 
      key: 'procurement_staff', 
      label: 'Procurement Staff', 
      icon: ShoppingCart,
      approvedField: 'approved_by_procurement_staff_at',
      userField: 'procurement_staff_user'
    },
    { 
      key: 'warehouse_manager', 
      label: 'Warehouse Manager', 
      icon: Warehouse,
      approvedField: 'received_by_warehouse_manager_at',
      userField: 'warehouse_manager_user'
    },
  ];

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
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  // Format datetime
  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Get location hierarchy
  const getLocationHierarchy = (location) => {
    if (!location) return [];
    const hierarchy = [];
    let current = location;
    
    while (current) {
      hierarchy.unshift(current);
      current = current.parent;
    }
    
    return hierarchy;
  };

  // Fetch procurement data
  const fetchProcurementData = async () => {
    try {
      setLoading(true);
      setError("");
      
      if (!id) {
        throw new Error("ID procurement tidak ditemukan");
      }
      
      const response = await procurementService.getProcurementById(id);
      if (response.data?.data) {
        setProcurement(response.data.data);
      } else {
        setProcurement(response.data);
      }
      
    } catch (err) {
      console.error("Error fetching procurement:", err);
      
      let errorMessage = "Gagal memuat data procurement. ";
      
      if (err.response) {
        if (err.response.status === 404) {
          errorMessage = `Procurement dengan ID "${id}" tidak ditemukan.`;
        } else if (err.response.status === 500) {
          errorMessage = "Terjadi kesalahan server. ";
          if (err.response.data?.message) {
            errorMessage += err.response.data.message;
          }
        } else if (err.response.data?.message) {
          errorMessage += err.response.data.message;
        }
      } else if (err.request) {
        errorMessage += "Tidak dapat terhubung ke server.";
      } else {
        errorMessage += err.message;
      }
      
      setError(errorMessage);
      
      if (err.response?.status === 404) {
        setTimeout(() => {
          navigate("/procurements");
        }, 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcurementData();
  }, [id]);

  // Loading component
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header setSidebarOpen={setSidebarOpen} />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                <span className="text-lg text-slate-600">Memuat data procurement...</span>
                <span className="text-sm text-slate-400">ID: {id}</span>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Error component
  if (error) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header setSidebarOpen={setSidebarOpen} />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-6xl mx-auto">
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6">
                <div className="flex items-start">
                  <AlertCircle className="w-6 h-6 text-rose-400 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-rose-800">Error</h3>
                    <p className="text-rose-700 mt-1">{error}</p>
                    <button
                      onClick={() => navigate("/procurements")}
                      className="mt-4 px-4 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors"
                    >
                      Kembali ke Daftar Procurement
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!procurement) {
    return null;
  }

  const statusConfig = statusOptions[procurement.status] || statusOptions.draft;
  const StatusIcon = statusConfig.icon;
  const procurementItem = procurement.procurement_item;
  const locationHierarchy = getLocationHierarchy(procurementItem?.location);
  const imageUrl = procurementItem?.image?.startsWith('http') 
    ? procurementItem.image 
    : `http://localhost:8000/storage/${procurementItem?.image}`;

  // PERBAIKAN: Hitung jumlah persetujuan berdasarkan data dari Postman
  const approvedCount = approvalSteps.filter(step => {
    const approvedAt = procurementItem?.[step.approvedField];
    return approvedAt !== null && approvedAt !== undefined;
  }).length;

  const totalSteps = approvalSteps.length;

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
          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="mb-8 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigate("/procurements")}
                    className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors group"
                  >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span>Kembali</span>
                  </button>
                  <div className="w-px h-6 bg-slate-300"></div>
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                      Detail Procurement
                    </h1>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${statusConfig.bgColor} ${statusConfig.borderColor} border`}>
                    <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                    <span className={`text-sm font-medium ${statusConfig.textColor}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center space-x-2 text-slate-500 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Tanggal: {formatDate(procurement.date)}</span>
                  <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                  <User className="w-4 h-4" />
                  <span>Dibuat oleh: {procurement.user?.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  {procurement.status === 'draft' && (
                    <Link
                      to={`/procurements/edit/${procurement.id}`}
                      className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit Procurement</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Procurement Item Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Procurement Item Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">
                        {procurementItem?.item_name || "Item Procurement"}
                      </h2>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Tag className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600">
                            {procurementItem?.category?.name || "Tidak ada kategori"}
                          </span>
                        </div>
                        <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                        <div className="flex items-center space-x-2">
                          <Layers className="w-4 h-4 text-blue-500" />
                          <span className="text-slate-600">
                            {procurementItem?.quantity || 0} unit
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                        Item ID: {procurementItem?.id}
                      </div>
                      {procurementItem?.is_maintainable && (
                        <div className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm font-medium flex items-center space-x-1">
                          <Shield className="w-3 h-3" />
                          <span>Dapat Dipelihara</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Procurement Item Image */}
                  <div className="mb-6">
                    <div className="relative rounded-xl overflow-hidden border border-slate-200">
                      {procurementItem?.image ? (
                        <img
                          src={imageUrl}
                          alt={procurementItem.item_name}
                          className="w-full h-64 object-cover"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/800x400?text=Gambar+Tidak+Tersedia";
                          }}
                        />
                      ) : (
                        <div className="w-full h-64 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                          <Package className="w-16 h-16 text-slate-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description & Notes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                        <FileText className="w-5 h-5 text-slate-500 mr-2" />
                        Deskripsi
                      </h3>
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 min-h-[120px]">
                        <p className="text-slate-700 whitespace-pre-line">
                          {procurementItem?.description || "Tidak ada deskripsi"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                        <ClipboardCheck className="w-5 h-5 text-slate-500 mr-2" />
                        Catatan
                      </h3>
                        
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 min-h-[120px]">
                        <p className="text-slate-700 whitespace-pre-line">
                          {procurementItem?.notes || "Tidak ada catatan"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Financial Information */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                      Informasi Keuangan
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-600">Harga Satuan</span>
                          <span className="text-emerald-500 font-medium">Rp</span>
                        </div>
                        <p className="text-2xl font-bold text-emerald-700">
                          {formatCurrency(procurementItem?.price || 0)}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-600">Kuantitas</span>
                          <Layers className="w-4 h-4 text-blue-500" />
                        </div>
                        <p className="text-2xl font-bold text-blue-700">
                          {procurementItem?.quantity || 0}
                        </p>
                        <p className="text-sm text-blue-600 mt-1">unit</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-600">Total Harga</span>
                          <TrendingUp className="w-4 h-4 text-purple-500" />
                        </div>
                        <p className="text-2xl font-bold text-purple-700">
                          {formatCurrency(procurementItem?.sub_total || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Card */}
                {procurementItem?.location && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                      <MapPin className="w-5 h-5 text-blue-500 mr-2" />
                      Lokasi Penempatan
                    </h3>
                    
                    {/* Location Hierarchy */}
                    <div className="mb-6">
                      <div className="flex items-center space-x-2 text-sm text-slate-500 mb-3">
                        <Building className="w-4 h-4" />
                        <span>Hierarki Lokasi</span>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                          {locationHierarchy.length > 0 ? (
                            locationHierarchy.map((loc, index) => (
                              <React.Fragment key={loc.id}>
                                <div className="flex flex-col items-center min-w-max">
                                  <div className="w-10 h-10 rounded-full bg-white border-2 border-emerald-200 flex items-center justify-center">
                                    {index === 0 ? (
                                      <Home className="w-5 h-5 text-emerald-500" />
                                    ) : index === locationHierarchy.length - 1 ? (
                                      <MapPin className="w-5 h-5 text-emerald-500" />
                                    ) : (
                                      <Building className="w-5 h-5 text-emerald-500" />
                                    )}
                                  </div>
                                  <span className="text-xs font-medium text-slate-700 mt-2">
                                    {loc.name}
                                  </span>
                                  {loc.room_code && (
                                    <span className="text-xs text-slate-500">
                                      {loc.room_code}
                                    </span>
                                  )}
                                </div>
                                {index < locationHierarchy.length - 1 && (
                                  <ChevronRight className="w-5 h-5 text-slate-300 flex-shrink-0" />
                                )}
                              </React.Fragment>
                            ))
                          ) : (
                            <div className="text-slate-500 italic">
                              Lokasi tidak tersedia
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Details & Approvals */}
              <div className="space-y-6">
                {/* Approval Timeline Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                    <CheckSquare className="w-5 h-5 text-slate-500 mr-2" />
                    Timeline Persetujuan
                  </h3>
                  
                  <div className="space-y-4">
                    {approvalSteps.map((step, index) => {
                      // PERBAIKAN: Gunakan field yang sesuai dari data Postman
                      const approvedAt = procurementItem?.[step.approvedField];
                      const user = procurementItem?.[step.userField];
                      const isApproved = approvedAt !== null && approvedAt !== undefined;
                      const StepIcon = step.icon;
                      
                      return (
                        <div key={step.key} className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className={`relative w-10 h-10 rounded-full flex items-center justify-center ${
                              isApproved 
                                ? 'bg-emerald-100 text-emerald-600' 
                                : 'bg-slate-100 text-slate-400'
                            }`}>
                              <StepIcon className="w-5 h-5" />
                              {isApproved && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center">
                                  <Check className="w-3 h-3" />
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className={`font-medium truncate ${
                                isApproved ? 'text-slate-900' : 'text-slate-600'
                              }`}>
                                {step.label}
                              </span>
                              {isApproved ? (
                                <span className="flex-shrink-0 text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                                  Disetujui
                                </span>
                              ) : (
                                <span className="flex-shrink-0 text-xs px-2 py-1 bg-slate-100 text-slate-500 rounded-full">
                                  Menunggu
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-500 mt-1 truncate">
                              {user?.name || "Belum ditentukan"}
                            </p>
                            {approvedAt && (
                              <p className="text-xs text-slate-400 mt-1">
                                {formatDateTime(approvedAt)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">Progress Persetujuan</span>
                      <span className="text-sm font-medium text-slate-700">
                        {approvedCount} / {totalSteps}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${(approvedCount / totalSteps) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      {approvedCount === totalSteps ? (
                        <span className="text-emerald-600 font-medium">
                          ✓ Semua persetujuan telah diselesaikan
                        </span>
                      ) : (
                        <span>
                          Menunggu {totalSteps - approvedCount} persetujuan lagi
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Supplier Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                    <Truck className="w-5 h-5 text-slate-500 mr-2" />
                    Supplier
                  </h3>
                  
                  {procurementItem?.supplier ? (
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{procurementItem.supplier.name}</h4>
                          <p className="text-sm text-slate-500">ID: {procurementItem.supplier.id}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                          <User className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500">Contact Person</p>
                            <p className="font-medium text-slate-900">
                              {procurementItem.supplier.contact_person || "-"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500">Telepon</p>
                            <p className="font-medium text-slate-900">
                              {procurementItem.supplier.phone_number || "-"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500">Email</p>
                            <p className="font-medium text-slate-900">
                              {procurementItem.supplier.email || "-"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                          <Home className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500">Alamat</p>
                            <p className="font-medium text-slate-900">
                              {procurementItem.supplier.address || "-"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">Tidak ada supplier</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ViewProcurement;