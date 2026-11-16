"use strict";

// Interfaz del objetivo semanal: pinta estados y gestiona confirmar/quitar.
// No recalcula reglas de negocio: usa WeeklyGoalLogic y el progreso recibido.
(function () {
  const root = document.getElementById("objetivo-semanal");
  if (!root) {
    return;
  }

  const invitation = document.getElementById("objetivo-invitacion");
  const field = document.getElementById("objetivo-minutos");
  const saveButton = document.getElementById("objetivo-guardar");
  const removeButton = document.getElementById("objetivo-quitar");
  const figure = document.getElementById("objetivo-cifra");
  const bar = document.getElementById("objetivo-barra");
  const barFill = document.getElementById("objetivo-barra-relleno");
  const stateText = document.getElementById("objetivo-estado");

  function getStorage() {
    try {
      return window.localStorage;
    } catch (error) {
      return null;
    }
  }

  const storage = getStorage();
  let currentGoal = WeeklyGoalLogic.readStoredGoal(storage);
  let lastSessions = [];
  let lastToday = DateUtils.toLocalDateString(new Date());
  let lastWeekStart = DateUtils.startOfWeek(lastToday);

  function getProgress(sessions, today) {
    return WeeklyGoalLogic.getWeeklyProgressMinutes(sessions, today);
  }

  function clearAviso() {
    stateText.hidden = true;
    stateText.textContent = "";
  }

  function showAviso(text, isError) {
    stateText.textContent = text;
    stateText.hidden = text === "";
    if (isError) {
      stateText.setAttribute("role", "alert");
    } else {
      stateText.removeAttribute("role");
    }
  }

  function render(sessions, today) {
    if (Array.isArray(sessions)) {
      lastSessions = sessions;
    }
    if (typeof today === "string" && today !== "") {
      lastToday = today;
      lastWeekStart = DateUtils.startOfWeek(today);
    }

    const progress = getProgress(lastSessions, lastToday);
    const state = WeeklyGoalLogic.getGoalState(currentGoal, progress);
    const texts = WeeklyGoalLogic.formatGoalSummary(state);

    if (state.kind === "none") {
      invitation.hidden = false;
      invitation.textContent = texts.invitation || "Fija un objetivo semanal";
      figure.hidden = true;
      bar.hidden = true;
      removeButton.hidden = true;
      field.value = "";
      barFill.style.width = "0%";
      bar.setAttribute("aria-valuemax", "0");
      bar.setAttribute("aria-valuenow", "0");
      bar.setAttribute("aria-valuetext", "0 de 0 minutos (0 %)");
      return;
    }

    invitation.hidden = true;
    figure.hidden = false;
    bar.hidden = false;
    removeButton.hidden = false;

    figure.textContent = texts.visible;
    stateText.textContent = texts.status || "";
    stateText.hidden = !texts.status;

    const max = state.goal;
    const now = Math.min(state.progress, max);
    const widthPercent = max > 0 ? Math.min(100, (now / max) * 100) : 0;
    barFill.style.width = widthPercent + "%";
    bar.setAttribute("aria-valuemax", String(max));
    bar.setAttribute("aria-valuenow", String(now));
    bar.setAttribute("aria-valuetext", texts.sr);

    if (field !== document.activeElement) {
      field.value = String(max);
    }
  }

  function renderWeeklyGoal(sessions, today) {
    // Al repintar desde la app no se borran avisos de error/aviso activos salvo que cambien.
    const previousMessage = stateText.hidden ? "" : stateText.textContent;
    const wasAlert = stateText.getAttribute("role") === "alert";
    render(sessions, today);
    if (previousMessage && wasAlert) {
      showAviso(previousMessage, true);
    }
  }

  function confirmGoal() {
    const result = WeeklyGoalLogic.normalizeGoalInput(field.value);

    if (!result.ok) {
      if (result.reason === "cero") {
        showAviso(
          "Para no tener objetivo, confirma el campo vacío o usa el botón \"Quitar\".",
          true
        );
      } else {
        showAviso("Introduce un objetivo entre 1 y 10080 minutos.", true);
      }
      render(lastSessions, lastToday);
      return;
    }

    if (result.remove) {
      if (currentGoal === null) {
        clearAviso();
        render(lastSessions, lastToday);
        return;
      }
      currentGoal = null;
      clearAviso();
      const ok = WeeklyGoalLogic.writeGoal(storage, null);
      render(lastSessions, lastToday);
      if (!ok) {
        showAviso("El objetivo no se conservará al cerrar.", false);
      }
      return;
    }

    currentGoal = result.goal;
    clearAviso();
    const ok = WeeklyGoalLogic.writeGoal(storage, result.goal);
    render(lastSessions, lastToday);
    if (!ok) {
      showAviso("El objetivo no se conservará al cerrar.", false);
    }
  }

  saveButton.addEventListener("click", confirmGoal);

  field.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      confirmGoal();
    }
  });

  removeButton.addEventListener("click", function () {
    field.value = "";
    confirmGoal();
  });

  // Render inicial con el estado actual conocido.
  render(lastSessions, lastToday);

  // Comprueba periódicamente (< 60 s) si la semana local cambió mientras la app está abierta.
  // Si cruza a una semana nueva, reinicia el progreso a 0 conservando el objetivo.
  setInterval(function () {
    const todayNow = DateUtils.toLocalDateString(new Date());
    const weekStartNow = DateUtils.startOfWeek(todayNow);
    if (weekStartNow !== lastWeekStart) {
      lastToday = todayNow;
      lastWeekStart = weekStartNow;
      render(lastSessions, lastToday);
    }
  }, 30000);

  window.WeeklyGoalUI = {
    renderWeeklyGoal: renderWeeklyGoal,
  };
})();