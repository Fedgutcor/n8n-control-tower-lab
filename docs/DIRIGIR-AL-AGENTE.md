# Dirigir a un agente: cómo pedirle a Claude que te monte esto

> Para el estudiante. No vas a armar nodos a mano. Vas a **encargar** la
> automatización a un agente de IA, revisar lo que construyó y decidir si sirve.
>
> Todo este repositorio fue construido así: una persona que no escribió una sola
> línea de código dirigió a un agente durante una sesión. Tú vas a hacer lo
> mismo. La diferencia entre que salga bien o mal no está en la herramienta:
> está en **saber qué pedir y cómo verificarlo**.

---

## Lo que de verdad estás aprendiendo

Delegar en un agente se parece mucho a delegar en una persona nueva en tu
equipo, con dos diferencias que importan:

| | Persona nueva | Agente de IA |
|---|---|---|
| Conocimiento del oficio | Limitado, crece con el tiempo | Amplio desde el minuto uno |
| Conocimiento de **tu** contexto | Lo va absorbiendo | **Ninguno**, y no lo pide |
| Cuando no sabe algo | Suele preguntar | Suele **rellenar con algo plausible** |

Las dos últimas filas son todo el problema. Un agente no conoce tu operación y
**no sabe que no la conoce**. Por eso el trabajo del que dirige no es escribir
instrucciones bonitas: es **aportar el contexto que falta y verificar lo que
vuelve**.

Eso no se delega. Es tu trabajo, y es el que no desaparece.

---

## Antes de empezar: qué puede hacer TU herramienta

No todas las herramientas de IA pueden lo mismo, y esta diferencia decide cuánto
puedes encargar. Reconocerla es parte de saber dirigir.

| Nivel | Qué es | Qué puede hacer | Quién ejecuta |
|---|---|---|---|
| **1. Chat en el navegador** | ChatGPT, Claude, Gemini o DeepSeek en una pestaña | Te dice **qué** hacer, paso a paso | **Tú**, copiando cada comando |
| **2. Aplicación de escritorio** | Las mismas, instaladas | Además lee archivos que le entregues | **Tú**, casi siempre |
| **3. Agente con acceso al sistema** | Claude Code, Antigravity y similares | Ejecuta comandos, crea archivos, **verifica su propio trabajo y corrige** | **El agente** |

**Los cinco encargos de este documento funcionan con cualquiera de los tres.** Lo
que cambia es quién teclea:

- Con **nivel 1 o 2**, el agente redacta y tú ejecutas. El encargo es idéntico;
  la conversación tendrá más idas y vueltas, porque después de cada paso tú le
  cuentas qué pasó. Es más lento, y a cambio ves todo lo que ocurre.
- Con **nivel 3**, el agente hace el trabajo y te trae el resultado. Es mucho más
  rápido, y por eso mismo **exige más disciplina de verificación**: cuando no
  ves los pasos intermedios, es más fácil aceptar algo que no comprobaste.

> **La trampa de cada nivel, dicha sin rodeos.** En el nivel 1 la trampa es
> creer que el modelo sabe si funcionó: **no lo sabe, no ve tu pantalla**; solo
> conoce lo que tú le cuentas. En el nivel 3 la trampa es la contraria: el agente
> sí ve el resultado, y precisamente por eso puedes caer en aceptar su palabra
> sin pedirle la evidencia.
>
> Este repositorio se construyó con una herramienta de nivel 3, y aun así el
> agente afirmó varias cosas que no había comprobado. Está contado con nombre y
> apellido en [CASO-DE-ESTUDIO.md](CASO-DE-ESTUDIO.md).

**Si no sabes en qué nivel estás**, pregúntaselo a tu herramienta:

```text
¿Puedes ejecutar comandos en mi computadora y leer el resultado por ti mismo, o
necesitas que yo los ejecute y te cuente qué pasó? Respóndeme con honestidad,
porque de eso depende cómo voy a trabajar contigo.
```

---

## Parte 1 — La arquitectura que necesitas entender

No para construirla: para **poder encargarla y darte cuenta si lo que te
entregan está mal**.

