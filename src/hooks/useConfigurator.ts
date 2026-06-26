'use client';

import { useState } from 'react';
import type { PersonalizationData, EventFormData } from '@/types';

const DEFAULT_PERSONALIZATION: PersonalizationData = {
  decoracion: [],
  presentacion: [],
  coloresEvento: '',
  notas: '',
};

const DEFAULT_EVENT_FORM: EventFormData = {
  nombre: '',
  telefono: '',
  fecha: '',
  lugar: '',
  personas: '',
  tipoEvento: '',
  comentarios: '',
};

export function useConfigurator() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [serviceSelections, setServiceSelections] = useState<Record<string, Record<string, string[]>>>({});
  const [personalization, setPersonalization] = useState<PersonalizationData>(DEFAULT_PERSONALIZATION);
  const [eventForm, setEventForm] = useState<EventFormData>(DEFAULT_EVENT_FORM);

  function open() {
    setIsOpen(true);
    setStep(1);
  }

  function close() {
    setIsOpen(false);
  }

  function reset() {
    setStep(1);
    setSelectedServices([]);
    setServiceSelections({});
    setPersonalization(DEFAULT_PERSONALIZATION);
    setEventForm(DEFAULT_EVENT_FORM);
  }

  function toggleService(id: string) {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  function addGroupSelection(serviceId: string, groupId: string, item: string) {
    setServiceSelections((prev) => {
      const svc = prev[serviceId] || {};
      const grp = svc[groupId] || [];
      return { ...prev, [serviceId]: { ...svc, [groupId]: [...grp, item] } };
    });
  }

  function removeGroupSelection(serviceId: string, groupId: string, item: string) {
    setServiceSelections((prev) => {
      const svc = prev[serviceId] || {};
      const grp = [...(svc[groupId] || [])];
      const idx = grp.lastIndexOf(item);
      if (idx > -1) grp.splice(idx, 1);
      return { ...prev, [serviceId]: { ...svc, [groupId]: grp } };
    });
  }

  function setGroupSelection(serviceId: string, groupId: string, item: string) {
    setServiceSelections((prev) => ({
      ...prev,
      [serviceId]: { ...(prev[serviceId] || {}), [groupId]: [item] },
    }));
  }

  function applyServiceSelections(serviceId: string, selections: Record<string, string[]>) {
    setServiceSelections((prev) => ({ ...prev, [serviceId]: selections }));
  }

  return {
    isOpen, open, close, reset,
    step, setStep,
    selectedServices, toggleService,
    serviceSelections, addGroupSelection, removeGroupSelection, setGroupSelection, applyServiceSelections,
    personalization, setPersonalization,
    eventForm, setEventForm,
  };
}
