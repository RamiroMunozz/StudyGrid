# AGENTS.md — Diario de Estudio

Web estática para registrar sesiones de estudio y motivarse viendo la racha de días
seguidos. Proyecto didáctico: el código debe poder entenderlo alguien que empieza a
programar.

## Stack y estructura

- HTML, CSS y JavaScript puros: sin frameworks, librerías, npm, bundler ni build.
- `index.html` (estructura), `styles.css` (estilos), `app.js` (lógica y datos).
- Debe funcionar abriendo `index.html` con doble clic (`file://`): nada de módulos ES
  (`type="module"`), `fetch` a archivos locales ni nada que requiera servidor.

## Convenciones

- Textos de la interfaz en español.
- Código simple, nombres descriptivos y comentarios solo donde aporten.
- Diseño limpio y responsive; cualquier pantalla nueva debe verse bien en el móvil.

## Datos

- localStorage, clave `diario-de-estudio`: array de `{ id, fecha: "AAAA-MM-DD", tema,
minutos }`. `id` solo sirve para ordenar las sesiones del mismo día.
- Si cambias la forma de los datos, mantén compatibilidad con lo ya guardado o el usuario
  perderá sus sesiones.

## Fechas y racha (fácil equivocarse)

- Trabaja siempre con la fecha local del usuario. Nunca uses `toISOString()` ni `new
Date("AAAA-MM-DD")`: se interpretan en UTC y desplazan el día.
- Racha = días consecutivos con al menos 1 sesión que terminan hoy. Si hoy no hay sesión
  pero ayer sí, la racha sigue viva y se cuenta desde ayer.
- Varias sesiones el mismo día cuentan como un solo día. Las fechas futuras no suman.
- Mejor racha = secuencia más larga de días consecutivos con sesión en todo el historial.
  Se calcula al vuelo (no se guarda), incluye la racha en curso e ignora fechas futuras.
- Semana = lunes a domingo según la fecha local. El total semanal suma los minutos de
  todas las sesiones dentro de la semana actual (varias el mismo día suman todas), ignora
  las fechas futuras y se calcula al vuelo (no se guarda).
- Mes = mes natural según la fecha local. Los días estudiados del mes son los días
  distintos con al menos una sesión en el mes actual; varias el mismo día cuentan una vez,
  se ignoran las fechas futuras y se calculan al vuelo (no se guardan).
- Confeti: solo al guardar una sesión, cuando la racha actual posterior supera
  estrictamente la mejor racha calculada antes de guardar. Un festejo por cada nuevo
  récord, también el primero. No se guarda estado: recargar no lo repite. Implementación
  propia con DOM y CSS, sin librerías, y respetando `prefers-reduced-motion`.

## Forma de trabajar

- Haz solo lo que se pide: no añadas funcionalidades por tu cuenta.
- Cambios pequeños y enfocados; no reescribas lo que ya funciona.
- Al terminar, resume qué has cambiado y cualquier decisión que deba revisar.

## Memoria

- Al empezar, lee `MEMORY.md` para conocer el estado del proyecto y las decisiones
  tomadas.
- Al terminar una tarea, actualízalo: estado actual, decisiones importantes (con su
  porqué) y errores a evitar.
- Mantenlo breve (máximo ~50 líneas): resume o elimina lo que ya no aporte.
- Si algo se convierte en una regla permanente, propón moverlo a `AGENTS.md` en lugar de
  dejarlo en la memoria.
- No guardes nunca datos sensibles (claves, tokens, datos personales).

## Comandos

- Tests: `node --test`

## Reglas

- Lee `docs/constitution.md` y la spec activa (`specs/NNN-*/`) antes de tocar código.

## Límites

- ✅ Siempre: respetar las reglas de fechas y racha, mantener los textos en español.
- ✅ Siempre: actualizar `MEMORY.md` al terminar cada tarea.
- ⚠️ Pregunta antes: crear archivos nuevos, cambiar el formato de los datos guardados.
- 🚫 Nunca: añadir dependencias, frameworks o un paso de build.

## Verificación

- No hay tests automáticos. Después de cada cambio, verifica con el MCP de Chrome DevTools: abre `index.html`, prueba la funcionalidad, revisa la consola y comprueba la vista móvil.
- Comprobación rápida de rachas: una secuencia larga antigua, un hueco, "solo ayer", una
  sesión futura y varias sesiones el mismo día. Revisar racha actual y mejor racha tras
  recargar.
- Confeti: no debe salir al recargar ni al empatar el récord; sí al superarlo, también en
  la primera sesión. Probar con movimiento reducido activado.
- Total semanal: lunes y domingo incluidos, el domingo anterior excluido, una semana que
  cambia de mes/año, una semana vacía (0 min) y una sesión futura (no suma).
- Días del mes: primer y último día incluidos, el último del mes anterior excluido, varias
  sesiones el mismo día (cuenta 1), mes vacío (0 días) y una sesión futura (no suma).
- Para empezar de cero: DevTools → Application → Local Storage → borrar la clave `diario-de-estudio`.
