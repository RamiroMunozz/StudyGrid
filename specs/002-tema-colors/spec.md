# Spec 002 — Temas Claro, Oscuro y Medio

Estado: implementada (T1–T9, `node --test` 62/62)

## 1. Contexto y objetivo

La app se consulta a diario y a cualquier hora, también de noche o con poca luz. Hoy solo
tiene una apariencia clara y brillante, que cansa la vista en sesiones nocturnas, no se
adapta a quien prefiere fondos oscuros ni a quien prefiere un gris suave sin extremos.

Esta funcionalidad añade tres apariencias estables —Claro, Oscuro y Medio— que el usuario
elige con un control siempre visible y que la app recuerda. El objetivo es que estudiar de
noche no obligue a forzar la vista, que quien llega con el dispositivo en oscuro no reciba
un destello blanco, y que el mapa de calor siga siendo legible en los tres casos.

## 2. Usuarios

- Estudiante que repasa de noche y quiere una pantalla oscura que no deslumbre.
- Estudiante que prefiere un gris suave: menos brillo que el blanco y menos fatiga que el
  negro.
- Estudiante que trabaja con el dispositivo en oscuro y espera encontrarse la app igual de
  cómoda desde la primera vez.
- Usuario que navega con teclado, con lector de pantalla o desde el móvil y necesita saber
  qué tema está activo sin depender del color.

## 3. Historias de usuario

- **HU-1.** Como estudiante, quiero cambiar la apariencia de la app para estudiar cómodo
  según la luz que tenga.
- **HU-2.** Como estudiante, quiero que mi elección siga puesta al volver mañana para no
  repetir el cambio cada vez.
- **HU-3.** Como estudiante con el dispositivo en oscuro, quiero que la app abra ya en
  oscuro la primera vez para no recibir un destello blanco.
- **HU-4.** Como estudiante, quiero que el mapa de calor se siga distinguiendo bien en
  cualquier tema para no perder de vista mi constancia.
- **HU-5.** Como usuario que navega con teclado o lector de pantalla, quiero saber cuál es
  el tema activo y poder cambiarlo sin ratón.

## 4. Definiciones

- **Tema**: conjunto de colores de toda la interfaz (fondo, tarjetas, texto, bordes,
  controles, mensajes, foco, confeti y mapa de calor). No cambia tamaños, tipografías,
  textos ni posiciones.
- **Tema del dispositivo**: el ajuste claro/oscuro del sistema operativo o del navegador,
  el que esté disponible; si ambos existen, el que use la app para decidir.
- **Preferencia guardada**: el tema que el usuario eligió explícitamente y que la app
  conserva en ese navegador y dispositivo.
- **Tema deducido**: el tema que la app aplica al abrir cuando no hay preferencia guardada,
  a partir del tema del dispositivo. No es una elección del usuario.
- **Escala del mapa**: los cinco niveles de minutos del mapa, cada uno con un color por
  tema: sin sesiones (0), 1–30, 31–60, 61–120 y más de 120.
- **Luminancia relativa**: la claridad de un color medida de 0 (negro) a 1 (blanco), según
  la definición de WCAG 2.2.
- **Contraste**: la relación de luminancia entre dos colores, expresada como 4,5:1, 3:1…

## 5. Requisitos funcionales

### RF-1 — Tres temas y cobertura

El sistema deberá ofrecer exactamente tres temas: Claro, Oscuro y Medio, y aplicar el tema
activo a toda la interfaz.

- El sistema deberá aplicar el tema a: fondo de la página, cabecera, tarjetas de racha y
  resumen, mapa, leyenda, globo del mapa, formulario, mensajes de error, lista de sesiones,
  estado vacío, confeti y anillo de foco.
- El tema Claro deberá usar un fondo de luminancia relativa igual o mayor que 0,80.
- El tema Medio deberá usar un fondo gris de luminancia relativa entre 0,55 y 0,70, al menos
  0,10 menor que el fondo del tema Claro, con texto principal oscuro.
- El tema Oscuro deberá usar un fondo de luminancia relativa igual o menor que 0,15, con
  texto principal claro.
- El sistema no deberá mezclar colores de dos temas en una misma pantalla, salvo los
  controles que pinta el propio navegador (selector de fecha, barras de desplazamiento).

### RF-2 — Control de tema

El sistema deberá mostrar las tres opciones ("Claro", "Oscuro" y "Medio") juntas y siempre
visibles en la cabecera, y señalar cuál está activa.

