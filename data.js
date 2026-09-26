/**
 * DailyPuzzleHub — data.js
 * Curated datasets for deterministic daily puzzle generation.
 * All puzzles are deterministically picked based on the current UTC date.
 */

'use strict';

/* ============================================================
   1. DAILY CONNECTIONS DATA (4 Groups of 4 Words)
   Categories: Yellow (Straightforward), Green (Medium), Blue (Tricky), Purple (Wordplay)
   ============================================================ */
const CONNECTIONS_PUZZLES = [
  {
    id: 1,
    groups: [
      { category: "COFFEE DRINKS", level: 1, color: "yellow", words: ["LATTE", "MOCHA", "ESPRESSO", "AMERICANO"] },
      { category: "THINGS WITH KEYS", level: 2, color: "green", words: ["PIANO", "LAPTOP", "HOTEL", "KEYCHAIN"] },
      { category: "MONOPOLY SQUARES", level: 3, color: "blue", words: ["CHANCE", "JAIL", "BOARDWALK", "PARKING"] },
      { category: "WORDS BEFORE 'CAKE'", level: 4, color: "purple", words: ["CUP", "PAN", "POUND", "SHORT"] }
    ]
  },
  {
    id: 2,
    groups: [
      { category: "TYPES OF BERRIES", level: 1, color: "yellow", words: ["STRAWBERRY", "BLUEBERRY", "RASPBERRY", "BLACKBERRY"] },
      { category: "UNITS OF LENGTH", level: 2, color: "green", words: ["INCH", "FOOT", "YARD", "MILE"] },
      { category: "WORDS WITH DOUBLE LETTERS", level: 3, color: "blue", words: ["BOOKKEEPER", "COFFEE", "BALLOON", "COMMITTEE"] },
      { category: "WORDS STARTING WITH GREEK LETTERS", level: 4, color: "purple", words: ["ALPHABET", "BETAMAX", "GAMMARAY", "DELTAPLANE"] }
    ]
  },
  {
    id: 3,
    groups: [
      { category: "COLD THINGS", level: 1, color: "yellow", words: ["ICE", "GLACIER", "FREEZER", "IGLOO"] },
      { category: "CARD GAMES", level: 2, color: "green", words: ["POKER", "BRIDGE", "RUMMY", "SOLITAIRE"] },
      { category: "PARTS OF A GUITAR", level: 3, color: "blue", words: ["FRET", "STRING", "BRIDGE", "PICKGUARD"] },
      { category: "HOMOPHONES OF NUMBERS", level: 4, color: "purple", words: ["WON", "TOO", "FOR", "ATE"] }
    ]
  },
  {
    id: 4,
    groups: [
      { category: "FACIAL HAIR", level: 1, color: "yellow", words: ["BEARD", "MOUSTACHE", "GOATEE", "SIDEBURNS"] },
      { category: "PLANETS IN THE SOLAR SYSTEM", level: 2, color: "green", words: ["MARS", "VENUS", "JUPITER", "SATURN"] },
      { category: "SYNONYMS FOR EXCELLENT", level: 3, color: "blue", words: ["SUPERB", "STELLAR", "PRIME", "SPLENDID"] },
      { category: "THINGS THAT HAVE RINGS", level: 4, color: "purple", words: ["TREE", "CIRCUS", "SATURN", "PHONE"] }
    ]
  },
  {
    id: 5,
    groups: [
      { category: "GEMSTONES", level: 1, color: "yellow", words: ["RUBY", "EMERALD", "SAPPHIRE", "DIAMOND"] },
      { category: "CHESS PIECES", level: 2, color: "green", words: ["KNIGHT", "BISHOP", "ROOK", "PAWN"] },
      { category: "BODY PARTS IN COMMON IDIOMS", level: 3, color: "blue", words: ["THUMB", "SHOULDER", "HEEL", "ELBOW"] },
      { category: "WORDS ENDING IN 'BOARD'", level: 4, color: "purple", words: ["KEY", "SURF", "CHALK", "CARD"] }
    ]
  },
  {
    id: 6,
    groups: [
      { category: "DOG BREEDS", level: 1, color: "yellow", words: ["BEAGLE", "POODLE", "BOXER", "BULLDOG"] },
      { category: "WATER BODIES", level: 2, color: "green", words: ["OCEAN", "RIVER", "LAKE", "STREAM"] },
      { category: "THINGS WITH TEETH", level: 3, color: "blue", words: ["COMB", "GEAR", "ZIPPER", "SAW"] },
      { category: "WORDS THAT CAN MEAN 'TIE'", level: 4, color: "purple", words: ["DRAW", "BIND", "KNOT", "LINK"] }
    ]
  },
  {
    id: 7,
    groups: [
      { category: "FOOTWEAR", level: 1, color: "yellow", words: ["BOOT", "SNEAKER", "SANDAL", "LOAFER"] },
      { category: "MUSICAL GENRES", level: 2, color: "green", words: ["JAZZ", "BLUES", "ROCK", "SALSA"] },
      { category: "SHADES OF GREEN", level: 3, color: "blue", words: ["EMERALD", "MINT", "OLIVE", "FOREST"] },
      { category: "WORDS BEFORE 'BALL'", level: 4, color: "purple", words: ["BASE", "SNOW", "MEAT", "FIRE"] }
    ]
  },
  {
    id: 8,
    groups: [
      { category: "CITRUS FRUITS", level: 1, color: "yellow", words: ["LEMON", "LIME", "ORANGE", "GRAPEFRUIT"] },
      { category: "ELEMENTS OF WEATHER", level: 2, color: "green", words: ["RAIN", "WIND", "HAIL", "SNOW"] },
      { category: "THINGS YOU CATCH", level: 3, color: "blue", words: ["COLD", "BALL", "BUS", "BREATH"] },
      { category: "WORDS THAT RHYME WITH 'NIGHT'", level: 4, color: "purple", words: ["BITE", "KITE", "LIGHT", "SIGHT"] }
    ]
  }
];

