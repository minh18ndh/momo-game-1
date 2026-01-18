const products = [
  { price: 10000, img: "images/1.png" },
  { price: 15000, img: "images/1.png" },
  { price: 20000, img: "images/1.png" },
  { price: 25000, img: "images/1.png" },
  { price: 30000, img: "images/1.png" },
  { price: 35000, img: "images/1.png" },
  { price: 40000, img: "images/1.png" },
  { price: 45000, img: "images/1.png" },
  { price: 50000, img: "images/1.png" },
  { price: 55000, img: "images/1.png" },
  { price: 60000, img: "images/1.png" },
  { price: 65000, img: "images/1.png" }
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
products.forEach((p) => {
  const div = document.createElement("div");
  div.className = "product";

  div.innerHTML = `
    <img src="${p.img}" alt="product">
    <div class="price">${p.price.toLocaleString()} VND</div>
  `;

  div.onclick = () => toggleProduct(div, p.price);
  grid.appendChild(div);
});

// Generate target sum
function generateTarget() {
  const temp = [...products];
  targetSum = 0;

  for (let i = 0; i < 5; i++) {
    const r = Math.floor(Math.random() * temp.length);
    targetSum += temp[r].price;
    temp.splice(r, 1);
  }

  targetEl.textContent = `Target: ${targetSum.toLocaleString()} VND`;
}

// Select / unselect
function toggleProduct(el, price) {
  if (gameOver) return;

  const idx = selected.findIndex(p => p.el === el);

  if (idx !== -1) {
    selected.splice(idx, 1);
    el.classList.remove("selected");
    return;
  }

  if (selected.length >= 5) return;

  selected.push({ el, price });
  el.classList.add("selected");
}

// Timer
const timer = setInterval(() => {
  if (gameOver) return;

  timeLeft--;
  timerEl.textContent = timeLeft;

  if (timeLeft <= 0) endGame();
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
