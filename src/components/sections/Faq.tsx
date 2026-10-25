import { FAQ } from '@/data/faq';
import Sticker from '@/components/ui/Sticker';

/** Preguntas frecuentes en <details>: se leen sin JavaScript y los buscadores y asistentes de IA las ven completas. */
export default function Faq() {
  return (
    <section id="preguntas" className="relative overflow-x-clip bg-white section-padding py-16 md:py-24">
      <Sticker id="jarabe-vainilla" size={56} mdSize={76} pos={{ top: '-30px', right: '16px' }} mdPos={{ top: '8%', right: '6%' }} rotate={8} motion="float" duration={8.5} speed={0.035} />
      <Sticker id="costal-cafe" size={90} mdSize={120} pos={{ bottom: '-34px', right: '10px' }} mdPos={{ bottom: '6%', right: '2%' }} rotate={-6} motion="sway" duration={9} delay={1.2} speed={0.035} />

      <div className="container-max relative grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-12 lg:gap-20">
        <div>
          <h2 className="font-serif italic text-5xl md:text-6xl leading-[1.02] text-coffee-600 mb-6">
            Antes de <span className="text-gold-500">cotizar</span>
          </h2>
          <span className="gold-rule mb-6" aria-hidden="true" />
          <p className="font-sans text-base leading-relaxed text-coffee-600 max-w-sm">
            Lo que más nos preguntan sobre tiempos, precios y zonas de servicio. Si no encuentras tu duda, escríbenos por WhatsApp.
          </p>
        </div>

        <div className="divide-y divide-gold-400/40 border-y border-gold-400/40">
          {FAQ.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 font-serif italic text-2xl leading-snug text-coffee-700 marker:content-none [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="mt-1 shrink-0 font-sans not-italic text-xl text-gold-500 transition-transform duration-300 group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="font-sans text-base leading-relaxed text-coffee-600 mt-4 pr-10 max-w-2xl">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
