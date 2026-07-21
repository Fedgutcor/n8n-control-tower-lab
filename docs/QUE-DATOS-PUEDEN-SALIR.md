# Qué datos pueden salir de tu organización

> Para quien va a conectar esta automatización —o cualquier otra— a
> información real. No es una política de seguridad genérica: es la pregunta
> de gobernanza específica de este ejercicio, respondida completa.
>
> El resto del repositorio la toca en piezas sueltas: la matriz de conexiones
> habla de permisos mínimos, [CONECTAR-GOOGLE.md](CONECTAR-GOOGLE.md) advierte
> sobre compartir una hoja por enlace,
> [EL-LLM-COMO-COPILOTO.md](EL-LLM-COMO-COPILOTO.md) dice que nunca se pegue
> una clave en un chat. Aquí están juntas, porque para un directivo esta
> pregunta puede importar más que cualquier detalle técnico del montaje.

---

## Los tres lugares por donde sale la información, y por qué se confunden

Cuando alguien pregunta "¿es seguro esto?", casi siempre está pensando en uno
solo de estos tres lugares. Son distintos, tienen dueños distintos y se
descubren de formas distintas cuando fallan.

### 1. Lo que le pegas al copiloto mientras montas

Es el chat que tienes abierto al lado —Claude, ChatGPT, Gemini, DeepSeek—
mientras instalas y depuras, como describe
[EL-LLM-COMO-COPILOTO.md](EL-LLM-COMO-COPILOTO.md). El riesgo aquí no es
dramático, pero es fácil de cometer sin darse cuenta: pegas un mensaje de
error completo para que te ayude, y ese mensaje trae dentro una ruta de
archivo con tu nombre de usuario, un correo, o —si estabas probando con datos
reales cuando algo falló— el nombre de un proyecto o de un cliente en el
propio texto del error.

Se corrige con un hábito, no con una herramienta: revisa lo que vas a pegar
antes de pegarlo, igual que revisarías un correo antes de enviarlo a alguien
fuera de la organización.

### 2. Lo que pasa por el modelo dentro del flujo

Este es el más peligroso de los tres, y la razón es estructural: no es un
error puntual de una persona un día distraído. Es automático, se repite en
cada ejecución, y **nadie mira** cada vez que ocurre. Si el nodo `04` de este
laboratorio envía el snapshot completo de tus proyectos a un proveedor de
modelos cada vez que corre, y ese snapshot incluye el nombre de un cliente en
el campo `bloqueador`, ese dato sale de tu organización con la misma
regularidad con la que corre el flujo — una vez, cien veces, o cada lunes a
las 7:00 si además conectaste el workflow `07`.

La diferencia con el copiloto no es de grado: es de naturaleza. Un error que
pegas a mano lo decides tú, una vez. Un dato que pasa por un nodo lo decide la
configuración, todas las veces.

### 3. Lo que queda expuesto por una conexión mal configurada

Es el ejemplo que la propia clase usa para enseñar el camino rápido: en
[CONECTAR-GOOGLE.md](CONECTAR-GOOGLE.md), compartir una hoja "con cualquiera
que tenga el enlace" es la forma más simple de leer datos sin pelear con
OAuth. El documento ya lo advierte con todas las letras: sirve para datos de
demostración, no para datos reales de la organización. Una hoja con ese
permiso no aparece en ningún buscador, pero tampoco es privada — cualquiera
que consiga ese enlace, por el canal que sea, la lee entera.

**El segundo es el que exige más atención, precisamente porque es el que
menos se nota.** Una hoja mal compartida se puede auditar mirándola. Un
snapshot que sale hacia un modelo en cada ejecución no deja ese rastro visual
— solo aparece en el historial de uso de la cuenta del proveedor, si es que
alguien llega a mirarlo.

---

## La pregunta que decide

Antes de escribir una política de diez páginas, hay una sola pregunta que
resuelve la mayoría de los casos:

> **¿Estarías cómodo si este dato apareciera impreso en un periódico, o en
> manos de un competidor?**

Aplícala a lo concreto, campo por campo, con lo que este laboratorio maneja:

| Dato | ¿Pasa la pregunta? |
|---|---|
| Nombre de un proyecto interno genérico ("Onboarding comercial") | Casi siempre sí — no identifica a nadie fuera de la organización |
| Nombre de una persona responsable | Depende de tu política interna, pero suele ser tolerable como dato de gestión |
| Fecha de entrega de un proyecto | Sí, salvo que la fecha en sí sea información competitiva (un lanzamiento no anunciado) |
| Un bloqueador que menciona a un proveedor o cliente por su nombre | Casi nunca — es exactamente el tipo de dato que un competidor usaría |
| Cualquier campo con un monto, un contrato o una cifra financiera | No, prácticamente nunca en un prototipo sin controles |

No es una lista cerrada. Es el ejercicio que debes repetir con tus propios
campos antes de conectar cualquier fuente real, y es más rápido de aplicar
que de explicar: si dudas, la respuesta es que no pasa la pregunta.

---

## Qué hacer cuando la respuesta es "no"

Que un dato no pase la pregunta no significa cancelar el ejercicio. Significa
elegir una de estas opciones, ordenadas de la más barata a la más costosa.

### Usar datos de demostración

Es lo que hace la propia clase con `samples/control-tower-demo.json` y con la
semilla del workflow `01`. Costo: cero. Sirve para aprender la arquitectura y
para demostrar el concepto a otros. No sirve para tomar una decisión real
sobre tu operación, porque los datos no lo son.

### Anonimizar antes de enviar

