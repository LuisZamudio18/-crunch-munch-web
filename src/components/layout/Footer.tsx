export default function Footer() {
  return (
    <footer className="bg-coffee-900 text-cream-200 py-14">
      <div className="container-max section-padding py-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="text-display text-2xl italic text-cream-50 mb-3">
              Crunch <span className="gold-text">&amp;</span> Munch
            </h3>
            <p className="text-sm text-cream-300 leading-relaxed">
              Luxury mobile bars para eventos únicos e inolvidables.
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest text-gold-400 mb-4">Contacto</h4>
            <ul className="space-y-2 text-sm text-cream-300">
              <li>
                <a
                  href="https://wa.me/529931100808"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold-400 transition-colors"
                >
                  WhatsApp: +52 993 110 0808
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/crunchandmuch_snackbar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold-400 transition-colors"
                >
                  Instagram: @crunchandmuch_snackbar
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest text-gold-400 mb-4">Servicios</h4>
            <ul className="space-y-1 text-sm text-cream-300 columns-2">
              {[
                'Coffee Bar', 'Snack Bar', 'Smoothie Bar', 'Frappes Bar',
                'Drinks Bar', 'Mocktails Bar', 'Charcutería', 'Crepas Bar',
                'Helados', 'Brunch', 'Dessert Bar', 'Bubble Tea',
              ].map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-coffee-700 text-center text-xs text-coffee-400">
          © {new Date().getFullYear()} Crunch &amp; Munch Snack Bar · Todos los derechos reservados
        </div>
      </div>
    </footer>
  );
}
