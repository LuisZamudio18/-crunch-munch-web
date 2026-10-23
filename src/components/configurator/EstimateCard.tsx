'use client';

import { useMemo } from 'react';
import { clsx } from 'clsx';
import {
  COCKTAIL_BAR_IDS,
  PRESENTATION_CHOICE_BAR_IDS,
  PRESENTATION_FIXED,
  REFILL_OPTION,
  SERVICE_MAP,
  SERVICE_TYPE_GROUP_ID,
  TAKE_HOME_GROUP_ID,
  TAKE_HOME_YES,
} from '@/data/services';
import { ESTIMATE_ENABLED, ESTIMATE_NOTES, PRESENTATION_VARIANT, PRICING, PRICING_IS_PLACEHOLDER } from '@/data/pricing';
import {
  computeDiscountProgress,
  computeEstimate,
  formatMXN,
  type DiscountProgress,
  type Estimate,
  type ServiceOptions,
} from '@/lib/estimate';
import type { PersonalizationData } from '@/types';

/** What the customer picked in the configurator that changes a bar's price. */
export interface EstimateChoices {
  serviceSelections: Record<string, Record<string, string[]>>;
  personalization: PersonalizationData;
}

function serviceOptions(id: string, choices: EstimateChoices): ServiceOptions {
  const sel = choices.serviceSelections[id] ?? {};
  const presentation = PRESENTATION_CHOICE_BAR_IDS.includes(id)
    ? choices.personalization.presentacion[0]
    : PRESENTATION_FIXED[id];
  const refill = COCKTAIL_BAR_IDS.includes(id) && sel[SERVICE_TYPE_GROUP_ID]?.[0] === REFILL_OPTION;
  const takeHome = sel[TAKE_HOME_GROUP_ID]?.[0] === TAKE_HOME_YES;
  const label = [presentation, refill ? REFILL_OPTION : null, takeHome ? 'Cantaritos de regalo' : null]
    .filter(Boolean)
    .join(' · ');
  return {
    variant: presentation ? PRESENTATION_VARIANT[presentation] : undefined,
    refill,
    takeHome,
    label: label || undefined,
  };
}

export function useEstimate(
  selectedServices: string[],
  personas: number,
  choices?: EstimateChoices,
  personasByService?: Record<string, number>
) {
  return useMemo(() => {
    if (!ESTIMATE_ENABLED) return { estimate: null as Estimate | null, progress: [] as DiscountProgress[] };
    const serviceNames = Object.fromEntries(selectedServices.map((id) => [id, SERVICE_MAP[id]?.name ?? id]));
    const options = choices
      ? Object.fromEntries(selectedServices.map((id) => [id, serviceOptions(id, choices)]))
      : undefined;
    return {
      estimate: computeEstimate({ selectedServices, personas, personasByService, serviceNames, options }, PRICING),
      progress: computeDiscountProgress({ selectedServices, personas, personasByService }, PRICING),
    };
  }, [selectedServices, personas, choices, personasByService]);
}

/** Plain-text lines for the WhatsApp message, so the team sees what the customer saw. */
export function estimateToWhatsAppLines(estimate: Estimate): string[] {
  return [
    // Only the range is shown to the customer, so the message carries no per-bar or per-discount amounts either.
    ...estimate.lines.map((l) => `  · ${l.name} (${[`${l.personas} personas`, l.detail].filter(Boolean).join(' · ')})`),
    ...estimate.discounts.map((d) => `  · ${d.rule.label} (${d.rule.percent}%) aplicado`),
    ...(estimate.unpricedServiceIds.length ? [`  · Barras por confirmar: ${estimate.unpricedServiceIds.length}`] : []),
    `  · Rango estimado: ${formatMXN(estimate.low)} – ${formatMXN(estimate.high)}`,
  ];
}

interface DiscountNudgeProps {
  progress: DiscountProgress[];
  className?: string;
}

/**
 * "You're one step from a discount" prompts. Every message maps to a real
 * rule in the pricing config — no fake urgency or invented scarcity.
 */