Un montaje de n8n local tiene seis piezas. Ninguna es opcional; si no decides
sobre alguna, alguien decidirá por ti (y ese alguien será el agente, adivinando).

```
[1 MOTOR] ── [2 DATOS] ── [3 LLAVES]
                 │
[4 FUENTES] ──> [5 REGLAS] ──> [6 COMPUERTA] ──> salida
                     │
                (opcional: modelo de lenguaje)
```

### 1. El motor — dónde corre n8n

Es el programa en sí. Puede correr dentro de una caja aislada (Docker) o
directamente sobre tu computadora (npx).

**La decisión que te toca:** si tu máquina y tu área de sistemas permiten
instalar Docker. Si no lo sabes, es la primera pregunta que debes resolver, no
el agente.

### 2. Los datos — dónde quedan tus flujos

n8n guarda todo lo que construyes en una carpeta. Si esa carpeta se borra, se
borra tu trabajo.

**La decisión que te toca:** dónde vive esa carpeta y quién la respalda. Un
agente pondrá el valor por defecto sin avisarte de las consecuencias.

### 3. Las llaves — cómo se guardan las credenciales

n8n cifra las contraseñas y tokens que conectes, usando una clave maestra. Si se
pierde, esas credenciales quedan ilegibles para siempre.

**La decisión que te toca:** dónde guardas esa clave. Nunca en el chat con el
agente, nunca en una captura de pantalla.

### 4. Las fuentes — de dónde salen los datos

Hojas de cálculo, calendario, sistema de tickets, correo. Cada una se conecta de
forma distinta y cada una tiene un costo de configuración.

**La decisión que te toca:** cuál es la **fuente de verdad** de cada dato. Si la
fecha de entrega vive en tres lugares distintos, ningún agente puede decidir
cuál manda. Esa es una decisión de gestión, no técnica.

### 5. Las reglas — qué convierte datos en información

Qué significa "en riesgo". Cuántos días antes es urgente. Qué combinación
dispara una alerta.

**La decisión que te toca:** absolutamente toda. Y debe quedar escrita donde se
pueda leer y discutir. Este es el corazón de la clase: si le pides a un modelo
que "decida qué proyectos están en riesgo", conviertes una regla auditable en
una opinión que nadie puede revisar.

### 6. La compuerta — dónde interviene una persona

El punto donde algo sale al mundo: un correo, un mensaje, un cambio de estado.

**La decisión que te toca:** quién aprueba, antes de qué, y con qué plazo.

> **Regla práctica:** las piezas 1, 2 y 3 se delegan casi por completo. Las
> piezas 4, 5 y 6 **son tuyas**. Un agente puede implementarlas; no puede
> decidirlas. Cuando un agente decide una de esas tres por su cuenta, el
> resultado funciona y está mal, que es la peor combinación posible.

---

## Parte 2 — Cómo se le encarga algo a un agente

Un buen encargo tiene cuatro partes. Sin alguna de ellas, el agente rellena el
hueco por su cuenta.

### 1. El resultado, no el procedimiento

Mal: *"crea un nodo HTTP Request que apunte a una URL de Google Sheets"*.
Bien: *"quiero ver mis proyectos de una hoja de cálculo dentro de n8n"*.

Si le dictas el procedimiento, heredas la responsabilidad de que ese
procedimiento sea el correcto — y probablemente no conoces las alternativas.

### 2. El contexto que solo tú tienes

Tu sistema operativo, si tienes Docker, dónde están tus datos, qué te prohíbe tu
organización, cuánto tiempo tienes. **Nada de esto lo puede adivinar.**

### 3. Las restricciones, en negativo

Es la parte que casi nadie escribe y la que más problemas evita:

- *"No quiero pagar suscripciones"*
- *"Los datos de clientes no pueden salir de mi computadora"*
- *"No instales nada que necesite permisos de administrador"*
- *"No modifiques los archivos que ya tengo"*

### 4. Cómo sabrás que está bien

*"Sabré que funcionó cuando pueda abrir una dirección en mi navegador y ver mis
proyectos con su semáforo."*

