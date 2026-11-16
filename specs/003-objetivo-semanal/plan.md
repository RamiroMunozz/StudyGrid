# Plan 003 — Objetivo semanal de estudio

Estado: activo (deriva de `spec.md`, aprobada)

## 1. Cobertura de requisitos

| Requisito | Dónde se resuelve |
| --- | --- |
| RF-1 | Control y confirmación en `index.html` + `weekly-goal-ui.js`; validación/estado en `weekly-goal-logic.js` |
| RF-2 | Acciones "Guardar objetivo"/Enter, "Quitar" y campo vacío en `weekly-goal-ui.js`; recálculo inmediato en `weekly-goal-logic.js` |
| RF-3 | `getWeeklyProgressMinutes` en `weekly-goal-logic.js` reutilizando exactamente la regla del total semanal (misma lógica que `minutosDeLaSemana` de `app.js`) con `today` inyectado |
| RF-4 | Render de cifra, barra, pista/relleno y texto de estado en `index.html` + `weekly-goal-ui.js` + `styles.css` |
| RF-5 | `getGoalState` y textos en `weekly-goal-logic.js`; render sin celebración en `weekly-goal-ui.js` |
| RF-6 | `CLAVE_OBJETIVO = "diario-de-estudio-objetivo"`, `readStoredGoal`/`writeGoal` en `weekly-goal-logic.js`; aviso discreto en `weekly-goal-ui.js` |
| RF-7 | Recalcular al abrir/guardar/cambiar objetivo y comprobación periódica de semana abierta en `weekly-goal-ui.js` (manual); lógica pura con `today` inyectado |
| RF-8 | Validación estricta de lectura y tolerancia a historial/almacén en `weekly-goal-logic.js` y `app.js` |
| RF-9 | Marcado accesible (progreso, etiquetas, teclado, `role="alert"`/`aria-live` limitado al objetivo) en HTML/UI/CSS |
| RF-10 | Clave propia, sin cambios al historial ni a sus objetos en lógica/UI |
| RF-11 | Estados "sin objetivo" y "semana vacía" en `weekly-goal-logic.js` + `weekly-goal-ui.js` |
| RNF-1..11 | Sin dependencias/build/red; `node --test`; responsive 360 px/200 %; contraste AA 3 temas; reinicio periódico < 1 min verificado manualmente |

## 2. Archivos y responsabilidades

- **`weekly-goal-logic.js`** *(nuevo, crear con aprobación previa)*
  - Funciones puras y constantes del objetivo semanal. Sin DOM ni `localStorage` global.
  - IIFE con exportación dual (global `WeeklyGoalLogic` en navegador, `module.exports` en Node), igual que `DateUtils`/`HeatmapLogic`/`ThemeLogic`.
  - Responsabilidad: validar objetivo, leer/escribir preferencia con almacén inyectado, calcular progreso semanal con `today` inyectado reutilizando la regla existente, derivar estado/textos accesibles. (RF-1..RF-8, RF-10, RF-11, RNF-8)

- **`weekly-goal-logic.test.js`** *(nuevo, crear con aprobación previa)*
  - Pruebas con `node --test` de la lógica pura, con `today` fijo y almacén simulado. (RNF-8)

- **`weekly-goal-ui.js`** *(nuevo, crear con aprobación previa)*
  - Pegamento con la página: pinta objetivo/progreso en la tarjeta de resumen, gestiona confirmar/quitar, guarda con aviso discreto si falla la escritura, expone `renderWeeklyGoal(sessions, today)` y `startWeeklyGoalUI(...)`/comprobación periódica de cambio de semana (< 1 min, sin recarga). No recalcula reglas de negocio: usa `WeeklyGoalLogic` y el progreso ya calculado. (RF-1, RF-2, RF-4, RF-5, RF-6 aviso, RF-7 UI, RF-9, RF-11)

- **`index.html`** *(modificado)*
  - Dentro de `.tarjeta.resumen`, junto al bloque "Esta semana", añade el bloque del objetivo: invitación, campo con etiqueta, botón "Guardar objetivo", botón "Quitar", cifra, barra de progreso accesible y zona de mensaje/aviso limitada al objetivo. Mantiene la cifra de minutos semanal existente (`#semana-minutos`).
  - Carga `weekly-goal-logic.js` y `weekly-goal-ui.js` antes de `app.js`.
  - Sin tarjeta nueva ni control en cabecera. (RF-1, RF-2, RF-4, RF-9, RF-11)

