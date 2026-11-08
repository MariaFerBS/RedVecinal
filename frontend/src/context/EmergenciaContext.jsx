import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const EmergenciaContext = createContext();

const INITIAL_DEMO_ALERTS = [
  {
    _id: 'alert_1',
    tipo: 'Necesito ayuda',
    categoria: 'salud',
    titulo: 'Adulto mayor requiere insulina refrigerada urgente',
    descripcion:
      'Por corte eléctrico prolongado en la cuadra 3 perdimos cadena de frío. Necesitamos conservar 2 frascos de insulina o hielo seco.',
    nombreContacto: 'Familia Vargas (Cuadra 3)',
    distancia: '120m',
    ubicacion: {
      type: 'Point',
      coordinates: [-77.0432, -12.0458]
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString()
  },
  {
    _id: 'alert_2',
    tipo: 'Necesito ayuda',
    categoria: 'salud',
    titulo: 'Necesito préstamo urgente de balón de oxígeno o concentrador',
    descripcion:
      'Para familiar adulto mayor en la cuadra 6 mientras llega la ambulancia del SAMU. Agradezco cualquier apoyo inmediato.',
    nombreContacto: 'Lucía Paredes (Cuadra 6)',
    distancia: '95m',
    ubicacion: {
      type: 'Point',
      coordinates: [-77.0439, -12.0449]
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString()
  },
  {
    _id: 'alert_3',
    tipo: 'Ofrezco ayuda',
    categoria: 'electricidad',
    titulo: 'Generador eléctrico disponible para equipos médicos y celulares',
    descripcion:
      'Tengo grupo electrógeno encendido en el patio común del pasaje Los Pinos. Pueden traer celulares o nebulizadores.',
    nombreContacto: 'Roberto Cáceres',
    distancia: '210m',
    ubicacion: {
      type: 'Point',
      coordinates: [-77.0419, -12.0469]
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString()
  }
];

export const EmergenciaProvider = ({ children }) => {
  const [isEmergencyActive, setIsEmergencyActive] = useState(() => {
    return localStorage.getItem('rv_emergency_mode') === 'true';
  });

  const [alerts, setAlerts] = useState(() => {
    const cached = localStorage.getItem('rv_alerts_cache');
    return cached ? JSON.parse(cached) : INITIAL_DEMO_ALERTS;
  });

  const apiUrl = import.meta.env.VITE_API_URL || 'https://redvecinal.onrender.com/api';

  useEffect(() => {
    localStorage.setItem('rv_emergency_mode', String(isEmergencyActive));
  }, [isEmergencyActive]);

  const fetchAlerts = async () => {
    try {
      const res = await axios.get(`${apiUrl}/alerts`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        setAlerts(res.data);
        localStorage.setItem('rv_alerts_cache', JSON.stringify(res.data));
      }
    } catch (error) {
      const cached = localStorage.getItem('rv_alerts_cache');
      if (cached) {
        setAlerts(JSON.parse(cached));
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
        distancia: '85m',
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
        addAlert,
        fetchAlerts
      }}
    >
      {children}
    </EmergenciaContext.Provider>
  );
};

export const useEmergencia = () => useContext(EmergenciaContext);