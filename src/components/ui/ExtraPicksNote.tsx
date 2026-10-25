import { PRICING } from '@/data/pricing';
import { categoryPicks } from '@/lib/extraPicks';
import type { ToppingCategory } from '@/types';

interface ExtraPicksNoteProps {
  serviceId: string;
  categories: ToppingCategory[];
  selections: string[];
}

/** What the base price includes and, as the customer picks more, what the extra picks add. */
export default function ExtraPicksNote({ serviceId, categories, selections }: ExtraPicksNoteProps) {
  const rule = PRICING.services[serviceId]?.extraPickSurcharge;
  const picks = categoryPicks(categories, selections);
  if (!rule || picks.length === 0) return null;

  const extra = picks.reduce((sum, c) => sum + c.extra, 0);

  return (
    <div className="mb-4 rounded-xl border border-gold-200 bg-gold-50 px-3.5 py-3 text-xs leading-relaxed text-coffee-600">
      <p>
        <strong className="text-coffee-700">Tu precio incluye:</strong>{' '}
        {picks.map((c) => `${c.included} ${c.name.toLowerCase()}`).join(' · ')}.
      </p>
      <p className="mt-1">
        Puedes elegir más: cada {rule.every} opciones extra suben {rule.percent} % el precio por persona.
      </p>
      {extra > 0 && (
        <p className="mt-1.5 font-medium text-gold-600">
          Llevas {extra} {extra === 1 ? 'opción extra' : 'opciones extra'}. El total final lo ves en tu resumen.
        </p>
      )}
    </div>
  );
}
