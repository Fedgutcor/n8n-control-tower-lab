# Caso de estudio: cómo se construyó este repositorio

> Esto no es un ejemplo hipotético. Es el relato de lo que pasó, con los
> commits para comprobarlo: https://github.com/Fedgutcor/n8n-control-tower-lab

`docs/DIRIGIR-AL-AGENTE.md` cierra con una afirmación fuerte: este
repositorio completo lo construyó un agente de IA en una sesión, dirigido por
alguien que no escribió una línea de código, y el agente se equivocó varias
veces sin darse cuenta solo. Este documento es la prueba de esa afirmación,
contada con los hechos: qué existía al principio, qué salió mal, qué apareció
recién al ejecutar, y qué decisiones se quedaron del lado humano.

---

## 1. El punto de partida

El primer commit del repositorio (`e97b26e`) trae 16 archivos y 943 líneas.
Contiene tres workflows (`01`, `02`, `03`) construidos con nodos
`n8n-nodes-base.code` — es decir, JavaScript escrito a mano dentro de n8n — y
un `GUIA-INTERACTIVA.html` de 225 líneas. No hay guía de montaje, no hay
documento sobre qué proveedor de IA usar, no hay validador. Nadie había
ejecutado nada de esto: ni un `docker compose up`, ni una apertura del HTML en
un navegador.

Eso es lo que existía antes de que un agente de Claude Code tomara la
dirección de la clase. El resto de esta historia describe lo que pasó desde
ahí.

---

## 2. Los errores reales del agente, sin suavizarlos

Estos son el corazón del documento. Ninguno se detectó por revisión de
código; todos costaron algo antes de corregirse.

**Juzgó el laboratorio HTML contando líneas, sin abrirlo.** 225 líneas parecía
poco para un laboratorio completo, así que el agente lo calificó de "baja
calidad" antes de mirar el contenido. El archivo estaba minificado: cada
bloque funcional ocupaba una sola línea larga. Contar líneas midió el
formato, no el contenido. El error no fue de datos — el dato (225) era
correcto — fue de método: usar una métrica que no respondía la pregunta.

**Documentó un mensaje de error de `npx` que no existe.** El agente escribió,
sin haberlo probado, qué error mostraría `npx n8n` con una versión de Node
insuficiente. Cuando alguien lo verificó de verdad, la instalación tardó 9
minutos y falló con `npm ERR! code EPIPE` — un error de red que no menciona
Node por ningún lado. Un estudiante que hubiera seguido la documentación
original habría buscado un síntoma que nunca iba a aparecer.

**Mató un proceso de otro agente tras una comprobación inconcluyente.** Antes
de terminar una tarea, el agente corrió `ps eww` para revisar si cierta
variable de entorno estaba definida en un proceso ajeno. El comando no
devolvió salida. Sin salida no significa "la variable no está" — puede
significar que el propio comando no sirve para esa verificación. El agente lo
trató como una respuesta negativa y terminó el proceso de otro agente que
seguía trabajando.

**Pidió invertir un texto que era correcto.** El validador del repositorio
marcó una advertencia de posible voseo sobre una palabra. El agente, sin leer
el contexto que explicaba por qué esa palabra era válida ahí, le pidió a un
subagente que la cambiara. El subagente **se negó, verificó el contexto por su
cuenta, y tenía razón**: no era voseo, era una excepción documentada. Sin esa
resistencia, el repositorio habría quedado con una "corrección" que rompía
algo que funcionaba bien.

**Dio por bueno un repositorio que nunca se había publicado de verdad.** Antes
de una ronda de commits posterior, la revisión de calidad completa —
artefactos, contenido, consistencia— se hizo sobre los archivos que había en
el disco. El commit real en git seguía siendo el borrador roto del punto 1:
cinco documentos nuevos y un workflow completo nunca habían llegado a
`git add`. El validador pasaba en verde porque solo miraba el disco, sin
saber nada del estado real de git. Esto llevó a agregar al script
`scripts/verify-artifacts.mjs` una comprobación explícita contra
`git ls-files` y `git status --porcelain`, que sigue activa hoy.

**Rodeó en silencio una versión que él mismo había fijado, y no volvió a
corregir lo que seguía prometiéndola.** La versión de n8n que la clase fija a
propósito no arrancaba por la ruta `npx`: fallaba al compilar `sqlite3`,
incluso con las herramientas de compilación instaladas. El agente cambió a
otra versión para seguir avanzando, dejó constancia del motivo en un
comentario del lanzador de arranque — fuera del repositorio, donde nadie que
leyera la documentación la iba a ver — y nunca actualizó el pin de versión ni
el fix documentado, que seguía prometiendo la versión que el propio agente
había descartado. Lo detectó una prueba independiente que siguió el material
desde cero, no el agente que lo escribió: un obstáculo rodeado en silencio es
peor que un error cometido a la vista, porque el error se corrige cuando
alguien lo ve y el rodeo se hereda intacto.

**Publicó una explicación antes de tener la causa.** Cuando una prueba mostró
que la ruta `npx` fallaba instalando `sqlite3`, el agente que dirigía el
material escribió "esta ruta no está garantizada en macOS" antes de saber por
qué fallaba: el síntoma era real, la explicación no. La causa verdadera
resultó ser una opción de configuración de npm en esa máquina concreta
(`ignore-scripts=true`), sin relación con macOS ni con la versión de n8n. El
arreglo que parecía obvio, `npm rebuild sqlite3 --build-from-source`,
respondía "rebuilt successfully" sin compilar nada, porque respeta la misma
opción que causaba el problema: un arreglo que confirma éxito sin haber
actuado es peor que uno que falla, porque cierra la investigación. Confirmar
un síntoma no es encontrar una causa.

