// src/components/Header.js
import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Bell,
  Search,
  Menu,
  ChevronDown,
  Sun,
  Moon,
  User,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";

const Header = ({ setSidebarOpen }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Ambil user data dari auth store
  const { user, logout } = useAuthStore();
  
  // Debug: Lihat struktur user data
  console.log("User data in Header:", user);
  
  // Fungsi untuk mengakses user data dengan structure yang benar
  const getUserData = () => {
    if (!user) return null;
    
    // Coba berbagai struktur yang mungkin
    if (user.data?.user) {
      return user.data.user; // Struktur: {data: {user: {...}}}
    } else if (user.user) {
      return user.user; // Struktur: {user: {...}}
    }
    
    return user; // Struktur langsung
  };
  
  const currentUser = getUserData();
  
  // Fungsi untuk mendapatkan initial dari nama
  const getInitials = () => {
    if (!currentUser?.name) return "U";
    
    return currentUser.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Fungsi untuk mendapatkan role display
  const getRoleDisplay = () => {
    if (!currentUser) return "Guest";
    
    // Coba ambil role dari berbagai sumber
    if (currentUser.role) {
      return currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
    }
    
    // Jika ada abilities di root user object
    if (user.abilities) {
      if (user.abilities.includes('procurements.create')) {
        return "Procurement Staff";
      }
      if (user.abilities.includes('admin.dashboard')) {
        return "Administrator";
      }
    }
    
    // Jika ada abilities di currentUser
    if (currentUser.abilities) {
      if (currentUser.abilities.includes('procurements.create')) {
        return "Procurement Staff";
      }
      if (currentUser.abilities.includes('admin.dashboard')) {
        return "Administrator";
      }
    }
    
    return "Staff";
  };

  // Fungsi untuk mendapatkan breadcrumb berdasarkan path
  const getBreadcrumbs = () => {
    const path = location.pathname;

    if (path === "/" || path === "/dashboard") {
      return [
        { name: "Home", path: "/" },
        { name: "Dashboard", path: "/dashboard", active: true },
      ];
    }

    if (path === "/pengadaan") {
      return [
        { name: "Home", path: "/dashboard" },
        { name: "Pengadaan", path: "/pengadaan", active: true },
      ];
    }

    if (path === "/settings") {
      return [
        { name: "Home", path: "/dashboard" },
        { name: "Settings", path: "/settings", active: true },
      ];
    }

    // Fallback untuk route lainnya
    const pathSegments = path.split("/").filter((segment) => segment);
    return pathSegments.map((segment, index) => ({
      name: segment.charAt(0).toUpperCase() + segment.slice(1),
      path: `/${pathSegments.slice(0, index + 1).join("/")}`,
      active: index === pathSegments.length - 1,
    }));
  };

  const breadcrumbs = getBreadcrumbs();

  const handleLogout = async () => {
    await logout();
    navigate("/signin");
  };

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm z-10">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section */}
        <div className="flex items-center">
          <button
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors duration-300"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumbs dengan React Router Link */}
          <nav className="ml-4 flex items-center space-x-2 text-sm">
            {breadcrumbs.map((breadcrumb, index) => (
              <div
                key={breadcrumb.path}
                className="flex items-center space-x-2"
              >
                {index > 0 && <span className="text-slate-300">/</span>}
                {breadcrumb.active ? (
                  <span className="text-slate-900 font-semibold gradient-text">
                    {breadcrumb.name}
                  </span>
                ) : (
                  <Link
                    to={breadcrumb.path}
                    className="text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    {breadcrumb.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search anything..."
              className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 w-64"
            />
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors duration-300"
          >
            {darkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          {/* Notifications */}
          <button className="relative p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors duration-300">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-slate-100 transition-colors duration-300"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {getInitials()}
                </span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-slate-900">
                  {currentUser?.name || "User"}
                </p>
                <p className="text-xs text-slate-500">
                  Administrator
                </p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
                  isProfileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/60 py-2 animate-fade-in z-50">
                {currentUser ? (
                  <>
                    <div className="px-4 py-3 border-b border-slate-200/60">
                      <p className="text-sm font-semibold text-slate-900">
                        {currentUser.name}
                      </p>
                      <p className="text-sm text-slate-500">{currentUser.email}</p>
                      <p className="text-xs text-slate-400">
                        {getRoleDisplay()}
                        {currentUser.department && ` • ${currentUser.department}`}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        User ID: {currentUser.id}
                      </p>
                    </div>

                    <div className="py-2">
                      <a
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <User className="w-4 h-4 mr-3" />
                        Profile Settings
                      </a>
                    </div>

                    <div className="border-t border-slate-200/60 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="px-4 py-3">
                    <p className="text-sm text-slate-600">Not logged in</p>
                    <button
                      onClick={() => navigate("/signin")}
                      className="mt-2 w-full px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Login
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;