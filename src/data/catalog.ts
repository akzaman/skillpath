export type Category =
  | "Fisco e tasse"
  | "CAF e Patronato"
  | "Lingua italiana"
  | "Patente B"
  | "Immigrazione"
  | "Lavoro e impresa";

export type Level = "Foundations" | "Intermediate" | "Advanced";

export type Instructor = {
  name: string;
  title: string;
  initials: string;
  bio: string;
};

export type VideoSource = {
  src: string;
  type: string;
};

export type Lesson = {
  slug: string;
  title: string;
  durationSeconds: number;
  sources: VideoSource[];
  summary: string;
  transcript: string;
  preview: boolean;
};

export type Course = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: Category;
  level: Level;
  poster: string;
  featured?: boolean;
  instructor: Instructor;
  lessons: Lesson[];
  source?: "platform" | "studio";
  ownerId?: string | null;
  published?: boolean;
};

const V = {
  bunny: [
    { src: "/videos/bunny.mp4", type: "video/mp4" },
    { src: "/videos/sintel.webm", type: "video/webm" },
  ],
  sintel: [
    { src: "/videos/sintel.mp4", type: "video/mp4" },
    { src: "/videos/sintel.webm", type: "video/webm" },
  ],
  clip: [
    { src: "/videos/clip.mp4", type: "video/mp4" },
    { src: "/videos/clip.webm", type: "video/webm" },
  ],
  flower: [
    { src: "/videos/flower.mp4", type: "video/mp4" },
    { src: "/videos/flower.webm", type: "video/webm" },
  ],
} as const;

export const CATEGORIES: Category[] = [
  "Fisco e tasse",
  "CAF e Patronato",
  "Lingua italiana",
  "Patente B",
  "Immigrazione",
  "Lavoro e impresa",
];

function L(
  slug: string,
  title: string,
  minutes: number,
  sources: readonly VideoSource[],
  summary: string,
  transcript: string,
  preview = false,
): Lesson {
  return {
    slug,
    title,
    durationSeconds: minutes * 60,
    sources: [...sources],
    summary,
    transcript,
    preview,
  };
}

