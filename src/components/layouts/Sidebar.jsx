// src/components/Sidebar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Settings,
  ShoppingCart,
  Wrench,
  Package
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const { user } = useAuthStore();

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
      if (user.abilities.includes('admin.dashboard')) {
        return "Administrator";
      }
      if (user.abilities.includes('procurements.create')) {
        return "Procurement Staff";
      }
    }
    
    // Jika ada abilities di currentUser
    if (currentUser.abilities) {
      if (currentUser.abilities.includes('admin.dashboard')) {
        return "Administrator";
      }
      if (currentUser.abilities.includes('procurements.create')) {
        return "Procurement Staff";
      }
    }
    
    return "Staff";
  };

  const menuItems = [
    { 
      icon: Home, 
      label: 'Dashboard', 
      path: '/dashboard',
      badge: null 
    },
    { 
      icon: ShoppingCart, 
      label: 'Procurements', 
      path: '/procurements',
      badge: null 
    },
    { 
      icon: Package, 
      label: 'Assets', 
      path: '/assets',
      badge: null 
    },
    { 
      icon: Wrench, 
      label: 'Maintenance', 
      path: '/maintenance-assets',
      badge: null 
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      path: '/settings',
      badge: null 
    },
  ];

  const isActive = (path) => {
    return location.pathname === path || (path === '/dashboard' && location.pathname === '/');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-80 bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl transform transition-all duration-500 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo Section */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <Link 
            to="/dashboard" 
            className="flex items-center space-x-3"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Procurement</h1>
              <p className="text-slate-400 text-sm">Management</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 mt-4">
          {menuItems.map((item, index) => {
            const active = isActive(item.path);
            return (
              <Link
                key={index}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                  active 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10' 
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white hover:scale-[1.02]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${
                    active ? 'text-blue-400' : 'text-slate-400 group-hover:text-white'
                  }`} />
                  <span className="font-medium">{item.label}</span>
                </div>
                
                {item.badge && (
                  <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                    item.badge === 'New' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
                
                {/* Active indicator */}
                {active && (
                  <div className="absolute right-3 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Stats Card - Optional */}
        {/* <div className="mx-4 mt-8 p-4 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-2xl backdrop-blur-sm">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-1">Procurement Stats</h3>
            <p className="text-slate-300 text-sm mb-3">12 active purchases</p>
            <button className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white py-2 rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-[1.02]">
              View Details
            </button>
          </div>
        </div> */}

        {/* User Profile */}
        <div className="absolute bottom-0 w-full p-6 border-t border-slate-700/50 bg-slate-800/20 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">
                  {getInitials()}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-slate-800 rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate">
                {currentUser?.name || "User"}
              </p>
              <p className="text-slate-400 text-sm truncate">
                Administrator
              </p>
              {currentUser?.email && (
                <p className="text-slate-500 text-xs truncate mt-1">
                  {currentUser.email}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;