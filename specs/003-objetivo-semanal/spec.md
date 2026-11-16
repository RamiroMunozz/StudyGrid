# Spec 003 — Objetivo semanal de estudio

Estado: aprobada

## 1. Contexto y objetivo

El Diario de Estudio ya indica cuántos minutos se han estudiado esta semana (lunes a
domingo, fecha local), además de la racha, la mejor racha, los días del mes y el mapa de
calor. Esas cifras dicen cuánto se ha estudiado, pero no contra qué: sin una meta, un total
de 150 minutos no se puede leer como "voy bien" ni como "me falta".

Esta funcionalidad permite fijar un objetivo semanal en minutos y ver el progreso de la
semana en curso frente a ese objetivo, con una cifra y una barra. El objetivo se recuerda
entre visitas y entre semanas; el progreso se reinicia cada lunes porque se calcula al vuelo
a partir de las sesiones. El propósito es convertir el total semanal en una meta alcanzable
que motive a estudiar antes de que acabe la semana, sin tocar el historial ni inventar un
segundo cálculo de la semana.

## 2. Usuarios

- Estudiante que ya registra sesiones y quiere una meta semanal concreta para organizarse.
- Estudiante que empieza y necesita un número pequeño y realista para no abandonar.
- Estudiante que estudia en varios ratos al día y quiere ver que los ratos suman.
- Usuario que navega con teclado, con lector de pantalla o desde el móvil y necesita leer el
  progreso sin depender del color ni de la barra.

## 3. Historias de usuario

- **HU-1.** Como estudiante, quiero fijar cuántos minutos quiero estudiar cada semana para
  tener una meta clara.
- **HU-2.** Como estudiante, quiero ver cuánto llevo de esa meta esta semana para saber si
  voy por buen camino.
- **HU-3.** Como estudiante, quiero cambiar o quitar el objetivo cuando ya no me encaje,
  sin perder mis sesiones.
- **HU-4.** Como estudiante, quiero que el objetivo siga ahí la semana que viene, pero que
  el progreso empiece de cero el lunes para competir contra la misma meta cada semana.
- **HU-5.** Como estudiante, quiero saber cuándo he cumplido o superado el objetivo para
  sentir el esfuerzo reconocido.
- **HU-6.** Como usuario que navega con teclado o lector de pantalla, quiero fijar el
  objetivo y leer el progreso sin ratón y sin depender del color.

## 4. Definiciones

- **Objetivo semanal**: cantidad de minutos que el usuario quiere estudiar en una semana.
  Es una meta, no un registro: no se suma a las sesiones.
- **Progreso de la semana**: minutos estudiados en la semana en curso, con la misma regla
  que el total semanal que ya muestra la app.
- **Semana**: de lunes a domingo según la fecha local del usuario. Empieza el lunes a las
  00:00 y termina el domingo a las 23:59.
- **Objetivo cumplido**: el progreso es exactamente igual al objetivo.
- **Objetivo superado**: el progreso es mayor que el objetivo.
- **Sin objetivo**: no hay meta fijada; la app solo muestra los minutos de la semana.
- **Objetivo vigente**: el único objetivo que existe en un momento dado. No hay historial de
  objetivos por semana.
- **Confirmar**: fijar o cambiar el objetivo mediante una acción explícita del usuario: pulsar
  el botón "Guardar objetivo" o pulsar Enter con el foco en el campo del objetivo. Escribir
  en el campo sin confirmar no modifica el objetivo vigente ni el valor almacenado.
- **Pista (fondo) de la barra**: la parte fija que representa el recorrido total del objetivo.
- **Relleno de la barra**: la parte variable que representa el progreso respecto del objetivo.
- **Borde de la barra**: el contorno visible de la pista, si existe; forma parte de los
  componentes no textuales medibles.

## 5. Requisitos funcionales

### RF-1 — Fijar el objetivo

El sistema deberá permitir fijar un objetivo semanal expresado en minutos enteros, entre 1 y
10 080 minutos (una semana completa). Tener objetivo será opcional: sin objetivo la app
funcionará igual y solo mostrará los minutos de la semana.

- CUANDO el usuario escriba un valor válido y lo confirme, EL SISTEMA deberá guardarlo y
  mostrar el progreso de la semana en curso frente a ese objetivo, sin recargar la página.
