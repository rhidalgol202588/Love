/* ===========================================================
   Navegación entre pantallas
=========================================================== */
const screens = document.querySelectorAll(".screen");
const progressFill = document.getElementById("progressFill");
const TOTAL_SCREENS = screens.length;

function goToScreen(n) {
  screens.forEach((s) => s.classList.remove("active"));
  const target = document.getElementById(`screen-${n}`);
  if (target) target.classList.add("active");
  if (progressFill) {
    progressFill.style.width = `${(n / TOTAL_SCREENS) * 100}%`;
  }
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
}

document.querySelectorAll("[data-next]").forEach((btn) => {
  btn.addEventListener("click", () => {
    goToScreen(btn.getAttribute("data-next"));
  });
});

/* ===========================================================
   Utilidad: calcular años · días · horas · minutos · segundos
   transcurridos desde una fecha fija hasta ahora.
=========================================================== */
function getElapsed(startDate) {
  const now = new Date();

  let years = now.getFullYear() - startDate.getFullYear();
  const anniversaryThisYear = new Date(startDate.getTime());
  anniversaryThisYear.setFullYear(startDate.getFullYear() + years);

  if (anniversaryThisYear > now) {
    years -= 1;
    anniversaryThisYear.setFullYear(startDate.getFullYear() + years);
  }

  let remainingMs = now - anniversaryThisYear;

  const days = Math.floor(remainingMs / 86400000);
  remainingMs -= days * 86400000;

  const hours = Math.floor(remainingMs / 3600000);
  remainingMs -= hours * 3600000;

  const minutes = Math.floor(remainingMs / 60000);
  remainingMs -= minutes * 60000;

  const seconds = Math.floor(remainingMs / 1000);

  return { years, days, hours, minutes, seconds };
}

function renderCounter(cardEl, elapsed) {
  const map = {
    years: elapsed.years,
    days: elapsed.days,
    hours: elapsed.hours,
    minutes: elapsed.minutes,
    seconds: elapsed.seconds,
  };
  Object.keys(map).forEach((unit) => {
    const el = cardEl.querySelector(`[data-unit="${unit}"]`);
    if (!el) return;
    const newValue = String(map[unit]);
    if (el.textContent !== newValue) {
      el.textContent = newValue;
      el.classList.remove("tick");
      // reflow para reiniciar la animación
      void el.offsetWidth;
      el.classList.add("tick");
    }
  });
}

/* ===========================================================
   Contador 1 — fecha fija (cuándo se conocieron)
=========================================================== */
const MEETING_DATE = new Date("2026-01-27T20:50:00");
const counter1Card = document.getElementById("counter1");

function tickCounter1() {
  renderCounter(counter1Card, getElapsed(MEETING_DATE));
}
tickCounter1();
setInterval(tickCounter1, 1000);

/* ===========================================================
   Contador 2 — inicia con botón, persiste en localStorage
=========================================================== */
const STORAGE_KEY = "novia_counter_start";
const counter2Card = document.getElementById("counter2");
const startBtn = document.getElementById("startBtn");
const counter2Label = document.getElementById("counter2-label");

let counter2Interval = null;

function startCounter2Ticking(startDate) {
  function tick() {
    renderCounter(counter2Card, getElapsed(startDate));
  }
  tick();
  if (counter2Interval) clearInterval(counter2Interval);
  counter2Interval = setInterval(tick, 1000);
}

function activateCounter2UI() {
  startBtn.classList.add("btn-hidden");
  startBtn.setAttribute("disabled", "true");
  if (counter2Label) counter2Label.textContent = "somos novios desde hace";
}

function initCounter2() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const startDate = new Date(saved);
    activateCounter2UI();
    startCounter2Ticking(startDate);
  }
}

startBtn.addEventListener("click", () => {
  // Evita reinicios accidentales si ya existe una fecha guardada
  if (localStorage.getItem(STORAGE_KEY)) return;

  const now = new Date();
  localStorage.setItem(STORAGE_KEY, now.toISOString());
  activateCounter2UI();
  startCounter2Ticking(now);
});

initCounter2();

/* ===========================================================
   Función de reinicio secreta — sin botón visible en la UI.
   Para usarla: abrir la consola del navegador (F12) y ejecutar
   resetCounter()
=========================================================== */
function resetCounter() {
  localStorage.removeItem(STORAGE_KEY);
  console.log("Contador reiniciado. Recarga la página para volver a ver el botón Iniciar.");
}
window.resetCounter = resetCounter;
