// src/pages/assets/View.js
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
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
  AlertTriangle,
  Activity,
  Archive,
  ShieldCheck,
  XCircle,
  DollarSign,
  Truck,
  Clock,
  History,
  Wrench,
  FileText,
  User,
  Phone,
  Mail,
  Home,
  Shield,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Copy,
  QrCode,
  Eye,
  HardDrive,
  Layers,
  Cpu,
  Battery,
  HardDriveIcon,
  BarChart,
  ActivityIcon,
  TrendingUp,
  Bell,
} from "lucide-react";
import Sidebar from "../../layouts/Sidebar";
import Header from "../../layouts/Header";
import { assetService } from "../../../services/assetService";

const ViewAsset = () => {
  const navigate = useNavigate();
  const { code } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [asset, setAsset] = useState(null);
  const [copied, setCopied] = useState(false);

  // Status options dengan warna dan icon
  const statusOptions = {
    available: { 
      label: "Tersedia", 
      icon: CheckCircle, 
      color: "text-emerald-500",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      textColor: "text-emerald-700"
    },
    in_use: { 
      label: "Digunakan", 
      icon: Users, 
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700"
    },
    in_transit: { 
      label: "Dalam Perjalanan", 
      icon: Activity, 
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-700"
    },
    maintenance: { 
      label: "Perawatan", 
      icon: AlertTriangle, 
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-700"
    },
    damaged: { 
      label: "Rusak", 
      icon: XCircle, 
      color: "text-rose-500",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-200",
      textColor: "text-rose-700"
    },
    lost: { 
      label: "Hilang", 
      icon: Archive, 
      color: "text-slate-500",
      bgColor: "bg-slate-50",
      borderColor: "border-slate-200",
      textColor: "text-slate-700"
    },
    disposed: { 
      label: "Dibuang", 
      icon: ShieldCheck, 
      color: "text-gray-500",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      textColor: "text-gray-700"
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

  // Fetch asset data
  const fetchAssetData = async () => {
    try {
      setLoading(true);
      setError("");
      
      if (!code) {
        throw new Error("Kode asset tidak ditemukan");
      }
      
      const response = await assetService.getAssetByCode(code);
      
      if (response.data) {
        setAsset(response.data);
      } else {
        setAsset(response);
      }
      
    } catch (err) {
      console.error("Error fetching asset:", err);
      
      let errorMessage = "Gagal memuat data asset. ";
      
      if (err.response) {
        if (err.response.status === 404) {
          errorMessage = `Asset dengan kode "${code}" tidak ditemukan.`;
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
          navigate("/assets");
        }, 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssetData();
  }, [code]);

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
                <span className="text-lg text-slate-600">Memuat data asset...</span>
                <span className="text-sm text-slate-400">Kode: {code}</span>
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
                      onClick={() => navigate("/assets")}
                      className="mt-4 px-4 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors"
                    >
                      Kembali ke Daftar Asset
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

  if (!asset) {
    return null;
  }

  const statusConfig = statusOptions[asset.status] || statusOptions.available;
  const StatusIcon = statusConfig.icon;
  const locationHierarchy = getLocationHierarchy(asset.location);
  const maintenanceCount = asset.maintenance_assets?.data?.length || 0;
  const imageUrl = asset.image?.startsWith('http') 
    ? asset.image 
    : `http://localhost:8000/storage/${asset.image}`;

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
                    onClick={() => navigate("/assets")}
                    className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors group"
                  >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span>Kembali</span>
                  </button>
                  <div className="w-px h-6 bg-slate-300"></div>
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                      Detail Asset
                    </h1>
                    
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-slate-500 text-sm">Kode:</span>
                      <div className="flex items-center space-x-2">
                        <code className="font-mono bg-slate-100 px-2 py-1 rounded text-sm">
                          {asset.code}
                        </code>
                        <button
                          onClick={() => copyToClipboard(asset.code)}
                          className="text-slate-400 hover:text-slate-600 transition-colors"
                          title="Salin kode"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      {copied && (
                        <span className="text-xs text-emerald-600 animate-fade-in">
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
                  <span>Dibuat: {formatDateTime(asset.created_at)}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center space-x-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                  <Link
                    to={`/assets/update/${asset.code}`}
                    className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Asset</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Asset Info & Image */}
              <div className="lg:col-span-2 space-y-6">
                {/* Asset Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">
                        {asset.name}
                      </h2>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Tag className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600">
                            {asset.category?.name}
                          </span>
                        </div>
                        <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                        <div className="flex items-center space-x-2">
                        <span className="text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2 font-medium">Rp</span>

                          <span className="font-semibold text-emerald-600">
                            {formatCurrency(asset.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                        ID: {asset.id}
                      </div>
                      {asset.is_maintainable && (
                        <div className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm font-medium flex items-center space-x-1">
                          <Wrench className="w-3 h-3" />
                          <span>Dapat Dipelihara</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Asset Image */}
                  <div className="mb-6">
                    <div className="relative rounded-xl overflow-hidden border border-slate-200">
                      {asset.image ? (
                        <img
                          src={imageUrl}
                          alt={asset.name}
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
                      <div className="absolute top-4 right-4">
                        <button className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white transition-colors">
                          <Share2 className="w-4 h-4 text-slate-600" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                      <FileText className="w-5 h-5 text-slate-500 mr-2" />
                      Deskripsi
                    </h3>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <p className="text-slate-700 whitespace-pre-line">
                        {asset.description || "Tidak ada deskripsi"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Location Card */}
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
              </div>

              {/* Right Column - Details & Actions */}
              <div className="space-y-6">
                {/* Status & Maintenance Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                    <ActivityIcon className="w-5 h-5 text-slate-500 mr-2" />
                    Status & Maintenance
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

                  {/* Maintenance Info */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                          <Wrench className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">Dapat Dipelihara</p>
                          <p className="text-xs text-slate-500">Status maintenance</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full ${asset.is_maintainable ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'}`}>
                        {asset.is_maintainable ? 'Ya' : 'Tidak'}
                      </div>
                    </div>

                    {asset.is_maintainable && asset.useful_life && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-700">Masa Pakai</p>
                            <p className="text-xs text-slate-500">Dalam hari</p>
                          </div>
                        </div>
                        <div className="text-lg font-bold text-emerald-600">
                          {asset.useful_life} hari
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <History className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">Riwayat Maintenance</p>
                          <p className="text-xs text-slate-500">Total perawatan</p>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                        {maintenanceCount} kali
                      </div>
                    </div>
                  </div>

                  {/* Maintenance Actions */}
                  {asset.is_maintainable && (
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300">
                        <Wrench className="w-5 h-5" />
                        <span>Jadwalkan Maintenance</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Supplier Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                    <Truck className="w-5 h-5 text-slate-500 mr-2" />
                    Supplier
                  </h3>
                  
                  {asset.supplier ? (
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{asset.supplier.name}</h4>
                          <p className="text-sm text-slate-500">ID: {asset.supplier.id}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                          <User className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500">Contact Person</p>
                            <p className="font-medium text-slate-900">
                              {asset.supplier.contact_person || "-"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500">Telepon</p>
                            <p className="font-medium text-slate-900">
                              {asset.supplier.phone_number || "-"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500">Email</p>
                            <p className="font-medium text-slate-900">
                              {asset.supplier.email || "-"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                          <Home className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500">Alamat</p>
                            <p className="font-medium text-slate-900">
                              {asset.supplier.address || "-"}
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

                {/* Quick Actions Card */}
                {/* <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                    <BarChart className="w-5 h-5 text-slate-500 mr-2" />
                    Quick Actions
                  </h3>
                  
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors group">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                          <RefreshCw className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="font-medium text-slate-700">Update Status</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors group">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                          <History className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium text-slate-700">Riwayat Perubahan</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors group">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                          <QrCode className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="font-medium text-slate-700">Generate QR Code</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors group">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center group-hover:bg-rose-200 transition-colors">
                          <Bell className="w-4 h-4 text-rose-600" />
                        </div>
                        <span className="font-medium text-slate-700">Buat Laporan</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div> */}
              </div>
            </div>

            {/* Maintenance History */}
            {maintenanceCount > 0 && (
              <div className="mt-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                      <History className="w-5 h-5 text-slate-500 mr-2" />
                      Riwayat Maintenance ({maintenanceCount})
                    </h3>
                    <button className="text-emerald-600 hover:text-emerald-700 font-medium">
                      Lihat Semua →
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Tanggal</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Jenis</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Deskripsi</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Teknisi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {asset.maintenance_assets.data.map((maintenance) => (
                          <tr key={maintenance.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-4 text-sm text-slate-600">
                              {formatDate(maintenance.created_at)}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                                {maintenance.type || "Rutin"}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-600">
                              {maintenance.description || "-"}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                maintenance.status === 'completed' 
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : maintenance.status === 'in_progress'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-slate-100 text-slate-700'
                              }`}>
                                {maintenance.status === 'completed' ? 'Selesai' : 
                                 maintenance.status === 'in_progress' ? 'Dalam Proses' : 'Terjadwal'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-600">
                              {maintenance.technician || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default ViewAsset;