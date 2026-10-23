// Sample catalogue for NOIRÉ. Brands and products here are FICTIONAL placeholders
// so the store looks complete on day one; replace them with your real stock from
// /admin (Products). Prices are in EGP.

export const categories = [
  { name: 'Designer', nameAr: 'ماركات عالمية', slug: 'designer', description: 'Iconic fragrances from the big fashion houses.', descriptionAr: 'أشهر البرفانات من دور الأزياء العالمية.', sortOrder: 1 },
  { name: 'Niche', nameAr: 'نيش', slug: 'niche', description: 'Rare compositions from independent perfume houses.', descriptionAr: 'تركيبات نادرة من دور عطور مستقلة.', sortOrder: 2 },
];

export const collections = [
  { slug: 'oud-oriental', name: 'Oud & Oriental', nameAr: 'عود وشرقي', theme: 'oriental', tagline: 'Warm, deep and long-lasting.', taglineAr: 'دافي، عميق، وثابت طول اليوم.', description: 'Amber, oud, saffron and resins. Scents that stay with you from evening to morning.', descriptionAr: 'عنبر وعود وزعفران وبخور. روايح بتفضل معاك من بالليل للصبح.', sortOrder: 1 },
  { slug: 'fresh', name: 'Fresh & Citrus', nameAr: 'منعش وحمضيات', theme: 'fresh', tagline: 'Clean energy for hot days.', taglineAr: 'انتعاش نضيف للأيام الحر.', description: 'Bergamot, sea salt, green tea and white musk. Easy, bright and office-friendly.', descriptionAr: 'برجموت وملح بحر وشاي أخضر ومسك أبيض. خفيف ومنعش ومناسب للشغل.', sortOrder: 2 },
  { slug: 'floral', name: 'Florals', nameAr: 'ورود', theme: 'floral', tagline: 'Soft petals, real bouquets.', taglineAr: 'بتلات ناعمة، وبوكيهات حقيقية.', description: 'Rose, jasmine, peony and iris, from powdery and soft to bold and radiant.', descriptionAr: 'ورد وياسمين وفاوانيا وسوسن، من الناعم البودري للجريء المشع.', sortOrder: 3 },
  { slug: 'evening', name: 'Evening', nameAr: 'سهرات', theme: 'evening', tagline: 'Made to be noticed.', taglineAr: 'معمولة علشان تتلاحظ.', description: 'Rich, sweet and magnetic fragrances for dinners, weddings and late nights.', descriptionAr: 'روايح غنية وجذابة للعزومات والأفراح والسهر.', sortOrder: 4 },
  { slug: 'gifts', name: 'Gift Picks', nameAr: 'هدايا', theme: 'gifts', tagline: 'Safe choices everyone loves.', taglineAr: 'اختيارات مضمونة الكل بيحبها.', description: 'Crowd-pleasing scents that make the easiest gifts, wrapped free on request.', descriptionAr: 'روايح بتعجب الكل وتنفع هدية، ونغلفها مجاناً لو طلبت.', sortOrder: 5 },
];

