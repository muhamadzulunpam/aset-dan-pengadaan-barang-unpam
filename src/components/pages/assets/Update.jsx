// src/pages/assets/Update.js
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  ArrowLeft,
  Upload,
  Package,
  Building,
  MapPin,
  Edit,
  Trash2,
  ChevronDown,
  Loader,
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
} from "lucide-react";
import Sidebar from "../../layouts/Sidebar";
import Header from "../../layouts/Header";
import { assetService } from "../../../services/assetService";
import api2 from "../../../store/api2";

const UpdateAsset = () => {
  const navigate = useNavigate();
  const { code } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageError, setImageError] = useState("");
  const [currentImage, setCurrentImage] = useState("");
  const [hasExistingImage, setHasExistingImage] = useState(false);

  // Data untuk dropdown
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);

  // Loading states
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingBuildings, setLoadingBuildings] = useState(false);
  const [loadingFloors, setLoadingFloors] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // Status options
  const statusOptions = [
    { value: "available", label: "Tersedia", icon: CheckCircle, color: "text-emerald-500" },
    { value: "in_use", label: "Digunakan", icon: Users, color: "text-blue-500" },
    { value: "in_transit", label: "Dalam Perjalanan", icon: Activity, color: "text-yellow-500" },
    { value: "maintenance", label: "Perawatan", icon: AlertTriangle, color: "text-orange-500" },
    { value: "damaged", label: "Rusak", icon: XCircle, color: "text-rose-500" },
    { value: "lost", label: "Hilang", icon: Archive, color: "text-slate-500" },
    { value: "disposed", label: "Dibuang", icon: ShieldCheck, color: "text-gray-500" },
  ];

  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    status: "available",
    description: "",
    image: null,
    purchase_date: "",
    price: "",
    warranty_expiration: "",
    // Lokasi dengan 4 level:
    location_level1: "",
    location_level2: "",
    location_level3: "",
    location_level4: "",
    location_id: "",
    // Additional fields
    supplier: "",
    supplier_id: "",
    notes: "",
    is_maintainable: 0,
    useful_life: "",
  });

  // Fetch categories dari API
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await assetService.getAssetCategories();
      
      let categoriesData = [];
      
      if (response.data && Array.isArray(response.data)) {
        categoriesData = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        categoriesData = response.data.data;
      } else if (Array.isArray(response)) {
        categoriesData = response;
      } else if (response && response.meta && response.meta.code === 200) {
        categoriesData = response.data || [];
      }
      
      if (!Array.isArray(categoriesData)) {
        console.error("Categories data is not an array:", categoriesData);
        categoriesData = [];
      }
      
      setCategories(categoriesData);
      
    } catch (err) {
      console.error("Error fetching categories:", err);
      let errorMessage = "Gagal memuat data kategori.";
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

  // Fetch suppliers dari API
  const fetchSuppliers = async () => {
    try {
      setLoadingSuppliers(true);
      const response = await api2.get("/api/suppliers/all");
      
      let suppliersData = [];
      
      if (response.data && response.data.data) {
        suppliersData = response.data.data;
      } else if (Array.isArray(response.data)) {
        suppliersData = response.data;
      } else if (response.data && Array.isArray(response.data)) {
        suppliersData = response.data;
      }
      
      if (!Array.isArray(suppliersData)) {
        console.error("Suppliers data is not an array:", suppliersData);
        suppliersData = [];
      }
      
      setSuppliers(suppliersData);
      
    } catch (err) {
      console.error("Error fetching suppliers:", err);
      console.error("Supplier fetch error details:", err.response?.data);
      setError("Gagal memuat data supplier.");
    } finally {
      setLoadingSuppliers(false);
    }
  };

  // Fetch locations (level 1)
  const fetchLocations = async () => {
    try {
      setLoadingLocations(true);
      const response = await api2.get("/api/locations/building");
      
      let locationsData = [];
      if (response.data && response.data.data) {
        locationsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        locationsData = response.data;
      }
      
      if (!Array.isArray(locationsData)) {
        console.error("Locations data is not an array:", locationsData);
        locationsData = [];
      }
      
      setLocations(locationsData);
      
    } catch (err) {
      console.error("Error fetching locations:", err);
      let errorMessage = "Gagal memuat data lokasi.";
      if (err.response) {
        if (err.response.status === 403) {
          errorMessage = "Anda tidak memiliki izin untuk mengakses data lokasi.";
        } else if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      }
      setError(errorMessage);
    } finally {
      setLoadingLocations(false);
    }
  };

  // Fetch buildings (level 2) ketika location dipilih
  const fetchBuildingsForLocation = async (locationId, callback = null) => {
    if (!locationId) {
      setBuildings([]);
      setFloors([]);
      setRooms([]);
      return;
    }

    try {
      setLoadingBuildings(true);
      
      const response = await api2.get(`/api/locations/${locationId}/getOneLevelChildren`);
      
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
      
      setFloors([]);
      setRooms([]);
      
      if (callback && typeof callback === 'function') {
        await callback();
      }
      
    } catch (err) {
      console.error(`Error fetching buildings for location ${locationId}:`, err);
      setBuildings([]);
    } finally {
      setLoadingBuildings(false);
    }
  };

  // Fetch floors (level 3) ketika building dipilih
  const fetchFloorsForBuilding = async (buildingId, callback = null) => {
    if (!buildingId) {
      setFloors([]);
      setRooms([]);
      return;
    }

    try {
      setLoadingFloors(true);
      
      const response = await api2.get(`/api/locations/${buildingId}/getOneLevelChildren`);
      
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
      
      setRooms([]);
      
      if (callback && typeof callback === 'function') {
        await callback();
      }
      
    } catch (err) {
      console.error(`Error fetching floors for building ${buildingId}:`, err);
      setFloors([]);
    } finally {
      setLoadingFloors(false);
    }
  };

  // Fetch rooms (level 4) ketika floor dipilih
  const fetchRoomsForFloor = async (floorId, callback = null) => {
    if (!floorId) {
      setRooms([]);
      return;
    }

    try {
      setLoadingRooms(true);
      
      const response = await api2.get(`/api/locations/${floorId}/getOneLevelChildren`);
      
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
      
      if (callback && typeof callback === 'function') {
        await callback();
      }
      
    } catch (err) {
      console.error(`Error fetching rooms for floor ${floorId}:`, err);
      setRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  };

  // Fetch asset data berdasarkan code
  const fetchAssetData = async () => {
    try {
      setFetchLoading(true);
      setError("");
      
      if (!code) {
        throw new Error("Kode asset tidak ditemukan");
      }
      
      const response = await assetService.getAssetByCode(code);
      
      console.log("Asset API Response:", response);
      
      let assetData;
      if (response.data) {
        assetData = response.data;
      } else {
        assetData = response;
      }
      
      console.log("Asset Data:", assetData);
      
      if (!assetData) {
        throw new Error("Data asset tidak ditemukan");
      }
      
      // Set current image jika ada
      if (assetData?.image) {
        let imageUrl = assetData.image;
        
        if (imageUrl.startsWith('http')) {
          setCurrentImage(imageUrl);
        } else if (imageUrl.startsWith('storage/')) {
          setCurrentImage(imageUrl);
        } else if (imageUrl.startsWith('assets/')) {
          setCurrentImage(`storage/${imageUrl}`);
        } else {
          setCurrentImage(`storage/assets/${imageUrl}`);
        }
        setHasExistingImage(true);
      } else {
        setCurrentImage("");
        setHasExistingImage(false);
      }

      // Set form data awal - PERBAIKAN: Tambahkan is_maintainable dan useful_life
      const initialFormData = {
        name: assetData?.name || "",
        category_id: assetData?.category?.id?.toString() || assetData?.category_id?.toString() || "",
        status: assetData?.status || "available",
        description: assetData?.description || "",
        image: null,
        purchase_date: assetData?.purchase_date || "",
        price: assetData?.price?.toString() || "",
        warranty_expiration: assetData?.warranty_expiration || "",
        location_level1: "",
        location_level2: "",
        location_level3: "",
        location_level4: "",
        location_id: assetData?.location?.id?.toString() || assetData?.location_id?.toString() || "",
        supplier: assetData?.supplier?.name || assetData?.supplier || "",
        supplier_id: assetData?.supplier?.id?.toString() || "",
        notes: assetData?.notes || "",
        // PERBAIKAN: Ambil nilai dari API
        is_maintainable: assetData?.is_maintainable || 0,
        useful_life: assetData?.useful_life?.toString() || "",
      };    

      console.log("Initial Form Data:", initialFormData);
      setFormData(initialFormData);

      // Bangun hierarki lokasi dari data nested
      if (assetData?.location) {
        await buildLocationHierarchyFromNested(assetData.location);
      }

    } catch (err) {
      console.error("Error fetching asset:", err);
      
      let errorMessage = "Gagal memuat data asset. ";
      
      if (err.response) {
        console.error("Response error details:", {
          status: err.response.status,
          data: err.response.data
        });
        
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
      setFetchLoading(false);
    }
  };

  // Fungsi untuk membangun hierarki lokasi dari data nested
  const buildLocationHierarchyFromNested = async (locationData) => {
    try {
      console.log("Building hierarchy from nested location:", locationData);
      
      if (!locationData || !locationData.id) {
        console.log("No location data available");
        return;
      }
      
      const levels = [];
      let current = locationData;
      
      while (current) {
        levels.unshift({
          id: current.id.toString(),
          name: current.name,
          level: levels.length + 1
        });
        current = current.parent;
      }
      
      console.log("Levels found:", levels);
      
      const updates = {};
      
      if (levels.length >= 1) {
        updates.location_level1 = levels[0].id;
      }
      
      if (levels.length >= 2) {
        updates.location_level2 = levels[1].id;
      }
      
      if (levels.length >= 3) {
        updates.location_level3 = levels[2].id;
      }
      
      if (levels.length >= 4) {
        updates.location_level4 = levels[3].id;
        updates.location_id = levels[3].id;
      } else if (levels.length === 3) {
        updates.location_id = levels[2].id;
      }
      
      console.log("Form updates:", updates);
      
      setFormData(prev => ({ ...prev, ...updates }));
      
      if (levels.length >= 1) {
        if (levels.length >= 2) {
          await fetchBuildingsForLocation(parseInt(levels[0].id));
          
          if (levels.length >= 3) {
            await fetchFloorsForBuilding(parseInt(levels[1].id));
            
            if (levels.length >= 4) {
              await fetchRoomsForFloor(parseInt(levels[2].id));
            }
          }
        }
      }
      
    } catch (err) {
      console.error("Error building location hierarchy from nested:", err);
      
      setFormData(prev => ({ 
        ...prev, 
        location_id: locationData.id.toString() 
      }));
    }
  };

  // Initial fetch data
  useEffect(() => {
    let isMounted = true;

    const initializeData = async () => {
      if (!code) {
        setError("Kode asset tidak ditemukan");
        setFetchLoading(false);
        return;
      }

      try {
        setFetchLoading(true);
        setError("");
        
        await Promise.all([
          fetchCategories(),
          fetchSuppliers(),
          fetchLocations()
        ]);
        
        await fetchAssetData();
        
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
  }, [code]);

  // PERBAIKAN: Fungsi handleChange yang mendukung checkbox
  const handleChange = (e) => {
    const { name, value, type, files, checked } = e.target;

    if (type === "file") {
      const file = files[0];

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
        if (file) {
          setCurrentImage("");
          setHasExistingImage(false);
        }
      }
    } else if (type === "checkbox") {
      // PERBAIKAN: Handle checkbox untuk is_maintainable
      setFormData(prev => ({
        ...prev,
        [name]: checked ? 1 : 0,
        // Reset useful_life jika is_maintainable false
        ...(name === "is_maintainable" && !checked ? { useful_life: "" } : {}),
      }));
    } else {
      // Untuk input biasa
      if (name === "supplier") {
        const selectedSupplier = suppliers.find(s => s.name === value);
        setFormData(prev => ({
          ...prev,
          [name]: value,
          supplier_id: selectedSupplier ? selectedSupplier.id.toString() : ""
        }));
      } else if (name === "location_level1") {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          location_level2: "",
          location_level3: "",
          location_level4: "",
          location_id: "",
        }));
        fetchBuildingsForLocation(value);
      } 
      else if (name === "location_level2") {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          location_level3: "",
          location_level4: "",
          location_id: "",
        }));
        fetchFloorsForBuilding(value);
      } 
      else if (name === "location_level3") {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          location_level4: "",
          location_id: value,
        }));
        fetchRoomsForFloor(value);
      } 
      else if (name === "location_level4") {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          location_id: value,
        }));
      }
      else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
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

    // Validasi semua required field
    const requiredFields = {
      'Nama Asset': formData.name,
      'Kategori': formData.category_id,
      'Deskripsi': formData.description,
      'Harga': formData.price,
      'Supplier': formData.supplier_id,
      'Lokasi': formData.location_id,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([field]) => field);

    if (missingFields.length > 0) {
      setError(`Harap isi semua field wajib: ${missingFields.join(', ')}`);
      setLoading(false);
      return;
    }

    // Validasi useful_life jika is_maintainable = 1
    if (formData.is_maintainable === 1 && !formData.useful_life) {
      setError("Masa pakai harus diisi untuk asset yang dapat di-maintain");
      setLoading(false);
      return;
    }

    try {
      console.log("Form data sebelum dikirim:", formData);

      const submitData = new FormData();
      
      submitData.append("_method", "PUT");
      
      // Required fields
      submitData.append("name", formData.name);
      submitData.append("category_id", parseInt(formData.category_id) || "");
      submitData.append("status", formData.status);
      submitData.append("location_id", parseInt(formData.location_id) || "");
      submitData.append("description", formData.description);
      submitData.append("price", parseFloat(formData.price) || 0);
      submitData.append("supplier_id", parseInt(formData.supplier_id) || "");
      submitData.append("is_maintainable", formData.is_maintainable);
      
      // Tambahkan useful_life jika is_maintainable = 1
      if (formData.is_maintainable === 1 && formData.useful_life) {
        submitData.append("useful_life", parseInt(formData.useful_life) || 90);
      }
      
      // Optional fields
      if (formData.purchase_date) {
        submitData.append("purchase_date", formData.purchase_date);
      }
      if (formData.warranty_expiration) {
        submitData.append("warranty_expiration", formData.warranty_expiration);
      }
      if (formData.notes) {
        submitData.append("notes", formData.notes);
      }

      // Handle image
      if (formData.image) {
        submitData.append("image", formData.image);
      }

      console.log("Data yang akan dikirim ke API:");
      for (let [key, value] of submitData.entries()) {
        console.log(key, value);
      }

      const response = await assetService.updateAssetByCode(code, submitData);
      
      console.log("✅ Update Success:", response);
      
      setSuccess(response.message || "Asset berhasil diupdate!");
      
      setTimeout(() => {
        navigate("/assets");
      }, 2000);
      
    } catch (err) {
      console.error("Update Error:", err);
      
      let errorMessage = "Gagal mengupdate asset. ";
      
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Update loading component
  if (fetchLoading) {
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
                    Edit Asset
                  </h1>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <Edit className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-2 text-sm text-slate-500">
                Kode Asset: <span className="font-mono bg-slate-100 px-2 py-1 rounded">{code}</span>
              </div>
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
                <h2 className="text-xl font-bold text-slate-900 mb-6">
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
                      placeholder="Masukkan nama asset"
                      required
                    />
                  </div>

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

                  {/* Supplier */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Supplier *
                    </label>
                    <div className="relative">
                      <select
                        name="supplier"
                        value={formData.supplier}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-300 appearance-none pr-10"
                        required
                        disabled={loadingSuppliers}
                      >
                        <option value="">Pilih Supplier</option>
                        {suppliers.length > 0 ? (
                          suppliers.map((supplier) => (
                            <option key={supplier.id} value={supplier.name}>
                              {supplier.name}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>
                            {loadingSuppliers ? "Memuat data supplier..." : "Tidak ada data supplier"}
                          </option>
                        )}
                      </select>
                      <Truck className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                      {loadingSuppliers && (
                        <Loader className="w-4 h-4 absolute right-8 top-1/2 transform -translate-y-1/2 animate-spin text-emerald-500" />
                      )}
                    </div>
                    {suppliers.length === 0 && !loadingSuppliers && (
                      <p className="text-sm text-rose-600 mt-1">
                        Data supplier tidak ditemukan. Pastikan API supplier berjalan.
                      </p>
                    )}
                  </div>

                  {/* Price - Harga */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Harga *
                    </label>
                    <div className="relative">
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
                      <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
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
                        {statusOptions.map((option) => {
                          const Icon = option.icon;
                          return (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          );
                        })}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                    </div>
                    <div className="mt-2 flex items-center">
                      {(() => {
                        const statusOption = statusOptions.find(opt => opt.value === formData.status);
                        if (statusOption) {
                          const Icon = statusOption.icon;
                          return (
                            <>
                              <Icon className={`w-4 h-4 ${statusOption.color} mr-2`} />
                              <span className="text-sm text-slate-600">{statusOption.label}</span>
                            </>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* PERBAIKAN: Maintenance & Availability - Sama seperti di Create.js */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                  
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* Is Maintainable - Sama seperti di Create.js */}
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

                  {/* Useful Life - Conditional - Sama seperti di Create.js */}
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
                </div>
              </div>

              {/* Lokasi Asset */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6">
                  Lokasi Asset
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {/* Level 1: Lokasi (Kampus Pusat) */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Lokasi *
                    </label>
                    <div className="relative">
                      <select
                        name="location_level1"
                        value={formData.location_level1}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-300 appearance-none pr-8"
                        required
                        disabled={loadingLocations}
                      >
                        <option value="">Pilih Lokasi</option>
                        {locations.map((location) => (
                          <option key={location.id} value={location.id}>
                            {location.name || `Lokasi ${location.id}`}
                          </option>
                        ))}
                      </select>
                      <Building className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                      {loadingLocations && (
                        <Loader className="w-4 h-4 absolute right-8 top-1/2 transform -translate-y-1/2 animate-spin text-emerald-500" />
                      )}
                    </div>
                  </div>

                  {/* Level 2: Gedung */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Gedung *
                    </label>
                    <div className="relative">
                      <select
                        name="location_level2"
                        value={formData.location_level2}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-300 appearance-none pr-8"
                        required
                        disabled={!formData.location_level1 || loadingBuildings}
                      >
                        <option value="">Pilih Gedung</option>
                        {buildings.map((building) => (
                          <option key={building.id} value={building.id}>
                            {building.name || `Gedung ${building.id}`}
                          </option>
                        ))}
                      </select>
                      <Building className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                      {loadingBuildings && (
                        <Loader className="w-4 h-4 absolute right-8 top-1/2 transform -translate-y-1/2 animate-spin text-emerald-500" />
                      )}
                    </div>
                  </div>

                  {/* Level 3: Lantai */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Lantai *
                    </label>
                    <div className="relative">
                      <select
                        name="location_level3"
                        value={formData.location_level3}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-300 appearance-none pr-8"
                        required
                        disabled={!formData.location_level2 || loadingFloors}
                      >
                        <option value="">Pilih Lantai</option>
                        {floors.map((floor) => (
                          <option key={floor.id} value={floor.id}>
                            {floor.name || `Lantai ${floor.id}`}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                      {loadingFloors && (
                        <Loader className="w-4 h-4 absolute right-8 top-1/2 transform -translate-y-1/2 animate-spin text-emerald-500" />
                      )}
                    </div>
                  </div>

                  {/* Level 4: Ruangan */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Ruangan *
                    </label>
                    <div className="relative">
                      <select
                        name="location_level4"
                        value={formData.location_level4}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-300 appearance-none pr-8"
                        required
                        disabled={!formData.location_level3 || loadingRooms}
                      >
                        <option value="">Pilih Ruangan</option>
                        {rooms.length > 0 ? (
                          rooms.map((room) => (
                            <option key={room.id} value={room.id}>
                              {room.name || `Ruangan ${room.id}`}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>
                            Tidak ada ruangan
                          </option>
                        )}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                      {loadingRooms && (
                        <Loader className="w-4 h-4 absolute right-8 top-1/2 transform -translate-y-1/2 animate-spin text-emerald-500" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Lokasi Terpilih */}
                {(formData.location_level1 || formData.location_level2 || formData.location_level3 || formData.location_level4) && (
                  <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-emerald-500 mr-2" />
                      <span className="text-sm font-medium text-emerald-800">
                        Lokasi terpilih:
                      </span>
                    </div>
                    <div className="text-sm text-emerald-700 mt-1">
                      {(() => {
                        const location1 = locations.find(l => l.id === parseInt(formData.location_level1));
                        const location2 = buildings.find(b => b.id === parseInt(formData.location_level2));
                        const location3 = floors.find(f => f.id === parseInt(formData.location_level3));
                        const location4 = rooms.find(r => r.id === parseInt(formData.location_level4));
                        
                        let locationPath = [];
                        if (location1) locationPath.push(location1.name || `Lokasi ${location1.id}`);
                        if (location2) locationPath.push(location2.name || `Gedung ${location2.id}`);
                        if (location3) locationPath.push(location3.name || `Lantai ${location3.id}`);
                        if (location4) locationPath.push(location4.name || `Ruangan ${location4.id}`);
                        
                        return locationPath.length > 0 ? locationPath.join(" → ") : "Belum memilih lokasi";
                      })()}
                    </div>
                  </div>
                )}

                {/* Hidden input untuk location_id */}
                <input
                  type="hidden"
                  name="location_id"
                  value={formData.location_id || ""}
                  required
                />
                
                {/* Validation message */}
                {!formData.location_id && (
                  <p className="text-sm text-rose-600 mt-2">
                    Silakan pilih lokasi, gedung, lantai, dan ruangan untuk menentukan lokasi
                  </p>
                )}
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
                      Gambar Asset
                    </label>
                    
                    {/* Current Image Preview */}
                    {hasExistingImage && currentImage && (
                      <div className="mb-4">
                        <p className="text-sm text-slate-600 mb-2">Gambar saat ini:</p>
                        <div className="flex items-center space-x-4">
                          <img 
                            src={currentImage.startsWith('http') ? 
                                  currentImage : 
                                  `http://localhost:8000/${currentImage}`} 
                            alt="Current asset" 
                            className="w-32 h-32 object-cover rounded-lg border border-slate-200"
                            onError={(e) => {
                              console.error("Error loading image:", currentImage);
                              e.target.src = "https://via.placeholder.com/128x128?text=Gambar+Tidak+Tersedia";
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="flex items-center space-x-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="text-sm font-medium">Hapus Gambar</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Image Upload Area */}
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center">
                      <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600 mb-2">
                        {hasExistingImage ? "Upload gambar baru untuk mengganti" : "Upload gambar asset"}
                      </p>
                      <p className="text-slate-500 text-sm mb-4">
                        JPG, PNG (Max. 2MB)
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
                        <div className="mt-2">
                          <p className="text-sm text-slate-600">
                            File terpilih: {formData.image.name}
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
                      Deskripsi *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-300"
                      placeholder="Deskripsi detail asset..."
                      required
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
                  disabled={loading || !formData.location_id || !formData.supplier_id}
                  className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Mengupdate...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Update Asset</span>
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

export default UpdateAsset;