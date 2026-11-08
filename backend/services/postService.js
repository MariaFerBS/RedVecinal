const Post = require('../models/Post');

const getPosts = async (filters) => {
  const { lat, lng, maxDistance = 5000, tipo, categoria, barrio } = filters;
  const query = { activo: true };

  if (tipo && tipo !== 'todos') {
    query.tipo = tipo;
  }

  if (categoria && categoria !== 'todas') {
    query.categoria = categoria;
  }

  // Filtrado por geolocalización (coordenadas)
  if (lat !== undefined && lng !== undefined) {
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    const parsedDistance = parseInt(maxDistance, 10) || 5000;

    if (!Number.isNaN(parsedLat) && !Number.isNaN(parsedLng)) {
      query.ubicacion = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parsedLng, parsedLat]
          },
          $maxDistance: parsedDistance
        }
      };
    }
  }

  let postsQuery = Post.find(query).populate(
    'autor',
    'nombre apellido barrio ciudad vistoBuenoCount bio avatar'
  );

  if (!query.ubicacion) {
    postsQuery = postsQuery.sort({ createdAt: -1 });
  }

  return await postsQuery.exec();
};

const createPost = async (userId, postData, userLocation) => {
  const { tipo, categoria, titulo, descripcion, precio, esUrgente, lat, lng } =
    postData;

  // Tomamos las coordenadas de la publicación o del perfil del usuario
  let coordinates = null;
  if (lng !== undefined && lat !== undefined) {
    coordinates = [parseFloat(lng), parseFloat(lat)];
  } else if (
    userLocation &&
    Array.isArray(userLocation.coordinates) &&
    userLocation.coordinates.length === 2
  ) {
    coordinates = userLocation.coordinates;
  }

  const postPayload = {
    autor: userId,
    tipo,
    categoria,
    titulo,
    descripcion,
    precio:
      precio !== undefined && precio !== '' && precio !== null
        ? Number(precio)
        : null,
    esUrgente: Boolean(esUrgente),
    comentarios: []
  };

  // Solo asignamos GeoJSON si existen coordenadas válidas
  if (coordinates) {
    postPayload.ubicacion = {
      type: 'Point',
      coordinates
    };
  }

  const newPost = await Post.create(postPayload);

  return await newPost.populate(
    'autor',
    'nombre apellido barrio ciudad vistoBuenoCount bio avatar'
  );
};

const addCommentToPost = async (postId, user, commentData) => {
  const post = await Post.findById(postId);
  if (!post) {
    const error = new Error('Publicación no encontrada');
    error.statusCode = 404;
    throw error;
  }

  const newComment = {
    autor: user ? user._id : null,
    autorNombre: user
      ? `${user.nombre} ${user.apellido}`
      : commentData.autorNombre || 'Vecino',
    autorBarrio: user?.barrio || 'Vecino de la zona',
    estrellas: Number(commentData.estrellas) || 5,
    texto: commentData.texto
  };

  post.comentarios.unshift(newComment);
  await post.save();

  return await post.populate(
    'autor',
    'nombre apellido barrio ciudad vistoBuenoCount bio avatar'
  );
};

module.exports = {
  getPosts,
  createPost,
  addCommentToPost
};