import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ShieldCheck,
  MapPin,
  MessageCircle,
  ThumbsUp,
  Lock,
  ArrowLeft,
  Edit3,
  Save,
  X,
  Mail,
  Phone,
  CheckCircle2,
  Eye,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEmergencia } from '../context/EmergenciaContext';
import ChatModal from '../components/ChatModal';
import PostDetailModal from '../components/PostDetailModal';

const PerfilPublico = () => {
  const { id } = useParams();
  const { user, posts, updateProfile, endorseNeighborLocal, loading } =
    useAuth();
  const { isEmergencyActive } = useEmergencia();

  const isOwnProfile = Boolean(user && user._id === id);

  const [profile, setProfile] = useState(null);
  const [neighborPosts, setNeighborPosts] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedPostDetail, setSelectedPostDetail] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [editForm, setEditForm] = useState({
    nombre: '',
    apellido: '',
    ciudad: '',
    barrio: '',
    codigoManzana: '',
    telefono: '',
    bio: ''
  });

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (isOwnProfile && user) {
      setProfile({
        _id: user._id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        telefono: user.telefono || '',
        barrio: user.barrio,
        ciudad: user.ciudad || 'Lima',
        codigoManzana: user.codigoManzana || '',
        estadoVerificacion: user.estadoVerificacion || 'pendiente',
        vistoBuenoCount: user.vistoBuenoCount || 12,
        bio:
          user.bio ||
          'Vecino activo comprometido con el bienestar y apoyo mutuo del barrio.'
      });
      setEditForm({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        ciudad: user.ciudad || 'Lima',
        barrio: user.barrio || '',
        codigoManzana: user.codigoManzana || '',
        telefono: user.telefono || '',
        bio:
          user.bio ||
          'Vecino activo comprometido con el bienestar y apoyo mutuo del barrio.'
      });
      setNeighborPosts(posts.filter((p) => p.autor?._id === user._id));
      return;
    }

    const loadProfile = async () => {
      try {
        const res = await axios.get(`${apiUrl}/auth/vecino/${id}`);
        setProfile(res.data.vecino);
        setNeighborPosts(res.data.publicaciones || []);
      } catch (e) {
        const localPosts = posts.filter((p) => p.autor?._id === id);
        if (localPosts.length > 0) {
          setProfile(localPosts[0].autor);
          setNeighborPosts(localPosts);
        } else {
          setProfile({
            _id: id,
            nombre: 'Carlos',
            apellido: 'Mendoza',
            barrio: 'Santa Beatriz',
            ciudad: 'Lima',
            vistoBuenoCount: 28,
            bio: 'Vecino verificado y colaborador activo de la comunidad barrial.'
          });
          setNeighborPosts(posts.slice(0, 2));
        }
      }
    };
    loadProfile();
  }, [id, isOwnProfile, user, posts, apiUrl]);

  if (!profile) return null;

  const initials = `${profile.nombre?.[0] || 'V'}${
    profile.apellido?.[0] || ''
  }`.toUpperCase();

  const handleEndorse = () => {
    endorseNeighborLocal(profile._id);
    setProfile((prev) => ({
      ...prev,
      vistoBuenoCount: (prev.vistoBuenoCount || 1) + 1
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    // Evaluar si el código de manzana ingresado es válido para actualizar estado de verificación
    const codigosValidos = ['MZ-A-2026', 'MZ-B-2026', 'MZ-C-2026', 'URB-SANTA-BEATRIZ'];
    const esVerificado =
      editForm.codigoManzana &&
      codigosValidos.includes(editForm.codigoManzana.trim().toUpperCase());

    const payload = {
      ...editForm,
      estadoVerificacion: esVerificado ? 'verificado' : 'pendiente'
    };

    const res = await updateProfile(payload);
    if (res.success) {
      setProfile((prev) => ({ ...prev, ...payload }));
      setIsEditing(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 pt-5 pb-24">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold mb-4 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver al inicio del barrio</span>
      </Link>

      {savedSuccess && (
        <div className="mb-4 p-3.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>¡Tus datos personales y código de manzana se actualizaron con éxito!</span>
        </div>
      )}

      {/* Tarjeta Principal de Perfil */}
      <div
        className={`rounded-2xl p-5 sm:p-8 border shadow-md mb-6 ${
          isEmergencyActive
            ? 'bg-[#3d101b] border-red-700 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-600 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shrink-0 shadow-md">
              {initials}
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black break-words">
                  {profile.nombre} {profile.apellido}
                </h1>
                {isOwnProfile && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-900 text-white">
                    Mi Cuenta
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>
                    {profile.estadoVerificacion === 'verificado'
                      ? 'Residente Verificado'
                      : 'Vecino Activo'}{' '}
                    ({profile.vistoBuenoCount || 1})
                  </span>
                </span>
              </div>

              <p
                className={`text-xs sm:text-sm font-semibold flex items-center gap-1 ${
                  isEmergencyActive ? 'text-red-200' : 'text-slate-600'
                }`}
              >
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  Barrio {profile.barrio || 'Santa Beatriz'},{' '}
                  {profile.ciudad || 'Lima'}
                </span>
              </p>

              {isOwnProfile && (
                <div className="pt-1 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-medium">
                    <Mail className="w-3.5 h-3.5 text-emerald-600" />
                    {user?.email}
                  </span>
                  {profile.codigoManzana && (
                    <span className="flex items-center gap-1 font-medium text-emerald-700 font-bold">
                      <KeyRound className="w-3.5 h-3.5" />
                      Manzana: {profile.codigoManzana}
                    </span>
                  )}
                  {profile.telefono && (
                    <span className="flex items-center gap-1 font-medium">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      {profile.telefono}
                    </span>
                  )}
                </div>
              )}

              <p
                className={`text-sm leading-relaxed break-words pt-2 ${
                  isEmergencyActive ? 'text-red-100' : 'text-slate-700'
                }`}
              >
                {profile.bio}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
            {isOwnProfile ? (
              <button
                type="button"
                onClick={() => setIsEditing((prev) => !prev)}
                className="h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition"
              >
                {isEditing ? (
                  <>
                    <X className="w-4 h-4" />
                    <span>Cancelar Edición</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4" />
                    <span>Editar Mis Datos</span>
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleEndorse}
                  className={`h-11 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border transition ${
                    isEmergencyActive
                      ? 'border-red-600 bg-red-900/50 text-white hover:bg-red-800'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>Dar Visto Bueno</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsChatOpen(true)}
                  className="h-11 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Mensaje</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Formulario de Edición con Código de Manzana */}
        {isOwnProfile && isEditing && (
          <form
            onSubmit={handleSaveProfile}
            className="mt-6 pt-6 border-t border-slate-200 space-y-4"
          >
            <h3 className="font-extrabold text-base text-emerald-800">
              Actualizar Información de Mi Perfil y Mudanza (Código de Manzana)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={editForm.nombre}
                  onChange={(e) =>
                    setEditForm({ ...editForm, nombre: e.target.value })
                  }
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Apellido
                </label>
                <input
                  type="text"
                  required
                  value={editForm.apellido}
                  onChange={(e) =>
                    setEditForm({ ...editForm, apellido: e.target.value })
                  }
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-slate-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Ciudad
                </label>
                <input
                  type="text"
                  required
                  value={editForm.ciudad}
                  onChange={(e) =>
                    setEditForm({ ...editForm, ciudad: e.target.value })
                  }
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Barrio / Urbanización
                </label>
                <input
                  type="text"
                  required
                  value={editForm.barrio}
                  onChange={(e) =>
                    setEditForm({ ...editForm, barrio: e.target.value })
                  }
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Código de Manzana (Mudanza)
                </label>
                <input
                  type="text"
                  value={editForm.codigoManzana}
                  onChange={(e) =>
                    setEditForm({ ...editForm, codigoManzana: e.target.value })
                  }
                  placeholder="Ej. MZ-B-2026"
                  className="w-full h-11 px-3.5 rounded-xl border border-emerald-300 text-sm text-slate-900 bg-white font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Teléfono (Privado)
                </label>
                <input
                  type="text"
                  value={editForm.telefono}
                  onChange={(e) =>
                    setEditForm({ ...editForm, telefono: e.target.value })
                  }
                  placeholder="Ej. 999888777"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Biografía / Presentación Vecinal
              </label>
              <textarea
                rows={2}
                value={editForm.bio}
                onChange={(e) =>
                  setEditForm({ ...editForm, bio: e.target.value })
                }
                className="w-full p-3 rounded-xl border border-slate-300 text-sm text-slate-900 bg-slate-50"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="h-11 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="h-11 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-md transition"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
              </button>
            </div>
          </form>
        )}

        <div
          className={`mt-5 pt-4 border-t flex items-center gap-2 text-xs ${
            isEmergencyActive
              ? 'border-red-800 text-red-200'
              : 'border-slate-100 text-slate-500'
          }`}
        >
          <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Privacidad Protegida: El correo, teléfono y código de manzana son confidenciales.
          </span>
        </div>
      </div>

      {/* Publicaciones Activas */}
      <h2 className="text-lg font-extrabold mb-3">
        {isOwnProfile
          ? `Mis publicaciones en el barrio (${neighborPosts.length})`
          : `Publicaciones activas de ${profile.nombre} (${neighborPosts.length})`}
      </h2>

      {neighborPosts.length === 0 ? (
        <div className="rounded-2xl p-6 bg-white border border-slate-200 text-slate-600 text-sm">
          Aún no hay publicaciones registradas aquí.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {neighborPosts.map((post) => (
            <div
              key={post._id}
              onClick={() => setSelectedPostDetail(post)}
              className={`cursor-pointer rounded-2xl p-4 sm:p-5 border flex flex-col justify-between transition group ${
                isEmergencyActive
                  ? 'bg-[#3d101b] border-red-800 text-white hover:border-red-400'
                  : 'bg-white border-slate-200 text-slate-900 hover:border-emerald-500 hover:shadow-md'
              }`}
            >
              <div>
                <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase bg-emerald-100 text-emerald-800 mb-2">
                  {post.tipo} • {post.categoria}
                </span>
                <h3 className="font-extrabold text-base mb-1 break-words group-hover:text-emerald-600">
                  {post.titulo}
                </h3>
                <p
                  className={`text-sm mb-3 break-words line-clamp-2 ${
                    isEmergencyActive ? 'text-red-100' : 'text-slate-600'
                  }`}
                >
                  {post.descripcion}
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 mb-2">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver mapa y detalles</span>
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200/20 flex items-center justify-between">
                <span className="font-black text-sm text-emerald-600">
                  {post.precio ? `S/ ${post.precio}.00` : '🤝 Solidario'}
                </span>
                {!isOwnProfile && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsChatOpen(true);
                    }}
                    className="h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Mensaje</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <PostDetailModal
        isOpen={Boolean(selectedPostDetail)}
        onClose={() => setSelectedPostDetail(null)}
        post={selectedPostDetail}
        onOpenChat={() => setIsChatOpen(true)}
        onEndorse={!isOwnProfile ? handleEndorse : null}
      />

      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        neighbor={profile}
      />
    </div>
  );
};

export default PerfilPublico;