Cambiar "Proveedor Acme S.A." por "Proveedor A" en el campo `bloqueador`, o
un nombre de cliente por un código interno, antes de que el dato llegue al
nodo del modelo. Es una transformación más en el flujo —un nodo **Edit
Fields** o **Code** entre la fuente y el modelo— y suele ser suficiente:
conserva la estructura y el volumen de la información sin exponer la
identidad. El costo es escribir esa regla de reemplazo una vez y mantenerla
si aparecen campos nuevos.

### Quedarse solo con la parte determinista, sin modelo

El workflow `03` produce un informe completo —conteos, semáforo, agenda,
decisiones— sin que ningún dato salga hacia un proveedor externo. Si el único
punto de fricción es el modelo de lenguaje, la salida más simple es no
usarlo: el informe pierde la redacción en lenguaje natural, no pierde la
información. Es la opción de costo más bajo entre las que sí trabajan con
datos reales.

### Usar un modelo que corra en tu propia máquina

Ollama, descrito en [PROVEEDORES-LLM.md](PROVEEDORES-LLM.md), procesa el
snapshot localmente: nada sale de tu red hacia un proveedor externo. Es la
opción más completa en privacidad, pero también la de mayor costo de
configuración —exige resolver la conexión entre Docker y el equipo anfitrión,
descrita en ese mismo documento— y de rendimiento: un modelo que corre en tu
computador es más lento y, con hardware modesto, más limitado que uno servido
en la nube.

---

## Credenciales: las cuatro preguntas

La fundamentación de esta clase ya las nombra al describir la clínica de
credenciales del tramo 03. Aquí van desarrolladas con sus consecuencias, en
particular la última, que es la que casi nadie responde hasta que ya es
tarde.

**¿Quién emite el permiso?** No es lo mismo una credencial que emite tu
cuenta personal de Google que una que emite una cuenta de servicio
administrada por tu organización. La primera desaparece si tu cuenta cambia;
la segunda sobrevive a cualquier persona individual.

**¿Qué alcance pide?** Un token que solo puede leer una hoja concreta es un
riesgo distinto de uno que puede leer y escribir en todo tu Google Drive. La
matriz de conexiones lo resume por fuente en
[MATRIZ-DE-CONEXIONES.md](MATRIZ-DE-CONEXIONES.md): pide siempre el alcance
mínimo que el ejercicio necesita, nunca el que resulte más cómodo de
configurar.

**¿Dónde vive el secreto?** En n8n, cifrado por la clave `N8N_ENCRYPTION_KEY`
que describe [MONTAJE-PASO-A-PASO.md](MONTAJE-PASO-A-PASO.md). Eso protege el
secreto dentro de la base de datos de n8n. No protege contra el secreto
pegado en un chat, en una captura de pantalla compartida, o en un archivo
subido por error a un repositorio público — eso depende de la disciplina de
quien lo maneja, no de la herramienta.

**¿Cómo se revoca?** Esta es la pregunta que decide si una credencial es
sostenible. Si al momento de crearla nadie sabe responder "voy a esta
consola, a esta sección, y desactivo este acceso en menos de un minuto",
**esa credencial es un problema esperando fecha**: seguirá activa después de
que deba dejar de estarlo, porque nadie tiene el procedimiento a mano cuando
por fin haga falta usarlo.

---

## El caso de la persona que se va

Es el escenario más común y el que menos se planea. Alguien de tu equipo —tal
vez la misma persona que tomó esta clase— conecta el flujo con su propia
cuenta de Google, su propio correo, su propia API key de un proveedor
gratuito. Funciona. Nadie vuelve a pensarlo.

**Qué se rompe:** el día que esa persona cambie su contraseña, active
verificación en dos pasos, o deje la organización, la automatización pierde
acceso sin ningún aviso dirigido a nadie. No hay una notificación que diga
"esto dependía de fulano". Solo deja de funcionar.

**Cuándo se descubre:** casi siempre tarde, y casi nunca por la vía directa.
Se descubre porque alguien nota que el informe de los lunes no llegó, o
porque un directivo pregunta por un dato que debía actualizarse solo y
alguien tiene que revisar manualmente por qué no lo hizo. Entre que la
credencial deja de servir y que alguien lo relaciona con la persona que se
fue, suelen pasar semanas.

**Cómo se evita desde el principio:** con la misma disciplina que exige
cualquier acceso de sistemas, sin excepción por tratarse de "solo un flujo de
n8n". Una cuenta o credencial de servicio, no personal, desde el momento en
que la automatización deja de ser un experimento de una persona y empieza a
ser algo de lo que otros dependen — que es exactamente el salto de madurez
que describe [EL-DIA-DESPUES.md](EL-DIA-DESPUES.md).

---

## Lista de verificación antes de conectar cualquier fuente real

- [ ] Pasé cada campo sensible por la pregunta del periódico y el competidor.
- [ ] Si algún campo no la pasa, elegí una de las cuatro opciones de esta
      guía — no lo conecté "por ahora, ya lo arreglo después".
- [ ] Sé qué proveedor de modelo recibe el snapshot en cada ejecución, y por
      qué ese proveedor es aceptable para estos datos.
- [ ] La credencial que usé no es mi cuenta personal, o tengo un plan
      explícito para reemplazarla antes de que esto dependa de más de una
      persona.
- [ ] Puedo nombrar, sin buscarlo, dónde revoco esta credencial si hiciera
      falta hoy mismo.
- [ ] Si la fuente es una hoja compartida por enlace, confirmé que solo tiene
      datos de demostración — no datos reales de la organización.

Si alguna de estas casillas queda sin marcar, la conexión no está lista
todavía. No es una falla del ejercicio: es la misma verificación que le
pedirías a cualquier persona de tu equipo antes de dejar que algo suyo toque
datos reales.
