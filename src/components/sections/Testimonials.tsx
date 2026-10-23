const TESTIMONIALS = [
  {
    name: 'Adriana M.',
    event: 'Boda',
    text: 'El Coffee Bar fue el alma de nuestra boda. Todos los invitados quedaron encantados con la variedad y la presentación. ¡Superó todas nuestras expectativas!',
    stars: 5,
  },
  {
    name: 'Mariana R.',
    event: 'Baby Shower',
    text: 'La Barra Brunch fue perfecta para mi baby shower. Presentación impecable, todo delicioso y el equipo súper profesional. Lo recomiendo al 100%.',
    stars: 5,
  },
  {
    name: 'Sofía L.',
    event: 'Quinceañera',
    text: 'Contratamos el Snack Bar y la Barra de Helados. Los chavos quedaron fascinados. La barra era preciosa y la comida buenísima.',
    stars: 5,
  },
  {
    name: 'Carlos V.',
    event: 'Evento Corporativo',
    text: 'Excelente servicio. El Charcutería Bar fue un éxito total en nuestra reunión de directivos. Muy profesionales y puntuales.',
    stars: 5,
  },
];

export default function Testimonials() {
  return (
    <section id="testimonios" className="bg-coffee-900 section-padding py-14 md:py-16">
      <div className="container-max">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-widest text-gold-400 mb-3">Lo que dicen</p>
          <h2 className="text-display text-4xl md:text-5xl text-cream-50">
            Historias que nos{' '}
            <em className="gold-text">inspiran</em>
          </h2>
        </div>

        <div className="flex gap-5 overflow-x-auto pb-3 -mx-5 px-5 md:-mx-10 md:px-10 lg:-mx-20 lg:px-20 snap-x snap-mandatory scroll-smooth">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="flex-none w-[270px] snap-start bg-coffee-800/60 border border-coffee-700 rounded-2xl p-6 hover:border-gold-500/40 transition-colors"
            >
              <div className="flex gap-1 mb-3">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <span key={i} className="text-gold-400 text-sm">★</span>
                ))}
              </div>
              <p className="text-cream-300 leading-relaxed mb-4 text-sm italic">"{t.text}"</p>
              <div>
                <p className="text-cream-100 font-semibold text-sm">{t.name}</p>
                <p className="text-coffee-400 text-xs uppercase tracking-wider">{t.event}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
