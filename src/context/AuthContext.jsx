import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await api.getProfile();
          let userObj = res.user || res;

          // Normalize role based on isAdmin since DB uses Boolean
          if (!userObj.role) {
            userObj.role = userObj.isAdmin ? 'admin' : 'trainee';
          }

          if (userObj._id) {
            setUser(userObj);
          } else {
            logout();
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = (tokenValue, userDetails) => {
    localStorage.setItem('token', tokenValue);
    setToken(tokenValue);
    if (userDetails) {
      setUser(userDetails);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
