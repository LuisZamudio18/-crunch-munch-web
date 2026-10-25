const TESTIMONIALS = [
  {
    name: 'Adriana M.',
    event: 'Boda',
    text: 'El Coffee Bar fue el alma de nuestra boda. Todos los invitados quedaron encantados con la variedad y la presentación. ¡Superó todas nuestras expectativas!',
    stars: 5,
    tint: 'bg-rosa/30',
  },
  {
    name: 'Mariana R.',
    event: 'Baby Shower',
    text: 'La Barra Brunch fue perfecta para mi baby shower. Presentación impecable, todo delicioso y el equipo súper profesional. Lo recomiendo al 100%.',
    stars: 5,
    tint: 'bg-amarillo/35',
  },
  {
    name: 'Sofía L.',
    event: 'Quinceañera',
    text: 'Contratamos el Snack Bar y la Barra de Helados. Los chavos quedaron fascinados. La barra era preciosa y la comida buenísima.',
    stars: 5,
    tint: 'bg-lila/30',
  },
  {
    name: 'Carlos V.',
    event: 'Evento Corporativo',
    text: 'Excelente servicio. El Charcutería Bar fue un éxito total en nuestra reunión de directivos. Muy profesionales y puntuales.',
    stars: 5,
    tint: 'bg-azul/35',
  },
];

export default function Testimonials() {
  return (
    <section id="testimonios" className="bg-cream-200 section-padding py-16 md:py-24">
      <div className="container-max">
        <div className="mb-12 max-w-2xl">
          <h2 className="font-serif italic text-5xl md:text-6xl leading-[1.02] text-coffee-600">
            Historias que nos <span className="text-gold-500">inspiran</span>
          </h2>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4 -mx-5 px-5 md:-mx-10 md:px-10 lg:-mx-20 lg:px-20 snap-x snap-mandatory scroll-smooth">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className={`flex-none w-[290px] md:w-[330px] snap-start ${t.tint} rounded-[1.75rem] p-8`}
            >
              <blockquote className="font-serif italic text-[1.35rem] leading-snug text-coffee-700 mb-6">“{t.text}”</blockquote>
              <figcaption>
                <p className="font-sans font-semibold text-base text-coffee-700">{t.name}</p>
                <p className="font-sans text-[13px] uppercase tracking-[0.18em] text-coffee-500 mt-1">{t.event}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
