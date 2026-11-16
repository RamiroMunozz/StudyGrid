# Especificación 001 — Mapa de calor de estudio

## 1. Contexto y objetivo

El Diario de Estudio registra sesiones (fecha, tema y minutos) y ya muestra la racha
actual, la mejor racha y un resumen semanal y mensual. Esas cifras dicen cuánto se estudia,
pero no permiten ver de un vistazo la constancia a lo largo del tiempo.

Esta funcionalidad añade un mapa de calor de las últimas 12 semanas: cada día es una celda
y su color se intensifica según los minutos estudiados ese día. El objetivo es que el
usuario detecte patrones (días fuertes, huecos) y se motive al ver su progreso sin tener
que recorrer la lista de sesiones.

## 2. Usuarios

- Estudiante que ya registra sesiones y quiere comprobar su constancia.
- Estudiante nuevo que necesita una imagen rápida de qué significa estudiar con
  regularidad.
- Usuario que navega con teclado, con lector de pantalla o desde el móvil y necesita la
  misma información sin depender del color.

## 3. Historias de usuario

- **US-1.** Como estudiante, quiero ver qué días he estudiado en las últimas 12 semanas
  para saber si mantengo el hábito.
- **US-2.** Como estudiante, quiero distinguir los días con más minutos para reconocer mis
  días más productivos.
- **US-3.** Como estudiante, quiero consultar la fecha y los minutos de un día concreto
  para entender por qué tiene ese color.
- **US-4.** Como usuario que no distingue bien los colores o navega con teclado, quiero
  obtener la misma información que da el color.
- **US-5.** Como estudiante sin sesiones, quiero entender cómo funcionará el mapa antes de
  empezar a usarlo.

## 4. Requisitos funcionales

### RF-1 — Periodo y estructura

El sistema deberá mostrar una cuadrícula de 12 semanas naturales (lunes a domingo) que
termine hoy, con una celda por día, las semanas en columnas de la más antigua a la más
reciente y los días en filas de lunes a domingo.

- El sistema deberá mostrar como primera celda el lunes de la semana que comenzó 11 semanas
  antes de la semana actual.
- El sistema deberá mostrar como última celda el día de hoy.
- El sistema no deberá mostrar celdas de días futuros.
- Si hoy es lunes, el sistema deberá mostrar una última columna con una sola celda.

### RF-2 — Minutos por día

Cuando un día tenga varias sesiones, el sistema deberá sumar los minutos de todas ellas
para decidir su color y el total que muestra el globo de información.

- Cuando un día tenga dos o más sesiones, el sistema deberá usar la suma de sus minutos.
- Si una sesión tiene minutos no numéricos o menores o iguales que cero, el sistema deberá
  ignorarla.
- Si el total de un día tiene decimales, el sistema deberá redondearlo al minuto entero
  más cercano antes de clasificarlo y mostrarlo.

### RF-3 — Niveles de color

El sistema deberá asignar a cada día uno de cinco niveles según sus minutos totales:
sin sesión (0), nivel 1 (1–30), nivel 2 (31–60), nivel 3 (61–120) y nivel 4 (más de 120).

- Cuando el total sea 30, el sistema deberá asignar el nivel 1; cuando sea 31, el nivel 2.
- Cuando el total sea 60, el sistema deberá asignar el nivel 2; cuando sea 61, el nivel 3.
- Cuando el total sea 120, el sistema deberá asignar el nivel 3; cuando sea 121 o más, el
  nivel 4.
- El sistema deberá usar colores de intensidad creciente: el nivel 4 más intenso que el 3,
  el 3 más que el 2, el 2 más que el 1 y el 1 más que el neutro.

### RF-4 — Leyenda

El sistema deberá mostrar una leyenda con los cinco niveles y sus rangos: "Sin sesiones",
"1–30 min", "31–60 min", "61–120 min" y "Más de 120 min".

- La leyenda deberá estar visible junto al mapa.
- La leyenda deberá usar los mismos colores que las celdas.

### RF-5 — Etiquetas

El sistema deberá mostrar los días de la semana (L, M, X, J, V, S, D) y el mes de cada
columna.

- El sistema deberá mostrar la etiqueta del mes en la columna que contiene el primer día
  de cada mes visible.

### RF-6 — Globo de información

Cuando el usuario pase el puntero sobre una celda, la enfoque con el teclado o la toque en
un dispositivo táctil, el sistema deberá mostrar la fecha completa y los minutos totales de
ese día.

- Cuando el día tenga sesiones, el sistema deberá mostrar la fecha y el total, por ejemplo
  "lunes, 9 de noviembre de 2026 · 45 min".
- Cuando el día no tenga sesiones, el sistema deberá mostrar la fecha y el texto
  "Sin sesiones".
- Cuando el usuario quite el puntero, cambie el foco o toque fuera de la celda, el sistema
  deberá ocultar el globo.
- El globo deberá permanecer dentro de la pantalla, sin cortarse en los bordes.

### RF-7 — Accesibilidad

El sistema deberá ofrecer la información del mapa sin depender únicamente del color.

- Cada celda deberá poder alcanzarse con el teclado y mostrar su información al recibir
  foco.
- Cada celda deberá exponer un nombre accesible con la fecha y los minutos, o "Sin
  sesiones".
