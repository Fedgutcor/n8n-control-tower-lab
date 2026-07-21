# Guía del docente — clase de 3 horas: n8n local para directivos

> **El documento que siguen los estudiantes durante la parte práctica es
> [DIRIGIR-AL-AGENTE.md](DIRIGIR-AL-AGENTE.md).** Léelo antes que esta guía.
>
> El ejercicio del día no es armar nodos a mano: es **encargarle a un agente de
> IA que monte la automatización**, y saber revisar lo que devuelve. Los
> estudiantes trabajan con cinco encargos, de menor a mayor, sobre una
> arquitectura de seis piezas que el documento explica primero.
>
> **Tu papel durante el taller** no es resolverles el problema técnico. Es hacer
> tres preguntas, una y otra vez:
>
> - "¿Le diste tu contexto, o esperabas que lo adivinara?"
> - "¿Qué decidió el agente que deberías haber decidido tú?"
> - "¿Te mostró la salida real, o solo te dijo que funcionó?"
>
> Ese es el músculo que se llevan. La herramienta caduca; esas tres preguntas no.

> Documento operativo para el día de la clase. La fundamentación pedagógica está
> en [FUNDAMENTACION-DE-LA-CLASE.md](FUNDAMENTACION-DE-LA-CLASE.md); aquí no se
> repite el porqué, sólo el cómo y el cuándo.

---

## 1. Checklist de ensayo — una semana antes

No dictes esta clase sin haber hecho este ensayo completo al menos una vez, en
una máquina limpia si es posible.

- [ ] Instala y arranca n8n por la **ruta Docker** siguiendo
      [MONTAJE-PASO-A-PASO.md](MONTAJE-PASO-A-PASO.md) de punta a punta.
- [ ] Instala y arranca n8n por la **ruta npx** (Node 22.22+) siguiendo el mismo
      documento. Si tu Node local es par pero no llega a 22.22, actualízalo antes
      de la semana de clase, no el mismo día.
- [ ] Confirma que la versión fijada en `docker-compose.yml`
      (`docker.n8n.io/n8nio/n8n:2.30.8`) sigue siendo la que ensayaste. Si alguien
      actualizó el compose después de tu último ensayo, vuelve a correr este
      checklist completo: un cambio de versión sin ensayo es la forma más segura
      de encontrarte un error nuevo frente al grupo.
      > **En verificación:** hay una revisión en curso sobre si `2.30.8` sirve
      > igual para la ruta `npx`, no solo para Docker. No cambies el número por
      > tu cuenta — confirma con el equipo cuál está vigente antes de ensayar
      > esa ruta.
- [ ] Importa los ocho workflows (`01` a `08`) desde una carpeta limpia y
      confirma que ninguno trae un nodo marcado como desconocido. Ejecuta `01`
      y `03` sin errores — `04` y `07` tienen su propio ítem de ensayo más
      abajo, con lo que exige cada uno.
