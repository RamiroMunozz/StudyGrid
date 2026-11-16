"use strict";

// Tests de la lógica pura del mapa de calor (fases B: T5 a T10).
// Todos usan una fecha fija como "hoy": nunca leen el reloj real.

const test = require("node:test");
const assert = require("node:assert/strict");

const HeatmapLogic = require("./heatmap-logic.js");

function sesion(fecha, minutos) {
  return { id: 1, fecha: fecha, tema: "Prueba", minutos: minutos };
}

const HOY = "2026-11-10"; // martes

// --- T5 y T6: validar sesiones y sumar minutos por día ---

test("sumMinutesByDate suma varias sesiones del mismo día", () => {
  const totales = HeatmapLogic.sumMinutesByDate(
    [sesion("2026-11-09", 20), sesion("2026-11-09", 30)],
    HOY
  );
  assert.equal(totales["2026-11-09"], 50);
});

test("sumMinutesByDate redondea el total diario al minuto entero", () => {
  const totales = HeatmapLogic.sumMinutesByDate(
    [sesion("2026-11-09", 0.4), sesion("2026-11-09", 0.4)],
    HOY
  );
  assert.equal(totales["2026-11-09"], 1);

  assert.equal(HeatmapLogic.sumMinutesByDate([sesion("2026-11-09", 30.5)], HOY)["2026-11-09"], 31);
});

test("sumMinutesByDate ignora sesiones sin minutos válidos", () => {
  const sesiones = [
    sesion("2026-11-01", 0),
    sesion("2026-11-02", -15),
    sesion("2026-11-03", NaN),
    sesion("2026-11-04", Infinity),
    sesion("2026-11-05", "45"),
    { id: 2, fecha: "2026-11-06", tema: "Sin minutos" },
    sesion("2026-11-09", 30),
  ];

  assert.deepEqual(HeatmapLogic.sumMinutesByDate(sesiones, HOY), { "2026-11-09": 30 });
});

test("sumMinutesByDate ignora fechas futuras e imposibles", () => {
  const sesiones = [
    sesion("2026-11-11", 60),
    sesion("2026-02-30", 60),
    sesion("09/11/2026", 60),
    sesion("2026-11-10", 15),
  ];

  assert.deepEqual(HeatmapLogic.sumMinutesByDate(sesiones, HOY), { "2026-11-10": 15 });
});

test("sumMinutesByDate no muta la lista de sesiones", () => {
  const sesiones = [sesion("2026-11-09", 20), sesion("2026-11-09", 30)];
  const copia = JSON.parse(JSON.stringify(sesiones));

  HeatmapLogic.sumMinutesByDate(sesiones, HOY);

  assert.deepEqual(sesiones, copia);
});

test("sumMinutesByDate trata un payload que no es lista como vacío", () => {
  for (const payload of [null, undefined, {}, "texto", 42, true]) {
    assert.deepEqual(HeatmapLogic.sumMinutesByDate(payload, HOY), {}, String(payload));
  }
});

test("isValidSession acepta solo sesiones con fecha pasada y minutos válidos", () => {
  assert.equal(HeatmapLogic.isValidSession(sesion("2026-11-09", 45), HOY), true);
  assert.equal(HeatmapLogic.isValidSession(sesion("2026-11-10", 1), HOY), true);

  assert.equal(HeatmapLogic.isValidSession(sesion("2026-11-11", 45), HOY), false);
  assert.equal(HeatmapLogic.isValidSession(sesion("2026-11-09", 0), HOY), false);
  assert.equal(HeatmapLogic.isValidSession(sesion("2026-11-09", -5), HOY), false);
  assert.equal(HeatmapLogic.isValidSession(sesion("2026-11-09", "45"), HOY), false);
  assert.equal(HeatmapLogic.isValidSession(sesion("2026-02-30", 45), HOY), false);
});

test("isValidSession rechaza entradas que no son objetos", () => {
  for (const entrada of [null, undefined, 5, "2026-11-09", [], true]) {
    assert.equal(HeatmapLogic.isValidSession(entrada, HOY), false, String(entrada));
  }
});

// --- T7: niveles de color ---

