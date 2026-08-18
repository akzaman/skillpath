export type Category =
  | "Design"
  | "Photography"
  | "Craft"
  | "Engineering"
  | "Writing"
  | "Cinema";

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
  rail: [
    { src: "/videos/clip.mp4", type: "video/mp4" },
    { src: "/videos/clip.webm", type: "video/webm" },
  ],
} as const;

export const CATEGORIES: Category[] = [
  "Design",
  "Photography",
  "Craft",
  "Engineering",
  "Writing",
  "Cinema",
];

export const courses: Course[] = [
  {
    slug: "type-as-architecture",
    title: "Type as Architecture",
    subtitle: "How letters hold space, weight, and time.",
    description:
      "A studio course on editorial typography. Mara Voss treats the page as a building: columns as load-bearing walls, contrast as light, and silence as structure. You will learn to set type that feels inevitable rather than decorated.",
    category: "Design",
    level: "Intermediate",
    poster: "/courses/type.jpg",
    featured: true,
    instructor: {
      name: "Mara Voss",
      title: "Type director, Voss Press",
      initials: "MV",
      bio: "Mara spent twelve years as design director at a literary imprint before founding her own press. Her work sits in the Walker and Stedelijk collections.",
    },
    lessons: [
      {
        slug: "the-page-as-a-room",
        title: "The page as a room",
        durationSeconds: 596,
        sources: [...V.bunny],
        preview: true,
        summary:
          "Why margins are load-bearing, and how to give a paragraph a place to stand.",
        transcript:
          "A page is not a canvas you fill. It is a room you furnish. The first decision is not the typeface — it is the volume of air around the text.\n\nMargins are walls. If they are too thin the room feels cheap; if they are theatrical the text looks abandoned. I start every layout by deciding how a reader will enter: top-left, then a measured walk down the column.\n\nToday we will set a single essay page with one typeface, two sizes, and no color. If the page still holds, the architecture is sound.",
      },
      {
        slug: "weight-and-contrast",
        title: "Weight and contrast",
        durationSeconds: 653,
        sources: [...V.sintel],
        preview: false,
        summary: "Pairing roman and italic, and when contrast becomes noise.",
        transcript:
          "Contrast is how type speaks in more than one register. A regular roman is conversation. A well-cut italic is aside. Bold is a raised voice — use it as if someone is in the next room.\n\nWe will look at three pairings from the same family, then one deliberate mismatch. The goal is not novelty. It is a hierarchy a tired reader can feel without reading a single word.",
      },
      {
        slug: "the-measure",
        title: "The measure",
        durationSeconds: 888,
        sources: [...V.sintel],
        preview: false,
        summary: "Line length, leading, and the pace of a sentence.",
        transcript:
          "Sixty-six characters is not a rule. It is a starting temperature. A long line on a quiet page can be luxurious; the same line in a dense essay becomes a slog.\n\nLeading is the floor between storeys. Tighten it and the paragraph becomes a block. Open it and the eye starts to wander. We will set the same paragraph at four measures and listen to how the sentence changes speed.",
      },
      {
        slug: "display-and-silence",
        title: "Display and silence",
        durationSeconds: 734,
        sources: [...V.clip],
        preview: false,
        summary: "Titles that earn their size, and the value of leaving type alone.",
        transcript:
          "Display type is architecture seen from the street. It should be specific, a little severe, and never louder than the work it introduces.\n\nThe most common error is to treat a title as a poster. Give it one decision — size, or weight, or a slightly unexpected cut — and then stop. Silence around a word is what makes the word expensive.",
      },
    ],
  },
  {
    slug: "light-in-the-frame",
    title: "Light in the Frame",
    subtitle: "Seeing illumination before you expose it.",
    description:
      "Elias Cho teaches you to read a room before you lift a camera. Shape, falloff, and the moral temperature of a highlight. A foundations course for anyone who wants photographs that feel observed rather than lit.",
    category: "Photography",
    level: "Foundations",
    poster: "/courses/light.jpg",
    instructor: {
      name: "Elias Cho",
      title: "Cinematographer",
      initials: "EC",
      bio: "Elias has lit features, still campaigns, and two seasons of a chamber drama. He teaches the way he works: one source, then the decision to add nothing.",
    },
    lessons: [
      {
        slug: "one-window",
        title: "One window",
        durationSeconds: 596,
        sources: [...V.bunny],
        preview: true,
        summary: "North light, falloff, and why the first source is usually enough.",
        transcript:
          "Find a window. Turn everything else off. Now look at the floor, the far wall, and the side of a face if someone is sitting there. That gradient is your entire education for the next hour.\n\nWe will place a subject three distances from the same window and watch the contrast change. The lesson is not the meter reading. It is learning to see the falloff before you expose it.",
      },
      {
        slug: "hard-and-soft",
        title: "Hard and soft",
        durationSeconds: 653,
        sources: [...V.sintel],
        preview: false,
        summary: "Size of source relative to subject, not the modifier’s brand.",
        transcript:
          "Softness is a relationship, not a product. A large source close to the subject wraps. The same source far away becomes a hard disk in the sky.\n\nWe will take one lamp and change only its distance and the size of the diffusion. You will leave knowing why a cloudy day is a giant softbox and a bare bulb is a tiny sun.",
      },
      {
        slug: "the-shadow-has-a-job",
        title: "The shadow has a job",
        durationSeconds: 888,
        sources: [...V.sintel],
        preview: false,
        summary: "Protecting darkness so the highlight can mean something.",
        transcript:
          "A photograph without a true dark is a room with every lamp on. Shadows are not a problem to lift. They are the other half of the sentence.\n\nToday we expose for the highlight we care about and let the rest recede. If you are uneasy, good. That unease is taste forming.",
      },
      {
        slug: "practicals",
        title: "Practicals",
        durationSeconds: 60,
        sources: [...V.flower],
        preview: false,
        summary: "Lamps that belong in the picture, and how to make them work.",
        transcript:
          "A practical is a light the audience is allowed to see. A desk lamp, a neon, a television. It gives the frame a reason to be bright in one place.\n\nWe will dim, gel, and sometimes hide a second source behind the practical so it feels motivated. The goal is that no one asks where the light is coming from.",
      },
    ],
  },
  {
    slug: "interface-rhythm",
    title: "Interface Rhythm",
    subtitle: "Spacing, cadence, and the pace of a product.",
    description:
      "June Park’s course on product systems. Not a component library tour — a study of how interfaces breathe. You will leave with a spacing scale, a type ramp, and the judgment to break both.",
    category: "Design",
    level: "Intermediate",
    poster: "/courses/interface.jpg",
    instructor: {
      name: "June Park",
      title: "Product designer",
      initials: "JP",
      bio: "June has led design systems at two infrastructure companies. She believes most products fail at the pause between actions, not at the chrome.",
    },
    lessons: [
      {
        slug: "a-scale-not-a-mood",
        title: "A scale, not a mood",
        durationSeconds: 596,
        sources: [...V.bunny],
        preview: true,
        summary: "Why 4/8 spacing is a language, and how to keep it audible.",
        transcript:
          "A spacing scale is a grammar. Once the product can speak in fours and eights, every new screen is a sentence, not an invention.\n\nWe will take a noisy settings page and re-set it on a single scale. Nothing else changes. If it suddenly feels designed, you have your proof.",
      },
      {
        slug: "type-that-works-for-a-living",
        title: "Type that works for a living",
        durationSeconds: 653,
        sources: [...V.sintel],
        preview: false,
        summary: "Ramps, weights, and the three sizes a product actually needs.",
        transcript:
          "Most products have too many type sizes and not enough contrast. I use three: a display for the page, a body for work, and a meta for the quiet facts.\n\nWe will throw away the extra ramps and listen. Hierarchy should be felt in the first second, before anyone reads a label.",
      },
      {
        slug: "the-pause",
        title: "The pause",
        durationSeconds: 15,
        sources: [...V.flower],
        preview: false,
        summary: "Motion as punctuation, not applause.",
        transcript:
          "If everything animates, nothing is saying anything. Motion is punctuation. A 150-millisecond fade is a comma. A panel that takes 400 is a paragraph break.\n\nWe will strip a flow of its flourishes and add back only the motions that tell the user where they went.",
      },
      {
        slug: "breaking-the-system",
        title: "Breaking the system",
        durationSeconds: 734,
        sources: [...V.clip],
        preview: false,
        summary: "When a one-off is earned, and how to keep it from spreading.",
        transcript:
          "Systems exist so exceptions can be rare and expensive. A marketing hero may break the type ramp. A settings toggle may not.\n\nThe last lesson is judgment: write down why you broke the rule, then decide if the reason will still be true in six months.",
      },
    ],
  },
  {
    slug: "the-written-line",
    title: "The Written Line",
    subtitle: "Sentences that carry weight without raising their voice.",
    description:
      "Helen Ibarra on the essay, the memo, and the line that has to survive being read twice. A craft course for people who write for a living and are tired of performing intelligence.",
    category: "Writing",
    level: "Foundations",
    poster: "/courses/written.jpg",
    instructor: {
      name: "Helen Ibarra",
      title: "Essayist and editor",
      initials: "HI",
      bio: "Helen has edited a national magazine and published two collections. She teaches cutting as a form of hospitality to the reader.",
    },
    lessons: [
      {
        slug: "begin-in-the-middle",
        title: "Begin in the middle",
        durationSeconds: 596,
        sources: [...V.bunny],
        preview: true,
        summary: "Opening sentences that assume a serious reader.",
        transcript:
          "Do not warm up in public. The first sentence should already be at work. Context can arrive in the second paragraph, or never.\n\nWe will take five weak openings — the weather, the dictionary, the personal credential — and start each piece one paragraph later. Most essays improve by amputation.",
      },
      {
        slug: "cut-for-heat",
        title: "Cut for heat",
        durationSeconds: 653,
        sources: [...V.sintel],
        preview: false,
        summary: "Removing the sentence that is only there to impress you.",
        transcript:
          "A draft is a room you over-furnished. Cutting is not cruelty. It is making a path so the reader can walk without knocking into your cleverness.\n\nRead aloud. Every time you hear yourself perform, mark the line. Then decide if the thought survives without the costume.",
      },
      {
        slug: "the-honest-clause",
        title: "The honest clause",
        durationSeconds: 15,
        sources: [...V.flower],
        preview: false,
        summary: "Hedging, authority, and when uncertainty is the point.",
        transcript:
          "Writers hedge because they are afraid of being caught. Readers can hear that fear. Either know, or say you do not.\n\nWe will rewrite a cautious memo into something a colleague can act on. Precision is not the same as a pile of caveats.",
      },
      {
        slug: "ending-without-a-bow",
        title: "Ending without a bow",
        durationSeconds: 888,
        sources: [...V.sintel],
        preview: false,
        summary: "Last lines that leave a residue instead of a summary.",
        transcript:
          "A summary ending is a receipt. The reader already paid. End on an image, a fact, or a slightly more difficult version of the first sentence.\n\nIf you must conclude, conclude one inch past the argument — the implication, not the recap.",
      },
    ],
  },
  {
    slug: "color-after-dark",
    title: "Color After Dark",
    subtitle: "Restraint, temperature, and the palette that holds.",
    description:
      "Theo Maren’s color course for designers and photographers who have too many swatches. You will build one palette, learn to grade a still, and stop treating saturation as enthusiasm.",
    category: "Craft",
    level: "Intermediate",
    poster: "/courses/color.jpg",
    instructor: {
      name: "Theo Maren",
      title: "Colorist",
      initials: "TM",
      bio: "Theo grades commercials and independent features. He is known for palettes that feel like a room at dusk rather than a look-up table.",
    },
    lessons: [
      {
        slug: "three-notes",
        title: "Three notes",
        durationSeconds: 596,
        sources: [...V.bunny],
        preview: true,
        summary: "A working palette is a chord, not a drawer of paint.",
        transcript:
          "Pick a ground, a figure, and one accent. That is a palette. Everything else is a variation or a mistake.\n\nWe will mix a warm near-black, a paper light, and a single cool note, then apply it to a page, a still, and an interface. If it holds in all three, you can trust it.",
      },
      {
        slug: "temperature",
        title: "Temperature",
        durationSeconds: 734,
        sources: [...V.clip],
        preview: false,
        summary: "Warm and cool as story, not as a slider habit.",
        transcript:
          "Temperature is narrative. Warmth comes forward. Cool recedes, or it isolates. A face lit warm against a cool room is a person in a climate.\n\nWe will grade the same still two ways and talk about which story you are willing to tell.",
      },
      {
        slug: "the-cost-of-saturation",
        title: "The cost of saturation",
        durationSeconds: 15,
        sources: [...V.flower],
        preview: false,
        summary: "Why loud color is expensive, and how to spend it once.",
        transcript:
          "Saturation is a shout. If every object shouts, the frame has no subject. I keep most of the picture near grey and spend color on the one thing I cannot afford to miss.\n\nDesaturate first. Then give the accent back, a little at a time, until it is enough.",
      },
      {
        slug: "matching-a-room",
        title: "Matching a room",
        durationSeconds: 653,
        sources: [...V.sintel],
        preview: false,
        summary: "Making a set of images feel like they were taken in one climate.",
        transcript:
          "A series fails when each frame has its own weather. We will match five stills to one ground tone and one highlight color so they can sit on a wall together.\n\nThis is the unglamorous half of color: patience, and a reference print you refuse to abandon.",
      },
    ],
  },
  {
    slug: "building-with-intent",
    title: "Building with Intent",
    subtitle: "Frontend architecture that stays readable under pressure.",
    description:
      "Adrian Vale on structure: boundaries, data flow, and the discipline of naming. For engineers who can ship features and want the codebase to still make sense a year later.",
    category: "Engineering",
    level: "Advanced",
    poster: "/courses/build.jpg",
    instructor: {
      name: "Adrian Vale",
      title: "Staff engineer",
      initials: "AV",
      bio: "Adrian has led platform teams through two rewrites he now regrets and one he does not. He teaches the rewrite you can avoid.",
    },
    lessons: [
      {
        slug: "name-the-seam",
        title: "Name the seam",
        durationSeconds: 596,
        sources: [...V.bunny],
        preview: true,
        summary: "Boundaries first, folders second.",
        transcript:
          "A codebase is a set of promises about what can change without asking permission. Those promises are seams. Folders are just labels for the seams you already decided.\n\nWe will take a tangled feature and draw the seams on paper before touching a file. If you cannot name the boundary, you are not ready to extract it.",
      },
      {
        slug: "data-has-a-direction",
        title: "Data has a direction",
        durationSeconds: 888,
        sources: [...V.sintel],
        preview: false,
        summary: "One-way flow, and the cost of a hidden write.",
        transcript:
          "When two screens write the same record for different reasons, you have a conversation you cannot hear. Data should enter at the edge, change in one place, and leave as a view.\n\nWe will trace a bug that only exists because a component mutated a cache. Then we will make the write boring and visible.",
      },
      {
        slug: "the-boring-path",
        title: "The boring path",
        durationSeconds: 15,
        sources: [...V.flower],
        preview: false,
        summary: "Choosing the design you can explain on a Tuesday.",
        transcript:
          "Cleverness has a half-life. The design you can explain to a tired colleague is the one that will survive the next hire.\n\nIf a pattern needs a preamble, it is probably the wrong pattern. Prefer the boring path, then spend your taste on the part the user can see.",
      },
      {
        slug: "delete-with-confidence",
        title: "Delete with confidence",
        durationSeconds: 653,
        sources: [...V.sintel],
        preview: false,
        summary: "Dead code as a design smell, and how to retire it.",
        transcript:
          "Unused code is not free. It is a hallway people still walk down. Deletion is a design tool.\n\nWe will find a feature flag that outlived its experiment and remove the dead branch. The test is whether anyone notices. If they do not, you waited too long.",
      },
    ],
  },
  {
    slug: "still-life-studio",
    title: "Still Life Studio",
    subtitle: "Objects, surfaces, and the patience of north light.",
    description:
      "Soren Hale’s studio practice for product and still-life work. Linen, ceramic, falloff, and the discipline of leaving an object alone until it looks like itself.",
    category: "Photography",
    level: "Foundations",
    poster: "/courses/still.jpg",
    instructor: {
      name: "Soren Hale",
      title: "Still-life photographer",
      initials: "SH",
      bio: "Soren shoots for ceramicists and small publishers. His pictures are famous for looking unlit, which is the highest compliment he accepts.",
    },
    lessons: [
      {
        slug: "choose-the-object",
        title: "Choose the object",
        durationSeconds: 596,
        sources: [...V.bunny],
        preview: true,
        summary: "What earns a frame, and what is only clutter.",
        transcript:
          "A still life is a conversation among three things at most. The fourth object is almost always an apology.\n\nWe will build a table with too much on it, then remove until the remaining pieces start to speak. If you are unsure, take the loudest thing away.",
      },
      {
        slug: "cloth-and-ground",
        title: "Cloth and ground",
        durationSeconds: 30,
        sources: [...V.rail],
        preview: false,
        summary: "Linen, paper, stone — and how a surface sets the climate.",
        transcript:
          "The ground is the weather. Raw linen is overcast. Dark stone is night. A sheet of paper is a clinic. Choose the climate before you place the object.\n\nIron the cloth or do not — both are decisions. Wrinkles are only a problem when they were not intended.",
      },
      {
        slug: "height-and-respect",
        title: "Height and respect",
        durationSeconds: 653,
        sources: [...V.sintel],
        preview: false,
        summary: "Camera height as a moral choice about the object.",
        transcript:
          "Look down and the object becomes a diagram. Look across and it becomes a person. I prefer the height of a seated guest.\n\nWe will shoot the same bowl from three heights. Notice which one you would trust to tell the truth about the glaze.",
      },
      {
        slug: "leave-it-alone",
        title: "Leave it alone",
        durationSeconds: 734,
        sources: [...V.clip],
        preview: false,
        summary: "When the picture is finished, and the urge to add one more thing.",
        transcript:
          "The last move is usually the one that ruins it. Walk away. Come back. If you cannot remember what you were about to add, you were finished an hour ago.\n\nStill life is a practice of stopping. That is the whole craft, once the light is decent.",
      },
    ],
  },
  {
    slug: "the-cut",
    title: "The Cut",
    subtitle: "Editing as listening, not as decoration.",
    description:
      "Nina Kessler on picture editing: rhythm, the ethical cut, and how to let a scene finish. For filmmakers and anyone who sequences images for a living.",
    category: "Cinema",
    level: "Advanced",
    poster: "/courses/edit.jpg",
    instructor: {
      name: "Nina Kessler",
      title: "Picture editor",
      initials: "NK",
      bio: "Nina has cut documentaries and two narrative features. She describes editing as hospitality: seating the audience, then knowing when to stop talking.",
    },
    lessons: [
      {
        slug: "listen-to-the-dailies",
        title: "Listen to the dailies",
        durationSeconds: 596,
        sources: [...V.bunny],
        preview: true,
        summary: "Assembly as an act of attention, not of taste-making.",
        transcript:
          "Before you cut, you watch everything. Not to hunt for the hero take — to hear what the footage is already doing. The film will tell you its rhythm if you do not talk over it.\n\nWe will assemble a two-minute scene in story order, no music, no polish. If it works ugly, it will work dressed.",
      },
      {
        slug: "the-ethical-cut",
        title: "The ethical cut",
        durationSeconds: 888,
        sources: [...V.sintel],
        preview: false,
        summary: "What you owe a subject when you rearrange their time.",
        transcript:
          "Every cut is a claim about what happened. In fiction that claim is style. In documentary it is a responsibility.\n\nWe will look at two assemblies of the same interview: one that clarifies, one that manufactures. The difference is often a single reaction shot.",
      },
      {
        slug: "music-last",
        title: "Music last",
        durationSeconds: 15,
        sources: [...V.flower],
        preview: false,
        summary: "Why temp scores lie, and how to cut picture first.",
        transcript:
          "Temp music is a narcotic. It will convince you a limp scene has a pulse. Cut silent until the picture has a cadence of its own. Then choose music that agrees, or argue with it on purpose.\n\nIf the scene dies without the score, the scene was never alive.",
      },
      {
        slug: "let-it-finish",
        title: "Let it finish",
        durationSeconds: 734,
        sources: [...V.clip],
        preview: false,
        summary: "Holding a shot past comfort, and the courage of an ending.",
        transcript:
          "Editors cut early because they are afraid of boring someone. Audiences are more often bored by restlessness than by a shot that is allowed to complete its thought.\n\nHold. Count. Cut on the breath after the gesture, not on the gesture. That extra half-second is where the film becomes adult.",
      },
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
