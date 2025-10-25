
/* ==== شبیه‌ساز دیباگر حافظه و استک (Vanilla JS) ==== */

// عناصر DOM
const codeEditor = document.getElementById("codeEditor");
const codeMemory = document.getElementById("codeMemory");
const stackMemory = document.getElementById("stackMemory");
const commentBox = document.getElementById("comment");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const autoBtn = document.getElementById("autoBtn");
const resetBtn = document.getElementById("resetBtn");
const speedSlider = document.getElementById("speedSlider");
const speedVal = document.getElementById("speedVal");

// وضعیت سراسری
let codeLines = [];
let steps = [];
let currentStep = 0;
let autoTimer = null;
let memoryAddress = 0x4000;
let stackFrames = [];
let animationSpeed = 1500;

// به‌روزرسانی نمایش سرعت
speedSlider.addEventListener("input", e => {
  animationSpeed = parseInt(e.target.value);
  speedVal.textContent = (animationSpeed / 1000).toFixed(1) + "s";
});

/* === بخش ۱: تولید Code Memory === */
function loadCodeIntoMemory() {
  codeMemory.innerHTML = "";
  steps = [];
  currentStep = 0;
  memoryAddress = 0x4000;

  const userCode = codeEditor.value.trim().split("\n");
  codeLines = userCode.map(line => line.trimEnd());

  codeLines.forEach((line, i) => {
    const lineDiv = document.createElement("div");
    lineDiv.className = "code-line";
    const addr = "0x" + memoryAddress.toString(16).toUpperCase().padStart(4, "0");
    lineDiv.innerHTML = `<span class="code-addr">${addr}</span><span class="code-text">${line}</span>`;
    codeMemory.appendChild(lineDiv);

    // افزایش آدرس (فرضی هر دستور = 4 بایت)
    memoryAddress += 4;

    // گام‌های شبیه‌سازی
    steps.push({ addr, line, index: i });
  });
}

