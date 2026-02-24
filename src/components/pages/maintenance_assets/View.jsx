// src/pages/maintenance/View.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Printer,
  Download,
  Share2,
  Wrench,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader,
  Package,
  Tag,
  User,
  FileText,
  Image as ImageIcon,
  Info,
  AlertCircle,
  ChevronRight,
  Copy,
  Users,
  Home,
  Building,
  MapPin,
  Mail,
  Phone,
  History,
  Activity,
  Shield
} from "lucide-react";
import Sidebar from "../../layouts/Sidebar";
import Header from "../../layouts/Header";
import { maintenanceService } from "../../../services/maintenanceService";

const ViewMaintenance = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [maintenance, setMaintenance] = useState(null);
  const [copied, setCopied] = useState(false);

  // Status options dengan warna dan icon
  const statusOptions = {
    scheduled: { 
      label: "Terjadwal", 
      icon: Calendar, 
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700"
    },
    in_progress: { 
      label: "Sedang Berjalan", 
      icon: Loader, 
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-700"
    },
    completed: { 
      label: "Selesai", 
      icon: CheckCircle, 
      color: "text-emerald-500",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      textColor: "text-emerald-700"
    },
    cancelled: { 
      label: "Dibatalkan", 
      icon: XCircle, 
      color: "text-slate-500",
      bgColor: "bg-slate-50",
      borderColor: "border-slate-200",
      textColor: "text-slate-700"
    },
    overdue: { 
      label: "Terlewat", 
      icon: AlertTriangle, 
      color: "text-rose-500",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-200",
      textColor: "text-rose-700"
    },
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

  // Get location hierarchy dari asset
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

  // Fetch maintenance data
  const fetchMaintenanceData = async () => {
    try {
      setLoading(true);
      setError("");
      
      if (!id) {
        throw new Error("ID maintenance tidak ditemukan");
      }
      
      const response = await maintenanceService.getMaintenanceById(id);
      
      console.log("Maintenance data:", response);
      
      if (response.data) {
        setMaintenance(response.data);
      } else {
        setMaintenance(response);
      }
      
    } catch (err) {
      console.error("Error fetching maintenance:", err);
      
      let errorMessage = "Gagal memuat data maintenance. ";
      
      if (err.response) {
        if (err.response.status === 404) {
          errorMessage = `Maintenance dengan ID "${id}" tidak ditemukan.`;
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
          navigate("/maintenance");
        }, 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenanceData();
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                <span className="text-lg text-slate-600">Memuat data maintenance...</span>
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
                      onClick={() => navigate("/maintenance-assets")}
                      className="mt-4 px-4 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors"
                    >
                      Kembali ke Daftar Maintenance
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

  if (!maintenance) {
    return null;
  }

  const statusConfig = statusOptions[maintenance.status] || statusOptions.scheduled;
  const StatusIcon = statusConfig.icon;
  
  const asset = maintenance.asset || {};
  const technician = maintenance.technician_user;
  const locationHierarchy = asset.location ? getLocationHierarchy(asset.location) : [];
  
  const photoUrl = maintenance.photo?.startsWith('http') 
    ? maintenance.photo 
    : `http://localhost:8000/${maintenance.photo}`;

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
          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="mb-8 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigate("/maintenance-assets")}
                    className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors group"
                  >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span>Kembali</span>
                  </button>
                  <div className="w-px h-6 bg-slate-300"></div>
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                      Detail Maintenance
                    </h1>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-slate-500 text-sm">ID:</span>
                    <div className="flex items-center space-x-2">
                      <code className="font-mono bg-slate-100 px-2 py-1 rounded text-sm">
                        #{maintenance.id}
                      </code>
                      <button
                        onClick={() => copyToClipboard(`#${maintenance.id}`)}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                        title="Salin ID"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    {copied && (
                      <span className="text-xs text-orange-600 animate-fade-in">
                        ✓ Disalin
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center space-x-2 text-slate-500 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Dibuat: {formatDateTime(maintenance.created_at)}</span>
                </div>
                <div className="flex items-center space-x-3">
                  {/* <button
                    onClick={() => window.print()}
                    className="flex items-center space-x-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button> */}
                  <Link
                    to={`/maintenance-assets/update/${maintenance.id}`}
                    className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Maintenance</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Maintenance Info & Photo */}
              <div className="lg:col-span-2 space-y-6">
                {/* Maintenance Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center">
                        <Wrench className="w-6 h-6 text-orange-500 mr-2" />
                        Maintenance #{maintenance.id}
                      </h2>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Package className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600">
                            {asset.name || "N/A"}
                          </span>
                        </div>
                        <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                        <div className="flex items-center space-x-2">
                          <Tag className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600">
                            {asset.category?.name || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        <span>{statusConfig.label}</span>
                      </div>
                    </div>
                  </div>

                  {/* Maintenance Photo */}
                  <div className="mb-6">
                    <div className="relative rounded-xl overflow-hidden border border-slate-200">
                      {maintenance.photo ? (
                        <img
                          src={photoUrl}
                          alt={`Maintenance #${maintenance.id}`}
                          className="w-full h-64 object-cover"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/800x400?text=Foto+Tidak+Tersedia";
                          }}
                        />
                      ) : (
                        <div className="w-full h-64 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                          <ImageIcon className="w-16 h-16 text-slate-400" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <button className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white transition-colors">
                          <Share2 className="w-4 h-4 text-slate-600" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                      <FileText className="w-5 h-5 text-slate-500 mr-2" />
                      Catatan Maintenance
                    </h3>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <p className="text-slate-700 whitespace-pre-line">
                        {maintenance.notes || "Tidak ada catatan"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Asset Location Card */}
                {locationHierarchy.length > 0 && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                      <MapPin className="w-5 h-5 text-blue-500 mr-2" />
                      Lokasi Asset
                    </h3>
                    
                    {/* Location Hierarchy */}
                    <div className="mb-6">
                      <div className="flex items-center space-x-2 text-sm text-slate-500 mb-3">
                        <Building className="w-4 h-4" />
                        <span>Hierarki Lokasi</span>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                          {locationHierarchy.map((loc, index) => (
                            <React.Fragment key={loc.id}>
                              <div className="flex flex-col items-center min-w-max">
                                <div className="w-10 h-10 rounded-full bg-white border-2 border-orange-200 flex items-center justify-center">
                                  {index === 0 ? (
                                    <Home className="w-5 h-5 text-orange-500" />
                                  ) : index === locationHierarchy.length - 1 ? (
                                    <MapPin className="w-5 h-5 text-orange-500" />
                                  ) : (
                                    <Building className="w-5 h-5 text-orange-500" />
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
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Details & Info */}
              <div className="space-y-6">
                {/* Status & Dates Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                    <Activity className="w-5 h-5 text-slate-500 mr-2" />
                    Detail Maintenance
                  </h3>
                  
                  {/* Status */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-slate-700">Status</span>
                      <div className="flex items-center space-x-2">
                        <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                        <span className={`text-sm font-medium ${statusConfig.textColor}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>
                    <div className={`h-2 rounded-full ${statusConfig.bgColor} overflow-hidden`}>
                      <div 
                        className={`h-full ${statusConfig.color.replace('text-', 'bg-')} rounded-full transition-all duration-500`}
                        style={{ width: '100%' }}
                      ></div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">Next Maintenance</p>
                          <p className="text-xs text-slate-500">Jadwal berikutnya</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-900">{formatDate(maintenance.next_maintenance_date)}</p>
                        <p className="text-xs text-slate-500">{formatDateTime(maintenance.next_maintenance_date)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                          <Clock className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">Actual Maintenance</p>
                          <p className="text-xs text-slate-500">Tanggal pelaksanaan</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-900">
                          {maintenance.actual_maintenance_date ? formatDate(maintenance.actual_maintenance_date) : "-"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {maintenance.actual_maintenance_date ? formatDateTime(maintenance.actual_maintenance_date) : "Belum dilaksanakan"}
                        </p>
                      </div>
                    </div>

                    {maintenance.useful_life && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                            <History className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-700">Masa Pakai</p>
                            <p className="text-xs text-slate-500">Untuk maintenance berikutnya</p>
                          </div>
                        </div>
                        <div className="text-lg font-bold text-orange-600">
                          {maintenance.useful_life} hari
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Technician Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                    <User className="w-5 h-5 text-slate-500 mr-2" />
                    Teknisi
                  </h3>
                  
                  {technician ? (
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{technician.name}</h4>
                          <p className="text-sm text-slate-500">ID: {technician.id}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {technician.email && (
                          <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <div>
                              <p className="text-xs text-slate-500">Email</p>
                              <p className="font-medium text-slate-900">{technician.email}</p>
                            </div>
                          </div>
                        )}
                        {technician.phone && (
                          <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <div>
                              <p className="text-xs text-slate-500">Telepon</p>
                              <p className="font-medium text-slate-900">{technician.phone}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">Belum ada teknisi</p>
                      <p className="text-sm text-slate-400 mt-1">
                        Maintenance belum ditugaskan ke teknisi
                      </p>
                    </div>
                  )}
                </div>

                {/* Asset Summary Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                    <Package className="w-5 h-5 text-slate-500 mr-2" />
                    Ringkasan Asset
                  </h3>
                  
                  <div className="space-y-3">
                    <Link 
                      to={`/assets/view/${asset.code}`}
                      className="block p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-700">{asset.name}</p>
                          <p className="text-xs text-slate-500 font-mono">{asset.code}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </Link>

                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">Kategori</span>
                      <span className="font-medium text-slate-900">{asset.category?.name || "N/A"}</span>
                    </div>

                    {asset.price && (
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm text-slate-600">Harga</span>
                        <span className="font-bold text-emerald-600">{formatCurrency(asset.price)}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">Status Asset</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        asset.status === 'available' ? 'bg-emerald-100 text-emerald-700' :
                        asset.status === 'in_use' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {asset.status?.replace('_', ' ') || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Info */}
            <div className="mt-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-700">
                      <span className="font-semibold">Informasi:</span> Maintenance ini terkait dengan asset{' '}
                      <Link to={`/assets/view/${asset.code}`} className="font-semibold underline hover:text-blue-800">
                        {asset.name}
                      </Link>
                      . Klik nama asset untuk melihat detail lengkap asset.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ViewMaintenance;