test("getHeatLevel aplica los umbrales de minutos", () => {
  assert.equal(HeatmapLogic.getHeatLevel(0), 0);
  assert.equal(HeatmapLogic.getHeatLevel(1), 1);
  assert.equal(HeatmapLogic.getHeatLevel(30), 1);
  assert.equal(HeatmapLogic.getHeatLevel(31), 2);
  assert.equal(HeatmapLogic.getHeatLevel(60), 2);
  assert.equal(HeatmapLogic.getHeatLevel(61), 3);
  assert.equal(HeatmapLogic.getHeatLevel(120), 3);
  assert.equal(HeatmapLogic.getHeatLevel(121), 4);
  assert.equal(HeatmapLogic.getHeatLevel(500), 4);
});

test("getHeatLevel trata negativos y decimales según los umbrales", () => {
  assert.equal(HeatmapLogic.getHeatLevel(-30), 0);
  assert.equal(HeatmapLogic.getHeatLevel(0.4), 1);
  // Los minutos llegan ya redondeados; un 30,4 suelto queda por encima de 30.
  assert.equal(HeatmapLogic.getHeatLevel(30.4), 2);
  assert.equal(HeatmapLogic.getHeatLevel(120.6), 4);
});

// --- T8: cuadrícula de 12 semanas ---

test("buildHeatmap devuelve 12 columnas con 7 posiciones cada una", () => {
  const mapa = HeatmapLogic.buildHeatmap([], HOY);

  assert.equal(mapa.weeks.length, 12);
  for (const semana of mapa.weeks) {
    assert.equal(semana.days.length, 7);
  }
});

test("buildHeatmap empieza el lunes de hace 11 semanas y acaba hoy", () => {
  const mapa = HeatmapLogic.buildHeatmap([], HOY);

  assert.equal(mapa.startDate, "2026-08-24");
  assert.equal(mapa.endDate, HOY);
  assert.equal(mapa.weeks[0].days[0].date, "2026-08-24");
  assert.equal(mapa.weeks[11].days[1].date, HOY);
});

test("buildHeatmap no pinta días futuros: la última columna se trunca hoy", () => {
  const mapa = HeatmapLogic.buildHeatmap([], HOY);
  const ultima = mapa.weeks[11].days;

  assert.deepEqual(
    ultima.map((dia) => (dia === null ? null : dia.date)),
    ["2026-11-09", HOY, null, null, null, null, null]
  );

  const fechas = mapa.weeks.flatMap((semana) => semana.days).filter((dia) => dia !== null);
  assert.equal(fechas.length, 79);
  assert.equal(
    fechas.every((dia) => dia.date <= HOY),
    true
  );
});

test("buildHeatmap reparte los niveles con los minutos de cada día", () => {
  const mapa = HeatmapLogic.buildHeatmap(
    [sesion(HOY, 45), sesion("2026-11-09", 20), sesion("2026-11-09", 40), sesion("2026-11-08", 200)],
    HOY
  );

  const ultima = mapa.weeks[11].days;
  assert.deepEqual(ultima[0], { date: "2026-11-09", minutes: 60, level: 2 });
  assert.deepEqual(ultima[1], { date: HOY, minutes: 45, level: 2 });
  assert.deepEqual(mapa.weeks[10].days[6], { date: "2026-11-08", minutes: 200, level: 4 });
  assert.deepEqual(mapa.weeks[0].days[0], { date: "2026-08-24", minutes: 0, level: 0 });
});

test("buildHeatmap marca el mes en la columna que contiene el día 1", () => {
  const mapa = HeatmapLogic.buildHeatmap([], HOY);
  const meses = mapa.weeks.map((semana) => semana.monthKey);

  assert.deepEqual(meses, [null, "2026-09", null, null, null, "2026-10", null, null, null, "2026-11", null, null]);
});

test("buildHeatmap deja todo en nivel 0 con una lista vacía", () => {
  const mapa = HeatmapLogic.buildHeatmap([], HOY);
  const dias = mapa.weeks.flatMap((semana) => semana.days).filter((dia) => dia !== null);

  assert.equal(
    dias.every((dia) => dia.level === 0 && dia.minutes === 0),
    true
  );
});

