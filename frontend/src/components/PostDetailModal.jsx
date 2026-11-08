import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  X,
  MapPin,
  ShieldCheck,
  ThumbsUp,
  MessageCircle,
  Calendar,
  Tag,
  User,
  Star,
  Send,
  MessageSquare,
  HeartHandshake,
  Navigation
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Solución a íconos por defecto de Leaflet en Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

const detailPinIcon = L.divIcon({
  className: 'custom-detail-pin',
  html: `<div style="background-color:#059669;width:34px;height:34px;border-radius:9999px;border:3px solid #ffffff;box-shadow:0 4px 12px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-size:16px;">📍</div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -32]
});

// Componente para recentrar y forzar el repintado exacto dentro del modal
function RecenterModalMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      // Dos llamadas para evitar parpadeos grises mientras termina la animación del modal
      map.invalidateSize();
      map.setView([lat, lng], 16);

      const timer = setTimeout(() => {
        map.invalidateSize();
        map.setView([lat, lng], 16);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [lat, lng, map]);
  return null;
}

// Cálculo geodésico Haversine
const calcularDistanciaTexto = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371e3;
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
  return metros < 1000 ? `a ${metros} m de ti` : `a ${(metros / 1000).toFixed(1)} km de ti`;
};

const PostDetailModal = ({
  isOpen,
  onClose,
  post,
  onOpenChat,
  onEndorse
}) => {
  const { posts, addCommentToPost, user } = useAuth();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !post) return null;

  const currentPost = posts.find((p) => p._id === post._id) || post;
  const comentarios = currentPost.comentarios || [];
  const isSolidario = currentPost.tipo === 'solidario';

  const averageRating =
    comentarios.length > 0 && !isSolidario
      ? (
          comentarios.reduce((acc, c) => acc + (Number(c.estrellas) || 5), 0) /
          comentarios.length
        ).toFixed(1)
      : '5.0';

  // Coordenadas del usuario activo con fallback a Huacho (Los Ángeles)
  const userLng = user?.ubicacion?.coordinates?.[0] ?? -77.59595;
  const userLat = user?.ubicacion?.coordinates?.[1] ?? -11.10408;

  // Coordenadas de la publicación seleccionada
  const lng = currentPost.ubicacion?.coordinates?.[0] ?? userLng;
  const lat = currentPost.ubicacion?.coordinates?.[1] ?? userLat;

  // Distancia calculada en tiempo real hacia la publicación
  const distanciaCalculada = calcularDistanciaTexto(userLat, userLng, lat, lng);

  const formattedDate = currentPost.createdAt
    ? new Date(currentPost.createdAt).toLocaleDateString('es-PE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : 'Reciente';

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmitting(true);
      if (addCommentToPost) {
        await addCommentToPost(currentPost._id, {
          estrellas: isSolidario ? 5 : rating,
          texto: commentText,
          autorNombre: user ? `${user.nombre} ${user.apellido}` : 'Vecino',
          autorBarrio: user?.barrio || 'Los Ángeles'
        });
      }
      setCommentText('');
      setRating(5);
    } catch (err) {
      console.error('Error al agregar comentario:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getBadgeStyle = (tipo) => {
    switch (tipo) {
      case 'servicio':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'emprendimiento':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'solidario':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-3 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wide border ${getBadgeStyle(
                currentPost.tipo
              )}`}
            >
              {currentPost.tipo}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
              <Tag className="w-3.5 h-3.5 text-emerald-600" />
              {currentPost.categoria}
            </span>
            {!isSolidario && (
              <span className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                {averageRating} ({comentarios.length})
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-10 w-10 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-600 transition shrink-0"
            aria-label="Cerrar detalle"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido con Scroll */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Título, Precio y Distancia */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formattedDate}
                </span>
                {distanciaCalculada && (
                  <span className="font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                    {distanciaCalculada}
                  </span>
                )}
              </div>

              {currentPost.precio ? (
                <span className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-black text-base">
                  S/ {currentPost.precio}.00
                </span>
              ) : (
                <span className="px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-extrabold text-xs">
                  🤝 Apoyo Solidario / Gratuito
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug break-words">
              {currentPost.titulo}
            </h2>
          </div>

          {/* Descripción */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
              Descripción e Información Esencial
            </h3>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed break-words whitespace-pre-line">
              {currentPost.descripcion}
            </p>
          </div>

          {/* Mapa de Ubicación del Post (Huacho) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Ubicación en el Barrio</span>
              </h3>
              <span className="text-xs font-semibold text-emerald-700">
                {currentPost.autor?.barrio || 'Los Ángeles'}, {currentPost.autor?.ciudad || 'Huacho'}
              </span>
            </div>

            <div className="w-full h-48 sm:h-56 rounded-xl overflow-hidden border-2 border-emerald-600/30 shadow-inner relative z-10">
              <MapContainer
                center={[lat, lng]}
                zoom={16}
                scrollWheelZoom={false}
                className="w-full h-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <RecenterModalMap lat={lat} lng={lng} />
                <Marker position={[lat, lng]} icon={detailPinIcon}>
                  <Popup>
                    <div className="text-xs font-bold text-slate-900">
                      {currentPost.titulo}
                      <span className="block font-normal text-slate-600">
                        Vecino: {currentPost.autor?.nombre}{' '}
                        {currentPost.autor?.apellido}
                      </span>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>

          {/* Tarjeta del Vecino Autor */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white font-black text-base flex items-center justify-center shrink-0 shadow-sm">
                {currentPost.autor?.nombre?.[0] || 'V'}
                {currentPost.autor?.apellido?.[0] || ''}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
                    {currentPost.autor?.nombre} {currentPost.autor?.apellido}
                  </p>
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                </div>
                <p className="text-xs text-emerald-800 font-semibold">
                  ✓ {currentPost.autor?.vistoBuenoCount || 1} Vistos Buenos Vecinales
                </p>
              </div>
            </div>

            <Link
              to={`/vecino/${currentPost.autor?._id || 'vecino_1'}`}
              onClick={onClose}
              className="h-10 px-3.5 rounded-xl bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 transition"
            >
              <User className="w-3.5 h-3.5" />
              <span>Ver Perfil</span>
            </Link>
          </div>

          {/* Sección de Reseñas / Comentarios */}
          {!isSolidario ? (
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Referencias y Estrellas ({comentarios.length})</span>
                </h3>
                <div className="flex items-center gap-1 text-amber-500 font-black text-sm">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                  <span>{averageRating} / 5.0</span>
                </div>
              </div>

              <form
                onSubmit={handleCommentSubmit}
                className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-700">
                    Califica este servicio o emprendimiento:
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((starValue) => {
                      const isFilled = starValue <= (hoverRating || rating);
                      return (
                        <button
                          key={starValue}
                          type="button"
                          onClick={() => setRating(starValue)}
                          onMouseEnter={() => setHoverRating(starValue)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 rounded-lg hover:bg-amber-100/60 transition"
                          aria-label={`Calificar con ${starValue} estrellas`}
                        >
                          <Star
                            className={`w-5 h-5 transition ${
                              isFilled
                                ? 'fill-amber-400 text-amber-500 scale-110'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      );
                    })}
                    <span className="ml-1 text-xs font-extrabold text-amber-700">
                      {rating} ★
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Escribe tu recomendación o experiencia..."
                    className="flex-1 h-11 px-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-sm transition disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Enviando...' : 'Comentar'}</span>
                  </button>
                </div>
              </form>

              {comentarios.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-2">
                  Aún no hay reseñas. ¡Sé el primer vecino en dejar tu calificación!
                </p>
              ) : (
                <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                  {comentarios.map((c, index) => (
                    <div
                      key={c._id || index}
                      className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-slate-900">
                          {c.autorNombre || 'Vecino'}{' '}
                          <span className="font-normal text-slate-500">
                            • {c.autorBarrio || 'Los Ángeles'}
                          </span>
                        </span>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= (c.estrellas || 5)
                                  ? 'fill-amber-400 text-amber-500'
                                  : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed break-words">
                        {c.texto}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <div className="flex items-center gap-2 text-amber-800">
                <HeartHandshake className="w-5 h-5 text-amber-600 shrink-0" />
                <h3 className="text-sm font-extrabold uppercase tracking-wider">
                  Coordinación y Apoyo Solidario ({comentarios.length})
                </h3>
              </div>

              <form
                onSubmit={handleCommentSubmit}
                className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200 space-y-2.5"
              >
                <p className="text-xs font-bold text-amber-900">
                  Deja un mensaje de agradecimiento, coordinación o apoyo solidario a este vecino:
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Ej. Muchas gracias, ¿podemos coordinar la entrega por chat?"
                    className="flex-1 h-11 px-3.5 rounded-xl border border-amber-300 text-xs sm:text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-11 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-sm transition disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Enviando...' : 'Enviar'}</span>
                  </button>
                </div>
              </form>

              {comentarios.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-2">
                  Aún no hay mensajes solidarios. ¡Sé el primero en ofrecer tu apoyo a este vecino!
                </p>
              ) : (
                <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                  {comentarios.map((c, index) => (
                    <div
                      key={c._id || index}
                      className="p-3 rounded-xl bg-amber-50/40 border border-amber-200/70 shadow-sm space-y-1"
                    >
                      <span className="font-bold text-xs text-slate-900 block">
                        {c.autorNombre || 'Vecino'}{' '}
                        <span className="font-normal text-slate-500">
                          • {c.autorBarrio || 'Los Ángeles'}
                        </span>
                      </span>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed break-words">
                        {c.texto}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pie de Acciones Directas */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          {onEndorse && (
            <button
              type="button"
              onClick={() => onEndorse(currentPost.autor?._id)}
              className="h-11 px-4 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>Avalar Vecino</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenChat({
                neighbor: currentPost.autor,
                postTitle: currentPost.titulo
              });
            }}
            className="flex-1 h-11 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Contactar por Chat Interno</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostDetailModal;