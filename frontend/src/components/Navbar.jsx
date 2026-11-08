import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Home,
  Map,
  Bookmark,
  User,
  HelpCircle,
  LogOut,
  Menu,
  X,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEmergencia } from '../context/EmergenciaContext';

const Navbar = ({ onOpenTutorial }) => {
  const { user, logout } = useAuth();
  const { isEmergencyActive, activateEmergency, deactivateEmergency } =
    useEmergencia();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const handleTriggerSOS = () => {
    activateEmergency();
    setMobileMenuOpen(false);
    navigate('/emergencia');
  };

  const handleExitSOS = () => {
    deactivateEmergency();
    setMobileMenuOpen(false);
    if (location.pathname === '/emergencia') {
      navigate('/');
    }
  };

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Inicio', path: '/', icon: Home },
    { name: 'Mi barrio', path: '/mi-barrio', icon: Map },
    { name: 'Guardados', path: '/?filtro=guardados', icon: Bookmark },
    { name: 'Mi perfil', path: `/vecino/${user._id}`, icon: User }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white border-b border-slate-200 text-slate-900 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo */}
          <Link
            to={isEmergencyActive ? '/emergencia' : '/'}
            className="flex items-center gap-2 font-black text-lg sm:text-xl tracking-tight shrink-0"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-white shadow-sm ${isEmergencyActive ? 'bg-red-600' : 'bg-emerald-600'}`}>
              RV
            </div>
            <div className="flex flex-col">
              <span className="leading-none">RedVecinal</span>
              <span className={`text-[10px] font-semibold ${isEmergencyActive ? 'text-red-600 font-bold' : 'text-emerald-700'}`}>
                {isEmergencyActive ? 'MÓDULO DE CRISIS SOS' : user.barrio || 'Tu Barrio'}
              </span>
            </div>
          </Link>

          {/* Enlaces Desktop */}
          {!isEmergencyActive ? (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname + location.search === item.path ||
                  (item.path === '/' &&
                    location.pathname === '/' &&
                    !location.search);
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`h-11 px-3.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          ) : (
            <div className="hidden md:flex items-center text-xs font-bold text-red-800 bg-red-50 px-4 py-2 rounded-xl border border-red-200">
              🔒 Pestañas comerciales bloqueadas en zona de crisis.
            </div>
          )}

          {/* Acciones Derecha */}
          <div className="flex items-center gap-2">
            {!isEmergencyActive && (
              <button
                type="button"
                onClick={onOpenTutorial}
                title="Ver tutorial"
                className="h-11 w-11 rounded-xl flex items-center justify-center border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition shrink-0"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            )}

            {!isEmergencyActive ? (
              <button
                type="button"
                onClick={handleTriggerSOS}
                className="h-11 px-3.5 sm:px-4 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-red-600/20 transition shrink-0"
              >
                <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>MODO SOS</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleExitSOS}
                className="h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Desactivar SOS</span>
              </button>
            )}

            {/* Menú Hamburguesa Celular */}
            {!isEmergencyActive && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="md:hidden h-11 w-11 rounded-xl flex items-center justify-center border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition shrink-0"
                aria-label="Menú de navegación"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}

            {!isEmergencyActive && (
              <button
                type="button"
                onClick={handleLogout}
                title="Cerrar sesión"
                className="hidden md:flex h-11 w-11 rounded-xl items-center justify-center border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Menú Desplegable Celular */}
        {mobileMenuOpen && !isEmergencyActive && (
          <div className="md:hidden py-3 border-t border-slate-200 space-y-1.5 bg-white shadow-lg rounded-b-2xl px-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname + location.search === item.path ||
                (item.path === '/' &&
                  location.pathname === '/' &&
                  !location.search);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`h-12 px-4 rounded-xl font-bold text-sm flex items-center gap-3 transition ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            <button
              type="button"
              onClick={handleLogout}
              className="w-full h-12 px-4 rounded-xl font-bold text-sm flex items-center gap-3 text-red-600 hover:bg-red-50 transition border-t border-slate-100 mt-2 pt-2"
            >
              <LogOut className="w-5 h-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;