- EL SISTEMA deberá mostrar el control para fijar o cambiar el objetivo dentro de la tarjeta
  de resumen, junto al bloque "Esta semana".
- EL SISTEMA no deberá mostrar una tarjeta nueva ni un control en la cabecera para el
  objetivo.
- EL SISTEMA deberá mostrar ese control de forma visible siempre que no exista objetivo.
- EL SISTEMA deberá ofrecer un botón visible "Guardar objetivo" y un campo de entrada con
  etiqueta asociada para fijar o cambiar el valor.
- CUANDO el usuario pulse el botón "Guardar objetivo" o pulse Enter con el foco en el campo,
  EL SISTEMA deberá interpretar esa acción como confirmar el valor escrito en ese momento.
- MIENTRAS el usuario escriba o modifique el campo sin confirmar, EL SISTEMA no deberá
  guardar, sustituir ni quitar el objetivo vigente.
- EL SISTEMA deberá aceptar como válido solo un número entero (tipo numérico entero) entre 1
  y 10 080 minutos. Los decimales, los negativos, el texto y las cadenas numéricas no deberán
  guardarse como objetivo.
- SI el valor está por debajo de 1 o por encima de 10 080 minutos, ENTONCES EL SISTEMA
  deberá rechazarlo, no modificar el objetivo vigente y mostrar un mensaje en español que
  indique el rango admitido.
- SI el usuario confirma 0, ENTONCES EL SISTEMA deberá rechazarlo con un mensaje en español
  que indique que para no tener objetivo hay que confirmar el campo vacío o usar el botón
  "Quitar", no modificar el objetivo vigente si existía y no guardar 0. El 0 no significa
  "sin objetivo".
- SI el campo está vacío al confirmar, ENTONCES EL SISTEMA deberá tratarlo como quitar el
  objetivo (RF-2) y no como un error.
- SI ya existe un objetivo y el usuario confirma otro valor válido, ENTONCES EL SISTEMA
  deberá sustituirlo por el nuevo, no sumarlo ni guardar los dos.

### RF-2 — Cambiar y quitar el objetivo

El sistema deberá permitir cambiar el objetivo cuantas veces haga falta y quitarlo del todo.

- EL SISTEMA deberá ofrecer un botón "Quitar" visible cuando exista un objetivo, además de
  aceptar confirmar el campo vacío como forma de quitarlo.
- CUANDO el usuario cambie el objetivo con un valor válido confirmado, EL SISTEMA deberá
  recalcular el progreso de la semana en curso con el nuevo valor de inmediato y sin recargar.
- CUANDO el usuario quite el objetivo, EL SISTEMA deberá dejar de mostrar la barra y la
  comparación, conservar los minutos de la semana y todas las sesiones, y eliminar el
  objetivo guardado para que no reaparezca al recargar.
- SI no había objetivo vigente y el usuario confirma el campo vacío o usa la acción
  equivalente a quitar, ENTONCES EL SISTEMA deberá mantener el estado "sin objetivo" sin
  mostrar errores ni avisos.
- SI el usuario quita el objetivo y fija otro la misma semana, ENTONCES EL SISTEMA deberá
  usar el progreso ya acumulado de esa semana, no empezar de cero.
- SI el nuevo objetivo confirmado es menor o igual que los minutos ya estudiados esta semana,
  ENTONCES EL SISTEMA deberá mostrar el objetivo como cumplido o superado desde ese momento.
- El sistema no deberá pedir confirmación para cambiar ni para quitar el objetivo: quitarlo
  no pone en riesgo ninguna sesión y el valor se puede volver a fijar.

### RF-3 — Cálculo del progreso

El sistema deberá calcular el progreso de la semana en curso con la misma regla que el total
semanal que ya muestra la app: de lunes a domingo en fecha local, sumando todas las sesiones
de la semana y redondeando al minuto entero más cercano.

- CUANDO un día tenga varias sesiones, EL SISTEMA deberá sumar los minutos de todas.
- SI una sesión tiene una fecha anterior al lunes de esta semana o posterior al domingo,
  ENTONCES EL SISTEMA no deberá contarla en el progreso.
- SI una sesión tiene fecha futura, minutos no numéricos o minutos menores o iguales que
  cero, ENTONCES EL SISTEMA no deberá contarla en el progreso.
