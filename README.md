# DailyPuzzleHub 🧩

DailyPuzzleHub is a suite of **13 free daily word, logic, and memory micro-games** playable directly in the browser. Every player worldwide receives the exact same daily puzzles seeded deterministically by date (UTC midnight reset).

---

## 🎮 Included Games

1. **Word Guess (Wordle)** – Guess the secret 5-letter word in 6 attempts with color-coded feedback.
2. **Daily Sudoku** – Classic 9x9 number placement puzzle with row, column, and box constraints.
3. **Minesweeper** – Uncover grid tiles without triggering mines; use number clues to flag hazards.
4. **Connections** – Group 16 words into 4 themed categories of 4.
5. **Mini Crossword** – 5x5 daily crossword puzzle with across and down clues.
6. **Nonogram (Picross)** – Uncover pixel art using column and row numerical clues.
7. **2048** – Slide and merge matching numbered tiles to reach 2048.
8. **Word Search** – Find hidden themed words in an 8x8 letter grid.
9. **Anagrams / Word Scramble** – Unscramble letters to find target words before time runs out.
10. **Memory Match** – Flip and pair card symbols within minimum moves.
11. **Sliding Puzzle** – Slide 15 tiles into numerical order on a 4x4 grid.
12. **Simon Sequence** – Watch and repeat an escalating sequence of colored tones.
13. **Cryptogram** – Decode an encrypted famous quotation using letter-substitution ciphers.

---

## ✨ Features

- 🌍 **Deterministic Daily Seeds**: Same daily challenge for every player globally, resetting at midnight UTC.
- 💾 **Local Progress & Streaks**: Auto-saves game progress, current streaks, max streaks, and win stats in `localStorage`.
- 🌓 **Dark / Light Theme Support**: Modern, responsive UI with smooth transitions and glassmorphism styling.
- 📱 **Fully Responsive**: Optimized for desktop, tablet, and mobile devices with touch support and virtual keyboards.
- 🚀 **Zero Dependencies**: Pure HTML5, CSS3, and Vanilla JavaScript with no frameworks or build steps required.

---

## 🚀 Getting Started

No build tools or installation needed! Simply open `index.html` in any modern web browser or serve it locally:

```bash
# Using Python
python -m http.server 8000

# Using Node (npx)
npx serve .
```

Then visit `http://localhost:8000` in your browser.

---

## 📂 Project Structure

```
├── index.html       # Main application markup and SEO metadata
├── styles.css       # Design system, glassmorphism theme, and responsive styles
├── app.js           # Core game engine, daily seed generator, state, and UI logic
├── data.js          # Puzzle data sets, crossword grids, clues, and cryptogram quotes
├── words.js         # Word banks for Word Guess, Connections, and Word Search
└── README.md        # Project documentation
```

---

## 📄 License

MIT License. Free to use and modify!
