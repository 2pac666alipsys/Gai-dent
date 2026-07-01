import { Category, Product, Region, UserProfile, UserRole, Order, OrderStatus, Promotion, AuditLog } from '../types';

export const SEED_REGIONS: Region[] = [
  { id: 'reg-oruro', name: 'Oruro', code: 'OR', isActive: true, baseDeliveryTimeHours: 48 },
  { id: 'reg-sc', name: 'Santa Cruz (Sede Central Proveedores)', code: 'SC', isActive: true, baseDeliveryTimeHours: 72 },
  { id: 'reg-lp', name: 'La Paz', code: 'LP', isActive: true, baseDeliveryTimeHours: 48 },
  { id: 'reg-cbba', name: 'Cochabamba', code: 'CB', isActive: false, baseDeliveryTimeHours: 48 }
];

export const SEED_CATEGORIES: Category[] = [
  { id: 'cat-rest', name: 'Restauradora y Estética', icon: 'Sparkles', description: 'Resinas compuestas, adhesivos, ionómeros de vidrio y pulidores.', isActive: true },
  { id: 'cat-endo', name: 'Endodoncia', icon: 'Activity', description: 'Limas, conos de gutapercha, cementos selladores e instrumental endodóntico.', isActive: true },
  { id: 'cat-impl', name: 'Implantología y Cirugía', icon: 'ShieldAlert', description: 'Hueso liofilizado, membranas, instrumental quirúrgico e implantes.', isActive: true },
  { id: 'cat-prev', name: 'Prevención y Profilaxis', icon: 'CheckCircle', description: 'Flúor, pastas de profilaxis, selladores de fosas y fisuras, cepillos.', isActive: true },
  { id: 'cat-orth', name: 'Ortodoncia', icon: 'Workflow', description: 'Brackets, arcos, elásticos, tubos bucales y accesorios de cementación.', isActive: true },
  { id: 'cat-bioseg', name: 'Bioseguridad y Desinfección', icon: 'Shield', description: 'Desinfectantes de superficies, jabones enzimáticos, guantes y mascarillas.', isActive: true }
];

