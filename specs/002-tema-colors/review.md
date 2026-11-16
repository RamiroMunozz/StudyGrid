# Revisión 002 — Informe único

Fecha: 2026-11-10. Alcance: spec 002 (Temas Claro, Oscuro y Medio) tras su cierre (T1–T9).

> Nota de método: los tres `@reviewer` previstos no pudieron ejecutarse como sesiones
> independientes: el límite de uso gratuito del proveedor rechazó los tres (`Free usage
> limit reached`). Las tres revisiones las hizo el mismo agente en serie, en esta sesión.
> Las revisiones no son independientes entre sí; para revisores ciegos hará falta cuota.

## Veredicto: PASA CON RESERVAS

Sin hallazgos bloqueantes ni mayores. Ningún RF incumplido. Las cinco reservas son
documentales o de margen, y no impiden dar por válida la spec 002.

## Hallazgos (deduplicados)

| # | Severidad | Foco | Hallazgo | Evidencia |
|---|-----------|------|----------|-----------|
| H1 | Menor | Doc | `plan.md` figura "Estado: borrador (pendiente de aprobación)"; `spec.md` dice "implementada". | `plan.md:3`, `spec.md:3` |
| H2 | Menor | Const. 6 | Nombres de código en español (`resolverTema`, `esTemaValido`) frente al principio "código en inglés", e inconsistentes con `date-utils.js` (inglés). | `theme-logic.js:12-74`, `docs/constitucion.md` p.6 |
| H3 | Menor | Arq. | Pegamento de arranque duplicado: script inline en `<head>` y `TemaUI.iniciarTema()` resuelven/aplican lo mismo. Idempotente, pero mantenimiento replicado. | `index.html:11-31`, `theme-ui.js:43-51` |
| H4 | Observación | RF-6 | Medio: nivel-2 vs nivel-3 = 1,51:1, pegado al mínimo de 1,5:1. Cualquier retoque de la paleta rompe el umbral sin avisar. | Medición DevTools (#6f9578 / #3f6a52) |
| H5 | Observación | RF-1 | "Fondo del tema Claro" es ambiguo al medir luminancia: escritorio 0,824 / papel 0,923 (≥0,80 en ambos); Medio 0,581 / 0,684 (∈ [0,55, 0,70]); Oscuro 0,006 / 0,012 (≤0,15). | Cálculo sRGB en navegador |
| H6 | Observación | Tests | Plan §7 prometía comprobar que ninguna función toca el DOM; ese test no existe (sí el de no escribir en la clave del historial). | `theme-logic.test.js`, `plan.md` §7 |
| H7 | Observación | SEO | Lighthouse snapshot mobile: Accesibilidad 100, Best Practices 100; fallan meta-description, robots-txt, llms-txt. Fuera del alcance de la spec. | `lighthouse_audit` |

## Qué se comprobó y cumple

**Foco 1 — Constitución y reglas de fechas**
- Sin dependencias ni build (no hay `package*.json`, `file://` funciona). Lógica pura con
  dependencias inyectadas (almacén y consulta del dispositivo), sin DOM ni localStorage
  reales, y sin `new Date` en el tema (p.3). `node --test` 62/62 (p.4). Preferencia en
  clave aparte (`diario-de-estudio-tema`), historial intacto y sin migración (p.5).
  Nada implementado fuera de la spec; RF↔código cuadra con el plan (p.2).
- Fechas: cero `toISOString`, cero `new Date("AAAA-MM-DD")`, cero aritmética por
  milisegundos; toda fecha pasa por `date-utils.js` (mediodía local, semana lunes–domingo,
  mes natural, fechas futuras excluidas). La mecánica de temas no toca ninguna ruta de
  fecha; `local-dates`: sin patrones prohibidos; cambio de tema sin efectos sobre la racha.
- El tema deducido del dispositivo no se guarda: tras recargar en oscuro emulado y sin
  preferencia, `data-theme="oscuro"` y `localStorage` sin clave de tema; con `medio`
  guardado, abre en Medio (RF-3, RF-4).

**Foco 2 — Accesibilidad y móvil (Chrome DevTools)**
- 320×640 (mobile emulado): sin scroll horizontal (`scrollW == innerW == 320`), opciones
  en 2 filas, 33,1 px de alto ≥ 24×24 (RNF-3). 360×740: fila única, sin overflow.
- Texto al 200 % (proxy `font-size:200%` en raíz; la herramienta no emula zoom de página):
  legible y alcanzable a 320 y a ~500 px, sin desplazamiento horizontal (RNF-10).
- Orden de tabulación: foco inicial en la opción "Claro" (fieldset "Tema" precede al
  contenido principal); radios nativos ⇒ teclado y lector sin código extra (RF-9).
- Contraste (RF-9, medido): texto 6,3–15,8:1; bordes fuertes 3,26–3,54:1 (≥3:1); anillo de
  foco ≥5,2:1; confeti 3,64–18,9:1 vs escritorio en los tres temas.
- Cambio de tema: instantáneo (cero `transition` en la hoja), `prefers-reduced-motion`
  oculta el confeti (p.4/RF-9); sin mover foco, formulario ni mapa; regiones `aria-live`
  con texto idéntico antes/después (sin reanuncios) (RF-5, RF-9).
- Consola limpia en los tres temas. Lighthouse snapshot mobile: Accesibilidad 100.
- RNF-5: arranque en `<head>` antes del pintado; no se repintó al navegar (verificación
  por construcción, no por aparato).
- RF-6: niveles 1→4 monotonicidad correcta y adyacentes ≥1,5:1; nivel 0 separado con
  borde visible (1,65–1,75:1); leyenda y globo usan variables de tema.

**Foco 3 — Cobertura de tests**
`node --test`: 62/62 pass, ~0,2 s, sin navegador ni red. 16 tests de tema: RF-3, RF-4,
RF-7, RF-8, RF-10 (lógica pura; tabla de verdad completa; valores inválidos con tipos
reales; almacén que lanza/bloquea). Matriz resumida:

| Cubierto por node --test | Solo manual |
|---|---|
| RF-3, RF-4, RF-7, RF-8, RF-10 | RF-1 (paleta), RF-2 (control), RF-5 (sin efectos), RF-6 (mapa), RF-9 (a11y), RNF-2…RNF-6, RNF-9, RNF-10 |

RF-1/2/5/6/9 son de navegador por definición (la constitución prohíbe añadir herramientas
de medición) y están cubiertos por la checklist del plan §8 (T8). No hay tests
redundantes; las promesas del plan §7 están entregadas salvo el "test de no-DOM" (H6).

## Recomendaciones (pendientes de decisión del usuario)

1. Sincronizar el estado de `plan.md` (H1) y unificar criterio de idioma de nombres (H2),
   o hacer explícita la excepción en la spec/constitución.
2. Fusionar el script de arranque de `<head>` con el camino de `TemaUI.iniciarTema()`
   (H3), o documentar por qué se duplica a propósito (pre-pintado).
3. H4: al tocar la paleta de Medio, re-medir el contraste nivel-2/nivel-3 (1,51:1 hoy).