- **`styles.css`** *(modificado)*
  - Estilos del bloque objetivo dentro de resumen (cifra, barra con pista/relleno/borde, controles, estados) usando variables de los tres temas.
  - `prefers-reduced-motion: reduce` sin animación de llenado; contraste AA de texto y componentes no textuales; responsive 360 px/200 % sin scroll horizontal; área táctil >= 24x24 px. (RF-4, RF-9, RNF-2, RNF-3, RNF-9, RNF-10)

- **`app.js`** *(modificado)*
  - Integra el objetivo sin tocar historial: en `iniciar` arranca la UI del objetivo; en `mostrarSemana`/`mostrarTodo` obtiene `hoy` local y pasa a la UI el progreso semanal y sesiones para que coincida con el total mostrado.
  - Refactor mínimo para no duplicar lógica divergente: extrae/reusa una función pura o delega en `WeeklyGoalLogic.getWeeklyProgressMinutes(sesiones, hoy)` de modo que `#semana-minutos` y el progreso del objetivo usen exactamente el mismo cálculo/regla. Sigue calculando al vuelo y sin guardar progreso.
  - Al guardar sesión recalcula y repinta (incluido cruce de semana) sin recargar; no modifica formato/clave de `diario-de-estudio`. (RF-2, RF-3, RF-7, RF-8, RF-10)

- **`MEMORY.md`** *(modificado, al cerrar implementación)*
  - Estado, decisiones y verificación de spec 003.

No se crean dependencias, ni `package.json`, ni build. No se cambia `date-utils.js` ni la lógica del mapa/confeti/racha.

## 3. Funciones puras (lógica sin DOM ni almacenamiento global)

Todas reciben sus dependencias (`today`, `storage`) y trabajan en hora local vía `DateUtils`; no leen el reloj ni `localStorage` directamente salvo a través del `storage` inyectado.

| Función | Firma (conceptual) | Responsabilidad | RF |
| --- | --- | --- | --- |
| `CLAVE_OBJETIVO` | constante `"diario-de-estudio-objetivo"` | Clave propia, distinta de historial y tema. | RF-6, RF-10 |
| `isValidGoal(value)` | `value -> boolean` | Válido solo si es `number`, entero, finito, `>=1` y `<=10080`. Rechaza `0`, decimales, negativos, cadenas (`"300"`), `null`, objetos, `NaN`, `Infinity`, fuera de rango. | RF-1, RF-6, RF-8 |
| `normalizeGoalInput(raw)` | `raw -> { ok, goal } | { ok:false, reason }` | Interpreta confirmación: vacío/solo espacios => quitar (`goal:null, ok:true` con marca de quitar); valor numérico entero en rango => `goal`; `0` o fuera de rango/formato no entero-numérico => rechazo con motivo para mensaje en español. No muta estado. | RF-1, RF-2 |
| `readStoredGoal(storage)` | `storage -> number|null` | Lee la clave; si no hay storage, falla lectura o valor no pasa `isValidGoal`, devuelve `null` sin lanzar y **sin borrar** el valor almacenado. | RF-6, RF-8 |
| `writeGoal(storage, goal)` | `storage, goal|null -> boolean` | Si `goal` es `null` elimina la clave; si es válido la guarda como número. Envuelto en try/catch, devuelve éxito sin lanzar. Nunca toca `diario-de-estudio`. | RF-2, RF-6, RF-10 |
| `getWeeklyProgressMinutes(sessions, today)` | `(sessions, "AAAA-MM-DD") -> number` | Calcula minutos de la semana en curso (lunes-domingo local) con **exactamente** la misma regla que `minutosDeLaSemana`: filtra sesiones válidas/legibles según regla actual, incluye solo `inicio <= fecha <= fin` y `fecha <= today`, ignora futuras y minutos no numéricos o `<= 0`, suma todas las del día y redondea el total al entero más cercano. Si historial no es lista válida o no legible, trata como vacío (0). No muta sesiones ni las guarda. | RF-3, RF-7, RF-8, RF-10, RF-11 |
| `getGoalState(goal, progressMinutes)` | `(number|null, number) -> state` | Devuelve estado derivado: `kind` = `"none"|"empty-week"|"in-progress"|"met"|"exceeded"`, `progress`, `goal`, `percentForSR` (0-100, redondeado al entero más cercano, limitado a 100 para el valor actual expuesto), `excess`. `met` si iguales, `exceeded` si mayor, `empty-week` si hay objetivo y progreso 0, `in-progress` si 0 < progreso < objetivo. | RF-4, RF-5, RF-11 |
| `formatGoalSummary(state)` | `state -> texts` | Compone textos en español: visible (`"120 / 300 min"`, `"Objetivo cumplido"`, `"superado · N min por encima"`, `"Sin sesiones esta semana"`, invitación `"Fija un objetivo semanal"` cuando `none`) y texto SR (`"120 de 300 minutos (40 %)"`). Sin porcentaje en texto visible. | RF-4, RF-5, RF-9, RF-11 |

