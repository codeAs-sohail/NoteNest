import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('notenest_access');
      if (token) {
        try {
          const response = await api.get('auth/profile/');
          setUser(response.data);
        } catch (error) {
          console.error("Auth check failed:", error);
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (username, email, password) => {
    const response = await api.post('auth/login/', { username, email, password });
    const { access, refresh } = response.data;
    
    localStorage.setItem('notenest_access', access);
    localStorage.setItem('notenest_refresh', refresh);
    
    const profileRes = await api.get('auth/profile/');
    setUser(profileRes.data);
    return response.data;
  };

  const register = async (userData) => {
    return await api.post('auth/register/', userData);
  };

  const updateProfile = async (profileData) => {
    const response = await api.put('auth/profile/', profileData);
    // Refresh user state immediately
    const userRes = await api.get('auth/profile/');
    setUser(userRes.data);
    return response.data;
  };

  const deleteProfile = async () => {
    // Delete profile from the backend DB
    await api.delete('auth/profile/');
    // Clear all local data
    localStorage.removeItem('notenest_access');
    localStorage.removeItem('notenest_refresh');
    localStorage.removeItem('notenest_liked');
    localStorage.removeItem('notenest_seen_notifs');
    setUser(null);
    // Navigation will be handled by the calling component
  };

  const logout = async () => {
    try {
      const refresh = localStorage.getItem('notenest_refresh');
      if (refresh) {
        await api.post('auth/logout/', { refresh });
      }
    } catch (error) {
      console.error("Logout API failed, continuing local clear", error);
    } finally {
      localStorage.removeItem('notenest_access');
      localStorage.removeItem('notenest_refresh');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, deleteProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