export const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod-filtek-z250',
    name: 'Resina Filtek Z250 XT',
    brand: '3M ESPE',
    categoryId: 'cat-rest',
    description: 'Resina microhíbrida universal de fácil manejo, excelente estética y alta resistencia al desgaste. Indicada para restauraciones anteriores y posteriores.',
    presentation: 'Jeringa de 4g - Color A2',
    price: 185,
    stock: 25,
    isActive: true,
    image: 'composite',
    technicalSpec: 'Resina compuesta restauradora que utiliza relleno de zirconia/sílice para una alta resistencia a la fractura. El tamaño promedio de partícula es de 0.6 micrones. Radioopacidad excelente.',
    useProtocol: '1. Limpieza de cavidad.\n2. Grabado ácido (ácido fosfórico al 37% por 15 seg en dentina, 30 seg en esmalte).\n3. Lavar profundamente y secar sin deshidratar.\n4. Aplicar adhesivo de dos pasos o universal, fotopolimerizar por 10 seg.\n5. Aplicación incremental de resina (máximo 2mm por capa).\n6. Fotopolimerizar cada capa por 20 seg.\n7. Acabado y pulido.',
    scientificCitations: [
      'Anusavice, K. J. (2013). Phillips Science of Dental Materials. Elsevier Health Sciences.',
      'Sano, H. et al. (2015). Relationship between dentin bond strength and microtensile bond test. Journal of Dental Research.'
    ]
  },
  {
    id: 'prod-singlebond',
    name: 'Adhesivo Single Bond Universal',
    brand: '3M ESPE',
    categoryId: 'cat-rest',
    description: 'Adhesivo monocomponente compatible con todas las técnicas de grabado (total, selectivo y autocondicionante). Ofrece una alta fuerza de adhesión tanto en dentina húmeda como seca.',
    presentation: 'Frasco de 5ml',
    price: 320,
    stock: 18,
    isActive: true,
    image: 'adhesive',
    technicalSpec: 'Adhesivo que contiene monómero MDP para enlace químico con metales, zirconia e ionómero de vidrio. pH aproximado de 2.7.',
    useProtocol: '1. Preparar superficie.\n2. Opcional: Grabar esmalte de forma selectiva durante 15 seg.\n3. Aplicar adhesivo frotando la cavidad por 20 seg.\n4. Airear suavemente por 5 seg para evaporar el solvente (etanol/agua).\n5. Fotopolimerizar por 10 seg.',
    scientificCitations: [
      'Van Meerbeek, B. et al. (2011). State of the art of self-etch adhesives. Dental Materials, 27(1), 17-28.'
    ]
  },
  {
    id: 'prod-limas-c',
    name: 'Limas C-Pilot para conductos calcificados',
    brand: 'VDW',
    categoryId: 'cat-endo',
    description: 'Limas manuales de acero inoxidable de alta resistencia a la flexión, diseñadas especialmente para explorar conductos extremadamente estrechos o calcificados.',
    presentation: 'Caja x 6 unidades (Longitud 25mm, #10)',
    price: 110,
    stock: 35,
    isActive: true,
    image: 'files',
    technicalSpec: 'Limas de sección transversal cuadrada que incrementan la resistencia a la torsión. Mango ergonómico tipo CC-plus.',
    useProtocol: '1. Irrigar copiosamente con hipoclorito de sodio.\n2. Introducir la lima C-Pilot #10 con movimientos de vaivén de 1/4 de vuelta.\n3. Confirmar conductometría de manera radiográfica o mediante localizador apical.\n4. Desechar después de un uso en conductos severamente curvos debido a fatiga cíclica.',
    scientificCitations: [
      'Peters, O. A. (2004). Current challenges and concepts in the preparation of root canal systems. Journal of Endodontics.'
    ]
  },
  {
    id: 'prod-conos-gutapercha',
    name: 'Conos de Gutapercha Cónicos .04',
    brand: 'Meta Biomed',
    categoryId: 'cat-endo',
    description: 'Puntas de gutapercha calibradas a una conicidad del 4%, ideales para la obturación tridimensional rápida de conductos preparados con sistemas rotatorios.',
    presentation: 'Caja x 60 unidades (Surtido #15-40)',
    price: 85,
    stock: 40,
    isActive: true,
    image: 'gutta',
    technicalSpec: 'Gutapercha alfa modificada con excelente fluidez al calentarse. Libres de cadmio y altamente radiopacas.',
    useProtocol: '1. Seleccionar cono maestro que coincida con el calibre y conicidad del instrumento de memoria apical.\n2. Desinfectar el cono en hipoclorito de sodio por 1 min.\n3. Secar con puntas de papel absorbente.\n4. Aplicar una fina capa de cemento sellador endodóntico.\n5. Introducir el cono en el conducto y realizar condensación lateral o vertical.',
    scientificCitations: [
      'Schilder, H. (1967). Filling root canals in three dimensions. Dental Clinics of North America.'
    ]
  },
  {
    id: 'prod-hueso-biooss',
    name: 'Sustituto Óseo Geistlich Bio-Oss',
    brand: 'Geistlich',
    categoryId: 'cat-impl',
    description: 'Sustituto óseo de origen natural líder mundial en odontología regenerativa. Estructura altamente porosa idéntica al hueso humano que favorece la osteoconducción.',
    presentation: 'Vial de 0.5g (Granulometría fina)',
    price: 890,
    stock: 10,
    isActive: true,
    image: 'bone',
    technicalSpec: 'Matriz mineral ósea desproteinizada de origen bovino. Mantiene la microestructura trabecular e interconectada original.',
    useProtocol: '1. Realizar incisión y colgajo para exponer el defecto óseo.\n2. Hidratar Geistlich Bio-Oss con sangre del propio paciente o suero salino estéril.\n3. Rellenar el defecto sin compactar excesivamente para preservar el espacio intergranular.\n4. Cubrir con una membrana de colágeno absorbente para evitar invasión epitelial.\n5. Suturar de forma hermética y sin tensión.',
    scientificCitations: [
      'Buser, D. et al. (2013). Long-term stability of contour augmentation with Geistlich Bio-Oss. Journal of Dental Research.'
    ]
  },
  {
    id: 'prod-clorhexidina',
    name: 'Gel Profiláctico de Clorhexidina 0.12%',
    brand: 'Coltene',
    categoryId: 'cat-prev',
    description: 'Antiséptico de amplio espectro para el control químico de la placa bacteriana. Coadyuvante en el tratamiento de la gingivitis y periodontitis.',
    presentation: 'Tubo de 50g',
    price: 45,
    stock: 50,
    isActive: true,
    image: 'gel',
    technicalSpec: 'Gel hidrosoluble con Digluconato de Clorhexidina al 0.12%. Excelente sustantividad de hasta 12 horas en boca.',
    useProtocol: '1. Aplicar una pequeña cantidad en el cepillo dental o directamente en encías inflamadas con el dedo limpio.\n2. Masajear suavemente.\n3. Evitar enjuagarse con agua, comer o beber durante los siguientes 30 minutos.\n4. Utilizar preferentemente por las noches durante un máximo de 14 días para evitar tinciones dentales extrínsecas.',
    scientificCitations: [
      'Jones, C. G. (1997). Chlorhexidine: is it still the gold standard? Periodontology 2000, 15(1), 55-62.'
    ]
  },
  {
    id: 'prod-fluor-gel',
    name: 'Flúor en Gel Acidulado Clinpro',
    brand: '3M ESPE',
    categoryId: 'cat-prev',
    description: 'Gel de fluoruro fosfato acidulado (APF) al 1.23% de ion flúor. Acción rápida de 1 minuto que promueve la remineralización del esmalte y previene la caries.',
    presentation: 'Frasco de 480ml - Sabor Fresa',
    price: 130,
    stock: 12,
    isActive: true,
    image: 'fluor',
    technicalSpec: 'Concentración de 12,300 ppm de ion flúor. pH acidulado de 3.5 que maximiza la absorción de flúor.',
    useProtocol: '1. Profilaxis previa para remover placa y biofilm.\n2. Secar bien los cuadrantes dentales.\n3. Cargar la cubeta desechable hasta un tercio con el gel.\n4. Colocar en boca y pedir al paciente que presione suavemente por 1-4 minutos.\n5. Retirar cubeta y evacuar excesos con extractor de saliva.\n6. Indicar al paciente no ingerir alimentos, líquidos o enjuagarse por 30 minutos.',
    scientificCitations: [
      'Weyant, R. J. et al. (2013). Topical fluoride for caries prevention: Executive summary of updated clinical recommendations. JADA.'
    ]
  },
  {
    id: 'prod-brackets-metal',
    name: 'Brackets Metálicos Roth .022',
    brand: 'Morelli',
    categoryId: 'cat-orth',
    description: 'Brackets de perfil bajo de acero inoxidable 17-4 con base de malla arenada para una excelente fuerza de adhesión. Marcas de identificación de colores.',
    presentation: 'Caso Completo 5x5 (20 Brackets)',
    price: 150,
    stock: 30,
    isActive: true,
    image: 'brackets',
    technicalSpec: 'Prescripción Roth slot .022". Ganchos en caninos y premolares. Torque y angulación precisos grabados mecánicamente en la base.',
    useProtocol: '1. Profilaxis dental con pasta libre de flúor.\n2. Grabado ácido del esmalte por 15 seg, lavar y secar perfectamente.\n3. Aplicar resina primer de ortodoncia en el diente y adhesivo en la base del bracket.\n4. Posicionar el bracket utilizando la estrella de posicionamiento.\n5. Remover excedentes de resina alrededor de la base.\n6. Fotopolimerizar por 10-20 segundos por diente.',
    scientificCitations: [
      'Graber, L. W. et al. (2016). Orthodontics: Current Principles and Techniques. Elsevier.'
    ]
  },
  {
    id: 'prod-jabón-enzimático',
    name: 'Detergente Enzimático Alkazyme',
    brand: 'Alkapharm',
    categoryId: 'cat-bioseg',
    description: 'Detergente desinfectante tri-enzimático (proteasa, amilasa, lipasa) para el lavado manual y por ultrasonido de instrumental odontológico y endodóntico.',
    presentation: 'Frasco dosificador de 1 Litro',
    price: 240,
    stock: 15,
    isActive: true,
    image: 'soap',
    technicalSpec: 'Acción bactericida, fungicida y virucida. Dilución recomendada al 0.5% (5ml por cada litro de agua tibia).',
    useProtocol: '1. Dosificar 25ml de Alkazyme en 5 litros de agua tibia (aprox. 35°C).\n2. Sumergir el instrumental sucio inmediatamente después de su uso.\n3. Dejar actuar de 5 a 15 minutos.\n4. Cepillar suavemente las articulaciones y partes ranuradas si es necesario.\n5. Enjuagar con abundante agua purificada.\n6. Secar meticulosamente antes de proceder a la esterilización en autoclave.',
    scientificCitations: [
      'Rutala, W. A. et al. (2008). Guideline for Disinfection and Sterilization in Healthcare Facilities. CDC.'
    ]
  }
];

