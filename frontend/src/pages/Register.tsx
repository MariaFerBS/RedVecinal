import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, LocateFixed } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    ciudad: 'Lima',
    barrio: 'Santa Beatriz',
    bio: '',
    lat: -12.0464,
    lng: -77.0428
  });

  const [geoStatus, setGeoStatus] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('Tu navegador no soporta geolocalización');
      return;
    }
    setGeoStatus('Obteniendo coordenadas de tu cuadra...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        }));
        setGeoStatus('¡Ubicación barrial verificada con éxito!');
      },
      () => {
        setGeoStatus('Usando coordenadas referenciales del barrio.');
      }
    );
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setErrorMsg('');
    const result = await register(formData);
    if (result.success) {
      navigate('/');
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-xl flex items-center justify-center shadow-md">
            RV
          </div>
          <h1 className="mt-3 text-2xl font-extrabold text-slate-900">
            Únete a tu Comunidad Barrial
          </h1>
          <p className="text-sm text-slate-600">
            Conecta con vecinos a menos de 500 metros de distancia
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm"
                  placeholder="Ej. María"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Apellido
                </label>
                <input
                  type="text"
                  required
                  value={formData.apellido}
                  onChange={(e) =>
                    setFormData({ ...formData, apellido: e.target.value })
                  }
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm"
                  placeholder="Ej. Torres"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Ciudad
                </label>
                <input
                  type="text"
                  required
                  value={formData.ciudad}
                  onChange={(e) =>
                    setFormData({ ...formData, ciudad: e.target.value })
                  }
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Barrio / Urbanización
                </label>
                <input
                  type="text"
                  required
                  value={formData.barrio}
                  onChange={(e) =>
                    setFormData({ ...formData, barrio: e.target.value })
                  }
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm"
                  placeholder="Ej. Santa Beatriz"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm"
                placeholder="vecino@correo.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Contraseña (mín. 6 caracteres)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm"
                placeholder="••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Presentación para tus vecinos (Bio)
              </label>
              <textarea
                rows={2}
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                className="w-full p-3 rounded-xl border border-slate-300 text-sm"
                placeholder="Ej. Gasfitero, repostera o vecino dispuesto a colaborar en el barrio..."
              />
            </div>

            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="text-xs text-emerald-900">
                <p className="font-bold">Geolocalización Hiperlocal (500m)</p>
                <p>{geoStatus || 'Conecta con tu radio barrial cercano'}</p>
              </div>
              <button
                type="button"
                onClick={handleDetectLocation}
                className="h-11 px-3 rounded-xl bg-white border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center gap-1.5 shrink-0 hover:bg-emerald-100"
              >
                <LocateFixed className="w-4 h-4" />
                <span>Ubicar mi cuadra</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Registrando...' : 'Crear Cuenta Vecinal'}</span>
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-600">
            ¿Ya tienes cuenta?{' '}
            <Link
              to="/login"
              className="font-bold text-emerald-700 hover:underline"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;