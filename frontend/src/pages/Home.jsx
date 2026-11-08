import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  PlusCircle,
  ThumbsUp,
  MessageCircle,
  Bookmark,
  MapPin,
  Sparkles,
  Wrench,
  Store,
  HeartHandshake,
  CheckCircle2,
  X,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEmergencia } from '../context/EmergenciaContext';
import ChatModal from '../components/ChatModal';
import PostDetailModal from '../components/PostDetailModal';

// SUBCATEGORÍAS EN CASCADA SEGÚN EL TIPO ELEGIDO (Exclusivo para economía y favores cotidianos)
const SUBCATEGORIAS_MAP = {
  servicio: [
    'Gasfitería y Electricidad',
    'Carpintería y Cerrajería',
    'Clases Particulares / Tutorías',
    'Soporte Técnico y Computación',
    'Cuidado de Niños / Adulto Mayor',
    'Limpieza y Jardinería',
    'Costura y Arreglos'
  ],
  emprendimiento: [
    'Comida Casera y Menús',
    'Postres y Repostería',
    'Bodega / Minimarket Barrial',
    'Frutas, Verduras y Agua',
    'Artesanías y Regalos',
    'Ropa y Accesorios',
    'Mascotas'
  ],
  solidario: [
    'Préstamo de Herramientas',
    'Donación de Ropa / Libros',
    'Apoyo Escolar / Tutoría',
    'Movilidad Compartida'
  ]
};

