// Curated puzzle datasets, crosswords, trivia, and word banks for DailyPuzzleHub

export const TARGET_WORDS = [
  "crane", "apple", "bloom", "ghost", "flame", "brick", "light", "ocean", "pearl", "quest",
  "storm", "vivid", "waltz", "zebra", "amber", "beach", "cloud", "dance", "eagle", "frost",
  "globe", "haven", "ivory", "jewel", "knife", "lemon", "magic", "night", "oasis", "piano",
  "raven", "solar", "tiger", "unity", "vigor", "wheat", "yield", "badge", "cabin", "drift",
  "flute", "grape", "haste", "inlet", "jolly", "kayak", "lunar", "melon", "noble", "orbit",
  "prism", "realm", "scale", "torch", "ultra", "voice", "whale", "yacht", "blaze", "cliff"
];

export const VALID_GUESS_SET = new Set([
  ...TARGET_WORDS,
  "about", "above", "actor", "acute", "admit", "adopt", "adult", "after", "again", "agent",
  "agree", "ahead", "alarm", "album", "alert", "alike", "alive", "allow", "alone", "along",
  "alter", "among", "anger", "angle", "angry", "apart", "apple", "apply", "arena", "argue",
  "arise", "array", "aside", "asset", "audio", "audit", "avoid", "awake", "award", "aware",
  "badly", "baker", "bases", "basic", "basis", "beach", "began", "begin", "begun", "being",
  "below", "bench", "billy", "birth", "black", "blame", "blind", "block", "blood", "board",
  "boost", "booth", "bound", "brain", "brand", "bread", "break", "breed", "brief", "bring",
  "broad", "broke", "brown", "build", "built", "buyer", "cable", "calif", "carry", "catch",
  "cause", "chain", "chair", "chart", "chase", "cheap", "check", "chest", "chief", "child",
  "china", "chose", "civil", "claim", "class", "clean", "clear", "click", "clock", "close"
]);

export interface ConnectionsGroup {
  category: string;
  color: "yellow" | "green" | "blue" | "purple";
  words: string[];
}

export const CONNECTIONS_PUZZLES: ConnectionsGroup[][] = [
  [
    { category: "COFFEE ORDERS", color: "yellow", words: ["LATTE", "MOCHA", "ESPRESSO", "DRIP"] },
    { category: "THINGS WITH RINGS", color: "green", words: ["SATURN", "TREE", "CIRCUS", "ONION"] },
    { category: "CARD GAMES", color: "blue", words: ["POKER", "BRIDGE", "HEARTS", "RUMMY"] },
    { category: "WORDS BEFORE 'JACK'", color: "purple", words: ["APPLE", "FLAP", "LUMBER", "CRACKER"] },
  ],
  [
    { category: "FAST ANIMALS", color: "yellow", words: ["CHEETAH", "FALCON", "SAILFISH", "HARE"] },
    { category: "UNITS OF TIME", color: "green", words: ["SECOND", "MINUTE", "DECADE", "CENTURY"] },
    { category: "CHESS PIECES", color: "blue", words: ["KNIGHT", "BISHOP", "ROOK", "PAWN"] },
    { category: "WORDS STARTING WITH GREEK LETTERS", color: "purple", words: ["ALPHABET", "BETACAM", "DELTACON", "GAMMA"] },
  ],
  [
    { category: "FRUITS THAT ARE RED", color: "yellow", words: ["CHERRY", "STRAWBERRY", "RASPBERRY", "POMEGRANATE"] },
    { category: "MUSICAL INSTRUMENTS", color: "green", words: ["CELLO", "TRUMPET", "OBOE", "CLARINET"] },
    { category: "WEB BROWSERS", color: "blue", words: ["CHROME", "SAFARI", "EDGE", "FIREFOX"] },
    { category: "PUNCTUATION MARKS", color: "purple", words: ["COMMA", "COLON", "HYPHEN", "PERIOD"] },
  ]
];

export const CROSSWORD_PUZZLES = [
  {
    across: [
      { num: 1, clue: "Celestial body with a tail", answer: "COMET", row: 0, col: 0 },
      { num: 4, clue: "Not asleep", answer: "AWAKE", row: 1, col: 0 },
      { num: 5, clue: "Deep ocean trench", answer: "ABYSS", row: 2, col: 0 },
      { num: 6, clue: "Slightly wet", answer: "MOIST", row: 3, col: 0 },
      { num: 7, clue: "Fierce predator of the jungle", answer: "TIGER", row: 4, col: 0 },
    ],
    down: [
      { num: 1, clue: "Gentle; peaceful", answer: "CALMT", row: 0, col: 0 },
      { num: 2, clue: "Single entity", answer: "ONE", row: 0, col: 1 },
      { num: 3, clue: "Substance or essence", answer: "MATTER", row: 0, col: 2 },
    ]
  },
  {
    across: [
      { num: 1, clue: "Breathe with difficulty", answer: "GASP", row: 0, col: 0 },
      { num: 4, clue: "Atmosphere or aura", answer: "AIR", row: 1, col: 0 },
      { num: 5, clue: "Musical composition for solo instrument", answer: "SONATA", row: 2, col: 0 },
    ],
    down: [
      { num: 1, clue: "Precious stone", answer: "GEM", row: 0, col: 0 },
      { num: 2, clue: "Competent or skillful", answer: "ABLE", row: 0, col: 1 },
      { num: 3, clue: "Rapid movement", answer: "SPURT", row: 0, col: 2 },
    ]
  }
];