- EL SISTEMA deberá mostrar como progreso exactamente el mismo número de minutos que
  muestra el total semanal de la app en ese momento, sin diferencias de redondeo.
- El sistema no deberá guardar el progreso: deberá calcularlo cada vez a partir de las
  sesiones.

### RF-4 — Mostrar el progreso

Cuando exista un objetivo, el sistema deberá mostrar el progreso con una cifra y una barra
de progreso.

- EL SISTEMA deberá mostrar la cifra estudiada, el objetivo y la unidad, por ejemplo
  "120 / 300 min".
- EL SISTEMA deberá mostrar una barra proporcional al progreso respecto del objetivo, con
  partes medibles y visibles: pista (fondo), relleno y, si se usa, borde.
- CUANDO los minutos igualen o superen el objetivo, EL SISTEMA deberá mostrar la barra llena
  al 100 % y el relleno no deberá desbordar la pista.
- EL SISTEMA no deberá mostrar el porcentaje en el texto visible; el porcentaje solo deberá
  exponerse en el texto destinado a lectores de pantalla (RF-9).
- CUANDO el progreso supere el objetivo, EL SISTEMA deberá indicar el exceso en texto como
  "superado · N min por encima".
- EL SISTEMA deberá indicar el estado de la semana en texto, además de la barra.
- La distinción entre "en progreso", "Objetivo cumplido" y "superado · N min por encima"
  deberá apoyarse en texto, no solo en el color o en el llenado de la barra.
- MIENTRAS no exista objetivo, EL SISTEMA no deberá mostrar barra ni comparación, solo los
  minutos de la semana como hasta ahora.

### RF-5 — Objetivo cumplido y superado

Cuando los minutos de la semana alcancen el objetivo, el sistema deberá reconocerlo en
texto, sin depender del color y sin celebración propia.

- CUANDO el progreso sea exactamente igual al objetivo, EL SISTEMA deberá mostrar el texto
  "Objetivo cumplido".
- CUANDO el progreso supere el objetivo, EL SISTEMA deberá mostrar el texto "superado · N min
  por encima", donde N es el exceso en minutos.
- El sistema no deberá mostrar el estado de cumplido ni de superado cuando el progreso sea
  menor que el objetivo.
- El sistema no deberá lanzar confeti, animaciones ni ninguna celebración propia al fijar,
  cumplir, superar o dejar de cumplir el objetivo.
- El sistema no deberá guardar ningún estado de "objetivo cumplido" ni de celebración por
  semana.
- El sistema no deberá reutilizar ni modificar el confeti del récord de racha, que sigue
  rigiéndose por su regla actual.
- SI el usuario ya había cumplido o superado el objetivo y guarda otra sesión, ENTONCES EL
  SISTEMA deberá mantener el estado visible correspondiente sin animación ni anuncio repetido.
- SI el usuario quita el objetivo, ENTONCES EL SISTEMA deberá dejar de mostrar los textos
  de cumplido o superado.

### RF-6 — Persistencia y reinicio semanal

El sistema deberá recordar el objetivo entre visitas y entre semanas, en el mismo navegador
y dispositivo.

- El sistema deberá persistir el objetivo en una clave propia de `localStorage`,
  `diario-de-estudio-objetivo`, distinta de `diario-de-estudio` y de `diario-de-estudio-tema`.
  "Independiente del historial" implica clave distinta y sin migración del historial.
- EL SISTEMA deberá persistir únicamente el valor del objetivo vigente como un número entero
  (tipo numérico) entre 1 y 10 080 minutos. No deberá persistir progreso, estado de
  cumplimiento ni historial de objetivos.
- La preferencia del objetivo no deberá caducar por sí sola ni cambiar de valor sin que el
  usuario lo pida.
- CUANDO el usuario confirme una elección válida y se pueda escribir, EL SISTEMA deberá
  reemplazar el valor almacenado por la nueva elección válida.
- CUANDO empiece una semana nueva (lunes a las 00:00, hora local), EL SISTEMA deberá mostrar
  el progreso de la nueva semana, que empieza en 0 minutos, y conservar el objetivo.
- EL SISTEMA deberá conservar el objetivo aunque se borren todas las sesiones.
- SI el usuario confirma una elección válida pero no se puede escribir el objetivo, ENTONCES
  EL SISTEMA deberá aplicar el objetivo durante esa visita y avisar de forma discreta y en
  español de que no se conservará al cerrar.