export const SEED_USERS: UserProfile[] = [
  {
    id: 'usr-super',
    role: UserRole.SUPERADMIN,
    name: 'Dra. Gabriela Flores',
    email: 'superadmin@gaiadent.com',
    phone: '+591 71234567',
    city: 'Oruro',
    regionId: 'reg-oruro',
    isActive: true,
    pinCode: '0000',
    biometricEnabled: true
  },
  {
    id: 'usr-admin',
    role: UserRole.ADMIN,
    name: 'Lic. Mauricio Zenteno',
    email: 'admin@gaiadent.com',
    phone: '+591 79876543',
    city: 'Oruro',
    regionId: 'reg-oruro',
    isActive: true,
    pinCode: '1111',
    biometricEnabled: false
  },
  {
    id: 'usr-dentist-1',
    role: UserRole.DENTIST,
    name: 'Dr. Alejandro Valdez',
    email: 'alejandro.valdez@gmail.com',
    phone: '+591 60412345',
    clinicName: 'Clínica Dental OdontoValdez',
    address: 'Calle Pagador entre Ayacucho y Junín #542',
    city: 'Oruro',
    regionId: 'reg-oruro',
    gpsCoordinates: { lat: -17.9642, lng: -67.1105 },
    isActive: true,
    pinCode: '4321',
    biometricEnabled: true
  },
  {
    id: 'usr-dentist-2',
    role: UserRole.DENTIST,
    name: 'Dra. Patricia Miranda',
    email: 'patty.dental@hotmail.com',
    phone: '+591 75145678',
    clinicName: 'Dental Care Miranda',
    address: 'Av. 6 de Octubre y Cochabamba Edif. Soria Galvarro Piso 2',
    city: 'Oruro',
    regionId: 'reg-oruro',
    gpsCoordinates: { lat: -17.9715, lng: -67.1141 },
    isActive: true,
    pinCode: '9876',
    biometricEnabled: false
  },
  {
    id: 'usr-dentist-3',
    role: UserRole.DENTIST,
    name: 'Dr. Hugo Banzer',
    email: 'banzer_dent@gmail.com',
    phone: '+591 70489012',
    clinicName: 'Consultorio Ortodoncia Banzer',
    address: 'Calle Bolívar y Velasco Galvarro',
    city: 'Oruro',
    regionId: 'reg-oruro',
    gpsCoordinates: { lat: -17.9681, lng: -67.1082 },
    isActive: true,
    pinCode: '2580',
    biometricEnabled: false
  },
  {
    id: 'usr-delivery-1',
    role: UserRole.DELIVERY,
    name: 'Carlos Choque (Repartidor Oruro)',
    email: 'carlos.delivery@gaiadent.com',
    phone: '+591 68123456',
    city: 'Oruro',
    regionId: 'reg-oruro',
    isActive: true,
    pinCode: '5555'
  },
  {
    id: 'usr-delivery-2',
    role: UserRole.DELIVERY,
    name: 'Roberto Vaca (Repartidor Santa Cruz)',
    email: 'roberto.delivery@gaiadent.com',
    phone: '+591 76098765',
    city: 'Santa Cruz',
    regionId: 'reg-sc',
    isActive: true,
    pinCode: '7777'
  }
];

