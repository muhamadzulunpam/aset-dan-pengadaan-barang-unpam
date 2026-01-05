// src/pages/pengadaan/Update.js
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, ArrowLeft, Upload, Package, Building, Truck, MapPin, Edit, Trash2 } from "lucide-react";
import Sidebar from "../../layouts/Sidebar";
import Header from "../../layouts/Header";
import api2 from "../../../store/api2";

const UpdatePengadaan = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [formData, setFormData] = useState({
    category_id: "",
    supplier_id: "",
    location_id: "",
    item_name: "",
    image: null,
    description: "",
    quantity: "",
    price: "",
    is_maintainable: 0,
    useful_life: "1",
    notes: "",
  });

  const [currentImage, setCurrentImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageError, setImageError] = useState("");
  const [hasExistingImage, setHasExistingImage] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch data untuk di-edit
  useEffect(() => {
    const fetchProcurement = async () => {
      try {
        setFetchLoading(true);
        const response = await api2.get(`/api/procurements/${id}`);
        const procurement = response.data.data;

        console.log("Full procurement data:", procurement);
        console.log("Procurement item data:", procurement.procurement_item);

        const procurementItem = procurement.procurement_item;

        setFormData({
          category_id: procurementItem?.category_id?.toString() || "",
          supplier_id: procurementItem?.supplier_id?.toString() || "",
          location_id: procurementItem?.location_id?.toString() || "",
          item_name: procurementItem?.item_name || "",
          image: null,
          description: procurementItem?.description || "",
          quantity: procurementItem?.quantity?.toString() || "",
          price: procurementItem?.price?.toString() || "",
          is_maintainable: procurementItem?.is_maintainable || 0,
          useful_life: procurementItem?.useful_life?.toString() || "1",
          notes: procurementItem?.notes || "",
        });

        // Set current image URL jika ada
        if (procurementItem?.image) {
          setCurrentImage(procurementItem.image);
          setHasExistingImage(true);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Gagal memuat data pengadaan");
      } finally {
        setFetchLoading(false);
      }
    };

    if (id) {
      fetchProcurement();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files[0];
      if (file && file.size > 1024 * 1024) {
        setImageError("Ukuran file harus kurang dari 1MB");
        setFormData((prev) => ({ ...prev, image: null }));
        e.target.value = "";
      } else {
        setImageError("");
        setFormData((prev) => ({ ...prev, [name]: file }));
        // Reset existing image jika upload file baru
        if (file) {
          setCurrentImage("");
          setHasExistingImage(false);
        }
      }
    } else if (type === "checkbox") {
      setFormData((prev) => ({ 
        ...prev, 
        [name]: e.target.checked ? 1 : 0 
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setCurrentImage("");
    setHasExistingImage(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validasi required fields
      if (
        !formData.category_id ||
        !formData.supplier_id ||
        !formData.location_id ||
        !formData.item_name ||
        !formData.quantity ||
        !formData.price
      ) {
        throw new Error("Harap isi semua field yang wajib diisi");
      }

      const submitData = new FormData();
      submitData.append("_method", "PUT");
      submitData.append("category_id", formData.category_id);
      submitData.append("supplier_id", formData.supplier_id);
      submitData.append("location_id", formData.location_id);
      submitData.append("item_name", formData.item_name);
      submitData.append("description", formData.description);
      submitData.append("quantity", formData.quantity);
      submitData.append("price", formData.price);
      submitData.append("is_maintainable", formData.is_maintainable);
      
      if (formData.is_maintainable && formData.useful_life !== null) {
        submitData.append("useful_life", formData.useful_life);
      }
      
      submitData.append("notes", formData.notes);

      // Handle image
      if (formData.image) {
        submitData.append("image", formData.image);
      } else if (!hasExistingImage) {
        // Jika tidak ada image existing dan tidak upload baru, hapus image
        submitData.append("remove_image", "true");
      }

      // Debug: Log FormData
      console.log("Submitting FormData:");
      for (let [key, value] of submitData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await api2.post(`/api/procurements/${id}`, submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Update success:", response.data);
      setSuccess("Pengadaan berhasil diupdate!");
      setTimeout(() => {
        navigate("/pengadaan");
      }, 2000);
    } catch (err) {
      console.error("Update error:", err);

      if (err.response?.status === 422) {
        const validationErrors = err.response.data?.errors;
        if (validationErrors) {
          const errorMessages = Object.values(validationErrors)
            .flat()
            .join(", ");
          setError(`Validasi gagal: ${errorMessages}`);
        } else {
          setError("Validasi gagal. Silakan periksa input Anda.");
        }
      } else if (err.response?.status === 403) {
        setError("Anda tidak memiliki akses untuk mengupdate data ini");
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Gagal mengupdate pengadaan."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (fetchLoading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header setSidebarOpen={setSidebarOpen} />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-lg text-slate-600">Memuat data pengadaan...</span>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigate('/pengadaan')}
                    className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Kembali</span>
                  </button>
                  <div className="w-px h-6 bg-slate-300"></div>
                  <h1 className="text-3xl font-bold text-slate-900">Edit Pengadaan</h1>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Edit className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-slate-600">
                Update data pengadaan untuk item: <strong>{formData.item_name}</strong>
              </p>
            </div>

            {/* Alert Messages */}
            {error && (
              <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl">
                <strong>Error:</strong> {error}
              </div>
            )}

            {success && (
              <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl">
                <strong>Sukses:</strong> {success}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informasi Relational IDs */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Informasi Relational</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Category ID */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Category ID *
                    </label>
                    <input
                      type="number"
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300"
                      placeholder="1"
                      required
                    />
                    <p className="text-xs text-slate-500 mt-1">ID kategori dari database</p>
                  </div>

                  {/* Supplier ID */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Supplier ID *
                    </label>
                    <input
                      type="number"
                      name="supplier_id"
                      value={formData.supplier_id}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300"
                      placeholder="1"
                      required
                    />
                    <p className="text-xs text-slate-500 mt-1">ID supplier dari database</p>
                  </div>

                  {/* Location ID */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Location ID *
                    </label>
                    <input
                      type="number"
                      name="location_id"
                      value={formData.location_id}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300"
                      placeholder="1"
                      required
                    />
                    <p className="text-xs text-slate-500 mt-1">ID lokasi (harus leaf node)</p>
                  </div>
                </div>
              </div>

              {/* Informasi Item */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Informasi Item</h2>
                
                <div className="grid grid-cols-1 gap-4">
                  {/* Item Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nama Item *
                    </label>
                    <input
                      type="text"
                      name="item_name"
                      value={formData.item_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300"
                      placeholder="Masukkan nama item"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Deskripsi
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300"
                      placeholder="Deskripsi detail item..."
                    />
                  </div>
                </div>
              </div>

              {/* Detail Kuantitas dan Harga */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Detail Kuantitas & Harga</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300"
                      placeholder="0"
                      required
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Harga per Unit *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300"
                      placeholder="0"
                      required
                    />
                    {formData.price && (
                      <p className="text-sm text-slate-500 mt-1">
                        {formatCurrency(formData.price)} per unit
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Maintenance Settings */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Pengaturan Maintenance</h2>
                
                <div className="space-y-4">
                  {/* Is Maintainable */}
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="is_maintainable"
                      checked={formData.is_maintainable === 1}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      Item dapat di-maintain (memerlukan perawatan)
                    </span>
                  </div>

                  {/* Useful Life - Conditional */}
                  {formData.is_maintainable === 1 && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Masa Pakai (tahun) *
                      </label>
                      <input
                        type="number"
                        name="useful_life"
                        value={formData.useful_life}
                        onChange={handleChange}
                        min="1"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300"
                        placeholder="1"
                        required
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Gambar dan Catatan */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Gambar & Catatan</h2>
                
                <div className="space-y-6">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Gambar Item
                    </label>
                    
                    {/* Current Image Preview */}
                    {hasExistingImage && currentImage && (
                      <div className="mb-4">
                        <p className="text-sm text-slate-600 mb-2">Gambar saat ini:</p>
                        <div className="flex items-center space-x-4">
                          <img 
                            src={currentImage} 
                            alt="Current item" 
                            className="w-32 h-32 object-cover rounded-lg border border-slate-200"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="flex items-center space-x-1 px-3 py-2 bg-rose-500 text-white text-sm rounded-lg hover:bg-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Image Upload Area */}
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center">
                      <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600 mb-2">
                        {hasExistingImage ? "Upload gambar baru untuk mengganti" : "Upload gambar item"}
                      </p>
                      <p className="text-slate-500 text-sm mb-4">JPG, PNG (Max. 1MB)</p>
                      <input
                        type="file"
                        name="image"
                        onChange={handleChange}
                        accept="image/*"
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="inline-block px-6 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium cursor-pointer"
                      >
                        Pilih File
                      </label>
                      {formData.image && (
                        <p className="text-sm text-slate-600 mt-2">
                          File terpilih: {formData.image.name}
                        </p>
                      )}
                      {imageError && (
                        <p className="text-sm text-rose-600 mt-2">{imageError}</p>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Catatan
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300"
                      placeholder="Catatan tambahan..."
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/pengadaan')}
                  className="px-8 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-300"
                >
                  Batal
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Mengupdate...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Update Pengadaan</span>
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

export default UpdatePengadaan;