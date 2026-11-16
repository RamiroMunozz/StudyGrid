"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const DateUtils = require("./date-utils.js");
global.DateUtils = DateUtils;

const WeeklyGoalLogic = require("./weekly-goal-logic.js");

// --- isValidGoal ---

test("isValidGoal acepta enteros dentro del rango", () => {
  assert.equal(WeeklyGoalLogic.isValidGoal(1), true);
  assert.equal(WeeklyGoalLogic.isValidGoal(10080), true);
  assert.equal(WeeklyGoalLogic.isValidGoal(300), true);
});

test("isValidGoal rechaza valores inválidos", () => {
  const invalidos = [-30, 0, 12.5, "300", null, {}, NaN, Infinity, 999999];
  for (const valor of invalidos) {
    assert.equal(WeeklyGoalLogic.isValidGoal(valor), false, String(valor));
  }
  assert.equal(WeeklyGoalLogic.isValidGoal(undefined), false);
  assert.equal(WeeklyGoalLogic.isValidGoal(true), false);
});

// --- normalizeGoalInput ---

test("normalizeGoalInput interpreta vacío o espacios como quitar", () => {
  const vacio = WeeklyGoalLogic.normalizeGoalInput("");
  assert.deepEqual(vacio, { ok: true, remove: true, goal: null });
  const espacios = WeeklyGoalLogic.normalizeGoalInput("   ");
  assert.deepEqual(espacios, { ok: true, remove: true, goal: null });
});

test("normalizeGoalInput acepta un valor válido", () => {
  assert.deepEqual(WeeklyGoalLogic.normalizeGoalInput("300"), {
    ok: true,
    remove: false,
    goal: 300,
  });
  assert.deepEqual(WeeklyGoalLogic.normalizeGoalInput("1"), {
    ok: true,
    remove: false,
    goal: 1,
  });
  assert.deepEqual(WeeklyGoalLogic.normalizeGoalInput("10080"), {
    ok: true,
    remove: false,
    goal: 10080,
  });
});

test("normalizeGoalInput rechaza 0 como cero", () => {
  const resultado = WeeklyGoalLogic.normalizeGoalInput("0");
  assert.equal(resultado.ok, false);
  assert.equal(resultado.reason, "cero");
});

test("normalizeGoalInput rechaza valores fuera de rango o inválidos", () => {
  for (const valor of ["-30", "12.5", "abc", "999999", "10081"]) {
    const resultado = WeeklyGoalLogic.normalizeGoalInput(valor);
    assert.equal(resultado.ok, false, valor);
    assert.equal(resultado.reason, "rango", valor);
  }
});

test("normalizeGoalInput no muta la entrada", () => {
  const raw = "  300  ";
  const copia = raw;
  WeeklyGoalLogic.normalizeGoalInput(raw);
  assert.equal(raw, copia);
});

test("normalizeGoalInput no modifica objetos pasados como entrada", () => {
  const raw = { value: "300" };
  const copia = JSON.parse(JSON.stringify(raw));
  WeeklyGoalLogic.normalizeGoalInput(raw);
  assert.deepEqual(raw, copia);
});

// --- getWeeklyProgressMinutes ---

test("getWeeklyProgressMinutes devuelve 0 con semana vacía o historial no lista", () => {
  assert.equal(WeeklyGoalLogic.getWeeklyProgressMinutes([], "2026-11-11"), 0);
  assert.equal(WeeklyGoalLogic.getWeeklyProgressMinutes(null, "2026-11-11"), 0);
  assert.equal(WeeklyGoalLogic.getWeeklyProgressMinutes("basura", "2026-11-11"), 0);
  assert.equal(WeeklyGoalLogic.getWeeklyProgressMinutes({}, "2026-11-11"), 0);
});

