# Plan 001 — Mapa de calor de estudio

> Documento de planificación. No contiene código de implementación.
> Constitución aplicable: `docs/constitucion.md` (citada como `docs/constitution.md` en
> `AGENTS.md`). Spec: `specs/001-heat-map/spec.md`.

## 1. Resumen

Se añade una sección de mapa de calor con las últimas 12 semanas. La lógica de fechas,
agregación y niveles vive en módulos puros, sin DOM ni localStorage, y recibe `today` como
parámetro. La interfaz solo consume el modelo calculado y pinta botones, etiquetas, leyenda
y globo. Los datos guardados no cambian de formato ni de clave.

La implementación se hará sin dependencias, sin build y sin módulos ES: scripts clásicos
que funcionan con `file://`, y tests con `node --test`.

## 2. Archivos

| Archivo | Acción | Responsabilidad | RF / RNF |
|---|---|---|---|
| `index.html` | Modificar | Añadir la sección del mapa (título, fila de meses, cuadrícula, leyenda y globo) y cargar los scripts en orden. | RF-1, RF-4, RF-5, RF-6, RF-9; RNF-2 |
| `styles.css` | Modificar | Cuadrícula 12×7, etiquetas, leyenda, cinco niveles de color, foco visible, globo y adaptación a 360 px. Sin animaciones. | RF-3, RF-4, RF-5, RF-7; RNF-2, RNF-3 |
| `date-utils.js` | Crear | Funciones puras de fecha local: validar, formatear, desplazar días e inicio de semana. Sin DOM ni localStorage. Exportación compatible con navegador y Node. | RF-1, RF-5, RF-10; RNF-5 |
| `heatmap-logic.js` | Crear | Lógica pura del mapa: validar sesiones, sumar minutos por día, asignar niveles, construir las 12 semanas, marcar meses y componer el texto del globo. Recibe `today`. | RF-1, RF-2, RF-3, RF-5, RF-6, RF-9, RF-10; RNF-5, RNF-8 |
| `heatmap-ui.js` | Crear | Renderizar la cuadrícula, etiquetas, leyenda y globo; gestionar eventos de ratón, teclado y tacto; exponer `renderHeatmap(sessions)`. No lee localStorage. | RF-1, RF-4, RF-5, RF-6, RF-7, RF-8, RF-9; RNF-2, RNF-3, RNF-4 |
| `app.js` | Modificar | Reutilizar `date-utils` en las funciones de fecha existentes y llamar a `renderHeatmap(sesiones)` desde `mostrarTodo()`. No cambia datos ni almacenamiento. | RF-8; RNF-7 |
| `date-utils.test.js` | Crear | Tests de fechas locales, límites de mes/año y día bisiesto. | RF-1, RF-5, RF-10; RNF-5 |
| `heatmap-logic.test.js` | Crear | Tests de agregación, niveles, cuadrícula, datos inválidos y formato del globo. | RF-1, RF-2, RF-3, RF-5, RF-6, RF-9, RF-10; RNF-8 |
| `MEMORY.md` | Modificar | Registrar el plan y los próximos pasos. | Proceso |

La creación de los archivos nuevos requiere la aprobación previa indicada en `AGENTS.md`.

Orden de carga en `index.html`: `date-utils.js`, `heatmap-logic.js`, `heatmap-ui.js`,
`app.js`. Así `app.js` encuentra `DateUtils` y `renderHeatmap` cuando arranca.

## 3. Funciones puras

Todas viven en `date-utils.js` o `heatmap-logic.js`, no tocan DOM ni localStorage y no
llaman a `new Date()` sin argumentos. Las que dependen del día actual reciben `today` como
cadena `"AAAA-MM-DD"`. La exportación usa un patrón IIFE que expone un global en el
navegador y `module.exports` en Node, sin módulos ES.

