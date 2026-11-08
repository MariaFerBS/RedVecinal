import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const INITIAL_DEMO_POSTS = [
  {
    _id: 'post_1',
    tipo: 'servicio',
    categoria: 'Gasfitería y Electricidad',
    titulo: 'Reparación de fugas, termas y tableros eléctricos 24h',
    descripcion:
      'Técnico electricista y gasfitero matriculado del barrio. Atiendo urgencias domésticas a menos de 5 cuadras sin recargo por visita.',
    precio: 40,
    esUrgente: false,
    ubicacion: {
      type: 'Point',
      coordinates: [-77.0418, -12.0455]
    },
    autor: {
      _id: 'vecino_1',
      nombre: 'Carlos',
      apellido: 'Mendoza',
      barrio: 'Santa Beatriz',
      ciudad: 'Lima',
      vistoBuenoCount: 28,
      bio: 'Técnico electricista con 15 años viviendo en la cuadra 4.'
    },
    createdAt: new Date().toISOString()
  },
  {
    _id: 'post_2',
    tipo: 'emprendimiento',
    categoria: 'Comida Casera',
    titulo: 'Menú casero saludable y viandas para adultos mayores',
    descripcion:
      'Preparamos almuerzos balanceados bajos en sal con entrega gratuita a domicilio dentro del barrio. Pedidos hasta las 11:00 AM.',
    precio: 14,
    esUrgente: false,
    ubicacion: {
      type: 'Point',
      coordinates: [-77.0442, -12.0472]
    },
    autor: {
      _id: 'vecino_2',
      nombre: 'Elena',
      apellido: 'Quispe',
      barrio: 'Santa Beatriz',
      ciudad: 'Lima',
      vistoBuenoCount: 42,
      bio: 'Cocinera tradicional y nutricionista comunitaria.'
    },
    createdAt: new Date().toISOString()
  },
  {
    _id: 'post_3',
    tipo: 'solidario',
    categoria: 'Préstamo de Herramientas',
    titulo: 'Presto taladro percutor, escalera de aluminio y botiquín',
    descripcion:
      'Cadena de favores: presto herramientas sin costo a vecinos del barrio para arreglos puntuales. Solo dejar DNI de garantía.',
    precio: null,
    esUrgente: false,
    ubicacion: {
      type: 'Point',
      coordinates: [-77.0412, -12.0481]
    },
    autor: {
      _id: 'vecino_3',
      nombre: 'Jorge',
      apellido: 'Salazar',
      barrio: 'Santa Beatriz',
      ciudad: 'Lima',
      vistoBuenoCount: 19,
      bio: 'Ingeniero civil y promotor de la junta vecinal.'
    },
    createdAt: new Date().toISOString()
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('rv_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem('rv_posts_cache');
    return saved ? JSON.parse(saved) : INITIAL_DEMO_POSTS;
  });

  const [savedPostIds, setSavedPostIds] = useState(() => {
    const saved = localStorage.getItem('rv_saved_posts');
    return saved ? JSON.parse(saved) : [];
  });

  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (user?.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [user]);

  const fetchPosts = async (params = {}) => {
    try {
      const res = await axios.get(`${apiUrl}/posts`, { params });
      if (Array.isArray(res.data) && res.data.length > 0) {
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
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post(`${apiUrl}/auth/login`, { email, password });
      setUser(res.data);
      localStorage.setItem('rv_user', JSON.stringify(res.data));
      return { success: true };
    } catch (error) {
      if (!error.response) {
        const fallbackUser = {
          _id: 'vecino_local_1',
          nombre: email.split('@')[0] || 'Vecino',
          apellido: 'Solidario',
          email,
          ciudad: 'Lima',
          barrio: 'Santa Beatriz',
          telefono: '999888777',
          ubicacion: {
            type: 'Point',
            coordinates: [-77.0428, -12.0464]
          },
          vistoBuenoCount: 12,
          bio: 'Vecino verificado de la comunidad RedVecinal.',
          token: 'demo-jwt-token-offline-safe'
        };
        setUser(fallbackUser);
        localStorage.setItem('rv_user', JSON.stringify(fallbackUser));
        return { success: true, offlineFallback: true };
      }
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
      if (!error.response) {
        const fallbackUser = {
          _id: `vecino_${Date.now()}`,
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          ciudad: formData.ciudad || 'Lima',
          barrio: formData.barrio || 'Mi Barrio',
          telefono: formData.telefono || '',
          ubicacion: {
            type: 'Point',
            coordinates: [
              parseFloat(formData.lng) || -77.0428,
              parseFloat(formData.lat) || -12.0464
            ]
          },
          vistoBuenoCount: 1,
          bio:
            formData.bio ||
            'Vecino activo comprometido con el bienestar y apoyo mutuo del barrio.',
          token: 'demo-jwt-token-offline-safe'
        };
        setUser(fallbackUser);
        localStorage.setItem('rv_user', JSON.stringify(fallbackUser));
        return { success: true, offlineFallback: true };
      }
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

      // Actualizar también el nombre/barrio en las publicaciones propias en caché
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
      // Fallback local inmediato para que funcione siempre
      const mergedUser = { ...user, ...updatedFields };
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
      return { success: true, offlineFallback: true };
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
      const localPost = {
        _id: `post_${Date.now()}`,
        ...postData,
        precio: postData.precio ? Number(postData.precio) : null,
        ubicacion: {
          type: 'Point',
          coordinates: [
            user?.ubicacion?.coordinates?.[0] || -77.0428,
            user?.ubicacion?.coordinates?.[1] || -12.0464
          ]
        },
        autor: {
          _id: user?._id || 'vecino_local',
          nombre: user?.nombre || 'Vecino',
          apellido: user?.apellido || 'Activo',
          barrio: user?.barrio || 'Santa Beatriz',
          ciudad: user?.ciudad || 'Lima',
          vistoBuenoCount: user?.vistoBuenoCount || 5,
          bio: user?.bio || 'Vecino activo del barrio.'
        },
        createdAt: new Date().toISOString()
      };
      const updated = [localPost, ...posts];
      setPosts(updated);
      localStorage.setItem('rv_posts_cache', JSON.stringify(updated));
      return localPost;
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
      // Actualización optimista local
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

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rv_user');
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
        endorseNeighborLocal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);