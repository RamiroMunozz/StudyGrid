"use strict";

const CLAVE_ALMACEN = "diario-de-estudio";

const formulario = document.getElementById("formulario");
const campoFecha = document.getElementById("fecha");
const campoTema = document.getElementById("tema");
const campoMinutos = document.getElementById("minutos");
const mensajeError = document.getElementById("error");
const lista = document.getElementById("lista");
const textoVacio = document.getElementById("vacio");
const numeroRacha = document.getElementById("racha-numero");
const textoRacha = document.getElementById("racha-texto");
const numeroMejorRacha = document.getElementById("mejor-racha-numero");
const textoMejorRacha = document.getElementById("mejor-racha-texto");
const numeroSemana = document.getElementById("semana-minutos");
const numeroMes = document.getElementById("mes-dias");
const textoMes = document.getElementById("mes-unidad");

let sesiones = cargarSesiones();

iniciar();

function iniciar() {
  TemaUI.iniciarTema();

  const hoy = DateUtils.toLocalDateString(new Date());
  campoFecha.value = hoy;
  campoFecha.max = hoy;

  formulario.addEventListener("submit", alEnviar);
  mostrarTodo();
}

function alEnviar(evento) {
  evento.preventDefault();

  const fecha = campoFecha.value;
  const tema = campoTema.value.trim();
  const minutos = Number(campoMinutos.value);

  if (fecha === "" || tema === "" || !(minutos > 0)) {
    mostrarError("Completa todos los campos. El tema es obligatorio y los minutos deben ser mayores que 0.");
    return;
  }

  ocultarError();

  const mejorAntes = calcularMejorRacha(sesiones);

  sesiones.push({
    id: Date.now(),
    fecha: fecha,
    tema: tema,
    minutos: minutos,
  });

  guardarSesiones();

  formulario.reset();
  campoFecha.value = DateUtils.toLocalDateString(new Date());
  campoTema.focus();
  mostrarTodo();

  if (calcularRacha(sesiones) > mejorAntes) {
    lanzarConfeti();
  }
}

function mostrarTodo() {
  const hoy = DateUtils.toLocalDateString(new Date());
  mostrarRacha();
  mostrarSemana();
  mostrarMes();
  mostrarSesiones();
  renderHeatmap(sesiones);
  repintarObjetivoSemanal(hoy);
}

// Punto de repintado preparado para la UI del objetivo (T6+), sin cambiar el historial.
function repintarObjetivoSemanal(hoy) {
  if (
    typeof WeeklyGoalUI !== "undefined" &&
    WeeklyGoalUI !== null &&
    typeof WeeklyGoalUI.renderWeeklyGoal === "function"
  ) {
    WeeklyGoalUI.renderWeeklyGoal(sesiones, hoy);
  }
}

function mostrarRacha() {
  const racha = calcularRacha(sesiones);
  const mejorRacha = calcularMejorRacha(sesiones);

  numeroRacha.textContent = racha;
  textoRacha.textContent = racha === 1 ? "día seguido" : "días seguidos";

  numeroMejorRacha.textContent = mejorRacha;
  textoMejorRacha.textContent = mejorRacha === 1 ? "día" : "días";
}

function mostrarSemana() {
  const total = minutosDeLaSemana(sesiones);
  numeroSemana.textContent = total.toLocaleString("es-ES");
}

function mostrarMes() {
  const dias = diasDelMes(sesiones);
  numeroMes.textContent = dias;
  textoMes.textContent = dias === 1 ? "día" : "días";
}

function mostrarSesiones() {
  // De la más reciente a la más antigua (y dentro del mismo día, la última apuntada primero).
  const ordenadas = sesionesValidas(sesiones).sort((a, b) => {
    if (a.fecha !== b.fecha) {
      return a.fecha < b.fecha ? 1 : -1;
    }
    return b.id - a.id;
  });

  lista.replaceChildren();
  textoVacio.hidden = ordenadas.length > 0;

  ordenadas.forEach((sesion) => {
    const elemento = document.createElement("li");
    elemento.className = "sesion";

    const info = document.createElement("div");

    const tema = document.createElement("p");
    tema.className = "sesion-tema";
    tema.textContent = sesion.tema;

    const fecha = document.createElement("p");
    fecha.className = "sesion-fecha";
    fecha.textContent = DateUtils.formatLongDate(sesion.fecha);

    info.append(tema, fecha);

    const minutos = document.createElement("span");
    minutos.className = "sesion-minutos";
    minutos.textContent = sesion.minutos + " min";

    elemento.append(info, minutos);
    lista.append(elemento);
  });
}

function calcularRacha(listaDeSesiones) {
  const dias = new Set(sesionesValidas(listaDeSesiones).map((sesion) => sesion.fecha));
  const hoy = DateUtils.toLocalDateString(new Date());

  // Si hoy aún no hay sesión, la racha se cuenta desde ayer:
  // no se rompe hasta que termina el día.
  let dia = dias.has(hoy) ? hoy : DateUtils.shiftDate(hoy, -1);

  let racha = 0;
  while (dias.has(dia)) {
    racha += 1;
    dia = DateUtils.shiftDate(dia, -1);
  }
  return racha;
}

