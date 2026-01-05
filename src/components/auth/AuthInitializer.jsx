// src/components/AuthInitializer.js
import { useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';

const AuthInitializer = ({ children }) => {
  const { initializeAuth, isInitialized, loading } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) {
      initializeAuth();
    }
  }, [initializeAuth, isInitialized]);

  // Show loading spinner while initializing auth
  if (!isInitialized || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-slate-600">Loading...</span>
      </div>
    );
  }

  return children;
};

export default AuthInitializer;