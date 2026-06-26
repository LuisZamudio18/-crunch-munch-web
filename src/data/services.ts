import type { Service } from '@/types';

// ─── Shared topping pools ────────────────────────────────────────────────────

const CHOCOLATES_12 = [
  'Nutella', 'M&Ms', 'Chips de chocolate', 'Ferrero Rocher', 'Kit Kat',
  'Milky Way', 'Oreo triturada', 'Snickers', 'Twix', 'Crema de avellana',
  'Hersheys', 'Kinder',
];

const GALETAS_CEREALES_12 = [
  'Oreo', 'Chocapic', 'Granola', 'Corn flakes', 'Zucaritas', 'Avena tostada',
  'Galleta María', 'Graham crackers', 'Canelitas', 'Arcoíris', 'Maizoro', 'Froot Loops',
];

const FRUTAS_SEMILLAS_11 = [
  'Fresa', 'Mango', 'Plátano', 'Kiwi', 'Arándano', 'Frambuesa',
  'Coco rallado', 'Chía', 'Ajonjolí', 'Almendra fileteada', 'Nuez',
];

const GLASEADOS_10 = [
  'Rosa', 'Blanco', 'Chocolate', 'Caramelo', 'Pistache',
  'Nata', 'Matcha', 'Oreo', 'Rainbow', 'Fresa',
];

const CACAHUATES_8 = [
  'Japonés', 'Enchilado', 'Hot nuts', 'Con queso',
  'Con limón y sal', 'Holandes', 'Garapiñado', 'Habanero',
];

const FRUTAS_7 = ['Jícama', 'Pepino', 'Zanahoria', 'Piña', 'Manzana', 'Sandía', 'Mango'];

const SABRITAS_12 = [
  'Sabritas original', 'Sabritas limón', 'Rancheritos', 'Toreadas',
  'Takis fuego', 'Fritos', 'Doritos nacho', 'Doritos chile',
  'Cheetos', 'Rufles', 'Papas habanero', 'Churrumaiz',
];

const SABRITAS_16 = [
  ...SABRITAS_12, 'Flaming hot', 'Papas rancho', 'Papas queso', 'Timmy',
];

const GOMITAS_16 = [
  'Panditas', 'Panditas enchilados', 'Gusanitos', 'Gusanitos enchilados',
  'Mango gusano', 'Manguitos', 'Mango tajín', 'Tiburones',
  'Aros de manzana', 'Aros de durazno', 'Frutitas', 'Corazones',
  'Sandías', 'Piñas enchiladas', 'Dulci gomas', 'Pingüinos',
];

const DULCES_12 = [
  'Picafresas', 'Tamborines', 'Banderillas picantes', 'Banderillas dulce',
  'Banderillas azules', 'Paletas de elote', 'Paletas mix', 'Paletas de piña',
  'Paletas de corazón', 'Skwinkles', 'Pelón pelo rico mini', 'Bomba mix',
];

const GOMITAS_SMOOTHIE_10 = [
  'Panditas', 'Gomitas de tiburón', 'Gomita de manguito enchilado', 'Mangusano',
  'Gomita de gusano', 'Aros de manzana', 'Aros de durazno',
  'Gomitas de frutas', 'Gomitas de corazón', 'Ositos enchilados',
];

const CACAHUATES_SMOOTHIE_5 = [
  'Cacahuates japoneses', 'Cacahuates enchilados', 'Cacahuates con queso',
  'Cacahuates estilo hot nuts', 'Cacahuates con ajo',
];

const DULCES_SMOOTHIE_12 = [
  'Pica Fresas', 'Tamborines', 'Banderillas dulces', 'Banderillas picantes',
  'Banderillas azules', 'Paletas de elote', 'Paletas mango', 'Paletas de piña',
  'Skwinkles', 'Paletas bomba mix', 'Pelón pelo rico mini', 'Paletas de corazón',
];

const VERDURAS_3 = ['Jícama', 'Pepino', 'Zanahoria'];

// ─── Coffee Bar drinks ───────────────────────────────────────────────────────

const COFFEE_HOT_8 = [
  'Capuchino', 'Americano', 'Latte', 'Mocca', 'Té',
  'Chocolate caliente', 'Chai latte', 'Matcha latte',
];

