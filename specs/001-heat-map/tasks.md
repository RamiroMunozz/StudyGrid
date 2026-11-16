# Tareas 001 — Mapa de calor de estudio

> Orden de dependencia. Cada tarea está pensada para 20–30 minutos (algunas 10–15).
> No se marca una tarea hasta que su “Hecho cuando” se cumple. No se avanza con tests en
> rojo. Referencias: `spec.md`, `plan.md` y `docs/constitucion.md`.

## Fase A — Fechas locales

- [x] **T1. Crear `date-utils.js` con las funciones base de fecha.**
  - RF: RF-1, RF-5, RF-10; RNF-5.
  - Hecho cuando: el archivo expone `toLocalDateString`, `shiftDate` e `isValidDateString`;
    se puede cargar desde Node sin errores; no usa APIs de navegador; no usa
    `toISOString()` ni `new Date("AAAA-MM-DD")`.

- [x] **T2. Escribir `date-utils.test.js` para las funciones base.**
  - RF: RF-1, RF-5, RF-10; RNF-5, RNF-8.
  - Hecho cuando: `node --test date-utils.test.js` pasa con fechas válidas, `2026-02-30`,
    `2026-13-01`, `2026-1-1`, `09/11/2026`, fin de mes, fin de año y 28/29 de febrero.

- [x] **T3. Añadir `startOfWeek` y `formatLongDate` a `date-utils.js` con sus tests.**
  - RF: RF-1, RF-5, RF-6; RNF-5, RNF-8.
  - Hecho cuando: los tests pasan para lunes, domingo, cruce de mes/año y el formato
    `"Lunes, 9 de noviembre de 2026"`.

- [x] **T4. Cargar `date-utils.js` en `index.html` y reutilizarlo en `app.js`.**
  - RF: RF-1, RF-5; RNF-5, RNF-7.
  - Hecho cuando: `index.html` carga `date-utils.js` antes de `app.js`; `app.js` usa
    `DateUtils` para fecha local, desplazamiento y formato; no quedan copias de esas
    funciones; racha, mejor racha, semana y mes siguen dando los mismos resultados en una
    comprobación manual y la consola está limpia.

## Fase B — Lógica pura del mapa

- [x] **T5. Crear `heatmap-logic.js` con `isValidSession` y `sumMinutesByDate`.**
  - RF: RF-2, RF-10; RNF-8.
  - Hecho cuando: el módulo se carga en Node; suma varias sesiones del mismo día y redondea
    el total diario; ignora minutos 0, negativos, `NaN`, `Infinity`, cadenas y fechas
    futuras; no muta la lista.

- [x] **T6. Añadir tests de agregación a `heatmap-logic.test.js`.**
  - RF: RF-2, RF-3, RF-10; RNF-8.
  - Hecho cuando: `node --test heatmap-logic.test.js` pasa con 20 + 30 = 50, 0,4 + 0,4 = 1,
    sesiones antiguas, futuras y datos corruptos.

- [x] **T7. Implementar `getHeatLevel` con sus tests.**
  - RF: RF-3, RF-4.
  - Hecho cuando: los tests pasan para 0, 1, 30, 31, 60, 61, 120, 121, negativos y
    decimales.

- [x] **T8. Implementar `buildHeatmap` con sus tests.**
  - RF: RF-1, RF-3, RF-5, RF-9, RF-10; RNF-8.
  - Hecho cuando: devuelve 12 columnas × 7 posiciones; la primera celda es el lunes de hace
    11 semanas; la última es hoy; no hay fechas futuras; `monthKey` aparece en la columna
    del día 1; una lista vacía devuelve todo en nivel 0.

- [x] **T9. Implementar `formatDaySummary` con sus tests.**
  - RF: RF-6, RF-7; RNF-5.
  - Hecho cuando: 0 minutos devuelve `"… · Sin sesiones"`; 1, 45 y 121 devuelven el total
    con `min`; la fecha larga está en español.

- [x] **T10. Añadir los tests de casos límite de la lógica.**
  - RF: RF-2, RF-3, RF-9, RF-10; RNF-8.
  - Hecho cuando: pasan los casos de payload no lista, entradas no objeto, fechas
    imposibles, 29 de febrero, hoy lunes, hoy domingo, cambio de año y dos llamadas
    idénticas que devuelven lo mismo.

## Fase C — Interfaz