- SI no se puede guardar el objetivo por otro motivo de escritura, ENTONCES EL SISTEMA
  deberá aplicarlo durante esa visita y avisar de forma discreta y en español de que no se
  conservará al cerrar.
- El sistema no deberá guardar ningún estado de "objetivo cumplido" ni de celebración por
  semana.

### RF-7 — Actualización y reinicio sin recargar

Cuando el usuario guarde una sesión o cambie la semana, el sistema deberá actualizar el
progreso sin recargar la página.

- CUANDO el usuario abra la app, EL SISTEMA deberá calcular y mostrar el progreso de la
  semana en curso con el objetivo vigente.
- SI la sesión guardada cae dentro de la semana en curso, ENTONCES EL SISTEMA deberá sumar
  sus minutos al progreso y actualizar la cifra, la barra y el estado.
- SI la sesión guardada cae en una semana anterior, ENTONCES EL SISTEMA no deberá cambiar el
  progreso de la semana en curso.
- SI la sesión guardada no se puede guardar por un error del formulario, ENTONCES EL SISTEMA
  no deberá cambiar el progreso.
- MIENTRAS la app esté abierta al cambiar de semana, EL SISTEMA deberá reiniciar el progreso
  a la semana nueva sin recargar, sin intervención del usuario y con una tolerancia menor de
  un minuto respecto al cambio real de semana.
- CUANDO el usuario guarde una sesión, EL SISTEMA deberá recalcular el progreso usando la
  semana en curso en ese momento, de modo que un guardado tras el cambio de semana no muestre
  la semana anterior.

### RF-8 — Valores no válidos y almacenamiento no disponible

- SI el objetivo guardado no cumple la validación estricta, ENTONCES EL SISTEMA deberá
  tratarlo como si no hubiera objetivo, sin mostrar errores y sin borrarlo del
  almacenamiento. La validación estricta acepta solo un valor de tipo número, entero, finito,
  entre 1 y 10 080. Son inválidos (lista no exhaustiva, alineada con los casos límite): `-30`,
  `0`, `12.5`, `"300"` (cadena numérica), `null`, objetos, `NaN`, `Infinity`, `999999` y
  cualquier valor fuera de rango o de tipo distinto de número entero.
- SI no se puede leer el objetivo guardado, ENTONCES EL SISTEMA deberá comportarse como si
  no existiera.
- SI los datos del historial no se pueden leer, ENTONCES EL SISTEMA deberá seguir mostrando
  el objetivo con un progreso de 0 minutos, sin errores.
- SI el historial guardado no es una lista válida, ENTONCES EL SISTEMA deberá tratarlo como
  vacío para el progreso, sin borrarlo.
- SI las entradas del historial están corruptas, ENTONCES EL SISTEMA deberá ignorarlas al
  calcular el progreso, como ya hace con el resto de cifras.

### RF-9 — Accesibilidad

El sistema deberá permitir fijar el objetivo y leer el progreso sin depender de la vista del
color ni del ratón.

- EL SISTEMA deberá exponer la barra como un indicador de progreso con valor mínimo 0, valor
  máximo igual al objetivo y valor actual igual al progreso, limitado al máximo.
- EL SISTEMA deberá ofrecer el valor real en texto para lectores de pantalla, por ejemplo
  "120 de 300 minutos (40 %)", con el porcentaje redondeado al entero más cercano.
- EL SISTEMA deberá exponer como texto si el objetivo está cumplido o superado, no solo con
  el llenado o el color de la barra.
- EL SISTEMA deberá permitir alcanzar el campo del objetivo, el botón "Guardar objetivo" y el
  botón "Quitar" solo con el teclado, con etiquetas asociadas y un orden de tabulación lógico.
- SI el valor del objetivo no es válido, ENTONCES EL SISTEMA deberá anunciar el mensaje de
  error a los lectores de pantalla.
- EL SISTEMA no deberá provocar que se vuelvan a anunciar la racha, la mejor racha, los días
  del mes ni el mapa al fijar, cambiar, quitar el objetivo o actualizar el progreso. El
  anuncio deberá limitarse al progreso y a los mensajes del propio objetivo.