// Mejor racha: la secuencia más larga de días consecutivos con sesión.
// Incluye la racha en curso e ignora las fechas futuras.
function calcularMejorRacha(listaDeSesiones) {
  const hoy = DateUtils.toLocalDateString(new Date());

  const dias = [
    ...new Set(
      sesionesValidas(listaDeSesiones)
        .map((sesion) => sesion.fecha)
        .filter((dia) => typeof dia === "string" && dia <= hoy)
    ),
  ].sort();

  let mejor = 0;
  let racha = 0;
  let anterior = "";

  for (const dia of dias) {
    if (anterior !== "" && DateUtils.shiftDate(anterior, 1) === dia) {
      racha += 1;
    } else {
      racha = 1;
    }

    if (racha > mejor) {
      mejor = racha;
    }

    anterior = dia;
  }

  return mejor;
}

// Suma los minutos de las sesiones de la semana actual (lunes a domingo).
// Delegada en WeeklyGoalLogic para compartir la misma fuente de verdad que el objetivo.
function minutosDeLaSemana(listaDeSesiones) {
  const hoy = DateUtils.toLocalDateString(new Date());
  return WeeklyGoalLogic.getWeeklyProgressMinutes(listaDeSesiones, hoy);
}

// Cuenta los días distintos con al menos una sesión en el mes actual.
// Las sesiones futuras no cuentan y varias el mismo día suman un solo día.
function diasDelMes(listaDeSesiones) {
  const hoy = DateUtils.toLocalDateString(new Date());
  const mes = hoy.slice(0, 7);

  const dias = sesionesValidas(listaDeSesiones)
    .map((sesion) => sesion.fecha)
    .filter((dia) => typeof dia === "string")
    .filter((dia) => dia.slice(0, 7) === mes && dia <= hoy);

  return new Set(dias).size;
}

// Entradas corruptas del historial (null, números, textos, objetos sin fecha) se
// ignoran al pintar, pero no se borran: lo guardado en localStorage no se toca.
function sesionesValidas(listaDeSesiones) {
  return listaDeSesiones.filter(
    (sesion) =>
      sesion !== null &&
      typeof sesion === "object" &&
      !Array.isArray(sesion) &&
      typeof sesion.fecha === "string"
  );
}

function cargarSesiones() {
  try {
    const datos = localStorage.getItem(CLAVE_ALMACEN);
    const listaGuardada = datos ? JSON.parse(datos) : [];
    return Array.isArray(listaGuardada) ? listaGuardada : [];
  } catch (error) {
    return [];
  }
}

function guardarSesiones() {
  localStorage.setItem(CLAVE_ALMACEN, JSON.stringify(sesiones));
}

function mostrarError(texto) {
  mensajeError.textContent = texto;
  mensajeError.hidden = false;
}

function ocultarError() {
  mensajeError.textContent = "";
  mensajeError.hidden = true;
}

// Lanza una ráfaga de confeti cuando la racha actual supera el récord anterior.
function lanzarConfeti() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  // Si ya hay una ráfaga en marcha, la quitamos para no apilar capas.
  document.querySelectorAll(".confeti").forEach((capa) => capa.remove());

  const contenedor = document.createElement("div");
  contenedor.className = "confeti";
  contenedor.setAttribute("aria-hidden", "true");

  // Cada pieza toma su color de una variable del tema, así también cambia
  // si el tema se cambia con la ráfaga en el aire.
  const colores = ["--confeti-1", "--confeti-2", "--confeti-3", "--confeti-4", "--confeti-5"];
  const cantidad = window.innerWidth < 600 ? 45 : 70;

  for (let i = 0; i < cantidad; i += 1) {
    const pieza = document.createElement("span");
    pieza.className = "confeti-pieza";

    const duracion = 1.8 + Math.random() * 1.1;
    const retraso = Math.random() * 0.4;

    pieza.style.setProperty("--x", Math.random() * 100 + "%");
    pieza.style.setProperty("--deriva", Math.round(Math.random() * 160 - 80) + "px");
    pieza.style.setProperty("--giro", Math.round(Math.random() * 720 + 360) + "deg");
    pieza.style.setProperty("--color", "var(" + colores[i % colores.length] + ")");
    pieza.style.setProperty("--ancho", Math.round(6 + Math.random() * 5) + "px");
    pieza.style.setProperty("--alto", Math.round(8 + Math.random() * 7) + "px");
    pieza.style.setProperty("--duracion", duracion.toFixed(2) + "s");
    pieza.style.setProperty("--retraso", retraso.toFixed(2) + "s");

    contenedor.append(pieza);
  }

  document.body.append(contenedor);

  setTimeout(() => {
    contenedor.remove();
  }, 3500);
}
