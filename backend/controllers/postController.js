const postService = require('../services/postService');

const getPosts = async (req, res) => {
  try {
    const posts = await postService.getPosts(req.query);
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({
      message: 'Error al obtener las publicaciones del barrio',
      error: error.message
    });
  }
};

const createPost = async (req, res) => {
  try {
    const { tipo, categoria, titulo, descripcion } = req.body;
    if (!tipo || !categoria || !titulo || !descripcion) {
      return res.status(400).json({
        message: 'Tipo, categoría, título y descripción son obligatorios'
      });
    }

    const created = await postService.createPost(
      req.user._id,
      req.body,
      req.user.ubicacion
    );
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({
      message: 'Error al crear la publicación',
      error: error.message
    });
  }
};

const addComment = async (req, res) => {
  try {
    const { texto, estrellas } = req.body;
    if (!texto || !texto.trim()) {
      return res.status(400).json({
        message: 'Escribe un comentario antes de enviar'
      });
    }

    const updatedPost = await postService.addCommentToPost(
      req.params.id,
      req.user,
      { texto, estrellas }
    );
    return res.status(201).json(updatedPost);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || 'Error al guardar el comentario'
    });
  }
};

module.exports = {
  getPosts,
  createPost,
  addComment
};