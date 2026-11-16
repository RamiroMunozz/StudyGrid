"use strict";

// Pegamento entre la lógica del tema y la página: aplica el tema, marca la
// opción activa y guarda la elección. No decide nada: eso es ThemeLogic.
(function () {
  const raiz = document.documentElement;
  const grupo = document.querySelector(".temas");
  const opciones = Array.prototype.slice.call(document.querySelectorAll('input[name="tema"]'));

  // localStorage puede no existir o lanzar al acceder (modo privado, archivo local).
  function obtenerAlmacen() {
    try {
      return window.localStorage;
    } catch (error) {
      return null;
    }
  }

  // La consulta del sistema puede no existir. Si falla, se trata como "sin preferencia".
  function consultaDelSistema() {
    try {
      return window.matchMedia("(prefers-color-scheme: dark)");
    } catch (error) {
      return null;
    }
  }

  function marcarOpcion(tema) {
    opciones.forEach(function (opcion) {
      opcion.checked = opcion.value === tema;
    });
  }

  function aplicarTema(tema) {
    raiz.setAttribute("data-theme", tema);
    marcarOpcion(tema);
  }

  function temaActual() {
    return raiz.getAttribute("data-theme");
  }

  function iniciarTema() {
    const almacen = obtenerAlmacen();
    const tema = ThemeLogic.resolverTema(
      ThemeLogic.leerTemaGuardado(almacen),
      ThemeLogic.prefiereOscuro(consultaDelSistema())
    );

    aplicarTema(tema);

    if (!grupo) {
      return;
    }

    // Un solo escucha para las tres opciones. No se escucha el tema del
    // dispositivo: solo decide al abrir sin preferencia guardada.
    grupo.addEventListener("change", function (evento) {
      const opcion = evento.target;

      if (!opcion || opcion.name !== "tema" || !opcion.checked) {
        return;
      }
      if (!ThemeLogic.esTemaValido(opcion.value) || opcion.value === temaActual()) {
        return;
      }

      aplicarTema(opcion.value);
      ThemeLogic.guardarTema(almacen, opcion.value);
    });
  }

  window.TemaUI = { iniciarTema: iniciarTema };
})();
