// =====================
// CONFIG
// =====================
const TARGET_SUM = 2_000_000;
const PICK_COUNT = 5;
const GAME_TIME = 10;

const products = [
  { price: 150000, img: "images/pomelo.png" },
  { price: 800000, img: "images/converse.png" },
  { price: 1500000, img: "images/watch.png" },
  { price: 350000, img: "images/peach_blossom.png" },
  { price: 500000, img: "images/ao_dai.png" },
  { price: 50000, img: "images/non_la.png" },
  { price: 150000, img: "images/banh_chung.png" },
  { price: 100000, img: "images/bubble_tea.png" },
  { price: 1200000, img: "images/camera.png" },
  { price: 600000, img: "images/lipstick.png" },
  { price: 650000, img: "images/perfume.png" },
  { price: 200000, img: "images/lucky_money.png" }
];

// =====================
// DOM
// =====================
const grid = document.getElementById("grid");
const targetEl = document.getElementById("target");
const timerEl = document.getElementById("timer");
const resultEl = document.getElementById("result");

// =====================
// STATE
// =====================
let selected = [];
let timeLeft = GAME_TIME;
let gameOver = false;

// =====================
// UTILS
// =====================
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// =====================
// INIT
// =====================
function init() {
  targetEl.textContent = `${TARGET_SUM.toLocaleString()}đ`;
  timerEl.textContent = timeLeft;

  shuffle(products);
  createProducts();
  startTimer();
}

// =====================
// UI CREATION
// =====================
function createProducts() {
  grid.innerHTML = "";

  products.forEach(p => {
    const div = document.createElement("div");
    div.className = "product";

    div.innerHTML = `
      <img src="${p.img}" alt="product">
      <div class="price">${p.price.toLocaleString()}đ</div>
    `;

    div.onclick = () => toggleProduct(div, p.price);
    grid.appendChild(div);
  });
}

// =====================
// GAME LOGIC
// =====================
function toggleProduct(el, price) {
  if (gameOver) return;

  const idx = selected.findIndex(p => p.el === el);

  if (idx !== -1) {
    selected.splice(idx, 1);
    el.classList.remove("selected");
    return;
  }

  if (selected.length >= PICK_COUNT) return;

  selected.push({ el, price });
  el.classList.add("selected");
}

// =====================
// TIMER
// =====================
function startTimer() {
  const timer = setInterval(() => {
    if (gameOver) return;

    timeLeft--;
    timerEl.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timer);
      endGame();
    }
  }, 1000);
}

// =====================
// END GAME
// =====================
async function endGame() {
  gameOver = true;
  grid.style.pointerEvents = "none";

  // Not enough items
  if (selected.length !== PICK_COUNT) {
    resultEl.textContent = "Hic chưa chọn đủ món rồi";
    resultEl.style.color = "#e67e22";
    return;
  }

  let remaining = TARGET_SUM;

  for (const item of selected) {
    await fadeOutProduct(item.el);
    await animateSubtract(item.price, remaining);
    remaining -= item.price;
  }

  if (remaining === 0) {
    resultEl.textContent = "Thần đồng à";
    resultEl.style.color = "#2ecc71";
  } else if (remaining > 0) {
    resultEl.textContent = "Tiền còn";
    resultEl.style.color = "#f39c12";
  } else {
    resultEl.textContent = "Ối";
    resultEl.style.color = "#e74c3c";
  }
}

// =====================
// ANIMATIONS
// =====================
function fadeOutProduct(el) {
  return new Promise(resolve => {
    el.classList.add("fade-out");
    setTimeout(() => {
      el.style.visibility = "hidden";
      resolve();
    }, 400);
  });
}

function animateSubtract(amount, startValue) {
  return new Promise(resolve => {
    let current = startValue;
    const end = startValue - amount;
    const step = Math.max(1, Math.floor(amount / 40));

    function tick() {
      current -= step;
      if (current <= end) current = end;

      targetEl.textContent = `${current.toLocaleString()}đ`;

      if (current === end) {
        resolve();
      } else {
        requestAnimationFrame(tick);
      }
    }

    tick();
  });
}

// =====================
// START
// =====================
init();
