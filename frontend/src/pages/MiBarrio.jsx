import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  ArrowLeft,
  ShieldAlert,
  Wrench,
  Store,
  HeartHandshake,
  AlertOctagon,
  MessageCircle,
  Eye,
  Star,
  ThumbsUp,
  X,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEmergencia } from '../context/EmergenciaContext';
import ChatModal from '../components/ChatModal';
import PostDetailModal from '../components/PostDetailModal';

// Solucionar íconos por defecto de Leaflet en Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

// Pines personalizados para el Mapa
const pinServicio = L.divIcon({
  className: 'custom-map-pin',
  html: `<div style="background-color:#059669;width:32px;height:32px;border-radius:9999px;border:3px solid #ffffff;box-shadow:0 4px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:14px;font-weight:900;">🔧</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -30]
});

const pinEmprendimiento = L.divIcon({
  className: 'custom-map-pin',
  html: `<div style="background-color:#2563eb;width:32px;height:32px;border-radius:9999px;border:3px solid #ffffff;box-shadow:0 4px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:14px;font-weight:900;">🛒</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -30]
});

const pinSolidario = L.divIcon({
  className: 'custom-map-pin',
  html: `<div style="background-color:#d97706;width:32px;height:32px;border-radius:9999px;border:3px solid #ffffff;box-shadow:0 4px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:14px;font-weight:900;">🤝</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -30]
});

const pinSosEmergencia = L.divIcon({
  className: 'custom-map-pin-sos',
  html: `<div style="background-color:#dc2626;width:36px;height:36px;border-radius:9999px;border:3px solid #ffffff;box-shadow:0 4px 14px rgba(220,38,38,0.6);display:flex;align-items:center;justify-content:center;color:white;font-size:16px;font-weight:900;animation:pulse 1.5s infinite;">🚨</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -32]
});

// Componente para reubicar automáticamente la cámara del mapa
function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 15);
      map.invalidateSize();
    }
  }, [lat, lng, map]);
  return null;
}