- El sistema no deberá esconder las opciones tras un menú ni ocultarlas en pantallas
  estrechas.
- El sistema deberá marcar la opción activa con una señal visible además del color.
- El sistema deberá permitir recorrer las tres opciones y activarlas con el teclado.
- El sistema deberá nombrar el conjunto de opciones para un lector de pantalla.
- Cuando el usuario active una opción, el sistema deberá aplicarla y marcarla de inmediato.
- Si el usuario activa la opción que ya está aplicada, el sistema no deberá cambiar nada ni
  mostrar errores.
- A 360 px de ancho, las tres opciones deberán verse sin desplazamiento horizontal, en una o
  dos filas.
- Con el texto ampliado al 200 %, las tres opciones deberán seguir leyéndose y alcanzarse
  sin desplazamiento horizontal.

### RF-3 — Tema inicial

Cuando la app se abra y no exista una preferencia guardada, el sistema deberá aplicar el
tema Oscuro si el tema del dispositivo es oscuro, y Claro en cualquier otro caso.

- El sistema no deberá guardar el tema deducido: mientras no haya una elección explícita,
  cada apertura volverá a consultar el tema del dispositivo.
- Si el dispositivo no informa de un tema claro u oscuro, o no permite consultarlo, el
  sistema deberá aplicar Claro.
- El sistema no deberá usar nunca Medio como tema deducido.

### RF-4 — Recordar la elección

Cuando el usuario elija un tema, el sistema deberá recordarlo para las próximas veces que
se abra la app en ese navegador y dispositivo.

- El sistema deberá abrir directamente con el tema recordado, sin mostrar otro tema una vez
  la página es visible.
- El sistema deberá marcar como activa, en el control, la opción aplicada al abrir.
- La preferencia no deberá caducar por sí sola.
- Si no se puede guardar la elección, el sistema deberá aplicar el tema en esa visita y
  volver a RF-3 en la siguiente, sin mostrar errores.

### RF-5 — Cambio inmediato y sin efectos secundarios

Cuando el usuario cambie de tema, el sistema deberá aplicarlo a toda la interfaz sin
recargar la página.

- El sistema no deberá modificar las sesiones, la racha, la mejor racha, los totales ni el
  mapa: solo sus colores.
- El sistema no deberá cambiar el foco, ni los valores ya escritos en el formulario, ni la
  posición de la página.
- Si el globo de un día del mapa está abierto, el sistema deberá mantenerlo abierto con la
  misma fecha, los mismos minutos y dentro de la pantalla.
- Si hay un mensaje de error visible, el sistema deberá mantenerlo visible y legible.
- El sistema no deberá animar el cambio de tema.

### RF-6 — Mapa de calor por tema

El sistema deberá mantener los cinco niveles de minutos del mapa y dar a cada tema su propia
escala de color.

- Los rangos deberán seguir siendo: sin sesiones (0 minutos), 1–30, 31–60, 61–120 y más de
  120 minutos.
- El sistema deberá mantener el orden de intensidad en los tres temas: el nivel 4 con más
  contraste frente al fondo de la tarjeta que el 3, el 3 más que el 2, el 2 más que el 1 y el
  1 más que el 0.
- Cada nivel del 1 al 4 deberá tener al menos 1,5:1 de contraste frente al fondo de la
  tarjeta y frente al nivel contiguo.
- El nivel 0 deberá distinguirse del fondo de la tarjeta con un borde visible o al menos
  1,5:1 de contraste.
- En el tema Oscuro la escala deberá aclararse al subir de nivel; en Claro y en Medio deberá
  oscurecerse.
- La leyenda deberá usar los colores del tema activo.
- Los huecos de días futuros o fuera del periodo deberán usar el fondo de la tarjeta y no
  deberán poder recibir foco.

### RF-7 — El dispositivo solo decide cuando no hay elección

Mientras la app esté abierta, si cambia el tema del dispositivo, el sistema deberá mantener
el tema que ya está aplicado.

- El sistema solo deberá consultar el tema del dispositivo al abrir sin preferencia guardada
  o cuando la preferencia guardada no sea válida.

### RF-8 — Valores no válidos y almacenamiento no disponible

Si el tema guardado no es exactamente "claro", "oscuro" ni "medio", el sistema deberá
tratarlo como si no hubiera preferencia guardada, sin mostrar errores.

- Si no se puede leer la preferencia guardada, el sistema deberá aplicar RF-3 sin mostrar
  errores.
