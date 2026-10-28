// Bibliothèque d'aliments « faciles et denses » pour un petit appétit.
// Valeurs par portion : kcal, p (protéines), c (glucides), f (lipides), en grammes.

export const FOOD_CATEGORIES = [
  { id: 'boost', label: 'Boost kcal' },
  { id: 'prot', label: 'Protéines' },
  { id: 'feculents', label: 'Féculents' },
  { id: 'laitiers', label: 'Laitiers' },
  { id: 'snacks', label: 'Snacks' },
  { id: 'repas', label: 'Repas' },
];

export const FOODS = [
  { id: 'shake', cat: 'boost', emoji: '🥤', name: 'Shake maison prise de masse', portion: '500 ml lait entier + 80 g avoine + banane + 30 g beurre de cacahuète', kcal: 905, p: 35, c: 105, f: 39, star: true },
  { id: 'pb', cat: 'boost', emoji: '🥜', name: 'Beurre de cacahuète', portion: '2 c. à soupe (30 g)', kcal: 180, p: 7, c: 6, f: 15 },
  { id: 'huile', cat: 'boost', emoji: '🫒', name: 'Huile d’olive', portion: '1 c. à soupe', kcal: 120, p: 0, c: 0, f: 14 },
  { id: 'amandes', cat: 'boost', emoji: '🌰', name: 'Amandes / noix', portion: 'Poignée (30 g)', kcal: 175, p: 6, c: 6, f: 15 },
  { id: 'avocat', cat: 'boost', emoji: '🥑', name: 'Avocat', portion: '½ avocat', kcal: 160, p: 2, c: 2, f: 15 },
  { id: 'dattes', cat: 'boost', emoji: '🌴', name: 'Dattes / fruits secs', portion: '50 g', kcal: 140, p: 1, c: 37, f: 0 },

  { id: 'oeufs', cat: 'prot', emoji: '🥚', name: 'Œufs', portion: '3 œufs', kcal: 215, p: 19, c: 1, f: 15 },
  { id: 'poulet', cat: 'prot', emoji: '🍗', name: 'Poulet', portion: '150 g cuit', kcal: 245, p: 46, c: 0, f: 5 },
  { id: 'steak', cat: 'prot', emoji: '🥩', name: 'Steak haché 5 %', portion: '125 g', kcal: 160, p: 26, c: 0, f: 6 },
  { id: 'thon', cat: 'prot', emoji: '🐟', name: 'Thon en boîte', portion: '140 g égoutté', kcal: 160, p: 36, c: 0, f: 1 },
  { id: 'saumon', cat: 'prot', emoji: '🍣', name: 'Saumon', portion: '125 g', kcal: 260, p: 25, c: 0, f: 17 },
  { id: 'whey', cat: 'prot', emoji: '💪', name: 'Whey', portion: '1 dose (30 g)', kcal: 120, p: 24, c: 3, f: 2 },
  { id: 'lentilles', cat: 'prot', emoji: '🫘', name: 'Lentilles / pois chiches', portion: '200 g cuits', kcal: 230, p: 18, c: 40, f: 1 },

  { id: 'riz', cat: 'feculents', emoji: '🍚', name: 'Riz', portion: '250 g cuit', kcal: 325, p: 7, c: 70, f: 1 },
  { id: 'pates', cat: 'feculents', emoji: '🍝', name: 'Pâtes', portion: '250 g cuites', kcal: 390, p: 14, c: 77, f: 2 },
  { id: 'avoine', cat: 'feculents', emoji: '🥣', name: 'Flocons d’avoine', portion: '80 g', kcal: 300, p: 11, c: 48, f: 6 },
  { id: 'pain', cat: 'feculents', emoji: '🍞', name: 'Pain complet', portion: '2 tranches (80 g)', kcal: 200, p: 8, c: 36, f: 3 },
  { id: 'pdt', cat: 'feculents', emoji: '🥔', name: 'Pommes de terre', portion: '300 g', kcal: 230, p: 6, c: 51, f: 0 },
  { id: 'granola', cat: 'feculents', emoji: '🥣', name: 'Granola', portion: '60 g', kcal: 270, p: 6, c: 38, f: 10 },

  { id: 'lait', cat: 'laitiers', emoji: '🥛', name: 'Lait entier', portion: '250 ml', kcal: 160, p: 8, c: 12, f: 9 },
  { id: 'fblanc', cat: 'laitiers', emoji: '🥄', name: 'Fromage blanc 3 %', portion: '200 g', kcal: 150, p: 15, c: 8, f: 6 },
  { id: 'skyr', cat: 'laitiers', emoji: '🥄', name: 'Skyr', portion: '150 g', kcal: 95, p: 16, c: 6, f: 0 },
  { id: 'grec', cat: 'laitiers', emoji: '🥛', name: 'Yaourt grec', portion: '150 g', kcal: 150, p: 9, c: 6, f: 10 },
  { id: 'fromage', cat: 'laitiers', emoji: '🧀', name: 'Fromage (emmental…)', portion: '30 g', kcal: 115, p: 8, c: 0, f: 9 },

  { id: 'banane', cat: 'snacks', emoji: '🍌', name: 'Banane', portion: '1 moyenne', kcal: 105, p: 1, c: 27, f: 0 },
  { id: 'choco', cat: 'snacks', emoji: '🍫', name: 'Chocolat noir', portion: '20 g', kcal: 115, p: 2, c: 7, f: 9 },
  { id: 'barre', cat: 'snacks', emoji: '🍫', name: 'Barre de céréales', portion: '1 barre', kcal: 120, p: 2, c: 20, f: 4 },
  { id: 'fruit', cat: 'snacks', emoji: '🍎', name: 'Fruit', portion: '1 fruit', kcal: 80, p: 0, c: 20, f: 0 },

  { id: 'sandwich', cat: 'repas', emoji: '🥖', name: 'Sandwich jambon-beurre', portion: '1 sandwich', kcal: 450, p: 20, c: 50, f: 18 },
  { id: 'cantine', cat: 'repas', emoji: '🍽️', name: 'Repas cantine / resto U', portion: 'Plat + féculent + dessert', kcal: 800, p: 35, c: 95, f: 28 },
  { id: 'fastfood', cat: 'repas', emoji: '🍔', name: 'Menu fast-food', portion: 'Burger + frites', kcal: 950, p: 35, c: 95, f: 45 },
  { id: 'pizza', cat: 'repas', emoji: '🍕', name: 'Pizza', portion: '½ pizza', kcal: 600, p: 25, c: 70, f: 22 },
];

export const MEAL_SLOTS = [
  { id: 'breakfast', label: 'Petit-déjeuner', emoji: '🌅' },
  { id: 'lunch', label: 'Déjeuner', emoji: '☀️' },
  { id: 'snack', label: 'Collation', emoji: '🍌' },
  { id: 'dinner', label: 'Dîner', emoji: '🌙' },
  { id: 'night', label: 'Collation du soir', emoji: '🥛' },
];

export const APPETITE_TIPS = [
  'Bois tes calories : le shake maison fait ~900 kcal et se boit en 2 minutes.',
  'Mange toutes les 3 h (5 prises) plutôt que 3 gros repas.',
  'Ajoute 1 c. à soupe d’huile d’olive sur tes féculents : +120 kcal invisibles.',
  'Garde une poignée d’amandes ou de dattes sur toi pour les collations.',
  'Évite de boire beaucoup d’eau juste avant un repas : ça coupe la faim.',
  'Après la boxe ou le foot : shake ou lait + banane dans l’heure.',
];