| Función | Entrada → Salida | Responsabilidad | RF / RNF |
|---|---|---|---|
| `isValidDateString(value)` | cualquiera → booleano | Comprueba formato `AAAA-MM-DD` y fecha real (rechaza `2026-02-30`, `2026-13-01`, etc.). | RF-10; RNF-5 |
| `toLocalDateString(date)` | `Date` → `"AAAA-MM-DD"` | Convierte una fecha a cadena local sin pasar por UTC. | RF-1; RNF-5 |
| `shiftDate(dateString, days)` | cadena + entero → cadena | Suma o resta días con calendario local. | RF-1, RF-5; RNF-5 |
| `startOfWeek(dateString)` | cadena → cadena | Devuelve el lunes de la semana de esa fecha. | RF-1 |
| `formatLongDate(dateString)` | cadena → texto | Fecha larga en español, reutilizando el formato actual de la lista de sesiones. | RF-6, RF-7; RNF-5 |
| `isValidSession(session, today)` | objeto + cadena → booleano | Acepta solo sesiones con fecha válida, no futura, y minutos numéricos finitos mayores que 0. | RF-2, RF-10 |
| `sumMinutesByDate(sessions, today)` | lista + cadena → mapa fecha→minutos | Ignora sesiones inválidas o futuras, suma por día y redondea el total diario. No muta la lista. | RF-2, RF-3, RF-10 |
| `getHeatLevel(minutes)` | número → 0–4 | Aplica los umbrales: 0; 1–30; 31–60; 61–120; más de 120. | RF-3, RF-4 |
| `buildHeatmap(sessions, today)` | lista + cadena → modelo | Construye las 12 semanas, los 7 días por semana, los huecos futuros y la marca de mes de cada columna. | RF-1, RF-3, RF-5, RF-9, RF-10 |
| `formatDaySummary(dateString, minutes)` | cadena + número → texto | Compone el texto del globo y del nombre accesible: fecha, total y “Sin sesiones” cuando corresponde. | RF-6, RF-7; RNF-5 |

Decisiones de cálculo:

- `shiftDate` construye la fecha local a mediodía para evitar saltos de cambio de hora a
  medianoche; sigue devolviendo la fecha local, nunca UTC.
- `sumMinutesByDate` redondea el total de cada día con redondeo half-up (0,5 sube). Los
  minutos del formulario son enteros; el redondeo solo afecta a datos manipulados.
- `getHeatLevel` recibe minutos ya redondeados y no negativos; un valor ≤ 0 devuelve nivel 0.
- `isValidSession` acepta solo `minutos` de tipo número finito. Las cadenas numéricas se
  consideran inválidas porque el formulario ya guarda números.
- `buildHeatmap` devuelve 12 columnas y 7 posiciones por columna; las posiciones posteriores
  a `today` son `null`, no sesiones futuras.
- `formatDaySummary` devuelve, por ejemplo, `"Lunes, 9 de noviembre de 2026 · 45 min"` o
  `"Lunes, 9 de noviembre de 2026 · Sin sesiones"`. El separador y la abreviatura `min` son
  fijos para que los tests comparen cadenas exactas.
- Un día con sesiones cuyo total redondea a 0 se trata como nivel 0 y muestra “Sin
  sesiones”; es la resolución del plan para la contradicción entre RF-2, RF-3 y RF-6.

## 4. Algoritmo del mapa

```text
ALGORITMO sumMinutesByDate(sessions, today)
  totals ← mapa vacío
  si sessions no es una lista: devolver totals
  para cada session en sessions:
      si no isValidSession(session, today): continuar
      totals[session.fecha] ← (totals[session.fecha] o 0) + session.minutos
  para cada fecha en totals:
      totals[fecha] ← redondear(totals[fecha])
  devolver totals

ALGORITMO startOfWeek(dateString)
  índice ← día de la semana con lunes = 0 y domingo = 6
  devolver shiftDate(dateString, -índice)

ALGORITMO buildHeatmap(sessions, today)
  totals ← sumMinutesByDate(sessions, today)
  lunesDeHoy ← startOfWeek(today)
  primerLunes ← shiftDate(lunesDeHoy, -77)      // 11 semanas antes
  weeks ← lista vacía
  para weekIndex de 0 a 11:
      weekStart ← shiftDate(primerLunes, weekIndex * 7)
      days ← lista vacía
      monthKey ← nulo
      para dayIndex de 0 a 6:
          date ← shiftDate(weekStart, dayIndex)
          si date > today:
              days.append(nulo)
          si no:
              minutes ← totals[date] o 0
              level ← getHeatLevel(minutes)
              days.append({ date, minutes, level })
              si date termina en "-01":
                  monthKey ← primeros 7 caracteres de date
      weeks.append({ days, monthKey })
  devolver { startDate: primerLunes, endDate: today, weeks }

ALGORITMO getHeatLevel(minutes)
  si minutes <= 0: devolver 0
  si minutes <= 30: devolver 1
  si minutes <= 60: devolver 2
  si minutes <= 120: devolver 3
  devolver 4
```