Sin este punto, el agente decide por su cuenta cuándo terminó.

### La plantilla

```text
QUIERO: [el resultado, en una frase, sin decir cómo]

MI CONTEXTO:
- Sistema operativo: [...]
- Ya tengo instalado: [...]
- No soy programador.

RESTRICCIONES:
- No debe [...]
- Sin costo / sin permisos de administrador / sin sacar datos de mi equipo

SABRÉ QUE FUNCIONÓ CUANDO: [qué vas a ver en pantalla]

Antes de empezar, dime qué decisiones tienes que tomar para hacer esto, y cuáles
crees que debería tomar yo. Después de eso, empieza.
```

> **Ese último párrafo es el más valioso de toda la plantilla.** Obliga al agente
> a exponer las decisiones que de otro modo tomaría en silencio. Es la diferencia
> entre recibir algo que funciona y entender lo que recibiste.

---

## Parte 3 — Los cinco encargos de hoy

De menor a mayor. Cada uno se apoya en el anterior.

### Encargo 1 — Levantar el motor

```text
QUIERO: tener n8n funcionando en mi computadora y poder abrirlo en el navegador.

MI CONTEXTO:
- Sistema operativo: [Windows 11 / macOS / Linux]
- No sé si tengo Docker instalado.
- No soy programador.

RESTRICCIONES:
- No quiero pagar nada.
- Prefiero no instalar cosas que pidan permisos de administrador, salvo que sea
  imprescindible; si lo es, avísame antes.

SABRÉ QUE FUNCIONÓ CUANDO: pueda abrir una dirección en el navegador y ver la
pantalla de n8n.

Antes de empezar: dime qué necesitas saber de mi máquina, dame los comandos de
solo lectura para averiguarlo, y explícame qué vas a instalar y por qué.
```

**Qué verificar cuando termine:** que puedas abrirlo. Y pregúntale:
*"¿dónde quedaron guardados mis datos y qué pasaría si borro esa carpeta?"*.
Es la pieza 2 de la arquitectura. Si no sabe responder con precisión, no montó
lo que crees.

### Encargo 2 — Entender lo que ya existe

```text
Importé un flujo de ejemplo en n8n y quiero entenderlo antes de cambiarlo.

Explícamelo en lenguaje de negocio, en orden:
1. Qué lo dispara.
2. Qué hace cada paso y qué le entrega al siguiente.
3. Cuáles de esas cosas son DECISIONES que alguien tomó, y no obligaciones
   técnicas.
4. Qué pasaría si le llega un dato vacío o mal escrito.

Si algo no lo puedes determinar con certeza, dilo en vez de suponerlo.
```

**Qué verificar:** que puedas señalar en pantalla la regla del semáforo y
explicarla con tus palabras. Si no puedes, aún no entendiste lo que vas a
delegar.

### Encargo 3 — Conectar tu fuente real

Aquí aparece **tu** decisión: cuál es la fuente de verdad.

```text
QUIERO: que el flujo lea mis proyectos reales desde una hoja de cálculo mía, en
lugar de los datos de ejemplo.

MI CONTEXTO:
- Mi hoja tiene estas columnas: [LÍSTALAS]
- Está en Google Sheets / Excel / [...]

RESTRICCIONES:
- No quiero crear un proyecto en Google Cloud ni configurar OAuth hoy.
- La hoja tiene datos de demostración, no confidenciales.

SABRÉ QUE FUNCIONÓ CUANDO: ejecute el flujo y vea mis propios proyectos.

Dime primero qué opciones existen para conectar esto, con sus ventajas y
desventajas, y cuál me recomiendas para hoy. No elijas por mí.
```

**Qué verificar:** que tus datos aparezcan. Y algo más importante: pregúntale
*"¿qué pasa el día que quiera desconectar esto?"*. Si la respuesta es incómoda,
la conexión estaba mal elegida.

### Encargo 4 — Escribir la regla

Este encargo **no se delega**: se dicta. Tú traes la regla; el agente la
implementa.

