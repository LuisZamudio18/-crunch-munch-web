import Sticker from '@/components/ui/Sticker';

const PILLARS = [
  {
    title: 'Experiencia premium',
    desc: 'Cada barra está diseñada con atención al detalle para crear una experiencia visual y gastronómica de lujo.',
    tint: 'bg-rosa/30',
  },
  {
    title: 'Personalización total',
    desc: 'Elige tus barras, toppings y decoración. Cada evento es único como tú.',
    tint: 'bg-amarillo/35',
  },
  {
    title: 'Ingredientes selectos',
    desc: 'Trabajamos con los mejores proveedores para garantizar calidad y frescura en cada servicio.',
    tint: 'bg-lila/30',
  },
];

export default function About() {
  return (
    <section id="nosotros" className="relative overflow-x-clip bg-white section-padding py-16 md:py-24">
      <Sticker id="galleta-chispas" size={72} mdSize={86} pos={{ top: '-30px', right: '18px' }} mdPos={{ top: '-34px', right: '14%' }} rotate={12} motion="bounce" duration={6} speed={0.035} />
      <Sticker id="flores" size={96} mdSize={150} pos={{ bottom: '-34px', right: '8px' }} mdPos={{ top: '3%', right: '9%', bottom: 'auto' }} rotate={6} motion="sway" duration={9} delay={0.6} speed={0.035} />
      <Sticker id="coctelera" size={56} mdSize={72} pos={{ bottom: '-20px', left: '12px' }} mdPos={{ bottom: '8%', left: '2%' }} rotate={-10} motion="wiggle" duration={5} delay={1} speed={0.035} />

      <div className="container-max relative">
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-20 items-start">
          <div>
            <h2 className="font-serif italic text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.02] text-coffee-600 mb-8">
              Transformamos eventos en <span className="text-gold-500">recuerdos.</span>
            </h2>
            <span className="gold-rule mb-8" aria-hidden="true" />
            <p className="font-sans text-base leading-relaxed text-coffee-600 mb-5 max-w-xl">
              Crunch &amp; Munch nació de la pasión por crear experiencias gastronómicas únicas. Somos una empresa de
              mobile bars premium especializada en llevar barras temáticas de alta calidad a tus eventos más especiales.
            </p>
            <p className="font-sans text-base leading-relaxed text-coffee-600 max-w-xl">
              Desde barras de café hasta charcutería gourmet, cada servicio está cuidadosamente curado para complementar
              la estética de tu evento y deleitar a cada invitado.
            </p>
          </div>

          <ol className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-5 lg:pt-8">
            {PILLARS.map((p) => (
              <li key={p.title} className={`${p.tint} rounded-[1.75rem] p-7 lg:p-8 `}>
                <div>
                  <h3 className="font-serif italic text-2xl md:text-3xl text-coffee-700 mb-2">{p.title}</h3>
                  <p className="font-sans text-base leading-relaxed text-coffee-600">{p.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