test("getWeeklyProgressMinutes suma varias sesiones del mismo día", () => {
  const sesiones = [
    { fecha: "2026-11-11", minutos: 20 },
    { fecha: "2026-11-11", minutos: 30 },
  ];
  assert.equal(WeeklyGoalLogic.getWeeklyProgressMinutes(sesiones, "2026-11-11"), 50);
});

test("getWeeklyProgressMinutes incluye lunes y domingo y excluye el domingo anterior", () => {
  const sesiones = [
    { fecha: "2026-11-09", minutos: 10 }, // lunes
    { fecha: "2026-11-15", minutos: 20 }, // domingo
    { fecha: "2026-11-08", minutos: 99 }, // domingo anterior
  ];
  assert.equal(WeeklyGoalLogic.getWeeklyProgressMinutes(sesiones, "2026-11-15"), 30);
});

test("getWeeklyProgressMinutes funciona en cruce de mes/año y 29 de febrero", () => {
  const cruceMes = [
    { fecha: "2025-12-29", minutos: 10 }, // lunes
    { fecha: "2026-01-04", minutos: 15 }, // domingo
    { fecha: "2025-12-28", minutos: 99 }, // domingo anterior
  ];
  assert.equal(WeeklyGoalLogic.getWeeklyProgressMinutes(cruceMes, "2026-01-04"), 25);

  const bisiesto = [
    { fecha: "2024-02-26", minutos: 5 }, // lunes
    { fecha: "2024-02-29", minutos: 7 }, // jueves, incluido
    { fecha: "2024-03-03", minutos: 3 }, // domingo
  ];
  assert.equal(WeeklyGoalLogic.getWeeklyProgressMinutes(bisiesto, "2024-03-03"), 15);
});

test("getWeeklyProgressMinutes ignora futuras y minutos inválidos", () => {
  const sesiones = [
    { fecha: "2026-11-10", minutos: 30 },
    { fecha: "2026-11-12", minutos: 40 }, // futura respecto a today
    { fecha: "2026-11-10", minutos: 0 },
    { fecha: "2026-11-10", minutos: -5 },
    { fecha: "2026-11-10", minutos: "abc" },
    { fecha: "2026-11-10", minutos: NaN },
  ];
  assert.equal(WeeklyGoalLogic.getWeeklyProgressMinutes(sesiones, "2026-11-11"), 30);
});

test("getWeeklyProgressMinutes redondea igual al total semanal", () => {
  const sesiones = [
    { fecha: "2026-11-10", minutos: 10.2 },
    { fecha: "2026-11-11", minutos: 10.2 },
    { fecha: "2026-11-12", minutos: 10.2 },
  ];
  // suma 30.6 -> 31
  assert.equal(WeeklyGoalLogic.getWeeklyProgressMinutes(sesiones, "2026-11-15"), 31);
});

test("getWeeklyProgressMinutes trata historial corrupto como vacío y no muta", () => {
  const sesiones = [null, 3, "x", [1], { minutos: 10 }, { fecha: 123, minutos: 10 }];
  const copia = JSON.parse(JSON.stringify(sesiones));
  assert.equal(WeeklyGoalLogic.getWeeklyProgressMinutes(sesiones, "2026-11-11"), 0);
  assert.deepEqual(sesiones, copia);
});

// --- getGoalState / formatGoalSummary ---

test("getGoalState devuelve none sin objetivo válido", () => {
  assert.deepEqual(WeeklyGoalLogic.getGoalState(null, 50), { kind: "none", progress: 50, goal: null, percentForSR: 0, excess: 0 });
  assert.deepEqual(WeeklyGoalLogic.getGoalState(0, 50), { kind: "none", progress: 50, goal: null, percentForSR: 0, excess: 0 });
  assert.deepEqual(WeeklyGoalLogic.getGoalState("300", 50), { kind: "none", progress: 50, goal: null, percentForSR: 0, excess: 0 });
});

