const Alert = require('../models/Alert');

const getAlerts = async (filters) => {
  const { tipo, categoria, lat, lng, maxDistance = 5000 } = filters;
  const query = { activo: true };

  if (tipo && tipo !== 'Todas') {
    query.tipo = tipo;
  }

  if (categoria && categoria !== 'todas') {
    query.categoria = categoria;
  }

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

  let alertsQuery = Alert.find(query).populate(
    'autor',
    'nombre apellido barrio vistoBuenoCount'
  );

  if (!query.ubicacion) {
    alertsQuery = alertsQuery.sort({ createdAt: -1 });
  }

  return await alertsQuery.exec();
};

const createAlert = async (alertData, user) => {
  const { tipo, categoria, titulo, descripcion, nombreContacto, lat, lng } =
    alertData;

  let coordinates = [-77.0428, -12.0464];
  if (lng !== undefined && lat !== undefined) {
    coordinates = [parseFloat(lng), parseFloat(lat)];
  } else if (
    user &&
    user.ubicacion &&
    Array.isArray(user.ubicacion.coordinates)
  ) {
    coordinates = user.ubicacion.coordinates;
  }

  const contactName = user
    ? `${user.nombre} ${user.apellido}`
    : nombreContacto || 'Vecino en Emergencia';

  const newAlert = await Alert.create({
    autor: user ? user._id : null,
    nombreContacto: contactName,
    tipo,
    categoria: categoria || 'general',
    titulo,
    descripcion,
    ubicacion: {
      type: 'Point',
      coordinates
    }
  });

  return await newAlert.populate(
    'autor',
    'nombre apellido barrio vistoBuenoCount'
  );
};

const resolveAlert = async (alertId) => {
  const alert = await Alert.findById(alertId);
  if (!alert) {
    const error = new Error('Alerta no encontrada');
    error.statusCode = 404;
    throw error;
  }

  alert.activo = false;
  await alert.save();
  return alert;
};

const confirmAlertIncident = async (alertId, user) => {
  const alert = await Alert.findById(alertId);
  if (!alert) {
    const error = new Error('Alerta no encontrada');
    error.statusCode = 404;
    throw error;
  }

  const userIdStr = user._id.toString();
  const yaConfirmado = alert.confirmacionesVecinos.some(
    (c) => c.userId && c.userId.toString() === userIdStr
  );

  if (!yaConfirmado) {
    alert.confirmacionesVecinos.push({
      userId: user._id,
      nombreVecino: `${user.nombre} ${user.apellido}`
    });

    if (alert.confirmacionesVecinos.length >= 4) {
      alert.umbralAlcanzado = true;
    }

    await alert.save();
  }

  return alert;
};

module.exports = {
  getAlerts,
  createAlert,
  resolveAlert,
  confirmAlertIncident
};


