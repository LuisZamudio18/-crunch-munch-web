/**
 * Preguntas frecuentes visibles en la página y publicadas también como FAQPage (JSON-LD),
 * para que buscadores y asistentes de IA puedan citarlas. Solo hechos que ya están en el sitio
 * (precios, mínimos, duración, anticipo, cobertura); si cambia alguna regla, cambia aquí.
 */
export interface FaqItem {
  q: string;
  a: string;
}

export const FAQ: FaqItem[] = [
  {
    q: '¿Para cuántas personas se contrata una barra?',
    a: 'La mayoría de las barras se contratan desde 30 invitados; las barras de brunch (Barra Brunch y Desayuno Buffet) desde 20. Cada barra puede llevar su propio número de invitados.',
  },
  {
    q: '¿Cuánto dura el servicio?',
    a: 'Con 30 a 69 invitados el servicio dura 2 horas, de 70 a 99 dura 3 horas y con 100 o más dura 4 horas, o hasta que se acabe el producto. Las barras de cócteles con refill ilimitado duran 2 horas y media con menos de 50 invitados, 3 horas de 50 a 69, 3 horas y media de 70 a 89 y 4 horas con 90 o más.',
  },
  {
    q: '¿Qué incluye el precio?',
    a: 'Incluye mobiliario, traslado, staff, desechables y personalización de la barra (decoración, espejo selfie y etiquetas). El estimado de la página es aproximado: el precio final lo confirmamos contigo por WhatsApp.',
  },
  {
    q: '¿Cómo se aparta la fecha y cuándo se paga?',
    a: 'Para agendar tu fecha se pide un anticipo del 40 %; el resto se liquida a más tardar un día antes del evento.',
  },
  {
    q: '¿Puedo combinar varias barras?',
    a: 'Sí. Con 2 barras tienes 5 % de descuento, con 3 barras 10 % y con 4 o más 15 %, siempre que cada barra sea para al menos 50 personas.',
  },
  {
    q: '¿En qué zonas dan servicio?',
    a: 'Atendemos todo Tabasco. Fuera del centro de la ciudad y en municipios distintos de Villahermosa y Cárdenas puede aplicar un cargo extra de traslado, que confirmamos contigo.',
  },
  {
    q: '¿Cómo pido mi cotización?',
    a: 'Arma tu cotización en la página: eliges barras, toppings, número de invitados y la fecha, y te mostramos un estimado. Después se abre WhatsApp con el resumen listo para enviarnos.',
  },
];