/* ============================================================
   2. DAILY MINI CROSSWORD DATA (5x5 Grids)
   Grid format: 5 rows of 5 chars ('#' for black cell)
   Across & Down clues numbered appropriately.
   ============================================================ */
const MINI_CROSSWORD_PUZZLES = [
  {
    id: 1,
    title: "Fresh Start",
    grid: [
      "S","M","A","R","T",
      "P","A","P","E","R",
      "A","P","P","L","E",
      "R","L","L","E","E",
      "K","E","E","P","S"
    ],
    // Black cells (none for full 5x5, or specified indices)
    blocks: [],
    across: [
      { num: 1, clue: "Quick on one's feet; clever", ans: "SMART", row: 0, col: 0 },
      { num: 6, clue: "Document material", ans: "PAPER", row: 1, col: 0 },
      { num: 7, clue: "Fruit for a teacher", ans: "APPLE", row: 2, col: 0 },
      { num: 8, clue: "Sheltered nautical side", ans: "RLLEE", row: 3, col: 0 },
      { num: 9, clue: "Retains or holds onto", ans: "KEEPS", row: 4, col: 0 }
    ],
    down: [
      { num: 1, clue: "Flash of light or inspiration", ans: "SPARK", col: 0, row: 0 },
      { num: 2, clue: "Table sweetener syrup source", ans: "MAPLE", col: 1, row: 0 },
      { num: 3, clue: "Put on or utilize", ans: "APPLE", col: 2, row: 0 },
      { num: 4, clue: "Take it easy; lounge", ans: "RELEP", col: 3, row: 0 },
      { num: 5, clue: "Arboreal forest giants", ans: "TREES", col: 4, row: 0 }
    ]
  },
  {
    id: 2,
    title: "Morning Brew",
    grid: [
      "C","H","E","S","S",
      "L","O","V","E","R",
      "O","U","E","R","A",
      "T","S","N","A","P",
      "H","E","A","R","T"
    ],
    blocks: [],
    across: [
      { num: 1, clue: "Game with kings and queens", ans: "CHESS", row: 0, col: 0 },
      { num: 6, clue: "One who admires deeply", ans: "LOVER", row: 1, col: 0 },
      { num: 7, clue: "Historical epoch or span", ans: "OUERA", row: 2, col: 0 },
      { num: 8, clue: "Finger flick sound", ans: "TSNAP", row: 3, col: 0 },
      { num: 9, clue: "Symbol of affection", ans: "HEART", row: 4, col: 0 }
    ],
    down: [
      { num: 1, clue: "Garment fabric piece", ans: "CLOTH", col: 0, row: 0 },
      { num: 2, clue: "Dwelling or domicile", ans: "HOUSE", col: 1, row: 0 },
      { num: 3, clue: "Occasion or happening", ans: "EVENA", col: 2, row: 0 },
      { num: 4, clue: "Serene and calm", ans: "SERAR", col: 3, row: 0 },
      { num: 5, clue: "Courageous or brave", ans: "SRAPT", col: 4, row: 0 }
    ]
  },
  {
    id: 3,
    title: "Daily Spark",
    grid: [
      "B","R","A","I","N",
      "R","A","D","A","R",
      "A","D","O","R","E",
      "S","C","R","A","P",
      "S","H","E","E","T"
    ],
    blocks: [],
    across: [
      { num: 1, clue: "Seat of intellect and thought", ans: "BRAIN", row: 0, col: 0 },
      { num: 6, clue: "Detection device for aircraft", ans: "RADAR", row: 1, col: 0 },
      { num: 7, clue: "Love intensely", ans: "ADORE", row: 2, col: 0 },
      { num: 8, clue: "Discarded fragment or fight", ans: "SCRAP", row: 3, col: 0 },
      { num: 9, clue: "Bed linen layer", ans: "SHEET", row: 4, col: 0 }
    ],
    down: [
      { num: 1, clue: "Copper and zinc alloy", ans: "BRASS", col: 0, row: 0 },
      { num: 2, clue: "Circular radar sweep or beam", ans: "RADCH", col: 1, row: 0 },
      { num: 3, clue: "Pleasant scent or fragrance", ans: "ADORE", col: 2, row: 0 },
      { num: 4, clue: "Air travelers' wing machine", ans: "IARAE", col: 3, row: 0 },
      { num: 5, clue: "Tidy and orderly", ans: "NREPT", col: 4, row: 0 }
    ]
  },
  {
    id: 4,
    title: "Quick Logic",
    grid: [
      "P","L","A","N","T",
      "L","E","M","O","N",
      "A","M","P","L","E",
      "T","O","L","L","S",
      "E","N","E","R","G"
    ],
    blocks: [],
    across: [
      { num: 1, clue: "Flora organism in soil", ans: "PLANT", row: 0, col: 0 },
      { num: 6, clue: "Sour yellow citrus", ans: "LEMON", row: 1, col: 0 },
      { num: 7, clue: "Abundant and sufficient", ans: "AMPLE", row: 2, col: 0 },
      { num: 8, clue: "Highway fees", ans: "TOLLS", row: 3, col: 0 },
      { num: 9, clue: "Vigor and power (abbr.)", ans: "ENERG", row: 4, col: 0 }
    ],
    down: [
      { num: 1, clue: "Dish for dinner dining", ans: "PLATE", col: 0, row: 0 },
      { num: 2, clue: "Citrus beverage source", ans: "LEMON", col: 1, row: 0 },
      { num: 3, clue: "Abundant or plentiful", ans: "AMPLE", col: 2, row: 0 },
      { num: 4, clue: "Zero score in tennis", ans: "NOLLER", col: 3, row: 0 },
      { num: 5, clue: "Tents and woodland trips", ans: "TNEGS", col: 4, row: 0 }
    ]
  }
];

