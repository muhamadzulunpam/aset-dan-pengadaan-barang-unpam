// src/pages/Assets.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../layouts/Sidebar";
import Header from "../../layouts/Header";
import { assetService } from "../../../services/assetService";
import {
  Package,
  PackageCheck,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Building,
  MapPin,
  Tag,
  Barcode,
  Home,
  Server,
  Monitor,
  Printer,
  Smartphone,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Activity,
  Users,
  Archive,
  ShieldCheck,
  AlertTriangle,
  Truck,
  CheckSquare,
  RefreshCw,
  X,
  Wrench,
  Ban,
} from "lucide-react";
import { useAuthStore } from "../../../store/useAuthStore";
import debounce from "lodash/debounce";

// Modal Component untuk Bulk Change Status
const BulkStatusModal = ({ 
  isOpen, 
  onClose, 
  selectedAssets, 
  assets,
  bulkStatus,
  setBulkStatus,
  isUpdating,
  bulkUpdateMessage,
  onConfirm 
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !isUpdating) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, isUpdating, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Background overlay */}
      <div 
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity"
        onClick={!isUpdating ? onClose : undefined}
      />

      {/* Modal container */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          {/* Modal content */}
          <div 
            className="relative w-full max-w-md bg-white rounded-2xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg">
                  <RefreshCw className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Ubah Status Asset
                  </h3>
                  <p className="text-sm text-slate-500">
                    {selectedAssets.length} asset dipilih
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={isUpdating}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Pilih Status Baru
              </label>
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                disabled={isUpdating}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300"
              >
                <option value="">Pilih status...</option>
                <option value="available">Tersedia</option>
                <option value="in_use">Digunakan</option>
                <option value="in_transit">Dalam Perjalanan</option>
                <option value="in_repair">Dalam Perbaikan</option>
                <option value="damaged">Rusak</option>
                <option value="lost">Hilang</option>
              </select>

              {/* Daftar asset yang dipilih */}
              {selectedAssets.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-slate-600 mb-2">
                    Asset yang akan diupdate:
                  </p>
                  <div className="max-h-48 overflow-y-auto bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <ul className="space-y-2">
                      {assets
                        .filter(asset => selectedAssets.includes(asset.code))
                        .slice(0, 10)
                        .map(asset => (
                          <li key={asset.code} className="flex items-center justify-between text-sm">
                            <span className="text-slate-700 truncate">{asset.name}</span>
                            <span className="text-slate-500 font-mono text-xs">{asset.code}</span>
                          </li>
                        ))}
                      {selectedAssets.length > 10 && (
                        <li className="text-xs text-slate-500 italic">
                          + {selectedAssets.length - 10} asset lainnya...
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              )}

              {/* Pesan update */}
              {bulkUpdateMessage && (
                <div className={`mt-4 p-3 rounded-lg ${
                  bulkUpdateMessage.startsWith("success") 
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}>
                  <div className="flex items-start">
                    {bulkUpdateMessage.startsWith("success") ? (
                      <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    )}
                    <span className="text-sm">
                      {bulkUpdateMessage.split("|")[1]}
                    </span>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-6 flex items-center justify-end space-x-3">
                <button
                  onClick={onClose}
                  disabled={isUpdating}
                  className="px-4 py-2.5 text-slate-700 hover:bg-slate-100 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isUpdating || !bulkStatus}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Memproses...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Ubah Status
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
// Modal Filter Component dengan 6 filter
const FilterModal = ({ 
  isOpen, 
  onClose, 
  filters,
  setFilters,
  categories,
  onApplyFilters 
}) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [loadingBuildings, setLoadingBuildings] = useState(false);
  const [loadingFloors, setLoadingFloors] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingSubLocations, setLoadingSubLocations] = useState(false);
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [subLocations, setSubLocations] = useState([]);

  // Helper untuk menghitung filter aktif
  const activeFilterCount = Object.values(localFilters).filter(value => 
    value !== "" && value !== null && value !== undefined
  ).length;

  // Format status untuk tampilan
  const formatStatus = (status) => {
    const statusMap = {
      available: "Tersedia",
      in_use: "Digunakan",
      in_transit: "Dalam Perjalanan",
      in_repair: "Dalam Perbaikan",
      damaged: "Rusak",
      lost: "Hilang",
    };
    return statusMap[status] || status;
  };

  // Fetch buildings dari API /api/locations/building
  const fetchBuildings = useCallback(async () => {
    try {
      setLoadingBuildings(true);
      const response = await assetService.getBuildings();
      console.log('Raw buildings response:', response);
      
      let buildingsData = [];
      
      // Handle response structure
      if (response && response.data && Array.isArray(response.data)) {
        buildingsData = response.data;
      } else if (Array.isArray(response)) {
        buildingsData = response;
      } else if (response && response.meta && response.data) {
        buildingsData = response.data;
      } else {
        buildingsData = [];
      }
      
      console.log('Processed buildings data:', buildingsData);
      setBuildings(buildingsData);
      
      // Jika ada filter building yang aktif, load floors-nya
      if (filters.building_id && buildingsData.length > 0) {
        const selectedBuilding = buildingsData.find(b => b.id === parseInt(filters.building_id));
        if (selectedBuilding && selectedBuilding.children) {
          const floorsData = selectedBuilding.children;
          setFloors(floorsData);
          
          // Jika ada filter floor yang aktif, load rooms-nya
          if (filters.floor_id && floorsData.length > 0) {
            const selectedFloor = floorsData.find(f => f.id === parseInt(filters.floor_id));
            if (selectedFloor && selectedFloor.children) {
              const roomsData = selectedFloor.children;
              setRooms(roomsData);
              
              // Jika ada filter room yang aktif, load sub-locations-nya
              if (filters.room_id && roomsData.length > 0) {
                const selectedRoom = roomsData.find(r => r.id === parseInt(filters.room_id));
                if (selectedRoom && selectedRoom.children) {
                  const subLocationsData = selectedRoom.children;
                  setSubLocations(subLocationsData);
                }
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Error fetching buildings:", err);
      setBuildings([]);
    } finally {
      setLoadingBuildings(false);
    }
  }, [filters.building_id, filters.floor_id, filters.room_id]);

  // Handle building change
  const handleBuildingChange = (buildingId) => {
    const selectedBuilding = buildings.find(b => b.id === parseInt(buildingId));
    const newFilters = {
      ...localFilters,
      building_id: buildingId,
      building_name: selectedBuilding ? selectedBuilding.name : "",
      floor_id: "",
      floor_name: "",
      floor_data: null,
      room_id: "",
      room_name: "",
      room_data: null,
      sub_location_id: "",
      sub_location_name: "",
      sub_location_data: null
    };
    setLocalFilters(newFilters);
    
    // Reset dependent dropdowns
    setFloors([]);
    setRooms([]);
    setSubLocations([]);
    
    // Load floors for selected building
    if (selectedBuilding && selectedBuilding.children) {
      const floorsData = selectedBuilding.children;
      setFloors(floorsData);
      setLoadingFloors(false);
    } else {
      setLoadingFloors(false);
    }
  };

  // Handle floor change
  const handleFloorChange = (floorId) => {
    const selectedFloor = floors.find(f => f.id === parseInt(floorId));
    const newFilters = {
      ...localFilters,
      floor_id: floorId,
      floor_name: selectedFloor ? selectedFloor.name : "",
      floor_data: selectedFloor,
      room_id: "",
      room_name: "",
      room_data: null,
      sub_location_id: "",
      sub_location_name: "",
      sub_location_data: null
    };
    setLocalFilters(newFilters);
    
    // Reset dependent dropdowns
    setRooms([]);
    setSubLocations([]);
    
    // Load rooms for selected floor
    if (selectedFloor && selectedFloor.children) {
      const roomsData = selectedFloor.children;
      setRooms(roomsData);
      setLoadingRooms(false);
    } else {
      setLoadingRooms(false);
    }
  };

  // Handle room change
  const handleRoomChange = (roomId) => {
    const selectedRoom = rooms.find(r => r.id === parseInt(roomId));
    const newFilters = {
      ...localFilters,
      room_id: roomId,
      room_name: selectedRoom ? selectedRoom.name : "",
      room_data: selectedRoom,
      sub_location_id: "",
      sub_location_name: "",
      sub_location_data: null
    };
    setLocalFilters(newFilters);
    
    // Reset dependent dropdowns
    setSubLocations([]);
    
    // Load sub-locations for selected room
    if (selectedRoom && selectedRoom.children) {
      const subLocationsData = selectedRoom.children;
      setSubLocations(subLocationsData);
      setLoadingSubLocations(false);
    } else {
      setLoadingSubLocations(false);
    }
  };

  // Handle sub-location change
  const handleSubLocationChange = (subLocationId) => {
    const selectedSubLocation = subLocations.find(s => s.id === parseInt(subLocationId));
    const newFilters = {
      ...localFilters,
      sub_location_id: subLocationId,
      sub_location_name: selectedSubLocation ? selectedSubLocation.name : "",
      sub_location_data: selectedSubLocation
    };
    setLocalFilters(newFilters);
  };

  // Initialize modal
  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters);
      fetchBuildings();
    }
  }, [isOpen, filters, fetchBuildings]);

  // Handle apply filters
  const handleApply = () => {
    // Ambil data lengkap untuk setiap filter
    const selectedCategory = categories.find(c => c.id === parseInt(localFilters.category_id));
    const selectedBuilding = buildings.find(b => b.id === parseInt(localFilters.building_id));
    const selectedFloor = floors.find(f => f.id === parseInt(localFilters.floor_id));
    const selectedRoom = rooms.find(r => r.id === parseInt(localFilters.room_id));
    const selectedSubLocation = subLocations.find(s => s.id === parseInt(localFilters.sub_location_id));
    
    // Kirim filters dengan NAMA sudah termasuk
    const filterData = {
      status: localFilters.status || "",
      
      // Category
      category_id: localFilters.category_id || "",
      category_name: selectedCategory ? selectedCategory.name : "",
      category_data: selectedCategory,
      
      // Building
      building_id: localFilters.building_id || "",
      building_name: selectedBuilding ? selectedBuilding.name : "",
      building_data: selectedBuilding,
      
      // Floor
      floor_id: localFilters.floor_id || "",
      floor_name: selectedFloor ? selectedFloor.name : "",
      floor_data: selectedFloor,
      
      // Room
      room_id: localFilters.room_id || "",
      room_name: selectedRoom ? selectedRoom.name : "",
      room_data: selectedRoom,
      
      // Sub-location
      sub_location_id: localFilters.sub_location_id || "",
      sub_location_name: selectedSubLocation ? selectedSubLocation.name : "",
      sub_location_data: selectedSubLocation
    };
    
    console.log('Applying filters with names:', filterData);
    onApplyFilters(filterData);
  };

  // Handle reset filters
  const handleReset = () => {
    const resetFilters = {
      status: "",
      category_id: "",
      category_name: "",
      building_id: "",
      building_name: "",
      floor_id: "",
      floor_name: "",
      room_id: "",
      room_name: "",
      sub_location_id: "",
      sub_location_name: ""
    };
    setLocalFilters(resetFilters);
    setFloors([]);
    setRooms([]);
    setSubLocations([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Background overlay */}
      <div 
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal container */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          {/* Modal content */}
          <div 
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg">
                  <Filter className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Filter Assets
                  </h3>
                  <p className="text-sm text-slate-500">
                    Filter data assets berdasarkan kriteria
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {activeFilterCount > 0 && (
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                    {activeFilterCount} aktif
                  </span>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Status
                  </label>
                  <select
                    value={localFilters.status}
                    onChange={(e) => setLocalFilters({...localFilters, status: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-300"
                  >
                    <option value="">Semua Status</option>
                    <option value="available">Tersedia</option>
                    <option value="in_use">Digunakan</option>
                    <option value="in_transit">Dalam Perjalanan</option>
                    <option value="in_repair">Dalam Perbaikan</option>
                    <option value="damaged">Rusak</option>
                    <option value="lost">Hilang</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Kategori
                  </label>
                  <select
                    value={localFilters.category_id}
                    onChange={(e) => {
                      const categoryId = e.target.value;
                      const selectedCategory = categories.find(c => c.id === parseInt(categoryId));
                      setLocalFilters({
                        ...localFilters,
                        category_id: categoryId,
                        category_name: selectedCategory ? selectedCategory.name : ""
                      });
                    }}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-300"
                  >
                    <option value="">Semua Kategori</option>
                    {categories && categories.length > 0 ? (
                      categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>Loading kategori...</option>
                    )}
                  </select>
                  {categories.length === 0 && (
                    <p className="text-xs text-slate-500 mt-1">
                      Tidak ada kategori tersedia
                    </p>
                  )}
                </div>

                {/* Building Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Gedung
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <select
                      value={localFilters.building_id}
                      onChange={(e) => handleBuildingChange(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-300"
                      disabled={loadingBuildings}
                    >
                      <option value="">Semua Gedung</option>
                      {buildings.map((building) => (
                        <option key={building.id} value={building.id}>
                          {building.name}
                        </option>
                      ))}
                    </select>
                    {loadingBuildings && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Floor Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Lantai
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <select
                      value={localFilters.floor_id}
                      onChange={(e) => handleFloorChange(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-300"
                      disabled={!localFilters.building_id || floors.length === 0}
                    >
                      <option value="">Semua Lantai</option>
                      {floors.map((floor) => (
                        <option key={floor.id} value={floor.id}>
                          {floor.name}
                        </option>
                      ))}
                    </select>
                    {loadingFloors && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Room Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Ruangan
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <select
                      value={localFilters.room_id}
                      onChange={(e) => handleRoomChange(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-300"
                      disabled={!localFilters.floor_id || rooms.length === 0}
                    >
                      <option value="">Semua Ruangan</option>
                      {rooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.name}
                        </option>
                      ))}
                    </select>
                    {loadingRooms && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sub-Location Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Sub-Lokasi
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <select
                      value={localFilters.sub_location_id}
                      onChange={(e) => handleSubLocationChange(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all duration-300"
                      disabled={!localFilters.room_id || subLocations.length === 0}
                    >
                      <option value="">Semua Sub-Lokasi</option>
                      {subLocations.map((subLocation) => (
                        <option key={subLocation.id} value={subLocation.id}>
                          {subLocation.name}
                        </option>
                      ))}
                    </select>
                    {loadingSubLocations && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Reset location button */}
              {(localFilters.building_id || localFilters.floor_id || localFilters.room_id || localFilters.sub_location_id) && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setLocalFilters(prev => ({
                        ...prev,
                        building_id: "",
                        building_name: "",
                        floor_id: "",
                        floor_name: "",
                        room_id: "",
                        room_name: "",
                        sub_location_id: "",
                        sub_location_name: ""
                      }));
                      setFloors([]);
                      setRooms([]);
                      setSubLocations([]);
                    }}
                    className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Reset Lokasi
                  </button>
                </div>
              )}

              {/* Active filters info */}
              {activeFilterCount > 0 && (
                <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    Filter Aktif:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {localFilters.status && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700">
                        Status: {formatStatus(localFilters.status)}
                      </span>
                    )}
                    {localFilters.category_id && localFilters.category_name && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                        Kategori: {localFilters.category_name}
                      </span>
                    )}
                    {localFilters.building_id && localFilters.building_name && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                        Gedung: {localFilters.building_name}
                      </span>
                    )}
                    {localFilters.floor_id && localFilters.floor_name && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-amber-100 text-amber-700">
                        Lantai: {localFilters.floor_name}
                      </span>
                    )}
                    {localFilters.room_id && localFilters.room_name && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-cyan-100 text-cyan-700">
                        Ruangan: {localFilters.room_name}
                      </span>
                    )}
                    {localFilters.sub_location_id && localFilters.sub_location_name && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-indigo-100 text-indigo-700">
                        Sub-Lokasi: {localFilters.sub_location_name}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 rounded-b-2xl">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl font-medium transition-colors flex items-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset Semua
                </button>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2.5 text-slate-700 hover:bg-slate-100 rounded-xl font-medium transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleApply}
                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500
                              text-white rounded-xl font-semibold
                              hover:shadow-lg hover:shadow-emerald-500/25
                              transition-all duration-300"
                  >
                    Terapkan Filter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Assets = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: null,
    to: null,
  });
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // Filter states - MENYIMPAN BOTH ID DAN NAMA
  const [filters, setFilters] = useState({
    status: "",
    category_id: "",
    category_name: "",
    building_id: "",
    building_name: "",
    floor_id: "",
    floor_name: "",
    room_id: "",
    room_name: "",
    sub_location_id: "",
    sub_location_name: ""
  });
  
  const [categories, setCategories] = useState([]);
  const [buildings, setBuildings] = useState([]);
  
  // State untuk modal filter
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // State untuk menyimpan count dari API
  const [assetCounts, setAssetCounts] = useState({
    available_assets_count: 0,
    in_transit_assets_count: 0,
    in_use_assets_count: 0,
    in_repair_assets_count: 0
  });

  // State untuk bulk operations
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [bulkStatus, setBulkStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [bulkUpdateMessage, setBulkUpdateMessage] = useState("");

  // Refs untuk mencegah infinite loops
  const isInitialMount = useRef(true);
  const fetchCount = useRef(0);

  // Helper untuk menghitung filter aktif
  const activeFilterCount = Object.values(filters).filter(value => 
    value !== "" && value !== null && value !== undefined
  ).length;

  // Fetch data assets dari API dengan semua filter
  const fetchAssets = useCallback(async (page = 1, appliedFilters = {}, search = "") => {
    try {
      setLoading(true);
      setError(null);
      
      fetchCount.current += 1;
      console.log(`fetchAssets called #${fetchCount.current}`);
      console.log('Applied filters:', appliedFilters);
      console.log('Search term:', search);
      
      // PARAMETER YANG SESUAI DENGAN BACKEND LARAVEL
      // Backend menggunakan LIKE '%nama%' pada kolom name
      const params = {
        page: page,
        limit: 10,
        ...(search && { search: search }),
        ...(appliedFilters.status && { status: appliedFilters.status }),
        ...(appliedFilters.category_name && { category: appliedFilters.category_name }),
        ...(appliedFilters.building_name && { building: appliedFilters.building_name }),
        ...(appliedFilters.floor_name && { floor: appliedFilters.floor_name }),
        ...(appliedFilters.room_name && { 'room-name': appliedFilters.room_name }),
        // Parameter 'location' untuk root/region (opsional)
        // ...(appliedFilters.location_name && { location: appliedFilters.location_name }),
      };
      
      console.log('API params untuk backend (NAMA-based):', params);
      
      const response = await assetService.getAllAssets(params);
      
      console.log('API Response:', response);
      
      // Handle response structure
      let dataToSet = [];
      let metaToSet = {};
      let countsToSet = {};

      if (response && response.meta && response.data) {
        dataToSet = response.data;
        metaToSet = response.meta || {};
        
        if (response.available_assets_count !== undefined) {
          countsToSet = {
            available_assets_count: response.available_assets_count || 0,
            in_transit_assets_count: response.in_transit_assets_count || 0,
            in_use_assets_count: response.in_use_assets_count || 0,
            in_repair_assets_count: response.in_repair_assets_count || 0
          };
        }
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        dataToSet = response.data.data;
        metaToSet = response.data.meta || response.data || {};
        
        if (response.data.available_assets_count !== undefined) {
          countsToSet = {
            available_assets_count: response.data.available_assets_count || 0,
            in_transit_assets_count: response.data.in_transit_assets_count || 0,
            in_use_assets_count: response.data.in_use_assets_count || 0,
            in_repair_assets_count: response.data.in_repair_assets_count || 0
          };
        }
      } else if (Array.isArray(response)) {
        dataToSet = response;
        metaToSet = {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: response.length,
          from: 1,
          to: response.length,
        };
      }

      console.log('Processed data count:', dataToSet.length);
      
      setAssets(dataToSet);
      
      setPagination({
        current_page: metaToSet.current_page || 1,
        last_page: metaToSet.last_page || 1,
        per_page: metaToSet.per_page || 10,
        total: metaToSet.total || dataToSet.length,
        from: metaToSet.from || null,
        to: metaToSet.to || null,
      });

      // Set asset counts
      if (Object.keys(countsToSet).length > 0) {
        setAssetCounts(countsToSet);
      } else {
        const manualCounts = {
          available_assets_count: dataToSet.filter(item => item.status === "available").length,
          in_transit_assets_count: dataToSet.filter(item => item.status === "in_transit").length,
          in_use_assets_count: dataToSet.filter(item => item.status === "in_use").length,
          in_repair_assets_count: dataToSet.filter(item => item.status === "in_repair").length
        };
        setAssetCounts(manualCounts);
      }

      // Reset selected assets
      setSelectedAssets([]);
      setSelectAll(false);

    } catch (err) {
      console.error("Error fetching assets:", err);
      
      setError(err.response?.data?.message || "Gagal memuat data assets. Silakan coba lagi.");
      setAssets([]);
      setPagination({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
        from: null,
        to: null,
      });
      setAssetCounts({
        available_assets_count: 0,
        in_transit_assets_count: 0,
        in_use_assets_count: 0,
        in_repair_assets_count: 0
      });
    } finally {
      setLoading(false);
    }
  }, []); // ← Empty dependencies

  const fetchCategories = useCallback(async () => {
    try {
      console.log('Fetching categories...');
      const categoriesResponse = await assetService.getAssetCategories();
      
      let categoriesData = [];
      
      if (categoriesResponse && categoriesResponse.data && Array.isArray(categoriesResponse.data)) {
        categoriesData = categoriesResponse.data;
      } else if (Array.isArray(categoriesResponse)) {
        categoriesData = categoriesResponse;
      } else if (categoriesResponse && categoriesResponse.meta && categoriesResponse.data) {
        categoriesData = categoriesResponse.data;
      }
      
      setCategories(categoriesData);
      
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories([]);
    }
  }, []);

  // Fetch buildings data
  const fetchBuildings = useCallback(async () => {
    try {
      const buildingsResponse = await assetService.getBuildings();
      
      let buildingsData = [];
      
      if (buildingsResponse && buildingsResponse.data && Array.isArray(buildingsResponse.data)) {
        buildingsData = buildingsResponse.data;
      } else if (Array.isArray(buildingsResponse)) {
        buildingsData = buildingsResponse;
      } else if (buildingsResponse && buildingsResponse.meta && buildingsResponse.data) {
        buildingsData = buildingsResponse.data;
      }
      
      setBuildings(buildingsData);
    } catch (err) {
      console.error("Error fetching buildings:", err);
      setBuildings([]);
    }
  }, []);

  // Initial load effect - HANYA SATU KALI
  useEffect(() => {
    console.log('Initial mount - loading data');
    
    const loadInitialData = async () => {
      try {
        // Load categories and buildings once
        await Promise.all([
          fetchCategories(),
          fetchBuildings()
        ]);
        
        // Then load assets
        await fetchAssets(1, filters, "");
      } catch (err) {
        console.error('Error loading initial data:', err);
      }
    };
    
    loadInitialData();
    
    return () => {
      console.log('Assets component unmounting');
    };
  }, []);

  // Effect untuk handle filters atau search changes - DEBOUNCED
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    console.log('Filters or search changed, debouncing...');
    
    const timer = setTimeout(() => {
      console.log('Debounced fetch triggered');
      fetchAssets(1, filters, searchTerm);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [filters, searchTerm, fetchAssets]);

  // Custom debounced search
  const debouncedSearch = useRef(
    debounce((searchValue) => {
      console.log('Performing debounced search for:', searchValue);
      fetchAssets(1, filters, searchValue);
    }, 500)
  ).current;

  // Handle search input change
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // Handle apply filters dari modal
  const handleApplyFilters = (newFilters) => {
    console.log('Applying new filters with names:', newFilters);
    
    // Simpan data building untuk dropdown
    if (newFilters.building_data) {
      setBuildings(prev => {
        const exists = prev.find(b => b.id === newFilters.building_data.id);
        return exists ? prev : [...prev, newFilters.building_data];
      });
    }
    
    if (newFilters.category_data) {
      setCategories(prev => {
        const exists = prev.find(c => c.id === newFilters.category_data.id);
        return exists ? prev : [...prev, newFilters.category_data];
      });
    }
    
    // Update filters state dengan nama sudah termasuk
    const updatedFilters = {
      status: newFilters.status || "",
      category_id: newFilters.category_id || "",
      category_name: newFilters.category_name || "",
      building_id: newFilters.building_id || "",
      building_name: newFilters.building_name || "",
      floor_id: newFilters.floor_id || "",
      floor_name: newFilters.floor_name || "",
      room_id: newFilters.room_id || "",
      room_name: newFilters.room_name || "",
      sub_location_id: newFilters.sub_location_id || "",
      sub_location_name: newFilters.sub_location_name || ""
    };
    
    console.log('Updated filters state:', updatedFilters);
    setFilters(updatedFilters);
    
    // Fetch akan dipanggil oleh useEffect karena filters berubah
    setShowFilterModal(false);
  };

  // Handle open filter modal
  const handleOpenFilterModal = () => {
    setShowFilterModal(true);
  };

  const truncateString = (str, maxLength) => {
    if (!str) return "N/A";
    return str.length > maxLength ? str.slice(0, maxLength) + "..." : str;
  };

  // Format status untuk tampilan
  const formatStatus = (status) => {
    const statusMap = {
      available: "Tersedia",
      in_use: "Digunakan",
      in_transit: "Dalam Perjalanan",
      in_repair: "Dalam Perbaikan",
      damaged: "Rusak",
      lost: "Hilang",
    };
    return statusMap[status] || status;
  };

  // Warna status
  const getStatusColor = (status) => {
    const colors = {
      available: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      in_use: "bg-blue-50 text-blue-700 border border-blue-200",
      in_transit: "bg-yellow-50 text-yellow-700 border border-yellow-200",
      in_repair: "bg-orange-50 text-orange-700 border border-orange-200",
      damaged: "bg-rose-50 text-rose-700 border border-rose-200",
      lost: "bg-slate-50 text-slate-700 border border-slate-200",
    };
    return colors[status] || "bg-slate-50 text-slate-700";
  };

  // Icon untuk status
  const getStatusIcon = (status) => {
    const icons = {
      available: <CheckCircle className="w-4 h-4 text-emerald-500" />,
      in_use: <Users className="w-4 h-4 text-blue-500" />,
      in_transit: <Truck className="w-4 h-4 text-yellow-500" />,
      in_repair: <Wrench className="w-4 h-4 text-orange-500" />,
      damaged: <XCircle className="w-4 h-4 text-rose-500" />,
      lost: <Archive className="w-4 h-4 text-slate-500" />,
    };
    return icons[status] || <Package className="w-4 h-4 text-slate-500" />;
  };

  // Icon untuk kategori
  const getCategoryIcon = (categoryName) => {
    const icons = {
      "Teknologi": <Server className="w-4 h-4 text-blue-500" />,
      "Alat Tulis Kantor": <Package className="w-4 h-4 text-emerald-500" />,
      "Elektronik": <Monitor className="w-4 h-4 text-purple-500" />,
      "Furniture": <Home className="w-4 h-4 text-amber-500" />,
      "Kendaraan": <Activity className="w-4 h-4 text-red-500" />,
      "Perlengkapan": <PackageCheck className="w-4 h-4 text-cyan-500" />,
    };
    return icons[categoryName] || <Package className="w-4 h-4 text-slate-500" />;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Format lokasi lengkap
  const formatLocation = (location) => {
    if (!location) return "N/A";
    
    let fullLocation = "";
    
    const addParent = (loc) => {
      if (loc) {
        if (loc.parent) {
          addParent(loc.parent);
        }
        if (loc.name) {
          fullLocation += fullLocation ? " > " + loc.name : loc.name;
        }
      }
    };
    
    addParent(location);
    
    return fullLocation || location.name || "N/A";
  };

  // Handle pagination
  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.last_page) {
      fetchAssets(page, filters, searchTerm);
    }
  };

  // Handle view detail
  const handleViewDetail = (code) => {
    navigate(`/assets/view/${code}`);
  };

  const handleEdit = (code) => {
    navigate(`/assets/update/${code}`);
  };

  // Handle delete
  const handleDelete = async (code) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus asset ini?")) {
      try {
        await assetService.deleteAsset(code);
        alert("Asset berhasil dihapus");
        fetchAssets(pagination.current_page, filters, searchTerm);
      } catch (err) {
        console.error("Error deleting asset:", err);
        alert(err.response?.data?.message || "Gagal menghapus asset. Silakan coba lagi.");
      }
    }
  };

  // === FUNGSI UNTUK BULK OPERATIONS ===

  // Handle individual asset selection
  const handleAssetSelect = (assetCode) => {
    if (selectedAssets.includes(assetCode)) {
      setSelectedAssets(selectedAssets.filter(code => code !== assetCode));
    } else {
      setSelectedAssets([...selectedAssets, assetCode]);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedAssets([]);
      setSelectAll(false);
    } else {
      const allCodes = assets.map(asset => asset.code);
      setSelectedAssets(allCodes);
      setSelectAll(true);
    }
  };

  // Effect untuk menampilkan/menyembunyikan bulk actions
  useEffect(() => {
    if (selectedAssets.length > 0) {
      setShowBulkActions(true);
    } else {
      setShowBulkActions(false);
    }
  }, [selectedAssets]);

  // Fungsi untuk membuka modal status
  const handleOpenStatusModal = () => {
    setShowStatusModal(true);
    setBulkStatus("");
    setBulkUpdateMessage("");
  };

  // Fungsi untuk menutup modal
  const handleCloseStatusModal = () => {
    if (!isUpdating) {
      setShowStatusModal(false);
      setBulkStatus("");
      setBulkUpdateMessage("");
    }
  };

  // Fungsi untuk bulk change status
  const handleBulkChangeStatus = async () => {
    if (!bulkStatus) {
      setBulkUpdateMessage("error|Silakan pilih status terlebih dahulu");
      return;
    }

    if (selectedAssets.length === 0) {
      setBulkUpdateMessage("error|Tidak ada asset yang dipilih");
      return;
    }

    setIsUpdating(true);
    setBulkUpdateMessage("");

    try {
      const payload = {
        asset_codes: selectedAssets,
        status: bulkStatus
      };

      console.log('Sending bulk status update:', payload);
      
      const response = await assetService.bulkChangeStatus(payload);
      
      console.log('Bulk status response:', response);
      
      if (response && response.meta && response.meta.code === 200) {
        setBulkUpdateMessage("success|" + (response.meta.message || "Status asset berhasil diperbarui"));
        
        setTimeout(() => {
          setShowStatusModal(false);
          fetchAssets(pagination.current_page, filters, searchTerm);
          setSelectedAssets([]);
          setSelectAll(false);
          setIsUpdating(false);
          setBulkStatus("");
          setBulkUpdateMessage("");
        }, 2000);
      } else {
        setBulkUpdateMessage("error|" + (response?.meta?.message || "Gagal memperbarui status asset"));
        setIsUpdating(false);
      }
    } catch (err) {
      console.error("Error bulk updating status:", err);
      
      let errorMessage = "Terjadi kesalahan saat memperbarui status";
      
      if (err.response?.status === 403) {
        errorMessage = err.response?.data?.message || "Akses ditolak. Anda tidak memiliki izin untuk melakukan aksi ini.";
      } else if (err.response?.status === 422) {
        errorMessage = err.response?.data?.message || "Data tidak valid. Periksa kembali pilihan status.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setBulkUpdateMessage("error|" + errorMessage);
      setIsUpdating(false);
    }
  };

  // Fungsi untuk generate array halaman dengan maksimal 5
  const generatePageNumbers = () => {
    const current = pagination.current_page;
    const last = pagination.last_page;
    const maxPages = 5;
    
    if (last <= maxPages) {
      return Array.from({ length: last }, (_, i) => i + 1);
    }
    
    let start = Math.max(1, current - Math.floor(maxPages / 2));
    let end = Math.min(last, start + maxPages - 1);
    
    if (end - start + 1 < maxPages) {
      start = Math.max(1, end - maxPages + 1);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  // Render pagination info
  const renderPaginationInfo = () => {
    const { current_page, last_page, per_page, total, from, to } = pagination;
    
    if (total === 0) {
      return "Tidak ada data assets";
    }
    
    const start = from || ((current_page - 1) * per_page + 1);
    const end = to || Math.min(current_page * per_page, total);
    
    return (
      <>
        Menampilkan{" "}
        <span className="font-semibold">
          {start} - {end}
        </span>{" "}
        dari{" "}
        <span className="font-semibold">
          {total}
        </span>{" "}
        assets
        <span className="text-slate-500 ml-2">
          (Halaman {current_page} dari {last_page})
        </span>
        {(activeFilterCount > 0 || searchTerm) && (
          <span className="text-blue-600 text-xs ml-2 bg-blue-50 px-2 py-1 rounded">
            difilter
          </span>
        )}
      </>
    );
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel && debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

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
          <div className="max-w-7xl mx-auto">
            {/* Page Title */}
            <div className="mb-8 animate-fade-in">
              <div className="flex items-center mb-3">
                <Package className="w-8 h-8 text-emerald-600 mr-3" />
                <h1 className="text-3xl font-bold text-slate-900">
                  Assets
                </h1>
              </div>
              <p className="text-slate-600 text-lg">
                Kelola inventory dan tracking aset perusahaan
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Tersedia */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Tersedia</p>
                    <p className="text-2xl font-bold text-emerald-700">{assetCounts.available_assets_count}</p>
                    <p className="text-xs text-slate-500 mt-1">Status: Available</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </div>

              {/* Sedang Dipindahkan */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Sedang Dipindahkan</p>
                    <p className="text-2xl font-bold text-yellow-700">{assetCounts.in_transit_assets_count}</p>
                    <p className="text-xs text-slate-500 mt-1">Status: In Transit</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl">
                    <Truck className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              {/* Sedang Digunakan */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Sedang Digunakan</p>
                    <p className="text-2xl font-bold text-blue-700">{assetCounts.in_use_assets_count}</p>
                    <p className="text-xs text-slate-500 mt-1">Status: In Use</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Dalam Perbaikan */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Dalam Perbaikan</p>
                    <p className="text-2xl font-bold text-orange-700">{assetCounts.in_repair_assets_count}</p>
                    <p className="text-xs text-slate-500 mt-1">Status: In Repair</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                    <Wrench className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bulk Actions Bar */}
            {showBulkActions && (
              <div className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 text-blue-700 p-2 rounded-lg">
                      <CheckSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-blue-900">
                        {selectedAssets.length} asset dipilih
                      </p>
                      <p className="text-sm text-blue-600">
                        Pilih aksi yang ingin dilakukan
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => {
                        setSelectedAssets([]);
                        setSelectAll(false);
                      }}
                      className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 mr-1 inline" />
                      Batal
                    </button>
                    <button
                      onClick={handleOpenStatusModal}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Ubah Status
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Assets Table */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              {/* Table Header */}
              <div className="px-6 py-4 border-b border-slate-200/60 bg-white/50">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="mb-4 lg:mb-0">
                    <h2 className="text-xl font-bold text-slate-900">
                      Daftar Assets
                    </h2>
                    <p className="text-slate-600 text-sm">
                      Total: {pagination.total} assets
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                    {/* Search */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Cari asset..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all duration-300 w-full lg:w-64"
                      />
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-2">
                      {/* Filter Button */}
                      <div className="relative">
                        <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <button
                          onClick={handleOpenFilterModal}
                          className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl
                                    focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
                                    outline-none transition-all duration-300 w-full lg:w-48
                                    flex items-center justify-between text-slate-600 hover:bg-slate-100"
                        >
                          <span>Filter</span>

                          {activeFilterCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                              {activeFilterCount}
                            </span>
                          )}
                        </button>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate("/assets/create")}
                          className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 flex items-center"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Tambah Asset
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                  <span className="ml-3 text-slate-600">Memuat data assets...</span>
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <div className="flex flex-col items-center justify-center py-12 px-6">
                  <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
                  <p className="text-lg font-medium text-slate-700 mb-2">Terjadi Kesalahan</p>
                  <p className="text-slate-500 mb-4 text-center">{error}</p>
                  <button
                    onClick={() => fetchAssets(1, filters, searchTerm)}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    Coba Lagi
                  </button>
                </div>
              )}

              {/* Table Content */}
              {!loading && !error && (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-100/70 backdrop-blur-sm">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider w-12">
                            <input
                              type="checkbox"
                              checked={selectAll}
                              onChange={handleSelectAll}
                              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
                            />
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Nama Asset
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Kode Asset
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Kategori
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider min-w-[250px]">
                            Lokasi
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Tanggal Dibuat
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Aksi
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-200/60">
                        {assets.length > 0 ? (
                          assets.map((asset) => (
                            <tr
                              key={asset.id}
                              className={`hover:bg-slate-50/50 transition-colors duration-300 ${
                                selectedAssets.includes(asset.code) ? 'bg-blue-50' : ''
                              }`}
                            >
                              {/* Checkbox */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={selectedAssets.includes(asset.code)}
                                  onChange={() => handleAssetSelect(asset.code)}
                                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
                                />
                              </td>

                              {/* Nama Asset */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-3">
                                  <div className="flex-shrink-0">
                                    {getCategoryIcon(asset.category?.name)}
                                  </div>
                                  <div>
                                    <div className="text-sm font-semibold text-slate-900">
                                      {truncateString(asset.name || "No Name", 20)}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      ID: {asset.id}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Kode Asset */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <Barcode className="w-4 h-4 text-slate-400 mr-2" />
                                  <code className="text-sm font-mono text-slate-700 bg-slate-50 px-2 py-1 rounded">
                                    {asset.code || "N/A"}
                                  </code>
                                </div>
                              </td>

                              {/* Kategori */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 mr-2">
                                    {getCategoryIcon(asset.category?.name)}
                                  </div>
                                  <span className="text-sm text-slate-700">
                                    {asset.category?.name || "N/A"}
                                  </span>
                                </div>
                              </td>

                              {/* Lokasi */}
                              <td className="px-6 py-4">
                                <div className="flex items-start">
                                  <MapPin className="w-5 h-5 text-slate-400 mr-2 flex-shrink-0 mt-0.5" />
                                  <div className="text-sm text-slate-700 min-w-[250px] max-w-[350px] break-words">
                                    {formatLocation(asset.location)}
                                  </div>
                                </div>
                              </td>

                              {/* Status */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 mr-2">
                                    {getStatusIcon(asset.status)}
                                  </div>
                                  <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                      asset.status
                                    )}`}
                                  >
                                    {formatStatus(asset.status)}
                                  </span>
                                </div>
                              </td>

                              {/* Tanggal Dibuat */}
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 text-slate-400 mr-2" />
                                  {formatDate(asset.created_at)}
                                </div>
                              </td>

                              {/* Aksi */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleViewDetail(asset.code)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                    title="Lihat Detail"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleEdit(asset.code)}
                                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                                    title="Edit"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(asset.code)}
                                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                    title="Hapus"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                              <div className="flex flex-col items-center">
                                <Package className="w-16 h-16 text-slate-400 mb-4" />
                                <p className="text-lg font-medium text-slate-600 mb-2">
                                  Tidak ada data assets
                                </p>
                                <p className="text-sm text-slate-500 mb-4">
                                  {searchTerm || activeFilterCount > 0
                                    ? "Coba ubah filter pencarian Anda"
                                    : "Mulai dengan menambahkan asset pertama Anda"}
                                </p>
                                <button
                                  onClick={() => navigate("/assets/create")}
                                  className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
                                >
                                  Tambah Asset Pertama
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Footer dengan Pagination */}
                  {pagination.total > 0 && pagination.last_page > 1 && (
                    <div className="px-6 py-4 border-t border-slate-200/60 bg-white/50">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm text-slate-600 mb-4 sm:mb-0">
                          {renderPaginationInfo()}
                        </div>
                        <div className="flex items-center space-x-2">
                          {/* Tombol Sebelumnya */}
                          <button
                            onClick={() => handlePageChange(pagination.current_page - 1)}
                            disabled={pagination.current_page === 1}
                            className="flex items-center px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                          >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Sebelumnya
                          </button>

                          {/* Generate pagination numbers */}
                          {(() => {
                            const pageNumbers = generatePageNumbers();
                            
                            if (pageNumbers.length === 0) return null;
                            
                            return (
                              <>
                                {/* Tombol halaman pertama jika tidak termasuk dalam range */}
                                {pageNumbers[0] > 1 && (
                                  <>
                                    <button
                                      onClick={() => handlePageChange(1)}
                                      className={`px-3 py-2 rounded-lg font-medium text-sm ${
                                        pagination.current_page === 1
                                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                                          : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                                      } transition-colors`}
                                    >
                                      1
                                    </button>
                                    {pageNumbers[0] > 2 && (
                                      <span className="px-1 text-slate-500">...</span>
                                    )}
                                  </>
                                )}

                                {/* Tombol halaman tengah */}
                                {pageNumbers.map((pageNum) => (
                                  <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`px-3 py-2 rounded-lg font-medium text-sm min-w-[40px] ${
                                      pagination.current_page === pageNum
                                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                                        : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                                    } transition-colors`}
                                  >
                                    {pageNum}
                                  </button>
                                ))}

                                {/* Tombol halaman terakhir jika tidak termasuk dalam range */}
                                {pageNumbers[pageNumbers.length - 1] < pagination.last_page && (
                                  <>
                                    {pageNumbers[pageNumbers.length - 1] < pagination.last_page - 1 && (
                                      <span className="px-1 text-slate-500">...</span>
                                    )}
                                    <button
                                      onClick={() => handlePageChange(pagination.last_page)}
                                      className={`px-3 py-2 rounded-lg font-medium text-sm ${
                                        pagination.current_page === pagination.last_page
                                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                                          : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                                      } transition-colors`}
                                    >
                                      {pagination.last_page}
                                    </button>
                                  </>
                                )}
                              </>
                            );
                          })()}

                          {/* Tombol Selanjutnya */}
                          <button
                            onClick={() => handlePageChange(pagination.current_page + 1)}
                            disabled={pagination.current_page === pagination.last_page}
                            className="flex items-center px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                          >
                            Selanjutnya
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal untuk Filter */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        setFilters={setFilters}
        categories={categories}
        onApplyFilters={handleApplyFilters}
      />

      {/* Modal untuk Bulk Change Status */}
      <BulkStatusModal
        isOpen={showStatusModal}
        onClose={handleCloseStatusModal}
        selectedAssets={selectedAssets}
        assets={assets}
        bulkStatus={bulkStatus}
        setBulkStatus={setBulkStatus}
        isUpdating={isUpdating}
        bulkUpdateMessage={bulkUpdateMessage}
        onConfirm={handleBulkChangeStatus}
      />
    </div>
  );
};

export default Assets;  