- El sistema deberá diferenciar los niveles también por luminosidad, no solo por tono.
- El contraste entre texto y fondo deberá cumplir WCAG AA.
- Si el usuario tiene activada la reducción de movimiento, el sistema no deberá animar la
  aparición del mapa ni la del globo.

### RF-8 — Actualización al guardar

Cuando el usuario guarde una sesión, el sistema deberá actualizar el mapa sin recargar la
página.

- Si la sesión guardada cae dentro del periodo, el sistema deberá reflejar sus minutos en
  el color y el globo de ese día.
- Si la sesión guardada es de hoy, el sistema deberá actualizar la última celda.

### RF-9 — Estado sin sesiones

Cuando no exista ninguna sesión en el periodo, el sistema deberá mostrar el mapa completo
en color neutro, con leyenda y etiquetas visibles.

- El sistema no deberá mostrar un mensaje de error ni ocultar el mapa.

### RF-10 — Datos fuera del periodo o no válidos

- Cuando una sesión tenga una fecha futura, el sistema deberá ignorarla.
- Cuando una sesión tenga una fecha anterior al inicio del periodo, el sistema deberá
  excluirla del mapa sin borrarla ni modificarla.
- Si los datos guardados no son una lista válida, el sistema deberá tratar el historial
  como vacío y mostrar el mapa neutro.

## 5. Requisitos no funcionales

- **RNF-1.** El mapa deberá funcionar sin conexión y sin instalar nada.
- **RNF-2.** En una pantalla de 360 px de ancho, el mapa deberá verse completo sin
  desplazamiento horizontal.
- **RNF-3.** Cada celda deberá tener un área táctil de al menos 24 × 24 px.
- **RNF-4.** El mapa deberá mostrarse sin retraso perceptible, en menos de 100 ms con 84
  celdas en un móvil de gama media.
- **RNF-5.** Los textos deberán estar en español y las fechas se calcularán siempre en hora
  local.
- **RNF-6.** El sistema no deberá enviar datos a la red ni cargar recursos externos.
- **RNF-7.** El mapa no deberá cambiar el formato de los datos guardados ni eliminar
  sesiones.
- **RNF-8.** Las reglas de agregación, niveles y periodo deberán poder verificarse de forma
  automática sin interactuar con la interfaz.

## 6. Casos límite

- Hoy es lunes: la última columna tiene una sola celda.
- Un día con dos sesiones de 20 y 30 minutos: total 50, nivel 2.
- Totales exactos en los límites: 30 → nivel 1, 31 → nivel 2, 60 → nivel 2, 61 → nivel 3,
  120 → nivel 3, 121 → nivel 4.
- Varias sesiones del mismo día que juntas cruzan un umbral.
- Sesión con 0 minutos o minutos no numéricos: se ignora.
- Sesión con fecha futura: se ignora.
- Historial vacío o datos guardados corruptos: mapa neutro, sin errores.
- El periodo cruza un cambio de mes, de año o un 29 de febrero.
- Cambio de hora estacional: los días siguen siendo los locales y no se duplican ni se
  pierden.
- Sesión en el primer día del periodo: se incluye; el día anterior: se excluye.
- Sesión de hoy: se incluye; la de mañana: se excluye.
- Pantalla estrecha (360 px) y pantalla ancha: el mapa se adapta sin scroll horizontal.
- Globo en la primera o la última columna: no se sale de la pantalla.
- Guardar una sesión con el globo abierto: el globo y el color se actualizan.
- Sesiones con el mismo identificador: los minutos se suman igualmente.

## 7. Fuera de alcance

- Navegar a periodos anteriores o elegir un año.
- Pulsar un día para filtrar, editar o registrar sesiones.
- Mostrar totales, medias o comparaciones del periodo.
- Exportar o compartir el mapa como imagen.
- Umbrales configurables, temas de color o un modo oscuro específico.
- Animaciones, notificaciones u objetivos de estudio.
- Sincronización entre dispositivos o cualquier servicio en la nube.
- Cambiar el formato de los datos guardados o la clave de almacenamiento.
- Mostrar el detalle de cada sesión en el globo (solo el total del día).
- Traducir la interfaz a otros idiomas.

## 8. Criterios de finalización

- [x] RF-1 a RF-10 verificados con datos de prueba.
- [x] Las pruebas automáticas de la lógica (suma por día, umbrales, ventana de 12 semanas,
      fechas futuras e inválidas) están en verde.
- [x] El mapa se ve completo a 360 px y en escritorio, sin scroll horizontal.
- [x] Se recorre con teclado y el lector de pantalla anuncia fecha y minutos.
- [x] Guardar una sesión actualiza el mapa sin recargar la página.
- [x] No hay errores en la consola.
- [x] Los datos existentes se leen sin migración y no se pierde ninguna sesión.
- [x] La documentación del proyecto queda actualizada.

## 9. Decisiones de las dudas abiertas

- **Posición del mapa.** Va después de la tarjeta "Resumen" (semana/mes) y antes de "Nueva
  sesión". Motivo: el mapa es una vista de resumen que se lee y el formulario es una acción
  que se usa; primero se entiende el progreso y después se anota.
- **Mapa sin sesiones.** Se muestra siempre, en color neutro, con leyenda y etiquetas. Lo
  fija RF-9 y además presenta la mecánica antes de la primera sesión (US-5).