El periodo queda formado por 12 columnas semanales: la primera empieza el lunes de hace 11
semanas y la última es la semana actual, truncada en `today`. La marca de mes se coloca en
la columna que contiene el día 1; si el periodo empieza a mitad de mes, ese primer mes no
recibe etiqueta.

## 5. Interfaz

### 5.1 Estructura

La sección se coloca después de la tarjeta “Resumen” y antes de “Nueva sesión”. Contiene:

- Título “Últimas 12 semanas”.
- Fila de etiquetas de mes, alineada con las columnas.
- Columna de días de la semana (L, M, X, J, V, S, D).
- Cuadrícula de 12 columnas × 7 filas.
- Leyenda con los cinco niveles y sus rangos.
- Un único globo de información reutilizable.

La colocación exacta queda pendiente de la duda abierta de la spec; el plan asume la
posición indicada.

### 5.2 Pintado

`renderHeatmap(sessions)`:

1. Calcula `today` con `DateUtils.toLocalDateString(new Date())`.
2. Llama a `HeatmapLogic.buildHeatmap(sessions, today)`.
3. Oculta el globo y vacía la cuadrícula y la fila de meses.
4. Por cada semana, pinta la etiqueta de mes si `monthKey` no es nulo.
5. Por cada día:
   - Si es `null`, añade un hueco no interactivo y oculto para conservar la alineación.
   - Si es un día, añade un botón con la clase del nivel, la fecha y los minutos en
     atributos de datos y un `aria-label` con `formatDaySummary`.
6. La leyenda es estática en `index.html`; sus muestras usan las mismas clases de nivel que
   las celdas.

Cada celda es un botón nativo. Se usa delegación de eventos en la cuadrícula para evitar
84 escuchadores individuales.

### 5.3 Globo

- Se muestra al pasar el puntero con ratón, al recibir foco con teclado y al tocar en móvil.
- Se oculta al salir con el puntero, al perder el foco, al tocar fuera o al pulsar Escape.
- Usa `position: fixed`, se coloca encima de la celda y, si no cabe, debajo; se limita al
  ancho de la ventana con un margen mínimo.
- Su contenido se inserta como texto, nunca como HTML.
- Es visual (`aria-hidden`), porque la misma información ya está en el `aria-label` del
  botón; así el lector de pantalla no la repite.

### 5.4 Accesibilidad y móvil

- Cada botón expone fecha completa y minutos, o “Sin sesiones”. El color no es el único
  canal de información.
- Foco visible con contorno suficiente; orden de tabulación de izquierda a derecha y de
  arriba abajo.
- Los cinco niveles se diferencian por luminosidad, no solo por tono. Los textos de leyenda
  y globo usan la tinta sobre papel de la interfaz y cumplen contraste AA.
- No hay animaciones ni transiciones, por lo que `prefers-reduced-motion` se respeta sin
  código adicional.
- Paleta propuesta, con luminosidad decreciente y basada en el verde existente:

| Nivel | Minutos | Color |
|---|---|---|
| 0 | 0 | `#e7e9dd` (papel neutro) |
| 1 | 1–30 | `#cdddc9` |
| 2 | 31–60 | `#9dc0a5` |
| 3 | 61–120 | `#5f9478` |
| 4 | Más de 120 | `#2f6b57` |

- A 360 px el ancho útil es de unos 304 px: 16 px para la columna de días y 12 celdas de
  24 px, sin separación. La separación visual se consigue con una sombra interior, que no
  suma ancho. En pantallas mayores las celdas crecen hasta 32 px y la cuadrícula se centra.
- La leyenda puede ocupar varias líneas; la cuadrícula no provoca desplazamiento
  horizontal a 360 px.

### 5.5 Actualización y estado vacío

