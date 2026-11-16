# Tareas 003 — Objetivo semanal de estudio

Derivan de `spec.md` (aprobada) y `plan.md`. Una tarea cada vez, pruebas en rojo primero y `node --test` en verde antes de pasar a la siguiente. No se avanza con tests en rojo.

Orden de dependencia: T1 → T2 → T3 → T4 → T5 → T6 → T7 → T8 (T1/T2 base de lógica antes de integrar).

## Tareas

- [x] **T1. Crear `weekly-goal-logic.js` con validación y normalización del objetivo.** `RF-1, RF-2, RF-6, RF-8, RF-10, RNF-8`
  - Crear el módulo con IIFE y exportación dual (`WeeklyGoalLogic`), constante `CLAVE_OBJETIVO = "diario-de-estudio-objetivo"` y sin DOM/almacenamiento global.
  - Implementar `isValidGoal(value)` (solo número entero finito 1-10080) y `normalizeGoalInput(raw)` (vacío => quitar, válido => goal, `0` => rechazo "cero", resto inválido => rechazo "rango").
  - Escribir primero `weekly-goal-logic.test.js` cubriendo: válidos 1/10080; inválidos `-30, 0, 12.5, "300", null, objeto, NaN, Infinity, 999999`; normalización de vacío/espacios, válido, 0 y fuera de rango; sin mutación de entradas.
  - Hecho cuando: `node --test weekly-goal-logic.test.js` pasa los casos anteriores en verde y el módulo no usa DOM, `localStorage` directo ni el reloj.

- [x] **T2. Progreso semanal puro y estado del objetivo (misma regla del total semanal).** `RF-2, RF-3, RF-4, RF-5, RF-7, RF-8, RF-11, RNF-8`
  - Añadir `getWeeklyProgressMinutes(sessions, today)`, `getGoalState(goal, progress)` y `formatGoalSummary(state)` (textos visibles en español y texto SR con porcentaje redondeado; sin porcentaje visible).
  - `getWeeklyProgressMinutes` reutiliza exactamente la regla vigente (lunes-domingo local, `fecha <= today`, futuras fuera, minutos finitos > 0, suma por semana y redondeo al entero), tratando historial no lista/corrupto como vacío y sin mutar.
  - Ampliar tests (con `today` fijo): semana vacía => 0; mismo día suma; lunes/domingo incluidos y domingo anterior excluido; cruce de mes/año y 29 de febrero; futuras y minutos inválidos no cuentan; redondeo igual al total semanal; estados none/empty-week/in-progress/met/exceeded con textos `"Objetivo cumplido"`, `"superado · N min por encima"`, `"Sin sesiones esta semana"`, exceso y porcentaje SR.
  - Hecho cuando: `node --test weekly-goal-logic.test.js` pasa en verde y el progreso calculado coincide con los casos esperados del total semanal para las mismas entradas.

- [x] **T3. Persistencia pura del objetivo con almacén inyectado.** `RF-2, RF-6, RF-8, RF-10, RNF-7, RNF-8`
  - Implementar `readStoredGoal(storage)` y `writeGoal(storage, goal)` usando `CLAVE_OBJETIVO`, con try/catch y sin lanzar.
  - Lectura estricta: si falta, falla o el valor no es válido devuelve `null` sin borrar lo almacenado. Escritura: guarda número válido, elimina con `null`, devuelve `false` si falla o el valor es inválido; nunca toca `diario-de-estudio`.
  - Añadir tests con almacén simulado: lectura nula/basura/error/no-borrado; escritura ok, borrado, error de escritura y rechazo de inválidos; clave distinta del historial.
  - Hecho cuando: `node --test weekly-goal-logic.test.js` pasa en verde y las pruebas verifican que la clave del historial no se lee ni se modifica.

- [x] **T4. Integrar el cálculo del progreso en `app.js` sin divergencias ni tocar historial.** `RF-3, RF-7, RF-8, RF-10, RNF-7`
  - Cargar `weekly-goal-logic.js` en `index.html` antes de `app.js` (orden compatible con scripts clásicos) y hacer que el total semanal mostrado use la misma fuente de verdad que el objetivo.
  - Refactor mínimo: `mostrarSemana()`/`minutosDeLaSemana` delega en `WeeklyGoalLogic.getWeeklyProgressMinutes(sesiones, DateUtils.toLocalDateString(new Date()))` (o única implementación compartida) para que `#semana-minutos` y el objetivo sean idénticos.
  - Preparar punto de repintado del objetivo desde `mostrarTodo()`/`iniciar()` sin cambiar la clave ni el formato de `diario-de-estudio`.
  - Hecho cuando: `node --test` sigue en verde; la app abierta con doble clic muestra el mismo total semanal que antes en casos normales y no hay errores en consola.

