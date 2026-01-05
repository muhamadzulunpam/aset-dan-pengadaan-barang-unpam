// src/hooks/useAuth.js
import { useAuthStore } from '../../store/useAuthStore';

export const useAuth = () => {
  const { 
    user, 
    loading, 
    error, 
    login, 
    logout, 
    clearError,
    hasPermission,
    hasRole 
  } = useAuthStore();

  return {
    // State
    user,
    isAuthenticated: !!user,
    isLoading: loading,
    error,
    
    // Actions
    login,
    logout,
    clearError,
    
    // Middleware functions
    hasPermission,
    hasRole,
    
    // Convenience methods
    can: (permission) => hasPermission(permission),
    is: (role) => hasRole(role),
  };
};