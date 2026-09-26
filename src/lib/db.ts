import { PrismaClient, Role, GameType } from "@prisma/client";

// Global Prisma instance for Next.js hot reloading
const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export interface BuiltinGameSeed {
  id: string;
  slug: string;
  title: string;
  category: "Word" | "Logic" | "Memory" | "Math" | "Classic";
  thumbnail: string;
  type: GameType;
  isActive: boolean;
  configJson?: any;
}

export const INITIAL_GAMES: BuiltinGameSeed[] = [
  { id: "g1", slug: "wordle", title: "Daily Word Guess", category: "Word", thumbnail: "🟩", type: GameType.BUILTIN, isActive: true },
  { id: "g2", slug: "sudoku", title: "Daily Sudoku", category: "Logic", thumbnail: "🔢", type: GameType.BUILTIN, isActive: true },
  { id: "g3", slug: "minesweeper", title: "Daily Minesweeper", category: "Logic", thumbnail: "💣", type: GameType.BUILTIN, isActive: true },
  { id: "g4", slug: "connections", title: "Daily Connections", category: "Word", thumbnail: "🟨", type: GameType.BUILTIN, isActive: true },
  { id: "g5", slug: "crossword", title: "Daily Mini Crossword", category: "Word", thumbnail: "📰", type: GameType.BUILTIN, isActive: true },
  { id: "g6", slug: "nonogram", title: "Daily Nonogram", category: "Logic", thumbnail: "⬛", type: GameType.BUILTIN, isActive: true },
  { id: "g7", slug: "2048", title: "Daily 2048", category: "Math", thumbnail: "🟧", type: GameType.BUILTIN, isActive: true },
  { id: "g8", slug: "word-search", title: "Daily Word Search", category: "Word", thumbnail: "🔍", type: GameType.BUILTIN, isActive: true },
  { id: "g9", slug: "anagrams", title: "Daily Anagram Scramble", category: "Word", thumbnail: "🔤", type: GameType.BUILTIN, isActive: true },
  { id: "g10", slug: "memory-match", title: "Daily Memory Match", category: "Memory", thumbnail: "🃏", type: GameType.BUILTIN, isActive: true },
  { id: "g11", slug: "sliding-tile", title: "Daily Sliding Tile", category: "Logic", thumbnail: "🧩", type: GameType.BUILTIN, isActive: true },
  { id: "g12", slug: "sequence-memory", title: "Daily Sequence Memory", category: "Memory", thumbnail: "🔔", type: GameType.BUILTIN, isActive: true },
  { id: "g13", slug: "cryptogram", title: "Daily Cryptogram", category: "Word", thumbnail: "📜", type: GameType.BUILTIN, isActive: true },
  { id: "g14", slug: "maze-runner", title: "Daily Maze Runner", category: "Logic", thumbnail: "🌀", type: GameType.BUILTIN, isActive: true },
  { id: "g15", slug: "kakuro", title: "Daily Kakuro", category: "Math", thumbnail: "➕", type: GameType.BUILTIN, isActive: true },
  { id: "g16", slug: "lights-out", title: "Daily Lights Out", category: "Logic", thumbnail: "💡", type: GameType.BUILTIN, isActive: true },
  { id: "g17", slug: "tower-of-hanoi", title: "Daily Tower of Hanoi", category: "Logic", thumbnail: "🗼", type: GameType.BUILTIN, isActive: true },
  { id: "g18", slug: "mastermind", title: "Daily Mastermind", category: "Logic", thumbnail: "🎯", type: GameType.BUILTIN, isActive: true },
  { id: "g19", slug: "word-ladder", title: "Daily Word Ladder", category: "Word", thumbnail: "🪜", type: GameType.BUILTIN, isActive: true },
  { id: "g20", slug: "trivia-quiz", title: "Daily Trivia Quiz", category: "Classic", thumbnail: "🧠", type: GameType.BUILTIN, isActive: true },
];

// In-Memory state fallback store when Postgres is not reached
class InMemoryStore {
  users = new Map<string, any>();
  games = new Map<string, any>();
  puzzles = new Map<string, any>();
  results = new Map<string, any>();

