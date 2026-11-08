// frontend/src/utils/geoUtils.js

/**
 * Calcula la distancia en metros o kilómetros entre dos coordenadas GPS.
 * @param {number} lat1 - Latitud del usuario
 * @param {number} lon1 - Longitud del usuario
 * @param {number} lat2 - Latitud del post/alerta
 * @param {number} lon2 - Longitud del post/alerta
 * @returns {string} Texto formateado (ej. "85 m", "320 m", "1.4 km")
 */
export const calcularDistanciaReal = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 'Cerca de ti';

  const R = 6371e3; // Radio de la Tierra en metros
  const rad = Math.PI / 180;
  
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const metros = Math.round(R * c);

  if (metros < 1000) {
    return `a ${metros} m`;
  }
  return `a ${(metros / 1000).toFixed(1)} km`;
};