Notas de cálculo:
- `getWeeklyProgressMinutes` debe producir el **mismo número** que `#semana-minutos`. Para evitar divergencia, `app.js` usará esta función (o una única implementación compartida) tanto para la tarjeta semanal como para el objetivo.
- `percentForSR = goal > 0 ? Math.min(100, Math.round(progress / goal * 100)) : 0`; el valor actual accesible de la barra se limita al máximo (objetivo) y el exceso se comunica por texto.

## 4. Algoritmo (pseudocódigo)

```text
FUNCIÓN isValidGoal(value)
  devolver typeof value == "number" y Number.isInteger(value)
           y Number.isFinite(value) y value >= 1 y value <= 10080

FUNCIÓN normalizeGoalInput(raw)
  texto <- recortar(raw)
  si texto == "": devolver { ok: true, remove: true, goal: null }
  numero <- Number(texto)
  si no es entero finito de tipo numérico válido para el campo: devolver { ok: false, reason: "rango" }
  si numero == 0: devolver { ok: false, reason: "cero" }
  si no isValidGoal(numero): devolver { ok: false, reason: "rango" }
  devolver { ok: true, remove: false, goal: numero }

FUNCIÓN getWeeklyProgressMinutes(sessions, today)
  si sessions no es lista: lista <- [] si no lista <- sessions
  inicio <- DateUtils.startOfWeek(today)
  fin <- DateUtils.shiftDate(inicio, 6)
  total <- 0
  para cada sesion en lista (misma tolerancia de lectura que el total semanal actual):
    si sesion no es objeto legible o fecha no es string: continuar
    si fecha < inicio o fecha > fin o fecha > today: continuar
    minutos <- Number(sesion.minutos)
    si minutos es finito y > 0: total <- total + minutos
  devolver Math.round(total)

FUNCIÓN getGoalState(goal, progress)
  si no isValidGoal(goal): devolver { kind:"none", progress }
  si progress <= 0: devolver { kind:"empty-week", goal, progress:0 }
  si progress == goal: devolver { kind:"met", goal, progress }
  si progress > goal: devolver { kind:"exceeded", goal, progress, excess: progress-goal }
  devolver { kind:"in-progress", goal, progress }

AL ARRANCAR UI (app abierta)
  almacen <- localStorage si accesible, si no null
  objetivoVigente <- readStoredGoal(almacen)
  hoyVisto <- DateUtils.toLocalDateString(new Date())
  pintarResumenYObjetivo(sesiones, hoyVisto, objetivoVigente)
  cada ~30 s (o intervalo < 60 s): 
    hoyAhora <- fecha local actual
    si startOfWeek(hoyAhora) != startOfWeek(hoyVisto):
      hoyVisto <- hoyAhora
      repintar con progreso de la semana nueva (objetivo se conserva)

AL CONFIRMAR (botón "Guardar objetivo" o Enter en campo)
  res <- normalizeGoalInput(valorCampo)
  si !res.ok: mostrar mensaje de error en español (rango / cero) y NO cambiar objetivo vigente
  si res.remove: objetivoVigente <- null; ok <- writeGoal(almacen,null); si !ok avisar discreto
  si res.ok y !res.remove: objetivoVigente <- res.goal; ok <- writeGoal(almacen,res.goal); si !ok avisar discreto
  repintar con hoy actual (progreso acumulado de la semana, RF-2)

AL QUITAR (botón "Quitar")
  equivalente a confirmar vacío

AL GUARDAR SESIÓN
  hoy <- fecha local actual
  recalcular progreso con getWeeklyProgressMinutes(sesiones, hoy) y repintar
  (el total semanal #semana-minutos y el objetivo muestran el mismo número)
```

