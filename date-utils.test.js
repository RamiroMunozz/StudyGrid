"use strict";

// Tests de T1: las funciones base de fecha local.
// Se amplían en T2 con la matriz completa de fin de mes, fin de año y bisiesto.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const DateUtils = require("./date-utils.js");

test("expone las tres funciones base y se carga en Node", () => {
  assert.equal(typeof DateUtils.toLocalDateString, "function");
  assert.equal(typeof DateUtils.shiftDate, "function");
  assert.equal(typeof DateUtils.isValidDateString, "function");
});

test("no usa APIs de navegador ni funciones de fecha en UTC", () => {
  // Se miran solo las líneas de código: los comentarios pueden nombrarlas.
  const code = fs
    .readFileSync(path.join(__dirname, "date-utils.js"), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");

  for (const forbidden of ["toISOString", "document", "window", "localStorage"]) {
    assert.equal(code.includes(forbidden), false, `date-utils.js no debe usar ${forbidden}`);
  }

  // `new Date("AAAA-MM-DD")` se interpreta en UTC: solo se admite el constructor numérico.
  assert.equal(/new Date\(\s*['"`]/.test(code), false);
});

test("toLocalDateString devuelve la fecha local en formato AAAA-MM-DD", () => {
  assert.equal(DateUtils.toLocalDateString(new Date(2026, 10, 9, 8, 15)), "2026-11-09");
  assert.equal(DateUtils.toLocalDateString(new Date(2026, 0, 5, 0, 0)), "2026-01-05");
  assert.equal(DateUtils.toLocalDateString(new Date(2026, 11, 31, 23, 59)), "2026-12-31");
});

test("toLocalDateString no desplaza el día en horas cercanas a medianoche", () => {
  // Con toISOString() pasarían al día siguiente o anterior según la zona horaria.
  assert.equal(DateUtils.toLocalDateString(new Date(2026, 10, 9, 0, 0)), "2026-11-09");
  assert.equal(DateUtils.toLocalDateString(new Date(2026, 10, 9, 23, 59)), "2026-11-09");
});

test("shiftDate avanza y retrocede días", () => {
  assert.equal(DateUtils.shiftDate("2026-11-09", 1), "2026-11-10");
  assert.equal(DateUtils.shiftDate("2026-11-09", -1), "2026-11-08");
  assert.equal(DateUtils.shiftDate("2026-11-09", 7), "2026-11-16");
  assert.equal(DateUtils.shiftDate("2026-11-09", 0), "2026-11-09");
});

test("isValidDateString acepta fechas reales", () => {
  assert.equal(DateUtils.isValidDateString("2026-11-09"), true);
  assert.equal(DateUtils.isValidDateString("2026-01-01"), true);
  assert.equal(DateUtils.isValidDateString("2026-02-28"), true);
  assert.equal(DateUtils.isValidDateString("2024-02-29"), true);
});

test("isValidDateString rechaza formatos distintos de AAAA-MM-DD", () => {
  assert.equal(DateUtils.isValidDateString("2026-1-1"), false);
  assert.equal(DateUtils.isValidDateString("09/11/2026"), false);
  assert.equal(DateUtils.isValidDateString("2026-11-9"), false);
  assert.equal(DateUtils.isValidDateString(""), false);
  assert.equal(DateUtils.isValidDateString("abc"), false);
});

test("isValidDateString rechaza fechas que no existen en el calendario", () => {
  assert.equal(DateUtils.isValidDateString("2026-02-30"), false);
  assert.equal(DateUtils.isValidDateString("2026-13-01"), false);
  assert.equal(DateUtils.isValidDateString("2026-00-10"), false);
  assert.equal(DateUtils.isValidDateString("2026-04-31"), false);
  assert.equal(DateUtils.isValidDateString("2025-02-29"), false);
});

test("isValidDateString rechaza valores que no son cadenas", () => {
  assert.equal(DateUtils.isValidDateString(20261109), false);
  assert.equal(DateUtils.isValidDateString(null), false);
  assert.equal(DateUtils.isValidDateString(undefined), false);
  assert.equal(DateUtils.isValidDateString(new Date(2026, 10, 9)), false);
});

// --- T2: matriz completa de fechas ---

test("isValidDateString acepta los últimos días de cada mes y el 29 de febrero", () => {
  for (const fecha of [
    "2026-01-31",
    "2026-04-30",
    "2026-06-30",
    "2026-09-30",
    "2026-12-31",
    "2026-02-28",
    "2024-02-29",
  ]) {
    assert.equal(DateUtils.isValidDateString(fecha), true, fecha);
  }
});

test("isValidDateString rechaza el 29 de febrero de un año no bisiesto", () => {
  assert.equal(DateUtils.isValidDateString("2025-02-29"), false);
  assert.equal(DateUtils.isValidDateString("2100-02-29"), false);
});

test("shiftDate cruza el fin de mes", () => {
  assert.equal(DateUtils.shiftDate("2026-01-31", 1), "2026-02-01");
  assert.equal(DateUtils.shiftDate("2026-03-01", -1), "2026-02-28");
  assert.equal(DateUtils.shiftDate("2026-04-30", 1), "2026-05-01");
  assert.equal(DateUtils.shiftDate("2026-05-01", -1), "2026-04-30");
  assert.equal(DateUtils.shiftDate("2026-01-01", -1), "2025-12-31");
});

test("shiftDate cruza el fin de año", () => {
  assert.equal(DateUtils.shiftDate("2026-12-31", 1), "2027-01-01");
  assert.equal(DateUtils.shiftDate("2027-01-01", -1), "2026-12-31");
  assert.equal(DateUtils.shiftDate("2026-12-28", 7), "2027-01-04");
});

test("shiftDate acierta con el 28 y el 29 de febrero", () => {
  assert.equal(DateUtils.shiftDate("2026-02-28", 1), "2026-03-01");
  assert.equal(DateUtils.shiftDate("2024-02-28", 1), "2024-02-29");
  assert.equal(DateUtils.shiftDate("2024-02-29", 1), "2024-03-01");
  assert.equal(DateUtils.shiftDate("2024-03-01", -1), "2024-02-29");
});

test("shiftDate no duplica ni pierde días en el cambio de hora", () => {
  // 29 de marzo y 25 de octubre de 2026: cambios de hora en España.
  assert.equal(DateUtils.shiftDate("2026-03-28", 1), "2026-03-29");
  assert.equal(DateUtils.shiftDate("2026-03-29", 1), "2026-03-30");
  assert.equal(DateUtils.shiftDate("2026-10-24", 1), "2026-10-25");
  assert.equal(DateUtils.shiftDate("2026-10-25", 1), "2026-10-26");

  // Una semana seguida de días debe dar siete fechas distintas y consecutivas.
  let dia = "2026-03-26";
  const semana = [dia];
  for (let i = 1; i < 7; i += 1) {
    dia = DateUtils.shiftDate(dia, 1);
    semana.push(dia);
  }
  assert.deepEqual(semana, [
    "2026-03-26",
    "2026-03-27",
    "2026-03-28",
    "2026-03-29",
    "2026-03-30",
    "2026-03-31",
    "2026-04-01",
  ]);
});

// --- T3: inicio de semana y fecha larga ---

test("startOfWeek devuelve el lunes de la semana", () => {
  assert.equal(DateUtils.startOfWeek("2026-11-09"), "2026-11-09"); // lunes
  assert.equal(DateUtils.startOfWeek("2026-11-10"), "2026-11-09"); // martes
  assert.equal(DateUtils.startOfWeek("2026-11-15"), "2026-11-09"); // domingo
});

test("startOfWeek cruza el cambio de mes", () => {
  assert.equal(DateUtils.startOfWeek("2026-12-01"), "2026-11-30");
  assert.equal(DateUtils.startOfWeek("2026-12-06"), "2026-11-30"); // domingo
});

test("startOfWeek cruza el cambio de año", () => {
  assert.equal(DateUtils.startOfWeek("2027-01-01"), "2026-12-28");
  assert.equal(DateUtils.startOfWeek("2027-01-03"), "2026-12-28"); // domingo
});

test("formatLongDate escribe la fecha larga en español", () => {
  assert.equal(DateUtils.formatLongDate("2026-11-09"), "Lunes, 9 de noviembre de 2026");
  assert.equal(DateUtils.formatLongDate("2026-01-01"), "Jueves, 1 de enero de 2026");
  assert.equal(DateUtils.formatLongDate("2024-02-29"), "Jueves, 29 de febrero de 2024");
});

test("formatLongDate no revienta con fechas ilegibles", () => {
  // RF-10: un historial con fechas corruptas no debe romper la interfaz.
  assert.equal(DateUtils.formatLongDate("abc"), "");
  assert.equal(DateUtils.formatLongDate(""), "");
  assert.equal(DateUtils.formatLongDate(undefined), "");
  assert.equal(DateUtils.formatLongDate(null), "");
});
