import { PrismaClient, GameType, Role } from "@prisma/client";

const prisma = new PrismaClient();

const GAMES = [
  { slug: "wordle", title: "Daily Word Guess", category: "Word", thumbnail: "🟩", type: GameType.BUILTIN },
  { slug: "sudoku", title: "Daily Sudoku", category: "Logic", thumbnail: "🔢", type: GameType.BUILTIN },
  { slug: "minesweeper", title: "Daily Minesweeper", category: "Logic", thumbnail: "💣", type: GameType.BUILTIN },
  { slug: "connections", title: "Daily Connections", category: "Word", thumbnail: "🟨", type: GameType.BUILTIN },
  { slug: "crossword", title: "Daily Mini Crossword", category: "Word", thumbnail: "📰", type: GameType.BUILTIN },
  { slug: "nonogram", title: "Daily Nonogram", category: "Logic", thumbnail: "⬛", type: GameType.BUILTIN },
  { slug: "2048", title: "Daily 2048", category: "Math", thumbnail: "🟧", type: GameType.BUILTIN },
  { slug: "word-search", title: "Daily Word Search", category: "Word", thumbnail: "🔍", type: GameType.BUILTIN },
  { slug: "anagrams", title: "Daily Anagram Scramble", category: "Word", thumbnail: "🔤", type: GameType.BUILTIN },
  { slug: "memory-match", title: "Daily Memory Match", category: "Memory", thumbnail: "🃏", type: GameType.BUILTIN },
  { slug: "sliding-tile", title: "Daily Sliding Tile", category: "Logic", thumbnail: "🧩", type: GameType.BUILTIN },
  { slug: "sequence-memory", title: "Daily Sequence Memory", category: "Memory", thumbnail: "🔔", type: GameType.BUILTIN },
  { slug: "cryptogram", title: "Daily Cryptogram", category: "Word", thumbnail: "📜", type: GameType.BUILTIN },
  { slug: "maze-runner", title: "Daily Maze Runner", category: "Logic", thumbnail: "🌀", type: GameType.BUILTIN },
  { slug: "kakuro", title: "Daily Kakuro", category: "Math", thumbnail: "➕", type: GameType.BUILTIN },
  { slug: "lights-out", title: "Daily Lights Out", category: "Logic", thumbnail: "💡", type: GameType.BUILTIN },
  { slug: "tower-of-hanoi", title: "Daily Tower of Hanoi", category: "Logic", thumbnail: "🗼", type: GameType.BUILTIN },
  { slug: "mastermind", title: "Daily Mastermind", category: "Logic", thumbnail: "🎯", type: GameType.BUILTIN },
  { slug: "word-ladder", title: "Daily Word Ladder", category: "Word", thumbnail: "🪜", type: GameType.BUILTIN },
  { slug: "trivia-quiz", title: "Daily Trivia Quiz", category: "Classic", thumbnail: "🧠", type: GameType.BUILTIN },
];

async function main() {
  console.log("🌱 Seeding DailyPuzzleHub database...");

  // Seed all 20 games
  for (const game of GAMES) {
    await prisma.game.upsert({
      where: { slug: game.slug },
      update: {
        title: game.title,
        category: game.category,
        thumbnail: game.thumbnail,
        isActive: true,
      },
      create: {
        ...game,
        isActive: true,
      },
    });
    console.log(`  ✓ Game: ${game.title}`);
  }

  // Seed admin user
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@dailypuzzlehub.com" },
    update: {},
    create: {
      email: "admin@dailypuzzlehub.com",
      name: "Site Architect",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Admin",
      role: Role.ADMIN,
      country: "NP",
      totalXp: 12500,
      currentStreak: 15,
    },
  });
  console.log(`  ✓ Admin user: ${adminUser.email}`);

  // Seed demo player
  const playerUser = await prisma.user.upsert({
    where: { email: "player@dailypuzzlehub.com" },
    update: {},
    create: {
      email: "player@dailypuzzlehub.com",
      name: "Daily Puzzler",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Player",
      role: Role.USER,
      country: "NP",
      totalXp: 3400,
      currentStreak: 4,
    },
  });
  console.log(`  ✓ Player user: ${playerUser.email}`);

  console.log("\n✅ Seeding complete! 20 games + 2 users seeded to PostgreSQL.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
