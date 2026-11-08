const Alert = require('../models/Alert');

const getAlerts = async (filters = {}) => {
  const { tipo, categoria, lat, lng, maxDistance = 5000 } = filters;
  
  // Solo devolver alertas activas
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
  const { tipo, categoria, titulo, descripcion, nombreContacto } = alertData;

  let coordinates = null;

  // 1. PRIORIDAD: Si viene en alertData.ubicacion.coordinates [lng, lat] (como lo manda tu frontend)
  if (
    alertData.ubicacion &&
    Array.isArray(alertData.ubicacion.coordinates) &&
    alertData.ubicacion.coordinates.length === 2
  ) {
    coordinates = [
      parseFloat(alertData.ubicacion.coordinates[0]),
      parseFloat(alertData.ubicacion.coordinates[1])
    ];
  }
  // 2. Si viene como alertData.lat y alertData.lng
  else if (alertData.lng !== undefined && alertData.lat !== undefined) {
    coordinates = [parseFloat(alertData.lng), parseFloat(alertData.lat)];
  }
  // 3. Si no viene nada de lo anterior, recién recurre al usuario logueado
  else if (user?.ubicacion?.coordinates && Array.isArray(user.ubicacion.coordinates)) {
    coordinates = user.ubicacion.coordinates;
  }
  // 4. Fallback final si no hay nada
  else {
    coordinates = [-77.1350, -12.0620];
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
    },
    activo: true
  });

  return await newAlert.populate(
    'autor',
    'nombre apellido barrio vistoBuenoCount'
  );
};

const resolveAlert = async (alertId, user = null) => {
  const alert = await Alert.findById(alertId);
  if (!alert) {
    const error = new Error('Alerta no encontrada');
    error.statusCode = 404;
    throw error;
  }

  // Validación de autor: solo el creador puede darla de baja
  if (user && alert.autor && String(alert.autor) !== String(user._id)) {
    const error = new Error('No tienes permiso para dar de baja esta alerta');
    error.statusCode = 403;
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