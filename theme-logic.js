"use strict";

// Lógica pura del tema: qué tema toca aplicar y cómo se lee o guarda la preferencia.
// No toca el DOM ni usa localStorage directamente: el almacén y la consulta del
// dispositivo se reciben como parámetros, igual que las fechas reciben la fecha.
// Patrón IIFE: global `ThemeLogic` en el navegador y `module.exports` en Node.
(function (global) {
  const CLAVE_TEMA = "diario-de-estudio-tema";
  const TEMAS = ["claro", "oscuro", "medio"];

  // Solo valen los tres nombres exactos: ni mayúsculas, ni espacios, ni otros tipos.
  function esTemaValido(valor) {
    return typeof valor === "string" && TEMAS.indexOf(valor) !== -1;
  }

  // La consulta del sistema es un objeto con `matches`, como el que devuelve
  // matchMedia. Si no existe o está roto, se entiende que no prefiere oscuro.
  function prefiereOscuro(consulta) {
    return Boolean(consulta && consulta.matches === true);
  }

  // Preferencia válida: manda siempre. Sin preferencia: decide el dispositivo,
  // y el tema medio nunca se deduce.
  function resolverTema(preferencia, dispositivoOscuro) {
    if (esTemaValido(preferencia)) {
      return preferencia;
    }
    return dispositivoOscuro === true ? "oscuro" : "claro";
  }

  // Devuelve el tema guardado o nulo. Nunca lanza: un almacén bloqueado,
  // un valor basura o la ausencia de almacén se tratan como "no hay preferencia".
  function leerTemaGuardado(almacen) {
    if (!almacen) {
      return null;
    }

    try {
      const valor = almacen.getItem(CLAVE_TEMA);
      return esTemaValido(valor) ? valor : null;
    } catch (error) {
      return null;
    }
  }

  // Guarda el tema y dice si se pudo. Nunca lanza y nunca escribe un tema inválido.
  function guardarTema(almacen, tema) {
    if (!almacen || !esTemaValido(tema)) {
      return false;
    }

    try {
      almacen.setItem(CLAVE_TEMA, tema);
      return true;
    } catch (error) {
      return false;
    }
  }

  const ThemeLogic = {
    CLAVE_TEMA: CLAVE_TEMA,
    TEMAS: TEMAS,
    esTemaValido: esTemaValido,
    prefiereOscuro: prefiereOscuro,
    resolverTema: resolverTema,
    leerTemaGuardado: leerTemaGuardado,
    guardarTema: guardarTema,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = ThemeLogic;
  } else {
    global.ThemeLogic = ThemeLogic;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