- Si los datos del historial no se pueden leer, el sistema no deberá impedir el cambio de
  tema.
- Si no se puede guardar la preferencia, el sistema deberá aplicar RF-4 sin mostrar errores.

### RF-9 — Accesibilidad

El sistema deberá hacer los tres temas utilizables sin depender de la visión del color.

- Cada opción de tema deberá exponer su nombre y si está activa a un lector de pantalla.
- El cambio de tema no deberá provocar que las cifras de racha y resumen se vuelvan a
  anunciar.
- El contraste entre texto y fondo deberá cumplir WCAG 2.2 AA: 4,5:1 para texto normal y
  3:1 para texto grande.
- Los componentes no textuales (anillo de foco, bordes de controles) deberán tener al menos
  3:1 frente a su entorno en los tres temas.
- El confeti deberá tener al menos 3:1 de contraste frente al fondo de cada tema.
- El orden de tabulación deberá seguir el orden de lectura: título y subtítulo, opciones de
  tema y después el resto del contenido.
- Si el usuario tiene activada la reducción de movimiento, el sistema no deberá mostrar
  ninguna animación al cambiar de tema.

### RF-10 — Integridad de los datos

El sistema no deberá borrar, modificar ni migrar las sesiones al cambiar de tema ni al
guardar la preferencia.

- La preferencia deberá guardarse de forma independiente del historial: borrar una no deberá
  afectar a la otra.
- El sistema deberá conservar el historial completo al cambiar de tema cuantas veces haga
  falta.

## 6. Requisitos no funcionales

- **RNF-1.** Los tres temas deberán funcionar sin conexión y sin instalar nada.
- **RNF-2.** A 360 px de ancho y a 320 px, la interfaz deberá verse sin desplazamiento
  horizontal.
- **RNF-3.** Cada opción de tema deberá tener un área táctil de al menos 24 × 24 px.
- **RNF-4.** El cambio de tema deberá verse en menos de 100 ms en un móvil de gama media,
  sin recarga.
- **RNF-5.** Al abrir la app, el primer contenido visible ya deberá usar el tema
  correspondiente y no deberá cambiar de colores después.
- **RNF-6.** El sistema no deberá enviar datos a la red ni cargar recursos externos.
- **RNF-7.** La preferencia será un dato nuevo e independiente; los historiales existentes
  se leerán sin migración.
- **RNF-8.** Los textos de la interfaz estarán en español.
- **RNF-9.** Los contrastes se verificarán con un medidor de contraste estándar; no se
  añadirán herramientas ni dependencias para ello.
- **RNF-10.** Con el texto al 200 % la interfaz seguirá siendo legible y utilizable.

## 7. Casos límite

- Primera visita con el dispositivo en oscuro: abre en Oscuro; con el dispositivo en claro:
  abre en Claro; sin preferencia del dispositivo: abre en Claro.
- Preferencia guardada "Oscuro" con el dispositivo en claro: se respeta Oscuro.
- Preferencia guardada inválida ("azul", "", "OSCURO", un número): se aplica RF-3 sin error.
- Almacenamiento bloqueado para leer la preferencia: se aplica RF-3.
- Almacenamiento que se lee pero rechaza la escritura: el tema se aplica en esa visita y al
  reabrir se aplica RF-3.
- Se borran solo los datos del historial y se conserva la preferencia: manda la preferencia.
- Se borra solo la preferencia: se aplica RF-3.
- El usuario cambia de tema tres veces seguidas: queda la última elección.
- Cambio de tema con el globo del mapa abierto: mismo día, mismos minutos y globo dentro de
  pantalla.
- Cambio de tema con un error de formulario en pantalla: el mensaje se sigue leyendo.
- Cambio de tema con el historial vacío: el mensaje de "sin sesiones" se lee bien.
- Recarga tras elegir Medio: sigue Medio y no aparece antes Claro ni Oscuro.
- Se guarda una sesión en Oscuro y salta el confeti: se ve sobre el fondo.
- El dispositivo cambia a oscuro con la app abierta y Claro elegido: sigue Claro.
- Dos pestañas abiertas: cada una mantiene el tema que tenía hasta que se recargue.
- 360 px y 320 px: las tres opciones se ven sin desplazamiento horizontal.
- Texto al 200 %: las tres opciones siguen leyéndose y se alcanzan con teclado.
- Recorrido con teclado y lector de pantalla: se anuncia el grupo y la opción activa, sin
  reanunciar racha ni resumen.
