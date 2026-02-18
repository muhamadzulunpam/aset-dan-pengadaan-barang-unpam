// src/pages/maintenance/Update.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  ArrowLeft,
  Upload,
  Wrench,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader,
  Package,
  Tag,
  FileText,
  Image as ImageIcon,
  Trash2,
  Info
} from "lucide-react";
import Sidebar from "../../layouts/Sidebar";
import Header from "../../layouts/Header";
import { maintenanceService } from "../../../services/maintenanceService";

const UpdateMaintenance = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageError, setImageError] = useState("");
  const [currentPhoto, setCurrentPhoto] = useState("");
  const [hasExistingPhoto, setHasExistingPhoto] = useState(false);
  const [isPhotoChanged, setIsPhotoChanged] = useState(false);
  
  // Status options untuk maintenance
  const statusOptions = [
    { value: "scheduled", label: "Terjadwal", icon: Calendar, color: "text-blue-500", bgColor: "bg-blue-50" },
    { value: "in_progress", label: "Sedang Berjalan", icon: Loader, color: "text-yellow-500", bgColor: "bg-yellow-50" },
    { value: "completed", label: "Selesai", icon: CheckCircle, color: "text-emerald-500", bgColor: "bg-emerald-50" },
    { value: "cancelled", label: "Dibatalkan", icon: XCircle, color: "text-slate-500", bgColor: "bg-slate-50" },
  ];

  const [formData, setFormData] = useState({
    status: "scheduled",
    notes: "",
    photo: null,
    useful_life: "",
    // Data tambahan untuk display
    asset_name: "",
    asset_code: "",
    asset_category: "",
    next_maintenance_date: "",
    actual_maintenance_date: "",
  });

  // Fetch maintenance data berdasarkan ID
  const fetchMaintenanceData = async () => {
    try {
      setFetchLoading(true);
      setError("");
      
      if (!id) {
        throw new Error("ID maintenance tidak ditemukan");
      }
      
      const response = await maintenanceService.getMaintenanceById(id);
      
      console.log("Maintenance API Response:", response);
      
      let maintenanceData;
      if (response.data) {
        maintenanceData = response.data;
      } else {
        maintenanceData = response;
      }
      
      console.log("Maintenance Data:", maintenanceData);
      
      if (!maintenanceData) {
        throw new Error("Data maintenance tidak ditemukan");
      }
      
      // Set current photo jika ada
      if (maintenanceData?.photo) {
        let photoUrl = maintenanceData.photo;
        
        if (photoUrl.startsWith('http')) {
          setCurrentPhoto(photoUrl);
        } else if (photoUrl.startsWith('storage/')) {
          setCurrentPhoto(photoUrl);
        } else if (photoUrl.startsWith('/storage/')) {
          setCurrentPhoto(photoUrl.substring(1));
        } else {
          setCurrentPhoto(`storage/maintenance/${photoUrl}`);
        }
        setHasExistingPhoto(true);
      } else {
        setCurrentPhoto("");
        setHasExistingPhoto(false);
      }

      // Set form data
      setFormData({
        status: maintenanceData?.status || "scheduled",
        notes: maintenanceData?.notes || "",
        photo: null,
        useful_life: maintenanceData?.useful_life?.toString() || "",
        // Data tambahan untuk display
        asset_name: maintenanceData?.asset?.name || "N/A",
        asset_code: maintenanceData?.asset?.code || "N/A",
        asset_category: maintenanceData?.asset?.category?.name || "N/A",
        next_maintenance_date: maintenanceData?.next_maintenance_date || "",
        actual_maintenance_date: maintenanceData?.actual_maintenance_date || "",
      });

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
      setFetchLoading(false);
    }
  };

  // Initial fetch data
  useEffect(() => {
    let isMounted = true;

    const initializeData = async () => {
      if (!id) {
        setError("ID maintenance tidak ditemukan");
        setFetchLoading(false);
        return;
      }

      try {
        setFetchLoading(true);
        setError("");
        
        await fetchMaintenanceData();
        
      } catch (err) {
        console.error("Error initializing data:", err);
        if (isMounted) {
          setError("Gagal memuat data awal. Silakan refresh halaman.");
        }
      } finally {
        if (isMounted) {
          setFetchLoading(false);
        }
      }
    };

    initializeData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files[0];

      // Validasi ukuran file (max 2MB)
      if (file && file.size > 2 * 1024 * 1024) {
        setImageError("Ukuran file harus kurang dari 2MB");
        setFormData((prev) => ({
          ...prev,
          photo: null,
        }));
        e.target.value = "";
      } else {
        setImageError("");
        setFormData((prev) => ({
          ...prev,
          [name]: file,
        }));
        if (file) {
          // Jika user memilih file baru, tandai bahwa foto berubah
          setIsPhotoChanged(true);
        }
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, photo: null }));
    setCurrentPhoto("");
    setHasExistingPhoto(false);
    setIsPhotoChanged(true); // Tandai bahwa foto berubah (dihapus)
    
    // Reset file input
    const fileInput = document.getElementById('photo-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("Form data sebelum dikirim:", formData);

      const submitData = new FormData();
      
      // Method override untuk PUT
      submitData.append("_method", "PUT");
      
      // Required fields
      submitData.append("status", formData.status);
      submitData.append("notes", formData.notes || "");
      
      // Useful life - WAJIB diisi
      if (!formData.useful_life) {
        setError("Masa pakai (useful life) harus diisi");
        setLoading(false);
        return;
      }
      submitData.append("useful_life", parseInt(formData.useful_life));

      // Handle photo
      if (formData.photo) {
        // Validasi tipe file
        const fileType = formData.photo.type;
        if (!fileType.startsWith('image/')) {
          setImageError("File harus berupa gambar");
          setLoading(false);
          return;
        }
        submitData.append("photo", formData.photo);
      } else if (isPhotoChanged && !hasExistingPhoto) {
        // Jika foto dihapus (tidak ada file baru dan tidak ada foto lama)
        // Kirim string kosong atau null? Tergantung backend
        // submitData.append("photo", ""); 
        // Atau tidak usah kirim field photo
      }
      // Jika tidak ada perubahan foto (masih pakai foto lama), jangan kirim field photo

      console.log("Data yang akan dikirim ke API:");
      for (let [key, value] of submitData.entries()) {
        console.log(key, value);
      }

      const response = await maintenanceService.updateMaintenance(id, submitData);
      
      console.log("✅ Update Success:", response);
      
      setSuccess(response.meta?.message || "Data maintenance berhasil diupdate!");
      
      setTimeout(() => {
        navigate("/maintenance");
      }, 2000);
      
    } catch (err) {
      console.error("Update Error:", err);
      
      let errorMessage = "Gagal mengupdate data maintenance. ";
      
      if (err.response) {
        console.error("Response Error Details:", {
          status: err.response.status,
          data: err.response.data
        });
        
        if (err.response.status === 422) {
          const errors = err.response.data?.errors;
          if (errors) {
            const errorMessages = [];
            for (const [field, messages] of Object.entries(errors)) {
              const fieldName = field.replace(/_/g, ' ');
              errorMessages.push(`${fieldName}: ${messages.join(', ')}`);
            }
            errorMessage = `Validasi gagal:\n${errorMessages.join('\n')}`;
          } else if (err.response.data?.message) {
            errorMessage = err.response.data.message;
          }
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
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

  // Loading state
  if (fetchLoading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header setSidebarOpen={setSidebarOpen} />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
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
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="mb-8 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigate("/maintenance-assets")}
                    className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Kembali</span>
                  </button>
                  <div className="w-px h-6 bg-slate-300"></div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    Edit Maintenance
                  </h1>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Alert Messages */}
            {error && (
              <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-rose-400 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-rose-800">Error</h3>
                    <div className="mt-1 text-sm text-rose-700 whitespace-pre-line">
                      {error}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-emerald-800">Sukses</h3>
                    <div className="mt-1 text-sm text-emerald-700">
                      {success}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8" encType="multipart/form-data">
              {/* Informasi Asset (Read-only) */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                  <Package className="w-5 h-5 text-orange-600 mr-2" />
                  Informasi Asset
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nama Asset */}
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Nama Asset
                    </label>
                    <p className="text-lg font-semibold text-slate-900">
                      {formData.asset_name}
                    </p>
                  </div>

                  {/* Kode Asset */}
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Kode Asset
                    </label>
                    <p className="text-lg font-mono font-semibold text-slate-900">
                      {formData.asset_code}
                    </p>
                  </div>

                  {/* Kategori */}
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Kategori
                    </label>
                    <div className="flex items-center">
                      <Tag className="w-4 h-4 text-slate-400 mr-2" />
                      <p className="text-base font-medium text-slate-900">
                        {formData.asset_category}
                      </p>
                    </div>
                  </div>

                  {/* Actual Maintenance Date */}
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Tanggal Maintenance
                    </label>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-slate-400 mr-2" />
                      <p className="text-base font-medium text-slate-900">
                        {formatDate(formData.actual_maintenance_date || formData.next_maintenance_date)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Update Maintenance */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                  <Wrench className="w-5 h-5 text-orange-600 mr-2" />
                  Update Maintenance
                </h2>

                <div className="space-y-6">
                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Status Maintenance *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {statusOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = formData.status === option.value;
                        return (
                          <label
                            key={option.value}
                            className={`
                              relative flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer
                              transition-all duration-200
                              ${isSelected 
                                ? `border-orange-500 bg-orange-50` 
                                : `border-slate-200 hover:border-slate-300 bg-white`
                              }
                            `}
                          >
                            <input
                              type="radio"
                              name="status"
                              value={option.value}
                              checked={isSelected}
                              onChange={handleChange}
                              className="absolute opacity-0"
                              required
                            />
                            <Icon className={`w-6 h-6 mb-2 ${option.color}`} />
                            <span className={`text-xs font-medium ${isSelected ? 'text-orange-700' : 'text-slate-600'}`}>
                              {option.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Useful Life - WAJIB */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Masa Pakai (hari) *
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="number"
                        name="useful_life"
                        value={formData.useful_life}
                        onChange={handleChange}
                        min="1"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all duration-300"
                        placeholder="90"
                        required
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Masa pakai dalam hari untuk maintenance selanjutnya
                    </p>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Catatan Maintenance
                    </label>
                    <div className="relative">
                      <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={4}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all duration-300"
                        placeholder="Masukkan catatan maintenance (misal: kerusakan, tindakan yang dilakukan, dll)..."
                      />
                    </div>
                  </div>

                  {/* Photo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Foto Maintenance
                    </label>
                    
                    {/* Current Photo Preview */}
                    {hasExistingPhoto && currentPhoto && !formData.photo && (
                      <div className="mb-4">
                        <p className="text-sm text-slate-600 mb-2">Foto saat ini:</p>
                        <div className="flex items-center space-x-4">
                          <img 
                            src={currentPhoto.startsWith('http') ? 
                                  currentPhoto : 
                                  `http://localhost:8000/${currentPhoto}`} 
                            alt="Current maintenance" 
                            className="w-32 h-32 object-cover rounded-lg border border-slate-200"
                            onError={(e) => {
                              console.error("Error loading image:", currentPhoto);
                              e.target.src = "https://via.placeholder.com/128x128?text=Foto+Tidak+Tersedia";
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="flex items-center space-x-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="text-sm font-medium">Hapus Foto</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Preview foto baru jika dipilih */}
                    {formData.photo && (
                      <div className="mb-4">
                        <p className="text-sm text-slate-600 mb-2">Foto baru:</p>
                        <div className="flex items-center space-x-4">
                          <img 
                            src={URL.createObjectURL(formData.photo)} 
                            alt="New maintenance" 
                            className="w-32 h-32 object-cover rounded-lg border border-slate-200"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, photo: null }));
                              setIsPhotoChanged(false);
                              const fileInput = document.getElementById('photo-upload');
                              if (fileInput) fileInput.value = '';
                            }}
                            className="flex items-center space-x-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="text-sm font-medium">Batal</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Upload Area - Sembunyikan jika ada foto baru */}
                    {!formData.photo && (
                      <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center">
                        <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600 mb-2">
                          {hasExistingPhoto ? "Upload foto baru untuk mengganti" : "Upload foto maintenance"}
                        </p>
                        <p className="text-slate-500 text-sm mb-4">
                          JPG, PNG (Max. 2MB)
                        </p>
                        <input
                          type="file"
                          name="photo"
                          onChange={handleChange}
                          accept="image/jpeg,image/png,image/jpg"
                          className="hidden"
                          id="photo-upload"
                        />
                        <label
                          htmlFor="photo-upload"
                          className="inline-block px-6 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium cursor-pointer"
                        >
                          Pilih File
                        </label>
                        {imageError && (
                          <p className="text-sm text-rose-600 mt-2">
                            {imageError}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Info Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-700">
                      <span className="font-semibold">Catatan:</span> 
                      - Field yang ditandai dengan * wajib diisi.<br />
                      - Untuk mengubah foto, upload file baru.<br />
                      - Foto lama akan diganti dengan foto baru.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6">
                <button
                  type="button"
                  onClick={() => navigate("/maintenance")}
                  className="px-8 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-300"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Mengupdate...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Update Maintenance</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UpdateMaintenance;