"use strict";

// Lógica pura del mapa de calor: no toca el DOM ni localStorage y recibe
// "today" como cadena "AAAA-MM-DD" para poder probarla sin depender del reloj.
// Patrón IIFE: global `HeatmapLogic` en el navegador y `module.exports` en Node.
(function (global) {
  const DateUtils =
    typeof module !== "undefined" && module.exports
      ? require("./date-utils.js")
      : global.DateUtils;

  const WEEKS = 12;
  const DAYS_PER_WEEK = 7;

  // Una sesión cuenta solo si es un objeto con fecha real no futura y minutos
  // numéricos finitos mayores que 0. Las cadenas numéricas no valen.
  function isValidSession(session, today) {
    if (session === null || typeof session !== "object" || Array.isArray(session)) {
      return false;
    }
    if (!DateUtils.isValidDateString(session.fecha) || session.fecha > today) {
      return false;
    }

    const minutes = session.minutos;
    return typeof minutes === "number" && Number.isFinite(minutes) && minutes > 0;
  }

  // Suma los minutos de cada día, ignorando sesiones inválidas o futuras,
  // y redondea el total diario al minuto entero (0,5 sube). No muta la lista.
  function sumMinutesByDate(sessions, today) {
    const totals = {};

    if (!Array.isArray(sessions)) {
      return totals;
    }

    for (const session of sessions) {
      if (!isValidSession(session, today)) {
        continue;
      }
      totals[session.fecha] = (totals[session.fecha] || 0) + session.minutos;
    }

    for (const date of Object.keys(totals)) {
      totals[date] = Math.round(totals[date]);
    }

    return totals;
  }

  // Cinco niveles: 0; 1–30; 31–60; 61–120; más de 120.
  // Recibe minutos ya redondeados y no negativos.
  function getHeatLevel(minutes) {
    if (minutes <= 0) {
      return 0;
    }
    if (minutes <= 30) {
      return 1;
    }
    if (minutes <= 60) {
      return 2;
    }
    if (minutes <= 120) {
      return 3;
    }
    return 4;
  }

  // Construye 12 semanas de lunes a domingo que acaban hoy. Las posiciones
  // posteriores a hoy son `null` para conservar la alineación.
  function buildHeatmap(sessions, today) {
    const totals = sumMinutesByDate(sessions, today);
    const firstMonday = DateUtils.shiftDate(
      DateUtils.startOfWeek(today),
      -((WEEKS - 1) * DAYS_PER_WEEK)
    );

    const weeks = [];

    for (let weekIndex = 0; weekIndex < WEEKS; weekIndex += 1) {
      const weekStart = DateUtils.shiftDate(firstMonday, weekIndex * DAYS_PER_WEEK);
      const days = [];
      let monthKey = null;

      for (let dayIndex = 0; dayIndex < DAYS_PER_WEEK; dayIndex += 1) {
        const date = DateUtils.shiftDate(weekStart, dayIndex);

        if (date > today) {
          days.push(null);
          continue;
        }

        const minutes = totals[date] || 0;
        days.push({ date: date, minutes: minutes, level: getHeatLevel(minutes) });

        // La etiqueta del mes va en la columna que contiene el día 1.
        if (date.slice(8) === "01") {
          monthKey = date.slice(0, 7);
        }
      }

      weeks.push({ monthKey: monthKey, days: days });
    }

    return { startDate: firstMonday, endDate: today, weeks: weeks };
  }

  // Texto del globo y del aria-label: "Lunes, 9 de noviembre de 2026 · 45 min".
  function formatDaySummary(dateString, minutes) {
    const date = DateUtils.formatLongDate(dateString);

    if (!(minutes > 0)) {
      return `${date} · Sin sesiones`;
    }
    return `${date} · ${minutes} min`;
  }

  const HeatmapLogic = {
    isValidSession: isValidSession,
    sumMinutesByDate: sumMinutesByDate,
    getHeatLevel: getHeatLevel,
    buildHeatmap: buildHeatmap,
    formatDaySummary: formatDaySummary,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = HeatmapLogic;
  }

  global.HeatmapLogic = HeatmapLogic;
})(typeof globalThis !== "undefined" ? globalThis : this);