- [x] **T11. Añadir la sección del mapa en `index.html`.**
  - RF: RF-1, RF-4, RF-5, RF-6, RF-9; RNF-2.
  - Hecho cuando: existen título, fila de meses, columna de días, cuadrícula, leyenda y
    globo; los scripts cargan en orden `date-utils`, `heatmap-logic`, `app`;
    `heatmap-ui.js` se añade en T14; la página no da errores en consola.

- [x] **T12. Estilar la cuadrícula, etiquetas y niveles en `styles.css`.**
  - RF: RF-3, RF-5; RNF-2, RNF-3.
  - Hecho cuando: la cuadrícula declara 12 columnas y 7 filas; hay cinco clases de nivel
    con luminosidad decreciente; las etiquetas de mes y día están alineadas; a 360 px no
    hay scroll horizontal y la clase de celda reserva al menos 24 × 24 px.

- [x] **T13. Estilar leyenda, globo y foco en `styles.css`.**
  - RF: RF-4, RF-6, RF-7; RNF-2, RNF-3.
  - Hecho cuando: la leyenda muestra los cinco rangos con los mismos colores que las
    celdas; el globo se ve sobre el contenido; el foco es visible; no hay animaciones ni
    transiciones.

- [x] **T14. Implementar el render de la cuadrícula en `heatmap-ui.js`.**
  - RF: RF-1, RF-5, RF-6, RF-7, RF-9; RNF-2, RNF-3, RNF-4.
  - Hecho cuando: al invocar `renderHeatmap` desde la consola, pinta 12 semanas; los días
    futuros son huecos ocultos y no focusables; cada día es un botón con `aria-label` de
    fecha y minutos; la leyenda coincide; una lista vacía pinta todo en nivel 0;
    `heatmap-ui.js` se carga antes de `app.js` sin errores.

- [x] **T15. Implementar el globo de información en `heatmap-ui.js`.**
  - RF: RF-6, RF-7.
  - Hecho cuando: aparece con ratón, foco y tacto; se oculta al salir, al perder foco, al
    tocar fuera y con Escape; no se sale de la pantalla; su texto coincide con
    `formatDaySummary`.

- [x] **T16. Revisar accesibilidad y movimiento reducido en la interfaz.**
  - RF: RF-7; RNF-3.
  - Hecho cuando: se recorren todas las celdas con Tab; el foco es visible; el lector de
    pantalla anuncia fecha y minutos; el contraste de textos cumple AA; con movimiento
    reducido no hay animaciones.

- [x] **T17. Integrar `renderHeatmap` en `mostrarTodo()` de `app.js`.**
  - RF: RF-8; RNF-7.
  - Hecho cuando: al cargar se pinta el mapa; al guardar una sesión se actualiza el color y
    el globo sin recargar; no se modifica la clave ni el formato de los datos.

## Fase D — Verificación manual

- [x] **T18. Probar estado vacío y actualización al guardar.**
  - RF: RF-8, RF-9.
  - Hecho cuando: sin datos el mapa aparece neutro con leyenda y etiquetas; al guardar una
    sesión de hoy cambia la última celda; al guardar una sesión antigua cambia su día.

- [x] **T19. Probar el mapa a 360 px y con tacto.**
  - RF: RF-1, RF-4, RF-5; RNF-2, RNF-3, RNF-4.
  - Hecho cuando: no hay scroll horizontal; las celdas se tocan sin solaparse; la leyenda
    cabe o se reparte en varias líneas; el globo no se corta en los bordes.

- [x] **T20. Probar teclado, lector de pantalla y contraste.**
  - RF: RF-7.
  - Hecho cuando: el orden de Tab es coherente; cada celda anuncia fecha y minutos; Escape
    cierra el globo; el foco se ve; el contraste de textos y del foco cumple AA.

- [x] **T21. Probar datos corruptos, futuros y fuera del periodo.**
  - RF: RF-10; RNF-7.
  - Hecho cuando: con datos corruptos el mapa queda neutro y no hay errores; las sesiones
    futuras no se pintan; las antiguas no rompen; `localStorage` conserva todas las
    sesiones válidas.

- [x] **T22. Cierre: tests completos, consola y `file://`.**
  - RF: RF-1 a RF-10; RNF-1, RNF-6, RNF-8.
  - Hecho cuando: `node --test` pasa completo; la consola está limpia; `index.html` funciona
    con doble clic; no hay peticiones de red ni recursos externos; la checklist de RF/RNF
    del plan está revisada.

- [x] **T23. Actualizar `MEMORY.md`.**
  - RF: — (proceso).
  - Hecho cuando: la memoria refleja que la funcionalidad está implementada, qué decisiones
    se tomaron y qué queda pendiente.
