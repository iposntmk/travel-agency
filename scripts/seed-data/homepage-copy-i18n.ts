// Per-locale translations for SiteSettings.homepage CMS copy. English base lives
// in scripts/seed.ts (upsertSiteSettings). Applied by
// scripts/seed-homepage-copy-i18n.ts via payload.update({ ..., locale }).
//
// Only localized TEXT fields are here. `enabled` toggles, action hrefs (URLs)
// and why-us `icon` are non-localized and stay untouched. Arrays (hero trust
// items, why-us items) are index-aligned with the English seed order.

export type NonDefaultLocale = "fr" | "es" | "de" | "it" | "pt" | "zh-Hans" | "zh-Hant";
export type LT = Partial<Record<NonDefaultLocale, string>>;

type SectionCopy = Record<string, LT>;

export const homepageCopyI18n: Record<string, SectionCopy> = {
  search: {
    eyebrow: {
      fr: "Planifiez votre voyage", es: "Planifica tu viaje", de: "Plane deine Reise",
      it: "Pianifica il tuo viaggio", pt: "Planeje sua viagem",
      "zh-Hans": "规划您的旅程", "zh-Hant": "規劃您的旅程",
    },
    title: {
      fr: "Trouvez votre circuit", es: "Encuentra tu tour", de: "Finde deine Tour",
      it: "Trova il tuo tour", pt: "Encontre o seu tour",
      "zh-Hans": "找到您的行程", "zh-Hant": "找到您的行程",
    },
    subtitle: {
      fr: "Recherchez par mot-clé, destination et type de circuit — nous vous menons directement aux départs correspondants.",
      es: "Busca por palabra clave, destino y tipo de tour: te llevamos directo a las salidas que coinciden.",
      de: "Suche nach Stichwort, Reiseziel und Tour-Typ — wir bringen dich direkt zu passenden Abfahrten.",
      it: "Cerca per parola chiave, destinazione e tipo di tour: ti portiamo dritto alle partenze corrispondenti.",
      pt: "Pesquise por palavra-chave, destino e tipo de tour — levamos você direto às partidas correspondentes.",
      "zh-Hans": "按关键词、目的地和行程类型搜索——直达匹配的出发团。",
      "zh-Hant": "按關鍵字、目的地和行程類型搜尋——直達匹配的出發團。",
    },
  },
  whoWeAre: {
    heading: {
      fr: "Qui sommes-nous", es: "Quiénes somos", de: "Wer wir sind",
      it: "Chi siamo", pt: "Quem somos", "zh-Hans": "关于我们", "zh-Hant": "關於我們",
    },
    title: {
      fr: "Une agence de voyage au Vietnam bâtie sur la connaissance locale.",
      es: "Una agencia de viajes en Vietnam construida sobre el conocimiento local.",
      de: "Eine Reiseagentur in Vietnam, aufgebaut auf lokalem Wissen.",
      it: "Un'agenzia di viaggi in Vietnam costruita sulla conoscenza locale.",
      pt: "Uma agência de viagens no Vietnã construída sobre o conhecimento local.",
      "zh-Hans": "一家立足于本地知识的越南旅行社。",
      "zh-Hant": "一家立足於本地知識的越南旅行社。",
    },
    body: {
      fr: "TC Travel Vietnam conçoit des circuits privés, des expériences en petit groupe, des transferts en voiture, des croisières et des propositions sur mesure, avec le soutien direct de spécialistes locaux.",
      es: "TC Travel Vietnam diseña tours privados, experiencias en grupos pequeños, traslados en coche, cruceros y propuestas a medida con el apoyo directo de especialistas locales.",
      de: "TC Travel Vietnam gestaltet Privatreisen, Erlebnisse in kleinen Gruppen, Autotransfers, Kreuzfahrten und maßgeschneiderte Angebote mit direkter Unterstützung durch lokale Spezialisten.",
      it: "TC Travel Vietnam progetta tour privati, esperienze in piccoli gruppi, trasferimenti in auto, crociere e proposte su misura con il supporto diretto di specialisti locali.",
      pt: "A TC Travel Vietnam cria passeios privados, experiências em pequenos grupos, transferências de carro, cruzeiros e propostas personalizadas com o apoio direto de especialistas locais.",
      "zh-Hans": "TC Travel Vietnam 在本地专家的直接支持下，设计私人旅行、小团体验、汽车接送、游轮和定制方案。",
      "zh-Hant": "TC Travel Vietnam 在本地專家的直接支援下，設計私人旅遊、小團體驗、汽車接送、遊輪和客製化方案。",
    },
    actionLabel: {
      fr: "Rencontrez notre équipe", es: "Conoce a nuestro equipo", de: "Lernen Sie unser Team kennen",
      it: "Incontra il nostro team", pt: "Conheça a nossa equipe",
      "zh-Hans": "认识我们的团队", "zh-Hant": "認識我們的團隊",
    },
  },
  featuredTours: {
    eyebrow: {
      fr: "Sélectionnés à la main", es: "Seleccionados a mano", de: "Handverlesen",
      it: "Selezionati a mano", pt: "Escolhidos a dedo",
      "zh-Hans": "精心挑选", "zh-Hant": "精心挑選",
    },
    title: {
      fr: "Circuits en vedette", es: "Tours destacados", de: "Empfohlene Touren",
      it: "Tour in evidenza", pt: "Tours em destaque",
      "zh-Hans": "精选行程", "zh-Hant": "精選行程",
    },
    subtitle: {
      fr: "Départs sélectionnés pour la saison — guides privés, petits groupes et visites à pied gratuites.",
      es: "Salidas seleccionadas para la temporada: guías privados, grupos pequeños y tours a pie gratuitos.",
      de: "Ausgewählte Abfahrten für die Saison — private Guides, kleine Gruppen und kostenlose Stadtrundgänge.",
      it: "Partenze selezionate per la stagione: guide private, piccoli gruppi e tour a piedi gratuiti.",
      pt: "Partidas selecionadas para a temporada — guias privados, pequenos grupos e passeios a pé gratuitos.",
      "zh-Hans": "为本季精选的出发团——私人向导、小团和免费步行游。",
      "zh-Hant": "為本季精選的出發團——私人嚮導、小團和免費步行遊。",
    },
    actionLabel: {
      fr: "Voir tous les circuits", es: "Ver todos los tours", de: "Alle Touren ansehen",
      it: "Vedi tutti i tour", pt: "Ver todos os tours",
      "zh-Hans": "查看所有行程", "zh-Hant": "查看所有行程",
    },
    tabLabel: {
      fr: "CIRCUITS PRIVÉS", es: "TOURS PRIVADOS", de: "PRIVATREISEN",
      it: "TOUR PRIVATI", pt: "PASSEIOS PRIVADOS",
      "zh-Hans": "私人旅行", "zh-Hant": "私人旅遊",
    },
  },
  cruises: {
    eyebrow: {
      fr: "Sur l'eau", es: "En el agua", de: "Auf dem Wasser",
      it: "Sull'acqua", pt: "Na água", "zh-Hans": "水上之旅", "zh-Hant": "水上之旅",
    },
    title: {
      fr: "Meilleures croisières", es: "Mejores cruceros", de: "Beste Kreuzfahrten",
      it: "Migliori crociere", pt: "Melhores cruzeiros",
      "zh-Hans": "最佳游轮", "zh-Hant": "最佳遊輪",
    },
    subtitle: {
      fr: "Croisières d'une nuit en baie et sur les fleuves, avec cabines, repas et activités à bord — Réservez maintenant · Payez plus tard.",
      es: "Cruceros de una noche por bahías y ríos, con camarotes, comidas y actividades a bordo — Reserva ahora · Paga después.",
      de: "Übernachtungs-Kreuzfahrten in Buchten und auf Flüssen, mit Kabinen, Mahlzeiten und Bordaktivitäten — Jetzt buchen · Später zahlen.",
      it: "Crociere con pernottamento in baia e sui fiumi, con cabine, pasti e attività a bordo — Prenota ora · Paga dopo.",
      pt: "Cruzeiros com pernoite em baías e rios, com cabines, refeições e atividades a bordo — Reserve agora · Pague depois.",
      "zh-Hans": "海湾与河流过夜游轮，含船舱、餐食和船上活动——先预订·后付款。",
      "zh-Hant": "海灣與河流過夜遊輪，含船艙、餐食和船上活動——先預訂·後付款。",
    },
    actionLabel: {
      fr: "Voir toutes les croisières", es: "Ver todos los cruceros", de: "Alle Kreuzfahrten ansehen",
      it: "Vedi tutte le crociere", pt: "Ver todos os cruzeiros",
      "zh-Hans": "查看所有游轮", "zh-Hant": "查看所有遊輪",
    },
  },
  destinations: {
    eyebrow: {
      fr: "Où aller", es: "A dónde ir", de: "Wohin",
      it: "Dove andare", pt: "Para onde ir", "zh-Hans": "去哪里", "zh-Hant": "去哪裡",
    },
    title: {
      fr: "Destinations populaires", es: "Destinos populares", de: "Beliebte Reiseziele",
      it: "Destinazioni popolari", pt: "Destinos populares",
      "zh-Hans": "热门目的地", "zh-Hant": "熱門目的地",
    },
    subtitle: {
      fr: "Le Vietnam central et au-delà — explorez circuits, transferts en voiture, guides et activités dans chaque ville-étape.",
      es: "El centro de Vietnam y más allá: explora tours, traslados en coche, guías y cosas que hacer en cada ciudad base.",
      de: "Zentralvietnam und darüber hinaus — entdecke Touren, Autotransfers, Guides und Aktivitäten in jeder Stadt.",
      it: "Il Vietnam centrale e oltre: esplora tour, trasferimenti in auto, guide e cose da fare in ogni città base.",
      pt: "O centro do Vietnã e além — explore tours, transferências de carro, guias e o que fazer em cada cidade base.",
      "zh-Hans": "越南中部及周边——探索每座枢纽城市的行程、汽车接送、向导和活动。",
      "zh-Hant": "越南中部及周邊——探索每座樞紐城市的行程、汽車接送、嚮導和活動。",
    },
    actionLabel: {
      fr: "Toutes les destinations", es: "Todos los destinos", de: "Alle Reiseziele",
      it: "Tutte le destinazioni", pt: "Todos os destinos",
      "zh-Hans": "所有目的地", "zh-Hant": "所有目的地",
    },
  },
  freeTours: {
    eyebrow: {
      fr: "L'expérience avant tout", es: "La experiencia primero", de: "Erlebnis zuerst",
      it: "L'esperienza prima di tutto", pt: "A experiência em primeiro lugar",
      "zh-Hans": "体验为先", "zh-Hant": "體驗為先",
    },
    title: {
      fr: "Rejoignez nos circuits gratuits", es: "Únete a nuestros tours gratuitos", de: "Nimm an unseren kostenlosen Touren teil",
      it: "Partecipa ai nostri tour gratuiti", pt: "Junte-se aos nossos tours gratuitos",
      "zh-Hans": "参加我们的免费行程", "zh-Hant": "參加我們的免費行程",
    },
    subtitle: {
      fr: "Visites à pied et à vélo gratuites au Vietnam central. Pourboire apprécié — l'inscription utilise le même flux Réservez maintenant · Payez plus tard.",
      es: "Tours a pie y en bicicleta gratuitos en el centro de Vietnam. Propina apreciada: la inscripción usa el mismo flujo Reserva ahora · Paga después.",
      de: "Kostenlose Stadtrundgänge und Radtouren in Zentralvietnam. Trinkgeld willkommen — die Anmeldung nutzt denselben Jetzt buchen · Später zahlen-Ablauf.",
      it: "Tour a piedi e in bici gratuiti nel Vietnam centrale. Mancia gradita: l'iscrizione usa lo stesso flusso Prenota ora · Paga dopo.",
      pt: "Passeios a pé e de bicicleta gratuitos no centro do Vietnã. Gorjeta apreciada — a inscrição usa o mesmo fluxo Reserve agora · Pague depois.",
      "zh-Hans": "越南中部免费步行和骑行游。欢迎小费——报名使用相同的先预订·后付款流程。",
      "zh-Hant": "越南中部免費步行和騎行遊。歡迎小費——報名使用相同的先預訂·後付款流程。",
    },
    actionLabel: {
      fr: "Voir les circuits gratuits", es: "Ver tours gratuitos", de: "Kostenlose Touren ansehen",
      it: "Vedi i tour gratuiti", pt: "Ver tours gratuitos",
      "zh-Hans": "查看免费行程", "zh-Hant": "查看免費行程",
    },
  },
  featuredExperiences: {
    eyebrow: {
      fr: "Partenaires externes", es: "Socios externos", de: "Externe Partner",
      it: "Partner esterni", pt: "Parceiros externos",
      "zh-Hans": "外部合作伙伴", "zh-Hant": "外部合作夥伴",
    },
    title: {
      fr: "Expériences en vedette", es: "Experiencias destacadas", de: "Empfohlene Erlebnisse",
      it: "Esperienze in evidenza", pt: "Experiências em destaque",
      "zh-Hans": "精选体验", "zh-Hant": "精選體驗",
    },
    subtitle: {
      fr: "Excursions, billets et activités sélectionnés par des partenaires de confiance — réservés en externe, pas via TC Travel.",
      es: "Excursiones, entradas y actividades seleccionadas por socios de confianza: se reservan externamente, no a través de TC Travel.",
      de: "Tagestouren, Tickets und Aktivitäten von vertrauenswürdigen Partnern — extern gebucht, nicht über TC Travel.",
      it: "Escursioni, biglietti e attività selezionati da partner affidabili: prenotati esternamente, non tramite TC Travel.",
      pt: "Passeios de um dia, ingressos e atividades selecionados por parceiros de confiança — reservados externamente, não pela TC Travel.",
      "zh-Hans": "由可信旅游伙伴精选的一日游、门票和活动——外部预订，非通过 TC Travel。",
      "zh-Hant": "由可信旅遊夥伴精選的一日遊、門票和活動——外部預訂，非透過 TC Travel。",
    },
  },
  testimonials: {
    eyebrow: {
      fr: "Avis", es: "Reseñas", de: "Bewertungen",
      it: "Recensioni", pt: "Avaliações", "zh-Hans": "评价", "zh-Hant": "評價",
    },
    title: {
      fr: "Ce que nos clients disent de nous", es: "Lo que dicen nuestros clientes", de: "Was unsere Kunden über uns sagen",
      it: "Cosa dicono di noi i clienti", pt: "O que os clientes dizem sobre nós",
      "zh-Hans": "客户对我们的评价", "zh-Hant": "客戶對我們的評價",
    },
    subtitle: {
      fr: "Équipe locale, réservation payez-plus-tard claire et avis vérifiés de voyageurs sur les circuits et transferts.",
      es: "Equipo local, reserva paga-después clara y opiniones verificadas de viajeros en tours y traslados.",
      de: "Lokales Team, klare Später-zahlen-Buchung und verifiziertes Reisefeedback zu Touren und Transfers.",
      it: "Team locale, prenotazione paga-dopo chiara e recensioni verificate di viaggiatori su tour e trasferimenti.",
      pt: "Equipe local, reserva pague-depois clara e avaliações verificadas de viajantes sobre tours e transferências.",
      "zh-Hans": "本地团队、清晰的后付款预订，以及经核实的行程与接送旅客评价。",
      "zh-Hant": "本地團隊、清晰的後付款預訂，以及經核實的行程與接送旅客評價。",
    },
  },
  team: {
    eyebrow: {
      fr: "Rencontrez l'équipe", es: "Conoce al equipo", de: "Lernen Sie das Team kennen",
      it: "Incontra il team", pt: "Conheça a equipe",
      "zh-Hans": "认识团队", "zh-Hant": "認識團隊",
    },
    title: {
      fr: "Les personnes derrière votre voyage", es: "Las personas detrás de tu viaje", de: "Die Menschen hinter deiner Reise",
      it: "Le persone dietro il tuo viaggio", pt: "As pessoas por trás da sua viagem",
      "zh-Hans": "您旅程背后的团队", "zh-Hant": "您旅程背後的團隊",
    },
    subtitle: {
      fr: "Une petite équipe locale qui planifie, guide et assure le suivi avant chaque départ.",
      es: "Un pequeño equipo local que planifica, guía y hace seguimiento antes de cada salida.",
      de: "Ein kleines lokales Team, das vor jeder Abfahrt plant, führt und nachfasst.",
      it: "Un piccolo team locale che pianifica, guida e segue prima di ogni partenza.",
      pt: "Uma pequena equipe local que planeja, guia e faz o acompanhamento antes de cada partida.",
      "zh-Hans": "一支本地小团队，在每次出发前负责规划、带队和跟进。",
      "zh-Hant": "一支本地小團隊，在每次出發前負責規劃、帶隊和跟進。",
    },
    actionLabel: {
      fr: "À propos", es: "Sobre nosotros", de: "Über uns",
      it: "Chi siamo", pt: "Sobre nós", "zh-Hans": "关于我们", "zh-Hant": "關於我們",
    },
  },
  whyUs: {
    eyebrow: {
      fr: "Pourquoi les voyageurs nous choisissent", es: "Por qué los viajeros nos eligen", de: "Warum Reisende uns wählen",
      it: "Perché i viaggiatori ci scelgono", pt: "Por que os viajantes nos escolhem",
      "zh-Hans": "旅行者为何选择我们", "zh-Hant": "旅行者為何選擇我們",
    },
    title: {
      fr: "Local, fiable, sans pression.", es: "Local, de confianza, sin presión.", de: "Lokal, vertrauenswürdig, ohne Druck.",
      it: "Locale, affidabile, senza pressioni.", pt: "Local, confiável, sem pressão.",
      "zh-Hans": "本地、可信、无压力。", "zh-Hant": "本地、可信、無壓力。",
    },
    subtitle: {
      fr: "Une petite agence réceptive fondée sur l'hospitalité, pas sur la vente en volume.",
      es: "Una pequeña agencia receptiva construida en torno a la hospitalidad, no a las ventas de alto volumen.",
      de: "Eine kleine Incoming-Agentur, die auf Gastfreundschaft baut, nicht auf Massenverkauf.",
      it: "Una piccola agenzia incoming costruita sull'ospitalità, non sulle vendite di massa.",
      pt: "Uma pequena agência receptiva construída em torno da hospitalidade, não de vendas em grande volume.",
      "zh-Hans": "一家以待客之道为本、而非走量销售的小型入境旅行社。",
      "zh-Hant": "一家以待客之道為本、而非走量銷售的小型入境旅行社。",
    },
  },
  blog: {
    eyebrow: {
      fr: "Journal de voyage", es: "Diario de viaje", de: "Reisetagebuch",
      it: "Diario di viaggio", pt: "Diário de viagem",
      "zh-Hans": "旅行日志", "zh-Hant": "旅行日誌",
    },
    title: {
      fr: "Depuis le blog", es: "Desde el blog", de: "Aus dem Blog",
      it: "Dal blog", pt: "Do blog", "zh-Hans": "来自博客", "zh-Hant": "來自部落格",
    },
    subtitle: {
      fr: "Notes de planification pratiques, guides gastronomiques et contexte local avant de vous engager sur un circuit.",
      es: "Notas prácticas de planificación, guías gastronómicas y contexto local antes de decidirte por un tour.",
      de: "Praktische Planungsnotizen, Food-Guides und lokaler Kontext, bevor du dich für eine Tour entscheidest.",
      it: "Note pratiche di pianificazione, guide gastronomiche e contesto locale prima di scegliere un tour.",
      pt: "Notas práticas de planejamento, guias gastronômicos e contexto local antes de escolher um tour.",
      "zh-Hans": "在决定行程前，提供实用的规划笔记、美食指南和本地背景。",
      "zh-Hant": "在決定行程前，提供實用的規劃筆記、美食指南和本地背景。",
    },
    actionLabel: {
      fr: "Lire le blog", es: "Leer el blog", de: "Zum Blog",
      it: "Leggi il blog", pt: "Ler o blog", "zh-Hans": "阅读博客", "zh-Hant": "閱讀部落格",
    },
  },
  newsletter: {
    title: {
      fr: "Des idées de voyage saisonnières, sans spam", es: "Ideas de viaje por temporada, sin spam", de: "Saisonale Reiseideen, kein Spam",
      it: "Idee di viaggio stagionali, niente spam", pt: "Ideias de viagem sazonais, sem spam",
      "zh-Hans": "应季旅行灵感，绝无垃圾邮件", "zh-Hant": "應季旅行靈感，絕無垃圾郵件",
    },
    subtitle: {
      fr: "Rejoignez notre newsletter pour connaître le meilleur moment pour visiter et des conseils pratiques sur le Vietnam central.",
      es: "Suscríbete a nuestra newsletter para saber la mejor época para visitar y consejos prácticos sobre el centro de Vietnam.",
      de: "Abonniere unseren Newsletter für die beste Reisezeit und praktische Planungstipps für Zentralvietnam.",
      it: "Iscriviti alla nostra newsletter per il periodo migliore per visitare e consigli pratici sul Vietnam centrale.",
      pt: "Assine a nossa newsletter para saber a melhor época para visitar e dicas práticas sobre o centro do Vietnã.",
      "zh-Hans": "订阅我们的新闻通讯，获取最佳到访时间和越南中部实用规划建议。",
      "zh-Hant": "訂閱我們的電子報，獲取最佳到訪時間和越南中部實用規劃建議。",
    },
  },
};

