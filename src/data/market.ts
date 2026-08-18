export type CourseBadge = "Bestseller" | "Hot & new" | "Highest rated";

export type MarketInfo = {
  rating: number;
  reviews: number;
  students: number;
  price: number;
  listPrice: number;
  badge?: CourseBadge;
  outcomes: string[];
  updatedLabel: string;
};

export type Review = {
  name: string;
  rating: number;
  date: string;
  body: string;
};

const DEFAULT_MARKET: MarketInfo = {
  rating: 4.7,
  reviews: 640,
  students: 8200,
  price: 19,
  listPrice: 49,
  outcomes: [
    "Walk into the right office with the right folder",
    "Read the letter instead of paying a fixer",
    "Use the official words the clerk expects",
  ],
  updatedLabel: "March 2026",
};

export const market: Record<string, MarketInfo> = {
  "sistema-fiscale-italiano": {
    rating: 4.8,
    reviews: 2140,
    students: 18620,
    price: 19,
    listPrice: 59,
    badge: "Bestseller",
    updatedLabel: "February 2026",
    outcomes: [
      "Tell IRPEF, IVA, and IMU apart in one minute",
      "Read your codice fiscale and know where it must match",
      "Open a letter from Agenzia delle Entrate without panic",
      "Know whether you need a CAF or a commercialista",
    ],
  },
  "dichiarazione-dei-redditi": {
    rating: 4.7,
    reviews: 1688,
    students: 14210,
    price: 24,
    listPrice: 69,
    badge: "Bestseller",
    updatedLabel: "March 2026",
    outcomes: [
      "Choose 730 or Redditi PF for your situation",
      "Hit the real calendar, not the rumour one",
      "Keep only the receipts that change the tax",
      "Read a refund or a debito on the paycheck",
    ],
  },
  "come-funziona-il-caf": {
    rating: 4.6,
    reviews: 980,
    students: 12140,
    price: 15,
    listPrice: 39,
    badge: "Hot & new",
    updatedLabel: "April 2026",
    outcomes: [
      "Book a CAF with the right folder the first time",
      "Prepare CU, tessera, rent, and healthcare totals",
      "File ISEE without wrecking the household photo",
      "Keep the ricevuta and know who is responsible",
    ],
  },
  "patronato-diritti-e-pratiche": {
    rating: 4.8,
    reviews: 870,
    students: 9340,
    price: 15,
    listPrice: 39,
    updatedLabel: "January 2026",
    outcomes: [
      "Use the patronato instead of paying for INPS forms",
      "Start NASpI inside the 68-day window",
      "Read an estratto contributivo",
      "Begin invalidità civile on the official path",
    ],
  },
  "patente-b-quiz": {
    rating: 4.9,
    reviews: 3210,
    students: 24880,
    price: 29,
    listPrice: 79,
    badge: "Highest rated",
    updatedLabel: "May 2026",
    outcomes: [
      "Sit the quiz knowing the 20-error rule",
      "Recognise the twelve signs that fail people",
      "Apply town and extra-urban limits correctly",
      "Arrive on exam day with the right papers",
    ],
  },
  "italiano-a1": {
    rating: 4.8,
    reviews: 2560,
    students: 19840,
    price: 19,
    listPrice: 49,
    badge: "Bestseller",
    updatedLabel: "March 2026",
    outcomes: [
      "Say name, address, and country at a sportello",
      "Ask for a photocopy, a date, and a repetition",
      "Describe a simple symptom at the doctor",
      "Buy food and ask for the rest in change",
    ],
  },
  "italiano-a2": {
    rating: 4.7,
    reviews: 1740,
    students: 13220,
    price: 24,
    listPrice: 59,
    updatedLabel: "April 2026",
    outcomes: [
      "Tell last week in passato prossimo",
      "Book, move, or cancel an appointment",
      "Read a letter from the comune for the action line",
      "Sit a sample A2 paper without theatre",
    ],
  },
  "spoken-italian": {
    rating: 4.6,
    reviews: 1120,
    students: 8760,
    price: 19,
    listPrice: 49,
    badge: "Hot & new",
    updatedLabel: "May 2026",
    outcomes: [
      "Catch the noun when natives run the vowels together",
      "Use permesso, prego, and figurati correctly",
      "Hold a five-minute talk with a neighbour",
      "Make a phone call and ask them to slow down",
    ],
  },
  "sportello-immigrazione": {
    rating: 4.8,
    reviews: 1890,
    students: 16440,
    price: 19,
    listPrice: 55,
    badge: "Bestseller",
    updatedLabel: "February 2026",
    outcomes: [
      "Know whether you need Poste, Questura, or Prefettura",
      "Prepare a first permesso folder",
      "Renew inside the 60-day window",
      "Spot a fixer and use the free desk instead",
    ],
  },
  "italian-business-system": {
    rating: 4.5,
    reviews: 640,
    students: 5120,
    price: 29,
    listPrice: 89,
    updatedLabel: "December 2025",
    outcomes: [
      "Decide if you need a partita IVA",
      "Check whether forfettario fits",
      "Register with Camera di Commercio and INPS",
      "Send a first e-fattura through SDI",
    ],
  },
};