- El contraste entre texto y fondo deberá cumplir WCAG 2.2 AA en los tres temas.
- Los componentes no textuales de la barra (pista/fondo, relleno y, si se usa, borde) y de
  los controles del objetivo deberán tener al menos 3:1 de contraste frente a su entorno en
  los tres temas. El relleno deberá distinguirse de la pista al menos 3:1 cuando el progreso
  sea mayor que 0 y menor que el objetivo; en los estados "Objetivo cumplido" y "superado" la
  distinción del estado se apoya en texto (no solo en color). Estos criterios son coherentes
  con los umbrales de componentes no textuales de la spec 002.
- SI el usuario tiene activada la reducción de movimiento, ENTONCES EL SISTEMA no deberá
  animar el llenado de la barra.
- Con el texto ampliado al 200 %, la cifra, la barra y los controles deberán seguir legibles y
  alcanzables sin desplazamiento horizontal.

### RF-10 — El objetivo no toca el historial

El sistema deberá guardar el objetivo como un dato propio, independiente del historial de
sesiones.

- El objetivo se persistirá únicamente en la clave `diario-de-estudio-objetivo`, distinta de
  `diario-de-estudio`; no habrá migración del historial ni lectura del historial para obtener
  el objetivo.
- El sistema no deberá modificar, migrar, renumerar ni borrar sesiones al fijar, cambiar o
  quitar el objetivo.
- El sistema no deberá añadir campos nuevos a las sesiones guardadas ni cambiar su formato.
- SI se borra solo el objetivo, ENTONCES EL SISTEMA deberá conservar íntegro el historial y
  sus cifras.
- SI se borra solo el historial, ENTONCES EL SISTEMA deberá conservar el objetivo y mostrar
  un progreso de 0 minutos.
- El sistema no deberá impedir registrar sesiones porque el objetivo no se pueda leer o
  guardar.

### RF-11 — Estado sin objetivo y semana vacía

- MIENTRAS no exista objetivo, EL SISTEMA deberá mostrar los minutos de la semana como hoy y
  una invitación en español a fijar uno ("Fija un objetivo semanal").
- SI existe objetivo y la semana no tiene sesiones, ENTONCES EL SISTEMA deberá mostrar
  0 minutos, la barra vacía y el texto "Sin sesiones esta semana", sin errores.
- SI existe objetivo y todas las sesiones de la semana son futuras o no válidas, ENTONCES
  EL SISTEMA deberá mostrar el mismo estado que una semana vacía.

## 6. Requisitos no funcionales

- **RNF-1.** La funcionalidad deberá funcionar sin conexión y sin instalar nada.
- **RNF-2.** A 360 px de ancho, la cifra, la barra y los controles deberán verse completos sin
  desplazamiento horizontal.
- **RNF-3.** Los controles del objetivo (campo, "Guardar objetivo" y "Quitar") deberán tener
  un área táctil de al menos 24 × 24 px.
- **RNF-4.** El progreso deberá actualizarse sin retraso perceptible, en menos de 100 ms tras
  guardar una sesión o cambiar el objetivo.
- **RNF-5.** Los textos deberán estar en español y las semanas se calcularán siempre en hora
  local, sin usar fechas en UTC.
- **RNF-6.** El sistema no deberá enviar datos a la red ni cargar recursos externos.
- **RNF-7.** El objetivo será un dato nuevo e independiente; los historiales existentes se
  leerán sin migración y no se perderá ninguna sesión.
- **RNF-8.** La validación del objetivo, el cálculo del progreso y el estado de cumplimiento
  deberán poder verificarse de forma automática sin interactuar con la interfaz, usando lógica
  pura con "hoy" inyectado. La actualización periódica del progreso en la app abierta al
  cambiar de semana (temporizador, tolerancia < 1 minuto) se verificará de forma manual, por
  ejemplo simulando el cruce de domingo a lunes.
- **RNF-9.** Con el texto al 200 % la interfaz seguirá siendo legible y utilizable.
- **RNF-10.** El contraste de texto y de componentes no textuales (pista, relleno, borde de la
  barra si aplica y controles) deberá cumplir WCAG 2.2 AA en Claro, Oscuro y Medio, de forma
  coherente con los umbrales de la spec 002.
- **RNF-11.** Con la app abierta, el cambio de semana deberá reflejarse sin recargar y con una
  tolerancia menor de un minuto.

## 7. Casos límite