- El tema del dispositivo no se puede consultar: abre en Claro.

## 8. Fuera de alcance

- Una opción "Automático" permanente que siga el tema del dispositivo en vivo.
- Cambiar de tema según la hora del día.
- Más de tres temas, temas personalizados o un editor de colores.
- Elegir colores distintos por sección o por tarjeta.
- Transiciones o animaciones entre temas.
- Vistas previas en miniatura.
- Cambiar tamaños, tipografías, espaciados, textos o la disposición actual; solo se añade el
  control de tema en la cabecera.
- Sincronizar la preferencia entre dispositivos o cuentas.
- Exportar o importar la preferencia.
- Adaptar la app a la impresión o al guardado como PDF.
- Adaptar la app al alto contraste forzado o al auto-oscurecido del navegador: cuando el
  navegador impone los colores, la app no garantiza RF-1 ni RF-9.
- Traducir la interfaz a otros idiomas.
- Recordar el tema deducido del dispositivo como si fuera una elección.

## 9. Criterios de finalización

- [x] RF-1 a RF-10 verificados con los tres temas.
- [x] El fondo de cada tema cumple el rango de luminancia de RF-1.
- [x] Las tres opciones se ven a 360 px y a 320 px sin desplazamiento horizontal.
- [x] Con el texto al 200 % las tres opciones se leen y se alcanzan sin desplazamiento.
- [x] El control se recorre con teclado y el lector anuncia el grupo y la opción activa.
- [x] El tema elegido sigue puesto tras recargar y no se observa cambio de colores tras la
      carga.
- [x] La primera visita sigue al dispositivo y, sin preferencia, abre en Claro.
- [x] Un valor guardado inválido o un almacenamiento bloqueado no muestran errores.
- [x] El mapa y su leyenda se distinguen en los tres temas según los umbrales de RF-6.
- [x] Los contrastes de texto, controles, foco y confeti cumplen RF-9, medidos con un
      medidor de contraste.
- [x] El cambio de tema no altera sesiones, racha, totales, mapa ni foco.
- [x] La consola no muestra errores en ningún tema.
- [x] `node --test` sigue en verde.
- [x] `MEMORY.md` queda actualizado.

## 10. Dudas abiertas

- Ninguna: las decisiones que resolvían la revisión de QA están en §11.

## 11. Decisiones

- **El tema deducido del dispositivo no se guarda.** Motivo: el usuario no ha elegido nada;
  guardarlo convertiría una deducción en preferencia y RF-7 dejaría de cumplirse. Se descartó
  guardarlo en la primera visita.
- **"Medio" se define por luminancia, no por adjetivos.** Motivo: sin un rango medible no se
  puede verificar que sea distinto de Claro y de Oscuro. Se descartó dejarlo como "gris
  suave".
- **Sin animación al cambiar de tema.** Motivo: el cambio instantáneo evita parpadeos, hace
  innecesario un caso especial de movimiento reducido y no cuesta rendimiento. Se descartó
  una transición de color.
- **Las opciones pueden ocupar dos filas en pantallas estrechas.** Motivo: "siempre
  visibles" y "texto al 200 %" son incompatibles con una única fila a 360 px. Se descartó
  mantener la fila única y ocultar etiquetas.
- **WCAG 2.2 AA con ratios concretos.** Motivo: "AA" a secas no es verificable. Se descartó
  exigir 3:1 a las celdas del mapa: su información también está en el nombre accesible de
  cada celda, como fija la spec 001.
- **El contraste se mide a mano.** Motivo: la constitución prohíbe dependencias y
  herramientas de build. Se descartó añadir un comprobador automático.
- **Impresión, alto contraste forzado y auto-oscurecido quedan fuera.** Motivo: los colores
  los impone el navegador; prometer AA ahí sería una promesa que no se puede cumplir.
- **La preferencia vive aparte del historial.** Motivo: no tocar la forma de los datos
  guardados ni arriesgar sesiones. Se descartó añadir un campo al historial.

## 12. Relación con la spec 001

Esta spec deroga el punto de "Fuera de alcance" de la spec 001 que excluía "temas de color
o un modo oscuro específico"; el resto de la 001 sigue vigente.

No cambia nada del comportamiento del mapa: se mantienen los rangos de minutos, la suma por
día, el redondeo, la racha, la mejor racha, la semana, el mes y el confeti. Solo se añaden
colores por tema.
