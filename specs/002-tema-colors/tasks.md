# Tareas 002 — Temas Claro, Oscuro y Medio

Derivan de `spec.md` (borrador) y `plan.md`. Una tarea cada vez, pruebas en rojo primero y
`node --test` en verde antes de pasar a la siguiente.

Orden de dependencia: T1 → T4 → T5 → T6 → T7 → T8 → T9. La lógica (T2 y T3) puede hacerse
en paralelo con T1 y T4, pero debe estar hecha antes de T5.

## Tareas

- [x] **T1. Paleta de los tres temas en los estilos.** RF-1, RF-6, RF-9
  - Definir las variables de color de Oscuro y Medio junto a las de Claro, incluidos los
    cinco niveles del mapa, el confeti y el anillo de foco.
  - Sustituir los colores fijos que aún quedan fuera de variables.
  - Hecho cuando: cambiando el atributo del tema a mano en el inspector, toda la pantalla
    cambia y el fondo de cada tema cae en el rango de luminancia de RF-1, medido con un
    medidor de contraste.

- [x] **T2. Lógica pura del tema inicial y de la validación.** RF-3, RF-7, RF-8
  - Escribir primero las pruebas de la tabla de verdad de `resolverTema`, `prefiereOscuro` y
    `esTemaValido`, y después las funciones.
  - Hecho cuando: `node --test` está en verde con las siete filas de la tabla y los casos de
    valor nulo, cadena vacía, mayúsculas, espacios, número y objeto; ninguna prueba usa el
    DOM ni el almacenamiento real.

- [x] **T3. Leer y guardar la preferencia sin romper nada.** RF-4, RF-8, RF-10
  - Pruebas con almacén simulado que devuelve valor, devuelve nulo, devuelve basura y lanza
    al leer o al escribir; después `leerTemaGuardado` y `guardarTema`.
  - Hecho cuando: las pruebas en verde y ninguna de ellas escribe en la clave del historial
    ni modifica sesiones.

- [x] **T4. Control de tema accesible en la cabecera.** RF-2, RF-9
  - Grupo etiquetado "Tema" con las tres opciones, marca de selección visible, foco legible
    y adaptación a dos filas en pantallas estrechas.
  - Hecho cuando: a 360 px y a 320 px las tres opciones se ven sin desplazamiento
    horizontal; con el texto al 200 % se leen y se alcanzan; se recorren con flechas y se
    activan con espacio o intro; el lector anuncia el grupo y la opción activa.

- [x] **T5. Arranque con el tema correcto desde el primer pintado.** RF-3, RNF-5
  - Aplicar el tema antes de pintar el cuerpo, leyendo la preferencia y el tema del
    dispositivo, sin guardar el tema deducido.
  - Hecho cuando: recargando con el dispositivo en oscuro, la caché desactivada y la CPU
    ralentizada 4×, no se observa ningún cambio de colores tras la carga y la opción marcada
    es la aplicada.

- [x] **T6. Cambio inmediato, persistencia y cero efectos secundarios.** RF-4, RF-5, RF-7
  - Escuchar las tres opciones una sola vez, aplicar el tema, marcar la opción y guardar la
    elección tolerando fallos; no escuchar los cambios del dispositivo.
  - Hecho cuando: el cambio se ve sin recargar en menos de 100 ms; al recargar se conserva;
    con el globo del mapa abierto, un error visible y texto escrito en el formulario, nada se
    pierde ni se mueve; y cambiar el tema del dispositivo con la app abierta no altera el
    tema aplicado.

- [x] **T7. Escala del mapa y confeti por tema.** RF-6, RF-9
  - Los niveles, la leyenda, los huecos y el confeti toman los colores del tema; el nivel 0
    se separa del fondo con un borde.
  - Hecho cuando: cada nivel del 1 al 4 mide al menos 1,5:1 frente al fondo de la tarjeta y
    frente al contiguo; en Oscuro la escala se aclara al subir y en Claro y Medio se
    oscurece; el confeti mide al menos 3:1 sobre los tres fondos; y las celdas de hueco no
    reciben foco.

- [x] **T8. Verificación visual y accesible completa.** RF-1 a RF-10, RNF-1 a RNF-10
  - Recorrer la checklist de §8 del plan en los tres temas, con teclado, lector de pantalla
    y medidor de contraste.
  - Hecho cuando: no hay errores en consola; no hay desplazamiento horizontal a 320 ni a
    360 px; los contrastes de texto, controles, foco y confeti cumplen los ratios; y no se
    reanuncian racha ni resumen al cambiar de tema.

- [x] **T9. No regresión y documentación.** RF-10, RNF-7, RNF-8
  - Revisar que racha, mejor racha, semana, mes, mapa y confeti se comportan igual en los
    tres temas y comparar el historial guardado antes y después.
  - Hecho cuando: `node --test` sigue en verde con los tests nuevos; el historial guardado
    es idéntico byte a byte tras cambiar de tema varias veces; §9 de la spec queda marcado
    y `MEMORY.md` actualizado con el estado y las decisiones.

## Cierre — RF cubiertos por tarea

| Tarea | RF / RNF                     | Qué lo demuestra                                                                   |
| ----- | ---------------------------- | ---------------------------------------------------------------------------------- |
| T1    | RF-1, RF-6, RF-9             | Tres bloques de variables en `styles.css`; luminancia del fondo 0,92 / 0,68 / 0,01 |
| T2    | RF-3, RF-7, RF-8             | Tabla de verdad de `resolverTema` y validación en `theme-logic.test.js`            |
| T3    | RF-4, RF-8, RF-10            | Almacén simulado (valor, nulo, basura, error); clave distinta del historial        |
| T4    | RF-2, RF-9                   | `fieldset` "Tema" con tres radios; 320/360 px sin scroll; 200 % de texto           |
| T5    | RF-3, RNF-5                  | Script en `<head>`: primer pintado ya con el tema correcto, sin guardarlo          |
| T6    | RF-4, RF-5, RF-7             | Un solo `change`; persiste al recargar; no escucha cambios del dispositivo         |
| T7    | RF-6, RF-9                   | Niveles del mapa y confeti por tema; nivel 0 con borde propio                      |
| T8    | RF-1 a RF-10, RNF-1 a RNF-10 | Consola limpia, contrastes medidos, teclado y lector, sin reanuncios               |
| T9    | RF-10, RNF-7, RNF-8          | `node --test` 62/62; historial idéntico byte a byte; docs al día                   |

## Si crece

Estas nueve tareas caben en el límite de la skill. Si al implementar T7 aparece que hay que
rehacer la escala del mapa o la accesibilidad del globo, se propone dividir la spec: una para
temas y otra para la accesibilidad del mapa de calor.