export function DiscountNudge({ progress, className }: DiscountNudgeProps) {
  // Rules don't stack ('best'), so show only the biggest unlocked one and the nearest bigger one still locked.
  const best = progress.filter((p) => p.unlocked).sort((a, b) => b.rule.percent - a.rule.percent)[0];
  const unlocked = best ? [best] : [];
  const nextUp = progress
    .filter((p) => !p.unlocked && p.rule.percent > (best?.rule.percent ?? 0))
    .sort((a, b) => b.progress - a.progress || a.rule.percent - b.rule.percent)[0];

  if (unlocked.length === 0 && !nextUp) return null;

  return (
    <div className={clsx('space-y-2', className)}>
      {unlocked.map((p) => (
        <div
          key={p.rule.id}
          className="flex items-center gap-2.5 rounded-xl bg-gold-gradient px-3.5 py-2.5 text-coffee-900 shadow-md animate-pulse-gold"
        >
          <span className="text-base leading-none">✦</span>
          <p className="text-xs font-semibold">¡{p.message}!</p>
        </div>
      ))}

      {nextUp && (
        <div className="rounded-xl border border-gold-200 bg-gold-50 px-3.5 py-3">
          <p className="text-xs text-coffee-700 mb-2">{nextUp.message}</p>
          <div className="h-1.5 rounded-full bg-cream-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-gold-gradient transition-all duration-500"
              style={{ width: `${Math.round(nextUp.progress * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface EstimateCardProps {
  estimate: Estimate;
}

export default function EstimateCard({ estimate }: EstimateCardProps) {
  return (
    <div className="rounded-2xl border border-gold-200 bg-gradient-to-br from-gold-50 to-cream-50 p-5">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <p className="text-xs uppercase tracking-widest text-gold-500">Estimado preliminar</p>
        <span className="text-[10px] uppercase tracking-wider rounded-full bg-coffee-800 text-cream-50 px-2.5 py-0.5">
          Aproximado
        </span>
        {PRICING_IS_PLACEHOLDER && (
          <span className="text-[10px] uppercase tracking-wider rounded-full bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-0.5">
            Montos de ejemplo
          </span>
        )}
      </div>

      <p className="text-display text-4xl text-coffee-800 leading-none mb-1">
        {formatMXN(estimate.low)} <span className="text-coffee-400">–</span> {formatMXN(estimate.high)}
      </p>
      <p className="text-xs text-coffee-500 mb-4">Rango aproximado en pesos mexicanos</p>

      <div className="space-y-1.5 text-sm border-t border-gold-200/70 pt-3">
        {estimate.lines.map((l) => (
          <div key={l.serviceId} className="text-coffee-600">
            {l.name}
            <span className="block text-xs text-coffee-400">
              {[`${l.personas} personas`, l.detail].filter(Boolean).join(' · ')}
            </span>
          </div>
        ))}

        {estimate.discounts.map((d) => (
          <div key={d.rule.id} className="flex justify-between gap-3 text-gold-600 font-medium">
            <span>
              {d.rule.label} ({d.rule.percent}%)
            </span>
            <span>aplicado</span>
          </div>
        ))}

        {estimate.unpricedServiceIds.length > 0 && (
          <div className="flex justify-between gap-3 text-coffee-400 italic">
            <span>
              {estimate.unpricedServiceIds.length === 1 ? '1 barra más' : `${estimate.unpricedServiceIds.length} barras más`}
            </span>
            <span>por confirmar</span>
          </div>
        )}
      </div>

      <p className="mt-4 rounded-xl bg-cream-100 px-3.5 py-3 text-xs leading-relaxed text-coffee-600">
        <strong className="text-coffee-700">Esto es una estimación, no una cotización final.</strong> El precio exacto
        lo confirmamos contigo por WhatsApp, donde también revisamos si te corresponde algún descuento.
      </p>
      <ul className="mt-3 space-y-1 text-[11px] leading-relaxed text-coffee-500">
        <li>{ESTIMATE_NOTES.includes}</li>
        <li>{ESTIMATE_NOTES.payment}</li>
        <li>{ESTIMATE_NOTES.travel}</li>
      </ul>
    </div>
  );
}