La comprobación periódica (temporizador) es parte de UI/integración y se verifica manualmente (RNF-11); la detección de semana y el progreso son verificables con `today` inyectado en tests.

## 5. Interfaz

- **Ubicación:** dentro de la tarjeta `resumen` (`.tarjeta.resumen`), en el bloque "Esta semana" o inmediatamente asociado a él, sin tarjeta nueva ni control en cabecera. La cifra semanal `#semana-minutos` sigue siendo la fuente visible del total.
- **Sin objetivo:** mostrar minutos de la semana como hoy + invitación "Fija un objetivo semanal" + control visible (campo con etiqueta, botón "Guardar objetivo"). Sin barra ni comparación.
- **Con objetivo:** mostrar `"X / Y min"` (mismo X que total semanal), barra con pista/relleno (y borde si aplica) proporcional y limitada al 100%, estado en texto: progreso normal, `"Objetivo cumplido"` o `"superado · N min por encima"`. Sin porcentaje visible; porcentaje solo en texto para SR.
- **Controles:** campo numérico/entrada con etiqueta asociada, botón "Guardar objetivo", botón "Quitar" visible solo con objetivo. Enter en campo = confirmar. Confirmar vacío = quitar. Orden de tabulación lógico.
- **Barra accesible:** `role="progressbar"` (o `<progress>` equivalente) con `aria-valuemin="0"`, `aria-valuemax=objetivo`, `aria-valuenow=min(progreso,objetivo)` y `aria-valuetext`/texto SR con `"120 de 300 minutos (40 %)"` (porcentaje redondeado al entero). Estado cumplido/superado expuesto en texto.
- **Región viva limitada:** mensajes/avisos/estado del objetivo en un contenedor propio con anuncio apropiado (p.ej. `aria-live="polite"` o `role="alert"` para errores) sin reanunciar racha, mejor racha, días del mes ni mapa (no tocar sus regiones).
- **Estilos:** variables de tema para pista, relleno, borde, texto y controles; relleno distinguible de pista >= 3:1 cuando 0 < progreso < objetivo; estados cumplido/superado distinguidos por texto. Sin animación de llenado con `prefers-reduced-motion`. A 360 px y 200 % sin desplazamiento horizontal.

## 6. Decisiones técnicas y alternativas descartadas

| Decisión | Alternativa descartada | Por qué |
| --- | --- | --- |
| Nuevo módulo puro `weekly-goal-logic.js` + UI separada, IIFE dual | Meter todo en `app.js` | Constitución 3 y 4: lógica testeable con `node --test` sin DOM; patrón ya usado en el proyecto. |
| `getWeeklyProgressMinutes` como fuente única y refactor de `minutosDeLaSemana` para delegar en ella | Mantener dos cálculos "parecidos" | RF-3 exige que el progreso coincida siempre con el total semanal; una sola implementación evita divergencias de redondeo/filtros. |
| Validación estricta de lectura (`number` entero 1-10080) y no borrar inválidos | Limpiar al leer o aceptar `"300"` | RF-6/RF-8 y spec: datos ambiguos se ignoran sin destruirlos; el usuario corrige fijando uno nuevo. |
| Confirmación explícita (botón/Enter) y no guardar al escribir | Guardar en `input`/blur | RF-1 y decisión de spec: comportamiento observable y sin cambios accidentales. |
| Temporizador corto en UI para detectar cambio de semana y repintar con `today` actual | Solo al cargar/guardar o al volver a pestaña | RF-7/RNF-11: tolerancia < 1 min con app abierta domingo 23:59→lunes 00:01; la lógica sigue siendo pura por `today` inyectado. |
| Barra con `aria-valuenow` limitado al máximo y exceso/porcentaje en texto | Barra que desborda o porcentaje solo visual | RF-4/RF-5/RF-9 y decisiones: sin desbordes a 360 px, SR recibe valor real y porcentaje. |
| Aviso discreto en español si falla escritura pero aplicar en visita | Fallar en silencio o bloquear uso | RF-6: el objetivo parece guardado y perderlo en silencio rompe confianza, pero no debe impedir usarlo ni registrar sesiones. |
| Sin estado persistido de cumplimiento/celebración ni confeti | Reutilizar confeti de racha | RF-5 y relación con 001/002: no mezclar significados ni añadir estado por semana. |

