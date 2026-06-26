export default function About() {
  const pillars = [
    {
      icon: '✦',
      title: 'Experiencia Premium',
      desc: 'Cada barra está diseñada con atención al detalle para crear una experiencia visual y gastronómica de lujo.',
    },
    {
      icon: '✧',
      title: 'Personalización Total',
      desc: 'Elige tus barras, toppings y decoración. Cada evento es único como tú.',
    },
    {
      icon: '◈',
      title: 'Ingredientes Selectos',
      desc: 'Trabajamos con los mejores proveedores para garantizar calidad y frescura en cada servicio.',
    },
  ];

  return (
    <section id="nosotros" className="bg-cream-gradient section-padding">
      <div className="container-max">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <p className="text-xs uppercase tracking-widest text-gold-500 mb-4">Nuestra historia</p>
            <h2 className="text-display text-4xl md:text-5xl text-coffee-800 leading-tight mb-6">
              Transformamos eventos en{' '}
              <em className="gold-text">recuerdos</em>
            </h2>
            <p className="text-coffee-500 leading-relaxed mb-5">
              Crunch &amp; Munch nació de la pasión por crear experiencias gastronómicas únicas.
              Somos una empresa de mobile bars premium especializada en llevar barras temáticas
              de alta calidad a tus eventos más especiales.
            </p>
            <p className="text-coffee-500 leading-relaxed">
              Desde barras de café hasta charcutería gourmet, cada servicio está cuidadosamente
              curado para complementar la estética de tu evento y deleitar a cada invitado.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {pillars.map((p) => (
              <div
                key={p.title}
                className="glass-card rounded-2xl p-6 flex gap-5 hover:shadow-md transition-shadow"
              >
                <div className="text-gold-400 text-2xl shrink-0 mt-1">{p.icon}</div>
                <div>
                  <h3 className="font-sans font-semibold text-coffee-800 mb-1">{p.title}</h3>
                  <p className="text-sm text-coffee-500 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