- `app.js` llama a `renderHeatmap(sesiones)` dentro de `mostrarTodo()`. Como guardar una
  sesión ya llama a `mostrarTodo()`, el mapa se actualiza sin recargar.
- No se añade un temporizador de medianoche: el mapa se recalcula al cargar y al guardar.
  Si la página queda abierta al cambiar el día, se actualiza en la siguiente acción.
- Con una lista vacía o sin sesiones válidas, se pinta la cuadrícula completa en nivel 0,
  con leyenda y etiquetas, sin mensaje de error.

## 6. Decisiones técnicas

| Decisión | Por qué | Alternativa descartada | RF / RNF |
|---|---|---|---|
| Lógica en `heatmap-logic.js` separada de `app.js` | `app.js` toca el DOM al cargarse y no se puede probar en Node; un módulo puro sí. | Añadir las funciones a `app.js` y cargarlo con `vm` en los tests: frágil y mezcla responsabilidades. | RNF-8; Constitución 3 |
| Exportación compatible con navegador y Node | `file://` prohíbe módulos ES, pero `node --test` necesita importar la lógica. | Duplicar la lógica en el test: dos versiones que se desvían. | RNF-1, RNF-8; Constitución 1 y 4 |
| Extraer las fechas a `date-utils.js` y reutilizarlas en `app.js` | Una sola fuente para la lógica local, que es la parte más fácil de equivocar; permite tests de regresión. | Duplicar `fechaLocal`/`desplazarDia` en el módulo nuevo: riesgo de que las dos versiones discrepen. | RF-1, RF-5, RF-10; Constitución 3 y 5 |
| Cuadrícula 12×7 con huecos `null` ocultos | Mantiene la alineación de columnas y no muestra días futuros. | Omitir las celdas futuras: la última columna se desalinea y el ancho cambia. | RF-1 |
| Botones nativos para cada celda | Foco, activación y accesibilidad gratis; código didáctico. | `div` con `tabindex` y navegación con flechas: más código y más casos límite. Se aceptan 84 paradas de tabulación. | RF-7 |
| Un solo globo y delegación de eventos | Menos DOM y menos escuchadores; comportamiento uniforme. | Un globo por celda o el atributo `title`: poco control, mal tacto y estilos limitados. | RF-6 |
| Mapa estático, sin animaciones | Respeta `prefers-reduced-motion` sin lógica extra y coincide con “animaciones fuera de alcance”. | Aparición con fundido: añade código y contradice el fuera de alcance. | RF-7 |
| Colores por clases y variables CSS | Separa presentación de lógica y permite ajustar la paleta en un sitio. | Estilos en línea generados desde JavaScript: mezcla responsabilidades. | RF-3, RF-4 |
| Llamada directa desde `mostrarTodo()` | `mostrarTodo` ya es el único punto de repintado tras cargar y guardar. | Eventos personalizados u observadores: complejidad innecesaria. | RF-8 |
| Validación sesión a sesión | Conserva las sesiones válidas aunque haya entradas corruptas. | Descartar todo el historial si una entrada falla: oculta datos válidos. | RF-10; Constitución 5 |
| Redondeo half-up por día | Determinista y fácil de explicar; los minutos normales son enteros. | Truncar o redondear cada sesión por separado: resultados distintos según el orden. | RF-2 |
| Sin temporizador de medianoche | Evita estado y temporizadores; el mapa se recalcula al cargar o guardar. | `setInterval` hasta medianoche: complejidad para un caso poco frecuente. | RF-1, RF-8 |
| `monthKey` calculado en la lógica pura | La interfaz solo formatea; no duplica el recorrido de fechas. | Detectar meses en la interfaz: lógica repetida y más difícil de probar. | RF-5 |
| Texto del globo en función pura | Se prueba sin DOM y se reutiliza para el `aria-label`. | Plantilla en la interfaz: mismo texto en dos sitios y sin tests. | RF-6, RF-7 |
| `aria-label` en el botón y globo `aria-hidden` | Evita que el lector anuncie la misma información dos veces. | `aria-describedby` dinámico al globo: identificadores y anuncios duplicados. | RF-7 |
| 24 px por celda a 360 px, sin hueco y con sombra interior | Cumple RNF-2 y RNF-3 con el ancho real de la interfaz. | Scroll horizontal (rompe RNF-2) o celdas menores de 24 px (rompe RNF-3). | RNF-2, RNF-3 |
| Mapa de solo lectura, sin cambios de datos | No toca la clave ni el formato; no hay migración ni riesgo de pérdida. | Guardar el mapa precalculado: se desactualiza y exige migraciones. | RNF-7; Constitución 5 |