- [ ] Ensaya el workflow `04` con **Google Gemini** (`gemini-2.5-flash`), el
      proveedor con el que viene cableado, y confirma que el validador muestra
      el veredicto `RECHAZADO` al menos una vez — con Gemini la probabilidad
      verificada es de ~80% en la primera corrida, casi segura en dos. El
      propio prompt del informe la llama la demostración más valiosa de la
      sesión (ver
      [INFORME-EJECUTIVO.md](../prompts/INFORME-EJECUTIVO.md#este-prompt-no-basta-y-tenemos-la-prueba)):
      si no la ensayaste antes, no la dictes en vivo por primera vez frente al
      grupo. Si vas a recomendar Groq o Cerebras en su lugar, ensaya también
      con ese proveedor — la probabilidad de rechazo es distinta en cada uno
      (ver [PROVEEDORES-LLM.md](PROVEEDORES-LLM.md#parte-2--el-modelo-dentro-del-flujo)).
- [ ] Ensaya el workflow `07` (informe al celular): crea tu bot con `@BotFather`,
      obtén tu chat ID y **prueba el envío contra tu chat personal**, nunca
      contra un grupo. Es el flujo de mayor impacto de la clase y el único que
      envía algo al mundo real.
      > **Gotcha verificado:** `n8n execute` por línea de comandos **no arranca**
      > workflows que empiezan con `Schedule Trigger` — solo reconoce Manual
      > Trigger. Para probar la cadena de datos por consola hay que cambiar el
      > disparador a manual temporalmente. Desde la interfaz no aplica: ahí se
      > ejecuta con el botón normal.
- [ ] Corre la validación automática:
      ```bash
      node scripts/verify-artifacts.mjs
      docker compose config
      ```
- [ ] Envía `samples/control-tower-demo.json` al webhook de prueba del workflow
      `02` (Postman, Bruno o curl) y confirma que el snapshot sale correcto.
- [ ] Decide **qué proveedor de LLM vas a recomendar** para el nodo dentro del
      flujo y verifica su cuota real ese mismo día en la consola del proveedor
      (AI Studio para Gemini, consola de Groq, consola de Cerebras). No hay una
      tabla universal de límites que puedas confiar a ciegas: los catálogos
      gratuitos cambian sin aviso — ver
      [PROVEEDORES-LLM.md](PROVEEDORES-LLM.md). Si en vez de eso vas a mostrar
      **Ollama**, descarga el modelo antes (nunca en vivo) y no des por
      sentado que reproduce el `RECHAZADO`: no está verificado desde que el
      workflow se migró a proveedores en la nube.
- [ ] Si vas a usar Ollama con la ruta Docker, verifica el gotcha de red:
      `http://host.docker.internal:11434` responde desde el nodo Ollama Chat
      Model. En Linux confirma que `extra_hosts` está en el compose (ya viene
      incluido en este repositorio).
- [ ] Revisa `GUIA-INTERACTIVA.html` en el navegador: los **8 módulos** cargan
      —incluido **08 · Dirigir**, el central de la clase, aunque se dicte
      segundo pese a su número—, las mecánicas interactivas (emparejar,
      clasificar, ordenar, caza de alucinación) funcionan y el botón de
      exportar plan genera un archivo.
- [ ] Relee la fundamentación técnica verificada en
      [FUNDAMENTACION-DE-LA-CLASE.md](FUNDAMENTACION-DE-LA-CLASE.md#fundamentación-técnica-verificada)
      y confirma que ningún dato (versión de n8n, requisito de Node, estado del
      AI Assistant nativo) cambió desde la última verificación.

---

## 2. Checklist del día — 30 minutos antes

Todo lo que se pueda tener listo **antes** de que entre el grupo, se tiene listo
antes. Descargar en vivo con 20 personas en la misma red es la forma más
confiable de perder la clase.

- [ ] Imagen de Docker ya descargada en tu máquina (`docker compose pull` o
      `docker compose up -d` corrido de antemano).
- [ ] Credencial de Google Gemini creada (`aistudio.google.com` → "Get API key"
      → "Create API key", sin tarjeta) y probada en el nodo "Google Gemini Chat
      Model" del workflow 04 — ver [PROVEEDORES-LLM.md](PROVEEDORES-LLM.md). Si
      vas a demostrar Ollama en su lugar, el modelo debe estar descargado de
      antemano (`ollama pull <modelo>`) — no lo bajes en vivo, y no des por
      sentado que reproduce el `RECHAZADO`: no está verificado desde que el
      workflow se migró a proveedores en la nube.
- [ ] `.env` propio ya creado a partir de `.env.example`, con
      `N8N_ENCRYPTION_KEY` propia — no la que quede en el repositorio de
      ejemplo.
- [ ] n8n arriba y probado una última vez (`docker compose ps`,
      `http://localhost:5678` responde).
- [ ] Pestañas abiertas y proyectables: `GUIA-INTERACTIVA.html`, tu instancia de
      n8n, un chat de copiloto (DeepSeek como principal, Claude free como
      respaldo — ver [PROVEEDORES-LLM.md](PROVEEDORES-LLM.md)) y el repositorio
      en el explorador de archivos.
- [ ] `samples/control-tower-demo.json` accesible para probarlo con
      Postman/Bruno/curl si alguna fuente real falla en vivo.
- [ ] Ninguna pestaña ni ventana con una API key visible. Si alguna credencial
      quedó guardada en el navegador con autocompletado, ciérrala antes de
      compartir pantalla.
- [ ] Hoja de cálculo de ejemplo (con permisos de edición para el grupo, o una
      copia por estudiante) lista si vas a demostrar el conector de Google
      Sheets.
- [ ] Antes de que arranque el tramo 06, pregunta al grupo con qué herramienta
      viene cada quien: nivel 1 (chat en el navegador), 2 (app de escritorio) o
      3 (agente con acceso al sistema, tipo Claude Code o Antigravity) — ver
      [DIRIGIR-AL-AGENTE.md](DIRIGIR-AL-AGENTE.md#antes-de-empezar-qué-puede-hacer-tu-herramienta).
      Cambia el ritmo real del tramo: los niveles 1 y 2 necesitan más tiempo
      tuyo por persona porque cada paso lo teclean ellos; el nivel 3 avanza más
      rápido pero necesita más presión de auditoría, porque no ven los pasos
      intermedios.

---

## 3. Correo de prerrequisitos — enviar con antelación

Copia y pega este mensaje tal cual, adaptando el nombre de la sesión y la fecha.

> **Asunto: antes de la sesión de n8n — 15 minutos de preparación**
>
> Hola,
>
> La próxima sesión es práctica: vas a instalar y usar una herramienta de
> automatización en tu propio computador. Para que el tiempo en clase se use en
> el ejercicio y no en instalaciones, te pido que hagas esto **antes**:
>
> **1. Instala Docker Desktop.**
> Descárgalo de docker.com para tu sistema operativo (Windows, macOS o Linux) e
> instálalo. Ábrelo una vez para confirmar que arranca. No necesitas crear
> ninguna cuenta paga.
>
> **2. Ten a mano un chat de IA que ya uses.**
> ChatGPT, Claude, Gemini o DeepSeek — cualquiera que ya tengas. No hace falta
> versión paga. Si no tienes ninguno, crea una cuenta gratuita en
> chat.deepseek.com.
>
> **3. Ten disponible una cuenta de Google.**
> La usaremos para un ejercicio con Google Calendar o Google Sheets. No
> necesitas permisos especiales, cualquier cuenta personal o corporativa con
> acceso a Calendar o Sheets sirve.
>
> **4. Verifica que tu computador tiene al menos 4 GB de RAM libres** y una
> conexión a internet estable el día de la sesión (para descargar Docker si aún
> no lo hiciste, e imágenes durante la clase).
>
> **No necesitas:**
> - Saber programar.
> - Ninguna suscripción paga.
> - Instalar nada además de Docker Desktop.
>
> Si Docker no logra instalarse en tu equipo, avísame antes de la sesión — hay
> una alternativa, pero necesito saberlo con tiempo para prepararla contigo.
>
> Nos vemos en la sesión.

---

## 4. Guion por tramo

Agenda completa con tiempos en
[FUNDAMENTACION-DE-LA-CLASE.md](FUNDAMENTACION-DE-LA-CLASE.md#diseño-de-3-horas).
Aquí sólo lo que necesitas mientras dictas.

### 01 · Inicio (0–15 min)

- **Objetivo en una frase:** que cada persona nombre su propio dolor de
  visibilidad antes de ver una herramienta.
- **Pregunta de apertura:** "¿qué fuentes usan hoy para saber si un proyecto
  está en riesgo?"
- **Error más probable:** ninguno técnico todavía; el riesgo es que el grupo
  quiera saltar directo a la herramienta. Redirige con la actividad de
  diagnóstico del módulo 01 de `GUIA-INTERACTIVA.html`.
- **Señal para avanzar:** cada persona nombró tres fuentes y un destinatario de
  la decisión.

### 08 · Dirigir — antes de tocar n8n (15–30 min)

- **Objetivo:** que cada estudiante entienda las seis piezas de la arquitectura,
  sepa en qué nivel de herramienta está trabajando (1: chat en navegador, 2: app
  de escritorio, 3: agente con acceso al sistema) y traiga escrito su primer
  encargo antes de que exista nada que auditar.
- **Pregunta de apertura:** "¿tu herramienta puede ejecutar comandos en tu
  computadora y leer el resultado por sí misma, o necesita que tú los ejecutes y
  le cuentes qué pasó?" — es literalmente la pregunta que
  [DIRIGIR-AL-AGENTE.md](DIRIGIR-AL-AGENTE.md#antes-de-empezar-qué-puede-hacer-tu-herramienta)
  sugiere hacerle a la propia herramienta.
- **Error más probable:** alguien asume que su chat de navegador "va a construir
  esto solo", igual que el agente de nivel 3 que construyó este repositorio.
  Corrige con la tabla de niveles: los cinco encargos funcionan con cualquiera
  de los tres, lo que cambia es quién teclea.
- **Señal para avanzar:** cada estudiante puede nombrar las seis piezas sin mirar
  el documento y tiene escrita la plantilla de su primer encargo (Encargo 1).

### 05 · Copiloto — antes del montaje (30–50 min)

- **Objetivo:** que cada estudiante tenga un chat abierto y entienda la
  diferencia entre copiloto del montaje y nodo dentro del flujo antes de que
  aparezca el primer error real.
- **Pregunta de apertura:** "¿alguna vez un chat de IA les dio una respuesta que
  sonaba perfecta y resultó ser inventada?"
- **Error más probable:** alguien intenta pedirle al chat el JSON completo de un
  workflow. Es intencional dejar que lo intenten — es el ejercicio de "la trampa
  del nodo inventado" del propio documento
  ([EL-LLM-COMO-COPILOTO.md](EL-LLM-COMO-COPILOTO.md#ejercicio-de-clase-la-trampa-del-nodo-inventado)).
  No lo corrijas antes de que lo vivan.
- **Señal para avanzar:** cada estudiante puede repetir el protocolo de 4 pasos
  sin mirar la pantalla, y sabe qué NO preguntarle al copiloto.

### 06 · Manos a la obra — montar n8n (50–85 min)

- **Objetivo:** n8n corriendo en local, workflow `01` importado y ejecutado —
  aplicando el **Encargo 1** (levantar el motor) y el **Encargo 2** (entender
  lo que ya existe) de
  [DIRIGIR-AL-AGENTE.md](DIRIGIR-AL-AGENTE.md#parte-3--los-cinco-encargos-de-hoy).
  No es "instalar n8n": es dirigir a la herramienta de cada quien para que lo
  instale, con el nivel que le toque (ver checklist del día).
- **Pregunta de apertura:** "¿Docker o npx? Miren su Node con `node --version`
  antes de decidir — y si tu herramienta es de nivel 3, pídele que lo verifique
  ella misma."
- **Error más probable:** los cuatro de siempre — ver
  [MONTAJE-PASO-A-PASO.md](MONTAJE-PASO-A-PASO.md#cuando-algo-falla-los-cuatro-errores-del-día):
  puerto ocupado, permisos del volumen en Docker, Node viejo en la ruta npx,
  Docker Desktop instalado pero no corriendo. Responde señalando el documento y
  dejando que cada estudiante use su copiloto con el **prompt B** antes de darle
  la solución tú mismo — es el tramo donde el protocolo se usa de verdad.
- **Señal para avanzar:** cada estudiante muestra el JSON normalizado del nodo
  **Normalizar y priorizar**, explica qué nodo lo produjo, y responde la
  pregunta de verificación del Encargo 1: "¿dónde quedaron guardados mis datos y
  qué pasaría si borro esa carpeta?"

### 02 · Teoría — contrato común (85–110 min)

- **Objetivo:** que el grupo entienda que el contrato, no el proveedor, es la
  pieza estable.
- **Pregunta de apertura:** "si mañana cambian de Linear a Notion, ¿qué parte de
  este flujo tendría que rehacerse?"
- **Error más probable:** confundir el contrato con un dashboard — alguien dirá
  "pero yo necesito ver esto en una tabla bonita". Redirige: el contrato es el
  dato, la vista es después.
- **Señal para avanzar:** cada estudiante cambió `status` a `bloqueado` en la
  semilla, volvió a ejecutar y puede decir qué regla produjo el cambio en el
  semáforo.

### 03 · Brechas — clínica de credenciales (110–125 min, incluye la pausa)

- **Objetivo:** distinguir OAuth, token personal, API key y secreto, y el
  permiso mínimo de cada uno.
- **Pregunta de apertura:** "¿qué pasaría si esta credencial se filtrara hoy?
  ¿qué alcance tiene?"
- **Error más probable:** alguien pega o menciona en voz alta una clave real
  mientras comparte pantalla. Ver plan B en la sección 5 de este documento.
- **Señal para avanzar:** el grupo completó la matriz fuente–credencial–permiso
  mínimo apoyándose en
  [MATRIZ-DE-CONEXIONES.md](MATRIZ-DE-CONEXIONES.md).

### 04 · Laboratorios — conectar fuentes reales (125–140 min)

- **Objetivo:** al menos un adaptador real (Calendar o Sheets) produciendo el
  contrato común, aplicando el **Encargo 3** de
  [DIRIGIR-AL-AGENTE.md](DIRIGIR-AL-AGENTE.md#encargo-3--conectar-tu-fuente-real).
  Con solo 15 minutos el objetivo es UNA fuente, no dos — GitHub, Linear y
  Notion quedan para después con la matriz de conexiones. **Para Sheets, el
  camino que entra en el tiempo disponible es el workflow `05`** con el enlace
  público de solo lectura (ver
  [CONECTAR-GOOGLE.md](CONECTAR-GOOGLE.md#camino-corto-leer-una-hoja-de-google-sin-credenciales));
  reserva el OAuth completo para quien ya lo tenga resuelto de antes.
- **Pregunta de apertura:** "¿qué credencial necesitan y quién en su
  organización la emite?"
- **Error más probable:** falla de OAuth o de red del aula. Si el bloqueo no se
  resuelve en 2 minutos, no insistas: usa `samples/control-tower-demo.json`
  contra el webhook y sigue adelante — es exactamente el plan B documentado en
  el README.
- **Señal para avanzar:** el adaptador produce un registro sin campos
  inventados, mapeado al contrato, y el estudiante puede responder "¿qué pasa
  el día que quiera desconectar esto?" (la pregunta de verificación del
  Encargo 3).

> **Si el montaje del tramo 06 se desbordó de tiempo**, este es el bloque que se
> sacrifica primero: la conexión de fuentes reales queda como trabajo posterior
> con la matriz de conexiones. Con el módulo 08 agregado este colchón ya es de
> solo 15 minutos — si no alcanza, el siguiente bloque a recortar es 03 ·
> Brechas. No sacrifiques el informe ni el cierre — cargan el mensaje de la
> clase (ver
> [FUNDAMENTACION-DE-LA-CLASE.md](FUNDAMENTACION-DE-LA-CLASE.md#plan-b-de-tiempos)).

### 04 · Laboratorios — informe ejecutivo (140–162 min)

- **Objetivo:** ejecutar el informe determinista primero, conectar un modelo
  después.
- **Pregunta de apertura:** "miren el informe que acaba de salir sin ningún
  modelo de por medio: ¿qué les falta ahí que sólo un LLM podría dar?"
- **Error más probable:** alguien quiere conectar el modelo antes de validar el
  informe determinista, o usa AI Agent en vez de Basic LLM Chain. Corrige: la
  transformación es fija, no hay decisiones que tomar.
- **Señal para avanzar:** el informe final tiene decisiones, riesgos, agenda y
  evidencia citada — no texto genérico.

### 07 · Compromisos — cierre (162–180 min)

- **Objetivo:** cada estudiante exporta un plan con un flujo, una compuerta
  humana y tres compromisos.
- **Pregunta de apertura:** "¿qué debe decidir alguien mañana con esto?"
- **Error más probable:** cerrar con una idea inspiradora en vez de un
  compromiso verificable. Redirige a la pregunta de apertura, no a "qué nodo
  usamos".
- **Si el tiempo alcanza**, muestra el workflow `07` (informe al celular) como
  el ejemplo concreto de a qué apunta el compromiso: un `Schedule Trigger` que
  ya no depende de que alguien lo apriete. No hace falta dictarlo en vivo —el
  checklist de ensayo ya lo cubre aparte—, pero conecta directamente con la
  pregunta de apertura de este tramo.
- **Señal para avanzar:** el archivo exportado desde `GUIA-INTERACTIVA.html`
  existe y tiene los tres campos completos.
- **Antes de que se levanten del puesto**, menciona
  [EL-DIA-DESPUES.md](EL-DIA-DESPUES.md): lo que se llevan es un prototipo en
  su propio computador, y ese documento cubre exactamente lo que esta clase
  no alcanza a dar — quién debe ser el dueño, cuándo conviene el salto a un
  piloto, y cómo llevar la conversación al área de sistemas sin que la
  prohíban. Sin esta mención, el entusiasmo de la clase se apaga en tres días
  porque nadie sabe qué hacer con lo que construyó.

---

## 5. Momentos de riesgo — plan B en menos de 2 minutos

| Riesgo | Qué hacer, en menos de 2 minutos |
|---|---|
| **(a) Alguien no puede instalar Docker.** | Que trabaje en pareja con alguien que sí levantó n8n, mirando su pantalla y ejecutando los pasos de razonamiento (contrato, reglas, informe) en su propio papel/documento. No pierdas tiempo depurando la instalación de una máquina ajena frente al grupo completo. Si el problema se veía venir, esto se resuelve mejor en el correo de prerrequisitos, avisando con antelación. |
| **(b) La red del aula bloquea la descarga.** | Usa tu propia imagen ya descargada como demo proyectada y que el resto siga el ejercicio en pareja con quien sí tenga n8n arriba. No intentes depurar la red del aula en vivo — no es un problema que el grupo pueda resolver contigo mirando. |
| **(c) Un proveedor de LLM da error de cuota en vivo.** | Cambia al plan B documentado: si estaban en Gemini, pasa a Groq (nodo propio, 14 400 req/día). Nómbralo como lo que es: la razón de tener siempre un segundo camino gratuito, no un imprevisto. Ver [PROVEEDORES-LLM.md](PROVEEDORES-LLM.md#cómo-elegir-en-una-decisión). |
| **(d) El montaje se desborda de tiempo.** | Aplica el plan B de tiempos: sacrifica el bloque de conexión de fuentes reales (125–140 min, ya reducido a 15 minutos desde que se agregó el módulo 08), no el informe ni el cierre. Si no alcanza, el siguiente en recortar es 03 · Brechas. Anuncia el corte en voz alta para que el grupo entienda que es una decisión, no que se quedaron sin tiempo. |
| **(e) Alguien pega una API key en el chat compartido (pantalla, Slack, chat de la clase).** | Detén la demostración, pide que la persona **revoque esa clave de inmediato** desde la consola del proveedor (no que la borre del chat: ya quedó en el historial/log del canal), y usa el momento como ejemplo en vivo de por qué las credenciales se crean dentro de n8n y nunca se pegan en un chat. No lo trates como una vergüenza del estudiante — es exactamente la brecha que enseña el módulo 03. |

---

## 6. Cómo se evalúa, caminando por el salón

Rúbrica completa en
[FUNDAMENTACION-DE-LA-CLASE.md](FUNDAMENTACION-DE-LA-CLASE.md#evaluación-auténtica-rúbrica-breve).
Versión aplicable mientras se camina entre puestos:

| Criterio | Qué mirar | En qué momento | Evidencia que pides |
|---|---|---|---|
| **Fuentes** | ¿Puede señalar de dónde salió cada dato? | Tramo 04 (laboratorios) | Que apunte al nodo o adaptador concreto, no "de por ahí". |
| **Contrato** | ¿Usa los campos mínimos (`source`, `kind`, `status`, `priority`, `date`, `owner`)? | Tramo 02 (teoría) | Pídele que abra el nodo de salida del adaptador y lea un registro. |
| **Reglas** | ¿El semáforo sale de una condición inspeccionable o de una impresión? | Tramo 02, al cambiar `status` a `bloqueado` | Que explique qué regla cambió el resultado, no que "se puso rojo". |
| **IA** | ¿El prompt limita al modelo a la evidencia del snapshot? | Tramo 04 (informe) | Pídele que le muestre al modelo un dato que no está en el snapshot y observen juntos si lo inventa. |
| **Gobernanza** | ¿Hay una compuerta humana antes de una salida externa? | Tramo 07 (cierre) | Que nombre responsable, plazo y canal — no sólo "alguien revisa". |
| **Copiloto** | ¿Dio contexto y verificó, o copió y pegó sin entender? | Tramo 06 (montaje) | Pídele que te cuente, en tres líneas, la causa raíz del error que resolvió — es el cierre del protocolo de 4 pasos. |

---

## 7. Qué NO hacer

Lecciones de esta serie de clases, no advertencias teóricas:

- **No prometas el AI Assistant nativo de n8n.** Existe en self-hosted, pero
  requiere activación de licencia de instancia, endpoint configurado y API key
  propia (BYOK). No es "prender y listo", y perder 20 minutos de una clase de 3
  horas peleando con una activación de licencia no le enseña nada a nadie. Ver
  [PROVEEDORES-LLM.md](PROVEEDORES-LLM.md#lo-que-no-vamos-a-prometer-en-clase).
- **No proyectes nunca una API key**, ni siquiera un fragmento. Las credenciales
  se crean dentro de n8n; los exports de workflows no las incluyen, y así debe
  quedar también tu pantalla compartida.
- **No dejes que la clase se convierta en soporte técnico individual.** Un
  bloqueo de instalación que no se resuelve en 2 minutos se atiende en pareja o
  después de la sesión, no frente a todo el grupo. El tiempo de los demás vale
  más que resolver un caso particular en vivo.
- **No cierres el tema del copiloto sin que alguien haya visto una alucinación
  real en pantalla.** Si nadie la provocó de forma espontánea, fuerza el
  ejercicio de "la trampa del nodo inventado" o la actividad "caza la
  alucinación" del módulo 05 de `GUIA-INTERACTIVA.html`. Sin ese momento vivido,
  el protocolo de 4 pasos queda como teoría y no como método interiorizado.

---

## Inconsistencias detectadas entre documentos (para revisión del equipo)

Se reportan aquí sin corregir, tal como se pidió:

1. **Duración de la Actividad Reina.** `FUNDAMENTACION-DE-LA-CLASE.md` describe
   el bloque de 140–180 min (informe + cierre) como dos filas separadas de la
   tabla de agenda, mientras que `GUIA-INTERACTIVA.html` presenta "Actividad
   Reina" como una sola sección de "45 minutos" dentro del módulo 04, que
   incluye el simulador de la torre. No es contradictorio, pero el rótulo "45
   minutos" en el HTML no tiene un anclaje directo y visible en la tabla de
   tiempos de la fundamentación — vale la pena que quien dicte la clase no
   intente cuadrar ambos relojes de forma literal.
2. **Nombres de módulo entre documentos — RESUELTO.** La fundamentación llama
   al segundo bloque de la agenda "05 Copiloto", lo cual no coincidía con el
   orden real de las pestañas del HTML (`05 · COPILOTO` es el quinto tab, no el
   segundo). Con el módulo `08 · Dirigir` agregado, el desfase ahora afecta a
   tres módulos (`08`, `05` y `06`, en ese orden de dictado). Es intencional, y
   la fundamentación ya trae la nota aclaratoria que este punto pedía —ver
   "El número del módulo no es el orden de dictado" en
   [FUNDAMENTACION-DE-LA-CLASE.md](FUNDAMENTACION-DE-LA-CLASE.md#diseño-de-3-horas)—
   así que este punto queda cerrado.
3. **`.env.example` sin verificar contra el checklist de validación del
   README.** El README pide correr `node scripts/verify-artifacts.mjs` y
   `docker compose config` como validación previa, pero ninguno de los
   documentos fuente confirma explícitamente que `docker compose config`
   fallará o no si `.env` no existe todavía (antes del paso `cp .env.example
   .env`). No se verificó en este trabajo por estar fuera del alcance pedido;
   queda como punto a confirmar en el próximo ensayo.
