# MEMORY.md — Diario de Estudio

Memoria del proyecto entre sesiones. Máximo ~50 líneas.

## Estado actual

- v1.6: racha, mejor racha, semana, mes, confeti, mapa de calor (001) y temas (002).
  Spec 002 cerrada (T1–T9) con revisión PASA CON RESERVAS en
  `specs/002-tema-colors/review.md`.
- Spec 003 — Objetivo semanal: T1–T8 completadas. Lógica en `weekly-goal-logic.js` +
  tests, UI en `weekly-goal-ui.js`, integrada en `app.js`/`index.html`/`styles.css`.
  Objetivo en clave `diario-de-estudio-objetivo` (independiente de historial/tema).
- `node --test` en verde: 88 tests. Datos: `diario-de-estudio`, `diario-de-estudio-tema`,
  `diario-de-estudio-objetivo`.
- `README.md` completo: qué es la app, cómo usarla, cómo abrirla (sin servidor), tests,
  estructura y claves de datos. Título alineado con «Diario de Estudio».

## Decisiones (y por qué)

- Sin backend/dependencias/build; abrir con doble clic (`file://`), sin módulos ES.
- Lógica pura separada, IIFE dual (global navegador + `module.exports` Node).
- Fechas locales a mediodía (`new Date(a,m-1,d,12)`); nunca `toISOString` ni
  `new Date("AAAA-MM-DD")`.
- `app.js` usa `DateUtils` y filtra con `sesionesValidas` (entradas corruptas se ignoran
  al pintar, NO se borran). Cifras (mapa/progreso) se calculan al vuelo.
- Total semanal y progreso del objetivo comparten la misma fuente
  (`WeeklyGoalLogic.getWeeklyProgressMinutes`) para no divergir (lunes-domingo local).
- Objetivo: validación estricta (entero 1–10080, tipo número); valores inválidos guardados
  se ignoran sin borrarlos; fallo de escritura aplica en visita y avisa; confirmar
  explícito (Guardar/Enter), 0 rechazado, vacío/Quitar elimina. Sin celebración propia.
- Tema: `data-theme` en raíz + variables; solo se guarda la elección explícita.

## Aprendizajes y errores a evitar

- Toda lectura de sesiones debe pasar por `sesionesValidas` (`null.fecha` revienta).
- `formatLongDate` devuelve `""` si fecha inválida; `Intl` lanza `RangeError`.
- Mapa: huecos futuros como span sin foco; `.mapa-celda.nivel-N` debe ganar a `button:hover`.
- En navegador, medir viewport real con `emulate` + `evaluate_script` (`scrollWidth` vs
  `innerWidth`), no confiar solo en `resize_page`.
- 002 pendiente: contraste Medio nivel-2/3 justo (1,51:1) y H2 español/inglés (constitución).

## Próximos pasos / verificación manual pendiente

- Spec 003: verificación humana recomendada con Chrome DevTools/lector — cruce de semana en
  app abierta domingo 23:59→lunes 00:01 (<1 min, mecanismo periódico en T7), teclado/lector
  completo, contraste AA en Claro/Oscuro/Medio, movimiento reducido, fallo de escritura y
  almacenamiento bloqueado al leer. Automático: `node --test` 88/88, sin errores de consola
  en flujos probados, sin scroll a 360/320 px y texto 200% (comprobado por script).
- Para empezar de cero: borrar `diario-de-estudio`, `diario-de-estudio-tema`,
  `diario-de-estudio-objetivo`.
