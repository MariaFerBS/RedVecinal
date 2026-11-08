const alertService = require('../services/alertService');

const getAlerts = async (req, res) => {
  try {
    const alerts = await alertService.getAlerts(req.query);
    return res.status(200).json(alerts);
  } catch (error) {
    return res.status(500).json({
      message: 'Error al obtener las alertas comunitarias',
      error: error.message
    });
  }
};

const createAlert = async (req, res) => {
  try {
    const { tipo, titulo, descripcion } = req.body;
    if (!tipo || !titulo || !descripcion) {
      return res.status(400).json({
        message: 'El tipo, título y descripción de la alerta son obligatorios'
      });
    }

    const alert = await alertService.createAlert(req.body, req.user);
    return res.status(201).json(alert);
  } catch (error) {
    return res.status(500).json({
      message: 'Error al registrar la alerta de emergencia',
      error: error.message
    });
  }
};

const resolveAlert = async (req, res) => {
  try {
    const alert = await alertService.resolveAlert(req.params.id);
    return res.status(200).json(alert);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || 'Error al actualizar alerta'
    });
  }
};

module.exports = {
  getAlerts,
  createAlert,
  resolveAlert
};