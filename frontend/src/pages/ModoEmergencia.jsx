import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PhoneCall,
  ShieldAlert,
  PlusCircle,
  CheckCircle2,
  MapPin,
  Clock,
  Eye,
  X,
  MessageCircle,
  CheckCircle,
  UserCheck
} from 'lucide-react';
import { useEmergencia } from '../context/EmergenciaContext';
import { useAuth } from '../context/AuthContext';
import ChatModal from '../components/ChatModal';

// Cálculo geodésico Haversine
const calcularDistanciaInfo = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) {
    return { metros: 0, texto: 'En tu zona' };
  }

  const R = 6371e3; // Radio de la Tierra en metros
  const rad = Math.PI / 180;

  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * rad) *
      Math.cos(lat2 * rad) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const metros = Math.round(R * c);

  const texto = metros < 1000 ? `a ${metros} m` : `a ${(metros / 1000).toFixed(1)} km`;
  return { metros, texto };
};

const RADIO_MAXIMO_SOS = 1000; // 1 km estricto

const ModoEmergencia = () => {
  const {
    isEmergencyActive,
    activateEmergency,
    deactivateEmergency,
    alerts,
    addAlert,
    resolveAlert
  } = useEmergencia();

  // Coordenadas directamente de AuthContext (actualizadas por el GPS real)
  const { user } = useAuth();
  const navigate = useNavigate();

  const userLng = user?.ubicacion?.coordinates?.[0];
  const userLat = user?.ubicacion?.coordinates?.[1];

  const [filterType, setFilterType] = useState('Todas');
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [chatNeighbor, setChatNeighbor] = useState(null);

  const [newAlert, setNewAlert] = useState({
    tipo: 'Necesito ayuda',
    categoria: 'salud',
    titulo: '',
    descripcion: ''
  });

  useEffect(() => {
    if (!isEmergencyActive) {
      activateEmergency();
    }
  }, []);

  const handleExitEmergency = () => {
    deactivateEmergency();
    navigate('/');
  };

  // Identificar si la alerta fue creada por el usuario activo
  const esMiAlerta = (alert) => {
    if (!user || !alert) return false;

    const autorId =
      typeof alert.autor === 'object' && alert.autor !== null
        ? alert.autor._id
        : alert.autor;

    if (autorId && user._id && String(autorId) === String(user._id)) {
      return true;
    }

    const miNombre = `${user.nombre || ''} ${user.apellido || ''}`.trim().toLowerCase();
    const contacto = (alert.nombreContacto || '').trim().toLowerCase();
    if (miNombre && contacto && miNombre === contacto) {
      return true;
    }

    return false;
  };

  // Crear la alerta usando EXACTAMENTE la ubicación que AuthContext ya detectó
  const handleCreateAlert = async (e) => {
    e.preventDefault();
    if (!newAlert.titulo.trim() || !newAlert.descripcion.trim()) return;

    // Tomamos la coordenada de AuthContext (GeoJSON [lng, lat])
    const coordsFinales = (userLng && userLat)
      ? [userLng, userLat]
      : [-77.1350, -12.0620];

    await addAlert({
      ...newAlert,
      autor: user?._id || null,
      nombreContacto: user
        ? `${user.nombre} ${user.apellido}`
        : 'Vecino del Barrio',
      ubicacion: {
        type: 'Point',
        coordinates: coordsFinales
      },
      activo: true
    });

    setNewAlert({
      tipo: 'Necesito ayuda',
      categoria: 'salud',
      titulo: '',
      descripcion: ''
    });
    setShowShareModal(false);
  };

  const handleMarcarSolucionado = async (alertId) => {
    if (window.confirm('¿Confirmas que tu alerta SOS ya fue atendida y deseas darla de baja?')) {
      if (resolveAlert) {
        await resolveAlert(alertId);
      }
      if (selectedAlert?._id === alertId) {
        setSelectedAlert(null);
      }
    }
  };

  // Filtrado a 1 km usando el userLat y userLng de AuthContext
  const filteredAlerts = alerts.filter((a) => {
    if (a.activo === false) return false;
    if (filterType !== 'Todas' && a.tipo !== filterType) return false;

    // Las propias alertas nunca se ocultan al autor
    if (esMiAlerta(a)) return true;

    const alertLng = a.ubicacion?.coordinates?.[0];
    const alertLat = a.ubicacion?.coordinates?.[1];

    if (userLat && userLng && alertLat && alertLng) {
      const { metros } = calcularDistanciaInfo(
        userLat,
        userLng,
        alertLat,
        alertLng
      );
      if (metros > RADIO_MAXIMO_SOS) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-red-50/70 text-slate-900 pb-24">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-5">
        {/* Cabecera */}
        <div className="bg-white border-2 border-red-200 rounded-2xl p-4 sm:p-6 mb-6 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-black uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Centro de Respuesta y Soporte Vital Barrial</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                Modo Emergencia / SOS Activo
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                Mostrando alertas comunitarias a menos de 1 km de tu ubicación detectada.
              </p>
            </div>

            <button
              type="button"
              onClick={handleExitEmergency}
              className="h-12 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shrink-0 transition"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>SALIR DEL MODO SOS / TODO SEGURO</span>
            </button>
          </div>

          {/* Marcado telefónico */}
          <div className="mt-5 pt-5 border-t border-slate-100">
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-3">
              📞 Líneas Oficiales de Auxilio a Un Toque (Sin Internet):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <a
                href="tel:105"
                className="h-14 px-4 rounded-xl bg-red-50 hover:bg-red-100 active:scale-[0.99] text-red-950 font-black flex items-center justify-between border border-red-200 shadow-sm transition"
              >
                <div className="flex items-center gap-3">
                  <PhoneCall className="w-6 h-6 text-red-600 shrink-0" />
                  <div>
                    <span className="block text-base leading-none">105</span>
                    <span className="text-xs font-semibold text-red-800">Policía Nacional</span>
                  </div>
                </div>
                <span className="text-xs bg-red-200/60 text-red-900 px-2.5 py-1 rounded-lg">Llamar</span>
              </a>

              <a
                href="tel:116"
                className="h-14 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 active:scale-[0.99] text-amber-950 font-black flex items-center justify-between border border-amber-200 shadow-sm transition"
              >
                <div className="flex items-center gap-3">
                  <PhoneCall className="w-6 h-6 text-amber-600 shrink-0" />
                  <div>
                    <span className="block text-base leading-none">116</span>
                    <span className="text-xs font-semibold text-amber-800">Bomberos</span>
                  </div>
                </div>
                <span className="text-xs bg-amber-200/60 text-amber-900 px-2.5 py-1 rounded-lg">Llamar</span>
              </a>

              <a
                href="tel:106"
                className="h-14 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 active:scale-[0.99] text-rose-950 font-black flex items-center justify-between border border-rose-200 shadow-sm transition"
              >
                <div className="flex items-center gap-3">
                  <PhoneCall className="w-6 h-6 text-rose-600 shrink-0" />
                  <div>
                    <span className="block text-base leading-none">106</span>
                    <span className="text-xs font-semibold text-rose-800">SAMU Ambulancias</span>
                  </div>
                </div>
                <span className="text-xs bg-rose-200/60 text-rose-900 px-2.5 py-1 rounded-lg">Llamar</span>
              </a>
            </div>
          </div>
        </div>

        {/* Filtros + Botón Crear Alerta */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            {['Todas', 'Necesito ayuda', 'Ofrezco ayuda'].map((filtro) => {
              const active = filterType === filtro;
              return (
                <button
                  key={filtro}
                  type="button"
                  onClick={() => setFilterType(filtro)}
                  className={`h-11 px-4 rounded-xl font-extrabold text-xs sm:text-sm border transition ${
                    active
                      ? 'bg-red-600 text-white border-red-600 shadow-sm'
                      : 'bg-white text-slate-700 border-red-200 hover:bg-red-50'
                  }`}
                >
                  {filtro}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="h-11 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 border border-red-500 shadow-md transition"
          >
            <PlusCircle className="w-5 h-5" />
            <span>+ Compartir una alerta</span>
          </button>
        </div>

        {/* Grilla de Alertas */}
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border-2 border-red-200 shadow-sm">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
            <h3 className="font-black text-lg text-slate-900">Sin emergencias activas en tu radio (1 km)</h3>
            <p className="text-sm text-slate-600 mt-1">
              No se han reportado situaciones de auxilio pendientes en tu zona inmediata.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAlerts.map((alert) => {
              const isNeed = alert.tipo === 'Necesito ayuda';
              const propia = esMiAlerta(alert);

              const alertLng = alert.ubicacion?.coordinates?.[0];
              const alertLat = alert.ubicacion?.coordinates?.[1];

              const { texto: distanciaTexto } = calcularDistanciaInfo(
                userLat,
                userLng,
                alertLat,
                alertLng
              );

              return (
                <article
                  key={alert._id}
                  className={`rounded-2xl p-5 border-2 flex flex-col justify-between shadow-sm transition bg-white ${
                    isNeed ? 'border-red-300' : 'border-emerald-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wide border ${
                            isNeed
                              ? 'bg-red-50 text-red-800 border-red-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {isNeed ? '🆘 NECESITO AYUDA' : '🤝 OFREZCO AYUDA'}
                        </span>

                        {propia && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[11px] font-black border border-blue-200 flex items-center gap-1">
                            <UserCheck className="w-3 h-3" /> Tu Alerta
                          </span>
                        )}
                      </div>

                      <span className="text-xs font-bold text-slate-600 flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md">
                        <MapPin className="w-3.5 h-3.5 text-red-600" />
                        {distanciaTexto}
                      </span>
                    </div>

                    <h2 className="font-black text-lg leading-snug mb-2 text-slate-900 break-words">
                      {alert.titulo}
                    </h2>

                    <p className="text-sm text-slate-600 leading-relaxed mb-3 break-words">
                      {alert.descripcion}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {alert.nombreContacto || 'Vecino del Barrio'}
                        </p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Categoría: {alert.categoria || 'general'}</span>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedAlert({
                            ...alert,
                            distanciaCalculada: distanciaTexto,
                            esPropia: propia
                          })
                        }
                        className="h-10 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs flex items-center gap-1.5 shrink-0 transition"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Ver detalle</span>
                      </button>
                    </div>

                    {propia ? (
                      <button
                        type="button"
                        onClick={() => handleMarcarSolucionado(alert._id)}
                        className="w-full h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Marcar como Solucionada / Cerrar</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          const contactName = alert.nombreContacto || 'Vecino en Alerta';
                          setChatNeighbor({
                            nombre: contactName,
                            apellido: '',
                            barrio: user?.barrio || 'Mi Barrio'
                          });
                        }}
                        className="w-full h-9 rounded-xl bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 font-extrabold text-xs flex items-center justify-center gap-1.5 transition"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-red-600" />
                        <span>Coordinar Ayuda con este Vecino</span>
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Compartir Alerta */}
      {showShareModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white text-slate-900 border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xl my-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-black text-lg">Compartir Alerta Barrial Rápida</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tu ubicación detectada será vinculada a la alerta</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="h-11 w-11 rounded-full hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 mb-2">
                  1. ¿Qué deseas reportar?
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {['Necesito ayuda', 'Ofrezco ayuda'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewAlert({ ...newAlert, tipo: t })}
                      className={`h-11 rounded-xl font-black text-xs sm:text-sm border transition ${
                        newAlert.tipo === t
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 mb-2">
                  2. Categoría de Emergencia
                </label>
                <select
                  value={newAlert.categoria}
                  onChange={(e) =>
                    setNewAlert({ ...newAlert, categoria: e.target.value })
                  }
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium"
                >
                  <option value="salud">Salud / Medicamentos / Oxígeno</option>
                  <option value="agua">Agua Potable / Alimentos</option>
                  <option value="electricidad">Electricidad / Generador</option>
                  <option value="refugio">Refugio / Evacuación</option>
                  <option value="general">General / Seguridad</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                  Título Breve
                </label>
                <input
                  type="text"
                  required
                  value={newAlert.titulo}
                  onChange={(e) =>
                    setNewAlert({ ...newAlert, titulo: e.target.value })
                  }
                  placeholder="Ej. Balón de oxígeno o tensiómetro urgente"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                  Descripción y Referencia de Cuadra
                </label>
                <textarea
                  rows={3}
                  required
                  value={newAlert.descripcion}
                  onChange={(e) =>
                    setNewAlert({ ...newAlert, descripcion: e.target.value })
                  }
                  placeholder="Indica tu cuadra o punto de encuentro cercano..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-sm shadow-md transition"
              >
                Publicar Alerta Ahora
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalle */}
      {selectedAlert && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white text-slate-900 border border-slate-200 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 rounded-lg bg-red-100 text-red-800 text-xs font-black uppercase">
                {selectedAlert.tipo} • {selectedAlert.categoria}
              </span>
              <button
                type="button"
                onClick={() => setSelectedAlert(null)}
                className="h-11 w-11 rounded-full hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-xl font-black mb-2 text-slate-900 break-words">
              {selectedAlert.titulo}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4 break-words">
              {selectedAlert.descripcion}
            </p>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1 mb-5">
              <p className="font-bold text-slate-900">
                Reportado por: {selectedAlert.nombreContacto}
              </p>
              <p className="text-slate-600 flex items-center gap-1 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-red-600" />
                <span>Distancia estimada: {selectedAlert.distanciaCalculada || 'Cerca de ti'}</span>
              </p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  const contactName = selectedAlert.nombreContacto || 'Vecino en Alerta';
                  setSelectedAlert(null);
                  setChatNeighbor({
                    nombre: contactName,
                    apellido: '',
                    barrio: user?.barrio || 'Mi Barrio'
                  });
                }}
                className="w-full h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Coordinar Ayuda por Chat</span>
              </button>

              {selectedAlert.esPropia && (
                <button
                  type="button"
                  onClick={() => handleMarcarSolucionado(selectedAlert._id)}
                  className="w-full h-11 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-xs sm:text-sm flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Marcar mi Alerta como Solucionada</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <ChatModal
        isOpen={Boolean(chatNeighbor)}
        onClose={() => setChatNeighbor(null)}
        neighbor={chatNeighbor}
      />
    </div>
  );
};

export default ModoEmergencia;