const COFFEE_COLD_24 = [
  'Latte frío', 'Americano frío', 'Frappé de café', 'Frappé de vainilla',
  'Frappé de mocca', 'Frappé de caramelo', 'Frappé de avellana', 'Frappé de oreo',
  'Latte de vainilla frío', 'Latte de caramelo frío', 'Latte de avellana frío',
  'Latte de chocolate frío', 'Smoothie de café', 'Chocolate frío',
  'Té frío de limón', 'Té frío de durazno', 'Café de olla frío', 'Cold brew',
  'Cold brew de vainilla', 'Cold brew de caramelo', 'Matcha frío',
  'Chai frío', 'Latte de lavanda frío', 'Latte de coco frío',
];

// ─── Services data ───────────────────────────────────────────────────────────

export const SERVICES: Service[] = [
  // ── BEBIDAS ──────────────────────────────────────────────────────────────
  {
    id: 'coffee-bar',
    name: 'Coffee Bar',
    shortName: 'Coffee',
    description: 'Barra de café premium con 32 opciones de bebidas calientes y frías. Perfecta para eventos corporativos, bodas y celebraciones especiales.',
    category: 'bebidas',
    emoji: '☕',
    image: '/barras/coffee-bar.jpg',
    minPersonas: 30,
    selectionGroups: [
      {
        id: 'bebidas',
        label: 'Bebidas',
        instruction: 'Elige 4 bebidas en total entre calientes y frías',
        type: 'choose-n',
        totalMax: 4,
        categories: [
          { name: 'Calientes', options: COFFEE_HOT_8 },
          { name: 'Frías', options: COFFEE_COLD_24 },
        ],
      },
    ],
  },
  {
    id: 'smoothie-bar',
    name: 'Smoothie Bar',
    shortName: 'Smoothies',
    description: 'Smoothies frescos y naturales con frutas de temporada. Elige tus sabores favoritos y personaliza con toppings.',
    category: 'bebidas',
    image: '/barras/smoothies.jpg',
    minPersonas: 30,
    emoji: '🥤',
    selectionGroups: [
      {
        id: 'sabores',
        label: 'Sabores de Smoothie',
        instruction: 'Elige 2 sabores para tu evento',
        type: 'choose-n',
        totalMax: 2,
        options: ['Pepino', 'Mango', 'Fresa', 'Sandía', 'Piña', 'Frutos rojos'],
      },
      {
        id: 'toppings',
        label: 'Toppings',
        instruction: 'Elige 4 toppings para acompañar',
        type: 'choose-n',
        totalMax: 4,
        categories: [
          { name: 'Gomitas', options: GOMITAS_SMOOTHIE_10 },
          { name: 'Cacahuates', options: CACAHUATES_SMOOTHIE_5 },
          { name: 'Dulces', options: DULCES_SMOOTHIE_12 },
        ],
      },
    ],
  },
  {
    id: 'frappes-bar',
    name: 'Frappes Bar',
    shortName: 'Frappes',
    description: 'Deliciosos frappes artesanales en 16 sabores únicos. La bebida perfecta para eventos al aire libre.',
    category: 'bebidas',
    image: '/barras/frappes.jpg',
    minPersonas: 30,
    emoji: '🧋',
    selectionGroups: [
      {
        id: 'frappes',
        label: 'Sabores de Frappe',
        instruction: 'Elige 2 sabores de frappe para tu evento',
        type: 'choose-n',
        totalMax: 2,
        options: [
          'Vainilla', 'Chocolate', 'Caramelo', 'Café', 'Oreo', 'Fresa',
          'Mango', 'Limón', 'Mocca', 'Avellana', 'Dulce de leche',
          'Capuchino', 'Nuez', 'Pistache', 'Coco', 'Taro',
        ],
      },
    ],
  },
  {
    id: 'drinks-bar',
    name: 'Drinks Bar',
    shortName: 'Cócteles',
    description: 'Barra de cócteles con alcohol. 24 opciones de tragos clásicos y modernos para animar tu celebración.',
    category: 'bebidas',
    image: '/barras/drinks-bar.jpg',
    minPersonas: 30,
    emoji: '🍹',
    selectionGroups: [
      {
        id: 'cockteles',
        label: 'Cócteles con Alcohol',
        instruction: 'Elige 3 cócteles para tu barra',
        type: 'choose-n',
        totalMax: 3,
        options: [
          'Mojito clásico', 'Mojito de fresa', 'Mojito de mango',
          'Margarita clásica', 'Margarita de fresa', 'Margarita de mango', 'Margarita de tamarindo',
          'Piña colada', 'Blue lagoon', 'Sex on the beach', 'Tequila sunrise',
          'Cosmopolitan', 'Daiquiri de fresa', 'Daiquiri de mango',
          'Cuba libre', 'Gin tonic', 'Paloma', 'Cantarito',
          'Michelada', 'Clamato', 'Rusa', 'Vampiro', 'Destornillador', 'Screwdriver',
        ],
      },
    ],
  },
  {
    id: 'mocktails-bar',
    name: 'Mocktails Bar',
    shortName: 'Mocktails',
    description: 'Cócteles sin alcohol llenos de sabor y color. Perfectos para eventos familiares y baby showers.',
    category: 'bebidas',
    emoji: '🍸',
    image: '/barras/mocktails.jpg',
    minPersonas: 30,
    selectionGroups: [
      {
        id: 'mocktails',
        label: 'Mocktails (Sin Alcohol)',
        instruction: 'Elige 3 mocktails para tu barra',
        type: 'choose-n',
        totalMax: 3,
        options: [
          'Margarita fresa', 'Margarita clásica', 'Margarita mango', 'Piña colada',
          'Shirley temple', 'Mango Mule', 'Electric blue', 'San francisco',
          'Mojito clásico', 'Mojito frutos rojos', 'Butterfly pea tea',
          'Gin frutos rojos', 'Cranberry orange', 'Paloma',
          'Paraíso tropical', 'Spritz de kiwi y fresa',
        ],
      },
    ],
  },
  {
    id: 'mimosas-bar',
    name: 'Mimosas Bar',
    shortName: 'Mimosas',
    description: 'Elegante barra de mimosas clásicas con champagne. El toque sofisticado que tu evento merece.',
    category: 'bebidas',
    emoji: '🥂',
    image: '/barras/mimosas.jpg',
    minPersonas: 30,
    selectionGroups: [
      {
        id: 'menu',
        label: 'Menú Incluido',
        instruction: 'Barra completa de mimosas',
        type: 'fixed-display',
        fixedItems: [{ label: 'Sabor', items: ['Mimosa Clásica'] }],
      },
    ],
  },
  {
    id: 'cantaritos-bar',
    name: 'Cantaritos Bar',
    shortName: 'Cantaritos',
    description: 'Refrescantes cantaritos estilo jaliscience. Elige tu tequila favorito para una experiencia auténtica.',
    category: 'bebidas',
    emoji: '🍊',
    image: '/barras/cantaritos.jpg',
    minPersonas: 30,
    selectionGroups: [
      {
        id: 'tequila',
        label: 'Tequila',
        instruction: 'Elige 1 tequila para tu barra',
        type: 'choose-1',
        options: [
          'Jose Cuervo Cristalino',
          'Jose Cuervo Especial Plata',
          'Jose Cuervo Especial Reposado',
          'Gran Malo',
          'Tequila Azul',
        ],
      },
    ],
  },
  {
    id: 'tapiocas-bar',
    name: 'Tapiocas y Bubble Tea',
    shortName: 'Bubble Tea',
    description: 'Barra de tapiocas y bubble tea artesanal. Elige sabores, tipo de tapioca y perlas explosivas.',
    category: 'bebidas',
    image: '/barras/tapiocas.jpg',
    minPersonas: 30,
    emoji: '🧋',
    selectionGroups: [
      {
        id: 'tipo-tapioca',
        label: 'Tipo de Tapioca',
        instruction: 'Elige el tipo de tapioca para tu barra',
        type: 'choose-1',
        options: ['Clásica', 'Brown sugar'],
      },
      {
        id: 'sabores',
        label: 'Sabores de Bebida',
        instruction: 'Elige 2 sabores para tu evento',
        type: 'choose-n',
        totalMax: 2,
        options: [
          'Taro', 'Matcha', 'Té negro', 'Maracuyá', 'Té verde', 'Chai',
          'Soda Candy', 'Lichi', 'Dragón fruit', 'Mango tropical',
          'Soda italiana manzana verde', 'Soda italiana cereza',
          'Soda italiana mora azul', 'Soda italiana fresa', 'Soda italiana frutos rojos',
        ],
      },
      {
        id: 'perlas',
        label: 'Perlas Explosivas',
        instruction: 'Elige hasta 2 tipos de perlas explosivas',
        type: 'choose-n',
        totalMax: 2,
        options: ['Mango', 'Fresa', 'Mora azul', 'Manzana verde'],
      },
    ],
  },

  // ── DULCE ────────────────────────────────────────────────────────────────
  {
    id: 'hot-cakes-bar',
    name: 'Mini Hot Cakes Bar',
    shortName: 'Hot Cakes',
    description: 'Esponjosos mini hot cakes con toppings dulces y glaseados a elegir. Un clásico que encanta a chicos y grandes.',
    category: 'dulce',
    emoji: '🥞',
    image: '/barras/hot-cakes.jpg',
    minPersonas: 30,
    selectionGroups: [
      {
        id: 'toppings',
        label: 'Toppings',
        instruction: 'Elige 6 toppings (máx 2 por categoría)',
        type: 'choose-n',
        totalMax: 6,
        categories: [
          { name: 'Chocolates', options: CHOCOLATES_12, maxPerCategory: 2 },
          { name: 'Galetas y Cereales', options: GALETAS_CEREALES_12, maxPerCategory: 2 },
          { name: 'Frutas y Semillas', options: FRUTAS_SEMILLAS_11, maxPerCategory: 2 },
        ],
      },
      {
        id: 'glaseados',
        label: 'Glaseados',
        instruction: 'Elige 3 glaseados',
        type: 'choose-n',
        totalMax: 3,
        options: GLASEADOS_10,
      },
    ],
  },
  {
    id: 'donas-bar',
    name: 'Mini Donas Bar',
    shortName: 'Mini Donas',
    description: 'Mini donas esponjosas con variedad de toppings y glaseados coloridos para endulzar tu evento.',
    category: 'dulce',
    image: '/barras/donas.jpg',
    minPersonas: 30,
    emoji: '🍩',
    selectionGroups: [
      {
        id: 'toppings',
        label: 'Toppings',
        instruction: 'Elige 6 toppings (máx 2 por categoría)',
        type: 'choose-n',
        totalMax: 6,
        categories: [
          { name: 'Chocolates', options: CHOCOLATES_12, maxPerCategory: 2 },
          { name: 'Galetas y Cereales', options: GALETAS_CEREALES_12, maxPerCategory: 2 },
          { name: 'Frutas y Semillas', options: FRUTAS_SEMILLAS_11, maxPerCategory: 2 },
        ],
      },
      {
        id: 'glaseados',
        label: 'Glaseados',
        instruction: 'Elige 3 glaseados',
        type: 'choose-n',
        totalMax: 3,
        options: GLASEADOS_10,
      },
    ],
  },
  {
    id: 'crepas-bar',
    name: 'Crepas Bar',
    shortName: 'Crepas',
    description: 'Deliciosas crepas artesanales con rellenos dulces y salados. Personalizadas con tus toppings favoritos.',
    category: 'dulce',
    image: '/barras/crepas.jpg',
    minPersonas: 30,
    emoji: '🥐',
    selectionGroups: [
      {
        id: 'toppings',
        label: 'Toppings',
        instruction: 'Elige 6 toppings (máx 2 por categoría)',
        type: 'choose-n',
        totalMax: 6,
        categories: [
          { name: 'Frutas y Semillas', options: [...FRUTAS_SEMILLAS_11, 'Jamón'], maxPerCategory: 2 },
          { name: 'Galetas y Cereales', options: GALETAS_CEREALES_12, maxPerCategory: 2 },
          { name: 'Chocolates', options: CHOCOLATES_12, maxPerCategory: 2 },
        ],
      },
      {
        id: 'untables',
        label: 'Untables / Glaseados',
        instruction: 'Elige 4 untables para tus crepas',
        type: 'choose-n',
        totalMax: 4,
        options: [
          'Nutella', 'Cajeta', 'Mermelada de fresa', 'Mermelada de durazno',
          'Miel', 'Queso crema', 'Queso manchego', 'Dulce de leche',
          'Crema pastelera', 'Leche condensada', 'Chocolate oscuro', 'Caramelo',
        ],
      },
    ],
  },
  {
    id: 'helados-bar',
    name: 'Ice Cream Bar',
    shortName: 'Helados',
    description: 'Barra de helados artesanales con toppings premium. Elige sabores, toppings y glaseados a tu gusto.',
    category: 'dulce',
    image: '/barras/helados.jpg',
    minPersonas: 30,
    emoji: '🍦',
    selectionGroups: [
      {
        id: 'sabores',
        label: 'Sabores de Helado',
        instruction: 'Elige 3 sabores de helado',
        type: 'choose-n',
        totalMax: 3,
        options: ['Vainilla', 'Chocolate', 'Fresa', 'Mango', 'Limón', 'Pistache', 'Galleta', 'Cajeta'],
      },
      {
        id: 'toppings',
        label: 'Toppings',
        instruction: 'Elige 6 toppings (máx 2 por categoría)',
        type: 'choose-n',
        totalMax: 6,
        categories: [
          { name: 'Chocolates', options: CHOCOLATES_12, maxPerCategory: 2 },
          { name: 'Galetas y Cereales', options: GALETAS_CEREALES_12, maxPerCategory: 2 },
          { name: 'Frutas y Semillas', options: FRUTAS_SEMILLAS_11, maxPerCategory: 2 },
        ],
      },
      {
        id: 'glaseados',
        label: 'Glaseados',
        instruction: 'Elige 3 glaseados',
        type: 'choose-n',
        totalMax: 3,
        options: GLASEADOS_10,
      },
    ],
  },
  {
    id: 'cake-bar',
    name: 'Cake Bar',
    shortName: 'Cake Bar',
    description: 'Rebanadas de pastel artesanal en sabores exclusivos con toppings y glaseados a elegir.',
    category: 'dulce',
    emoji: '🎂',
    image: '/barras/cake-bar.jpg',
    minPersonas: 30,
    selectionGroups: [
      {
        id: 'sabor-pastel',
        label: 'Sabor de Pastel',
        instruction: 'Elige 1 sabor de pastel',
        type: 'choose-1',
        options: ['3 Leches', 'Vainilla', 'Red Velvet', 'Chocolate', 'Mokka'],
      },
      {
        id: 'toppings',
        label: 'Toppings',
        instruction: 'Elige 6 toppings (máx 2 por categoría)',
        type: 'choose-n',
        totalMax: 6,
        categories: [
          { name: 'Chocolates', options: CHOCOLATES_12, maxPerCategory: 2 },
          { name: 'Galetas y Cereales', options: GALETAS_CEREALES_12, maxPerCategory: 2 },
          { name: 'Frutas y Semillas', options: FRUTAS_SEMILLAS_11, maxPerCategory: 2 },
        ],
      },
      {
        id: 'glaseados',
        label: 'Glaseados',
        instruction: 'Elige 3 glaseados',
        type: 'choose-n',
        totalMax: 3,
        options: GLASEADOS_10,
      },
    ],
  },
  {
    id: 'rolles-bar',
    name: 'Rolles Bar',
    shortName: 'Rolles',
    description: 'Rolles artesanales esponjosos con toppings dulces y glaseados coloridos. Una experiencia única y deliciosa.',
    category: 'dulce',
    image: '/barras/rolles.jpg',
    minPersonas: 30,
    emoji: '🌀',
    selectionGroups: [
      {
        id: 'toppings',
        label: 'Toppings',
        instruction: 'Elige 6 toppings (máx 2 por categoría)',
        type: 'choose-n',
        totalMax: 6,
        categories: [
          { name: 'Chocolates', options: CHOCOLATES_12, maxPerCategory: 2 },
          { name: 'Galetas y Cereales', options: GALETAS_CEREALES_12, maxPerCategory: 2 },
          { name: 'Frutas y Semillas', options: FRUTAS_SEMILLAS_11, maxPerCategory: 2 },
        ],
      },
      {
        id: 'glaseados',
        label: 'Glaseados',
        instruction: 'Elige 3 glaseados',
        type: 'choose-n',
        totalMax: 3,
        options: GLASEADOS_10,
      },
    ],
  },
  {
    id: 'dessert-bar',
    name: 'Dessert Bar',
    shortName: 'Postres',
    description: 'Barra de postres premium con más de 25 opciones artesanales. Desde cheesecakes hasta galletas personalizadas.',
    category: 'dulce',
    image: '/barras/dessert-bar.jpg',
    minPersonas: 30,
    emoji: '🍮',
    selectionGroups: [
      {
        id: 'menu',
        label: 'Postres Disponibles',
        instruction: 'Menú completo incluido',
        type: 'fixed-display',
        fixedItems: [
          {
            label: 'Postres Clásicos',
            items: [
              'Carlota (limón o durazno)', 'Pay de limón', 'Tartaletas frutales',
              'Mini pan de queso de bola', 'Mojaditos', 'Beso de nuez',
              'Alfajores', 'Mini Queso napolitano', 'Mini flan', 'Tortuga', 'Miki pay de queso',
            ],
          },
          {
            label: 'Mini Cheesecakes',
            items: [
              'Mini cheesecake frutos rojos', 'Mini cheesecake de lotus',
              'Mini cheesecake oreo', 'Mini cheesecake de tortuga',
              'Mini cheesecake Ferrero', 'Mini cheesecake maracuyá',
            ],
          },
          {
            label: 'Dulces y Galletas',
            items: [
              'Brownie', 'Cupcakes', 'Galletas personalizadas', 'Polvorones',
              'Galletas de avellana y nuez', 'Mini muffins',
              'Empanaditas (queso y jamón / queso / carne)', 'Canapés rellenos',
            ],
          },
        ],
      },
    ],
  },

  // ── SALADO ───────────────────────────────────────────────────────────────
  {
    id: 'snack-bar',
    name: 'Snack Bar',
    shortName: 'Snacks',
    description: 'La barra más divertida con más de 50 opciones de botanas, gomitas, dulces y frutas. ¡Imposible resistirse!',
    category: 'salado',
    image: '/barras/snack-bar.jpg',
    minPersonas: 30,
    emoji: '🍿',
    selectionGroups: [
      {
        id: 'toppings',
        label: 'Toppings',
        instruction: 'Elige 12 toppings (máx 3 por categoría)',
        type: 'choose-n',
        totalMax: 12,
        categories: [
          { name: 'Sabritas', options: SABRITAS_16, maxPerCategory: 3 },
          { name: 'Gomitas', options: GOMITAS_16, maxPerCategory: 3 },
          { name: 'Dulces', options: DULCES_12, maxPerCategory: 3 },
          { name: 'Cacahuates', options: CACAHUATES_8, maxPerCategory: 3 },
          { name: 'Frutas', options: FRUTAS_7, maxPerCategory: 3 },
        ],
      },
    ],
  },
  {
    id: 'charcuteria-bar',
    name: 'Charcutería Bar',
    shortName: 'Charcutería',
    description: 'Elegante barra de charcutería con quesos finos, carnes frías, frutos y panes artesanales.',
    category: 'salado',
    emoji: '🧀',
    image: '/barras/charcuteria.jpg',
    minPersonas: 30,
    selectionGroups: [
      {
        id: 'toppings',
        label: 'Selección de Charcutería',
        instruction: 'Elige 9 elementos (máx 3 por categoría)',
        type: 'choose-n',
        totalMax: 9,
        categories: [
          {
            name: 'Pan y Galletas', maxPerCategory: 3,
            options: ['Pan baguette', 'Pan de campo', 'Galletas saladas', 'Tostadas melba', 'Crostini', 'Pan integral', 'Crackers'],
          },
          {
            name: 'Frutos Frescos y Secos', maxPerCategory: 3,
            options: [
              'Uvas verdes', 'Uvas moradas', 'Fresas', 'Arándanos', 'Frambuesas',
              'Higos', 'Dátiles', 'Nueces', 'Almendras', 'Pistaches',
              'Avellanas', 'Cacahuates naturales', 'Higos secos', 'Chabacanos secos', 'Pasas',
            ],
          },
          {
            name: 'Quesos', maxPerCategory: 3,
            options: [
              'Brie', 'Manchego', 'Gouda', 'Cheddar', 'Parmesano',
              'Mozzarella', 'Provolone', 'Queso de cabra', 'Camembert', 'Gruyere', 'Edam', 'Cotija',
            ],
          },
          {
            name: 'Carnes Frías', maxPerCategory: 3,
            options: ['Jamón serrano', 'Prosciutto', 'Salami', 'Pepperoni', 'Pavo ahumado', 'Chorizo ibérico', 'Bresaola'],
          },
        ],
      },
    ],
  },
  {
    id: 'esquites-bar',
    name: 'Esquites Bar',
    shortName: 'Esquites',
    description: 'Esquites estilo Crunch & Munch con botanas, cacahuates y verduras para armar tu combinación perfecta.',
    category: 'salado',
    image: '/barras/esquites.jpg',
    minPersonas: 30,
    emoji: '🌽',
    selectionGroups: [
      {
        id: 'toppings',
        label: 'Toppings',
        instruction: 'Elige 4 toppings para tus esquites',
        type: 'choose-n',
        totalMax: 4,
        categories: [
          { name: 'Sabritas', options: SABRITAS_12 },
          { name: 'Cacahuates', options: CACAHUATES_8 },
          { name: 'Verduras', options: VERDURAS_3 },
        ],
      },
    ],
  },
  {
    id: 'tostielotes-bar',
    name: 'Tostielotes Bar',
    shortName: 'Tostielotes',
    description: 'Tostielotes crujientes con las mismas opciones de toppings que los esquites para una experiencia diferente.',
    category: 'salado',
    emoji: '🌽',
    image: '/barras/tostielotes.jpg',
    minPersonas: 30,
    selectionGroups: [
      {
        id: 'toppings',
        label: 'Toppings',
        instruction: 'Elige 4 toppings para tus tostielotes',
        type: 'choose-n',
        totalMax: 4,
        categories: [
          { name: 'Sabritas', options: SABRITAS_12 },
          { name: 'Cacahuates', options: CACAHUATES_8 },
          { name: 'Verduras', options: VERDURAS_3 },
        ],
      },
    ],
  },
  {
    id: 'maruchan-bar',
    name: 'Maruchan Bar',
    shortName: 'Maruchan',
    description: 'La popular barra de maruchan con toppings al estilo snack. Un hit garantizado en cualquier reunión.',
    category: 'salado',
    image: '/barras/maruchan.jpg',
    minPersonas: 30,
    emoji: '🍜',
    selectionGroups: [
      {
        id: 'toppings',
        label: 'Toppings',
        instruction: 'Elige 4 toppings para tu maruchan',
        type: 'choose-n',
        totalMax: 4,
        categories: [
          { name: 'Sabritas', options: SABRITAS_12 },
          { name: 'Cacahuates', options: CACAHUATES_8 },
          { name: 'Verduras', options: VERDURAS_3 },
        ],
      },
    ],
  },
  {
    id: 'chilaquiles-bar',
    name: 'Chilaquiles Bar',
    shortName: 'Chilaquiles',
    description: 'Auténticos chilaquiles en salsa roja y verde. Elige tu proteína favorita para el desayuno perfecto.',
    category: 'salado',
    image: '/barras/chilaquiles.jpg',
    minPersonas: 30,
    emoji: '🌶️',
    selectionGroups: [
      {
        id: 'salsas',
        label: 'Salsas Incluidas',
        instruction: 'Ambas salsas están incluidas en tu barra',
        type: 'fixed-display',
        fixedItems: [{ label: 'Salsas', items: ['Salsa Roja', 'Salsa Verde'] }],
      },
      {
        id: 'proteina',
        label: 'Proteína',
        instruction: 'Elige 1 proteína para tus chilaquiles',
        type: 'choose-1',
        options: ['Pollo', 'Carne', 'Huevo'],
      },
    ],
  },
  {
    id: 'ice-bar',
    name: 'Ice Bar',
    shortName: 'Ice Bar',
    description: 'Barra de paletas artesanales heladas con toppings estilo antojito. Fresco, divertido y delicioso.',
    category: 'salado',
    emoji: '🍡',
    image: '/barras/ice-bar.jpg',
    minPersonas: 30,
    selectionGroups: [
      {
        id: 'sabor-paleta',
        label: 'Sabor de Paleta',
        instruction: 'Elige los sabores que quieras',
        type: 'choose-n',
        options: ['Variado', 'Mango', 'Piña', 'Fresa', 'Limón', 'Uva', 'Piña chamoy', 'Chicle', 'Mango chamoy'],
      },
      {
        id: 'toppings',
        label: 'Toppings',
        instruction: 'Elige 12 toppings (máx 3 por categoría)',
        type: 'choose-n',
        totalMax: 12,
        categories: [
          { name: 'Cacahuates', options: CACAHUATES_8, maxPerCategory: 3 },
          { name: 'Frutas', options: FRUTAS_7, maxPerCategory: 3 },
          { name: 'Dulces', options: DULCES_12, maxPerCategory: 3 },
          { name: 'Gomitas', options: GOMITAS_16, maxPerCategory: 3 },
        ],
      },
    ],
  },

  // ── BRUNCH ───────────────────────────────────────────────────────────────
  {
    id: 'brunch-bar',
    name: 'Barra Brunch',
    shortName: 'Brunch',
    description: 'Barra completa de brunch con alimentos, bebidas y postres para un evento matutino de lujo.',
    category: 'brunch',
    image: '/barras/brunch.jpg',
    emoji: '🥗',
    minPersonas: 20,
    selectionGroups: [
      {
        id: 'alimentos',
        label: 'Alimentos',
        instruction: 'Elige 3 alimentos',
        type: 'choose-n',
        totalMax: 3,
        options: [
          'Croissant', 'Bowls de frutas', 'Fruta', 'Tapas', 'Mini hot cakes',
          'Mini waffles', 'Mini donas', 'Mini sándwich', 'Cups de charcutería',
          'Mini chapatas', 'Mini hamburguesas', 'Mini pizzas', 'Canapés',
        ],
      },
      {
        id: 'bebidas',
        label: 'Bebidas',
        instruction: 'Elige 2 bebidas',
        type: 'choose-n',
        totalMax: 2,
        options: ['Jugo de naranja', 'Vitrolero de agua fresca', 'Botellas de agua', 'Café americano', 'Smoothie frutal'],
      },
      {
        id: 'panes-postres',
        label: 'Pan o Postre',
        instruction: 'Elige 1 opción',
        type: 'choose-n',
        totalMax: 1,
        options: [
          'Mix de pan dulce', 'Mix de galletas', 'Galletas de chispas', 'Brownies',
          'Muffins', 'Mini donas dulces', 'Empanaditas dulces', 'Empanaditas saladas',
        ],
      },
    ],
  },
  {
    id: 'desayuno-buffet',
    name: 'Barra Desayuno Buffet',
    shortName: 'Desayuno',
    description: 'Buffet de desayuno completo con alimentos, acompañamientos, bebidas y postres según tu paquete.',
    category: 'brunch',
    image: '/barras/desayuno-buffet.jpg',
    emoji: '🍳',
    minPersonas: 20,
    selectionGroups: [
      {
        id: 'menu',
        label: 'Catálogo del Buffet',
        instruction: 'Selección según paquete contratado',
        type: 'fixed-display',
        fixedItems: [
          {
            label: 'Alimentos',
            items: [
              'Chilaquiles rojos', 'Chilaquiles verde', 'Croissant', 'Chapatas', 'Bagels',
              'Tacos dorados', 'Salbutes', 'Molletes', 'Sincronizadas',
              'Huevos con salchicha', 'Huevos con jamón', 'Huevos estrellados',
            ],
          },
          {
            label: 'Acompañamientos',
            items: [
              'Hot cakes', 'Waffles', 'Frijoles', 'Fruta', 'Yogurt',
              'Bowls frutales', 'Ensalada', 'Tocino', 'Cereales (2 opciones)',
              'Tabla de queso y carnes frías', 'Avena y granola',
            ],
          },
          {
            label: 'Bebidas',
            items: [
              'Café americano', 'Jugo de naranja', 'Agua de jamaica', 'Agua de horchata',
              'Agua de limón', 'Agua de fresa limón', 'Jugo verde', 'Jugo de toronja',
              'Jugo de piña', 'Smoothie de frutos rojos', 'Smoothie chocolate',
              'Agua piña colada', 'Naranjada', 'Agua de frutas',
            ],
          },
          {
            label: 'Pan, Galletas y Postres',
            items: [
              'Mini hot cakes', 'Mini donas', 'Mix de pan dulce', 'Mix de galletas',
              'Galletas de chispas', 'Mini donas dulces', 'Muffins', 'Orejitas', 'Empanaditas',
            ],
          },
        ],
      },
    ],
  },
];

export const SERVICES_BY_CATEGORY = {
  bebidas: SERVICES.filter((s) => s.category === 'bebidas'),
  dulce: SERVICES.filter((s) => s.category === 'dulce'),
  salado: SERVICES.filter((s) => s.category === 'salado'),
  brunch: SERVICES.filter((s) => s.category === 'brunch'),
};

export const SERVICE_MAP = Object.fromEntries(SERVICES.map((s) => [s.id, s]));
