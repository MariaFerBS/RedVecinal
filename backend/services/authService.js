const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Post = require('../models/Post');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (userData) => {
  const {
    nombre,
    apellido,
    email,
    password,
    ciudad,
    barrio,
    codigoManzana,
    telefono,
    lat,
    lng,
    bio
  } = userData;

  const userExists = await User.findOne({ email });
  if (userExists) {
    const error = new Error('El correo electrónico ya está registrado');
    error.statusCode = 400;
    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Códigos válidos de manzana predefinidos para validación estricta de la junta vecinal
  const codigosValidos = ['MZ-A-2026', 'MZ-B-2026', 'MZ-C-2026', 'URB-SANTA-BEATRIZ'];
  const esVerificado =
    codigoManzana && codigosValidos.includes(codigoManzana.trim().toUpperCase());

  const coordinates =
    lng !== undefined && lat !== undefined
      ? [parseFloat(lng), parseFloat(lat)]
      : [-77.0428, -12.0464];

  const user = await User.create({
    nombre,
    apellido,
    email,
    password: hashedPassword,
    ciudad: ciudad || 'Lima',
    barrio,
    codigoManzana: codigoManzana || '',
    estadoVerificacion: esVerificado ? 'verificado' : 'pendiente',
    telefono: telefono || '',
    bio: bio || 'Vecino activo comprometido con el apoyo mutuo barrial.',
    ubicacion: {
      type: 'Point',
      coordinates
    }
  });

  return {
    _id: user._id,
    nombre: user.nombre,
    apellido: user.apellido,
    email: user.email,
    ciudad: user.ciudad,
    barrio: user.barrio,
    codigoManzana: user.codigoManzana,
    estadoVerificacion: user.estadoVerificacion,
    telefono: user.telefono,
    ubicacion: user.ubicacion,
    vistoBuenoCount: user.vistoBuenoCount,
    bio: user.bio,
    avatar: user.avatar,
    token: generateToken(user._id)
  };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('Credenciales inválidas');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error('Credenciales inválidas');
    error.statusCode = 401;
    throw error;
  }

  return {
    _id: user._id,
    nombre: user.nombre,
    apellido: user.apellido,
    email: user.email,
    ciudad: user.ciudad,
    barrio: user.barrio,
    telefono: user.telefono,
    ubicacion: user.ubicacion,
    vistoBuenoCount: user.vistoBuenoCount,
    bio: user.bio,
    avatar: user.avatar,
    token: generateToken(user._id)
  };
};

const updateUserProfile = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    throw error;
  }

  user.nombre = updateData.nombre || user.nombre;
  user.apellido = updateData.apellido || user.apellido;
  user.ciudad = updateData.ciudad || user.ciudad;
  user.barrio = updateData.barrio || user.barrio;
  user.telefono =
    updateData.telefono !== undefined ? updateData.telefono : user.telefono;
  user.bio = updateData.bio !== undefined ? updateData.bio : user.bio;

  if (updateData.lat !== undefined && updateData.lng !== undefined) {
    user.ubicacion = {
      type: 'Point',
      coordinates: [parseFloat(updateData.lng), parseFloat(updateData.lat)]
    };
  }

  const updated = await user.save();

  return {
    _id: updated._id,
    nombre: updated.nombre,
    apellido: updated.apellido,
    email: updated.email,
    ciudad: updated.ciudad,
    barrio: updated.barrio,
    telefono: updated.telefono,
    ubicacion: updated.ubicacion,
    vistoBuenoCount: updated.vistoBuenoCount,
    bio: updated.bio,
    avatar: updated.avatar,
    token: generateToken(updated._id)
  };
};

const getPublicProfile = async (userId) => {
  const user = await User.findById(userId).select(
    'nombre apellido ciudad barrio vistoBuenoCount bio avatar createdAt'
  );

  if (!user) {
    const error = new Error('Vecino no encontrado');
    error.statusCode = 404;
    throw error;
  }

  const posts = await Post.find({ autor: userId, activo: true })
    .populate('autor', 'nombre apellido barrio vistoBuenoCount avatar')
    .sort({ createdAt: -1 });

  return {
    vecino: user,
    publicaciones: posts
  };
};

const endorseNeighbor = async (targetUserId, voterUserId) => {
  if (targetUserId.toString() === voterUserId.toString()) {
    const error = new Error('No puedes darte Visto Bueno a ti mismo');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(targetUserId);
  if (!user) {
    const error = new Error('Vecino no encontrado');
    error.statusCode = 404;
    throw error;
  }

  if (!user.vistoBuenoVoters.includes(voterUserId)) {
    user.vistoBuenoVoters.push(voterUserId);
    user.vistoBuenoCount += 1;
    await user.save();
  }

  return {
    _id: user._id,
    vistoBuenoCount: user.vistoBuenoCount
  };
};

module.exports = {
  registerUser,
  loginUser,
  updateUserProfile,
  getPublicProfile,
  endorseNeighbor
};