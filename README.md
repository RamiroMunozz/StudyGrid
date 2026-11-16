# Diario de Estudio

Aplicación web para anotar tus sesiones de estudio y ver de un vistazo si mantienes la
constancia: racha de días, minutos de la semana, objetivo semanal, días del mes y un mapa de
calor de las últimas 12 semanas.

Es una web estática hecha con **HTML, CSS y JavaScript puros**. No hay backend, ni
dependencias, ni paso de build. Todo se guarda en tu propio navegador.

## Qué incluye

- **Sesiones**: fecha, tema y minutos. Se listan de la más reciente a la más antigua.
- **Racha actual**: días consecutivos con al menos una sesión. Si hoy todavía no has
  estudiado, la racha de ayer sigue viva hasta que acabe el día.
- **Mejor racha**: la secuencia más larga de días consecutivos de todo tu historial.
- **Esta semana**: minutos estudiados de lunes a domingo y, si quieres, un **objetivo
  semanal** con su progreso en cifra y barra.
- **Este mes**: días distintos del mes actual en los que has estudiado.
- **Mapa de calor**: cada día de las últimas 12 semanas, coloreado según los minutos
  estudiados ese día. Pasa el puntero, enfoca con el teclado o toca una celda para ver la
  fecha y el total.
- **Temas Claro, Oscuro y Medio**: se eligen en la cabecera y se recuerdan entre visitas. Si
  nunca has elegido, la app sigue la preferencia de tu dispositivo.
- **Confeti** al superar tu récord de racha.
- Interfaz en español, responsive, navegable con teclado y compatible con lectores de
  pantalla y con la reducción de movimiento.

## Cómo usarla

No hay que instalar nada. Abre `index.html` con doble clic en el navegador.

1. En **Nueva sesión**, elige la fecha (hoy por defecto), escribe el tema y los minutos.
   La fecha no puede ser futura y los minutos deben ser mayores que 0.
2. Pulsa **Guardar sesión**. La lista, la racha, el resumen y el mapa se actualizan al
   instante.
3. Opcional: en **Esta semana**, escribe un objetivo en minutos y pulsa **Guardar
   objetivo** (o Enter). Verás una barra y textos como «Objetivo cumplido» o «superado ·
   N min por encima». Para quitarlo, usa **Quitar** o confirma el campo vacío.
4. Cambia el tema cuando quieras con las opciones **Claro / Oscuro / Medio** de la cabecera.

Las sesiones y las preferencias viven en el `localStorage` de ese navegador y dispositivo:
no hay cuentas ni sincronización. Si borras los datos del sitio, se pierde el historial.

### Reiniciar el diario

Abre las herramientas de desarrollo del navegador (F12) → **Application** → **Local
Storage** y borra estas claves:

- `diario-de-estudio` (historial de sesiones)
- `diario-de-estudio-tema` (tema elegido)
- `diario-de-estudio-objetivo` (objetivo semanal)

## Cómo levantarla

No necesita servidor ni compilación: al ser archivos estáticos, abrir `index.html` con
doble clic es suficiente (funciona desde `file://`).

Si prefieres servirla con un servidor local, cualquier servidor estático vale. Por ejemplo,
con Python instalado:

```bash
python -m http.server 8000
```

Y luego abre <http://localhost:8000>. Es opcional: la app no lo necesita para funcionar.

## Tests

La lógica pura (fechas, rachas, mapa de calor, temas y objetivo semanal) tiene tests con el
runner integrado de Node.js. No hace falta instalar nada:

```bash
node --test
```

## Estructura del proyecto

| Archivo | Para qué sirve |
| --- | --- |
| `index.html` | Estructura de la página. |
| `styles.css` | Estilos, temas y diseño responsive. |
| `app.js` | Formulario, lista de sesiones, racha, resumen y confeti. |
| `date-utils.js` | Utilidades de fechas locales (sin UTC). |
| `heatmap-logic.js` / `heatmap-ui.js` | Cálculo y pintado del mapa de calor. |
| `theme-logic.js` / `theme-ui.js` | Elección y persistencia de temas. |
| `weekly-goal-logic.js` / `weekly-goal-ui.js` | Objetivo semanal y su progreso. |
| `*.test.js` | Tests de la lógica pura. |
| `specs/` | Especificaciones y planes de cada funcionalidad. |
| `docs/constitucion.md` | Principios del proyecto. |

## Detalles que conviene saber

- Todas las fechas se trabajan en **hora local**; nunca en UTC. La semana va de **lunes a
  domingo** y las fechas futuras no suman a ninguna cifra.
- Varias sesiones del mismo día cuentan como un solo día para la racha, el mes y el mapa, y
  sus minutos se suman para la semana y el mapa.
- Los cálculos se hacen al vuelo a partir de las sesiones; no se guardan contadores.
- El objetivo semanal es opcional, se guarda aparte del historial y se mantiene entre
  semanas; su progreso vuelve a cero cada lunes.
- Si el historial guardado tiene entradas corruptas, se ignoran al mostrar las cifras sin
  borrarlas.
