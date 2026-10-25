'use client';

import { useEffect, useRef } from 'react';
import ProgressBar from '@/components/ui/ProgressBar';
import Button from '@/components/ui/Button';
import StepServices from './StepServices';
import StepToppings from './StepToppings';
import StepServiceType from './StepServiceType';
import StepPersonalization from './StepPersonalization';
import StepEventForm from './StepEventForm';
import StepSummary from './StepSummary';
import { comboValid, guestsFor, isCombo } from '@/lib/guests';
import {
  COCKTAIL_BAR_IDS,
  PRESENTATION_CHOICE_BAR_IDS,
  SERVICE_MAP,
  SERVICE_STEP_GROUP_IDS,
  SERVICE_TYPE_GROUP_ID,
  TAKE_HOME_GROUP_ID,
} from '@/data/services';
import type { PersonalizationData, EventFormData } from '@/types';

type StepKey = 'services' | 'toppings' | 'serviceType' | 'style' | 'event' | 'summary';

const STEP_LABELS: Record<StepKey, string> = {
  services: 'Barras',
  toppings: 'Toppings',
  serviceType: 'Tipo de Servicio',
  style: 'Estilo',
  event: 'Evento',
  summary: 'Resumen',
};

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

  // The scrolling area is the same element in every step, so without this a new step opens at the
  // scroll position of the previous one (on a phone the summary opened at its bottom).
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [step, isOpen]);

  if (!isOpen) return null;

  const hasServiceTypeStep = selectedServices.some((id) => COCKTAIL_BAR_IDS.includes(id));
  const needsPresentation = selectedServices.some((id) => PRESENTATION_CHOICE_BAR_IDS.includes(id));

  const STEPS: StepKey[] = [
    'services',
    'toppings',
    ...(hasServiceTypeStep ? (['serviceType'] as const) : []),
    'style',
    'event',
    'summary',
  ];
  const totalSteps = STEPS.length;
  const currentKey = STEPS[step - 1] ?? STEPS[STEPS.length - 1];
  const stepLabels = STEPS.map((key) => STEP_LABELS[key]);

  const canGoNext = () => {
    if (currentKey === 'services') return selectedServices.length > 0;

    if (currentKey === 'toppings') {
      return selectedServices.every((serviceId) => {
        const service = SERVICE_MAP[serviceId];
        if (!service) return true;
        const interactiveGroups = service.selectionGroups.filter(
          (g) => g.type !== 'fixed-display' && !SERVICE_STEP_GROUP_IDS.includes(g.id)
        );
        if (interactiveGroups.length === 0) return true;
        const svcSelections = serviceSelections[serviceId] ?? {};
        return interactiveGroups.every((g) => (svcSelections[g.id] ?? []).length > 0);
      });
    }

    if (currentKey === 'serviceType') {
      return selectedServices
        .filter((id) => COCKTAIL_BAR_IDS.includes(id))
        .every((id) => {
          const sel = serviceSelections[id] ?? {};
          const takeHomeOk = id !== 'cantaritos-bar' || (sel[TAKE_HOME_GROUP_ID] ?? []).length > 0;
          return (sel[SERVICE_TYPE_GROUP_ID] ?? []).length > 0 && takeHomeOk;
        });
    }

    if (currentKey === 'style') {
      return !needsPresentation || personalization.presentacion.length > 0;
    }

    if (currentKey === 'event') {
      const baseValid = !!(eventForm.nombre && eventForm.telefono && eventForm.fecha && eventForm.horario && eventForm.lugar && eventForm.personas && eventForm.tipoEvento);
      if (!baseValid) return false;
      if (isCombo(eventForm, selectedServices)) return comboValid(eventForm, selectedServices);
      const meetsMinimum = selectedServices.every((id) => {
        const svc = SERVICE_MAP[id];
        return !svc || guestsFor(eventForm, id) >= svc.minPersonas;
      });
      return meetsMinimum;
    }
    return true;
  };

  const handleNext = () => { if (step < totalSteps) setStep(step + 1); };
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
          <ProgressBar currentStep={step} totalSteps={totalSteps} labels={stepLabels} />
        </div>

        {/* Content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
          {currentKey === 'services' && (
            <StepServices
              selectedServices={selectedServices}
              onToggle={toggleService}
              onGoToCatalog={onGoToCatalog}
            />
          )}
          {currentKey === 'toppings' && (
            <StepToppings
              selectedServices={selectedServices}
              serviceSelections={serviceSelections}
              onAdd={addGroupSelection}
              onRemove={removeGroupSelection}
              onChooseOne={setGroupSelection}
            />
          )}
          {currentKey === 'serviceType' && (
            <StepServiceType
              selectedServices={selectedServices}
              serviceSelections={serviceSelections}
              onChooseOne={setGroupSelection}
            />
          )}
          {currentKey === 'style' && (
            <StepPersonalization
              personalization={personalization}
              selectedServices={selectedServices}
              onChange={setPersonalization}
            />
          )}
          {currentKey === 'event' && (
            <StepEventForm
              eventForm={eventForm}
              selectedServices={selectedServices}
              onChange={setEventForm}
            />
          )}
          {currentKey === 'summary' && (
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
        <div className="px-4 sm:px-6 pb-6 pt-3 border-t border-cream-200 shrink-0">
            {/* Warning message for toppings step */}
            {currentKey === 'toppings' && !canGoNext() && (
              <div className="mb-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-xs text-amber-700">
                <span className="shrink-0 mt-0.5">⚠️</span>
                <span>
                  Aún faltan opciones por elegir en:{' '}
                  <strong>
                    {selectedServices
                      .filter((id) => {
                        const svc = SERVICE_MAP[id];
                        if (!svc) return false;
                        const interactive = svc.selectionGroups.filter(
                          (g) => g.type !== 'fixed-display' && !SERVICE_STEP_GROUP_IDS.includes(g.id)
                        );
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

            {/* Warning message for service type step */}
            {currentKey === 'serviceType' && !canGoNext() && (
              <div className="mb-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-xs text-amber-700">
                <span className="shrink-0 mt-0.5">⚠️</span>
                <span>Elige el tipo de servicio para cada barra de bebidas (y si los cantaritos son rentados o de regalo) antes de continuar.</span>
              </div>
            )}

            {/* Warning message for style step: presentation is required for bars whose price depends on it */}
            {currentKey === 'style' && !canGoNext() && (
              <div className="mb-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-xs text-amber-700">
                <span className="shrink-0 mt-0.5">⚠️</span>
                <span>Elige la presentación de las bebidas (cristalería o desechables) para continuar.</span>
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
            {step < totalSteps && (
              <Button
                variant="gold"
                size="md"
                onClick={handleNext}
                disabled={!canGoNext()}
                className="ml-auto"
              >
                {currentKey === 'event' ? 'Ver resumen →' : 'Continuar →'}
              </Button>
            )}
            </div>
        </div>
      </div>
    </div>
  );
}