- Sin objetivo: se ven los minutos de la semana y la invitación, sin barra ni errores.
- Sin objetivo previo y confirmar campo vacío (o acción equivalente a quitar): se mantiene el
  estado "sin objetivo", sin errores ni avisos.
- Objetivo fijado con el historial vacío: 0 / 300 min, barra vacía y "Sin sesiones esta
  semana".
- Objetivo de 1 minuto y ninguna sesión: 0 / 1 min y barra vacía.
- Objetivo de 1 minuto y una sesión de 1 minuto: "Objetivo cumplido".
- Progreso justo en el objetivo: "Objetivo cumplido", barra llena, sin exceso.
- Progreso un minuto por encima: "superado · 1 min por encima".
- Progreso el doble del objetivo: barra llena sin desbordar y exceso indicado en texto.
- El usuario confirma 0: se rechaza con mensaje, no se guarda y se conserva el objetivo
  vigente si existía.
- El usuario confirma el campo vacío o pulsa "Quitar" con objetivo vigente: desaparece el
  objetivo y no reaparece al recargar.
- El usuario escribe un valor válido pero no confirma (no pulsa "Guardar objetivo" ni Enter):
  el objetivo vigente y el valor almacenado no cambian.
- Sesión de 20 y 30 minutos el mismo día: suman 50 al progreso.
- Sesión con decimales: el total se redondea al minuto entero, igual que el total semanal.
- Sesión del domingo a las 23:59: cuenta en la semana que termina.
- Sesión del lunes a las 00:00: cuenta en la semana nueva.
- Sesión del domingo anterior: no cuenta.
- Sesión con fecha futura: no cuenta.
- Sesión de una semana vieja guardada desde el formulario: no cambia el progreso.
- Semana que cruza un cambio de mes, de año o un 29 de febrero: cuenta bien.
- Semana con cambio de hora estacional: no se duplican ni se pierden minutos.
- La app abierta pasa del domingo 23:59 al lunes 00:01: el progreso pasa a 0, el objetivo se
  mantiene y la barra y el estado se actualizan sin recargar, con tolerancia menor de un
  minuto.
- Cambio de objetivo a mitad de semana con progreso ya acumulado: se recalcula contra el
  nuevo valor sin perder minutos.
- Objetivo cambiado a menos de lo ya estudiado: aparece cumplido o superado al instante.
- Quitar el objetivo: desaparecen barra y comparación; sesiones y total semanal intactos.
- Objetivo guardado inválido (`-30`, `0`, `12.5`, `"300"`, `null`, un objeto, `NaN`,
  `Infinity`, `999999`): se ignora sin errores y sin borrarlo del almacenamiento.
- Almacenamiento bloqueado al leer: la app funciona sin objetivo.
- Almacenamiento que se lee pero rechaza la escritura al confirmar una elección válida: el
  objetivo se ve en esa visita y se avisa de que no se conservará.
- Dos pestañas abiertas con objetivos distintos: cada una mantiene el suyo hasta recargar.
- 360 px de ancho: cifra, barra y controles sin desplazamiento horizontal.
- Texto al 200 %: cifra, barra y controles legibles y alcanzables con teclado.
- Recorrido con lector de pantalla: se anuncia el valor y el estado del objetivo, sin
  reanunciar la racha, la mejor racha, los días del mes ni el mapa.
- Movimiento reducido activado: la barra no se anima al llenarse.
- En los tres temas, pista, relleno y borde de la barra (si aplica) cumplen los contrastes de
  componentes no textuales y el estado cumplido/superado se distingue por texto.

## 8. Fuera de alcance

- Objetivos diarios, mensuales, anuales o por tema.
- Varios objetivos a la vez o un objetivo por asignatura.
- Historial de objetivos, comparación con semanas anteriores o racha de semanas cumplidas.
- Objetivos sugeridos, automáticos o calculados a partir del historial.
- Recordatorios, notificaciones, avisos al móvil o correos.
- Bloqueo o aviso al superar un límite de estudio.
- Penalizaciones, mensajes de reproche o estados de "fallo" al no llegar al objetivo.
- Confeti, animaciones o celebraciones propias para el objetivo. El confeti del récord de
  racha no se reutiliza ni se modifica.
- Cambiar la racha, la mejor racha, el mapa de calor, el mes o el confeti ya existentes.
- Sincronizar el objetivo entre dispositivos, navegadores o cuentas.
- Exportar o importar el objetivo.
- Cambiar la forma, el formato o la clave del historial de sesiones.
- Traducir la interfaz a otros idiomas.

