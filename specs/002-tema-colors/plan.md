# Plan 002 — Temas Claro, Oscuro y Medio

Estado: borrador (deriva de `spec.md`, pendiente de aprobación)

## 1. Cobertura de requisitos

| Requisito | Dónde se resuelve |
| --- | --- |
| RF-1 | Paleta de los tres temas en `styles.css`; `theme-logic.js` decide cuál aplicar |
| RF-2 | Control en `index.html`; comportamiento y estado en `theme-ui.js` |
| RF-3 | `resolverTema` y `prefiereOscuro` en `theme-logic.js`; arranque temprano |
| RF-4 | `leerTemaGuardado` y `guardarTema`; clave propia de preferencia |
| RF-5 | `theme-ui.js` (solo cambia el atributo del tema) y CSS |
| RF-6 | Variables de nivel en `styles.css`; `heatmap-ui.js` no cambia |
| RF-7 | Sin escucha de cambios del dispositivo; solo se consulta al arrancar |
| RF-8 | Validación estricta y tolerancia a fallos en `theme-logic.js` |
| RF-9 | Marcado accesible del control, contraste de la paleta y ausencia de animación |
| RF-10 | La preferencia va en una clave aparte; nunca se toca la clave del historial |
| RNF-1 a RNF-10 | Sin dependencias, sin red, sin build; verificación manual en §8 |

## 2. Archivos y responsabilidades

- **`index.html`** *(modificado)*
  - Añade el control de tema en la cabecera, debajo del título y el subtítulo: un grupo
    etiquetado "Tema" con tres opciones nativas (Claro, Oscuro, Medio) y sus etiquetas
    visibles.
  - Carga `theme-logic.js` y un arranque mínimo en la cabecera del documento, antes de que
    se pinte el cuerpo, para aplicar el tema sin destellos.
  - Carga `theme-ui.js` antes de `app.js`.
  - No cambia nada del resto de la estructura ni de los textos existentes.

