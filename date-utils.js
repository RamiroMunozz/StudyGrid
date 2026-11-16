"use strict";

// Funciones puras de fecha local. No tocan el DOM ni localStorage y no
// dependen del reloj: quien las usa les pasa la fecha.
// Patrón IIFE: global `DateUtils` en el navegador y `module.exports` en Node,
// sin módulos ES para que funcione con file://.
(function (global) {
  // Devuelve la fecha local en formato "AAAA-MM-DD" (nunca en UTC).
  function toLocalDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Crea la fecha local a mediodía para que los cambios de hora no salten de día.
  function toLocalNoon(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day, 12);
  }

  // Mueve una fecha "AAAA-MM-DD" hacia delante o hacia atrás los días indicados.
  function shiftDate(dateString, days) {
    const date = toLocalNoon(dateString);
    date.setDate(date.getDate() + days);
    return toLocalDateString(date);
  }

  // Comprueba el formato "AAAA-MM-DD" y que la fecha exista de verdad
  // (rechaza "2026-02-30" o "2026-13-01").
  function isValidDateString(value) {
    if (typeof value !== "string") {
      return false;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return false;
    }

    const [year, month, day] = value.split("-").map(Number);
    const date = toLocalNoon(value);

    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }

  // Devuelve el lunes de la semana de esa fecha (semana de lunes a domingo).
  function startOfWeek(dateString) {
    const date = toLocalNoon(dateString);
    const dayIndex = (date.getDay() + 6) % 7; // lunes = 0, domingo = 6
    return shiftDate(dateString, -dayIndex);
  }

  // Fecha larga en español: "Lunes, 9 de noviembre de 2026".
  // Reutiliza el formato que ya usa la lista de sesiones.
  // Si la fecha no se puede leer (dato corrupto) devuelve texto vacío.
  function formatLongDate(dateString) {
    if (typeof dateString !== "string") {
      return "";
    }

    const date = toLocalNoon(dateString);
    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const text = new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  const DateUtils = {
    toLocalDateString: toLocalDateString,
    shiftDate: shiftDate,
    isValidDateString: isValidDateString,
    startOfWeek: startOfWeek,
    formatLongDate: formatLongDate,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = DateUtils;
  }

  global.DateUtils = DateUtils;
})(typeof globalThis !== "undefined" ? globalThis : this);
