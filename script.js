const SYMBOLS = ["🍎", "🍌", "🍇", "🍉", "🍒", "🍋", "🍑", "🥝"];

let cards = [];
let flipped = [];
let matchedCount = 0;
let locked = false;

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function newGame() {
  cards = shuffle([...SYMBOLS, ...SYMBOLS]);
  flipped = [];
  matchedCount = 0;
  locked = false;
  matchedSet.clear();
  render();
}

const matchedSet = new Set();

function render() {
  const board = document.getElementById("board");
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
  flipped.push(i);
  render();
  if (flipped.length === 2) {
    locked = true;
    const [a, b] = flipped;
    if (cards[a] === cards[b]) {
      matchedSet.add(a);
      matchedSet.add(b);
      matchedCount++;
      flipped = [];
      locked = false;
      render();
      if (matchedCount === SYMBOLS.length) {
        setTimeout(() => alert("You win!"), 200);
      }
    } else {
      setTimeout(() => {
        flipped = [];
        locked = false;
        render();
      }, 800);
    }
  }
}

newGame();
