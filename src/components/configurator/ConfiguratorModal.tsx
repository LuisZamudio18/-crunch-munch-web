'use client';

import { useEffect } from 'react';
import ProgressBar from '@/components/ui/ProgressBar';
import Button from '@/components/ui/Button';
import StepServices from './StepServices';
import StepToppings from './StepToppings';
import StepPersonalization from './StepPersonalization';
import StepEventForm from './StepEventForm';
import StepSummary from './StepSummary';
import { SERVICE_MAP } from '@/data/services';
import type { PersonalizationData, EventFormData } from '@/types';

const STEP_LABELS = ['Barras', 'Toppings', 'Estilo', 'Evento', 'Resumen'];

interface ConfiguratorModalProps {
  isOpen: boolean;
  step: number;
  setStep: (s: number) => void;
  selectedServices: string[];
  toggleService: (id: string) => void;
  serviceSelections: Record<string, Record<string, string[]>>;
  addGroupSelection: (svcId: string, groupId: string, item: string) => void;
  removeGroupSelection: (svcId: string, groupId: string, item: string) => void;
  setGroupSelection: (svcId: string, groupId: string, item: string) => void;
  personalization: PersonalizationData;
  setPersonalization: (d: PersonalizationData) => void;
  eventForm: EventFormData;
  setEventForm: (d: EventFormData) => void;
  onClose: () => void;
  onReset: () => void;
  onGoToCatalog: () => void;
}

export default function ConfiguratorModal({
  isOpen,
  step,
  setStep,
  selectedServices,
  toggleService,
  serviceSelections,
  addGroupSelection,
  removeGroupSelection,
  setGroupSelection,
  personalization,
  setPersonalization,
  eventForm,
  setEventForm,
  onClose,
  onReset,
  onGoToCatalog,
}: ConfiguratorModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const canGoNext = () => {
    if (step === 1) return selectedServices.length > 0;

    if (step === 2) {
      return selectedServices.every((serviceId) => {
        const service = SERVICE_MAP[serviceId];
        if (!service) return true;
        const interactiveGroups = service.selectionGroups.filter((g) => g.type !== 'fixed-display');
        if (interactiveGroups.length === 0) return true;
        const svcSelections = serviceSelections[serviceId] ?? {};
        return interactiveGroups.every((g) => (svcSelections[g.id] ?? []).length > 0);
      });
    }

    if (step === 4) return !!(eventForm.nombre && eventForm.telefono && eventForm.fecha && eventForm.lugar && eventForm.personas && eventForm.tipoEvento);
    return true;
  };

  const handleNext = () => { if (step < 5) setStep(step + 1); };
  const handleBack = () => { if (step > 1) setStep(step - 1); };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-coffee-900/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full sm:max-w-2xl bg-cream-50 rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 pt-6 pb-4 border-b border-cream-200 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-display text-xl text-coffee-800">
              Arma tu <em className="gold-text">evento</em>
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-cream-200 hover:bg-cream-300 flex items-center justify-center text-coffee-600 transition-colors text-lg"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
          <ProgressBar currentStep={step} totalSteps={5} labels={STEP_LABELS} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
          {step === 1 && (
            <StepServices
              selectedServices={selectedServices}
              onToggle={toggleService}
              onGoToCatalog={onGoToCatalog}
            />
          )}
          {step === 2 && (
            <StepToppings
              selectedServices={selectedServices}
              serviceSelections={serviceSelections}
              onAdd={addGroupSelection}
              onRemove={removeGroupSelection}
              onChooseOne={setGroupSelection}
            />
          )}
          {step === 3 && (
            <StepPersonalization
              personalization={personalization}
              selectedServices={selectedServices}
              onChange={setPersonalization}
            />
          )}
          {step === 4 && (
            <StepEventForm
              eventForm={eventForm}
              onChange={setEventForm}
            />
          )}
          {step === 5 && (
            <StepSummary
              selectedServices={selectedServices}
              serviceSelections={serviceSelections}
              personalization={personalization}
              eventForm={eventForm}
              onReset={() => { onReset(); setStep(1); }}
            />
          )}
        </div>

        {/* Footer navigation */}
        {step < 5 && (
          <div className="px-4 sm:px-6 pb-6 pt-3 border-t border-cream-200 shrink-0">
            {/* Warning message for step 2 */}
            {step === 2 && !canGoNext() && (
              <div className="mb-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-xs text-amber-700">
                <span className="shrink-0 mt-0.5">⚠️</span>
                <span>
                  Aún faltan opciones por elegir en:{' '}
                  <strong>
                    {selectedServices
                      .filter((id) => {
                        const svc = SERVICE_MAP[id];
                        if (!svc) return false;
                        const interactive = svc.selectionGroups.filter((g) => g.type !== 'fixed-display');
                        if (interactive.length === 0) return false;
                        const sel = serviceSelections[id] ?? {};
                        return !interactive.every((g) => (sel[g.id] ?? []).length > 0);
                      })
                      .map((id) => SERVICE_MAP[id]?.shortName)
                      .join(', ')}
                  </strong>
                  . Selecciona al menos una opción en cada sección para continuar.
                </span>
              </div>
            )}

            <div className="flex gap-3">
            {step > 1 ? (
              <Button variant="ghost" size="md" onClick={handleBack} className="text-coffee-600">
                ← Atrás
              </Button>
            ) : (
              <div />
            )}
            <Button
              variant="gold"
              size="md"
              onClick={handleNext}
              disabled={!canGoNext()}
              className="ml-auto"
            >
              {step === 4 ? 'Ver resumen →' : 'Continuar →'}
            </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
