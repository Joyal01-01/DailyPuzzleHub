# DailyPuzzleHub 🧩 Enterprise Gaming Platform

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-PostgreSQL-2D3748?logo=prisma)](https://www.prisma.io/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real--Time-010101?logo=socket.io)](https://socket.io/)
[![Google AdSense H5](https://img.shields.io/badge/AdSense%20H5-pub--5643499410858608-4285F4?logo=google)](https://adsense.google.com/)

**DailyPuzzleHub** is an enterprise-grade full-stack daily gaming platform featuring **20 built-in UTC date-seeded micro-games**, an **Admin CMS** for dynamic game creation and live game activation, **PostgreSQL (via Prisma ORM)**, **Redis-backed Leaderboards & Rate Limiting**, **Socket.io 1v1 Live Duels**, and **Google AdSense H5 Games SDK** monetization with Rewarded Video Ads.

---

## 🎮 The 20 Core Daily Games (UTC Date-Seeded PRNG)

All daily puzzles are generated deterministically using a Mulberry32 PRNG keyed to the UTC date string (`YYYY-MM-DD`). Every player worldwide receives the exact same daily puzzle that resets at midnight UTC (00:00 UTC).

| # | Game | Category | Mechanics |
|---|------|----------|-----------|
| 1 | **Daily Word Guess** | Word | 5-letter word puzzle with virtual keyboard & color feedback (Wordle) |
| 2 | **Daily Sudoku** | Logic | 9x9 grid with note mode, high WCAG contrast, and mistake counter |
| 3 | **Daily Minesweeper** | Logic | 9x9 grid with 10 seed-generated mines, flags & status faces |
| 4 | **Daily Connections** | Word | Group 16 words into 4 themed categories with "one away" hints |
| 5 | **Daily Mini Crossword** | Word | 5x5 daily puzzle with across and down clues & cursor navigation |
| 6 | **Daily Nonogram** | Logic | Picross grid puzzle revealing pixel art from row/column clues |
| 7 | **Daily 2048** | Math | Sliding tile puzzle with daily starting layout and score tracker |
| 8 | **Daily Word Search** | Word | 8x8 letter grid with 6 hidden daily words |
| 9 | **Daily Anagram Scramble**| Word | Unscramble a 7-letter target word with letter slot builder |
| 10 | **Daily Memory Match** | Memory | Flip grid cards to match 8 emoji pairs with move counter |
| 11 | **Daily Sliding Tile** | Logic | 3x3 sliding number grid (1-8) with guaranteed solvable shuffle |
| 12 | **Daily Sequence Memory**| Memory | Simon-style escalating visual pattern memory with sound tones |
| 13 | **Daily Cryptogram** | Word | Decipher famous quote using 1-to-1 letter substitution cipher |
| 14 | **Daily Maze Runner** | Logic | Navigate an 11x11 date-generated grid maze in minimal moves |
| 15 | **Daily Kakuro** | Math | Cross-sums math logic grid puzzle with diagonal clue targets |
| 16 | **Daily Lights Out** | Logic | Toggle 4x4 grid cells to turn off all active illuminated bulbs |
| 17 | **Daily Tower of Hanoi** | Logic | Move 4 stacked rings from Peg 1 to Peg 3 (minimum 15 moves) |
| 18 | **Daily Mastermind** | Logic | Decipher 4-color secret code using black and white feedback pegs |
| 19 | **Daily Word Ladder** | Word | Transform Word A to Word B by changing 1 letter per rung |
| 20 | **Daily Trivia Quiz** | Classic | 5 date-seeded general knowledge questions with explanations |

---

## ⚡ 1v1 Live Multiplayer Duels (`/duel`)

- **Real-Time Matchmaking:** Powered by **Socket.io** web sockets.
- **Head-to-Head Racing:** Live progress bars display opponent solves and word entries in real time.
- **Victory Fanfare & Rematch:** Dynamic confetti, sound synthesis, and rematch queue.

---

## 🛠️ Admin Panel & Dynamic Game Builder (`/admin`)

- **Role-Based Access Control (RBAC):** Middleware checks `user.role === 'ADMIN'`.
- **Live Game Management CMS:** Instantly enable or disable any of the 20 core games dynamically without redeploying code.
- **User Retention & AdSense Metrics:**
  - Daily Active Users (DAU), D1/D7/D30 retention percentages, average play time.
  - Ad impressions, rewarded video views, streak revival rates, and daily revenue reports.
- **Dynamic Custom Game Creator:**
  1. **Custom Trivia/Quiz Builder:** Input daily questions, options, correct answers, and publish live.
  2. **Custom Word Challenge:** Set secret target word, daily clue hint, and max guess attempts.
  3. **$N \times M$ Grid Engine:** JSON-driven matrix loader supporting custom initial states, goal configurations, and toggle/match rules.

---

## 💰 Monetization: Google AdSense H5 Games SDK

- **Publisher ID:** `pub-5643499410858608`
- **Rewarded Video Ads:** Allows players who fail Wordle, Sudoku, Minesweeper, or 2048 to watch a 5-second video ad to revive their session, get a second chance, and protect their daily streak (`isRevived: true`).
- **Interstitial Ad Breaks:** Automatic `adBreak({ type: 'next' })` triggered on puzzle completion.
- **Banner Ad Slots:** Responsive standard ad units on the homepage and game pages.

---

## 🗄️ Database Architecture (Prisma ORM)

```prisma
enum Role {
  USER
  ADMIN
}

enum GameType {
  BUILTIN
  DYNAMIC_TRIVIA
  DYNAMIC_WORD
  DYNAMIC_GRID
}

model User {
  id            String         @id @default(uuid())
  email         String         @unique
  name          String
  avatar        String?
  role          Role           @default(USER)
  country       String         @default("NP")
  totalXp       Int            @default(0)
  currentStreak Int            @default(0)
  createdAt     DateTime       @default(now())
  gameResults   GameResult[]
}

model Game {
  id          String       @id @default(uuid())
  slug        String       @unique
  title       String
  category    String
  thumbnail   String
  type        GameType     @default(BUILTIN)
  isActive    Boolean      @default(true)
  configJson  Json?
  createdAt   DateTime     @default(now())
  puzzles     Puzzle[]
  results     GameResult[]
}

model Puzzle {
  id          String   @id @default(uuid())
  gameId      String
  date        String
  contentJson Json
  game        Game     @relation(fields: [gameId], references: [id])

  @@unique([gameId, date])
}

model GameResult {
  id         String   @id @default(uuid())
  userId     String
  gameId     String
  date       String
  timeMs     Int
  score      Int
  isRevived  Boolean  @default(false)
  user       User     @relation(fields: [userId], references: [id])
  game       Game     @relation(fields: [gameId], references: [id])

  @@unique([userId, gameId, date])
}
```

*Note: The platform features an automated transparent in-memory and file store fallback, allowing instant zero-dependency local execution when PostgreSQL or Redis are not running.*

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate Prisma Client
```bash
npx prisma generate
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dailypuzzlehub?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="dailypuzzlehub-enterprise-secret-key-2026"
NEXT_PUBLIC_ADSENSE_CLIENT_ID="ca-pub-5643499410858608"
NEXT_PUBLIC_APP_URL="http://localhost:3005"
PORT=3005
```

### 4. Run Development Server (Next.js + Socket.io)
```bash
npm run dev
```

Visit **http://localhost:3005** to play!

---

## 📄 License
MIT License. Created for DailyPuzzleHub.