## 7. Estrategia de tests

### 7.1 Automáticos

- Comando: `node --test` (Node 18 o superior). Sin `package.json`, sin npm y sin paquetes.
- Archivos: `date-utils.test.js` y `heatmap-logic.test.js`.
- Todos los tests usan una fecha fija como `today`; nunca leen el reloj real.
- No se prueba `heatmap-ui.js` en Node porque depende del DOM; su verificación es manual.
- Se comprueba que las funciones no mutan la lista de sesiones y que dos llamadas con la
  misma entrada devuelven el mismo resultado.

| RF / RNF | Casos automáticos |
|---|---|
| RF-1 | Primer lunes correcto; 12 columnas; última celda = hoy; sin celdas futuras; hoy lunes y hoy domingo; 78–84 celdas. |
| RF-2 | Varias sesiones el mismo día; minutos 0, negativos, `NaN`, `Infinity`, cadenas y ausentes; fechas futuras y anteriores; suma y redondeo; 0,4 + 0,4. |
| RF-3 | Umbrales 0, 1, 30, 31, 60, 61, 120 y 121; decimales; negativos. |
| RF-5 | Marca de mes en la columna del día 1; cruce de año; inicio a mitad de mes; 29 de febrero. |
| RF-6 | `formatDaySummary` para 0, 1, 45 y 121 minutos; fecha larga en español. |
| RF-9 | Lista vacía: 12 semanas, todos los niveles 0, sin errores. |
| RF-10 | Payload no lista; entradas no objeto; fechas imposibles; fechas futuras; sesiones antiguas; no mutación. |
| RNF-5 | Fechas locales en cadenas `AAAA-MM-DD`; sin UTC; formato `es-ES`. |
| RNF-8 | Toda la lógica se ejecuta en Node sin DOM ni localStorage. |

Casos de fecha imprescindibles: `shiftDate` sobre fin de mes, fin de año, 28/29 de febrero
y cambio de hora; `startOfWeek` con lunes y domingo; `isValidDateString` con `2026-02-30`,
`2026-13-01`, `2026-1-1` y `09/11/2026`.

### 7.2 Manuales

Con Chrome DevTools, después de que los tests estén en verde:

- RF-4: la leyenda muestra los cinco niveles y sus colores coinciden con las celdas.
- RF-6: globo con ratón, foco y tacto; se oculta al salir, al perder foco, al tocar fuera
  y con Escape; no se corta en los bordes.
- RF-7: recorrido completo con teclado; lector de pantalla anuncia fecha y minutos; foco
  visible; contraste AA; movimiento reducido sin animaciones.
- RF-8: guardar una sesión actualiza color y globo sin recargar.
- RF-9: borrar la clave de almacenamiento y comprobar el mapa neutro.
- RF-10: introducir datos corruptos y comprobar que el mapa no falla y que no se borra
  ninguna sesión.
- RNF-2 y RNF-3: vista a 360 px, sin scroll horizontal, celdas de 24×24 px.
- RNF-4: sin retraso perceptible y consola sin errores.

La puerta de calidad es la de la constitución: no se avanza con tests en rojo. Los tests
automáticos cubren la lógica; la interfaz se valida a mano porque no se añaden dependencias
de DOM.

## 8. Cumplimiento de la constitución

| Principio | Cómo lo cumple el plan |
|---|---|
| 1. Simplicidad primero | Scripts clásicos, sin dependencias, sin build y compatibles con `file://`; la exportación dual no usa módulos ES. |
| 2. La spec manda | El plan cubre RF-1 a RF-10 y RNF-1 a RNF-8; las dos dudas abiertas se marcan abajo y no se implementan a ciegas. |
| 3. Lógica separada de interfaz | `date-utils.js` y `heatmap-logic.js` no tocan DOM ni localStorage y reciben `today`; `heatmap-ui.js` solo pinta. |
| 4. Tests como puerta | `node --test`, sin paquetes; tests primero y en verde antes de integrar la interfaz. |
| 5. Datos sagrados | No se cambia la clave ni el formato; el mapa es de solo lectura; las entradas inválidas se ignoran sin borrar nada. |
| 6. Idioma | Identificadores, funciones y archivos nuevos en inglés; interfaz, comentarios y documentación en español. El código existente no se renombra para no ampliar el alcance. |

