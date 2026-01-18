const products = [
  10000, 15000, 20000,
  25000, 30000, 35000,
  40000, 45000, 50000,
  55000, 60000, 65000
];

const grid = document.getElementById("grid");
const targetEl = document.getElementById("target");
const timerEl = document.getElementById("timer");
const resultEl = document.getElementById("result");

let selected = [];
let targetSum = 0;
let timeLeft = 10;
let gameOver = false;

// Create products
products.forEach((price, index) => {
  const div = document.createElement("div");
  div.className = "product";
  div.innerHTML = `
    <div>Product ${index + 1}</div>
    <div class="price">${price.toLocaleString()} VND</div>
  `;

  div.onclick = () => toggleProduct(div, price);
  grid.appendChild(div);
});

// Generate target
function generateTarget() {
  const temp = [...products];
  targetSum = 0;

  for (let i = 0; i < 3; i++) {
    const r = Math.floor(Math.random() * temp.length);
    targetSum += temp[r];
    temp.splice(r, 1);
  }

  targetEl.textContent = `Target: ${targetSum.toLocaleString()} VND`;
}

// Toggle selection
function toggleProduct(el, price) {
  if (gameOver) return;

  const index = selected.findIndex(p => p.el === el);

  if (index !== -1) {
    selected.splice(index, 1);
    el.classList.remove("selected");
    return;
  }

  if (selected.length >= 3) return;

  selected.push({ el, price });
  el.classList.add("selected");
}

// Timer
const timer = setInterval(() => {
  if (gameOver) return;

  timeLeft--;
  timerEl.textContent = timeLeft;

  if (timeLeft <= 0) {
    endGame();
  }
}, 1000);

// End game
function endGame() {
  gameOver = true;
  clearInterval(timer);

  const sum = selected.reduce((a, b) => a + b.price, 0);

  if (selected.length === 3 && sum === targetSum) {
    resultEl.textContent = "YOU WIN";
    resultEl.style.color = "#2ecc71";
  } else {
    resultEl.textContent = "YOU LOSE";
    resultEl.style.color = "#e74c3c";
  }
}

generateTarget();