/* ============================================================
   3. DAILY NONOGRAM (PICROSS) DATA
   5x5 and 8x8 pixel art patterns
   1 = filled, 0 = empty
   ============================================================ */
const NONOGRAM_PUZZLES = [
  {
    id: 1,
    name: "Heart",
    size: 5,
    icon: "❤️",
    grid: [
      [0, 1, 0, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0]
    ]
  },
  {
    id: 2,
    name: "Smiley",
    size: 5,
    icon: "😊",
    grid: [
      [0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0],
      [0, 0, 0, 0, 0],
      [1, 0, 0, 0, 1],
      [0, 1, 1, 1, 0]
    ]
  },
  {
    id: 3,
    name: "Pine Tree",
    size: 5,
    icon: "🌲",
    grid: [
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0]
    ]
  },
  {
    id: 4,
    name: "Coffee Cup",
    size: 5,
    icon: "☕",
    grid: [
      [0, 1, 0, 1, 0],
      [1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 1, 1, 1, 0]
    ]
  },
  {
    id: 5,
    name: "Sword",
    size: 5,
    icon: "⚔️",
    grid: [
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [1, 1, 1, 1, 1],
      [0, 0, 1, 0, 0],
      [0, 1, 0, 1, 0]
    ]
  },
  {
    id: 6,
    name: "Sailboat",
    size: 8,
    icon: "⛵",
    grid: [
      [0, 0, 0, 1, 0, 0, 0, 0],
      [0, 0, 1, 1, 0, 0, 0, 0],
      [0, 1, 1, 1, 0, 1, 0, 0],
      [1, 1, 1, 1, 0, 1, 1, 0],
      [0, 0, 0, 1, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0]
    ]
  },
  {
    id: 7,
    name: "Diamond",
    size: 8,
    icon: "💎",
    grid: [
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ]
  },
  {
    id: 8,
    name: "Crown",
    size: 8,
    icon: "👑",
    grid: [
      [1, 0, 0, 1, 1, 0, 0, 1],
      [1, 1, 0, 1, 1, 0, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ]
  }
];