## 9. Dudas y riesgos pendientes

- **Colocación del mapa (duda abierta de la spec):** el plan asume después de “Resumen” y
  antes de “Nueva sesión”. Requiere confirmación antes de implementar.
- **Mapa sin sesiones (duda abierta de la spec):** el plan sigue RF-9 y lo muestra siempre
  en neutro. Si se prefiere ocultarlo hasta la primera sesión, hay que cambiar RF-9.
- **Geometría a 360 px:** la solución de 24 px sin hueco y 16 px de etiquetas es ajustada;
  si el diseño exige separaciones visibles mayores, RNF-2 y RNF-3 entran en conflicto y
  habrá que revisar la spec.
- **84 paradas de tabulación:** se aceptan por simplicidad. La navegación con flechas queda
  para otra spec.
- **Cambio de día con la página abierta:** no hay actualización automática a medianoche;
  el mapa se recalcula al cargar o guardar.
- **Redondeo y cadenas numéricas:** la spec no los define; el plan fija half-up y rechaza
  cadenas. Son decisiones técnicas revisables.
- **Sesiones que redondean a 0:** el plan las muestra como nivel 0 y “Sin sesiones”;
  requiere confirmación porque RF-6 dice que un día con sesiones muestra su total.
- **Etiqueta de año:** no se muestra; un periodo que cruza diciembre/enero puede mostrar
  dos “enero” sin año. La spec no lo pide.
- **Formato de fecha:** se reutiliza el formato actual de la lista, con inicial mayúscula;
  el ejemplo de la spec usa minúscula y es orientativo.
- **Idioma del código existente:** `app.js` sigue en español; el principio 6 se aplica al
  código nuevo. Renombrar el código existente es una tarea aparte y no se incluye aquí.

## 10. Trazabilidad RF

| Requisito | Dónde se cubre | Verificación |
|---|---|---|
| RF-1 | `date-utils.js`, `buildHeatmap`, `heatmap-ui.js`, `index.html` | Tests de ventana y render manual |
| RF-2 | `isValidSession`, `sumMinutesByDate`, tests | Tests de agregación y datos inválidos |
| RF-3 | `getHeatLevel`, clases CSS de nivel | Tests de umbrales y revisión visual |
| RF-4 | Leyenda estática en `index.html`, variables CSS | Revisión manual |
| RF-5 | `startOfWeek`, `buildHeatmap.monthKey`, etiquetas UI | Tests de meses y revisión manual |
| RF-6 | `formatDaySummary`, globo de `heatmap-ui.js` | Tests de texto y revisión manual |
| RF-7 | Botones con `aria-label`, foco, contraste, sin animaciones | Revisión manual con teclado y lector |
| RF-8 | `mostrarTodo()` → `renderHeatmap()` | Prueba manual de guardado |
| RF-9 | `buildHeatmap` con lista vacía, render neutro | Test y revisión manual |
| RF-10 | `isValidDateString`, `isValidSession`, `sumMinutesByDate` | Tests de datos corruptos y no mutación |
| RNF-1 | Scripts clásicos, sin red ni build | Prueba con `file://` |
| RNF-2 | CSS de 16 px + 12×24 px a 360 px | Revisión a 360 px |
| RNF-3 | Botones de 24×24 px mínimo | Revisión táctil |
| RNF-4 | 84 botones en un solo render | Medición en DevTools |
| RNF-5 | `date-utils.js` y textos en español | Tests de fecha local |
| RNF-6 | Sin recursos externos ni peticiones | Revisión de red |
| RNF-7 | Solo lectura; sin cambios de clave ni formato | Revisión y tests de no mutación |
| RNF-8 | Módulos puros ejecutables en Node | `node --test` |