test("getGoalState devuelve estados empty-week, in-progress, met y exceeded", () => {
  assert.deepEqual(WeeklyGoalLogic.getGoalState(300, 0), { kind: "empty-week", goal: 300, progress: 0, percentForSR: 0, excess: 0 });
  assert.deepEqual(WeeklyGoalLogic.getGoalState(300, 120), { kind: "in-progress", goal: 300, progress: 120, percentForSR: 40, excess: 0 });
  assert.deepEqual(WeeklyGoalLogic.getGoalState(300, 300), { kind: "met", goal: 300, progress: 300, percentForSR: 100, excess: 0 });
  assert.deepEqual(WeeklyGoalLogic.getGoalState(300, 301), { kind: "exceeded", goal: 300, progress: 301, percentForSR: 100, excess: 1 });
  assert.deepEqual(WeeklyGoalLogic.getGoalState(300, 600), { kind: "exceeded", goal: 300, progress: 600, percentForSR: 100, excess: 300 });
});

test("formatGoalSummary compone textos visibles y SR en español", () => {
  const none = WeeklyGoalLogic.formatGoalSummary(WeeklyGoalLogic.getGoalState(null, 0));
  assert.equal(none.invitation, "Fija un objetivo semanal");

  const empty = WeeklyGoalLogic.formatGoalSummary(WeeklyGoalLogic.getGoalState(300, 0));
  assert.equal(empty.visible, "0 / 300 min");
  assert.equal(empty.status, "Sin sesiones esta semana");
  assert.equal(empty.sr, "0 de 300 minutos (0 %)");

  const progress = WeeklyGoalLogic.formatGoalSummary(WeeklyGoalLogic.getGoalState(300, 120));
  assert.equal(progress.visible, "120 / 300 min");
  assert.equal(progress.status, "");
  assert.equal(progress.sr, "120 de 300 minutos (40 %)");

  const met = WeeklyGoalLogic.formatGoalSummary(WeeklyGoalLogic.getGoalState(300, 300));
  assert.equal(met.status, "Objetivo cumplido");
  assert.equal(met.sr, "300 de 300 minutos (100 %)");

  const exceeded = WeeklyGoalLogic.formatGoalSummary(WeeklyGoalLogic.getGoalState(300, 305));
  assert.equal(exceeded.status, "superado · 5 min por encima");
  assert.equal(exceeded.sr, "305 de 300 minutos (100 %)");
  assert.ok(!exceeded.visible.includes("%"));
});

// --- persistencia: readStoredGoal / writeGoal ---

test("readStoredGoal devuelve null sin almacén o si falla la lectura", () => {
  assert.equal(WeeklyGoalLogic.readStoredGoal(null), null);
  assert.equal(WeeklyGoalLogic.readStoredGoal(undefined), null);
  const roto = {
    getItem() {
      throw new Error("bloqueado");
    },
  };
  assert.equal(WeeklyGoalLogic.readStoredGoal(roto), null);
});

test("readStoredGoal devuelve el objetivo válido guardado", () => {
  const almacen = {
    getItem(clave) {
      return clave === WeeklyGoalLogic.CLAVE_OBJETIVO ? 300 : null;
    },
  };
  assert.equal(WeeklyGoalLogic.readStoredGoal(almacen), 300);
});

test("readStoredGoal acepta la forma canónica en cadena como en localStorage real", () => {
  const almacen = {
    getItem(clave) {
      return clave === WeeklyGoalLogic.CLAVE_OBJETIVO ? "300" : null;
    },
  };
  assert.equal(WeeklyGoalLogic.readStoredGoal(almacen), 300);
  assert.equal(WeeklyGoalLogic.readStoredGoal({ getItem() { return "1"; } }), 1);
  assert.equal(WeeklyGoalLogic.readStoredGoal({ getItem() { return "10080"; } }), 10080);
});