export const SEED_PROMOTIONS: Promotion[] = [
  {
    id: 'prom-pack-resina',
    name: 'Promoción Resina 5+1',
    description: 'Compra 5 Resinas Filtek Z250 XT y llévate la 6ta unidad completamente gratis (Ideal para clínicas de alto flujo).',
    type: 'buy_x_get_y',
    buyQty: 5,
    getQty: 1,
    isActive: true
  },
  {
    id: 'prom-desc-prev',
    name: 'Descuento Especial en Prevención',
    description: '10% de descuento directo en toda la categoría de Prevención y Profilaxis durante el mes de salud dental.',
    type: 'category_discount',
    discountPercent: 10,
    categoryId: 'cat-prev',
    startDate: '2026-06-01',
    endDate: '2026-07-15',
    isActive: true
  },
  {
    id: 'prom-first-gift',
    name: 'Regalo por Primera Compra',
    description: 'Recibe un Gel Profiláctico de Clorhexidina de regalo en tu primer pedido de cualquier monto.',
    type: 'first_purchase_gift',
    isActive: true
  }
];

export const SEED_HISTORIC_ORDERS: Order[] = [
  {
    id: 'G-1001',
    clientId: 'usr-dentist-1',
    clientName: 'Dr. Alejandro Valdez',
    clinicName: 'Clínica Dental OdontoValdez',
    address: 'Calle Pagador entre Ayacucho y Junín #542',
    city: 'Oruro',
    phone: '+591 60412345',
    gpsCoordinates: { lat: -17.9642, lng: -67.1105 },
    items: [
      { productId: 'prod-filtek-z250', productName: 'Resina Filtek Z250 XT', brand: '3M ESPE', presentation: 'Jeringa de 4g - Color A2', price: 185, quantity: 3, receivedQuantity: 3, deliveredQuantity: 3 },
      { productId: 'prod-singlebond', productName: 'Adhesivo Single Bond Universal', brand: '3M ESPE', presentation: 'Frasco de 5ml', price: 320, quantity: 1, receivedQuantity: 1, deliveredQuantity: 1 }
    ],
    total: 875,
    status: OrderStatus.ENTREGADO,
    createdAt: '2026-06-25T10:30:00Z',
    updatedAt: '2026-06-27T16:45:00Z',
    deliveryTimeHours: 48,
    deliveryRiderId: 'usr-delivery-1',
    deliveryRiderName: 'Carlos Choque (Repartidor Oruro)',
    notes: 'Entregado conforme en recepción de la clínica.',
    deliverySignature: 'Dr. A. Valdez'
  },
  {
    id: 'G-1002',
    clientId: 'usr-dentist-2',
    clientName: 'Dra. Patricia Miranda',
    clinicName: 'Dental Care Miranda',
    address: 'Av. 6 de Octubre y Cochabamba Edif. Soria Galvarro Piso 2',
    city: 'Oruro',
    phone: '+591 75145678',
    gpsCoordinates: { lat: -17.9715, lng: -67.1141 },
    items: [
      { productId: 'prod-limas-c', productName: 'Limas C-Pilot para conductos calcificados', brand: 'VDW', presentation: 'Caja x 6 unidades (Longitud 25mm, #10)', price: 110, quantity: 2, receivedQuantity: 2, deliveredQuantity: 2 },
      { productId: 'prod-conos-gutapercha', productName: 'Conos de Gutapercha Cónicos .04', brand: 'Meta Biomed', presentation: 'Caja x 60 unidades (Surtido #15-40)', price: 85, quantity: 2, receivedQuantity: 2, deliveredQuantity: 2 }
    ],
    total: 390,
    status: OrderStatus.ENTREGADO,
    createdAt: '2026-06-26T14:15:00Z',
    updatedAt: '2026-06-28T11:20:00Z',
    deliveryTimeHours: 48,
    deliveryRiderId: 'usr-delivery-1',
    deliveryRiderName: 'Carlos Choque (Repartidor Oruro)',
    notes: 'Entregado en portería debido a cirugia en curso.',
    deliverySignature: 'Firma Recepcionista'
  },
  {
    id: 'G-1003',
    clientId: 'usr-dentist-3',
    clientName: 'Dr. Hugo Banzer',
    clinicName: 'Consultorio Ortodoncia Banzer',
    address: 'Calle Bolívar y Velasco Galvarro',
    city: 'Oruro',
    phone: '+591 70489012',
    gpsCoordinates: { lat: -17.9681, lng: -67.1082 },
    items: [
      { productId: 'prod-brackets-metal', productName: 'Brackets Metálicos Roth .022', brand: 'Morelli', presentation: 'Caso Completo 5x5 (20 Brackets)', price: 150, quantity: 4 }
    ],
    total: 600,
    status: OrderStatus.RECIBIDO,
    createdAt: '2026-06-30T09:00:00Z',
    updatedAt: '2026-06-30T09:00:00Z',
    deliveryTimeHours: 48
  },
  {
    id: 'G-1004',
    clientId: 'usr-dentist-1',
    clientName: 'Dr. Alejandro Valdez',
    clinicName: 'Clínica Dental OdontoValdez',
    address: 'Calle Pagador entre Ayacucho y Junín #542',
    city: 'Oruro',
    phone: '+591 60412345',
    gpsCoordinates: { lat: -17.9642, lng: -67.1105 },
    items: [
      { productId: 'prod-hueso-biooss', productName: 'Sustituto Óseo Geistlich Bio-Oss', brand: 'Geistlich', presentation: 'Vial de 0.5g (Granulometría fina)', price: 890, quantity: 1 },
      { productId: 'prod-jabón-enzimático', productName: 'Detergente Enzimático Alkazyme', brand: 'Alkapharm', presentation: 'Frasco dosificador de 1 Litro', price: 240, quantity: 1 }
    ],
    total: 1130,
    status: OrderStatus.RECIBIDO,
    createdAt: '2026-06-30T10:15:00Z',
    updatedAt: '2026-06-30T10:15:00Z',
    deliveryTimeHours: 48
  }
];

export const SEED_AUDIT_LOGS: AuditLog[] = [
  { id: 'log-1', timestamp: '2026-06-30T09:05:00Z', userId: 'usr-dentist-3', userName: 'Dr. Hugo Banzer', role: UserRole.DENTIST, action: 'Creación de Pedido', details: 'Creó el pedido G-1003 con 4 juegos de brackets Morelli.' },
  { id: 'log-2', timestamp: '2026-06-30T10:16:00Z', userId: 'usr-dentist-1', userName: 'Dr. Alejandro Valdez', role: UserRole.DENTIST, action: 'Creación de Pedido', details: 'Creó el pedido G-1004 con sustituto óseo Bio-Oss y detergente enzimático.' },
  { id: 'log-3', timestamp: '2026-06-30T12:00:00Z', userId: 'usr-admin', userName: 'Lic. Mauricio Zenteno', role: UserRole.ADMIN, action: 'Control de Catálogo', details: 'Actualizó stock de Resina Filtek Z250 XT tras auditoría física.' }
];