// hero.trustItems — index-aligned with the English seed (3 items).
export const heroTrustItemsI18n: Array<{ label: LT; hint: LT }> = [
  {
    label: {
      fr: "Note 4,9★", es: "Valoración 4,9★", de: "4,9★ Bewertung",
      it: "Valutazione 4,9★", pt: "Avaliação 4,9★", "zh-Hans": "4.9★ 评分", "zh-Hant": "4.9★ 評分",
    },
    hint: {
      fr: "Par des voyageurs internationaux", es: "De viajeros internacionales", de: "Von internationalen Reisenden",
      it: "Da viaggiatori internazionali", pt: "De viajantes internacionais",
      "zh-Hans": "来自入境旅客", "zh-Hant": "來自入境旅客",
    },
  },
  {
    label: {
      fr: "Réservez · Payez plus tard", es: "Reserva · Paga después", de: "Buchen · Später zahlen",
      it: "Prenota · Paga dopo", pt: "Reserve · Pague depois", "zh-Hans": "预订·后付款", "zh-Hant": "預訂·後付款",
    },
    hint: {
      fr: "Aucun prépaiement requis", es: "Sin pago por adelantado", de: "Keine Vorauszahlung nötig",
      it: "Nessun pagamento anticipato", pt: "Sem pré-pagamento",
      "zh-Hans": "无需预付", "zh-Hant": "無需預付",
    },
  },
  {
    label: {
      fr: "Guides locaux", es: "Guías locales", de: "Lokale Guides",
      it: "Guide locali", pt: "Guias locais", "zh-Hans": "本地向导", "zh-Hant": "本地嚮導",
    },
    hint: {
      fr: "Hội An · Huế · Đà Nẵng", es: "Hội An · Huế · Đà Nẵng", de: "Hội An · Huế · Đà Nẵng",
      it: "Hội An · Huế · Đà Nẵng", pt: "Hội An · Huế · Đà Nẵng",
      "zh-Hans": "会安 · 顺化 · 岘港", "zh-Hant": "會安 · 順化 · 峴港",
    },
  },
];

