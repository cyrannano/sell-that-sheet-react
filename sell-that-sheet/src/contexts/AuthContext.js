import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();


const api = axios.create({
	baseURL: 'http://192.168.1.15:8000/',
});

api.interceptors.request.use((config) => {
	const token = localStorage.getItem('authToken');
	if (token) {
		config.headers['Authorization'] = `Token ${token}`;
	}
	return config;
}, (error) => {
  return Promise.reject(error);
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = async () => {
    return isAuthenticated;
  }

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const { data } = await api.post('/api/login/', { username, password });
      const { token, userData } = data;
      localStorage.setItem('authToken', token); // For enhanced security, consider using httpOnly cookies
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
      return Promise.reject(error.response.data); // Handling errors
    }
  };

  const logout = () => {
    const { data } = api.post('/api/logout/').then(() => {
      localStorage.removeItem('authToken');
      setUser(null);
      setIsAuthenticated(false);
    }).catch((error) => {
      console.error(error.response.data); // Handling errors
      localStorage.removeItem('authToken');
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const browseDirectory = async (directory) => {
  let dirpath = directory.map((item) => item.name == "Zdjęcia" ? "" : item.name);
  if(dirpath.length > 1) {
    // remove root directory
    dirpath.shift();
  }
  dirpath = dirpath.join('/');
  const response = await api.get(`/api/browse/${dirpath}`);
  return response.data;
};

export const getCategoryParameters = async (category) => {
  const response = await api.get(`/allegro/get-category-parameters/${category}`);
  return response.data;
}

export const matchCategory = async (productName) => {
  if (productName === ""  || productName === null || productName.length < 5) {
    return [];
  }
  const response = await api.get(`/allegro/match-category/${productName}`);
  return response.data.matchingCategories;
}

export const getCategoryById = async (categoryId) => {
  const response = await api.get(`/allegro/get-category-by-id/${categoryId}`);
  // if error response code return error
  if (response.data.errors && response.data.errors.length > 0) {
    return Promise.reject(response.data.errors[0]);
  }
  return response.data;
}

export { api };