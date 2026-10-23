// Default editable content and store settings. Every key is stored in the
// `settings` table and edited from /admin; these values are only used to fill
// gaps (e.g. a field added in a later version).

export const DEFAULTS = {
  store: {
    name: 'NOIRÉ',
    tagline: 'Authentic fragrances, delivered.',
    logoMediaId: null,
    currency: 'EGP',
    email: 'hello@noire.example',
    phone: '+20 100 000 0000',
    whatsapp: '+20 100 000 0000',
    address: 'Store address placeholder, Cairo, Egypt',
    hours: 'Sat–Thu, 11:00–22:00',
    showMap: true,
    mapUrl: 'https://maps.google.com/?q=Cairo,Egypt',
    social: { instagram: 'https://instagram.com/', facebook: 'https://facebook.com/', tiktok: 'https://tiktok.com/', x: '' },
    seoTitle: 'NOIRÉ — Authentic Perfumes in Egypt',
    seoDescription: '100% authentic designer and niche perfumes. Cash on delivery across Egypt, free gift wrapping.',
    lowStockThreshold: 3,
    taxRate: 14, // percent
    taxIncluded: true, // true: catalogue prices include tax (shown for information); false: tax added at checkout
    taxLabel: 'VAT (included)',
    paymentMethods: { cod: true, online: true },
    codFee: 0, // piasters
    notifyEmail: '',
    notifyOnNewOrder: true,
    notifyCustomerOnStatus: true,
  },
  store_ar: {
    tagline: 'برفانات أصلية، لحد باب البيت.',
    address: 'عنوان المحل، القاهرة، مصر',
    hours: 'السبت–الخميس، ١١ص–١٠م',
    seoTitle: 'NOIRÉ — برفانات أصلية في مصر',
    seoDescription: 'برفانات عالمية ونيش أصلية ١٠٠٪. الدفع عند الاستلام في كل مصر، وتغليف هدايا مجاني.',
    taxLabel: 'ضريبة القيمة المضافة (شاملة)',
  },
  shipping: {
    freeShippingOver: 300000, // piasters; 0 = never free
    regions: [
      { name: 'Cairo', fee: 6000, days: '1–2', cities: ['Nasr City', 'Heliopolis', 'Maadi', 'New Cairo', 'Downtown', 'Zamalek', 'Shorouk', 'Madinaty', 'Other'] },
      { name: 'Giza', fee: 6000, days: '1–2', cities: ['Dokki', 'Mohandessin', 'Sheikh Zayed', '6th of October', 'Haram', 'Other'] },
      { name: 'Alexandria', fee: 7500, days: '2–3', cities: ['Smouha', 'Sidi Gaber', 'Miami', 'Agami', 'Borg El Arab', 'Other'] },
      { name: 'Delta', fee: 8500, days: '2–4', cities: ['Mansoura', 'Tanta', 'Zagazig', 'Damanhour', 'Kafr El Sheikh', 'Shebin El Kom', 'Other'] },
      { name: 'Canal', fee: 8500, days: '2–4', cities: ['Port Said', 'Ismailia', 'Suez', 'Other'] },
      { name: 'Upper Egypt', fee: 10000, days: '3–5', cities: ['Minya', 'Assiut', 'Sohag', 'Qena', 'Luxor', 'Aswan', 'Other'] },
      { name: 'Red Sea & Sinai', fee: 12000, days: '3–6', cities: ['Hurghada', 'El Gouna', 'Sharm El Sheikh', 'Dahab', 'Marsa Alam', 'Other'] },
      { name: 'North Coast', fee: 9500, days: '2–4', cities: ['Sahel', 'Marsa Matrouh', 'El Alamein', 'Other'] },
    ],
  },
  home: {
    announcement: { enabled: true, text: '100% authentic · Free shipping over EGP 3,000 · Cash on delivery', href: '/shop' },
    hero: {
      eyebrow: 'Authentic fragrances',
      headline: 'Find the scent that stays.',
      text: 'Designer and niche perfumes, sealed and 100% original. Choose by notes, mood or season and pay when it arrives.',
      primaryLabel: 'Shop perfumes', primaryHref: '/shop',
      secondaryLabel: 'Find your scent', secondaryHref: '/finder',
      imageMediaId: null, // poster image shown until the 3D bottle is ready
      bottle: { shape: 'classic', liquidHex: '#e2a35c', capHex: '#c9a45c', cap: 'cube' },
    },
    sections: [
      { key: 'brands', enabled: true, title: 'The houses we carry', text: '' },
      { key: 'featured', enabled: true, title: 'Signature picks', text: 'The bottles our customers come back for.' },
      { key: 'families', enabled: true, title: 'Shop by scent family', text: 'Not sure what you like? Start from how you want to smell.' },
      { key: 'collections', enabled: true, title: 'Collections', text: 'Curated edits for every mood and moment.' },
      { key: 'finder', enabled: true, title: 'Find your signature scent', text: 'Answer four quick questions and we will suggest perfumes that match your taste.', label: 'Start the quiz', href: '/finder' },
      { key: 'campaign', enabled: true, title: 'Worn close, remembered long', text: 'Every bottle is sourced from official distributors, stored away from heat and light, and sealed until it reaches you.' },
      { key: 'bestsellers', enabled: true, title: 'Best sellers', text: 'Most ordered this month.' },
      { key: 'newarrivals', enabled: true, title: 'New arrivals', text: 'Just landed.' },
      { key: 'trust', enabled: true, title: 'Why NOIRÉ', text: '' },
      { key: 'reviews', enabled: true, title: 'What customers say', text: 'Real words from real orders.' },
      { key: 'newsletter', enabled: true, title: 'First to know', text: 'New arrivals, restocks and private offers. One email a month.' },
    ],
    campaignImages: [], // media ids for the campaign section
    featuredProductSlugs: [], // empty = use products flagged "featured"
    bestsellerSlugs: [], // empty = calculated from orders
  },
  home_ar: {
    announcement: { text: 'أصلي ١٠٠٪ · شحن مجاني فوق ٣٠٠٠ جنيه · الدفع عند الاستلام' },
    hero: {
      eyebrow: 'برفانات أصلية',
      headline: 'لاقي الريحة اللي بتفضل معاك.',
      text: 'برفانات عالمية ونيش، متغلفة وأصلية ١٠٠٪. اختار على حسب الروايح أو المود أو الموسم، وادفع لما توصلك.',
      primaryLabel: 'تسوق البرفانات', secondaryLabel: 'اعرف ريحتك',
    },
    sections: [
      { key: 'brands', title: 'الماركات اللي عندنا' },
      { key: 'featured', title: 'اختياراتنا', text: 'الإزايز اللي عملاءنا بيرجعولها تاني.' },
      { key: 'families', title: 'تسوق حسب عائلة الريحة', text: 'مش عارف إيه اللي يعجبك؟ ابدأ من الإحساس اللي عايزه.' },
      { key: 'collections', title: 'المجموعات', text: 'اختيارات متنسقة لكل مود ومناسبة.' },
      { key: 'finder', title: 'لاقي ريحتك المميزة', text: 'جاوب على ٤ أسئلة سريعة، وهنقترحلك برفانات تناسب ذوقك.', label: 'ابدأ الأسئلة' },
      { key: 'campaign', title: 'قريبة منك، وبتتفتكر', text: 'كل إزازة جاية من موزعين رسميين، ومتخزنة بعيد عن الحرارة والنور، ومتغلفة لحد ما توصلك.' },
      { key: 'bestsellers', title: 'الأكثر مبيعاً', text: 'الأكتر طلباً الشهر ده.' },
      { key: 'newarrivals', title: 'وصل حديثاً', text: 'لسه نازل.' },
      { key: 'trust', title: 'ليه NOIRÉ' },
      { key: 'reviews', title: 'آراء العملاء', text: 'كلام حقيقي من طلبات حقيقية.' },
      { key: 'newsletter', title: 'خليك أول واحد يعرف', text: 'الجديد، ورجوع المنتجات اللي خلصت، وعروض خاصة. إيميل واحد في الشهر.' },
    ],
  },
  about: {
    headline: 'Fragrance, without the doubt.',
    intro: 'NOIRÉ is a placeholder brand story. Replace this paragraph with who you are, how you started and why you sell perfume.',
    story: 'Write the story of the store here: the first bottle you sold, the first loyal customer, the moment it became a business. Keep it short and specific.',
    philosophy: 'Explain how you choose what to stock: only sealed, original bottles from official distributors, a range that covers every budget, and honest advice instead of hard selling.',
    process: [
      { title: 'Sourced', text: 'Describe where your bottles come from and how you verify they are original.' },
      { title: 'Stored', text: 'Describe how stock is kept away from heat, light and humidity.' },
      { title: 'Checked', text: 'Describe the batch-code and seal checks before every shipment.' },
      { title: 'Delivered', text: 'Describe packaging, gift wrapping and delivery.' },
    ],
    timeline: [
      { year: 'Year 1', title: 'First bottle', text: 'Add your first milestone.' },
      { year: 'Year 2', title: 'First 1,000 customers', text: 'Add a growth milestone.' },
      { year: 'Year 3', title: 'Online store', text: 'Add when you started selling online.' },
      { year: 'Now', title: 'NOIRÉ', text: 'Add your current chapter.' },
    ],
    difference: [
      { title: '100% authentic', text: 'Explain your authenticity guarantee.' },
      { title: 'Honest advice', text: 'Explain how you help customers choose.' },
      { title: 'Gift-ready', text: 'Explain wrapping, notes and gift services.' },
    ],
    values: ['Authenticity', 'Care', 'Honest pricing', 'Fast delivery'],
    images: [], // media ids for editorial photography
  },
  about_ar: {
    headline: 'برفان، من غير قلق.',
    intro: 'دي قصة مؤقتة للبراند. غيّر الفقرة دي واكتب انتو مين، وبدأتوا إزاي، وليه بتبيعوا برفانات.',
    story: 'اكتب هنا قصة المحل: أول إزازة بعتها، وأول عميل دايم، واللحظة اللي بقت فيها شغلانة. خليها قصيرة ومحددة.',
    philosophy: 'اشرح بتختار المنتجات إزاي: إزايز أصلية متغلفة من موزعين رسميين بس، واختيارات تناسب كل الميزانيات، ونصيحة صادقة مش بيع وخلاص.',
    process: [
      { title: 'مصدر موثوق', text: 'اشرح الإزايز جاية منين وبتتأكدوا إنها أصلية إزاي.' },
      { title: 'تخزين صح', text: 'اشرح بتخزنوا المنتجات بعيد عن الحرارة والنور والرطوبة إزاي.' },
      { title: 'فحص', text: 'اشرح فحص كود التصنيع والختم قبل كل شحنة.' },
      { title: 'توصيل', text: 'اشرح التغليف وتغليف الهدايا والتوصيل.' },
    ],
    timeline: [
      { year: 'السنة ١', title: 'أول إزازة', text: 'ضيف أول محطة.' },
      { year: 'السنة ٢', title: 'أول ١٠٠٠ عميل', text: 'ضيف محطة نمو.' },
      { year: 'السنة ٣', title: 'المتجر الأونلاين', text: 'ضيف إمتى بدأتوا تبيعوا أونلاين.' },
      { year: 'دلوقتي', title: 'NOIRÉ', text: 'ضيف المرحلة الحالية.' },
    ],
    difference: [
      { title: 'أصلي ١٠٠٪', text: 'اشرح ضمان الأصالة بتاعكم.' },
      { title: 'نصيحة بصدق', text: 'اشرح بتساعدوا العملاء يختاروا إزاي.' },
      { title: 'جاهز للهدية', text: 'اشرح التغليف والكروت وخدمات الهدايا.' },
    ],
    values: ['الأصالة', 'الاهتمام', 'أسعار عادلة', 'توصيل سريع'],
  },
  contact: {
    intro: 'Questions about a scent, an order or a gift? Write to us and we reply within one working day.',
    faqs: [
      { group: 'Authenticity', q: 'Are your perfumes original?', a: 'Yes. Every bottle is 100% original, sealed and sourced from official distributors. Batch codes can be checked on request.' },
      { group: 'Orders', q: 'How do I pay?', a: 'Cash on delivery is available across Egypt. Card payment appears at checkout when it is enabled for the store.' },
      { group: 'Orders', q: 'Do you offer gift wrapping?', a: 'Yes, free. Add a note at checkout with your message and we will wrap it.' },
      { group: 'Shipping', q: 'How long does delivery take?', a: 'Cairo and Giza: 1–2 working days. Other regions: 2–6 working days depending on the city.' },
      { group: 'Shipping', q: 'How much is shipping?', a: 'Shipping is calculated by region at checkout. Orders above the free-shipping threshold ship free.' },
      { group: 'Returns', q: 'Can I return a perfume?', a: 'Sealed, unopened bottles can be returned within 14 days of delivery. Opened bottles can only be returned if faulty.' },
    ],
  },
  contact_ar: {
    intro: 'عندك سؤال عن ريحة أو طلب أو هدية؟ ابعتلنا وهنرد عليك خلال يوم عمل.',
    faqs: [
      { group: 'الأصالة', q: 'البرفانات عندكم أصلية؟', a: 'أيوه. كل إزازة أصلية ١٠٠٪ ومتغلفة وجاية من موزعين رسميين. وممكن نتحقق من كود التصنيع لو طلبت.' },
      { group: 'الطلبات', q: 'أدفع إزاي؟', a: 'الدفع عند الاستلام متاح في كل مصر. والدفع بالكارت بيظهر في صفحة الطلب لما يكون متفعل.' },
      { group: 'الطلبات', q: 'فيه تغليف هدايا؟', a: 'أيوه ومجاني. اكتب رسالتك في الملاحظة وانت بتطلب، وهنغلفها.' },
      { group: 'الشحن', q: 'التوصيل بياخد قد إيه؟', a: 'القاهرة والجيزة: يوم أو يومين عمل. باقي المحافظات: من ٢ لـ٦ أيام عمل حسب المدينة.' },
      { group: 'الشحن', q: 'الشحن بكام؟', a: 'الشحن بيتحسب حسب المنطقة في صفحة الطلب. والطلبات فوق حد الشحن المجاني بتتشحن ببلاش.' },
      { group: 'الاسترجاع', q: 'ينفع أرجّع البرفان؟', a: 'الإزايز المتغلفة اللي متفتحتش ينفع ترجع خلال ١٤ يوم من الاستلام. المفتوحة بترجع بس لو فيها عيب.' },
    ],
  },
  policies: {
    shipping: 'Orders are prepared within one working day.\n\nDelivery times and fees depend on your region and are shown at checkout before you confirm.\n\nYou will be contacted by phone before delivery.',
    returns: 'You can return sealed, unopened bottles within 14 days of delivery.\n\nContact us with your order number to arrange a pickup. Refunds are issued after the item is inspected.\n\nFor hygiene reasons, opened bottles can be returned only if they are faulty.',
    privacy: 'This is placeholder privacy policy text. Describe what personal data you collect (name, phone, email, address), why you collect it (to deliver orders and provide support), how long you keep it and how customers can request deletion.\n\nHave this text reviewed before launch.',
    terms: 'This is placeholder terms and conditions text. Describe ordering, pricing, payment, delivery, returns, authenticity guarantee and liability.\n\nHave this text reviewed before launch.',
  },
  policies_ar: {
    shipping: 'الطلبات بتتجهز خلال يوم عمل.\n\nمواعيد ومصاريف التوصيل بتختلف حسب منطقتك، وبتظهرلك في صفحة الطلب قبل ما تأكد.\n\nهنكلمك تليفونياً قبل التوصيل.',
    returns: 'ينفع ترجّع الإزايز المتغلفة اللي متفتحتش خلال ١٤ يوم من الاستلام.\n\nكلمنا برقم الطلب علشان نرتب الاستلام. الفلوس بترجع بعد فحص المنتج.\n\nعلشان النظافة، الإزايز المفتوحة بترجع بس لو فيها عيب.',
    privacy: 'دي سياسة خصوصية مؤقتة. اكتب البيانات اللي بتجمعوها (الاسم، التليفون، الإيميل، العنوان)، وليه (علشان توصيل الطلبات والدعم)، وبتحتفظوا بيها قد إيه، والعميل يطلب مسحها إزاي.\n\nخلي حد يراجع النص ده قبل الإطلاق.',
    terms: 'دي شروط وأحكام مؤقتة. اكتب عن الطلب، والأسعار، والدفع، والتوصيل، والاسترجاع، وضمان الأصالة، والمسؤولية.\n\nخلي حد يراجع النص ده قبل الإطلاق.',
  },
  footer: {
    about: '100% authentic designer and niche perfumes, delivered across Egypt.',
    newsletterTitle: 'Join the list',
    newsletterText: 'New arrivals and private offers, once a month.',
    copyright: 'NOIRÉ. All rights reserved.',
  },
  footer_ar: {
    about: 'برفانات عالمية ونيش أصلية ١٠٠٪، بتوصل لكل مصر.',
    newsletterTitle: 'اشترك معانا',
    newsletterText: 'الجديد والعروض الخاصة، مرة في الشهر.',
    copyright: 'NOIRÉ. جميع الحقوق محفوظة.',
  },
};