- [x] **T5. Estructura HTML y estilos del objetivo en la tarjeta de resumen.** `RF-1, RF-2, RF-4, RF-9, RF-11, RNF-2, RNF-3, RNF-9, RNF-10`
  - En `index.html`, dentro de la tarjeta de resumen junto a "Esta semana" (sin tarjeta nueva ni cabecera), añadir: invitación "Fija un objetivo semanal", campo con etiqueta asociada, botón "Guardar objetivo", botón "Quitar" (visible con objetivo), cifra `"X / Y min"`, barra con pista/relleno/borde y contenedor de mensaje/estado propio.
  - Marcar la barra como indicador accesible (`role="progressbar"` o equivalente) con `aria-valuemin/max/now/text`; exponer estado cumplido/superado en texto. El contenedor de avisos del objetivo no reanuncia racha/mejor racha/mes/mapa.
  - En `styles.css`, maquetar el bloque con variables de los tres temas, controles >= 24x24 px, barra con partes medibles y contraste AA (texto y componentes no textuales, relleno distinguible de pista cuando aplica), sin animación de llenado con `prefers-reduced-motion`, y sin desplazamiento horizontal a 360 px/200 %.
  - Hecho cuando: la estructura existe y se ve integrada en Claro/Oscuro/Medio; a 360 px no hay scroll horizontal; los controles son alcanzables y visibles.

- [x] **T6. Implementar `weekly-goal-ui.js`: confirmar, quitar, persistir con aviso y pintar estados.** `RF-1, RF-2, RF-4, RF-5, RF-6, RF-8, RF-9, RF-10, RF-11, RNF-4`
  - Crear UI (IIFE/global) que lea el objetivo guardado con `WeeklyGoalLogic`, pinte estados none/empty-week/in-progress/met/exceeded, y actualice cifra/barra/estado sin recargar.
  - Confirmar con botón "Guardar objetivo" o Enter: valida con lógica pura; rechaza 0 y fuera de rango con mensaje en español sin cambiar el vigente; escribir sin confirmar no cambia nada; campo vacío o "Quitar" elimina la comparación y el valor guardado (y no reaparece al recargar si la escritura es posible).
  - Al confirmar válido reemplaza objetivo y recalcula con el progreso ya acumulado (puede quedar cumplido/superado al instante). Si la escritura falla, aplica en la visita y muestra aviso discreto en español de que no se conservará. No mostrar errores si no había objetivo y se quita.
  - Garantizar que el progreso mostrado usa el mismo número que `#semana-minutos` y que no se modifica `diario-de-estudio`.
  - Hecho cuando: fijar, cambiar y quitar funcionan sin recargar ni perder sesiones; los mensajes/estados corresponden a la spec; no hay errores en consola en los flujos válidos e inválidos.

- [x] **T7. Actualización al guardar y reinicio automático de semana sin recargar.** `RF-2, RF-3, RF-6, RF-7, RF-11, RNF-4, RNF-11`
  - Conectar el repintado del objetivo a `mostrarTodo()`/guardado: sesión en semana en curso suma, sesión antigua/futura/inválida no altera el progreso en curso, guardado tras cruce de semana usa la semana nueva.
  - Implementar comprobación periódica (intervalo < 60 s) mientras la app está abierta: si cambia la semana local respecto al `today` observado, reinicia el progreso a 0 conservando el objetivo y actualiza cifra/barra/estado sin recargar ni intervención del usuario.
  - Hecho cuando: el progreso se actualiza en < 100 ms al guardar/cambiar objetivo; el objetivo se conserva al borrar todas las sesiones (progreso 0); la lógica de semana es verificable con `today` inyectado y el mecanismo periódico queda listo para verificación manual del cruce domingo 23:59→lunes 00:01 (< 1 min).

- [x] **T8. Verificación manual, no regresión, docs y cierre.** `RF-1 a RF-11, RNF-1 a RNF-11`
  - Ejecutar checklist manual con Chrome DevTools: 360 px/320 px y texto al 200 % sin scroll; teclado (campo, Guardar, Quitar, Enter), lector de pantalla (valor/porcentaje SR y estado sin reanunciar racha/mejor racha/mes/mapa), contraste AA en Claro/Oscuro/Medio, movimiento reducido sin animación de barra, aviso discreto ante fallo de escritura, persistencia/recarga y caso de almacenamiento bloqueado al leer.
  - Verificar manualmente el cruce de semana en app abierta (domingo 23:59 → lunes 00:01, tolerancia < 1 min) y que guardar tras el cruce no muestra la semana anterior.
  - Comprobar no regresión: racha, mejor racha, mes, mapa y confeti de récord intactos; `diario-de-estudio` idéntico en formato/contenido salvo operaciones normales de sesión; sin errores en consola; funciona con doble clic (`file://`).
  - Hecho cuando: `node --test` completo en verde; checklist de §9 de la spec cumplida o documentada con verificaciones manuales humanas pendientes; `MEMORY.md` actualizado con estado/decisiones de la spec 003.

## Cobertura RF → tareas

| RF/RNF | Tareas |
| --- | --- |
| RF-1 Fijar objetivo | T1, T5, T6 |
| RF-2 Cambiar/quitar | T1, T2, T3, T5, T6, T7 |
| RF-3 Progreso = total semanal | T2, T4, T7 |
| RF-4 Mostrar progreso/barra | T2, T5, T6 |
| RF-5 Cumplido/superado | T2, T6 |
| RF-6 Persistencia y reinicio | T1, T3, T6, T7 |
| RF-7 Actualización sin recargar | T2, T4, T6, T7 |
| RF-8 Valores inválidos/almacenamiento | T1, T2, T3, T4, T6 |
| RF-9 Accesibilidad | T5, T6, T8 |
| RF-10 No toca historial | T1, T3, T4, T6, T8 |
| RF-11 Sin objetivo / semana vacía | T2, T5, T6, T7 |
| RNF-8 (tests, hoy inyectado) | T1, T2, T3, T8 |

Total: 8 tareas (≤ 10). No se propone dividir la spec.