test("buildHeatmap ignora las sesiones anteriores al periodo sin borrarlas", () => {
  const sesiones = [sesion("2026-08-23", 120), sesion("2026-08-24", 30)];
  const copia = JSON.parse(JSON.stringify(sesiones));

  const mapa = HeatmapLogic.buildHeatmap(sesiones, HOY);

  assert.deepEqual(mapa.weeks[0].days[0], { date: "2026-08-24", minutes: 30, level: 1 });
  assert.deepEqual(sesiones, copia);
});

// --- T9: texto del globo ---

test("formatDaySummary escribe la fecha larga y los minutos", () => {
  assert.equal(HeatmapLogic.formatDaySummary("2026-11-09", 45), "Lunes, 9 de noviembre de 2026 · 45 min");
  assert.equal(HeatmapLogic.formatDaySummary("2026-11-09", 1), "Lunes, 9 de noviembre de 2026 · 1 min");
  assert.equal(HeatmapLogic.formatDaySummary("2026-11-09", 121), "Lunes, 9 de noviembre de 2026 · 121 min");
});

test("formatDaySummary escribe Sin sesiones cuando no hay minutos", () => {
  assert.equal(HeatmapLogic.formatDaySummary("2026-11-09", 0), "Lunes, 9 de noviembre de 2026 · Sin sesiones");
  assert.equal(HeatmapLogic.formatDaySummary("2026-11-09", -10), "Lunes, 9 de noviembre de 2026 · Sin sesiones");
});

// --- T10: casos límite ---

test("buildHeatmap trata un payload que no es lista como historial vacío", () => {
  for (const payload of [null, undefined, {}, "texto", 42]) {
    const mapa = HeatmapLogic.buildHeatmap(payload, HOY);
    assert.equal(mapa.weeks.length, 12, String(payload));
    assert.equal(mapa.weeks[11].days[1].level, 0, String(payload));
  }
});

test("buildHeatmap sobrevive a entradas que no son objetos", () => {
  const mapa = HeatmapLogic.buildHeatmap([null, 5, "2026-11-09", [], {}, sesion(HOY, 30)], HOY);

  assert.equal(mapa.weeks[11].days[1].minutes, 30);
});

test("buildHeatmap acierta con el 29 de febrero dentro del periodo", () => {
  const mapa = HeatmapLogic.buildHeatmap([sesion("2024-02-29", 90)], "2024-03-05");
  const bisiesto = mapa.weeks
    .flatMap((semana) => semana.days)
    .filter((dia) => dia !== null)
    .find((dia) => dia.date === "2024-02-29");

  assert.deepEqual(bisiesto, { date: "2024-02-29", minutes: 90, level: 3 });
});

test("buildHeatmap con hoy lunes deja una sola celda en la última columna", () => {
  const mapa = HeatmapLogic.buildHeatmap([sesion("2026-11-09", 60)], "2026-11-09");

  assert.deepEqual(
    mapa.weeks[11].days.map((dia) => (dia === null ? null : dia.date)),
    ["2026-11-09", null, null, null, null, null, null]
  );
});

test("buildHeatmap con hoy domingo deja la última columna completa", () => {
  const mapa = HeatmapLogic.buildHeatmap([], "2026-11-15");
  const dias = mapa.weeks.flatMap((semana) => semana.days).filter((dia) => dia !== null);

  assert.equal(mapa.weeks[11].days[6].date, "2026-11-15");
  assert.equal(dias.length, 84);
});

test("buildHeatmap cruza el cambio de año y etiqueta enero", () => {
  const mapa = HeatmapLogic.buildHeatmap([], "2027-01-05"); // martes

  assert.equal(mapa.startDate, "2026-10-19");
  assert.equal(mapa.weeks[11].days[1].date, "2027-01-05");
  assert.deepEqual(
    mapa.weeks.map((semana) => semana.monthKey),
    [null, "2026-11", null, null, null, null, "2026-12", null, null, null, "2027-01", null]
  );
});

test("buildHeatmap devuelve lo mismo en dos llamadas idénticas", () => {
  const sesiones = [sesion("2026-11-09", 20), sesion("2026-11-09", 30), sesion("2026-11-10", 121)];

  assert.deepEqual(
    HeatmapLogic.buildHeatmap(sesiones, HOY),
    HeatmapLogic.buildHeatmap(sesiones, HOY)
  );
});