## 9. Criterios de finalización

- [ ] RF-1 a RF-11 verificados con datos de prueba.
- [ ] El progreso coincide siempre con el total semanal de la app, incluidos los límites de
      semana y las fechas futuras.
- [ ] Las pruebas automáticas de la lógica (validación del objetivo, progreso semanal,
      cumplido/superado y valores inválidos) están en verde con `node --test`, con "hoy"
      inyectado.
- [ ] Fijar (botón "Guardar objetivo" o Enter), cambiar y quitar (botón "Quitar" o confirmar
      campo vacío) el objetivo funciona sin recargar y sin perder sesiones.
- [ ] El objetivo se conserva tras recargar y el progreso vuelve a 0 al empezar la semana. La
      lógica de detección de semana se verifica con "hoy" inyectado; la actualización periódica
      en la app abierta al pasar de domingo 23:59 a lunes 00:01 (tolerancia < 1 min) se
      verifica de forma manual simulando el cruce.
- [ ] A 360 px y con el texto al 200 % la cifra, la barra y los controles se ven sin
      desplazamiento horizontal.
- [ ] La barra y el estado se leen con lector de pantalla y se recorren con teclado, sin
      reanunciar racha, mejor racha, días del mes ni mapa.
- [ ] Los contrastes de texto y de componentes no textuales de la barra (pista, relleno, borde
      si aplica) y controles cumplen WCAG 2.2 AA en los tres temas; la distinción
      cumplido/superado se apoya en texto.
- [ ] No hay errores en la consola en ningún caso límite.
- [ ] Los datos existentes se leen sin migración y no se pierde ninguna sesión.
- [ ] `MEMORY.md` queda actualizado.

## 10. Dudas abiertas

- Ninguna.

## 11. Decisiones

- **Objetivo opcional.** La app funciona igual sin objetivo. Se quita confirmando el campo
  vacío o con un botón "Quitar". Escribir 0 se rechaza con mensaje y no significa "sin
  objetivo". Motivo: la meta es voluntaria y el 0 no expresa una intención clara de quitarla.
  Alternativa descartada: tratar 0 como "sin objetivo" o hacer el objetivo obligatorio.
