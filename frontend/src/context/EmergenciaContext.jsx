import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const EmergenciaContext = createContext();

export const EmergenciaProvider = ({ children }) => {
  const [isEmergencyActive, setIsEmergencyActive] = useState(() => {
    return localStorage.getItem('rv_emergency_mode') === 'true';
  });

  const [alerts, setAlerts] = useState(() => {
    const cached = localStorage.getItem('rv_alerts_cache');
    if (!cached) return [];
    try {
      const parsed = JSON.parse(cached);
      // Purgar si contiene alertas previas de prueba (alert_1, alert_2, alert_3)
      if (
        Array.isArray(parsed) &&
        parsed.some((a) => a._id === 'alert_1' || a._id === 'alert_2' || a._id === 'alert_3')
      ) {
        localStorage.removeItem('rv_alerts_cache');
        return [];
      }
      return parsed;
    } catch {
      localStorage.removeItem('rv_alerts_cache');
      return [];
    }
  });

  const apiUrl = import.meta.env.VITE_API_URL || 'https://redvecinal.onrender.com/api';

  // Limpieza defensiva en el montaje
  useEffect(() => {
    const cached = localStorage.getItem('rv_alerts_cache');
    if (cached && (cached.includes('alert_1') || cached.includes('Familia Vargas'))) {
      localStorage.removeItem('rv_alerts_cache');
      setAlerts([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('rv_emergency_mode', String(isEmergencyActive));
  }, [isEmergencyActive]);

  const fetchAlerts = async () => {
    try {
      const res = await axios.get(`${apiUrl}/alerts`);
      if (Array.isArray(res.data)) {
        setAlerts(res.data);
        localStorage.setItem('rv_alerts_cache', JSON.stringify(res.data));
      }
    } catch (error) {
      const cached = localStorage.getItem('rv_alerts_cache');
      if (cached) {
        try {
          setAlerts(JSON.parse(cached));
        } catch {
          setAlerts([]);
        }
      }
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const activateEmergency = () => {
    setIsEmergencyActive(true);
    localStorage.setItem('rv_emergency_mode', 'true');
  };

  // Función para marcar como resuelta / desactivar una alerta
  const resolveAlert = async (alertId) => {
    try {
      // Si tu backend tiene ruta PUT o PATCH para actualizar
      await axios.patch(`${apiUrl}/alerts/${alertId}`, { activo: false });
    } catch (error) {
      console.warn('Actualizando localmente la alerta:', error.message);
    }

    // Quitar la alerta del estado y de la caché para que desaparezca de inmediato
    const updated = alerts.filter((a) => a._id !== alertId);
    setAlerts(updated);
    localStorage.setItem('rv_alerts_cache', JSON.stringify(updated));

    // Si ya no quedan alertas urgentes activas, apagar el modo SOS
    const quedanUrgentes = updated.some((a) => a.tipo === 'Necesito ayuda' && a.activo !== false);
    if (!quedanUrgentes) {
      setIsEmergencyActive(false);
      localStorage.setItem('rv_emergency_mode', 'false');
    }
  };

  const deactivateEmergency = () => {
    setIsEmergencyActive(false);
    localStorage.setItem('rv_emergency_mode', 'false');
  };

  const addAlert = async (alertData) => {
    activateEmergency();
    try {
      const res = await axios.post(`${apiUrl}/alerts`, alertData);
      const created = {
        ...res.data,
        distancia: 'A menos de 100m'
      };
      const updated = [created, ...alerts];
      setAlerts(updated);
      localStorage.setItem('rv_alerts_cache', JSON.stringify(updated));
      return created;
    } catch (error) {
      const fallbackAlert = {
        _id: `alert_${Date.now()}`,
        ...alertData,
        distancia: 'Cerca de ti',
        createdAt: new Date().toISOString()
      };
      const updated = [fallbackAlert, ...alerts];
      setAlerts(updated);
      localStorage.setItem('rv_alerts_cache', JSON.stringify(updated));
      return fallbackAlert;
    }
  };

  return (
    <EmergenciaContext.Provider
      value={{
        isEmergencyActive,
        activateEmergency,
        deactivateEmergency,
        alerts,
        resolveAlert,
        addAlert,
        fetchAlerts
      }}
    >
      {children}
    </EmergenciaContext.Provider>
  );
};

export const useEmergencia = () => useContext(EmergenciaContext);