---

## 3. Lo que solo apareció al ejecutar de verdad

Dos fallas reales del material original no se veían leyendo el código. Las
dos aparecieron recién al correrlo.

- **`GUIA-INTERACTIVA.html` tenía un `SyntaxError` preexistente** — un
  paréntesis faltante en el script inline — que dejaba **todo** su JavaScript
  muerto. La página se veía perfecta: el HTML y el CSS renderizan igual con
  el script roto. Sin pestañas, sin progreso, sin persistencia, y nada en
  pantalla lo delataba. Solo se ve abriendo la consola del navegador o
  compilando el script por separado, que es justamente lo que hace hoy el
  validador del repositorio.
- **`.env.example` permitía arrancar con una clave publicada en el repo.**
  Con la sintaxis original, una clave de ejemplo ya escrita en el archivo
  pasaba la validación de Docker Compose sin problema: el requisito era "no
  esté vacía", no "sea una clave propia". El fix fue dejar esa línea
  **vacía** a propósito, para que Docker Compose se niegue a arrancar hasta
  que alguien genere su propia clave.
- **El Task Broker interno de n8n usa un puerto fijo (5679) que no se mueve
  con `N8N_PORT`** — hace falta la variable separada
  `N8N_RUNNERS_BROKER_PORT`, que no aparece en ninguna documentación pensada
  para un estudiante: solo se encuentra leyendo el bundle compilado de
  `@n8n/config`. Quien tenga una segunda instancia de n8n corriendo (un
  proyecto propio, o un segundo intento de esta misma clase) choca con
  "Task Broker's port 5679 is already in use" sin ninguna pista visual que
  corregir. Es especialmente grave para esta clase porque no hay un nodo en
  el lienzo que el estudiante pueda señalarle a su copiloto: es
  configuración interna e invisible, del tipo que un modelo va a inventar
  con la misma confianza con la que inventa nombres de nodos — el riesgo que
  este mismo material advierte desde la primera página.

Ninguno de los tres es un error de sintaxis obvio ni un dato mal escrito que
salte a la vista. Los tres exigían correr el sistema y mirar lo que devolvía.

---

## 4. Qué decidió la persona, qué decidió el agente

`docs/DIRIGIR-AL-AGENTE.md` describe seis piezas de un montaje de n8n: motor,
datos, llaves, fuentes, reglas y compuerta. Esta sesión las tocó todas, y en
cada una quedó claro qué se delegó y qué no:

- **Motor y datos**: el agente resolvió la instalación (Docker o `npx`,
  errores reales de cada ruta) y separó la carpeta de datos de la clase
  (`~/.n8n-control-tower`) de la carpeta personal del usuario — pero la
  decisión de que esa separación fuera obligatoria, para no arriesgar datos
  reales, fue humana.
- **Llaves**: dejar la clave de cifrado vacía por defecto, en vez de confiar
  en que cada persona recordara generar la suya, fue una decisión humana
  explícita después de encontrar el problema descrito en la sección 3.
- **Fuentes**: qué proveedor de IA recomendar en la clase — Gemini como
  principal, Ollama como ruta avanzada — es una decisión editorial, no
  técnica. El agente investigó opciones, costos y límites; la persona eligió
  cuál enseñar primero.
- **Reglas**: el criterio del semáforo (qué estado es rojo, cuál ámbar) lo
  dicta una persona y queda escrito donde se puede leer. El agente lo
  implementa; no lo decide. Esa separación es el centro de la clase.
- **Alcance de lo reversible**: cuando apareció un problema de red entre Docker
  y Ollama que se podía resolver abriendo el firewall de una máquina de
  producción, el agente **pidió autorización en vez de aplicarlo**. La
  respuesta fue no tocarlo y documentar la limitación, antes que resolver el
  problema al costo de exponer una máquina real. Pedir permiso ahí, y no
  después, fue lo que hizo que la decisión siguiera siendo humana.
- **Compuerta**: publicar el repositorio en un GitHub público — con todo lo
  que eso implica sobre credenciales, datos de ejemplo y quién puede leerlo —
  lo aprobó la persona, no el agente.
- El giro de enfoque de la clase entera, de un tutorial de clics a una clase
  sobre dirigir a un agente (`5ce7875`), también fue una decisión humana: el
  agente había construido un buen tutorial de interfaz, pero ese no era el
  problema que valía la pena enseñar.

---

## 5. La lección, en una frase

**Ningún error de esta lista lo detectó el agente por su cuenta. Todos los
detectó la verificación** — ejecutar de verdad, mirar la salida real en vez
de la que "debería" salir, y preguntar "¿cómo lo comprobaste?" antes de dar
algo por bueno.

Esa es la habilidad que enseña esta clase. No es aprender n8n. Es aprender a
encargarle algo a un agente, y a no soltarle la verificación a él también.

---

Todo lo anterior se puede comprobar leyendo los commits del repositorio:
`e97b26e` (el borrador con el que empezó todo), `8f2c821` (la clase con el
copiloto y el validador endurecido), `9e7cdb3` (el ajuste que el subagente
defendió con razón), `4fb8625` (el workflow sin nodos de código) y `5ce7875`
(el giro hacia dirigir a un agente). Ninguno está editado para esta historia:
son los mismos que produjeron el repositorio que estás usando.