export const TRIVIA_QUESTIONS = [
  {
    question: "Which planet in our solar system has the most extensive ring system?",
    options: ["Jupiter", "Saturn", "Uranus", "Neptune"],
    correct: 1,
    explanation: "Saturn is famous for its bright, prominent rings made mostly of ice and rock particles."
  },
  {
    question: "What is the capital city of Australia?",
    options: ["Sydney", "Melbourne", "Canberra", "Brisbane"],
    correct: 2,
    explanation: "Canberra was selected as the compromise capital between Sydney and Melbourne in 1908."
  },
  {
    question: "Which chemical element has the symbol 'Fe'?",
    options: ["Fluorine", "Iron", "Francium", "Fermium"],
    correct: 1,
    explanation: "The symbol 'Fe' comes from the Latin word for iron, 'ferrum'."
  },
  {
    question: "Who developed the theory of General Relativity?",
    options: ["Isaac Newton", "Niels Bohr", "Albert Einstein", "Stephen Hawking"],
    correct: 2,
    explanation: "Albert Einstein published General Relativity in 1915, transforming our view of gravity."
  },
  {
    question: "What is the rarest blood type in the human population?",
    options: ["O negative", "A positive", "AB negative", "B negative"],
    correct: 2,
    explanation: "AB negative is the rarest major blood type, occurring in less than 1% of the world population."
  },
  {
    question: "Which ancient civilization constructed the city of Machu Picchu?",
    options: ["Aztecs", "Maya", "Inca", "Olmec"],
    correct: 2,
    explanation: "Machu Picchu is a 15th-century Inca citadel situated on a mountain ridge in Peru."
  },
  {
    question: "In computer science, what does 'HTTP' stand for?",
    options: [
      "HyperText Transfer Protocol",
      "High Transmission Transit Program",
      "Hyperlink Text Terminal Platform",
      "Host Transfer Terminal Protocol"
    ],
    correct: 0,
    explanation: "HTTP stands for HyperText Transfer Protocol, the foundation of data communication for the World Wide Web."
  }
];

export const CRYPTOGRAM_QUOTES = [
  {
    quote: "THE ONLY WAY TO DO GREAT WORK IS TO LOVE WHAT YOU DO",
    author: "STEVE JOBS"
  },
  {
    quote: "IN THE MIDDLE OF EVERY DIFFICULTY LIES OPPORTUNITY",
    author: "ALBERT EINSTEIN"
  },
  {
    quote: "DO WHAT YOU CAN WITH WHAT YOU HAVE WHERE YOU ARE",
    author: "THEODORE ROOSEVELT"
  },
  {
    quote: "KNOWLEDGE IS POWER AND CURIOSITY IS THE ENGINE OF ACHIEVEMENT",
    author: "FRANCIS BACON"
  },
  {
    quote: "THE SECRET OF GETTING AHEAD IS GETTING STARTED TODAY",
    author: "MARK TWAIN"
  }
];

export const NONOGRAM_PUZZLES = [
  {
    name: "Heart",
    size: 5,
    solution: [
      [0, 1, 0, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0]
    ],
    rowClues: [[1, 1], [5], [5], [3], [1]],
    colClues: [[2], [4], [4], [4], [2]]
  },
  {
    name: "Duck",
    size: 5,
    solution: [
      [0, 1, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0],
      [1, 1, 1, 1, 0],
      [0, 1, 1, 0, 0]
    ],
    rowClues: [[2], [3], [1], [4], [2]],
    colClues: [[1], [3], [5], [2], [0]]
  },
  {
    name: "Coffee Cup",
    size: 5,
    solution: [
      [1, 0, 1, 0, 0],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 0, 1],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0]
    ],
    rowClues: [[1, 1], [5], [3, 1], [5], [3]],
    colClues: [[4], [4], [5], [3], [3]]
  }
];

export const WORD_LADDER_PAIRS = [
  { start: "COLD", end: "WARM", steps: ["CORD", "CARD", "WARD"] },
  { start: "HEAD", end: "TAIL", steps: ["HEAL", "TEAL", "TELL", "TOLL"] },
  { start: "CAT", end: "DOG", steps: ["COT", "DOT"] },
  { start: "FOUR", end: "FIVE", steps: ["FOUL", "FOIL", "FAIL", "FILE"] },
  { start: "FAST", end: "SLOW", steps: ["PAST", "POST", "PLOT", "SLOT"] }
];