export const reviews: Record<string, Review[]> = {
  "sistema-fiscale-italiano": [
    {
      name: "Amira Haddad",
      rating: 5,
      date: "1 week ago",
      body: "I finally understand why every office asks for the codice fiscale. Chiara talks like a person, not a circular.",
    },
    {
      name: "Ion Popescu",
      rating: 5,
      date: "3 weeks ago",
      body: "The letter lesson saved me a Saturday at the CAF. I could see it was only an avviso, not a fine.",
    },
  ],
  "dichiarazione-dei-redditi": [
    {
      name: "Maria Santos",
      rating: 5,
      date: "5 days ago",
      body: "I used the 730 instead of paying a commercialista. The calendar lesson is the one I replayed.",
    },
    {
      name: "Kwame Mensah",
      rating: 4,
      date: "1 month ago",
      body: "Clear on receipts. I had been keeping supermarket tickets for nothing.",
    },
  ],
  "come-funziona-il-caf": [
    {
      name: "Olena Kovalenko",
      rating: 5,
      date: "2 weeks ago",
      body: "Went in with the folder he described. Ten minutes. Last year I was sent home twice.",
    },
  ],
  "patronato-diritti-e-pratiche": [
    {
      name: "Hassan Benali",
      rating: 5,
      date: "4 days ago",
      body: "Started NASpI the week I finished the job. I did not know the desk was free.",
    },
  ],
  "patente-b-quiz": [
    {
      name: "Yusuf Demir",
      rating: 5,
      date: "2 days ago",
      body: "Passed with two errors. The signs lesson is exactly the exam, not the pretty booklet.",
    },
    {
      name: "Sara Bianchi",
      rating: 5,
      date: "3 weeks ago",
      body: "I had failed once. The 20-error rule explanation changed how I practised.",
    },
  ],
  "italiano-a1": [
    {
      name: "Fatou Diallo",
      rating: 5,
      date: "1 week ago",
      body: "I said ‘può ripetere’ at the anagrafe and the woman smiled and slowed down. That was the whole course for me.",
    },
  ],
  "italiano-a2": [
    {
      name: "Andrei Ionescu",
      rating: 5,
      date: "2 weeks ago",
      body: "The letter from the comune is no longer a brick. I found the date they wanted.",
    },
  ],
  "spoken-italian": [
    {
      name: "Mei Chen",
      rating: 4,
      date: "6 days ago",
      body: "Fast and useful. The phone lesson is the one I still practise in the kitchen.",
    },
  ],
  "sportello-immigrazione": [
    {
      name: "Diego Alvarez",
      rating: 5,
      date: "1 week ago",
      body: "I almost paid a man in the parking lot. This course named the scam before I did it.",
    },
    {
      name: "Nadia Farouk",
      rating: 5,
      date: "1 month ago",
      body: "Renewed with the ricevuta in my pocket. Giulia is the sportello I wish existed in my city.",
    },
  ],
  "italian-business-system": [
    {
      name: "Lorenzo Vitale",
      rating: 5,
      date: "3 weeks ago",
      body: "Opened forfettario without buying four apps. The first invoice went through SDI.",
    },
  ],
};

export function getMarket(slug: string): MarketInfo {
  return market[slug] ?? DEFAULT_MARKET;
}

export function getReviews(slug: string): Review[] {
  return reviews[slug] ?? [];
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat("it-IT").format(value);
}
