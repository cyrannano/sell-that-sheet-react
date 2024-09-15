import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();


const api = axios.create({
	baseURL: 'http://192.168.3.69:8000/',
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

const paramNameTranslation = {
  'name': 'Nazwa',
  'price_pln': 'Cena',
  'price_euro': 'Cena w Euro',
  'tags': 'Tagi',
  'description': 'Opis',
  'serial_numbers': 'Numery seryjne',
  'shipment_price': 'Cena wysyłki',
  'category': 'Kategoria',
}

const requiredBaseParameters = ['name', 'price_pln', 'shipment_price'];
const disabledBaseParameters = ['id', 'photoset', 'category'];

export const createCategoryOfferObject = async (categoryId) => {
  const categoryParameters = await getCategoryParameters(categoryId);
  const offerModel = await api.get('/model-structure/sell_that_sheet/auction');
  const baseParameters = offerModel.data.structure.map((param) => {
    return {
      name: param.name,
      displayName: paramNameTranslation[param.name] || param.name,
      id: param.name + 'Base',
      type: (param.type.includes('Char') ? 'string' : 'float'),
      base: true,
      value: param.name === 'category' ? categoryId : '',
      required: requiredBaseParameters.includes(param.name),
      disabled: disabledBaseParameters.includes(param.name),
    }
  });

  const parameters = baseParameters.concat(categoryParameters.parameters);
  return parameters;
}

export const addPhotos = async (photos) => {
  return Promise.all(photos.map((photo) => addPhoto(photo)));
}

export const addPhoto = async (photo) => {
  // returns {id: 1, name: 'photo.jpg'}
  const response = await api.post('/photos/', {name: photo});
  return response.data;
}

export const createPhotoSet = async (photos, directory, thumbnail) => {
  if(!photos.includes(thumbnail)) {
    photos = [thumbnail, ...photos];
  }

  const addedPhotos = await addPhotos(photos);
  const addedPhotosIds = addedPhotos.map((photo) => photo.id);
  const photoset = {
    directory_location: directory,
    thumbnail: addedPhotosIds[0],
    photos: addedPhotosIds,
  };
  
  const response = await api.post('/photosets/', photoset);
  return response.data;
}

export const getPhotosetThumbnailURL = async (photosetId) => {
  const response = await api.get(`/photosets/${photosetId}`);
  const thumbnailId = response.data.thumbnail;
  const thumbnailref = response.data.directory_location;

  const thumbnailResponse = await api.get(`/photos/${thumbnailId}`);

  return `http://172.27.70.154/thumbnails/${thumbnailref}/${thumbnailResponse.data.name}`;
}

export { api };