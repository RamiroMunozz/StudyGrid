"use strict";

// Pruebas de la lógica del tema. No tocan el DOM ni el almacenamiento real:
// las funciones reciben un almacén simulado, igual que las de fecha reciben la fecha.
const test = require("node:test");
const assert = require("node:assert");
const ThemeLogic = require("./theme-logic.js");

// Almacén falso que apunta en un registro lo que se le pide.
function almacenFalso(opciones) {
  const config = opciones || {};
  const registro = { leidos: [], escritos: [] };

  const almacen = {
    registro: registro,
    getItem(clave) {
      registro.leidos.push(clave);
      if (config.lanzaAlLeer) {
        throw new Error("bloqueado");
      }
      const valor = config.valor;
      return valor === undefined ? null : valor;
    },
    setItem(clave, valor) {
      registro.escritos.push({ clave: clave, valor: valor });
      if (config.lanzaAlEscribir) {
        throw new Error("cuota llena");
      }
    },
  };

  return almacen;
}

// --- resolverTema: tabla de verdad de la spec (RF-3, RF-7) ---

test("sin preferencia y dispositivo en oscuro abre en oscuro", () => {
  assert.equal(ThemeLogic.resolverTema(null, true), "oscuro");
});

test("sin preferencia y dispositivo en claro abre en claro", () => {
  assert.equal(ThemeLogic.resolverTema(null, false), "claro");
});

test("una preferencia válida manda sobre el dispositivo", () => {
  assert.equal(ThemeLogic.resolverTema("claro", true), "claro");
  assert.equal(ThemeLogic.resolverTema("oscuro", false), "oscuro");
  assert.equal(ThemeLogic.resolverTema("medio", false), "medio");
  assert.equal(ThemeLogic.resolverTema("medio", true), "medio");
});

test("una preferencia inválida se trata como si no existiera", () => {
  const invalidos = ["", "OSCURO", " azul ", "medio ", 7, {}, [], true, undefined];

  invalidos.forEach((valor) => {
    assert.equal(ThemeLogic.resolverTema(valor, true), "oscuro", "valor: " + valor);
    assert.equal(ThemeLogic.resolverTema(valor, false), "claro", "valor: " + valor);
  });
});

test("nunca se deduce el tema medio", () => {
  assert.equal(ThemeLogic.resolverTema(null, true), "oscuro");
  assert.equal(ThemeLogic.resolverTema(null, false), "claro");
});

// --- prefiereOscuro ---

test("prefiereOscuro solo es verdadero con una coincidencia verdadera", () => {
  assert.equal(ThemeLogic.prefiereOscuro(null), false);
  assert.equal(ThemeLogic.prefiereOscuro(undefined), false);
  assert.equal(ThemeLogic.prefiereOscuro({}), false);
  assert.equal(ThemeLogic.prefiereOscuro({ matches: false }), false);
  assert.equal(ThemeLogic.prefiereOscuro({ matches: "true" }), false);
  assert.equal(ThemeLogic.prefiereOscuro({ matches: true }), true);
});

// --- esTemaValido ---

test("esTemaValido acepta solo los tres temas exactos", () => {
  assert.equal(ThemeLogic.esTemaValido("claro"), true);
  assert.equal(ThemeLogic.esTemaValido("oscuro"), true);
  assert.equal(ThemeLogic.esTemaValido("medio"), true);

  ["", "Claro", "CLARO", " claro", "azul", 1, null, undefined, {}, []].forEach((valor) => {
    assert.equal(ThemeLogic.esTemaValido(valor), false, "valor: " + valor);
  });
});

// --- leerTemaGuardado ---

test("leerTemaGuardado devuelve el tema guardado", () => {
  const almacen = almacenFalso({ valor: "medio" });
  assert.equal(ThemeLogic.leerTemaGuardado(almacen), "medio");
  assert.deepEqual(almacen.registro.leidos, [ThemeLogic.CLAVE_TEMA]);
});

test("leerTemaGuardado devuelve nulo si no hay nada guardado", () => {
  assert.equal(ThemeLogic.leerTemaGuardado(almacenFalso({ valor: null })), null);
  assert.equal(ThemeLogic.leerTemaGuardado(almacenFalso({ valor: undefined })), null);
});

test("leerTemaGuardado ignora valores basura", () => {
  [42, "azul", "", "OSCURO", { tema: "oscuro" }].forEach((valor) => {
    assert.equal(ThemeLogic.leerTemaGuardado(almacenFalso({ valor: valor })), null);
  });
});

test("leerTemaGuardado no lanza si el almacenamiento está bloqueado", () => {
  assert.equal(ThemeLogic.leerTemaGuardado(almacenFalso({ lanzaAlLeer: true })), null);
  assert.equal(ThemeLogic.leerTemaGuardado(null), null);
  assert.equal(ThemeLogic.leerTemaGuardado(undefined), null);
});

// --- guardarTema ---

test("guardarTema escribe el tema cuando el almacenamiento funciona", () => {
  const almacen = almacenFalso({});
  assert.equal(ThemeLogic.guardarTema(almacen, "oscuro"), true);
  assert.deepEqual(almacen.registro.escritos, [
    { clave: ThemeLogic.CLAVE_TEMA, valor: "oscuro" },
  ]);
});

test("guardarTema no lanza ni miente si el almacenamiento falla", () => {
  assert.equal(ThemeLogic.guardarTema(almacenFalso({ lanzaAlEscribir: true }), "medio"), false);
  assert.equal(ThemeLogic.guardarTema(null, "medio"), false);
});

test("guardarTema rechaza temas inválidos sin escribir nada", () => {
  const almacen = almacenFalso({});
  ["azul", "", "Claro", 7, null].forEach((valor) => {
    assert.equal(ThemeLogic.guardarTema(almacen, valor), false);
  });
  assert.deepEqual(almacen.registro.escritos, []);
});

// --- Integridad de los datos (RF-10) ---

test("la clave del tema es distinta de la clave del historial", () => {
  assert.equal(ThemeLogic.CLAVE_TEMA, "diario-de-estudio-tema");
  assert.notEqual(ThemeLogic.CLAVE_TEMA, "diario-de-estudio");
});

test("ninguna función escribe en la clave del historial", () => {
  const almacen = almacenFalso({ valor: "medio" });

  ThemeLogic.leerTemaGuardado(almacen);
  ThemeLogic.guardarTema(almacen, "claro");

  const clavesEscritas = almacen.registro.escritos.map((escritura) => escritura.clave);
  assert.deepEqual(clavesEscritas, [ThemeLogic.CLAVE_TEMA]);
});