/* ============================================================
   4. DAILY ANAGRAM SCRAMBLE DATA
   7-letter words with definitions, clues, and bonus subwords
   ============================================================ */
const ANAGRAM_PUZZLES = [
  {
    id: 1,
    target: "BALANCE",
    clue: "An even distribution of weight enabling someone or something to remain upright",
    hint: "Starts with B, ends with E"
  },
  {
    id: 2,
    target: "COURAGE",
    clue: "Strength in the face of pain or grief; bravery",
    hint: "Has 4 vowels"
  },
  {
    id: 3,
    target: "JOURNEY",
    clue: "An act of traveling from one place to another",
    hint: "Contains a 'J' and 'Y'"
  },
  {
    id: 4,
    target: "FREEDOM",
    clue: "The power or right to act, speak, or think as one wants",
    hint: "Double 'E' in the center"
  },
  {
    id: 5,
    target: "WEATHER",
    clue: "The state of the atmosphere at a particular place and time",
    hint: "Can be rainy, sunny, or snowy"
  },
  {
    id: 6,
    target: "KITCHEN",
    clue: "A room or part of a room used for cooking and food preparation",
    hint: "Cooking hearth and counters"
  },
  {
    id: 7,
    target: "MYSTERY",
    clue: "Something that is difficult or impossible to understand or explain",
    hint: "Two 'Y's enclosed"
  },
  {
    id: 8,
    target: "HARMONY",
    clue: "Agreement or concord; pleasing arrangement of musical parts",
    hint: "Starts with H, ends with Y"
  },
  {
    id: 9,
    target: "PENGUIN",
    clue: "A flightless seabird of southern hemisphere waters",
    hint: "Waddles on ice in a tuxedo"
  },
  {
    id: 10,
    target: "DIAMOND",
    clue: "A precious stone consisting of a clear crystalline form of pure carbon",
    hint: "The hardest natural substance"
  }
];

/* ============================================================
   5. DAILY CRYPTOGRAM DATA
   Famous quotes with author attribution
   ============================================================ */
