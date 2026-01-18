// =====================
// CONFIG
// =====================
const TARGET_SUM = 2_000_000;
const PICK_COUNT = 5;
const GAME_TIME = 10;

// =====================
// DATA
// =====================
const products = [
  { price: 150_000, img: "images/pomelo.png" },
  { price: 800_000, img: "images/converse.png" },
  { price: 1_500_000, img: "images/watch.png" },
  { price: 350_000, img: "images/peach_blossom.png" },
  { price: 500_000, img: "images/ao_dai.png" },
  { price: 50_000, img: "images/non_la.png" },
  { price: 150_000, img: "images/banh_chung.png" },
  { price: 100_000, img: "images/bubble_tea.png" },
  { price: 1_200_000, img: "images/camera.png" },
  { price: 600_000, img: "images/lipstick.png" },
  { price: 650_000, img: "images/perfume.png" },
  { price: 200_000, img: "images/lucky_money.png" }
];

// =====================
// DOM
// =====================
const grid = document.getElementById("grid");
const targetEl = document.getElementById("target");
const timerEl = document.getElementById("timer");
const sceneEl = document.getElementById("scene");

const ring = document.querySelector("#timer-ring circle");

const fireworksEl = document.getElementById("fireworks");
let fireworksAnim = null;

// =====================
// TIMER RING SETUP
// =====================
const RADIUS = 20;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

ring.style.strokeDasharray = CIRCUMFERENCE;
ring.style.strokeDashoffset = CIRCUMFERENCE;

// =====================
// STATE
// =====================
let selected = [];
let timeLeft = GAME_TIME;
let gameOver = false;

// =====================
// UTILS
// =====================
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// =====================
// INIT
// =====================
function init() {
  targetEl.textContent = `${TARGET_SUM.toLocaleString()}đ`;
  timerEl.textContent = GAME_TIME;

  shuffle(products);
  renderProducts();
  startTimer();
}

// =====================
// RENDERING
// =====================
function renderProducts() {
  grid.innerHTML = "";

  products.forEach(p => {
    const card = document.createElement("div");
    card.className = "product";

    card.innerHTML = `
      <img src="${p.img}" alt="">
      <div class="price">${p.price.toLocaleString()}đ</div>
    `;

    card.addEventListener("pointerdown", () => {
      toggleProduct(card, p.price);
    });

    grid.appendChild(card);
  });
}

// =====================
// SELECTION
// =====================
function toggleProduct(el, price) {
  if (gameOver) return;

  const idx = selected.findIndex(i => i.el === el);

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
  const start = Date.now();
  const duration = GAME_TIME * 1000;
  let pulseStarted = false;

  const tick = setInterval(() => {
    if (gameOver) return;

    const elapsed = Date.now() - start;
    const progress = Math.min(elapsed / duration, 1);

    timeLeft = Math.max(0, GAME_TIME - Math.floor(elapsed / 1000));
    timerEl.textContent = timeLeft;

    // start pulsing at 5s
    if (timeLeft <= 5 && !pulseStarted) {
      targetEl.classList.add("pulsing");
      pulseStarted = true;
    }

    ring.style.strokeDashoffset =
      CIRCUMFERENCE * (1 - progress);

    if (progress >= 1) {
      clearInterval(tick);
      endGame();
    }
  }, 50);
}

// =====================
// FIREWORKS
// =====================
function playFireworks() {
  if (!fireworksAnim) {
    fireworksAnim = lottie.loadAnimation({
      container: fireworksEl,
      renderer: "svg",
      loop: false,
      autoplay: false,
      path: "images/fireworks.json"
    });
  }

  fireworksEl.classList.add("show");
  fireworksAnim.play();
}

// =====================
// END GAME
// =====================
async function endGame() {
  gameOver = true;
  targetEl.classList.remove("pulsing");
  grid.style.pointerEvents = "none";

  if (selected.length !== PICK_COUNT) {
    await fadeOutRemainingProducts();
    showScene(
      [
        "Hic chưa chọn đủ món rồi,",
        "reload chơi lại ik",
        "",
        "Để MoMo AI Expense Management",
        "theo dõi chi tiêu cùng bạn."
      ],
      "#a20262"
    );
    return;
  }

  let remaining = TARGET_SUM;

  for (const item of selected) {
    await fadeOutProduct(item.el);
    await animateSubtract(item.price, remaining);
    remaining -= item.price;
  }

  await fadeOutRemainingProducts();

  if (remaining === 0) {
    playFireworks();
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
        "Tiền chạy nhanh quá,",
        "mắt không kịp theo.",
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
  document.querySelectorAll(".product").forEach(p => {
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

function animateSubtract(amount, start) {
  return new Promise(resolve => {
    let current = start;
    const end = start - amount;
    const step = Math.max(1, Math.floor(amount / 40));

    function tick() {
      current -= step;
      if (current <= end) current = end;

      targetEl.textContent = `${current.toLocaleString()}đ`;

      current === end ? resolve() : requestAnimationFrame(tick);
    }

    tick();
  });
}

// =====================
// SCENE
// =====================
function showScene(lines, color) {
  sceneEl.innerHTML = "";

  const text = document.createElement("div");
  Object.assign(text.style, {
    textAlign: "center",
    color,
    fontSize: "22px",
    fontWeight: "800",
    lineHeight: "1.35"
  });

  lines.forEach(line => {
    const el = document.createElement("div");
    el.textContent = line || "\u00A0";
    el.style.opacity = "0";
    el.style.transform = "translateY(10px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    text.appendChild(el);
  });

  const qr = document.createElement("img");
  Object.assign(qr, {
    src: "images/qr.png",
    alt: "QR"
  });
  Object.assign(qr.style, {
    opacity: "0",
    transform: "translateY(10px)",
    transition: "opacity 0.6s ease, transform 0.6s ease",
    marginTop: "20px",
    width: "60%",
    maxWidth: "220px"
  });

  sceneEl.append(text, qr);
  requestAnimationFrame(() => sceneEl.classList.add("show"));

  [...text.children].forEach((el, i) => {
    setTimeout(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, 200 + i * 120);
  });

  setTimeout(() => {
    qr.style.opacity = "1";
    qr.style.transform = "translateY(0)";
  }, 200 + lines.length * 120 + 300);
}

// =====================
// START
// =====================
init();