```text
QUIERO: que el flujo marque cada proyecto con un semáforo, según esta regla que
yo definí:

[ESCRIBE TU REGLA. Por ejemplo:]
- ROJO si está bloqueado, o si vence en menos de 3 días y va por debajo del 50%.
- ÁMBAR si tiene un bloqueador anotado, o vence en menos de 7 días.
- VERDE en cualquier otro caso.

RESTRICCIONES:
- La regla debe quedar visible y editable por alguien que no programa. No quiero
  que esté escondida en código.
- Un modelo de lenguaje NO debe decidir el color. Esto lo decide la regla.

SABRÉ QUE FUNCIONÓ CUANDO: pueda cambiar un umbral y ver cómo cambia el
resultado.
```

**Por qué esta separación es el centro de la clase:** un modelo puede redactar el
informe, pero el criterio de riesgo es una decisión de gestión. Si la delegas,
nadie puede auditarla después — ni siquiera tú.

### Encargo 5 — Agregar el modelo, con su verificación

```text
QUIERO: que el informe final lo redacte un modelo de lenguaje, pero sin que
pueda inventar datos.

RESTRICCIONES:
- Debe usar solo los datos que le llegan del flujo.
- Quiero un paso posterior que compare lo que escribió contra los datos de
  entrada y lo marque como rechazado si inventó algo.
- Ese paso de verificación NO puede ser otro modelo de lenguaje.

SABRÉ QUE FUNCIONÓ CUANDO: pueda provocar una invención a propósito y ver que
el flujo la detecta.

Explícame por qué la verificación no debería hacerla otro modelo.
```

**Qué verificar:** provoca el fallo. Pídele que fuerce una invención y comprueba
que el flujo la rechaza. **Una verificación que nunca has visto fallar no es una
verificación**: es una decoración.

---

## Parte 4 — Cómo revisar lo que te entregan

No necesitas leer código para auditar a un agente. Necesitas hacer preguntas que
no se puedan responder con humo:

| Pregunta | Qué estás detectando |
|---|---|
| "¿Qué decisiones tomaste tú que debería haber tomado yo?" | Decisiones silenciosas |
| "¿Qué parte de esto no probaste?" | Trabajo dado por bueno sin verificar |
| "Muéstrame el resultado real, no lo que debería pasar" | Confusión entre intención y evidencia |
| "¿Qué pasa si llega un dato vacío?" | Fragilidad no considerada |
| "¿Qué se rompe si mañana cambio la hoja de sitio?" | Acoplamiento oculto |
| "¿Dónde queda esto guardado y cómo lo deshago?" | Reversibilidad |

> **Señal de alarma:** si el agente responde "sí, todo funciona correctamente"
> sin mostrarte una salida real, todavía no sabes si funciona. Pide la evidencia,
> siempre. La frase que más veces salva un proyecto es: *"muéstrame la salida
> literal"*.

---

## Parte 5 — Lo que nunca se delega

Aunque el agente pueda hacerlo, hay cosas que si delegas dejas de dirigir:

1. **Cuál es la fuente de verdad** cuando un dato vive en varios sitios.
2. **Qué significa riesgo** en tu operación.
3. **Quién aprueba** antes de que algo salga al mundo.
4. **Qué datos pueden salir** de tu organización y cuáles no.
5. **Cuándo algo está terminado.**

Un agente que decide estas cinco cosas no te está ayudando: te está
reemplazando en la única parte del trabajo que era tuya.

---

## El cierre honesto

Este repositorio completo —los flujos, la documentación, las verificaciones— lo
construyó un agente en una sesión. Y durante esa sesión el agente se equivocó
varias veces: afirmó cosas sin comprobarlas, dio por bueno un archivo que estaba
roto, y propuso cambiar un texto que en realidad era correcto.

**Ninguno de esos errores lo detectó el agente solo.** Los detectó la
verificación: ejecutar de verdad, mirar la salida real, y preguntar "¿cómo lo
comprobaste?".

Esa es la habilidad que te llevas. No es saber n8n. Es saber encargar, y saber
revisar lo que vuelve.
