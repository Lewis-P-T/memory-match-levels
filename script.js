const SYMBOLS = [
  "🍎", "🍌", "🍇", "🍉", "🍒", "🍋", "🍑", "🥝",
  "🍓", "🍍", "🥥", "🥭", "🍐", "🍈", "🫐", "🥕",
  "🌽", "🍅", "🥦", "🍄", "🌶️", "🥑", "🍆", "🥔",
  "🧀", "🍞", "🥐", "🍩", "🍪", "🍰", "🍫", "🍿",
];

let size = 4;
let cards = [];
let flipped = [];
const matchedSet = new Set();
let locked = false;
let moves = 0;
let timerId = null;
let startTime = 0;

const $ = (id) => document.getElementById(id);

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Pick size*size/2 distinct symbols, duplicate them, shuffle.
function buildDeck(n) {
  const pairs = shuffle([...SYMBOLS]).slice(0, (n * n) / 2);
  return shuffle([...pairs, ...pairs]);
}

function formatTime(sec) {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
}

function showScreen(name) {
  $("menu-screen").hidden = name !== "menu";
  $("game-screen").hidden = name !== "game";
  $("win-screen").hidden = name !== "win";
}

// Best scores: { "4": { time, moves }, ... } — best time and fewest moves tracked independently.
const STORE_KEY = "memory-match-best";

function loadBest() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || {};
  } catch (e) {
    return {};
  }
}

// Returns { time: bool, moves: bool } — which records this result broke.
function recordScore(n, time, movesUsed) {
  const all = loadBest();
  const prev = all[n] || {};
  const broke = {
    time: prev.time === undefined || time < prev.time,
    moves: prev.moves === undefined || movesUsed < prev.moves,
  };
  all[n] = {
    time: broke.time ? time : prev.time,
    moves: broke.moves ? movesUsed : prev.moves,
  };
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(all));
  } catch (e) {}
  return broke;
}

function renderBest() {
  const all = loadBest();
  [4, 6, 8].forEach((n) => {
    const b = all[n];
    $(`best-${n}`).textContent = b ? `Best ${formatTime(b.time)} · ${b.moves} moves` : "No record yet";
  });
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

function startTimer() {
  startTime = Date.now();
  $("time").textContent = formatTime(0);
  timerId = setInterval(() => {
    $("time").textContent = formatTime(Math.floor((Date.now() - startTime) / 1000));
  }, 250);
}

function newGame(n) {
  stopTimer();
  size = n;
  cards = buildDeck(n);
  flipped = [];
  matchedSet.clear();
  locked = false;
  moves = 0;
  $("moves").textContent = 0;
  $("time").textContent = formatTime(0);
  $("board").className = `board size-${n}`;
  $("board").style.setProperty("--n", n);
  showScreen("game");
  buildBoard();
}

// Builds the card DOM once per game so CSS transitions can animate the flip
// (a full re-render every click, as before, would reset the transform each time).
function buildBoard() {
  const board = $("board");
  board.innerHTML = "";
  cards.forEach((symbol, i) => {
    const card = document.createElement("div");
    card.className = "card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.innerHTML = `<div class="card-inner"><div class="card-face card-front"></div><div class="card-face card-back">${symbol}</div></div>`;
    card.addEventListener("click", () => flipCard(i));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        flipCard(i);
      }
    });
    board.appendChild(card);
  });
  updateBoard();
}

function updateBoard() {
  const board = $("board");
  board.classList.toggle("locked", locked);
  [...board.children].forEach((card, i) => {
    card.classList.toggle("flipped", flipped.includes(i) || matchedSet.has(i));
    card.classList.toggle("matched", matchedSet.has(i));
  });
}

function flipCard(i) {
  if (locked || flipped.includes(i) || matchedSet.has(i)) return;
  if (timerId === null && moves === 0 && flipped.length === 0) startTimer();
  flipped.push(i);
  updateBoard();
  if (flipped.length < 2) return;

  moves++;
  $("moves").textContent = moves;
  locked = true;
  updateBoard();
  const [a, b] = flipped;
  if (cards[a] === cards[b]) {
    matchedSet.add(a);
    matchedSet.add(b);
    flipped = [];
    locked = false;
    updateBoard();
    if (matchedSet.size === cards.length) {
      stopTimer();
      const secs = Math.floor((Date.now() - startTime) / 1000);
      setTimeout(() => showWin(secs), 400);
    }
  } else {
    setTimeout(() => {
      flipped = [];
      locked = false;
      updateBoard();
    }, 800);
  }
}

function showWin(secs) {
  const broke = recordScore(size, secs, moves);
  $("win-time").textContent = formatTime(secs);
  $("win-moves").textContent = moves;
  const records = [];
  if (broke.time) records.push("best time");
  if (broke.moves) records.push("fewest moves");
  $("win-record").textContent = records.length ? `New record: ${records.join(" & ")}!` : "";
  showScreen("win");
}

function toMenu() {
  stopTimer();
  renderBest();
  showScreen("menu");
}

document.querySelectorAll("#menu-screen button").forEach((btn) =>
  btn.addEventListener("click", () => newGame(Number(btn.dataset.size)))
);
$("back-btn").addEventListener("click", toMenu);
$("win-menu-btn").addEventListener("click", toMenu);
$("again-btn").addEventListener("click", () => newGame(size));

toMenu();

if (typeof module !== "undefined") module.exports = { buildDeck, formatTime, SYMBOLS };
