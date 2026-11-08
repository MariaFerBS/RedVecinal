import React, { useState } from 'react';
import {
  Store,
  HeartHandshake,
  Siren,
  CheckCircle2,
  ArrowRight,
  X
} from 'lucide-react';

const STEPS = [
  {
    step: 1,
    title: 'Economía y Oficios Cercanos',
    subtitle: 'Menos de 500 metros a la redonda',
    description:
      'Encuentra gasfiteros, electricistas, menús caseros y emprendimientos de tu propio barrio validados con el sello "Visto Bueno Vecinal" otorgado por tus propios vecinos.',
    icon: Store,
    badge: 'Confianza Hiperlocal',
    colorClass: 'bg-emerald-600 text-white'
  },
  {
    step: 2,
    title: 'Cadena de Favores',
    subtitle: 'Comunidad solidaria sin dinero',
    description:
      'Pide prestada una herramienta, comparte movilidad o dona artículos que ya no uses. Fortalecemos los lazos entre vecinos antes de que ocurra cualquier emergencia.',
    icon: HeartHandshake,
    badge: 'Apoyo Mutuo',
    colorClass: 'bg-teal-600 text-white'
  },
  {
    step: 3,
    title: 'Botón SOS y Modo Emergencia',
    subtitle: 'Soporte vital y resiliencia Offline',
    description:
      'Ante sismos, apagones o crisis, activa el Botón SOS. La plataforma muta a un centro de mando con marcado telefónico directo (105, 116, 106) y alertas geolocalizadas que funcionan incluso sin internet.',
    icon: Siren,
    badge: 'Respuesta Inmediata',
    colorClass: 'bg-red-600 text-white'
  }
];

const OnboardingModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const stepData = STEPS[currentStep];
  const IconComponent = stepData.icon;

  const finishOnboarding = () => {
    localStorage.setItem('rv_onboarding_completed', 'true');
    setCurrentStep(0);
    onClose();
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      finishOnboarding();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="w-full max-w-md bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Cabecera Ilustrada */}
        <div className={`p-6 ${stepData.colorClass} relative transition-colors duration-300`}>
          <button
            onClick={finishOnboarding}
            className="absolute top-4 right-4 h-11 w-11 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white transition"
            aria-label="Omitir tutorial"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm mb-4">
            Paso {stepData.step} de {STEPS.length} • {stepData.badge}
          </span>

          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-4 shadow-inner">
            <IconComponent className="w-9 h-9 text-white" />
          </div>

          <h2 id="onboarding-title" className="text-2xl font-extrabold leading-tight break-words">
            {stepData.title}
          </h2>
          <p className="text-sm opacity-90 mt-1 font-medium">
            {stepData.subtitle}
          </p>
        </div>

        {/* Cuerpo del Paso */}
        <div className="p-6">
          <p className="text-slate-600 text-base leading-relaxed break-words min-h-[96px]">
            {stepData.description}
          </p>

          {/* Indicadores de progreso */}
          <div className="flex items-center justify-center gap-2 my-6">
            {STEPS.map((s, idx) => (
              <button
                key={s.step}
                onClick={() => setCurrentStep(idx)}
                aria-label={`Ir al paso ${s.step}`}
                className={`h-2.5 rounded-full transition-all ${
                  idx === currentStep
                    ? 'w-8 bg-emerald-600'
                    : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>

          {/* Botones de Acción Ergonómicos (h-11 mínimo) */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={finishOnboarding}
              className="h-11 px-4 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition text-sm"
            >
              Omitir
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="flex-1 h-11 px-5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] transition flex items-center justify-center gap-2 shadow-md"
            >
              {currentStep < STEPS.length - 1 ? (
                <>
                  <span>Siguiente</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>¡Empezar en mi barrio!</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;