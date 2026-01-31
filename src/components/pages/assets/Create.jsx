// src/pages/assets/Create.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Save,
  ArrowLeft,
  Upload,
  Package,
  Building,
  Tag,
  MapPin,
  ChevronDown,
  Loader,
  DollarSign,
  Calendar,
  Shield,
  Info,
  Check,
  X,
  Truck,
} from "lucide-react";
import Sidebar from "../../layouts/Sidebar";
import Header from "../../layouts/Header";
import api2 from "../../../store/api2";

const CreateAsset = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageError, setImageError] = useState("");

  // Data untuk dropdown
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  
  // Data lokasi hierarki
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [subLocations, setSubLocations] = useState([]);
  
  // Loading states
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [loadingBuildings, setLoadingBuildings] = useState(false);
  const [loadingFloors, setLoadingFloors] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingSubLocations, setLoadingSubLocations] = useState(false);

  const [formData, setFormData] = useState({
    category_id: "",
    supplier_id: "",
    location_id: "",
    name: "",
    image: null,
    description: "",
    price: "",
    code: "",
    is_available_in_the_room: 1,
    is_maintainable: 0,
    useful_life: "",
    status: "available",
    is_bulk_insert: 0,
    // Lokasi
    building_id: "",
    floor_id: "",
    room_id: "",
    sub_location_id: "",
  });

  // Fetch data untuk dropdown
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        // Fetch categories dari API
        await fetchCategories();
        
        // Fetch suppliers dari API
        await fetchSuppliers();

        // Fetch building locations dari API
        await fetchBuildings();
        
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
        setError("Gagal memuat data dropdown. Silakan refresh halaman.");
      }
    };

    fetchDropdownData();
  }, []);

  // Fetch categories dari backend
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await api2.get("/api/categories/all");
      
      console.log("Asset Categories response:", response);
      
      let categoriesData = [];
      
      // Handle response berdasarkan struktur data
      if (response.data && response.data.data) {
        categoriesData = response.data.data;
      } else if (response.data && response.data.meta && response.data.meta.code === 200) {
        categoriesData = response.data.data || [];
      } else if (Array.isArray(response.data)) {
        categoriesData = response.data;
      }
      
      if (!Array.isArray(categoriesData)) {
        console.error("Categories data is not an array:", categoriesData);
        categoriesData = [];
      }
      
      setCategories(categoriesData);
      
    } catch (err) {
      console.error("Error fetching asset categories:", err);
      let errorMessage = "Gagal memuat data kategori asset.";
      if (err.response) {
        if (err.response.status === 403) {
          errorMessage = "Anda tidak memiliki izin untuk mengakses data kategori.";
        } else if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      }
      setError(errorMessage);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Fetch suppliers dari backend
  const fetchSuppliers = async () => {
    try {
      setLoadingSuppliers(true);
      const response = await api2.get("/api/suppliers");
      
      console.log("Suppliers response:", response);
      
      let suppliersData = [];
      
      // Handle response
      if (response.data && response.data.data) {
        suppliersData = response.data.data;
      } else if (Array.isArray(response.data)) {
        suppliersData = response.data;
      }
      
      if (!Array.isArray(suppliersData)) {
        console.error("Suppliers data is not an array:", suppliersData);
        suppliersData = [];
      }
      
      setSuppliers(suppliersData);
      
    } catch (err) {
      console.error("Error fetching suppliers:", err);
      // Tidak set error karena supplier opsional
    } finally {
      setLoadingSuppliers(false);
    }
  };

  // Fetch buildings (level 1)
  const fetchBuildings = async () => {
    try {
      setLoadingBuildings(true);
      const response = await api2.get("/api/locations/building");
      
      console.log("Buildings response:", response);
      
      let buildingsData = [];
      if (response.data && response.data.data) {
        buildingsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        buildingsData = response.data;
      }
      
      if (!Array.isArray(buildingsData)) {
        console.error("Buildings data is not an array:", buildingsData);
        buildingsData = [];
      }
      
      setBuildings(buildingsData);
      
    } catch (err) {
      console.error("Error fetching buildings:", err);
      let errorMessage = "Gagal memuat data gedung.";
      if (err.response) {
        if (err.response.status === 403) {
          errorMessage = "Anda tidak memiliki izin untuk mengakses data lokasi.";
        } else if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      }
      setError(errorMessage);
    } finally {
      setLoadingBuildings(false);
    }
  };

  // Fetch floors (level 2) ketika building dipilih
  const fetchFloors = async (buildingId) => {
    if (!buildingId) {
      setFloors([]);
      setRooms([]);
      setSubLocations([]);
      return;
    }

    try {
      setLoadingFloors(true);
      setRooms([]);
      setSubLocations([]);
      setFormData(prev => ({
        ...prev,
        floor_id: "",
        room_id: "",
        sub_location_id: "",
        location_id: ""
      }));

      const response = await api2.get(`/api/locations/${buildingId}/getOneLevelChildren`);
      
      console.log("Floors response for building", buildingId, ":", response);
      
      let floorsData = [];
      if (response.data && response.data.data) {
        floorsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        floorsData = response.data;
      }
      
      if (!Array.isArray(floorsData)) {
        console.error("Floors data is not an array:", floorsData);
        floorsData = [];
      }
      
      setFloors(floorsData);
      
    } catch (err) {
      console.error(`Error fetching floors for building ${buildingId}:`, err);
      setFloors([]);
      setError("Gagal memuat data lantai untuk gedung ini.");
    } finally {
      setLoadingFloors(false);
    }
  };

  // Fetch rooms (level 3) ketika floor dipilih
  const fetchRooms = async (floorId) => {
    if (!floorId) {
      setRooms([]);
      setSubLocations([]);
      return;
    }

    try {
      setLoadingRooms(true);
      setSubLocations([]);
      setFormData(prev => ({
        ...prev,
        room_id: "",
        sub_location_id: "",
        location_id: ""
      }));

      const response = await api2.get(`/api/locations/${floorId}/getOneLevelChildren`);
      
      console.log("Rooms response for floor", floorId, ":", response);
      
      let roomsData = [];
      if (response.data && response.data.data) {
        roomsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        roomsData = response.data;
      }
      
      if (!Array.isArray(roomsData)) {
        console.error("Rooms data is not an array:", roomsData);
        roomsData = [];
      }
      
      setRooms(roomsData);
      
    } catch (err) {
      console.error(`Error fetching rooms for floor ${floorId}:`, err);
      setRooms([]);
      setError("Gagal memuat data ruangan untuk lantai ini.");
    } finally {
      setLoadingRooms(false);
    }
  };

  // Fetch sub-locations (level 4) ketika room dipilih
  const fetchSubLocations = async (roomId) => {
    if (!roomId) {
      setSubLocations([]);
      return;
    }

    try {
      setLoadingSubLocations(true);
      setFormData(prev => ({
        ...prev,
        sub_location_id: "",
        location_id: ""
      }));

      const response = await api2.get(`/api/locations/${roomId}/getOneLevelChildren`);
      
      console.log("Sub-locations response for room", roomId, ":", response);
      
      let subLocationsData = [];
      if (response.data && response.data.data) {
        subLocationsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        subLocationsData = response.data;
      }
      
      if (!Array.isArray(subLocationsData)) {
        console.error("Sub-locations data is not an array:", subLocationsData);
        subLocationsData = [];
      }
      
      setSubLocations(subLocationsData);
      
    } catch (err) {
      console.error(`Error fetching sub-locations for room ${roomId}:`, err);
      setSubLocations([]);
      setError("Gagal memuat data sub-lokasi untuk ruangan ini.");
    } finally {
      setLoadingSubLocations(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files[0];

      // Validasi ukuran file (max 2MB = 2048KB)
      if (file && file.size > 2 * 1024 * 1024) {
        setImageError("Ukuran file harus kurang dari 2MB");
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
        // Reset useful_life jika is_maintainable false
        ...(name === "is_maintainable" && !e.target.checked ? { useful_life: "" } : {}),
      }));
    } else {
      const newFormData = {
        ...formData,
        [name]: value,
      };

      // Handle perubahan dropdown lokasi
      if (name === "building_id") {
        fetchFloors(value);
        newFormData.floor_id = "";
        newFormData.room_id = "";
        newFormData.sub_location_id = "";
        newFormData.location_id = "";
      } else if (name === "floor_id") {
        fetchRooms(value);
        newFormData.room_id = "";
        newFormData.sub_location_id = "";
        newFormData.location_id = "";
      } else if (name === "room_id") {
        fetchSubLocations(value);
        newFormData.sub_location_id = "";
        newFormData.location_id = "";
      } else if (name === "sub_location_id") {
        // Jika ada sub-location, gunakan itu sebagai location_id
        newFormData.location_id = value;
      } else if (name === "room_id" && !subLocations.length) {
        // Jika tidak ada sub-location, gunakan room_id sebagai location_id
        newFormData.location_id = value;
      }

      setFormData(newFormData);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validasi form
    const requiredFields = {
      category_id: "Kategori",
      name: "Nama Asset",
      location_id: "Lokasi",
      price: "Harga",
      status: "Status",
    };

    const missingFields = [];
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field]) {
        missingFields.push(label);
      }
    }

    if (missingFields.length > 0) {
      setError(`Harap isi field yang wajib: ${missingFields.join(", ")}`);
      setLoading(false);
      return;
    }

    if (formData.is_maintainable && !formData.useful_life) {
      setError("Masa pakai harus diisi untuk asset yang dapat di-maintain");
      setLoading(false);
      return;
    }

    // Validasi lokasi
    if (!formData.location_id) {
      setError("Silakan pilih lokasi yang lengkap (gedung, lantai, dan ruangan)");
      setLoading(false);
      return;
    }

    try {
      console.log("Form data sebelum dikirim:", formData);

      // Create FormData untuk mengirim file
      const submitData = new FormData();
      submitData.append("category_id", parseInt(formData.category_id));
      
      if (formData.supplier_id) {
        submitData.append("supplier_id", parseInt(formData.supplier_id));
      }
      
      submitData.append("location_id", parseInt(formData.location_id));
      submitData.append("name", formData.name);
      submitData.append("description", formData.description || "");
      submitData.append("price", parseFloat(formData.price));
      submitData.append("code", formData.code || "");
      submitData.append("is_available_in_the_room", formData.is_available_in_the_room);
      submitData.append("is_maintainable", formData.is_maintainable);
      submitData.append("status", formData.status);
      submitData.append("is_bulk_insert", formData.is_bulk_insert);

      if (formData.is_maintainable && formData.useful_life) {
        submitData.append("useful_life", parseInt(formData.useful_life));
      }

      if (formData.image) {
        submitData.append("image", formData.image);
      }

      // Log data yang akan dikirim
      console.log("Data yang dikirim ke API:");
      for (let [key, value] of submitData.entries()) {
        console.log(key, value);
      }

      // Kirim request ke API assets
      const response = await api2.post("/api/assets", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ SUCCESS Response:", response);
      setSuccess("Asset berhasil dibuat!");

      // Redirect ke halaman assets setelah 2 detik
      setTimeout(() => {
        navigate("/assets");
      }, 2000);
    } catch (err) {
      console.error("❌ Error detail:", err);
      
      let errorMessage = "Gagal membuat asset";
      
      if (err.response) {
        console.error("Response status:", err.response.status);
        console.error("Response data:", err.response.data);
        
        if (err.response.status === 422) {
          // Validation errors dari Laravel
          if (err.response.data.errors) {
            const errors = err.response.data.errors;
            const errorMessages = [];
            
            for (const field in errors) {
              if (errors[field]) {
                errorMessages.push(...errors[field]);
              }
            }
            
            errorMessage = errorMessages.join(", ");
          } else if (err.response.data.message) {
            errorMessage = err.response.data.message;
          }
        } else if (err.response.status === 403) {
          errorMessage = "Anda tidak memiliki izin untuk membuat asset.";
        } else if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data && err.response.data.error) {
          errorMessage = err.response.data.error;
        }
      } else if (err.request) {
        console.error("No response received:", err.request);
        errorMessage = "Tidak ada response dari server";
      } else {
        console.error("Error message:", err.message);
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "Rp 0";
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
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="mb-8 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigate("/assets")}
                    className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Kembali</span>
                  </button>
                  <div className="w-px h-6 bg-slate-300"></div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    Tambah Asset Baru
                  </h1>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-slate-600 text-lg">
                Isi formulir berikut untuk menambahkan asset baru ke inventory
              </p>
            </div>

            {/* Alert Messages */}
            {error && (
              <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-rose-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-rose-800">Error</h3>
                    <div className="mt-1 text-sm text-rose-700">
                      {error}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-emerald-800">Sukses</h3>
                    <div className="mt-1 text-sm text-emerald-700">
                      {success}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Informasi Dasar Asset */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                  <Info className="w-5 h-5 text-emerald-600 mr-2" />
                  Informasi Dasar Asset
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Nama Asset */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nama Asset *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-300"
                      placeholder="Contoh: Laptop Dell Inspiron 15"
                      required
                    />
                  </div>

                  {/* Kode Asset */}
                  {/* <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Kode Asset (Opsional)
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-300"
                      placeholder="Contoh: AST-TKN-2026-00001"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Biarkan kosong untuk generate otomatis
                    </p>
                  </div> */}

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Kategori *
                    </label>
                    <div className="relative">
                      <select
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-300 appearance-none pr-10"
                        required
                        disabled={loadingCategories}
                      >
                        <option value="">Pilih Kategori</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      <Tag className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                      {loadingCategories && (
                        <Loader className="w-4 h-4 absolute right-8 top-1/2 transform -translate-y-1/2 animate-spin text-emerald-500" />
                      )}
                    </div>
                  </div>

                  {/* Supplier (Opsional) */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Supplier
                    </label>
                    <div className="relative">
                      <select
                        name="supplier_id"
                        value={formData.supplier_id}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-300 appearance-none pr-10"
                        disabled={loadingSuppliers}
                      >
                        <option value="">Pilih Supplier</option>
                        {suppliers.map((supplier) => (
                          <option key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </option>
                        ))}
                      </select>
                      <Truck className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                      {loadingSuppliers && (
                        <Loader className="w-4 h-4 absolute right-8 top-1/2 transform -translate-y-1/2 animate-spin text-emerald-500" />
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Harga *
                    </label>
                    <div className="relative">
                      <span className="text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2 font-medium">Rp</span>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-300"
                        placeholder="0"
                        required
                      />
                    </div>
                    {formData.price && (
                      <p className="text-sm text-slate-500 mt-1">
                        {formatCurrency(formData.price)}
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Status *
                    </label>
                    <div className="relative">
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-300 appearance-none pr-10"
                        required
                      >
                        <option value="available">Tersedia</option>
                        <option value="in_transit">Sedang Dipindahkan</option>
                        <option value="in_use">Digunakan</option>
                        <option value="in_repair">Dalam Perbaikan</option>
                        <option value="damaged">Rusak</option>
                        <option value="lost">Hilang</option>
                      </select>
                      <Shield className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Lokasi Asset */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                  <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                  Lokasi Asset
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {/* Level 1: Building */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Kampus *
                    </label>
                    <div className="relative">
                      <select
                        name="building_id"
                        value={formData.building_id}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-300 appearance-none pr-8"
                        required
                        disabled={loadingBuildings}
                      >
                        <option value="">Pilih Kampus</option>
                        {buildings.map((building) => (
                          <option key={building.id} value={building.id}>
                            {building.name || `Kampus ${building.id}`}
                          </option>
                        ))}
                      </select>
                      <Building className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                      {loadingBuildings && (
                        <Loader className="w-4 h-4 absolute right-8 top-1/2 transform -translate-y-1/2 animate-spin text-emerald-500" />
                      )}
                    </div>
                  </div>

                  {/* Level 2: Floor */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Gedung *
                    </label>
                    <div className="relative">
                      <select
                        name="floor_id"
                        value={formData.floor_id}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-300 appearance-none pr-8"
                        required
                        disabled={!formData.building_id || loadingFloors}
                      >
                        <option value="">Pilih Gedung</option>
                        {floors.map((floor) => (
                          <option key={floor.id} value={floor.id}>
                            {floor.name || `Gedung ${floor.id}`}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                      {loadingFloors && (
                        <Loader className="w-4 h-4 absolute right-8 top-1/2 transform -translate-y-1/2 animate-spin text-emerald-500" />
                      )}
                    </div>
                  </div>

                  {/* Level 3: Room */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Lantai *
                    </label>
                    <div className="relative">
                      <select
                        name="room_id"
                        value={formData.room_id}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-300 appearance-none pr-8"
                        required
                        disabled={!formData.floor_id || loadingRooms}
                      >
                        <option value="">Pilih Lantai</option>
                        {rooms.map((room) => (
                          <option key={room.id} value={room.id}>
                            {room.name || `Ruangan ${room.id}`}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                      {loadingRooms && (
                        <Loader className="w-4 h-4 absolute right-8 top-1/2 transform -translate-y-1/2 animate-spin text-emerald-500" />
                      )}
                    </div>
                  </div>

                  {/* Level 4: Ruangan */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Ruangan
                    </label>
                    <div className="relative">
                      <select
                        name="sub_location_id"
                        value={formData.sub_location_id}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-300 appearance-none pr-8"
                        disabled={!formData.room_id || loadingSubLocations}
                      >
                        <option value="">Pilih Ruangan</option>
                        {subLocations.length > 0 ? (
                          subLocations.map((subLoc) => (
                            <option key={subLoc.id} value={subLoc.id}>
                              {subLoc.name || `Ruangan ${subLoc.id}`}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>
                            Tidak ada sub-lokasi
                          </option>
                        )}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                      {loadingSubLocations && (
                        <Loader className="w-4 h-4 absolute right-8 top-1/2 transform -translate-y-1/2 animate-spin text-emerald-500" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Lokasi Terpilih */}
                {formData.location_id && (
                  <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-emerald-600 mr-2" />
                      <span className="text-sm font-medium text-emerald-800">
                        Lokasi terpilih:
                      </span>
                    </div>
                    <div className="text-sm text-emerald-700 mt-1">
                      {(() => {
                        const building = buildings.find(b => b.id === parseInt(formData.building_id));
                        const floor = floors.find(f => f.id === parseInt(formData.floor_id));
                        const room = rooms.find(r => r.id === parseInt(formData.room_id));
                        const subLocation = subLocations.find(s => s.id === parseInt(formData.sub_location_id));
                        
                        let locationPath = [];
                        if (building) locationPath.push(building.name || `Gedung ${building.id}`);
                        if (floor) locationPath.push(floor.name || `Lantai ${floor.id}`);
                        if (room) locationPath.push(room.name || `Ruangan ${room.id}`);
                        if (subLocation) locationPath.push(subLocation.name || `Sub-Lokasi ${subLocation.id}`);
                        
                        return locationPath.join(" → ");
                      })()}
                    </div>
                  </div>
                )}

                {/* Hidden input untuk location_id */}
                <input
                  type="hidden"
                  name="location_id"
                  value={formData.location_id}
                  required
                />
                
                {/* Validation message */}
                {!formData.location_id && (
                  <p className="text-sm text-rose-600 mt-2">
                    Silakan pilih Kampus, Gedung, lantai, dan ruangan untuk menentukan lokasi
                  </p>
                )}
              </div>

              {/* Maintenance & Availability */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                  
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* Is Maintainable */}
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.is_maintainable ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'}`}>
                        
                      </div>
                    </div>
                    <div>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="is_maintainable"
                          checked={formData.is_maintainable === 1}
                          onChange={handleChange}
                          className="hidden"
                          id="maintainable-toggle"
                        />
                        <div className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${formData.is_maintainable ? 'bg-orange-500' : 'bg-slate-300'}`}>
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${formData.is_maintainable ? 'right-1' : 'left-1'}`}></div>
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          Dapat di-Maintain
                        </span>
                      </label>
                      <p className="text-xs text-slate-500 mt-1">
                        Asset memerlukan perawatan berkala
                      </p>
                    </div>
                  </div>

                  {/* Useful Life - Conditional */}
                  {formData.is_maintainable === 1 && (
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
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-300"
                          placeholder="90"
                          required={formData.is_maintainable === 1}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Lama waktu dalam hari sebelum asset perlu perawatan
                      </p>
                    </div>
                  )}

                  {/* Is Bulk Insert (Hidden) */}
                  <input
                    type="hidden"
                    name="is_bulk_insert"
                    value={formData.is_bulk_insert}
                  />
                </div>
              </div>

              {/* Gambar & Deskripsi */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6">
                  Gambar & Deskripsi
                </h2>

                <div className="space-y-6">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Gambar Asset (Opsional)
                    </label>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-emerald-300 transition-colors">
                      <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600 mb-2">Upload gambar asset</p>
                      <p className="text-slate-500 text-sm mb-4">
                        JPG, PNG, GIF (Max. 2MB)
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
                        className="inline-block px-6 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-emerald-300 transition-colors font-medium cursor-pointer"
                      >
                        Pilih File
                      </label>
                      {formData.image && (
                        <div className="mt-4">
                          <div className="flex items-center justify-center">
                            <img
                              src={URL.createObjectURL(formData.image)}
                              alt="Preview"
                              className="max-w-32 max-h-32 rounded-lg object-cover"
                            />
                          </div>
                          <p className="text-sm text-slate-600 mt-2">
                            {formData.image.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            Ukuran: {(formData.image.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
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
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-300"
                      placeholder="Deskripsi detail asset (spesifikasi, kondisi, catatan khusus)..."
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6">
                <button
                  type="button"
                  onClick={() => navigate("/assets")}
                  className="px-8 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-300"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={loading || !formData.location_id}
                  className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Buat Asset</span>
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

export default CreateAsset;