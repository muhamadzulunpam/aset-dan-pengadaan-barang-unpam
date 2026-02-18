// src/pages/pengadaan/Update.js
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
} from "lucide-react";
import Sidebar from "../../layouts/Sidebar";
import Header from "../../layouts/Header";
import { procurementService } from "../../../services/procurementService";
import api2 from "../../../store/api2";

const UpdatePengadaan = () => {
  const navigate = useNavigate();
  const { id } = useParams();
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
  
  // Data lokasi hierarki
  const [locations, setLocations] = useState([]); // Level 1: Lokasi (Kampus Pusat)
  const [buildings, setBuildings] = useState([]); // Level 2: Gedung
  const [floors, setFloors] = useState([]);       // Level 3: Lantai
  const [rooms, setRooms] = useState([]);         // Level 4: Ruangan
  
  // Loading states
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingBuildings, setLoadingBuildings] = useState(false);
  const [loadingFloors, setLoadingFloors] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);

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
    // Lokasi dengan 4 level:
    location_level1: "", // Lokasi (contoh: Kampus Pusat)
    location_level2: "", // Gedung
    location_level3: "", // Lantai
    location_level4: "", // Ruangan
  });

  // Fetch all dropdown data
  const fetchDropdownData = async () => {
    try {
      // Fetch categories dari API
      await fetchCategories();
      
      // Fetch suppliers dari API
      await fetchSuppliers();

      // Fetch locations dari API
      await fetchLocations();
      
    } catch (err) {
      console.error("Error fetching dropdown data:", err);
      setError("Gagal memuat data dropdown. Silakan refresh halaman.");
    }
  };

  // Fetch categories dari API
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await api2.get("/api/categories/all");
      
      console.log("Categories response:", response);
      
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
      
      console.log("Suppliers response:", response);
      
      let suppliersData = [];
      
      // Handle response (sesuaikan dengan struktur dari backend)
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
      
      console.log("Locations response:", response);
      
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
      
      console.log("Buildings response for location", locationId, ":", response);
      
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
      
      // Clear child data
      setFloors([]);
      setRooms([]);
      
      // Execute callback jika ada
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
      
      // Clear child data
      setRooms([]);
      
      // Execute callback jika ada
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
      
      // Execute callback jika ada
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

  const fetchProcurementData = async () => {
    try {
      setFetchLoading(true);
      setError("");
      
      // Gunakan procurementService untuk konsistensi
      const response = await procurementService.getProcurementById(id);
      
      console.log("Procurement API Response:", response);
      
      // Cek struktur response berdasarkan service
      let procurementData;
      if (response.data) {
        procurementData = response.data;
      } else {
        procurementData = response;
      }
      
      console.log("Procurement Data:", procurementData);
      
      if (!procurementData) {
        throw new Error("Data pengadaan tidak ditemukan");
      }
      
      // Pastikan procurement_item ada
      const procurementItem = procurementData.procurement_item || procurementData;
      
      // Set current image jika ada
      if (procurementItem?.image) {
        let imageUrl = procurementItem.image;
        
        // Handle berbagai format image path
        if (imageUrl.startsWith('http')) {
          setCurrentImage(imageUrl);
        } else if (imageUrl.startsWith('storage/')) {
          setCurrentImage(imageUrl);
        } else if (imageUrl.startsWith('assets/')) {
          setCurrentImage(`storage/${imageUrl}`);
        } else {
          setCurrentImage(`storage/assets/procurements/${imageUrl}`);
        }
        setHasExistingImage(true);
      } else {
        setCurrentImage("");
        setHasExistingImage(false);
      }

      // Set form data awal
      const initialFormData = {
        category_id: procurementItem?.category?.id?.toString() || "",
        supplier_id: procurementItem?.supplier?.id?.toString() || "",
        location_id: procurementItem?.location?.id?.toString() || "",
        item_name: procurementItem?.item_name || "",
        image: null,
        description: procurementItem?.description || "",
        quantity: procurementItem?.quantity?.toString() || "1",
        price: procurementItem?.price?.toString() || "",
        is_maintainable: procurementItem?.is_maintainable || 0,
        useful_life: procurementItem?.useful_life?.toString() || "",
        notes: procurementItem?.notes || "",
        // Lokasi dengan 4 level:
        location_level1: "",
        location_level2: "",
        location_level3: "",
        location_level4: "",
      };

      console.log("Initial Form Data:", initialFormData);
      setFormData(initialFormData);

      // Bangun hierarki lokasi dari data nested
      if (procurementItem?.location) {
        await buildLocationHierarchyFromNested(procurementItem.location);
      }

    } catch (err) {
      console.error("Error fetching procurement:", err);
      
      let errorMessage = "Gagal memuat data pengadaan. ";
      
      if (err.response) {
        console.error("Response error details:", {
          status: err.response.status,
          data: err.response.data
        });
        
        if (err.response.status === 404) {
          errorMessage = "Data pengadaan tidak ditemukan.";
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
      
      // Navigasi kembali jika data tidak ditemukan
      if (err.response?.status === 404) {
        setTimeout(() => {
          navigate("/procurements");
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
      
      // Traverse ke atas untuk mendapatkan semua parent
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
      
      // Map levels ke formData
      const updates = {};
      
      // Level 1: Lokasi (Kampus Pusat) - index 0
      if (levels.length >= 1) {
        updates.location_level1 = levels[0].id;
      }
      
      // Level 2: Gedung (Gedung A) - index 1
      if (levels.length >= 2) {
        updates.location_level2 = levels[1].id;
      }
      
      // Level 3: Lantai (Lantai 1) - index 2
      if (levels.length >= 3) {
        updates.location_level3 = levels[2].id;
      }
      
      // Level 4: Ruangan (Ruang 101) - index 3
      if (levels.length >= 4) {
        updates.location_level4 = levels[3].id;
        updates.location_id = levels[3].id;
      } else if (levels.length === 3) {
        // Jika hanya 3 level (tidak ada ruangan), gunakan lantai sebagai location_id
        updates.location_id = levels[2].id;
      }
      
      console.log("Form updates:", updates);
      
      // Update formData
      setFormData(prev => ({ ...prev, ...updates }));
      
      // Fetch dropdown data berdasarkan levels
      if (levels.length >= 1) {
        // Level 1 sudah di-fetch oleh fetchLocations()
        // Fetch buildings untuk level 1
        if (levels.length >= 2) {
          await fetchBuildingsForLocation(parseInt(levels[0].id));
          
          // Fetch floors untuk level 2
          if (levels.length >= 3) {
            await fetchFloorsForBuilding(parseInt(levels[1].id));
            
            // Fetch rooms untuk level 3
            if (levels.length >= 4) {
              await fetchRoomsForFloor(parseInt(levels[2].id));
            }
          }
        }
      }
      
    } catch (err) {
      console.error("Error building location hierarchy from nested:", err);
      
      // Fallback: set location_id saja
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
      if (!id) {
        setError("ID pengadaan tidak ditemukan");
        setFetchLoading(false);
        return;
      }

      try {
        setFetchLoading(true);
        setError("");
        
        // Fetch dropdown data secara paralel
        await Promise.all([
          fetchDropdownData()
        ]);
        
        // Kemudian fetch procurement data
        await fetchProcurementData();
        
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

  // Debug form data changes
  useEffect(() => {
    console.log("FormData updated:", {
      location_level1: formData.location_level1,
      location_level2: formData.location_level2,
      location_level3: formData.location_level3,
      location_level4: formData.location_level4,
      location_id: formData.location_id,
      locations: locations.length,
      buildings: buildings.length,
      floors: floors.length,
      rooms: rooms.length
    });
  }, [formData, locations, buildings, floors, rooms]);

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
        // Reset existing image jika upload file baru
        if (file) {
          setCurrentImage("");
          setHasExistingImage(false);
        }
      }
    } else if (type === "checkbox") {
      const isChecked = e.target.checked;
      setFormData((prev) => ({
        ...prev,
        [name]: isChecked ? 1 : 0,
        useful_life: isChecked ? prev.useful_life : "",
      }));
    } else {
      // Untuk input biasa
      if (name === "location_level1") {
        // Reset children ketika lokasi berubah
        setFormData(prev => ({
          ...prev,
          [name]: value,
          location_level2: "",
          location_level3: "",
          location_level4: "",
          location_id: "",
        }));
        // Fetch gedung untuk lokasi ini
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
        // Fetch lantai untuk gedung ini
        fetchFloorsForBuilding(value);
      } 
      else if (name === "location_level3") {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          location_level4: "",
          location_id: value, // Set sebagai location_id sementara
        }));
        // Fetch ruangan untuk lantai ini
        fetchRoomsForFloor(value);
      } 
      else if (name === "location_level4") {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          location_id: value, // Gunakan ruangan sebagai location_id final
        }));
      }
      else {
        // Untuk field lainnya
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

    // Validasi lokasi
    if (!formData.location_id) {
      setError("Harap pilih lokasi lengkap (Lokasi, Gedung, Lantai, dan Ruangan)");
      setLoading(false);
      return;
    }

    try {
      console.log("Form data sebelum dikirim:", formData);

      const submitData = new FormData();
      submitData.append("_method", "PUT");
      
      // Append data dengan validasi
      const appendIfValid = (key, value) => {
        if (value !== null && value !== undefined && value !== "") {
          submitData.append(key, value);
        }
      };

      appendIfValid("category_id", parseInt(formData.category_id));
      appendIfValid("supplier_id", parseInt(formData.supplier_id));
      appendIfValid("location_id", parseInt(formData.location_id));
      appendIfValid("item_name", formData.item_name);
      appendIfValid("description", formData.description);
      appendIfValid("quantity", parseInt(formData.quantity));
      appendIfValid("price", parseFloat(formData.price));
      submitData.append("is_maintainable", formData.is_maintainable);
      appendIfValid("useful_life", formData.useful_life ? parseInt(formData.useful_life) : "");
      appendIfValid("notes", formData.notes);

      // Handle image
      if (formData.image) {
        submitData.append("image", formData.image);
      } else if (!hasExistingImage && currentImage) {
        // Jika ada image sebelumnya tapi ingin dihapus
        submitData.append("remove_image", "true");
      }

      console.log("Data yang akan dikirim ke API:");
      for (let [key, value] of submitData.entries()) {
        console.log(key, value);
      }

      // Gunakan procurementService.updateProcurement
      const response = await procurementService.updateProcurement(id, submitData);
      
      console.log("✅ Update Success:", response);
      
      setSuccess(response.message || "Pengadaan berhasil diupdate!");
      
      setTimeout(() => {
        navigate("/procurements");
      }, 2000);
      
    } catch (err) {
      console.error("Update Error:", err);
      
      let errorMessage = "Gagal mengupdate pengadaan. ";
      
      if (err.response) {
        console.error("Response Error:", {
          status: err.response.status,
          data: err.response.data
        });
        
        if (err.response.status === 422) {
          const errors = err.response.data?.errors;
          if (errors) {
            const errorList = Object.values(errors).flat().join(", ");
            errorMessage = `Validasi gagal: ${errorList}`;
          }
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <span className="text-lg text-slate-600">Memuat data pengadaan...</span>
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
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="mb-8 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigate("/procurements")}
                    className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Kembali</span>
                  </button>
                  <div className="w-px h-6 bg-slate-300"></div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    Edit Pengadaan
                  </h1>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Edit className="w-6 h-6 text-white" />
                </div>
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
                    <div className="relative">
                      <select
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 appearance-none pr-10"
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
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                      {loadingCategories && (
                        <Loader className="w-4 h-4 absolute right-8 top-1/2 transform -translate-y-1/2 animate-spin text-blue-500" />
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
                        name="supplier_id"
                        value={formData.supplier_id}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 appearance-none pr-10"
                        required
                        disabled={loadingSuppliers}
                      >
                        <option value="">Pilih Supplier</option>
                        {suppliers.map((supplier) => (
                          <option key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                      {loadingSuppliers && (
                        <Loader className="w-4 h-4 absolute right-8 top-1/2 transform -translate-y-1/2 animate-spin text-blue-500" />
                      )}
                    </div>
                  </div>

                  {/* Lokasi - 4 Level Dropdown */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Lokasi *
                    </label>
                    
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
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 appearance-none pr-8"
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
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                          {loadingLocations && (
                            <Loader className="w-4 h-4 absolute right-8 top-1/2 transform -translate-y-1/2 animate-spin text-blue-500" />
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
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 appearance-none pr-8"
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
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                          {loadingBuildings && (
                            <Loader className="w-4 h-4 absolute right-8 top-1/2 transform -translate-y-1/2 animate-spin text-blue-500" />
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
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 appearance-none pr-8"
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
                            <Loader className="w-4 h-4 absolute right-8 top-1/2 transform -translate-y-1/2 animate-spin text-blue-500" />
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
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 appearance-none pr-8"
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
                            <Loader className="w-4 h-4 absolute right-8 top-1/2 transform -translate-y-1/2 animate-spin text-blue-500" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Lokasi Terpilih */}
                    {(formData.location_level1 || formData.location_level2 || formData.location_level3 || formData.location_level4) && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-blue-500 mr-2" />
                          <span className="text-sm font-medium text-blue-800">
                            Lokasi terpilih:
                          </span>
                        </div>
                        <div className="text-sm text-blue-700 mt-1">
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

                  {/* Item Name */}
                  <div className="lg:col-span-2">
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
                        required={formData.is_maintainable === 1}
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
                      Gambar Item
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
                            alt="Current item" 
                            className="w-32 h-32 object-cover rounded-lg border border-slate-200"
                            onError={(e) => {
                              console.error("Error loading image:", currentImage);
                              // Fallback image
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
                        {hasExistingImage ? "Upload gambar baru untuk mengganti" : "Upload gambar item"}
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
                  onClick={() => navigate("/procurements")}
                  className="px-8 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-300"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={loading || !formData.location_id}
                  className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
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