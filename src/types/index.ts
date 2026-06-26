export interface ToppingCategory {
  name: string;
  options: string[];
  maxPerCategory?: number;
}

export type SelectionGroupType = 'choose-n' | 'choose-1' | 'fixed-display';

export interface SelectionGroup {
  id: string;
  label: string;
  instruction: string;
  type: SelectionGroupType;
  totalMax?: number;
  categories?: ToppingCategory[];
  options?: string[];
  fixedItems?: { label: string; items: string[] }[];
}

export type ServiceCategory = 'dulce' | 'salado' | 'bebidas' | 'brunch';

export interface Service {
  id: string;
  name: string;
  shortName: string;
  description: string;
  category: ServiceCategory;
  emoji: string;
  image?: string;
  selectionGroups: SelectionGroup[];
}

export type GroupSelections = Record<string, string[]>;

export interface ServiceSelection {
  serviceId: string;
  groupSelections: GroupSelections;
}

export interface PersonalizationData {
  decoracion: string[];
  presentacion: string[];
  coloresEvento: string;
  notas: string;
}

export interface EventFormData {
  nombre: string;
  telefono: string;
  fecha: string;
  lugar: string;
  personas: string;
  tipoEvento: string;
  comentarios: string;
}

export interface ConfiguratorState {
  isOpen: boolean;
  step: number;
  selectedServices: string[];
  serviceSelections: Record<string, GroupSelections>;
  personalization: PersonalizationData;
  eventForm: EventFormData;
}