- **Confirmación explícita.** Fijar o cambiar el objetivo requiere confirmar (botón "Guardar
  objetivo" o Enter en el campo). Escribir sin confirmar no cambia nada. Motivo: hace el
  comportamiento observable y verificable, y evita cambios accidentales. Alternativa
  descartada: guardar al escribir o al salir del campo sin acción explícita.
- **Ubicación en la tarjeta de resumen.** El control y el progreso van dentro de la tarjeta de
  resumen, junto al bloque "Esta semana". Motivo: el progreso compara con el total semanal y
  mantenerlos juntos facilita entender la cifra. Alternativas descartadas: una tarjeta nueva
  o un control en la cabecera.
- **Presentación con cifra y barra.** Se muestra cifra ("120 / 300 min") y barra de progreso
  con partes medibles (pista, relleno y borde si aplica); el porcentaje solo se expone en
  texto para lectores de pantalla y el exceso se indica en texto ("superado · N min por
  encima"). Motivo: la barra da lectura visual rápida sin saturar el texto visible y el
  lector recibe el porcentaje exacto. Alternativas descartadas: solo cifra/porcentaje sin
  barra, o porcentaje visible siempre.
- **Sin celebración propia.** Solo texto de estado ("Objetivo cumplido" / "superado · N min
  por encima"). No hay animación ni confeti, no se guarda estado de celebración y no se
  reutiliza ni modifica el confeti del récord de racha. Motivo: respeta el significado actual
  del confeti y evita estado adicional. Alternativas descartadas: confeti propio por semana o
  reutilizar el confeti de racha.
- **Persistencia independiente y estricta.** El objetivo se guarda en la clave propia
  `diario-de-estudio-objetivo`, distinta de `diario-de-estudio`, como número entero 1–10080,
  sin migración del historial. La lectura es estricta (tipo y rango); los valores inválidos se
  ignoran sin borrarlos. Motivo: aísla el dato del historial y evita aceptar datos ambiguos.
  Alternativa descartada: compartir clave/campo con el historial o aceptar cadenas numéricas.
- **Reinicio automático de semana.** El progreso se reinicia solo al cambiar la semana sin
  recargar (tolerancia menor de un minuto), se recalcula al guardar una sesión y se calcula al
  abrir la app. Motivo: evita mostrar la semana anterior con la app abierta y mantiene
  coherencia con el total semanal en todo momento. Alternativas descartadas: actualizar solo
  al guardar/volver a la pestaña, o solo al recargar.
- **El objetivo se expresa en minutos enteros, no en horas.** Motivo: toda la app habla de
  minutos (sesiones, total semanal, mapa) y dos unidades obligarían a conversiones.
  Alternativa descartada: un campo doble horas/minutos.
- **Un solo objetivo vigente, sin historial por semana.** Motivo: la petición es una meta
  actual, no un registro; guardar por semana añade datos que nadie ha pedido. Alternativa
  descartada: guardar el objetivo junto a cada semana.
- **El progreso se calcula al vuelo y nunca se guarda.** Motivo: un contador guardado se
  desincroniza al editar o borrar sesiones y al cambiar de semana; calcularlo garantiza que
  coincida con el total semanal. Alternativa descartada: un acumulador persistente.
- **El progreso reutiliza la misma regla del total semanal.** Motivo: dos cálculos distintos
  de "la semana" acabarían mostrando cifras diferentes en la misma pantalla. Alternativa
  descartada: un cálculo propio para el objetivo.
- **El objetivo vive aparte del historial de sesiones.** Motivo: la constitución exige no
  arriesgar los datos del usuario; borrar el objetivo no puede afectar a las sesiones ni al
  contrario. Alternativa descartada: añadir un campo al historial.
- **Rango de 1 a 10 080 minutos.** Motivo: evita erratas absurdas (un 0 o un millón) y
  admite como máximo una semana completa sin descanso. Alternativa descartada: no poner
  límite.
- **Un objetivo guardado inválido se ignora pero no se borra.** Motivo: la app no modifica
  datos que no entiende; el usuario puede corregirlo fijando uno nuevo. Alternativa
  descartada: limpiarlo al leerlo.
- **Si no se puede guardar, se avisa en vez de callar.** Motivo: a diferencia del tema, el
  objetivo es un dato que el usuario cree guardado y perderlo en silencio rompe su confianza.
  Alternativa descartada: el silencio total que usa la spec 002.
- **El exceso se indica en texto, no alargando la barra.** Motivo: una barra que desborda su
  contenedor rompe el diseño a 360 px; la cifra ya comunica el exceso. Alternativa
  descartada: una barra proporcional sin tope.

## 12. Relación con las specs anteriores

Esta spec **deroga** el punto de "Fuera de alcance" de la spec 001 que excluía "objetivos de
estudio". El resto de la 001 sigue vigente: no cambian los rangos del mapa, la suma por día,
el redondeo, la racha, la mejor racha, la semana, el mes ni el confeti de los récords.

Se apoya en el total semanal ya definido en `AGENTS.md` y no lo redefine: el progreso debe
coincidir siempre con esa cifra, incluidos los lunes y domingos, las sesiones futuras y las
varias sesiones del mismo día.

La spec 002 sigue vigente: la cifra, la barra, el control y los mensajes del objetivo deben
usar los colores del tema activo, cumplir WCAG 2.2 AA en los tres temas y no animarse con
movimiento reducido. El control del objetivo no sustituye ni oculta el control de tema. Los
umbrales de contraste de componentes no textuales de la barra y controles se alinean con la
spec 002.

## 13. Riesgos conocidos

- **Anuncio duplicado del resumen.** El bloque semanal es una región que ya se anuncia en voz
  alta; añadir ahí el progreso puede hacer que el lector repita la racha o el total. RF-9 lo
  prohíbe limitando el anuncio al progreso y a los mensajes del propio objetivo.
- **Objetivo menor que lo ya estudiado.** Puede parecer un logro falso; se acepta y se refleja
  como cumplido o superado al instante, sin pedir que se corrija.
- **Cambio de semana a medianoche.** Requiere una comprobación periódica mientras la app está
  abierta para respetar la tolerancia menor de un minuto y el caso domingo 23:59 → lunes
  00:01 sin recarga; esa comprobación periódica se verifica de forma manual.
