import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useEmergencia } from './context/EmergenciaContext';

import Navbar from './components/Navbar';
import OfflineBanner from './components/OfflineBanner';
import OnboardingModal from './components/OnboardingModal';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import MiBarrio from './pages/MiBarrio';
import PerfilPublico from './pages/PerfilPublico';
import ModoEmergencia from './pages/ModoEmergencia';

const App = () => {
  const { user } = useAuth();
  const { isEmergencyActive } = useEmergencia();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem('rv_onboarding_completed');
    if (!completed) {
      setShowOnboarding(true);
    }
  }, []);

  return (
    <div
      className={`min-h-screen w-full max-w-full overflow-x-hidden transition-colors duration-300 ${
        isEmergencyActive
          ? 'bg-[#2a0b12] text-white'
          : 'bg-slate-50 text-slate-900'
      }`}
    >
      <OfflineBanner />
      <Navbar onOpenTutorial={() => setShowOnboarding(true)} />

      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />

      <main className="w-full max-w-full overflow-x-hidden pt-16">
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <Login />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/" replace /> : <Register />}
          />

          {/* Navegación libre en estado normal; si está en SOS estricto, el Navbar ya bloquea la salida y se queda en emergencia */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mi-barrio"
            element={
              <ProtectedRoute>
                <MiBarrio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vecino/:id"
            element={
              <ProtectedRoute>
                <PerfilPublico />
              </ProtectedRoute>
            }
          />
          <Route
            path="/emergencia"
            element={
              <ProtectedRoute>
                <ModoEmergencia />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;