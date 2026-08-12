'use client';

import { clsx } from 'clsx';
import { COCKTAIL_BAR_IDS, SERVICE_MAP, SERVICE_TYPE_GROUP_ID, SERVICE_TYPE_OPTIONS } from '@/data/services';

interface StepServiceTypeProps {
  selectedServices: string[];
  serviceSelections: Record<string, Record<string, string[]>>;
  onChooseOne: (serviceId: string, groupId: string, item: string) => void;
}

export default function StepServiceType({ selectedServices, serviceSelections, onChooseOne }: StepServiceTypeProps) {
  const cocktailBars = selectedServices.filter((id) => COCKTAIL_BAR_IDS.includes(id));

  return (
    <div>
      <div className="mb-5">
        <h3 className="text-display text-2xl text-coffee-800 mb-1">Tipo de servicio</h3>
        <p className="text-sm text-coffee-500">
          Elige cómo se servirán las bebidas en cada barra.
        </p>
      </div>

      <div className="space-y-6">
        {cocktailBars.map((id) => {
          const svc = SERVICE_MAP[id];
          if (!svc) return null;
          const selected = serviceSelections[id]?.[SERVICE_TYPE_GROUP_ID]?.[0] ?? null;

          return (
            <div key={id}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{svc.emoji}</span>
                <h4 className="font-semibold text-coffee-700 text-sm">{svc.name}</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {SERVICE_TYPE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => onChooseOne(id, SERVICE_TYPE_GROUP_ID, option)}
                    className={clsx(
                      'px-4 py-2 rounded-full border text-sm transition-all duration-200',
                      selected === option
                        ? 'bg-coffee-700 border-coffee-700 text-cream-50'
                        : 'border-coffee-300 text-coffee-600 hover:border-coffee-500'
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
