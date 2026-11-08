import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('rv_user');
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    if (parsed?.barrio === 'Santa Beatriz' || parsed?._id === 'vecino_local_1') {
      localStorage.removeItem('rv_user');
      return null;
    }
    return parsed;
  });

  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem('rv_posts_cache');
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed) && parsed.some((p) => p.autor?.barrio === 'Santa Beatriz')) {
      localStorage.removeItem('rv_posts_cache');
      return [];
    }
    return parsed;
  });

  const [savedPostIds, setSavedPostIds] = useState(() => {
    const saved = localStorage.getItem('rv_saved_posts');
    return saved ? JSON.parse(saved) : [];
  });

  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'https://redvecinal.onrender.com/api';

  useEffect(() => {
    const cachedPosts = localStorage.getItem('rv_posts_cache');
    if (cachedPosts && cachedPosts.includes('Santa Beatriz')) {
      localStorage.removeItem('rv_posts_cache');
      setPosts([]);
    }
  }, []);

  useEffect(() => {
    if (user?.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [user]);

  const fetchPosts = async (params = {}) => {
    try {
      const coords = user?.ubicacion?.coordinates;
      const queryParams = {
        ...params,
        ...(coords ? { lng: coords[0], lat: coords[1] } : {})
      };

      const res = await axios.get(`${apiUrl}/posts`, { params: queryParams });
      if (Array.isArray(res.data)) {
        setPosts(res.data);
        localStorage.setItem('rv_posts_cache', JSON.stringify(res.data));
      }
    } catch (error) {
      const cached = localStorage.getItem('rv_posts_cache');
      if (cached) {
        setPosts(JSON.parse(cached));
      }
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  // Detección de GPS real al inicio
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          setUser((prevUser) => {
            if (!prevUser) return prevUser;
            const updatedUser = {
              ...prevUser,
              ubicacion: {
                type: 'Point',
                coordinates: [longitude, latitude] // [lng, lat]
              }
            };
            localStorage.setItem('rv_user', JSON.stringify(updatedUser));
            return updatedUser;
          });

          fetchPosts({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.warn('GPS no disponible:', error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post(`${apiUrl}/auth/login`, { email, password });
      setUser(res.data);
      localStorage.setItem('rv_user', JSON.stringify(res.data));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Credenciales incorrectas'
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const res = await axios.post(`${apiUrl}/auth/register`, formData);
      setUser(res.data);
      localStorage.setItem('rv_user', JSON.stringify(res.data));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al registrar cuenta'
      };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updatedFields) => {
    setLoading(true);
    try {
      const res = await axios.put(`${apiUrl}/auth/profile`, updatedFields);
      const mergedUser = { ...user, ...res.data };
      setUser(mergedUser);
      localStorage.setItem('rv_user', JSON.stringify(mergedUser));

      const updatedPosts = posts.map((p) =>
        p.autor?._id === mergedUser._id
          ? {
              ...p,
              autor: {
                ...p.autor,
                nombre: mergedUser.nombre,
                apellido: mergedUser.apellido,
                barrio: mergedUser.barrio,
                ciudad: mergedUser.ciudad,
                bio: mergedUser.bio
              }
            }
          : p
      );
      setPosts(updatedPosts);
      localStorage.setItem('rv_posts_cache', JSON.stringify(updatedPosts));
      return { success: true };
    } catch (error) {
      return { success: false, message: 'No se pudo actualizar el perfil' };
    } finally {
      setLoading(false);
    }
  };

  const createNewPost = async (postData) => {
    try {
      const res = await axios.post(`${apiUrl}/posts`, postData);
      const updated = [res.data, ...posts];
      setPosts(updated);
      localStorage.setItem('rv_posts_cache', JSON.stringify(updated));
      return res.data;
    } catch (error) {
      console.error('Error al crear publicación:', error);
      throw error;
    }
  };

  const toggleSavePost = (postId) => {
    setSavedPostIds((prev) => {
      const exists = prev.includes(postId);
      const updated = exists
        ? prev.filter((id) => id !== postId)
        : [...prev, postId];
      localStorage.setItem('rv_saved_posts', JSON.stringify(updated));
      return updated;
    });
  };

  const endorseNeighborLocal = async (neighborId) => {
    try {
      await axios.post(`${apiUrl}/auth/vecino/${neighborId}/vistobueno`);
    } catch (e) {
      // Optimista
    }
    const updatedPosts = posts.map((p) => {
      if (p.autor?._id === neighborId) {
        return {
          ...p,
          autor: {
            ...p.autor,
            vistoBuenoCount: (p.autor.vistoBuenoCount || 1) + 1
          }
        };
      }
      return p;
    });
    setPosts(updatedPosts);
    localStorage.setItem('rv_posts_cache', JSON.stringify(updatedPosts));
  };

  const addCommentToPost = async (postId, commentData) => {
    try {
      const res = await axios.post(`${apiUrl}/posts/${postId}/comments`, commentData);
      const updatedPosts = posts.map((p) => (p._id === postId ? res.data : p));
      setPosts(updatedPosts);
      localStorage.setItem('rv_posts_cache', JSON.stringify(updatedPosts));
      return res.data;
    } catch (error) {
      console.error('Error al agregar comentario:', error);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rv_user');
    localStorage.removeItem('rv_posts_cache');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        posts,
        savedPostIds,
        login,
        register,
        updateProfile,
        logout,
        fetchPosts,
        createNewPost,
        toggleSavePost,
        endorseNeighborLocal,
        addCommentToPost,
        userCoords: user?.ubicacion?.coordinates || null
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);