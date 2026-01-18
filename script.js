// =====================
// CONFIG
// =====================
const TARGET_SUM = 2_000_000;
const PICK_COUNT = 5;
const GAME_TIME = 5;

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
const sceneEl = document.getElementById("scene");

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

  // Unselect
  if (idx !== -1) {
    selected.splice(idx, 1);
    el.classList.remove("selected");
    return;
  }

  // Max selection
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

  // Not enough selected
  if (selected.length !== PICK_COUNT) {
    resultEl.textContent = "Hic chưa chọn đủ món rồi";
    resultEl.style.color = "#e67e22";
    return;
  }

  let remaining = TARGET_SUM;

  // Process selected products
  for (const item of selected) {
    await fadeOutProduct(item.el);
    await animateSubtract(item.price, remaining);
    remaining -= item.price;
  }

  // Fade out remaining products
  await fadeOutRemainingProducts();

  // Final scene
  if (remaining === 0) {
    showScene(
      [
        "Chuẩn thần đồng tính toán rồi!!",
        "",
        "Muốn khớp ngân sách dài lâu.",
        "Để MoMo AI Expense Management",
        "theo dõi chi tiêu cùng bạn."
      ],
      "#a20262"
    );
  } else if (remaining > 0) {
    showScene(
      [
        "Tiền còn mà chưa chơi cho đã",
        "",
        "Chưa khớp ngân sách.",
        "Để MoMo AI Expense Management",
        "theo dõi chi tiêu cùng bạn."
      ],
      "#a20262"
    );
  } else {
    showScene(
      [
        "Ối lỡ tiêu quá tay rồi!!!",
        "",
        "Tiền chạy nhanh quá, mắt không kịp theo.",
        "Để MoMo AI Expense Management",
        "theo dõi chi tiêu cùng bạn."
      ],
      "#a20262"
    );
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

function fadeOutRemainingProducts() {
  const allProducts = document.querySelectorAll(".product");

  allProducts.forEach(p => {
    if (!p.classList.contains("fade-out")) {
      p.classList.add("fade-out-all");
    }
  });

  return new Promise(resolve => {
    setTimeout(() => {
      grid.style.visibility = "hidden";
      resolve();
    }, 600);
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
// SCENE
// =====================
function showScene(lines, color) {
  if (typeof lines === "string") {
    lines = [lines];
  }
  
  sceneEl.innerHTML = "";

  const textWrapper = document.createElement("div");
  textWrapper.style.textAlign = "center";
  textWrapper.style.color = color;
  textWrapper.style.fontSize = "24px";
  textWrapper.style.fontWeight = "600";
  textWrapper.style.lineHeight = "1.35";

  lines.forEach((line, i) => {
    const lineEl = document.createElement("div");
    lineEl.style.fontWeight = "800"; 
    lineEl.textContent = line || "\u00A0"; // keep empty line spacing
    lineEl.style.opacity = "0";
    lineEl.style.transform = "translateY(10px)";
    lineEl.style.transition = "opacity 0.6s ease, transform 0.6s ease";

    textWrapper.appendChild(lineEl);
  });

  const imgEl = document.createElement("img");
  imgEl.src = "images/qr.png";
  imgEl.alt = "QR";
  imgEl.style.opacity = "0";
  imgEl.style.transform = "translateY(10px)";
  imgEl.style.transition = "opacity 0.6s ease, transform 0.6s ease";
  imgEl.style.marginTop = "20px";
  imgEl.style.width = "60%";
  imgEl.style.maxWidth = "220px";

  sceneEl.appendChild(textWrapper);
  sceneEl.appendChild(imgEl);

  // Fade scene in
  requestAnimationFrame(() => {
    sceneEl.classList.add("show");
  });

  // Animate text lines one by one
  const lineEls = textWrapper.children;
  Array.from(lineEls).forEach((el, i) => {
    setTimeout(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, 200 + i * 120);
  });

  // Fade in QR after all text
  setTimeout(() => {
    imgEl.style.opacity = "1";
    imgEl.style.transform = "translateY(0)";
  }, 200 + lines.length * 120 + 300);
}

// =====================
// START
// =====================
init();
