// src/pages/pengadaan/Create.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Save,
  ArrowLeft,
  Upload,
  Package,
  Building,
  Truck,
  MapPin,
} from "lucide-react";
import Sidebar from "../../layouts/Sidebar";
import Header from "../../layouts/Header";
import api2 from "../../../store/api2";

const CreatePengadaan = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageError, setImageError] = useState("");

  // Data untuk dropdown (contoh - sesuaikan dengan data dari API Anda)
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [locations, setLocations] = useState([]);

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
    useful_life: null,
    notes: "",
  });

  // Fetch data untuk dropdown
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        // Contoh data - ganti dengan API call yang sesungguhnya
        setCategories([
          { id: 1, name: "Teknologi" },
          { id: 2, name: "Furniture" },
          { id: 3, name: "Alat Tulis Kantor" },
        ]);

        setSuppliers([
          { id: 1, name: "PT. Sumber Makmur" },
          { id: 2, name: "CV. Jaya Abadi" },
          { id: 3, name: "PT. Maju Terus" },
        ]);

        setLocations([
          { id: 3, name: "Gedung A - Lantai 1 - Ruang 101", is_leaf: true },
          { id: 4, name: "Gedung A - Lantai 1 - Ruang 102", is_leaf: true },
          { id: 6, name: "Gedung B - Lantai 2 - Lab Komputer", is_leaf: true },
        ]);
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
      }
    };

    fetchDropdownData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files[0];

      // Validasi ukuran file (max 1MB = 1024KB)
      if (file && file.size > 1024 * 1024) {
        setImageError("Ukuran file harus kurang dari 1MB");
        setFormData((prev) => ({
          ...prev,
          image: null,
        }));
        e.target.value = "";
      } else {
        setImageError("");
        setFormData((prev) => ({
          ...prev,
          [name]: file,
        }));
      }
    } else if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: e.target.checked ? 1 : 0,
        // Reset useful_life jika tidak maintainable
        useful_life: e.target.checked ? prev.useful_life : null,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validasi form
    if (
      !formData.category_id ||
      !formData.supplier_id ||
      !formData.location_id ||
      !formData.item_name ||
      !formData.quantity ||
      !formData.price
    ) {
      setError("Harap isi semua field yang wajib diisi");
      setLoading(false);
      return;
    }

    try {
      console.log("Form data sebelum dikirim:", formData);

      // Create FormData dengan format yang benar
      const submitData = new FormData();

      // Pastikan ID dikonversi ke number
      submitData.append("category_id", parseInt(formData.category_id));
      submitData.append("supplier_id", parseInt(formData.supplier_id));
      submitData.append("location_id", parseInt(formData.location_id));
      submitData.append("item_name", formData.item_name);
      submitData.append("description", formData.description || "");
      submitData.append("quantity", parseInt(formData.quantity));
      submitData.append("price", parseFloat(formData.price));
      submitData.append("is_maintainable", formData.is_maintainable);

      if (formData.is_maintainable && formData.useful_life !== null) {
        submitData.append("useful_life", parseInt(formData.useful_life));
      }

      submitData.append("notes", formData.notes || "");

      // Log data yang akan dikirim
      console.log("Data yang dikirim:");
      for (let [key, value] of submitData.entries()) {
        console.log(key, value);
      }

      // Only append image if exists
      if (formData.image) {
        submitData.append("image", formData.image);
      }

      const response = await api2.post("/api/procurements", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ SUCCESS:", response);
      setSuccess("Pengadaan berhasil dibuat!");

      setTimeout(() => {
        navigate("/pengadaan");
      }, 2000);
    } catch (err) {
      console.error("Error detail:", err);
      // ... error handling tetap sama
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
          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="mb-8 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigate("/pengadaan")}
                    className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Kembali</span>
                  </button>
                  <div className="w-px h-6 bg-slate-300"></div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    Buat Pengadaan Baru
                  </h1>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-slate-600 text-lg">
                Isi formulir berikut untuk membuat pengadaan baru
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
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Informasi Dasar */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6">
                  Informasi Dasar
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Kategori *
                    </label>
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300"
                      required
                    >
                      <option value="">Pilih Kategori</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Supplier */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Supplier *
                    </label>
                    <select
                      name="supplier_id"
                      value={formData.supplier_id}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300"
                      required
                    >
                      <option value="">Pilih Supplier</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Lokasi *
                    </label>
                    <select
                      name="location_id"
                      value={formData.location_id}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300"
                      required
                    >
                      <option value="">Pilih Lokasi</option>
                      {locations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.name}
                        </option>
                      ))}
                    </select>
                  </div>

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
                </div>
              </div>

              {/* Detail Item */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6">
                  Detail Item
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

                  {/* Is Maintainable */}
                  <div className="lg:col-span-2">
                    <label className="flex items-center space-x-3">
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
                    </label>
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

              {/* Gambar dan Deskripsi */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6">
                  Gambar & Deskripsi
                </h2>

                <div className="space-y-6">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Gambar Item (Opsional)
                    </label>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center">
                      <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600 mb-2">Upload gambar item</p>
                      <p className="text-slate-500 text-sm mb-4">
                        JPG, PNG (Max. 1MB)
                      </p>
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
                        <p className="text-sm text-rose-600 mt-2">
                          {imageError}
                        </p>
                      )}
                    </div>
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
                  onClick={() => navigate("/pengadaan")}
                  className="px-8 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-300"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Buat Pengadaan</span>
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

export default CreatePengadaan;
