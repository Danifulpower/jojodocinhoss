// Dados dos Chocotones
const chocotonesData = [
  // Tradicional
  {
    id: 'brigadeiro',
    name: 'Brigadeiro',
    category: 'tradicional',
    prices: {
      '100g': { saquinho: 15.00, acetato: 18.00 },
      '500g': { saquinho: 50.00, acetato: 70.00 }
    }
  },
  {
    id: 'branquinho',
    name: 'Branquinho',
    category: 'tradicional',
    prices: {
      '100g': { saquinho: 15.00, acetato: 18.00 },
      '500g': { saquinho: 50.00, acetato: 70.00 }
    }
  },
  {
    id: 'casadinho',
    name: 'Casadinho',
    category: 'tradicional',
    prices: {
      '100g': { saquinho: 15.00, acetato: 18.00 },
      '500g': { saquinho: 50.00, acetato: 70.00 }
    }
  },
  // Especial
  {
    id: 'prestigio',
    name: 'Prestígio',
    category: 'especial',
    prices: {
      '100g': { saquinho: 18.00, acetato: 20.00 },
      '500g': { saquinho: 55.00, acetato: 65.00 }
    }
  },
  {
    id: 'ouro-branco',
    name: 'Ouro Branco',
    category: 'especial',
    prices: {
      '100g': { saquinho: 18.00, acetato: 20.00 },
      '500g': { saquinho: 55.00, acetato: 65.00 }
    }
  },
  {
    id: 'stikadinho',
    name: 'Stikadinho',
    category: 'especial',
    prices: {
      '100g': { saquinho: 18.00, acetato: 20.00 },
      '500g': { saquinho: 55.00, acetato: 65.00 }
    }
  },
  // Premium
  {
    id: 'ninho-nutella',
    name: 'Ninho com Nutella',
    category: 'premium',
    prices: {
      '100g': { saquinho: 20.00, acetato: 22.00 },
      '500g': { saquinho: 60.00, acetato: 78.00 }
    }
  },
  {
    id: 'ferrero',
    name: 'Ferrero',
    category: 'premium',
    prices: {
      '100g': { saquinho: 20.00, acetato: 22.00 },
      '500g': { saquinho: 60.00, acetato: 78.00 }
    }
  },
  {
    id: 'kinder-bueno',
    name: 'Kinder Bueno',
    category: 'premium',
    prices: {
      '100g': { saquinho: 20.00, acetato: 22.00 },
      '500g': { saquinho: 60.00, acetato: 78.00 }
    }
  }
];

// Labels e cores das categorias
const categoryLabels = {
  tradicional: 'Tradicional',
  especial: 'Especial',
  premium: 'Premium'
};

const categoryColors = {
  tradicional: 'background: white; color: #333;',
  especial: 'background: whitewhite; color: #333;',
  premium: 'background: white; color: #333;'
};
