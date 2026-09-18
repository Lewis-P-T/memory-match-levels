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
  $("board").style.gridTemplateColumns = `repeat(${n}, ${n > 6 ? 48 : 60}px)`;
  $("board").className = `board size-${n}`;
  showScreen("game");
  render();
}

function render() {
  const board = $("board");
  board.innerHTML = "";
  cards.forEach((symbol, i) => {
    const el = document.createElement("div");
    const isFlipped = flipped.includes(i) || matchedSet.has(i);
    el.className = "card";
    el.textContent = isFlipped ? symbol : "";
    if (flipped.includes(i)) el.classList.add("flipped");
    if (matchedSet.has(i)) el.classList.add("matched");
    el.addEventListener("click", () => flipCard(i));
    board.appendChild(el);
  });
}

function flipCard(i) {
  if (locked || flipped.includes(i) || matchedSet.has(i)) return;
  if (timerId === null && moves === 0 && flipped.length === 0) startTimer();
  flipped.push(i);
  render();
  if (flipped.length < 2) return;

  moves++;
  $("moves").textContent = moves;
  locked = true;
  const [a, b] = flipped;
  if (cards[a] === cards[b]) {
    matchedSet.add(a);
    matchedSet.add(b);
    flipped = [];
    locked = false;
    render();
    if (matchedSet.size === cards.length) {
      stopTimer();
      const t = formatTime(Math.floor((Date.now() - startTime) / 1000));
      setTimeout(() => alert(`You win! ${t} in ${moves} moves.`), 200);
    }
  } else {
    setTimeout(() => {
      flipped = [];
      locked = false;
      render();
    }, 800);
  }
}

document.querySelectorAll("#menu-screen button").forEach((btn) =>
  btn.addEventListener("click", () => newGame(Number(btn.dataset.size)))
);
$("back-btn").addEventListener("click", () => {
  stopTimer();
  showScreen("menu");
});

showScreen("menu");

if (typeof module !== "undefined") module.exports = { buildDeck, formatTime, SYMBOLS };
