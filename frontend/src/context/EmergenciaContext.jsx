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

  const fetchAlerts = async (coords = null) => {
    try {
      const params = {};
      if (coords && Array.isArray(coords) && coords.length === 2) {
        params.lng = coords[0];
        params.lat = coords[1];
        params.maxDistance = 5000;
      }
      const res = await axios.get(`${apiUrl}/alerts`, { params });
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

  const resolveAlert = async (alertId) => {
    try {
      await axios.patch(`${apiUrl}/alerts/${alertId}/resolve`);
    } catch (error) {
      console.warn('Actualizando localmente la alerta:', error.message);
    }

    const updated = alerts.filter((a) => a._id !== alertId);
    setAlerts(updated);
    localStorage.setItem('rv_alerts_cache', JSON.stringify(updated));

    const quedanUrgentes = updated.some(
      (a) => (a.tipo === 'Necesito ayuda' || a.tipo === 'sos') && a.activo !== false
    );
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