// whyUs.items — index-aligned with the English seed (5 items).
export const whyUsItemsI18n: Array<{ title: LT; body: LT }> = [
  {
    title: {
      fr: "Spécialistes locaux", es: "Especialistas locales", de: "Lokale Spezialisten",
      it: "Specialisti locali", pt: "Especialistas locais", "zh-Hans": "本地专家", "zh-Hant": "本地專家",
    },
    body: {
      fr: "Chaque circuit est mené par des guides qui vivent à Hội An, Huế et Đà Nẵng. De vraies histoires, de vraies recommandations.",
      es: "Cada tour lo dirigen guías que viven en Hội An, Huế y Đà Nẵng. Historias reales, recomendaciones reales.",
      de: "Jede Tour wird von Guides geführt, die in Hội An, Huế und Đà Nẵng leben. Echte Geschichten, echte Empfehlungen.",
      it: "Ogni tour è guidato da guide che vivono a Hội An, Huế e Đà Nẵng. Storie vere, consigli veri.",
      pt: "Cada tour é conduzido por guias que vivem em Hội An, Huế e Đà Nẵng. Histórias reais, recomendações reais.",
      "zh-Hans": "每个行程都由居住在会安、顺化和岘港的向导带领。真实的故事，真实的建议。",
      "zh-Hant": "每個行程都由居住在會安、順化和峴港的嚮導帶領。真實的故事，真實的建議。",
    },
  },
  {
    title: {
      fr: "Opérateur local de confiance", es: "Operador local de confianza", de: "Vertrauenswürdiger lokaler Anbieter",
      it: "Operatore locale affidabile", pt: "Operador local de confiança",
      "zh-Hans": "值得信赖的本地运营商", "zh-Hant": "值得信賴的本地營運商",
    },
    body: {
      fr: "Une agence agréée du Vietnam central avec un vrai suivi par téléphone et WhatsApp avant chaque départ.",
      es: "Una agencia con licencia del centro de Vietnam con seguimiento real por teléfono y WhatsApp antes de cada salida.",
      de: "Eine lizenzierte Agentur in Zentralvietnam mit echter Betreuung per Telefon und WhatsApp vor jeder Abfahrt.",
      it: "Un'agenzia autorizzata del Vietnam centrale con un vero follow-up telefonico e WhatsApp prima di ogni partenza.",
      pt: "Uma agência licenciada do centro do Vietnã com acompanhamento real por telefone e WhatsApp antes de cada partida.",
      "zh-Hans": "一家持牌的越南中部旅行社，每次出发前均通过电话和 WhatsApp 真实跟进。",
      "zh-Hant": "一家持牌的越南中部旅行社，每次出發前均透過電話和 WhatsApp 真實跟進。",
    },
  },
  {
    title: {
      fr: "Réservez maintenant, payez plus tard", es: "Reserva ahora, paga después", de: "Jetzt buchen, später zahlen",
      it: "Prenota ora, paga dopo", pt: "Reserve agora, pague depois",
      "zh-Hans": "先预订，后付款", "zh-Hant": "先預訂，後付款",
    },
    body: {
      fr: "Envoyez une demande, confirmez les détails avec notre équipe, puis payez quand vous rencontrez votre guide. Aucun prépaiement.",
      es: "Envía una consulta, confirma los detalles con nuestro equipo y paga cuando conozcas a tu guía. Sin pago por adelantado.",
      de: "Anfrage senden, Details mit unserem Team klären, dann zahlen, wenn du deinen Guide triffst. Keine Vorauszahlung.",
      it: "Invia una richiesta, conferma i dettagli con il nostro team, poi paga quando incontri la tua guida. Nessun anticipo.",
      pt: "Envie uma consulta, confirme os detalhes com a nossa equipe e pague quando encontrar o seu guia. Sem pré-pagamento.",
      "zh-Hans": "提交咨询，与团队确认细节，见到向导时再付款。无需预付。",
      "zh-Hant": "提交諮詢，與團隊確認細節，見到嚮導時再付款。無需預付。",
    },
  },
  {
    title: {
      fr: "Rapport qualité-prix", es: "Buena relación calidad-precio", de: "Gutes Preis-Leistungs-Verhältnis",
      it: "Buon rapporto qualità-prezzo", pt: "Bom custo-benefício",
      "zh-Hans": "物超所值", "zh-Hant": "物超所值",
    },
    body: {
      fr: "Des prix justes et transparents, sans frais cachés — y compris des visites à pied et à vélo réellement gratuites.",
      es: "Precios justos y transparentes sin cargos ocultos, incluidos tours a pie y en bicicleta realmente gratuitos.",
      de: "Faire, transparente Preise ohne versteckte Gebühren — inklusive wirklich kostenloser Rundgänge und Radtouren.",
      it: "Prezzi equi e trasparenti senza costi nascosti, inclusi tour a piedi e in bici davvero gratuiti.",
      pt: "Preços justos e transparentes, sem taxas ocultas — incluindo passeios a pé e de bicicleta genuinamente gratuitos.",
      "zh-Hans": "价格公道透明、无隐藏费用——包括真正免费的步行和骑行游。",
      "zh-Hant": "價格公道透明、無隱藏費用——包括真正免費的步行和騎行遊。",
    },
  },
  {
    title: {
      fr: "Expériences authentiques", es: "Experiencias auténticas", de: "Authentische Erlebnisse",
      it: "Esperienze autentiche", pt: "Experiências autênticas",
      "zh-Hans": "地道体验", "zh-Hant": "道地體驗",
    },
    body: {
      fr: "Petits groupes et itinéraires privés construits autour de la vie locale, d'un rythme réaliste et des lieux que nous aimons.",
      es: "Grupos pequeños y rutas privadas creadas en torno a la vida local, un ritmo realista y los lugares que amamos.",
      de: "Kleine Gruppen und private Routen rund um das lokale Leben, ein realistisches Tempo und die Orte, die wir lieben.",
      it: "Piccoli gruppi e percorsi privati costruiti attorno alla vita locale, a un ritmo realistico e ai luoghi che amiamo.",
      pt: "Pequenos grupos e rotas privadas construídas em torno da vida local, de um ritmo realista e dos lugares que amamos.",
      "zh-Hans": "围绕本地生活、合理节奏和我们钟爱的地方打造的小团和私人路线。",
      "zh-Hant": "圍繞本地生活、合理節奏和我們鍾愛的地方打造的小團和私人路線。",
    },
  },
];