/* === بخش ۲: Highlight خط فعلی === */
function highlightCurrentLine() {
  const lines = codeMemory.querySelectorAll(".code-line");
  lines.forEach(l => l.classList.remove("highlight"));
  if (steps[currentStep]) {
    const idx = steps[currentStep].index;
    lines[idx]?.classList.add("highlight");
    lines[idx]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

/* === بخش ۳: شبیه‌سازی ساده‌ی اجرای تابع‌ها === */
function parseLine(line) {
  line = line.trim();

  // شناسایی شروع تابع
  const funcMatch = line.match(/int\s+(\w+)\s*\((.*?)\)\s*{/);
  if (funcMatch) {
    const funcName = funcMatch[1];
    const params = funcMatch[2]
      .split(",")
      .map(p => p.trim())
      .filter(p => p)
      .map(p => p.split(" ").pop());
    pushFrame(funcName, params);
    commentBox.innerHTML = `🔸 تابع <b>${funcName}()</b> وارد استک شد.`;
    return;
  }

  // شناسایی پایان تابع
  if (line === "}" || line.startsWith("return 0")) {
    popFrame();
    commentBox.innerHTML = `🔹 خروج از تابع و آزادسازی فریم استک.`;
    return;
  }

  // فراخوانی تابع
  const callMatch = line.match(/(\w+)\s*=\s*(\w+)\s*\((.*?)\);/);
  if (callMatch) {
    const func = callMatch[2];
    const args = callMatch[3].split(",").map(a => a.trim());
    pushFrame(func, args);
    commentBox.innerHTML = `📞 فراخوانی تابع <b>${func}()</b> با آرگومان‌ها ${args.join(", ")}.`;
    return;
  }

  // تعریف متغیر
  const varMatch = line.match(/int\s+(.+);/);
  if (varMatch) {
    const vars = varMatch[1].split(",").map(v => v.trim());
    vars.forEach(v => {
      const [name, val] = v.split("=").map(x => x.trim());
      addLocal(name, val || "0");
    });
    commentBox.innerHTML = `🧮 تعریف متغیرها در فریم جاری: ${vars.join(", ")}.`;
    return;
  }

  // return statement
  if (line.startsWith("return")) {
    const val = line.replace("return", "").replace(";", "").trim();
    commentBox.innerHTML = `🔙 بازگرداندن مقدار <b>${val}</b>.`;
    popFrame();
    return;
  }
}

/* === بخش ۴: مدیریت فریم‌های استک === */
function pushFrame(name, params = []) {
  const frame = {
    name,
    params,
    locals: [],
    addr: "0x" + (0x8000 + stackFrames.length * 0x10).toString(16).toUpperCase(),
  };
  stackFrames.push(frame);
  renderStack();
}
function popFrame() {
  stackFrames.pop();
  renderStack();
}
function addLocal(name, value) {
  if (stackFrames.length === 0) return;
  const f = stackFrames[stackFrames.length - 1];
  f.locals.push({ name, value });
  renderStack();
}

/* === بخش ۵: نمایش استک === */
function renderStack() {
  stackMemory.innerHTML = "";
  [...stackFrames].reverse().forEach(f => {
    const div = document.createElement("div");
    div.className = "stack-frame";
    div.innerHTML = `<div class="stack-title">${f.name}() <span style="color:#777;">[${f.addr}]</span></div>`;

    f.params.forEach(p => {
      div.innerHTML += `<div class="stack-item param"><span>${p}</span><span>?</span></div>`;
    });
    f.locals.forEach(l => {
      div.innerHTML += `<div class="stack-item local"><span>${l.name}</span><span>${l.value}</span></div>`;
    });

    div.innerHTML += `<div class="stack-item return"><span>Return Addr</span><span>${"0x" + (Math.floor(Math.random()*256)+64).toString(16).toUpperCase()}</span></div>`;
    stackMemory.appendChild(div);
  });
}

/* === بخش ۶: کنترل گام‌ها === */
function executeStep(direction) {
  if (direction > 0 && currentStep < steps.length) {
    parseLine(steps[currentStep].line);
    currentStep++;
  } else if (direction < 0 && currentStep > 0) {
    currentStep--;
    loadCodeIntoMemory();
    stackFrames = [];
    for (let i = 0; i < currentStep; i++) parseLine(steps[i].line);
  }
  highlightCurrentLine();
  updateButtons();
}

function updateButtons() {
  prevBtn.disabled = currentStep === 0;
  nextBtn.disabled = currentStep >= steps.length;
}

/* === بخش ۷: اجرای خودکار === */
function autoPlay() {
  if (autoTimer) {
    clearInterval(autoTimer);
    autoTimer = null;
    autoBtn.textContent = "اجرا خودکار ▶";
    return;
  }
  autoBtn.textContent = "⏹ توقف";
  autoTimer = setInterval(() => {
    if (currentStep >= steps.length) {
      clearInterval(autoTimer);
      autoTimer = null;
      autoBtn.textContent = "اجرا خودکار ▶";
      return;
    }
    executeStep(1);
  }, animationSpeed);
}

/* === بخش ۸: بازنشانی === */
function resetSimulation() {
  if (autoTimer) clearInterval(autoTimer);
  autoTimer = null;
  autoBtn.textContent = "اجرا خودکار ▶";
  stackFrames = [];
  currentStep = 0;
  loadCodeIntoMemory();
  renderStack();
  highlightCurrentLine();
  commentBox.innerHTML = "برای شروع روی «بعدی» کلیک کنید.";
  updateButtons();
}

/* === راه‌اندازی === */
loadCodeIntoMemory();
highlightCurrentLine();
updateButtons();

// رویدادها
nextBtn.addEventListener("click", () => executeStep(1));
prevBtn.addEventListener("click", () => executeStep(-1));
autoBtn.addEventListener("click", autoPlay);
resetBtn.addEventListener("click", resetSimulation);
codeEditor.addEventListener("change", resetSimulation);

