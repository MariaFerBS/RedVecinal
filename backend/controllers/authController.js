const authService = require('../services/authService');

const register = async (req, res) => {
  try {
    const { nombre, apellido, email, password, barrio } = req.body;
    if (!nombre || !apellido || !email || !password || !barrio) {
      return res.status(400).json({
        message: 'Por favor completa todos los campos obligatorios'
      });
    }

    const userData = await authService.registerUser(req.body);
    return res.status(201).json(userData);
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || 'Error en el servidor al registrar' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Ingresa tu correo y contraseña' });
    }

    const userData = await authService.loginUser({ email, password });
    return res.status(200).json(userData);
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || 'Error al iniciar sesión' });
  }
};

const getMe = async (req, res) => {
  return res.status(200).json(req.user);
};

const updateProfile = async (req, res) => {
  try {
    const updatedUser = await authService.updateUserProfile(
      req.user._id,
      req.body
    );
    return res.status(200).json(updatedUser);
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || 'Error al actualizar el perfil' });
  }
};

const getNeighborProfile = async (req, res) => {
  try {
    const profileData = await authService.getPublicProfile(req.params.id);
    return res.status(200).json(profileData);
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || 'Error al obtener perfil' });
  }
};

const endorseNeighbor = async (req, res) => {
  try {
    const result = await authService.endorseNeighbor(
      req.params.id,
      req.user._id
    );
    return res.status(200).json(result);
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || 'Error al otorgar Visto Bueno' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  getNeighborProfile,
  endorseNeighbor
};