const MiBarrio = () => {
  const { user, posts, endorseNeighborLocal } = useAuth();
  const { isEmergencyActive, alerts } = useEmergencia();

  const [filterMap, setFilterMap] = useState('todos');
  const [selectedMapItem, setSelectedMapItem] = useState(null);
  const [selectedPostModal, setSelectedPostModal] = useState(null);
  const [activeChat, setActiveChat] = useState(null);

  // Coordenadas dinámicas basadas en el usuario logueado o fallback neutral
  const centerLat = user?.ubicacion?.coordinates?.[1] ?? -12.0565;
  const centerLng = user?.ubicacion?.coordinates?.[0] ?? -77.1186;

  const getPinIcon = (tipo) => {
    switch (tipo) {
      case 'servicio':
        return pinServicio;
      case 'emprendimiento':
        return pinEmprendimiento;
      case 'solidario':
        return pinSolidario;
      case 'sos':
        return pinSosEmergencia;
      default:
        return pinServicio;
    }
  };

  const getMapItems = () => {
    const items = [];

    if (filterMap === 'todos' || filterMap !== 'sos') {
      posts.forEach((p) => {
        if (filterMap === 'todos' || p.tipo === filterMap) {
          const lat = p.ubicacion?.coordinates?.[1] || centerLat + (Math.random() - 0.5) * 0.005;
          const lng = p.ubicacion?.coordinates?.[0] || centerLng + (Math.random() - 0.5) * 0.005;
          items.push({
            ...p,
            mapType: p.tipo,
            lat,
            lng
          });
        }
      });
    }

    if (filterMap === 'todos' || filterMap === 'sos') {
      (alerts || []).forEach((a) => {
        const lat = a.ubicacion?.coordinates?.[1] || centerLat + (Math.random() - 0.5) * 0.005;
        const lng = a.ubicacion?.coordinates?.[0] || centerLng + (Math.random() - 0.5) * 0.005;
        items.push({
          _id: a._id,
          tipo: 'sos',
          titulo: a.titulo,
          descripcion: a.descripcion,
          categoria: a.categoria,
          precio: null,
          autor: {
            _id: a.autor || 'sos_user',
            nombre: a.nombreContacto || 'Vecino en Emergencia',
            apellido: '',
            barrio: user?.barrio || user?.ciudad || 'Mi Barrio',
            vistoBuenoCount: 1
          },
          mapType: 'sos',
          lat,
          lng
        });
      });
    }

    return items;
  };

  const mapItems = getMapItems();

  const getBadgeStyle = (tipo) => {
    switch (tipo) {
      case 'servicio':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'emprendimiento':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'solidario':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'sos':
        return 'bg-red-600 text-white border-red-500';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 pt-5 pb-24">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold mb-4 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a publicaciones del barrio</span>
      </Link>

      <div
        className={`rounded-2xl p-5 sm:p-6 mb-6 border shadow-md ${
          isEmergencyActive
            ? 'bg-[#3d101b] border-red-700 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>Geolocalización Hiperlocal</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Mapa Interactivo del Barrio ({user?.barrio || user?.ciudad || 'Mi Barrio'})
            </h1>
            <p className="text-xs sm:text-sm opacity-85">
              Haz clic en cualquier pin del mapa para ver la información detallada abajo.
            </p>
          </div>

          {/* Filtros del Mapa */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'todos', label: 'Todo en el Mapa' },
              { id: 'sos', label: '🚨 Alertas SOS' },
              { id: 'servicio', label: '🔧 Oficios' },
              { id: 'emprendimiento', label: '🛒 Emprendimientos' },
              { id: 'solidario', label: '🤝 Favores' }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setFilterMap(f.id);
                  setSelectedMapItem(null);
                }}
                className={`h-10 px-3 rounded-xl font-bold text-xs transition ${
                  filterMap === f.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contenedor del Mapa Leaflet */}
        <div className="mt-5 w-full h-[430px] sm:h-[480px] rounded-2xl overflow-hidden border-2 border-emerald-600/30 shadow-inner relative z-10">
          <MapContainer
            center={[centerLat, centerLng]}
            zoom={15}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <RecenterMap lat={centerLat} lng={centerLng} />

            {mapItems.map((item) => (
              <Marker
                key={item._id}
                position={[item.lat, item.lng]}
                icon={getPinIcon(item.mapType)}
                eventHandlers={{
                  click: () => {
                    setSelectedMapItem(item);
                  }
                }}
              />
            ))}
          </MapContainer>
        </div>

        {/* TARJETA INFORMATIVA DESPLEGABLE EN LA PARTE INFERIOR DEL MAPA */}
        {selectedMapItem && (
          <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-white text-slate-900 border-2 border-emerald-500 shadow-xl relative animate-fadeIn">
            <button
              type="button"
              onClick={() => setSelectedMapItem(null)}
              className="absolute top-3 right-3 h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
              aria-label="Cerrar detalle"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 pr-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-3 py-0.5 rounded-lg text-xs font-black uppercase tracking-wide border ${getBadgeStyle(
                      selectedMapItem.mapType
                    )}`}
                  >
                    {selectedMapItem.mapType === 'sos'
                      ? '🚨 URGENCIA VITAL / SOS'
                      : `${selectedMapItem.tipo} • ${selectedMapItem.categoria}`}
                  </span>
                  {selectedMapItem.precio && (
                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-black text-xs">
                      S/ {selectedMapItem.precio}.00
                    </span>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug break-words">
                  {selectedMapItem.titulo}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed break-words line-clamp-2">
                  {selectedMapItem.descripcion}
                </p>

                <div className="flex items-center gap-2 pt-1 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1 font-bold text-slate-800">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    {selectedMapItem.autor?.nombre} {selectedMapItem.autor?.apellido}
                  </span>
                  <span>•</span>
                  <span className="text-emerald-700 font-bold">
                    ✓ {selectedMapItem.autor?.vistoBuenoCount || 1} Vistos Buenos
                  </span>
                </div>
              </div>

              {/* Botones de Acción Rápida */}
              <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200">
                {selectedMapItem.mapType !== 'sos' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => endorseNeighborLocal(selectedMapItem.autor?._id)}
                      className="h-11 px-3.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1 transition"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>Avalar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setActiveChat({
                          neighbor: selectedMapItem.autor,
                          postTitle: selectedMapItem.titulo
                        })
                      }
                      className="h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow transition"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Chat</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPostModal(selectedMapItem)}
                      className="h-11 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow transition"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Ver Más</span>
                    </button>
                  </>
                ) : (
                  <Link
                    to="/emergencia"
                    className="h-11 px-5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg transition"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Ir al Panel SOS</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <PostDetailModal
        isOpen={Boolean(selectedPostModal)}
        onClose={() => setSelectedPostModal(null)}
        post={selectedPostModal}
        onOpenChat={(chatData) => setActiveChat(chatData)}
        onEndorse={(neighborId) => endorseNeighborLocal(neighborId)}
      />

      <ChatModal
        isOpen={Boolean(activeChat)}
        onClose={() => setActiveChat(null)}
        neighbor={activeChat?.neighbor}
        postTitle={activeChat?.postTitle}
      />
    </div>
  );
};

export default MiBarrio;