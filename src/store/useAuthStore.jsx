// src/store/useAuthStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import api2 from "./api2"; // Import dari api.js yang baru

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      error: null,
      isInitialized: false,

      // ✅ Ambil CSRF cookie dan login
      login: async (email, password) => {
        set({ loading: true, error: null });
        console.log('🔐 Starting login process for:', email);

        try {
          // 1️⃣ Dapatkan CSRF cookie dulu
          console.log('🛡️ Getting CSRF cookie...');
          await api2.get("/sanctum/csrf-cookie");
          console.log('✅ CSRF cookie obtained');

          // 2️⃣ Lakukan login
          console.log('🔑 Attempting login...');
          await api2.post("/login", { 
            email, 
            password 
          });
          console.log('✅ Login successful');

          // 3️⃣ Ambil data user
          console.log('👤 Fetching user data...');
          const userRes = await api2.get("/api/user");
          console.log('✅ User data fetched:', userRes.data);

          set({ 
            user: userRes.data, // Perhatikan: mungkin userRes.data saja tanpa .data
            loading: false,
            error: null 
          });
          
          console.log('🎉 Login completed successfully');
          return true;
        } catch (err) {
          console.error("❌ Login error:", err);
          
          let errorMessage = "Login gagal";
          
          if (err.response) {
            // Server responded with error status
            errorMessage = err.response.data?.message || 
                          err.response.data?.error || 
                          `Error: ${err.response.status} ${err.response.statusText}`;
            
            // Handle specific Laravel validation errors
            if (err.response.status === 422 && err.response.data.errors) {
              const validationErrors = Object.values(err.response.data.errors).flat();
              errorMessage = validationErrors[0] || "Data yang dimasukkan tidak valid";
            }
          } else if (err.request) {
            // Request was made but no response received
            errorMessage = "Tidak dapat terhubung ke server. Periksa: \n1. Koneksi internet\n2. Server Laravel berjalan\n3. URL API benar";
          } else {
            // Something else happened
            errorMessage = err.message || "Terjadi kesalahan tidak terduga";
          }
          
          set({
            error: errorMessage,
            loading: false,
          });
          return false;
        }
      },

      // ✅ Logout function
      logout: async () => {
        try {
          console.log('🚪 Logging out...');
          await api2.post("/logout", {});
          console.log('✅ Logout successful');
        } catch (err) {
          console.warn("⚠️ Logout error:", err);
        } finally {
          set({ user: null, error: null });
          console.log('👋 User logged out');
        }
      },

      // ✅ Clear error
      clearError: () => set({ error: null }),

      // ✅ Set user
      setUser: (user) => set({ user }),

      // ✅ Initialize auth
      initializeAuth: async () => {
        console.log('🔄 Initializing auth...');
        set({ loading: true });
        
        try {
          const authStorage = localStorage.getItem('auth-storage');
          if (authStorage) {
            const authData = JSON.parse(authStorage);
            if (authData.state?.user) {
              console.log('📦 Found user in storage, validating...');
              // Coba validasi token dengan mengambil data user terbaru
              try {
                await api2.get("/sanctum/csrf-cookie");
                const userRes = await api2.get("/api/user");
                set({ 
                  user: userRes.data,
                  loading: false,
                  isInitialized: true
                });
                console.log('✅ Auth initialized with valid token');
                return;
              } catch (err) {
                console.warn('❌ Token validation failed:', err);
                // Token invalid, clear storage
                localStorage.removeItem('auth-storage');
              }
            }
          }
          set({ 
            loading: false, 
            isInitialized: true 
          });
          console.log('✅ Auth initialized - no valid session');
        } catch (err) {
          console.error('❌ Auth initialization error:', err);
          set({ 
            loading: false, 
            isInitialized: true 
          });
        }
      },

      // ✅ Check permission (middleware untuk authorization)
      hasPermission: (permission) => {
        const { user } = get();
        if (!user || !user.abilities) return false;
        return user.abilities.includes(permission);
      },

      // ✅ Check role (middleware untuk role-based access)
      hasRole: (role) => {
        const { user } = get();
        if (!user || !user.roles) return false;
        return user.roles.includes(role);
      },

      // ✅ Check if user has any of the required permissions
      hasAnyPermission: (permissions) => {
        const { user } = get();
        if (!user || !user.abilities) return false;
        return permissions.some(permission => 
          user.abilities.includes(permission)
        );
      },

      // ✅ Check if user has all required permissions
      hasAllPermissions: (permissions) => {
        const { user } = get();
        if (!user || !user.abilities) return false;
        return permissions.every(permission => 
          user.abilities.includes(permission)
        );
      }
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ 
        user: state.user
      }),
    }
  )
);