const STORAGE_KEY = "saturday-plan-v1";

const defaultTasks = [
  { id: 1, title: "自転車を借りる", icon: "🚲", done: false, advice: "2人乗りがおすすめ" },
  { id: 2, title: "キッチンカー巡り", icon: "🍔", done: false, advice: "何が食べたい気分？？" },
  { id: 3, title: "ネモフィラ（みはらしの丘）", icon: "🌸", done: false, advice: "" },
  { id: 4, title: "記念の森レストハウス", icon: "🏡", done: false, advice: "干し芋タルトおすすめ" },
  { id: 5, title: "チューリップ（たまごの森）", icon: "🌷", done: false, advice: "何色が好き？" },
  { id: 6, title: "サッカー", icon: "⚽", done: false, advice: "" },
  { id: 7, title: "バトミントン", icon: "🏸", done: false, advice: "" },
  { id: 8, title: "浜辺ゾーン", icon: "🌊", done: false, advice: "海でリラックスできるよ" }
];

const taskContainer = document.getElementById("taskContainer");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const statusMessage = document.getElementById("statusMessage");
const nextTask = document.getElementById("nextTask");
const remainingText = document.getElementById("remainingText");
const lateBadge = document.getElementById("lateBadge");
const todayLabel = document.getElementById("todayLabel");
const markAllDoneBtn = document.getElementById("markAllDoneBtn");
const resetBtn = document.getElementById("resetBtn");
const randomTask = document.getElementById("randomTask");
const randomBtn = document.getElementById("randomBtn");

function loadTasks() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return structuredClone(defaultTasks);
  }

  try {
    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return structuredClone(defaultTasks);
    }

    return parsed;
  } catch {
    return structuredClone(defaultTasks);
  }
}

let tasks = loadTasks();

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function getTodayLabel() {
  const today = new Date();

  const formatter = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long"
  });

  return formatter.format(today);
}

function getProgressPercent() {
  const doneCount = tasks.filter((task) => task.done).length;
  return Math.round((doneCount / tasks.length) * 100);
}

function getStatusText(progress) {
  if (progress === 100) {
    return {
      text: "完璧。最高の土曜日だね！",
      color: "var(--good)",
      bg: "#dcfce7"
    };
  }

  if (progress >= 70) {
    return {
      text: "いい感じ！この調子で楽しもう！",
      color: "var(--good)",
      bg: "#ecfdf3"
    };
  }

  if (progress >= 40) {
    return {
      text: "楽しくなってきた？？",
      color: "var(--warn)",
      bg: "#fff7ed"
    };
  }

  if (progress > 0) {
    return {
      text: "まだ始まったばかり。楽しもう。",
      color: "var(--bad)",
      bg: "#fef2f2"
    };
  }

  return {
    text: "まだ始まってない。今日はここから。",
    color: "var(--accent)",
    bg: "#eff6ff"
  };
}

function getLateJudge() {
  const remaining = tasks.filter((task) => !task.done).length;

  if (remaining === 0) {
    return "判定：終了。えらい";
  }

  if (remaining <= 2) {
    return "判定：順調";
  }

  if (remaining <= 4) {
    return "判定：普通";
  }

  return "判定：詰み注意";
}

function getNextTaskText() {
  const next = tasks.find((task) => !task.done);

  if (!next) {
    return "次にやること：何が食べたい？？";
  }

  return `次にやること：${next.title}`;
}

function renderTasks() {
  taskContainer.innerHTML = "";

  tasks.forEach((task) => {
    const row = document.createElement("div");
    row.className = `task ${task.done ? "done" : ""}`;
    const adviceText = task.advice || "";

    row.innerHTML = `
      <div class="candidate">
        ${task.done ? "完了" : "候補"}
      </div>
      <div class="task-main">
        <div class="task-title">
          <span class="icon">${task.icon || "📍"}</span>
          <span>${task.title}</span>
        </div>
        ${adviceText ? `<div class="task-advice">${adviceText}</div>` : ""}
        <div class="task-meta">${task.done ? "完了済み" : "未完了"}</div>
      </div>
      <button class="check-btn" data-id="${task.id}">
        ${task.done ? "✓" : "○"}
      </button>
    `;

    taskContainer.appendChild(row);
  });
}

function updateSummary() {
  const progress = getProgressPercent();
  const remaining = tasks.filter((task) => !task.done).length;
  const status = getStatusText(progress);
  const color = getProgressColor(progress);

  progressBar.style.width = `${progress}%`;
  progressBar.style.background = color.bar;

  progressText.textContent = `${progress}%`;
  statusMessage.textContent = status.text;

  statusMessage.style.color = status.color;
  statusMessage.style.background = color.bg;

  nextTask.textContent = getNextTaskText();
  remainingText.textContent = `残り予定：${remaining}件`;
  lateBadge.textContent = getLateJudge();
}

function render() {
  todayLabel.textContent = getTodayLabel();
  renderTasks();
  updateSummary();
  pickRandomTask();
  saveTasks();
}

function pickRandomTask() {
  const undoneTasks = tasks.filter((task) => !task.done);

  if (undoneTasks.length === 0) {
    randomTask.textContent = "全部達成した！最高。";
    return;
  }

  const randomIndex = Math.floor(Math.random() * undoneTasks.length);
  const selectedTask = undoneTasks[randomIndex];

  randomTask.textContent = `${selectedTask.icon || "📍"} ${selectedTask.title}`;
}

randomBtn.addEventListener("click", () => {
  pickRandomTask();
});

taskContainer.addEventListener("click", (event) => {
  const button = event.target.closest(".check-btn");

  if (!button) {
    return;
  }

  const id = Number(button.dataset.id);

  tasks = tasks.map((task) => {
    if (task.id === id) {
      return { ...task, done: !task.done };
    }

    return task;
  });

  render();
});

function getProgressColor(progress) {
  if (progress >= 70) {
    return {
      bar: "#22c55e",   // 緑
      bg: "#dcfce7"
    };
  }

  if (progress >= 40) {
    return {
      bar: "#f59e0b",   // オレンジ
      bg: "#fff7ed"
    };
  }

  return {
    bar: "#ef4444",     // 赤
    bg: "#fef2f2"
  };
}

markAllDoneBtn.addEventListener("click", () => {
  tasks = tasks.map((task) => ({ ...task, done: true }));
  render();
});

resetBtn.addEventListener("click", () => {
  tasks = structuredClone(defaultTasks);
  localStorage.removeItem(STORAGE_KEY);
  render();
});

render();