const CRYPTOGRAM_PUZZLES = [
  {
    id: 1,
    quote: "THE ONLY WAY TO DO GREAT WORK IS TO LOVE WHAT YOU DO.",
    author: "Steve Jobs"
  },
  {
    id: 2,
    quote: "IN THE MIDDLE OF EVERY DIFFICULTY LIES OPPORTUNITY.",
    author: "Albert Einstein"
  },
  {
    id: 3,
    quote: "IT ALWAYS SEEMS IMPOSSIBLE UNTIL IT IS DONE.",
    author: "Nelson Mandela"
  },
  {
    id: 4,
    quote: "HAPPINESS IS NOT SOMETHING READY MADE. IT COMES FROM YOUR OWN ACTIONS.",
    author: "Dalai Lama"
  },
  {
    id: 5,
    quote: "BE THE CHANGE THAT YOU WISH TO SEE IN THE WORLD.",
    author: "Mahatma Gandhi"
  },
  {
    id: 6,
    quote: "NOT ALL THOSE WHO WANDER ARE LOST.",
    author: "J.R.R. Tolkien"
  },
  {
    id: 7,
    quote: "STAY HUNGRY. STAY FOOLISH.",
    author: "Steve Jobs"
  },
  {
    id: 8,
    quote: "LIFE IS WHAT HAPPENS WHEN YOU ARE BUSY MAKING OTHER PLANS.",
    author: "John Lennon"
  },
  {
    id: 9,
    quote: "WHATEVER YOU ARE, BE A GOOD ONE.",
    author: "Abraham Lincoln"
  },
  {
    id: 10,
    quote: "KNOWLEDGE SPEAKS, BUT WISDOM LISTENS.",
    author: "Jimi Hendrix"
  }
];

/* ============================================================
   6. DAILY WORD SEARCH DATA
   Themes with 6 target words each
   ============================================================ */
const WORDSEARCH_PUZZLES = [
  {
    id: 1,
    theme: "SOLAR SYSTEM",
    words: ["MARS", "VENUS", "EARTH", "COMET", "MOON", "ORBIT"]
  },
  {
    id: 2,
    theme: "OCEAN LIFE",
    words: ["SHARK", "WHALE", "CORAL", "SQUID", "CLAM", "OTTER"]
  },
  {
    id: 3,
    theme: "SWEET TREATS",
    words: ["CANDY", "CAKE", "FUDGE", "DONUT", "JELLY", "COOKIE"]
  },
  {
    id: 4,
    theme: "MUSICAL SOUNDS",
    words: ["TEMPO", "CHORD", "PIANO", "FLUTE", "DRUM", "BRASS"]
  },
  {
    id: 5,
    theme: "TECH WORLD",
    words: ["PIXEL", "ROBOT", "CLOUD", "LOGIC", "DATA", "CYBER"]
  },
  {
    id: 6,
    theme: "RAINFOREST",
    words: ["JAGUAR", "TOUCAN", "VINE", "FERN", "RIVER", "CANOPY"]
  },
  {
    id: 7,
    theme: "GEMSTONES",
    words: ["RUBY", "TOPAZ", "OPAL", "JADE", "AGATE", "PEARL"]
  },
  {
    id: 8,
    theme: "BREAKFAST",
    words: ["TOAST", "BAGEL", "BACON", "HONEY", "FRUIT", "CREPE"]
  }
];

/* ============================================================
   7. DAILY MEMORY MATCH EMOJI THEMES (8 pairs = 16 cards)
   ============================================================ */
const MEMORY_MATCH_SETS = [
  ["🦁", "🚀", "💎", "🍕", "🎸", "🌺", "⚡", "🏆"],
  ["🎨", "🛸", "🦄", "🍦", "🎷", "🌈", "🔥", "👑"],
  ["🐬", "🎯", "🍀", "🍓", "🎹", "✨", "🪐", "🎁"],
  ["🦊", "🏖️", "🔮", "🥑", "🎻", "🌙", "🌊", "🥇"]
];
