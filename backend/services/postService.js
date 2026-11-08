const Post = require('../models/Post');

const getPosts = async (filters) => {
  const { lat, lng, maxDistance = 500, tipo, categoria } = filters;
  const query = { activo: true };

  if (tipo && tipo !== 'todos') {
    query.tipo = tipo;
  }

  if (categoria && categoria !== 'todas') {
    query.categoria = categoria;
  }

  if (lat !== undefined && lng !== undefined) {
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    const parsedDistance = parseInt(maxDistance, 10) || 500;

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

  let coordinates = [-77.0428, -12.0464];
  if (lng !== undefined && lat !== undefined) {
    coordinates = [parseFloat(lng), parseFloat(lat)];
  } else if (
    userLocation &&
    Array.isArray(userLocation.coordinates) &&
    userLocation.coordinates.length === 2
  ) {
    coordinates = userLocation.coordinates;
  }

  const newPost = await Post.create({
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
    ubicacion: {
      type: 'Point',
      coordinates
    },
    comentarios: []
  });

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
      : commentData.autorNombre || 'Vecino del Barrio',
    autorBarrio: user?.barrio || 'Santa Beatriz',
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