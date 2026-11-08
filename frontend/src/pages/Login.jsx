import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, LogIn, MapPin, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('vecino@redvecinal.pe');
  const [password, setPassword] = useState('123456');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const result = await login(email, password);
    if (result.success) {
      navigate('/');
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-600 text-white font-black text-2xl flex items-center justify-center shadow-lg">
          RV
        </div>
        <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900">
          Bienvenido a RedVecinal
        </h1>
        <p className="mt-1 text-sm text-slate-600 flex items-center justify-center gap-1">
          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Economía barrial a 500m y soporte vital ante emergencias</span>
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-4 sm:px-8 shadow-xl rounded-2xl border border-slate-200">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                placeholder="tu@correo.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                placeholder="••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Ingresando...' : 'Ingresar a mi Barrio'}</span>
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-slate-200 flex flex-col gap-3">
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Modo Demo pre-cargado: puedes pulsar <strong>Ingresar</strong> directamente.
              </span>
            </div>

            <p className="text-center text-sm text-slate-600">
              ¿Nuevo en el vecindario?{' '}
              <Link
                to="/register"
                className="font-bold text-emerald-700 hover:underline"
              >
                Regístrate gratis aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Acceso directo de emergencia sin login para crisis */}
        <div className="mt-4 bg-red-950 text-white p-4 rounded-2xl border border-red-700 flex items-center justify-between gap-3">
          <div className="text-xs">
            <p className="font-bold text-red-200 uppercase">¿Emergencia en curso?</p>
            <p className="text-red-100">Líneas de auxilio 105 / 116 / 106 directas</p>
          </div>
          <a
            href="tel:105"
            className="h-11 px-4 rounded-xl bg-red-600 hover:bg-red-500 font-black text-xs flex items-center gap-1.5 shrink-0"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>LLAMAR 105</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;