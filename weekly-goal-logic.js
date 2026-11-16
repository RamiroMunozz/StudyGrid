"use strict";

(function (global) {
  const CLAVE_OBJETIVO = "diario-de-estudio-objetivo";

  function getDateUtils() {
    if (global && global.DateUtils) {
      return global.DateUtils;
    }
    if (typeof module !== "undefined" && module.exports) {
      try {
        return require("./date-utils.js");
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  function isValidGoal(value) {
    return (
      typeof value === "number" &&
      Number.isInteger(value) &&
      Number.isFinite(value) &&
      value >= 1 &&
      value <= 10080
    );
  }

  function normalizeGoalInput(raw) {
    const texto = typeof raw === "string" ? raw.trim() : String(raw == null ? "" : raw).trim();

    if (texto === "") {
      return { ok: true, remove: true, goal: null };
    }

    // Acepta solo números enteros escritos sin decimales.
    if (!/^-?\d+$/.test(texto)) {
      return { ok: false, reason: "rango" };
    }

    const numero = Number(texto);
    if (!Number.isFinite(numero) || !Number.isInteger(numero)) {
      return { ok: false, reason: "rango" };
    }

    if (numero === 0) {
      return { ok: false, reason: "cero" };
    }

    if (!isValidGoal(numero)) {
      return { ok: false, reason: "rango" };
    }

    return { ok: true, remove: false, goal: numero };
  }

  function getWeeklyProgressMinutes(sessions, today) {
    const DateUtils = getDateUtils();
    if (!DateUtils || !Array.isArray(sessions)) {
      return 0;
    }

    const inicio = DateUtils.startOfWeek(today);
    const fin = DateUtils.shiftDate(inicio, 6);

    const total = sessions.reduce((suma, sesion) => {
      if (
        sesion === null ||
        typeof sesion !== "object" ||
        Array.isArray(sesion) ||
        typeof sesion.fecha !== "string"
      ) {
        return suma;
      }
      if (sesion.fecha < inicio || sesion.fecha > fin || sesion.fecha > today) {
        return suma;
      }

      const minutos = Number(sesion.minutos);
      return Number.isFinite(minutos) && minutos > 0 ? suma + minutos : suma;
    }, 0);

    return Math.round(total);
  }

  function getGoalState(goal, progressMinutes) {
    const progress = Number.isFinite(progressMinutes) ? progressMinutes : 0;
    if (!isValidGoal(goal)) {
      return { kind: "none", goal: null, progress: progress, percentForSR: 0, excess: 0 };
    }

    if (progress <= 0) {
      return { kind: "empty-week", goal: goal, progress: 0, percentForSR: 0, excess: 0 };
    }

    const percentForSR = Math.min(100, Math.round((progress / goal) * 100));

    if (progress === goal) {
      return { kind: "met", goal: goal, progress: progress, percentForSR: 100, excess: 0 };
    }

    if (progress > goal) {
      return {
        kind: "exceeded",
        goal: goal,
        progress: progress,
        percentForSR: 100,
        excess: progress - goal,
      };
    }

    return { kind: "in-progress", goal: goal, progress: progress, percentForSR: percentForSR, excess: 0 };
  }

  function formatGoalSummary(state) {
    if (!state || state.kind === "none") {
      return { invitation: "Fija un objetivo semanal" };
    }

    const visible = state.progress + " / " + state.goal + " min";
    const sr = state.progress + " de " + state.goal + " minutos (" + state.percentForSR + " %)";
    let status = "";

    if (state.kind === "empty-week") {
      status = "Sin sesiones esta semana";
    } else if (state.kind === "met") {
      status = "Objetivo cumplido";
    } else if (state.kind === "exceeded") {
      status = "superado · " + state.excess + " min por encima";
    }

    return { visible: visible, sr: sr, status: status };
  }

  function readStoredGoal(storage) {
    if (!storage) {
      return null;
    }

    try {
      const valor = storage.getItem(CLAVE_OBJETIVO);
      let numero = null;

      if (typeof valor === "number") {
        numero = valor;
      } else if (typeof valor === "string" && /^(0|[1-9]\d*)$/.test(valor)) {
        // localStorage real devuelve cadenas; solo se acepta la forma canónica entera.
        numero = Number(valor);
      }

      return isValidGoal(numero) ? numero : null;
    } catch (error) {
      return null;
    }
  }

  function writeGoal(storage, goal) {
    if (!storage) {
      return false;
    }

    try {
      if (goal === null) {
        storage.removeItem(CLAVE_OBJETIVO);
        return true;
      }

      if (!isValidGoal(goal)) {
        return false;
      }

      // Se guarda como cadena canónica para compatibilidad con localStorage real.
      storage.setItem(CLAVE_OBJETIVO, String(goal));
      return true;
    } catch (error) {
      return false;
    }
  }

  const WeeklyGoalLogic = {
    CLAVE_OBJETIVO: CLAVE_OBJETIVO,
    isValidGoal: isValidGoal,
    normalizeGoalInput: normalizeGoalInput,
    getWeeklyProgressMinutes: getWeeklyProgressMinutes,
    getGoalState: getGoalState,
    formatGoalSummary: formatGoalSummary,
    readStoredGoal: readStoredGoal,
    writeGoal: writeGoal,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = WeeklyGoalLogic;
  }

  global.WeeklyGoalLogic = WeeklyGoalLogic;
})(typeof globalThis !== "undefined" ? globalThis : this);