- **`styles.css`** *(modificado)*
  - `:root` queda como tema Claro (la paleta actual).
  - Añade dos bloques de variables, uno para Oscuro y otro para Medio, con la misma lista de
    variables: fondo, papel, tinta, tinta suave, línea, línea fuerte, verde, verde oscuro,
    brasa, resaltador y los cinco niveles del mapa.
  - Añade variables para los colores del confeti y para el anillo de foco.
  - Sustituye los tres colores fijos que aún quedan fuera de variables (etiqueta de "sin
    sesiones" y mensaje de error con su fondo).
  - Da al nivel 0 un borde visible para separarlo del fondo de la tarjeta (RF-6).
  - Estiliza el control de tema como tres opciones contiguas, con área táctil suficiente y
    foco visible, permitiendo salto a dos filas en pantallas estrechas.
  - No define transiciones de color en ningún sitio (RF-5 y RF-9).

- **`theme-logic.js`** *(nuevo)*
  - Funciones puras de decisión y persistencia. Sin DOM, sin `localStorage` global.
  - Mismo patrón que los demás archivos de lógica: IIFE con exportación dual (global en el
    navegador, `module.exports` en Node).
  - Responsabilidad: qué tema toca aplicar y cómo se lee o guarda la preferencia sin romper
    nada (RF-3, RF-4, RF-7, RF-8).

- **`theme-ui.js`** *(nuevo)*
  - Pegamento con la página: aplica el atributo del tema en la raíz, sincroniza qué opción
    aparece marcada, escucha las tres opciones y guarda la elección.
  - No decide nada: toda la decisión viene de `theme-logic.js`.

- **`theme-logic.test.js`** *(nuevo)*
  - Pruebas de `node --test` sobre las funciones puras (§7).

- **`app.js`** *(modificado)*
  - Arranca la interfaz de tema al iniciar.
  - El confeti deja de usar una lista de colores fija y pasa a usar las variables del tema
    activo (RF-9).
  - No cambia ningún cálculo, ni el guardado de sesiones, ni el pintado del mapa.

- **`MEMORY.md`** *(modificado)*
  - Estado, decisiones y comprobaciones pendientes de esta spec.

No se crean dependencias, ni archivos de configuración, ni pasos de build.

## 3. Funciones puras

No hay lógica de fechas, así que **ninguna función recibe "hoy"**. El equivalente son sus
dependencias inyectadas: el almacén y la consulta del tema del dispositivo. Así se pueden
probar sin navegador, como exige el principio 3 de la constitución.

- **`esTemaValido(valor)`** → verdadero solo si el valor es exactamente `"claro"`,
  `"oscuro"` o `"medio"`. Sin recortar espacios ni cambiar mayúsculas (RF-8).
- **`resolverTema(preferencia, dispositivoOscuro)`** → devuelve el tema que se aplica.
  - Preferencia válida → esa preferencia, aunque no coincida con el dispositivo.
  - Preferencia nula o inválida → `"oscuro"` si `dispositivoOscuro` es verdadero, `"claro"`
    en cualquier otro caso.
  - Nunca devuelve `"medio"` por deducción (RF-3, RF-7).
- **`prefiereOscuro(consulta)`** → verdadero si `consulta` existe y su propiedad de
  coincidencia es verdadera; falso si no existe o no se puede leer (RF-3).
- **`leerTemaGuardado(almacen)`** → el tema guardado o nulo.
  - Si `almacen` no existe, la lectura lanza o el valor no es válido → nulo.
  - Nunca propaga errores (RF-8).
- **`guardarTema(almacen, tema)`** → verdadero si se guardó, falso si no se pudo.
  - Valida el tema antes de escribir; envuelve la escritura para no lanzar (RF-4, RF-8).
  - No toca la clave del historial (RF-10).

Tabla de verdad de `resolverTema`:

| Preferencia | Dispositivo oscuro | Resultado |
| --- | --- | --- |
| nula | no | claro |
| nula | sí | oscuro |
| inválida | no | claro |
| inválida | sí | oscuro |
| "medio" | no | medio |
| "claro" | sí | claro |
| "oscuro" | no | oscuro |

## 4. Algoritmo en pseudocódigo

Arranque (antes de pintar el cuerpo):

    LEER almacen, tolerando que no exista o falle
    guardado <- leerTemaGuardado(almacen)
    consulta <- consulta del tema del dispositivo, si el navegador la ofrece
    tema <- resolverTema(guardado, prefiereOscuro(consulta))
    aplicar tema en la raíz del documento
    marcar la opción del tema en el control

Al elegir una opción:

    SI no esTemaValido(opción) ENTONCES salir
    SI opción es el tema ya aplicado ENTONCES salir
    aplicar tema en la raíz del documento
    marcar la opción como activa y las demás como inactivas
    guardarTema(almacen, opción)   // si falla, no se avisa al usuario

Al abrir después de cargar la página:

    sincronizar el control con el tema ya aplicado
    escuchar las tres opciones (un solo escucha para el grupo)

    // No se escucha el cambio de tema del dispositivo (RF-7)

`aplicar tema` consiste en escribir un atributo en el elemento raíz del documento. No hay
recálculo, ni repintado de la lista, ni reubicación del globo.

## 5. Cómo se pinta en la interfaz

- **Un solo punto de verdad.** El tema se representa con un atributo en el elemento raíz
  (`data-theme="claro|oscuro|medio"`). Los estilos leen ese atributo y cambian las variables
  de color. Ninguna otra parte de la app sabe en qué tema está.
- **Todo cuelga de variables.** Fondo, tarjetas, textos, bordes, botones, mensajes, leyenda,
  globo, foco y confeti usan variables. Al cambiar el atributo, el navegador repinta solo y
  no hay que rehacer el mapa ni la lista: por eso el cambio es instantáneo (RNF-4) y no
  mueve nada (RF-5).
- **El mapa no se toca.** `heatmap-ui.js` ya asigna clases `nivel-0` a `nivel-4`; las
  variables por tema cambian el color sin tocar ese archivo ni `heatmap-logic.js`.
- **El confeti hereda el tema.** Cada pieza se colorea con una variable del tema, así que
  también cambia si el tema cambia con la ráfaga en el aire.
- **El control.** Grupo con leyenda "Tema" y tres opciones nativas marcables. Se ve cuál está
  activa por la marca de selección, no solo por el color. Se recorre con las flechas del
  teclado y se activa con espacio o intro, sin código extra.
- **Ubicación.** En la cabecera, después del título y el subtítulo, antes del resto del
  contenido: el orden de tabulación sigue el orden de lectura (RF-9).
- **Arranque.** El tema se aplica antes del primer pintado, desde la cabecera del documento,
  para que no se vea el tema por defecto y luego el elegido (RNF-5).

## 6. Decisiones técnicas y alternativas descartadas

| Decisión | Alternativa descartada | Por qué |
| --- | --- | --- |
| Variables de color por tema en un solo bloque | Duplicar todas las reglas por tema | Duplicar reglas multiplica el mantenimiento y garantiza olvidos; con variables, añadir un tema es copiar un bloque |
| Atributo en la raíz del documento | Clase en el cuerpo | El fondo del cuerpo se pinta antes; con la clase en el cuerpo puede verse un instante del tema por defecto |
| Arranque mínimo en la cabecera del documento | Aplicar el tema al final del cuerpo | Al final, el primer pintado siempre es Claro (destello en Oscuro), justo lo que prohíbe RNF-5 |
| Opciones nativas de selección única con leyenda | Botones con estado manual; lista desplegable | Lo nativo da teclado, foco y anuncio de "seleccionado" gratis; el desplegable cuesta dos toques y esconde la información |
| Clave de preferencia nueva e independiente | Guardar el tema dentro del historial | Tocar el historial obliga a migrar y arriesga sesiones (constitución 5); una clave aparte no cambia nada de lo guardado |
| No guardar el tema deducido | Guardarlo como si fuera elección | El usuario no eligió nada; guardarlo rompe RF-7 y convierte una deducción en preferencia |
| Sin escucha del tema del dispositivo | Seguirlo en vivo | Pisaría la elección del usuario y haría imprevisible la pantalla (RF-7) |
| Sin transición de color | Transición suave entre temas | Añade parpadeo, obliga a un caso especial de movimiento reducido y retrasa el cambio |
| Confeti con variables del tema | Colores fijos o cálculo en JavaScript | Los fijos no se ven en Oscuro; el cálculo obliga a repintar a mano y a duplicar la paleta |
| Lógica en un archivo puro y probado | Todo dentro del archivo de interfaz | Sin separación no se puede probar con `node --test` (constitución 3 y 4) |
| Contraste medido a mano con checklist | Añadir un comprobador automático | La constitución prohíbe dependencias y build; el coste no compensa para tres paletas |
| Borde en el nivel 0 | Subir el contraste del nivel 0 | Un gris más oscuro falsearía la lectura de "sin sesiones" y competiría con el nivel 1 |
| Tocar solo `styles.css`, `index.html`, `app.js` y dos archivos nuevos | Reescribir el mapa o la lista | El tema es presentación; reescribir lógica ya probada añade riesgo sin beneficio |

## 7. Estrategia de tests con `node --test`

**Automatizable (nuevo archivo `theme-logic.test.js`):**

- `resolverTema`: la tabla de verdad completa (7 filas) más los casos de preferencia nula,
  cadena vacía, `"OSCURO"`, `" azul "`, número y objeto.
- `prefiereOscuro`: consulta nula, consulta con coincidencia verdadera, con coincidencia
  falsa y objeto sin la propiedad.
- `esTemaValido`: los tres válidos y una lista de inválidos.
- `leerTemaGuardado` con almacén simulado: devuelve valor, devuelve nulo, lanza al leer y
  devuelve basura. En ningún caso debe lanzar.
- `guardarTema`: almacén que acepta, almacén que lanza, tema inválido (no debe escribir).
- Comprobación de que ninguna función toca el DOM ni la clave del historial.

**No automatizable (checklist manual, §8):** colores, contrastes, destellos, tamaños,
teclado y lector de pantalla. Se verifica con Chrome DevTools y un medidor de contraste,
como ya se hace en el proyecto.

**Regla:** cada prueba se escribe en rojo antes del código, y no se pasa a la tarea siguiente
con `node --test` en rojo.

## 8. Verificación manual por requisito

- RF-1: cambiar el tema y comprobar fondo, tarjetas, texto, bordes, formulario, mensajes,
  lista, vacío, globo, leyenda y confeti; medir la luminancia de cada fondo.
- RF-2: 360 px y 320 px sin desplazamiento horizontal; zoom de texto al 200 %; teclado;
  lector de pantalla.
- RF-3: abrir con el dispositivo en claro, en oscuro y sin preferencia; borrar la
  preferencia y reabrir.
- RF-4: elegir, recargar y comprobar que sigue; marcar la opción correcta.
- RF-5: cambiar con el globo abierto, con un error visible y con texto escrito; comprobar
  que no se mueve nada.
- RF-6: los cinco niveles y la leyenda en cada tema; medir contrastes de los umbrales.
- RF-7: cambiar el tema del dispositivo con la app abierta y comprobar que no cambia.
- RF-8: guardar valores inválidos a mano, bloquear el almacenamiento y reabrir.
- RF-9: contraste de texto, controles, foco y confeti; lector de pantalla sin reanuncios.
- RF-10: comparar el historial guardado antes y después de cambiar de tema varias veces.
- RNF-5: recarga con CPU ralentizada y caché desactivada; comprobar que no hay cambio de
  colores tras la carga.

## 9. Riesgos conocidos

- En algunos navegadores, abrir desde archivo local puede bloquear el almacenamiento: RF-8
  ya prevé que el tema se aplique igualmente.
- Las tres etiquetas en la cabecera son el punto más justo en móvil; si no caben en dos
  filas a 360 px, se reducirá el espaciado antes que el tamaño del texto.
- El confeti es lo más sensible al contraste: sus colores se ajustan por tema y se miden a
  mano.
