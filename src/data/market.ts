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
  rating: 4.6,
  reviews: 1284,
  students: 18420,
  price: 19.99,
  listPrice: 84.99,
  outcomes: [
    "Build a complete working practice you can use on Monday",
    "See the decisions behind the work, not just the steps",
    "Leave with a standard you can hold your own work to",
  ],
  updatedLabel: "March 2026",
};

export const market: Record<string, MarketInfo> = {
  "type-as-architecture": {
    rating: 4.8,
    reviews: 12403,
    students: 186540,
    price: 16.99,
    listPrice: 94.99,
    badge: "Bestseller",
    updatedLabel: "February 2026",
    outcomes: [
      "Set a page that holds with one typeface and two sizes",
      "Choose measure, leading, and contrast with intent",
      "Use display type without turning a title into a poster",
      "Build a hierarchy a tired reader can feel instantly",
    ],
  },
  "light-in-the-frame": {
    rating: 4.7,
    reviews: 8902,
    students: 142110,
    price: 18.99,
    listPrice: 89.99,
    badge: "Bestseller",
    updatedLabel: "January 2026",
    outcomes: [
      "Read a room before you lift the camera",
      "Control hardness by size and distance, not by gear",
      "Protect shadow so a highlight can mean something",
      "Motivate light with practicals that belong in the frame",
    ],
  },
  "interface-rhythm": {
    rating: 4.6,
    reviews: 6421,
    students: 97340,
    price: 21.99,
    listPrice: 99.99,
    badge: "Highest rated",
    updatedLabel: "April 2026",
    outcomes: [
      "Put a product on a single spacing scale",
      "Cut a type ramp down to three working sizes",
      "Use motion as punctuation, not applause",
      "Know when a one-off is earned — and how to contain it",
    ],
  },
  "the-written-line": {
    rating: 4.8,
    reviews: 5104,
    students: 62180,
    price: 14.99,
    listPrice: 79.99,
    badge: "Hot & new",
    updatedLabel: "May 2026",
    outcomes: [
      "Open in the middle and stop warming up in public",
      "Cut the sentence that only exists to impress you",
      "Write a clause a colleague can act on",
      "End without a recap or a bow",
    ],
  },
  "color-after-dark": {
    rating: 4.5,
    reviews: 3880,
    students: 44890,
    price: 17.99,
    listPrice: 84.99,
    updatedLabel: "December 2025",
    outcomes: [
      "Build a three-note palette that holds on page and screen",
      "Use temperature as story, not as a slider habit",
      "Spend saturation once, on the thing that matters",
      "Match a set of stills so they share one climate",
    ],
  },
  "building-with-intent": {
    rating: 4.7,
    reviews: 7210,
    students: 110430,
    price: 22.99,
    listPrice: 109.99,
    badge: "Bestseller",
    updatedLabel: "March 2026",
    outcomes: [
      "Name seams before you extract a folder",
      "Give data one direction and one visible write",
      "Choose the design you can explain on a Tuesday",
      "Delete dead code with a test you can trust",
    ],
  },
  "still-life-studio": {
    rating: 4.6,
    reviews: 2940,
    students: 33120,
    price: 15.99,
    listPrice: 74.99,
    updatedLabel: "November 2025",
    outcomes: [
      "Choose three objects and stop adding a fourth",
      "Pick a ground that sets the weather of the picture",
      "Set camera height as a decision about respect",
      "Know when the still life is finished",
    ],
  },
  "the-cut": {
    rating: 4.9,
    reviews: 4566,
    students: 51880,
    price: 19.99,
    listPrice: 94.99,
    badge: "Highest rated",
    updatedLabel: "February 2026",
    outcomes: [
      "Assemble a scene in story order before you polish",
      "Hear the difference between a clarifying cut and a manufactured one",
      "Cut picture first so temp music cannot lie to you",
      "Hold a shot until the thought is complete",
    ],
  },
};

export const reviews: Record<string, Review[]> = {
  "type-as-architecture": [
    {
      name: "Priya Raman",
      rating: 5,
      date: "2 weeks ago",
      body: "I redesign our annual report every year and this is the first course that talked about margins as structure. My pages finally look like they were designed on purpose.",
    },
    {
      name: "Jonah Ellis",
      rating: 5,
      date: "1 month ago",
      body: "No fluff, no font-shopping. Mara treats type like architecture and it clicked in lesson two. Worth the whole catalog.",
    },
    {
      name: "Claire Nguyen",
      rating: 4,
      date: "3 months ago",
      body: "Dense in the best way. I watched the measure lesson twice. Would love a follow-up on multilingual setting.",
    },
  ],
  "light-in-the-frame": [
    {
      name: "Diego Morales",
      rating: 5,
      date: "5 days ago",
      body: "I sold a light kit after this. One window, three distances, and I finally understand falloff.",
    },
    {
      name: "Hannah Cho",
      rating: 4,
      date: "1 month ago",
      body: "Practical and calm. The shadow lesson changed how I expose interviews.",
    },
  ],
  "interface-rhythm": [
    {
      name: "Sam Okonkwo",
      rating: 5,
      date: "2 months ago",
      body: "Threw out half our type ramp the same afternoon. The product immediately felt designed.",
    },
    {
      name: "Lina Berg",
      rating: 5,
      date: "3 weeks ago",
      body: "The pause lesson should be required for anyone who ships motion.",
    },
  ],
  "the-written-line": [
    {
      name: "Mark Ivers",
      rating: 5,
      date: "6 days ago",
      body: "I cut the first paragraph of every draft now. Helen is ruthless and I needed that.",
    },
  ],
  "color-after-dark": [
    {
      name: "Asha Patel",
      rating: 4,
      date: "2 months ago",
      body: "Finally a color course that does not hand you 40 swatches. Three notes. Done.",
    },
  ],
  "building-with-intent": [
    {
      name: "Chris Lang",
      rating: 5,
      date: "1 week ago",
      body: "The seam-naming lecture saved us a rewrite. I made the whole team watch it.",
    },
    {
      name: "Maya Feldman",
      rating: 5,
      date: "1 month ago",
      body: "Opinionated in a useful way. The boring path is now a phrase we use in standup.",
    },
  ],
  "still-life-studio": [
    {
      name: "Owen Blake",
      rating: 5,
      date: "3 weeks ago",
      body: "I shoot ceramics. This is the first course that talked about height as respect. Gorgeous and useful.",
    },
  ],
  "the-cut": [
    {
      name: "Rita Solano",
      rating: 5,
      date: "4 days ago",
      body: "The ethical cut lesson should be taught in every film school. Nina does not waste a second.",
    },
    {
      name: "Ben Park",
      rating: 5,
      date: "2 months ago",
      body: "I stopped temping music first. My scenes got better immediately.",
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
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}