export const courses: Course[] = [
  {
    slug: "sistema-fiscale-italiano",
    title: "Italian tax system",
    subtitle: "IRPEF, IVA, codice fiscale — how the state actually collects money.",
    description:
      "A clear map of the Italian tax system for residents and newcomers. Chiara Benedetti walks through who pays what, which codes matter, and how Agenzia delle Entrate talks to you — without the fog of a commercialista’s waiting room.",
    category: "Fisco e tasse",
    level: "Foundations",
    poster: "/courses/build.jpg",
    featured: true,
    instructor: {
      name: "Chiara Benedetti",
      title: "Commercialista, Milano",
      initials: "CB",
      bio: "Fifteen years preparing dichiarazioni for families and small firms. She teaches tax the way she explains it at the desk: one form, one reason.",
    },
    lessons: [
      L("the-three-taxes", "The three taxes you will meet", 11, V.bunny, "IRPEF, IVA, and IMU in plain language.", "Italy does not have one tax. You meet IRPEF on income, IVA on most purchases, and IMU if you own a home. Learn which one applies to a paycheck, a shop receipt, and a second house — and which office owns each conversation.", true),
      L("codice-fiscale", "Codice fiscale and your file", 9, V.sintel, "Why that 16-character code follows every form.", "The codice fiscale is not a password. It is the key the state uses to find you. We read a sample code, see where it appears on a paycheck, and what happens if the spelling of your name does not match the tessera sanitaria."),
      L("residenza-e-domicilio", "Residenza, domicilio, and tax home", 12, V.clip, "Where you live on paper versus where you sleep.", "Residenza is the comune that claims you. Domicilio is where mail should go. For tax, the important question is where your centre of life sits. This lesson shows how a move between cities, or a year abroad, changes the next dichiarazione."),
      L("how-the-state-writes", "How Agenzia delle Entrate writes to you", 10, V.flower, "Reading a cartella, an avviso, and the cassetto fiscale.", "A letter from the tax agency is not automatically a fine. We open a sample avviso bonario, a cartella, and the cassetto fiscale online, and decide what needs an answer this week versus what can wait for the CAF."),
    ],
  },
  {
    slug: "dichiarazione-dei-redditi",
    title: "Dichiarazione dei redditi",
    subtitle: "730, Redditi PF, and the calendar that actually matters.",
    description:
      "How to file an Italian tax return without drowning in acronyms. When to use the 730, when you need Redditi Persone Fisiche, which receipts to keep, and how a refund or a debito shows up.",
    category: "Fisco e tasse",
    level: "Intermediate",
    poster: "/courses/written.jpg",
    instructor: {
      name: "Chiara Benedetti",
      title: "Commercialista, Milano",
      initials: "CB",
      bio: "She has filed thousands of 730s. This course is the conversation she wishes every client had before April.",
    },
    lessons: [
      L("730-or-redditi", "730 or Redditi PF?", 10, V.sintel, "Choosing the right return for an employee, a pension, or a VAT number.", "If you have only employment or pension income, the 730 is usually enough and the employer can withhold the balance. A partita IVA, foreign income, or a rental often means Redditi PF. We sort five typical lives into the right form.", true),
      L("the-calendar", "The real calendar", 8, V.bunny, "Precompilato, CAF rush, and payment dates.", "The precompilato opens in spring. CAF appointments vanish in May. Payments (or refunds) land on the paycheck or F24 later in the year. Miss the window and you file late, not never — this lesson shows the cost of each delay."),
      L("what-to-keep", "Receipts that actually change the tax", 13, V.clip, "Healthcare, rent, university, and the rest of the myths.", "Not every supermarket receipt is a deduction. We keep healthcare above the franchise, rent for students, university fees, and renovation bonuses — and throw away the rest of the shoebox."),
      L("refund-or-debt", "Refund or debito", 9, V.flower, "Reading the result and what your employer will do.", "A 730 can return money on the July paycheck or take extra withholding. We read a sample esito, explain conguaglio, and when you should walk into a CAF instead of clicking confirm."),
    ],
  },
  {
    slug: "come-funziona-il-caf",
    title: "How a CAF works",
    subtitle: "Appointments, documents, and what the desk can (and cannot) do.",
    description:
      "CAF is not a government office — it is the place most people actually file. Luca Ferrante shows how to book, what to bring, how patronage unions differ, and how to read the receipt they give you.",
    category: "CAF e Patronato",
    level: "Foundations",
    poster: "/courses/interface.jpg",
    instructor: {
      name: "Luca Ferrante",
      title: "CAF operator, Torino",
      initials: "LF",
      bio: "He has sat on both sides of the glass: as a clerk and as the person who trains new operators each spring.",
    },
    lessons: [
      L("what-a-caf-is", "What a CAF is", 8, V.clip, "Not INPS, not Agenzia delle Entrate — a help desk with a stamp.", "A CAF (centro di assistenza fiscale) prepares 730s, ISEE, and some bonuses under an agreement with the state. You do not need to be a member, but peak season is a queue. This lesson sets expectations before you walk in.", true),
      L("the-folder", "The folder they want", 11, V.bunny, "CU, tessera sanitaria, rent contract, and healthcare receipts.", "Bring the CU (ex CUD), last year’s 730 if you have it, tessera sanitaria, a rent contract, and healthcare receipts already totaled. Photos on the phone are fine if they are readable. Missing the CU is the number-one bounce."),
      L("isee-and-bonuses", "ISEE and family bonuses", 12, V.sintel, "When the CAF is the door to school, nursery, and assegno unico.", "ISEE is a photograph of the household, not a tax. Wrong household members wreck nursery fees and the assegno unico. We walk a simple family of three and a more complicated one with a parent abroad."),
      L("after-the-stamp", "After they stamp it", 7, V.flower, "The ricevuta, the delegation, and who is responsible.", "You sign a delegation. The CAF transmits. Keep the ricevuta. If a number is wrong, both you and the CAF have a path to correct it — this lesson shows which errors are theirs and which are yours."),
    ],
  },
  {
    slug: "patronato-diritti-e-pratiche",
    title: "Patronato: rights and paperwork",
    subtitle: "Pensions, unemployment, invalidità — the free desk next to the CAF.",
    description:
      "Patronato offices exist to claim social-security rights, not to file tax. Rosa Moretti covers NASpI, pensions, invalidità civile, and how a patronato talks to INPS for you at no charge.",
    category: "CAF e Patronato",
    level: "Foundations",
    poster: "/courses/still.jpg",
    instructor: {
      name: "Rosa Moretti",
      title: "Patronato adviser, Napoli",
      initials: "RM",
      bio: "Twenty years of INPS practices. She is allergic to people paying for forms that are free.",
    },
    lessons: [
      L("caf-vs-patronato", "CAF vs Patronato", 8, V.flower, "Tax on the left, rights on the right.", "CAF files taxes and ISEE. Patronato files unemployment, pensions, maternity, and disability with INPS. Same building, different stamp. Knowing which door to open saves a week.", true),
      L("naspi", "NASpI after a job ends", 12, V.sintel, "Who qualifies and the 68-day clock.", "NASpI is unemployment insurance, not a favour. You usually have 68 days from the last day of work. We list the documents, the DID, and why you should not wait for the employer to ‘send something’."),
      L("pension-basics", "Reading an estratto contributivo", 11, V.bunny, "Your INPS extract before you panic about retirement.", "The estratto contributivo is the state’s memory of your work. Gaps happen. Foreign contributions can count. This lesson is how to read the extract, not how to become a pension actuary."),
      L("invalidita", "Invalidità civile, without the rumour mill", 10, V.clip, "The medical path, not the Facebook path.", "Invalidità civile starts with a doctor, then INPS, then a commission. A patronato books and follows. We separate rumours from the actual sequence so nobody sells you a shortcut."),
    ],
  },
  {
    slug: "patente-b-quiz",
    title: "Patente B Quiz",
    subtitle: "Theory exam: signs, precedence, and the 20-error rule.",
    description:
      "A focused drill for the Italian driving-licence theory test. Marco De Santis covers the quiz format, the signs that fail people, urban vs extraurban rules, and how to sit the esame without wasting a booking.",
    category: "Patente B",
    level: "Foundations",
    poster: "/courses/light.jpg",
    instructor: {
      name: "Marco De Santis",
      title: "Autoscuola instructor, Bologna",
      initials: "MD",
      bio: "He has put more first-time drivers through the quiz than he can count. He teaches the exam that exists, not the one in the booklet from 2009.",
    },
    lessons: [
      L("the-exam", "How the quiz actually works", 9, V.clip, "30 sheets, 20 errors, and the timer.", "The ministerial quiz is 30 questions, twenty minutes, and you fail at the 4th error on many sheets — practice as if four is the ceiling. Phones stay outside. This is the room, not the theory of driving.", true),
      L("signs-that-fail", "Signs that fail people", 14, V.bunny, "Precedence, divieto, and the ones that look friendly.", "Stop vs dare precedenza. Zona traffico limitato. The triangular warning that is not an order. We drill the twelve signs that generate half the fails in a typical autoscuola."),
      L("citta-e-fuori", "In town and out of town", 12, V.sintel, "Limits, lights, and the right lane.", "50 in town unless signed. 90 / 110 / 130 outside. Who has the lane on a roundabout. This lesson is the moving exam sitting inside the theory test."),
      L("exam-day", "Exam day, no theatre", 7, V.flower, "Documents, booking, and what to do if you fail.", "Bring identity document and the foglio rosa. Arrive early. If you fail, you wait and book again — the autoscuola is not punishing you. We close with a 10-question warm-up ritual."),
    ],
  },
  {
    slug: "italiano-a1",
    title: "Italiano A1",
    subtitle: "First words for the comune, the doctor, and the supermarket.",
    description:
      "A1 Italian for people who already live here. Elena Ricci teaches the sentences you need at the anagrafe, the pharmacy, and the bus — with slow audio and the exact forms you will hear.",
    category: "Lingua italiana",
    level: "Foundations",
    poster: "/courses/type.jpg",
    instructor: {
      name: "Elena Ricci",
      title: "Italian teacher, CPIA Roma",
      initials: "ER",
      bio: "She teaches adult newcomers in public evening classes. No textbook tourism — only language that unlocks an office.",
    },
    lessons: [
      L("io-sono", "Io sono, io abito", 10, V.bunny, "Name, country, address, and the verb essere.", "Io sono Amira. Vengo dal Marocco. Abito in via Garibaldi 12. We lock essere and abitare, numbers for the address, and how to spell a name at a sportello.", true),
      L("in-ufficio", "In ufficio", 12, V.sintel, "Permesso, appuntamento, documento, fotocopia.", "The clerk will ask for a document, a photocopy, and a date. This lesson is the ten nouns of every Italian counter, plus ‘non ho capito, può ripetere?’ said without apology."),
      L("dal-medico", "Dal medico e in farmacia", 11, V.clip, "Symptoms, appointments, and the ricetta.", "Mi fa male qui. Ho la febbre. Serve la ricetta. A1 medical Italian is small and urgent. We practise pain, days, and the difference between medico di base and pronto soccorso."),
      L("comprare", "Comprare e pagare", 9, V.flower, "Prices, kilos, and ‘il resto’.", "Quanto costa? Vorrei etto di… Posso pagare con la carta? Supermarket Italian plus the market stall. You leave able to buy dinner without pointing."),
    ],
  },
  {
    slug: "italiano-a2",
    title: "Italiano A2",
    subtitle: "Past tense, appointments, and letters from the comune.",
    description:
      "A2 takes you from survival sentences to short stories about your week — and to reading a simple letter from the school or the ASL. Built for the permesso / citizenship language bar.",
    category: "Lingua italiana",
    level: "Intermediate",
    poster: "/courses/color.jpg",
    instructor: {
      name: "Elena Ricci",
      title: "Italian teacher, CPIA Roma",
      initials: "ER",
      bio: "Her A2 groups sit the official exam each June. She teaches the passato prossimo first because life happens in the past tense.",
    },
    lessons: [
      L("passato-prossimo", "Passato prossimo that you will actually use", 13, V.sintel, "Essere / avere and the week you just lived.", "Ieri ho lavorato. Sono andata in comune. A2 is the past. We pick the twenty verbs of a normal week and stop conjugating gardens of irregulars you will not say.", true),
      L("prenotare", "Prenotare, spostare, disdire", 10, V.clip, "Phone and email for an appointment.", "Vorrei prenotare. Posso spostare a mercoledì? Devo disdire. The verbs of the CUP, the school, and the CAF, plus a short email you can copy."),
      L("leggere-una-lettera", "Reading a letter from the comune", 11, V.bunny, "Oggetto, protocollo, and what they want from you.", "Italian bureaucracy writes in a dialect. We read a real-style convocazione: oggetto, protocollo, scadenza. You learn which paragraph is the action and which is decoration."),
      L("exam-a2", "The A2 exam, calmly", 9, V.flower, "Listening, reading, writing a note, a short talk.", "Four parts, none of them literature. We walk a sample paper and a two-minute speaking prompt about your family and your job."),
    ],
  },
  {
    slug: "spoken-italian",
    title: "Spoken Italian",
    subtitle: "Speed, fillers, and how people actually talk at the bar.",
    description:
      "Classroom Italian is slow. The street is not. Fatima El Amrani trains your ear for clipped verbs, courtesy formulas, and the five-minute conversation that makes a neighbour into a contact.",
    category: "Lingua italiana",
    level: "Intermediate",
    poster: "/courses/hero.jpg",
    instructor: {
      name: "Fatima El Amrani",
      title: "Conversation coach, Brescia",
      initials: "FE",
      bio: "She learned Italian as an adult in a factory canteen. She teaches speaking the way she needed it: fast, kind, and useful after 18:00.",
    },
    lessons: [
      L("slow-to-street", "From classroom speed to street speed", 10, V.clip, "Why natives eat the vowels — and how to still catch the noun.", "Italians drop endings and run prepositions together. We listen to the same sentence three times, slower each pass, until the noun is obvious even when the verb is a blur.", true),
      L("cortesia", "Permesso, prego, figurati", 8, V.flower, "The politeness that opens doors.", "Courtesy is grammar in Italy. Permesso to enter. Prego as an answer. Figurati when someone thanks you. Get these wrong and people think you are angry, not foreign."),
      L("cinque-minuti", "A five-minute conversation", 12, V.bunny, "Work, kids, the weather, and a plan for Saturday.", "A neighbour will not ask about the subjunctive. They will ask if you work nearby and whether the child likes the school. We script and then unscipt that talk."),
      L("al-telefono", "On the phone without panic", 9, V.sintel, "Saying who you are, why you called, and asking them to slow down.", "Pronto. Sono… chiamo per l’appuntamento delle dieci. Può parlare più lentamente? Phone Italian is a skill of its own. We practise two calls: the doctor and the landlord."),
    ],
  },
  {
    slug: "sportello-immigrazione",
    title: "Sportello Immigrazione",
    subtitle: "Permesso di soggiorno, Questura, and the kit from the post office.",
    description:
      "The immigration desk, step by step. Giulia Conti covers the post-office kit, fingerprints, rinnovo, ricongiungimento, and how to read a convocazione without paying a fixer.",
    category: "Immigrazione",
    level: "Foundations",
    poster: "/courses/edit.jpg",
    instructor: {
      name: "Giulia Conti",
      title: "Sportello Immigrazione, Firenze",
      initials: "GC",
      bio: "Municipal immigration desk. She has watched too many families pay for photocopies of forms that are free on the ministry site.",
    },
    lessons: [
      L("the-map", "The map: Questura, Prefettura, Poste", 9, V.sintel, "Who stamps what, and who only takes the envelope.", "Poste sells the kit and sends it. Questura does fingerprints and the card. Prefettura handles some family and work flows. Knowing the triangle stops you from queueing at the wrong door.", true),
      L("primo-permesso", "First permesso", 13, V.bunny, "Work, family, and study — the three common doors.", "A first permit is a story: contract or family certificate plus housing plus income. We walk a worker, a spouse, and a student, and list the exact photocopies for each."),
      L("rinnovo", "Rinnovo before it expires", 11, V.clip, "The 60-day window and what to do if you are late.", "Renew 60 days before expiry. Late is possible with a reason, not with a shrug. We look at a sample ricevuta — the paper that lets you stay and work while you wait."),
      L("no-fixer", "No fixer", 8, V.flower, "Free help: patronato, sportello, and the ministry site.", "Nobody legitimate sells a ‘faster fingerprint day’. This lesson names the free desks, the official PDFs, and the three questions that expose a scam."),
    ],
  },
  {
    slug: "italian-business-system",
    title: "Italian business system",
    subtitle: "Partita IVA, Camera di Commercio, INPS, and the first invoice.",
    description:
      "How a small activity is born in Italy. Paolo Marino covers choosing a regime, opening a partita IVA, registering with the chamber of commerce, and sending the first e-fattura without a panic attack.",
    category: "Lavoro e impresa",
    level: "Intermediate",
    poster: "/courses/still.jpg",
    instructor: {
      name: "Paolo Marino",
      title: "Business consultant, Padova",
      initials: "PM",
      bio: "He opens small firms for artisans and freelancers. He would rather you stay in regime forfettario than buy software you do not need.",
    },
    lessons: [
      L("partita-iva", "Do you need a partita IVA?", 10, V.flower, "Occasional work versus a real activity.", "A few invoices a year can stay occasional. A regular activity needs a VAT number. Crossing the line without one is the expensive mistake. We draw it with three examples.", true),
      L("forfettario", "Regime forfettario", 12, V.sintel, "The flat tax most newcomers should meet first.", "Forfettario is a simplified box: a coefficient, a substitute tax, no IVA on the invoice. It is not forever and it has income ceilings. This lesson is whether you fit, not a love letter to the regime."),
      L("camera-inps", "Camera di Commercio and INPS", 11, V.bunny, "The two registrations people forget.", "A shop or a craft needs the chamber of commerce. Almost everyone who works alone pays INPS. ComUnica can do both. We look at the receipts you should leave with."),
      L("prima-fattura", "The first e-fattura", 9, V.clip, "SDI, XML, and a simple invoice that will not bounce.", "Italian invoices travel through the Sistema di Interscambio. You do not email a PDF to a company and call it done. We build one invoice in a free tool and read the stato SDI."),
    ],
  },
];

export function getCourse(slug: string): Course | undefined {
  return courses.find((course) => course.slug === slug);
}

export function getLesson(
  courseSlug: string,
  lessonSlug: string,
): { course: Course; lesson: Lesson; index: number } | undefined {
  const course = getCourse(courseSlug);
  if (!course) return undefined;
  const index = course.lessons.findIndex((lesson) => lesson.slug === lessonSlug);
  if (index < 0) return undefined;
  return { course, lesson: course.lessons[index]!, index };
}

export function courseDuration(course: Course): number {
  return course.lessons.reduce((sum, lesson) => sum + lesson.durationSeconds, 0);
}

export function searchCourses(query: string, category?: Category | "All"): Course[] {
  const needle = query.trim().toLowerCase();
  return courses.filter((course) => {
    if (category && category !== "All" && course.category !== category) return false;
    if (!needle) return true;
    const hay = [
      course.title,
      course.subtitle,
      course.description,
      course.instructor.name,
      course.category,
      ...course.lessons.map((lesson) => lesson.title),
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(needle);
  });
}