## 7. Estrategia de tests (`node --test`)

**Automatizable (`weekly-goal-logic.test.js`, con `today` fijo y almacén simulado):**
- `isValidGoal`: acepta 1 y 10080; rechaza `0`, `-30`, `12.5`, `"300"`, `null`, objeto, `NaN`, `Infinity`, `999999` y tipos no numéricos.
- `normalizeGoalInput`: vacío/espacios => quitar; valor válido => goal; `0` => rechazo "cero"; fuera de rango/no entero => rechazo "rango". No muta nada.
- `readStoredGoal`: almacén nulo/que lanza/valor inválido => `null` sin lanzar y sin borrar (el mock puede verificar que no se llamó a borrar). Valor válido => número.
- `writeGoal`: guarda válido, borra con `null`, almacén que lanza o tema inválido => `false` sin lanzar; nunca toca clave de historial.
- `getWeeklyProgressMinutes` (misma regla que total semanal): historial vacío => 0; suma varias sesiones del mismo día; lunes y domingo incluidos, domingo anterior excluido; semana que cruza mes/año y 29 de febrero; sesión futura no cuenta; minutos no numéricos/<=0 ignorados; redondeo igual al total semanal; sesiones de semana vieja no cuentan; historial no lista/corrupto tratado como vacío; no muta la lista.
- `getGoalState` / textos: sin objetivo, semana vacía con objetivo, en progreso, cumplido exacto, superado (exceso 1 y exceso grande), objetivo 1/min 1, barra limitada al 100%; porcentaje SR redondeado; textos en español (`"Objetivo cumplido"`, `"superado · N min por encima"`, `"Sin sesiones esta semana"`).

**No automatizable / manual (Chrome DevTools):**
- UI: confirmar con botón y con Enter, escribir sin confirmar no cambia, quitar con botón y con campo vacío, recálculo inmediato sin recargar, a 360 px y 200 % sin scroll, teclado/foco/orden, lector de pantalla (anuncia valor/estado del objetivo sin reanunciar racha/mejor racha/mes/mapa), contraste AA en Claro/Oscuro/Medio, `prefers-reduced-motion` sin animación de barra.
- RF-7 periódico: app abierta pasando domingo 23:59 → lunes 00:01 actualiza a 0 con objetivo conservado sin recargar y con tolerancia < 1 min (simulando reloj/cruce).
- Persistencia: recarga conserva objetivo; borrado de historial conserva objetivo (progreso 0); borrado de objetivo conserva historial; almacenamiento que rechaza escritura muestra aviso discreto pero aplica en visita.
- No regresión: racha, mejor racha, mes, mapa y confeti de récord intactos.

**Regla:** escribir/ajustar tests en rojo antes de implementar lógica, `node --test` en verde antes de pasar a la siguiente tarea.

## 8. Riesgos conocidos

- **Divergencia con el total semanal:** hoy `minutosDeLaSemana` vive en `app.js`; el refactor debe dejar una única regla compartida o delegar en la función pura para que `#semana-minutos` y el objetivo no difieran.
- **Anuncio duplicado en la tarjeta de resumen:** la tarjeta ya es `aria-live`; el objetivo debe limitar sus anuncios a su propio contenedor/mensajes (RF-9).
- **Temporizador y tolerancia < 1 min:** requiere intervalo corto y cálculo con `today` actual en cada tick; la verificación del cruce real es manual.
- **Alcance > 10 tareas:** si al detallar implementación/UI aparecen más de 10 tareas, se debe dividir (p.ej. lógica+tests / integración+UI / accesibilidad+verificación) antes de implementar.