// style: bottle look used for the 3D model and rendered photos
// sizes: [ml, price EGP, sale price EGP?]
export const products = [
  { name: 'Santal Nuit', nameAr: 'سانتال نوي', brand: 'Maison Ambre', slug: 'santal-nuit', sku: 'NR-SAN', category: 'niche', gender: 'unisex', family: 'woody', concentration: 'edp', collections: ['oud-oriental', 'evening'], featured: true,
    sizes: [[50, 6200], [100, 9400]], style: { shape: 'classic', liquidHex: '#c98a4b', capHex: '#c9a45c', cap: 'cube' }, bg: 'sand',
    description: 'Creamy Australian sandalwood wrapped in smoky cardamom and a dry leather base. Quiet on the skin at first, then it grows warmer every hour.',
    descriptionAr: 'صندل أسترالي كريمي ملفوف بهيل مدخن وقاعدة جلد ناشفة. هادي في الأول على البشرة، وبيدفى أكتر مع كل ساعة.',
    specs: { top: 'Cardamom, Pink pepper', heart: 'Sandalwood, Iris, Violet', base: 'Leather, Cedar, Amber', topAr: 'هيل، فلفل وردي', heartAr: 'صندل، سوسن، بنفسج', baseAr: 'جلد، أرز، عنبر', longevity: 5, sillage: 4, seasons: ['autumn', 'winter'] } },
  { name: 'Rose Velours', nameAr: 'روز فيلور', brand: 'Atelier Lune', slug: 'rose-velours', sku: 'NR-RVE', category: 'designer', gender: 'women', family: 'floral', concentration: 'edp', collections: ['floral', 'gifts'], featured: true, newArrival: true,
    sizes: [[30, 2900], [50, 4300], [100, 6400]], style: { shape: 'round', liquidHex: '#e7a3ad', capHex: '#efe7dc', cap: 'sphere', capMetal: false }, bg: 'blush',
    description: 'A velvet Turkish rose softened with lychee and raspberry, settling on white musk and a touch of vanilla. Feminine without being sweet.',
    descriptionAr: 'ورد تركي ناعم زي القطيفة مع ليتشي وتوت، وبيستقر على مسك أبيض ولمسة فانيليا. أنثوي من غير ما يبقى مسكّر.',
    specs: { top: 'Lychee, Raspberry', heart: 'Turkish rose, Peony', base: 'White musk, Vanilla', topAr: 'ليتشي، توت', heartAr: 'ورد تركي، فاوانيا', baseAr: 'مسك أبيض، فانيليا', longevity: 4, sillage: 3, seasons: ['spring', 'autumn'] } },
  { name: 'Bleu Marin', nameAr: 'بلو مارين', brand: 'Rive Noire', slug: 'bleu-marin', sku: 'NR-BLM', category: 'designer', gender: 'men', family: 'aquatic', concentration: 'edt', collections: ['fresh', 'gifts'], featured: true,
    sizes: [[50, 3300], [100, 4900, 4200]], style: { shape: 'tall', liquidHex: '#5d8fb3', glassHex: '#dfe9f0', capHex: '#1d2733', cap: 'tall', capMetal: false }, bg: 'stone',
    description: 'Sea salt, grapefruit and cool mint over driftwood and ambergris. The easy, clean scent you can wear every single day.',
    descriptionAr: 'ملح بحر وجريب فروت ونعناع بارد فوق خشب البحر والعنبر. الريحة النضيفة اللي تنفع تحطها كل يوم.',
    specs: { top: 'Grapefruit, Mint, Sea salt', heart: 'Lavender, Geranium', base: 'Driftwood, Ambergris, Musk', topAr: 'جريب فروت، نعناع، ملح بحر', heartAr: 'لافندر، عطر', baseAr: 'خشب البحر، عنبر، مسك', longevity: 3, sillage: 3, seasons: ['spring', 'summer'] } },
  { name: 'Oud Royale', nameAr: 'عود رويال', brand: 'Orientale', slug: 'oud-royale', sku: 'NR-OUD', category: 'niche', gender: 'unisex', family: 'oriental', concentration: 'parfum', collections: ['oud-oriental', 'evening'], featured: true,
    sizes: [[50, 8900], [100, 13500]], style: { shape: 'faceted', liquidHex: '#7a3d1d', capHex: '#b8893e', cap: 'cylinder' }, bg: 'sand',
    description: 'Dark Cambodian oud with Taif rose and saffron, finished with frankincense and smoked amber. A deep, royal scent that lasts all day.',
    descriptionAr: 'عود كمبودي غامق مع ورد طايفي وزعفران، وبينتهي ببخور وعنبر مدخن. ريحة ملكية عميقة بتعيش طول اليوم.',
    specs: { top: 'Saffron, Pink pepper', heart: 'Oud, Taif rose', base: 'Frankincense, Amber, Patchouli', topAr: 'زعفران، فلفل وردي', heartAr: 'عود، ورد طايفي', baseAr: 'بخور، عنبر، باتشولي', longevity: 5, sillage: 5, seasons: ['autumn', 'winter'] } },
  { name: 'Néroli Blanc', nameAr: 'نيرولي بلان', brand: 'Blanc Studio', slug: 'neroli-blanc', sku: 'NR-NER', category: 'niche', gender: 'unisex', family: 'citrus', concentration: 'edp', collections: ['fresh'], newArrival: true,
    sizes: [[50, 5200], [100, 7800]], style: { shape: 'classic', liquidHex: '#f0d98a', capHex: '#f4f0e8', cap: 'cube', capMetal: false }, bg: 'cream',
    description: 'Sparkling neroli and bergamot over orange blossom and clean white musk. Bright, airy and impossible to dislike.',
    descriptionAr: 'نيرولي وبرجموت منعشين فوق زهر البرتقال ومسك أبيض نضيف. خفيف ومشرق ومستحيل ميعجبكش.',
    specs: { top: 'Neroli, Bergamot, Lemon', heart: 'Orange blossom, Petitgrain', base: 'White musk, Vetiver', topAr: 'نيرولي، برجموت، ليمون', heartAr: 'زهر البرتقال، بتيجرين', baseAr: 'مسك أبيض، فيتيفر', longevity: 3, sillage: 3, seasons: ['spring', 'summer'] } },
  { name: 'Vanille Noire', nameAr: 'فانيل نوار', brand: 'Atelier Lune', slug: 'vanille-noire', sku: 'NR-VAN', category: 'designer', gender: 'women', family: 'gourmand', concentration: 'edp', collections: ['evening', 'gifts'], featured: true,
    sizes: [[50, 4600], [100, 6900]], style: { shape: 'orb', liquidHex: '#5a2e1c', glassHex: '#3a2b26', capHex: '#c9a45c', cap: 'cube', glassOpacity: 0.3 }, bg: 'blush',
    description: 'Bourbon vanilla, tonka bean and dark chocolate with a hint of coffee. Sweet, warm and addictive, made for evenings.',
    descriptionAr: 'فانيليا بوربون وتونكا وشوكولاتة غامقة مع لمسة قهوة. حلوة ودافية وبتشد، معمولة للسهرات.',
    specs: { top: 'Coffee, Pear', heart: 'Bourbon vanilla, Jasmine', base: 'Tonka bean, Cocoa, Patchouli', topAr: 'قهوة، كمثرى', heartAr: 'فانيليا بوربون، ياسمين', baseAr: 'تونكا، كاكاو، باتشولي', longevity: 5, sillage: 4, seasons: ['autumn', 'winter'] } },
  { name: 'Iris Poudré', nameAr: 'إيريس بودريه', brand: 'Blanc Studio', slug: 'iris-poudre', sku: 'NR-IRI', category: 'niche', gender: 'women', family: 'floral', concentration: 'edp', collections: ['floral'],
    sizes: [[50, 5600], [100, 8300]], style: { shape: 'flacon', liquidHex: '#cdb6d6', capHex: '#c9a45c', cap: 'disc' }, bg: 'stone',
    description: 'Powdery iris and violet over soft suede and cashmere wood. Elegant, quiet and close to the skin.',
    descriptionAr: 'سوسن وبنفسج بودري فوق شمواه ناعم وخشب الكشمير. أنيق وهادي وقريب من البشرة.',
    specs: { top: 'Carrot seed, Mandarin', heart: 'Iris, Violet', base: 'Suede, Cashmeran, Musk', topAr: 'بذر الجزر، يوسفي', heartAr: 'سوسن، بنفسج', baseAr: 'شمواه، خشب الكشمير، مسك', longevity: 4, sillage: 2, seasons: ['spring', 'autumn'] } },
  { name: 'Cuir Fumé', nameAr: 'كوير فومي', brand: 'Rive Noire', slug: 'cuir-fume', sku: 'NR-CUI', category: 'designer', gender: 'men', family: 'leather', concentration: 'edp', collections: ['evening'],
    sizes: [[50, 4400], [100, 6600, 5800]], style: { shape: 'tall', liquidHex: '#3b2418', glassHex: '#2b2522', capHex: '#141414', cap: 'cube', capMetal: false, glassOpacity: 0.32 }, bg: 'stone',
    description: 'Smoked birch leather, black pepper and tobacco leaf over a dry vetiver base. Confident and serious.',
    descriptionAr: 'جلد مدخن وفلفل أسود وورق تبغ فوق قاعدة فيتيفر ناشفة. واثق وجد.',
    specs: { top: 'Black pepper, Bergamot', heart: 'Birch leather, Tobacco leaf', base: 'Vetiver, Labdanum', topAr: 'فلفل أسود، برجموت', heartAr: 'جلد البتولا، ورق تبغ', baseAr: 'فيتيفر، لادن', longevity: 4, sillage: 4, seasons: ['autumn', 'winter'] } },
  { name: 'Thé Vert', nameAr: 'تيه فير', brand: 'Casa Verde', slug: 'the-vert', sku: 'NR-THE', category: 'designer', gender: 'unisex', family: 'fresh', concentration: 'edt', collections: ['fresh', 'gifts'],
    sizes: [[50, 2700], [100, 3900]], style: { shape: 'round', liquidHex: '#a9c48a', capHex: '#c9a45c', cap: 'cylinder' }, bg: 'sage',
    description: 'Green tea, fig leaf and mint with a soft jasmine heart. Light, calming and perfect for summer mornings.',
    descriptionAr: 'شاي أخضر وورق تين ونعناع مع قلب ياسمين ناعم. خفيف ومهدي ومثالي لصباحات الصيف.',
    specs: { top: 'Green tea, Mint', heart: 'Fig leaf, Jasmine', base: 'White musk, Cedar', topAr: 'شاي أخضر، نعناع', heartAr: 'ورق تين، ياسمين', baseAr: 'مسك أبيض، أرز', longevity: 2, sillage: 2, seasons: ['spring', 'summer'] } },
  { name: 'Ambre Sultan', nameAr: 'أمبر سلطان', brand: 'Orientale', slug: 'ambre-sultan', sku: 'NR-AMB', category: 'niche', gender: 'men', family: 'oriental', concentration: 'edp', collections: ['oud-oriental'],
    sizes: [[50, 6800], [100, 9900]], style: { shape: 'classic', liquidHex: '#a0521f', capHex: '#8a6a3b', cap: 'cylinder', capMetal: false }, bg: 'sand',
    description: 'Golden amber, benzoin and dried herbs with a resinous, slightly spicy trail. Warm and generous.',
    descriptionAr: 'عنبر ذهبي وجاوي وأعشاب مجففة، وبيسيب أثر راتنجي فيه شوية بهارات. دافي وكريم.',
    specs: { top: 'Oregano, Bay leaf', heart: 'Amber, Benzoin', base: 'Sandalwood, Vanilla, Myrrh', topAr: 'زعتر بري، ورق غار', heartAr: 'عنبر، جاوي', baseAr: 'صندل، فانيليا، مر', longevity: 5, sillage: 4, seasons: ['autumn', 'winter'] } },
  { name: 'Jasmin Soleil', nameAr: 'جاسمين سوليه', brand: 'Casa Verde', slug: 'jasmin-soleil', sku: 'NR-JAS', category: 'designer', gender: 'women', family: 'floral', concentration: 'edt', collections: ['floral', 'fresh'], newArrival: true,
    sizes: [[50, 3100], [100, 4500]], style: { shape: 'flacon', liquidHex: '#f2cf7c', capHex: '#c9a45c', cap: 'sphere' }, bg: 'cream',
    description: 'Sunny jasmine sambac with coconut water and a sparkle of mandarin. Joyful, summery and easy to love.',
    descriptionAr: 'ياسمين مشمس مع مية جوز الهند ولمعة يوسفي. مبهج وصيفي وسهل تحبه.',
    specs: { top: 'Mandarin, Coconut water', heart: 'Jasmine sambac, Tiare', base: 'Musk, Sandalwood', topAr: 'يوسفي، مية جوز الهند', heartAr: 'ياسمين سامباك، تياري', baseAr: 'مسك، صندل', longevity: 3, sillage: 3, seasons: ['spring', 'summer'] } },
  { name: 'Épices Noires', nameAr: 'إيبيس نوار', brand: 'Maison Ambre', slug: 'epices-noires', sku: 'NR-EPI', category: 'niche', gender: 'men', family: 'spicy', concentration: 'parfum', collections: ['evening', 'oud-oriental'], soldOut: true,
    sizes: [[50, 7400], [100, 10900]], style: { shape: 'faceted', liquidHex: '#5b2a2a', glassHex: '#3d2d2b', capHex: '#c9a45c', cap: 'tall', glassOpacity: 0.3 }, bg: 'stone',
    description: 'Black pepper, clove and cinnamon over smoked woods and dark amber. Bold, spicy and unforgettable.',
    descriptionAr: 'فلفل أسود وقرنفل وقرفة فوق أخشاب مدخنة وعنبر غامق. جريء وحار وميتنسيش.',
    specs: { top: 'Black pepper, Cinnamon', heart: 'Clove, Nutmeg, Rose', base: 'Smoked woods, Amber, Oud', topAr: 'فلفل أسود، قرفة', heartAr: 'قرنفل، جوزة الطيب، ورد', baseAr: 'أخشاب مدخنة، عنبر، عود', longevity: 5, sillage: 5, seasons: ['winter'] } },
];

export function stockFor(sku) {
  let h = 0; for (const c of sku) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const r = h % 10;
  return r === 0 ? 2 : r < 3 ? 4 : 6 + (h % 14);
}

export const sampleReviews = [
  ['santal-nuit', 'Sample review', 'Cairo', 5, 'Lasts all day', 'Sample review text. Replace with real customer reviews before launch.'],
  ['rose-velours', 'Sample review', 'Alexandria', 5, 'Beautiful rose', 'Sample review text. Replace with real customer reviews before launch.'],
  ['oud-royale', 'Sample review', 'Giza', 4, 'Very strong oud', 'Sample review text. Replace with real customer reviews before launch.'],
  ['bleu-marin', 'Sample review', 'Mansoura', 5, 'My daily scent', 'Sample review text. Replace with real customer reviews before launch.'],
];