const Home = () => {
  const {
    user,
    posts,
    savedPostIds,
    createNewPost,
    toggleSavePost,
    endorseNeighborLocal
  } = useAuth();
  const { isEmergencyActive, activateEmergency, deactivateEmergency } =
    useEmergencia();

  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const isSavedView = queryParams.get('filtro') === 'guardados';

  const [selectedTab, setSelectedTab] = useState('todos');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [selectedPostDetail, setSelectedPostDetail] = useState(null);

  const [newPost, setNewPost] = useState({
    tipo: 'servicio',
    categoria: SUBCATEGORIAS_MAP.servicio[0],
    titulo: '',
    descripcion: '',
    precio: '',
    esUrgente: false
  });

  const handleTypeChange = (nuevoTipo) => {
    const listaSubcats = SUBCATEGORIAS_MAP[nuevoTipo] || SUBCATEGORIAS_MAP.servicio;
    setNewPost({
      ...newPost,
      tipo: nuevoTipo,
      categoria: listaSubcats[0],
      precio: nuevoTipo === 'solidario' ? '' : newPost.precio
    });
  };

  // FILTRO ESTRICTO: El Home SOLO muestra economía barrial, oficios, emprendimientos y favores cotidianos. 
  // Excluimos cualquier mención a urgencias vitales, oxígeno o insulina para mantenerlas confinadas en el Panel SOS.
  const filteredPosts = posts.filter((post) => {
    const textoCompleto = `${post.titulo} ${post.descripcion}`.toLowerCase();
    const esEmergenciaVital =
      textoCompleto.includes('urgente') ||
      textoCompleto.includes('oxígeno') ||
      textoCompleto.includes('insulina') ||
      textoCompleto.includes('emergencia');

    if (esEmergenciaVital) return false;
    if (isSavedView && !savedPostIds.includes(post._id)) return false;
    if (selectedTab !== 'todos' && post.tipo !== selectedTab) return false;
    return true;
  });

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.titulo.trim() || !newPost.descripcion.trim()) return;
    await createNewPost(newPost);
    setNewPost({
      tipo: 'servicio',
      categoria: SUBCATEGORIAS_MAP.servicio[0],
      titulo: '',
      descripcion: '',
      precio: '',
      esUrgente: false
    });
    setShowCreateModal(false);
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
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 pt-5 pb-24">
      {/* Hero Contextual (Pantalla Normal / Verde) */}
      <div
        className={`rounded-2xl p-4 sm:p-6 mb-6 border shadow-md transition-colors ${
          isEmergencyActive
            ? 'bg-[#3d101b] border-red-500 text-white'
            : 'bg-gradient-to-r from-emerald-700 to-teal-700 border-emerald-600 text-white'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 backdrop-blur-sm">
              <MapPin className="w-3.5 h-3.5" />
              <span>
                Barrio {user?.barrio || 'Santa Beatriz'} • Radio activo 500m
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black leading-tight break-words">
              {isEmergencyActive
                ? '🚨 MODO EMERGENCIA ACTIVO EN TU BARRIO'
                : `¡Hola, ${user?.nombre}! Conecta y apoya a tus vecinos`}
            </h1>
            <p className="text-xs sm:text-sm opacity-95 leading-relaxed">
              {isEmergencyActive
                ? 'La comunidad está en alerta. Revisa el panel SOS.'
                : 'Descubre oficios verificados con Visto Bueno Vecinal, emprendimientos caseros y cadena de favores cotidianos a pocas cuadras.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="h-11 px-4 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4 text-emerald-700" />
              <span>Publicar en el Barrio</span>
            </button>

            {!isEmergencyActive ? (
              <button
                type="button"
                onClick={() => {
                  activateEmergency();
                  navigate('/emergencia');
                }}
                className="h-11 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Activar SOS</span>
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                <Link
                  to="/emergencia"
                  className="h-11 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Ir al Panel SOS</span>
                </Link>
                <button
                  type="button"
                  onClick={deactivateEmergency}
                  className="h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Desactivar SOS</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pestañas de Filtro */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {[
            { id: 'todos', label: 'Todo el Barrio', icon: Sparkles },
            { id: 'servicio', label: 'Oficios / Servicios', icon: Wrench },
            { id: 'emprendimiento', label: 'Emprendimientos', icon: Store },
            { id: 'solidario', label: 'Cadena de Favores', icon: HeartHandshake }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = selectedTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedTab(tab.id)}
                className={`h-11 px-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 border transition ${
                  isEmergencyActive
                    ? active
                      ? 'bg-red-600 text-white border-red-500'
                      : 'bg-[#3d101b] text-red-100 border-red-900 hover:bg-red-900/50'
                    : active
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <Link
          to="/mi-barrio"
          className={`h-11 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 border transition ${
            isEmergencyActive
              ? 'bg-red-900/50 border-red-700 text-white hover:bg-red-900'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Ver Mapa Interactivo (500m)</span>
        </Link>
      </div>

      {/* Grilla de Tarjetas Vecinales (Solo economía normal y favores cotidianos) */}
      {filteredPosts.length === 0 ? (
        <div
          className={`rounded-2xl p-8 text-center border ${
            isEmergencyActive
              ? 'bg-[#3d101b] border-red-800 text-red-100'
              : 'bg-white border-slate-200 text-slate-600'
          }`}
        >
          <p className="font-bold text-base">
            No se encontraron publicaciones en este filtro.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPosts.map((post) => {
            const isSaved = savedPostIds.includes(post._id);
            return (
              <article
                key={post._id}
                onClick={() => setSelectedPostDetail(post)}
                className={`cursor-pointer rounded-2xl p-4 sm:p-5 border flex flex-col justify-between transition shadow-sm group ${
                  isEmergencyActive
                    ? 'bg-[#3d101b] border-red-800 text-white hover:border-red-400'
                    : 'bg-white border-slate-200 text-slate-900 hover:border-emerald-500 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wide border ${getBadgeStyle(
                        post.tipo
                      )}`}
                    >
                      {post.tipo} • {post.categoria}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSavePost(post._id);
                      }}
                      aria-label="Guardar publicación"
                      className={`h-10 w-10 rounded-xl flex items-center justify-center border transition shrink-0 ${
                        isSaved
                          ? 'bg-amber-100 border-amber-300 text-amber-700'
                          : isEmergencyActive
                          ? 'border-red-700 text-red-200 hover:bg-red-900'
                          : 'border-slate-200 text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      <Bookmark
                        className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`}
                      />
                    </button>
                  </div>

                  <h2 className="font-extrabold text-base sm:text-lg leading-snug break-words mb-2 group-hover:text-emerald-600 transition-colors">
                    {post.titulo}
                  </h2>
                  <p
                    className={`text-sm leading-relaxed break-words line-clamp-3 mb-3 ${
                      isEmergencyActive ? 'text-red-100' : 'text-slate-600'
                    }`}
                  >
                    {post.descripcion}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/25 space-y-3">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-bold">
                      {post.precio ? (
                        <span
                          className={
                            isEmergencyActive
                              ? 'text-emerald-300 text-base font-black'
                              : 'text-emerald-700 text-base font-black'
                          }
                        >
                          S/ {post.precio}.00
                        </span>
                      ) : (
                        <span className="text-amber-500 font-extrabold">
                          🤝 Apoyo Solidario
                        </span>
                      )}
                    </span>
                    <span
                      className={`text-xs flex items-center gap-1 ${
                        isEmergencyActive ? 'text-red-200' : 'text-slate-500'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" />A menos de 300m
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <Link
                      to={`/vecino/${post.autor?._id || 'vecino_1'}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2.5 min-w-0 group"
                    >
                      <div className="w-9 h-9 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {post.autor?.nombre?.[0] || 'V'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs sm:text-sm truncate group-hover:underline">
                          {post.autor?.nombre} {post.autor?.apellido}
                        </p>
                        <p
                          className={`text-[11px] truncate ${
                            isEmergencyActive
                              ? 'text-emerald-300'
                              : 'text-emerald-700'
                          } font-semibold`}
                        >
                          ✓ {post.autor?.vistoBuenoCount || 1} Vistos Buenos
                        </p>
                      </div>
                    </Link>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          endorseNeighborLocal(post.autor?._id);
                        }}
                        title="Dar Visto Bueno Vecinal"
                        className={`h-11 px-3 rounded-xl border text-xs font-bold flex items-center gap-1 transition ${
                          isEmergencyActive
                            ? 'border-red-700 bg-red-900/50 text-white hover:bg-red-800'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Avalar</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveChat({
                            neighbor: post.autor,
                            postTitle: post.titulo
                          });
                        }}
                        className="h-11 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Mensaje</span>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal para Crear Publicación en Cascada */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6 my-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                <span>Nueva Publicación en {user?.barrio}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="h-11 w-11 rounded-full hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  1. Tipo de Publicación
                </label>
                <select
                  value={newPost.tipo}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm bg-white font-semibold"
                >
                  <option value="servicio">Oficio / Servicio Profesional</option>
                  <option value="emprendimiento">Emprendimiento Local</option>
                  <option value="solidario">Cadena de Favores / Solidario</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  2. Subcategoría Específica
                </label>
                <select
                  value={newPost.categoria}
                  onChange={(e) =>
                    setNewPost({ ...newPost, categoria: e.target.value })
                  }
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm bg-white font-medium"
                >
                  {(
                    SUBCATEGORIAS_MAP[newPost.tipo] ||
                    SUBCATEGORIAS_MAP.servicio
                  ).map((subcat) => (
                    <option key={subcat} value={subcat}>
                      {subcat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  3. Título del Anuncio
                </label>
                <input
                  type="text"
                  required
                  value={newPost.titulo}
                  onChange={(e) =>
                    setNewPost({ ...newPost, titulo: e.target.value })
                  }
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm"
                  placeholder="Ej. Venta de agua purificada y hielo en cubos"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  4. Descripción y Cobertura
                </label>
                <textarea
                  rows={3}
                  required
                  value={newPost.descripcion}
                  onChange={(e) =>
                    setNewPost({ ...newPost, descripcion: e.target.value })
                  }
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm"
                  placeholder="Detalla precios, horarios o cuadras de entrega..."
                />
              </div>

              {newPost.tipo !== 'solidario' && (
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Precio Referencial en Soles (Opcional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newPost.precio}
                    onChange={(e) =>
                      setNewPost({ ...newPost, precio: e.target.value })
                    }
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm"
                    placeholder="Ej. 10"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition"
              >
                Publicar en el Barrio
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalle */}
      <PostDetailModal
        isOpen={Boolean(selectedPostDetail)}
        onClose={() => setSelectedPostDetail(null)}
        post={selectedPostDetail}
        onOpenChat={(chatData) => setActiveChat(chatData)}
        onEndorse={(neighborId) => endorseNeighborLocal(neighborId)}
      />

      {/* Modal de Chat Interno */}
      <ChatModal
        isOpen={Boolean(activeChat)}
        onClose={() => setActiveChat(null)}
        neighbor={activeChat?.neighbor}
        postTitle={activeChat?.postTitle}
      />
    </div>
  );
};

export default Home;