  constructor() {
    // Seed initial games
    for (const g of INITIAL_GAMES) {
      this.games.set(g.slug, {
        ...g,
        createdAt: new Date(),
        puzzles: [],
        results: [],
      });
    }

    // Seed default admin and user
    const adminUser = {
      id: "admin-default-id",
      email: "admin@dailypuzzlehub.com",
      name: "Site Architect (Admin)",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Admin",
      role: Role.ADMIN,
      country: "NP",
      totalXp: 12500,
      currentStreak: 15,
      createdAt: new Date(),
    };
    const playerUser = {
      id: "player-default-id",
      email: "player@dailypuzzlehub.com",
      name: "Daily Puzzler",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Player",
      role: Role.USER,
      country: "NP",
      totalXp: 3400,
      currentStreak: 4,
      createdAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);
    this.users.set(adminUser.email, adminUser);
    this.users.set(playerUser.id, playerUser);
    this.users.set(playerUser.email, playerUser);
  }
}

const globalForMemory = global as unknown as { memoryStore: InMemoryStore | undefined };
export const memoryStore = globalForMemory.memoryStore || new InMemoryStore();
if (process.env.NODE_ENV !== "production") globalForMemory.memoryStore = memoryStore;

// Safe Database Access Layer with Auto-Fallback
export async function getDbClient() {
  try {
    // Quick test if Prisma Postgres is online
    await prisma.$queryRaw`SELECT 1`;
    return { isPrisma: true, client: prisma };
  } catch {
    return { isPrisma: false, client: null };
  }
}

// Universal Game Repository
export const GameRepository = {
  async getAllGames() {
    try {
      const db = await getDbClient();
      if (db.isPrisma && db.client) {
        return await db.client.game.findMany({
          orderBy: { createdAt: "asc" },
        });
      }
    } catch {}
    return Array.from(memoryStore.games.values());
  },

  async getGameBySlug(slug: string) {
    try {
      const db = await getDbClient();
      if (db.isPrisma && db.client) {
        return await db.client.game.findUnique({
          where: { slug },
          include: { puzzles: true },
        });
      }
    } catch {}
    return memoryStore.games.get(slug) || null;
  },

  async toggleGameActive(slug: string, isActive: boolean) {
    try {
      const db = await getDbClient();
      if (db.isPrisma && db.client) {
        return await db.client.game.update({
          where: { slug },
          data: { isActive },
        });
      }
    } catch {}
    const game = memoryStore.games.get(slug);
    if (game) {
      game.isActive = isActive;
      memoryStore.games.set(slug, game);
    }
    return game;
  },

  async createDynamicGame(data: {
    slug: string;
    title: string;
    category: string;
    thumbnail: string;
    type: GameType;
    configJson: any;
  }) {
    try {
      const db = await getDbClient();
      if (db.isPrisma && db.client) {
        return await db.client.game.create({
          data: {
            ...data,
            isActive: true,
          },
        });
      }
    } catch {}
    const newGame = {
      id: `game-${Date.now()}`,
      ...data,
      isActive: true,
      createdAt: new Date(),
    };
    memoryStore.games.set(data.slug, newGame);
    return newGame;
  },

  async saveResult(data: {
    userId: string;
    gameId: string;
    date: string;
    timeMs: number;
    score: number;
    isRevived?: boolean;
  }) {
    try {
      const db = await getDbClient();
      if (db.isPrisma && db.client) {
        return await db.client.gameResult.upsert({
          where: {
            userId_gameId_date: {
              userId: data.userId,
              gameId: data.gameId,
              date: data.date,
            },
          },
          update: {
            score: data.score,
            timeMs: data.timeMs,
            isRevived: !!data.isRevived,
          },
          create: {
            userId: data.userId,
            gameId: data.gameId,
            date: data.date,
            score: data.score,
            timeMs: data.timeMs,
            isRevived: !!data.isRevived,
          },
        });
      }
    } catch {}

    const key = `${data.userId}_${data.gameId}_${data.date}`;
    const result = {
      id: `res-${Date.now()}`,
      ...data,
      isRevived: !!data.isRevived,
    };
    memoryStore.results.set(key, result);

    // Update user stats in memory
    const user = memoryStore.users.get(data.userId);
    if (user) {
      user.totalXp += data.score;
      user.currentStreak += 1;
    }
    return result;
  },

  async getUser(idOrEmail: string) {
    try {
      const db = await getDbClient();
      if (db.isPrisma && db.client) {
        const byId = await db.client.user.findUnique({ where: { id: idOrEmail } });
        if (byId) return byId;
        return await db.client.user.findUnique({ where: { email: idOrEmail } });
      }
    } catch {}
    return memoryStore.users.get(idOrEmail) || null;
  }
};