test("readStoredGoal ignora valores inválidos sin borrarlos", () => {
  const invalidos = [
    -30, 0, 12.5, null, {}, NaN, Infinity, 999999,
    "-30", "0", "12.5", "0300", "300.0", "+300", " 300", "300 ", "abc", "999999", "NaN", "Infinity", "", "true"
  ];
  for (const valor of invalidos) {
    let borrado = false;
    const almacen = {
      getItem() {
        return valor;
      },
      removeItem() {
        borrado = true;
      },
      setItem() {},
    };
    assert.equal(WeeklyGoalLogic.readStoredGoal(almacen), null, String(valor));
    assert.equal(borrado, false, "no debe borrar " + String(valor));
  }
});

test("writeGoal guarda un objetivo válido en la clave propia", () => {
  const guardado = {};
  const almacen = {
    getItem() {
      return null;
    },
    setItem(clave, valor) {
      guardado.clave = clave;
      guardado.valor = valor;
    },
    removeItem() {},
  };
  assert.equal(WeeklyGoalLogic.writeGoal(almacen, 300), true);
  assert.equal(guardado.clave, WeeklyGoalLogic.CLAVE_OBJETIVO);
  assert.equal(guardado.valor, "300");
});

test("writeGoal elimina el objetivo con null", () => {
  let eliminada = null;
  const almacen = {
    setItem() {},
    removeItem(clave) {
      eliminada = clave;
    },
    getItem() {
      return 300;
    },
  };
  assert.equal(WeeklyGoalLogic.writeGoal(almacen, null), true);
  assert.equal(eliminada, WeeklyGoalLogic.CLAVE_OBJETIVO);
});

test("writeGoal devuelve false si falla la escritura o el almacén es nulo", () => {
  assert.equal(WeeklyGoalLogic.writeGoal(null, 300), false);
  assert.equal(WeeklyGoalLogic.writeGoal(null, null), false);
  const roto = {
    setItem() {
      throw new Error("sin espacio");
    },
    removeItem() {
      throw new Error("sin espacio");
    },
  };
  assert.equal(WeeklyGoalLogic.writeGoal(roto, 300), false);
  assert.equal(WeeklyGoalLogic.writeGoal(roto, null), false);
});

test("writeGoal rechaza valores inválidos y no escribe", () => {
  const invalidos = [-30, 0, 12.5, "300", {}, NaN, Infinity, 999999];
  for (const valor of invalidos) {
    let escrito = false;
    let eliminado = false;
    const almacen = {
      setItem() {
        escrito = true;
      },
      removeItem() {
        eliminado = true;
      },
      getItem() {
        return null;
      },
    };
    assert.equal(WeeklyGoalLogic.writeGoal(almacen, valor), false, String(valor));
    assert.equal(escrito, false, "no debe escribir " + String(valor));
    assert.equal(eliminado, false, "no debe eliminar " + String(valor));
  }
});

test("writeGoal y readStoredGoal no tocan la clave del historial", () => {
  const historial = JSON.stringify([{ id: 1, fecha: "2026-11-10", tema: "x", minutos: 30 }]);
  const datos = { "diario-de-estudio": historial };
  const almacen = {
    getItem(clave) {
      return Object.prototype.hasOwnProperty.call(datos, clave) ? datos[clave] : null;
    },
    setItem(clave, valor) {
      datos[clave] = valor;
    },
    removeItem(clave) {
      delete datos[clave];
    },
  };

  assert.equal(WeeklyGoalLogic.writeGoal(almacen, 200), true);
  assert.equal(WeeklyGoalLogic.readStoredGoal(almacen), 200);
  assert.equal(datos[WeeklyGoalLogic.CLAVE_OBJETIVO], "200");
  assert.equal(datos["diario-de-estudio"], historial);

  assert.equal(WeeklyGoalLogic.writeGoal(almacen, null), true);
  assert.equal(datos["diario-de-estudio"], historial);
  assert.equal(Object.prototype.hasOwnProperty.call(datos, "diario-de-estudio"), true);
});
