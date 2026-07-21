# Recorrido guiado: construye tu automatización hablando con la IA

> Para el estudiante. No necesitas saber programar. Vas a construir una
> automatización real **pidiéndosela a un modelo de lenguaje**, pegándola en n8n,
> viéndola fallar, y arreglándola con el error en la mano.
>
> Ese ciclo —pedir, pegar, ver el error, corregir— es lo que vas a practicar. No
> es un atajo hasta que aprendas a programar: **es la forma de trabajo**.

---

## Antes de empezar: la regla que hace que esto funcione

Un modelo de lenguaje **inventa** nombres de nodos de n8n con total confianza.
No es un defecto que se arregle con un prompt mejor: pasa siempre, y hay que
contar con ello.

Por eso el método no es "pídele el flujo completo y confía". Es este:

```
1. Pide UNA pieza pequeña.
2. Pégala en n8n.
3. Mira qué dice n8n.
4. Devuélvele a la IA lo que n8n dijo, literal.
5. Repite hasta que funcione.
```

**El paso 4 es el que casi nadie hace y el que lo cambia todo.** El modelo no ve
tu pantalla: el mensaje de error que copies es su única ventana a la realidad.

> Vas a tener errores. No son señal de que lo estás haciendo mal — son el
> material de trabajo. Un flujo que sale bien al primer intento no te enseñó nada.

---

## Paso 0 — Ten esto abierto (5 minutos)

Tres ventanas, en este orden:

1. **n8n**, en `http://localhost:5678`. Si aún no lo montaste, ve a
   [MONTAJE-PASO-A-PASO.md](MONTAJE-PASO-A-PASO.md) y vuelve aquí.
2. **Tu copiloto**: DeepSeek, Claude o ChatGPT. Cuál elegir y por qué está en
   [PROVEEDORES-LLM.md](PROVEEDORES-LLM.md).
3. **Este documento**.

**Primer mensaje a tu copiloto.** Cópialo tal cual: le da el contexto que
necesita para no inventar de más.

```text
Voy a construir una automatización en n8n. Trabajo así:

- Uso n8n versión 2.x, instalado en mi propia computadora.
- No soy programador. Explícame en pasos concretos y dime qué debo ver en
  pantalla después de cada uno.
- Cuando me des algo para pegar en n8n, dame UNA pieza a la vez, no el flujo
  completo.
- Si no estás seguro del nombre exacto de un nodo o de un campo, dímelo en vez
  de adivinar. Prefiero que digas "no estoy seguro" a que inventes un nombre
  que no existe.

Confírmame que entendiste y espera mi primera pregunta.
```

---

## Paso 1 — Mira un flujo que ya funciona (10 minutos)

Antes de construir, hay que leer. Importa `workflows/01-semilla-demostracion.json`
(menú **⋯ → Import from File**) y ejecútalo con **Execute Workflow**.

Haz clic en el nodo **Normalizar y priorizar** y mira la salida.

Ahora pídele a tu copiloto que te lo explique. Copia el JSON del workflow (menú
**⋯ → Download**, y abre el archivo con un editor de texto) y pega esto:

```text
Te voy a pegar un flujo de n8n que YA funciona. No lo modifiques.

Explícame en lenguaje de negocio, en orden de ejecución:
1. Qué lo dispara.
2. Qué hace cada nodo y qué le entrega al siguiente.
3. Qué parte de esto es una DECISIÓN que alguien tomó (no una obligación
   técnica).

Si algo no lo puedes determinar con certeza a partir del texto, dilo en vez de
suponerlo.

[PEGA AQUÍ EL CONTENIDO DEL ARCHIVO]
```

**Qué deberías tener al terminar este paso:** poder señalar en la pantalla dónde
está la regla que decide si un proyecto es un riesgo, y explicarla con tus
palabras.

> **Si no puedes hacer eso, no sigas todavía.** Todo lo que viene se apoya en
> entender que esa regla la puso una persona y se puede discutir.

---

## Paso 2 — Cambia una sola cosa (10 minutos)

Todavía no construyes: modificas.

1. Abre el nodo **Semilla: tres fuentes**.
2. Busca donde dice `status: 'en_curso'` en uno de los proyectos y cámbialo por
   `status: 'bloqueado'`.
3. Ejecuta otra vez.
4. Mira la salida de **Normalizar y priorizar**.

**Qué deberías ver:** el conteo de bloqueados subió, y ese proyecto ahora aparece
entre los que requieren decisión.

Si algo no se ve como esperabas, este es el primer momento de usar el ciclo:

```text
Cambié un valor en un nodo de n8n y el resultado no fue el que esperaba.

Esperaba: [DESCRIBE QUÉ ESPERABAS]
Obtuve: [PEGA LA SALIDA QUE VES]

Antes de darme la solución, dime:
1. Qué está haciendo el flujo con ese dato, según lo que ves.
2. Qué información te falta de mi pantalla para estar seguro.
```

---

## Paso 3 — Construye tu primer nodo desde cero (20 minutos)

Ahora sí. Vas a agregar un nodo que filtre solo los proyectos urgentes.

**Pídeselo así** (fíjate en lo específico que es el pedido):

```text
En n8n tengo un flujo que produce una lista de proyectos. Cada proyecto tiene
estos campos: proyecto, responsable, estado, prioridad, fecha_limite, avance,
bloqueador.

Quiero agregar un nodo que deje pasar SOLO los proyectos cuya prioridad sea
"alta" o "critica".

Dime:
1. Qué nodo de n8n debo agregar (nombre exacto tal como aparece en el buscador
   de nodos).
2. Cómo lo configuro, campo por campo, como si me guiaras por teléfono.
3. Qué debería ver en la salida si funcionó.

Un nodo a la vez. No me des el flujo completo.
```

**Ahora la parte importante.** Sigue lo que te diga, y cuando algo no coincida
—porque el nombre del campo es otro, porque la opción está en otro lugar— no
improvises: díselo.

```text
Seguí tus pasos pero en mi pantalla no aparece [LO QUE NO ENCUENTRAS].
Lo que sí veo es: [DESCRIBE O PEGA LO QUE HAY].
¿Qué significa esa diferencia?
```

> **Esto no es un fracaso del método: es el método.** El modelo conoce n8n en
> general; tú tienes la versión concreta delante. Esa conversación entre lo
> general y lo concreto es exactamente el trabajo.

**Qué deberías tener al terminar:** un nodo Filter conectado, y una salida con
menos proyectos que la entrada.

---

## Paso 4 — Conecta tu propia fuente de datos (25 minutos)

Hasta aquí trabajaste con datos de ejemplo. Ahora usa los tuyos.

### 4.1 Prepara una hoja de cálculo

Crea una hoja de Google con tus propios proyectos. Usa estas columnas exactas
para que todo lo demás encaje:

```text
proyecto | responsable | estado | prioridad | fecha_limite | avance | bloqueador
```

Pon **tres o cuatro filas reales de tu trabajo**. No inventes datos: la mitad del
valor de este ejercicio es ver tu propia operación en el tablero.

### 4.2 Ábrela al enlace

**Compartir** → en "Acceso general" elige **Cualquier persona con el enlace**,
rol **Lector**.

El detalle de por qué esto basta (y cuándo NO deberías hacerlo con datos reales
de tu organización) está en [CONECTAR-GOOGLE.md](CONECTAR-GOOGLE.md). Léelo:
es una decisión, no un trámite.

### 4.3 Conéctala

Importa `workflows/05-fuente-real-sin-codigo.json`, abre el nodo **Traer la hoja
de datos**, y reemplaza la dirección por la tuya, siguiendo las instrucciones de
la nota amarilla que verás en el propio flujo.

**Si te da error 401**, tu hoja sigue siendo privada. Vuelve a 4.2.

**Si te da otro error**, ciclo:

```text
Estoy leyendo una hoja de Google publicada como CSV desde un nodo HTTP Request
de n8n. Me da este error:

[PEGA EL ERROR COMPLETO, TAL CUAL]

La dirección que puse es: [PEGA LA DIRECCIÓN, sin el código de tu hoja si
prefieres, reemplázalo por XXXX]

Dime primero qué significa ese error, y qué puedo comprobar antes de cambiar
nada.
```

**Qué deberías tener al terminar:** tus proyectos reales, con su semáforo
calculado, en la salida del nodo **Ordenar por fecha límite**.

---

## Paso 5 — Haz que la IA escriba el informe (20 minutos)

Importa `workflows/04-informe-con-modelo.json`.

Este flujo toma el resumen y le pide a un modelo que redacte el informe
ejecutivo. Configura el proveedor siguiendo [PROVEEDORES-LLM.md](PROVEEDORES-LLM.md)
— empieza por Google Gemini, que es el de menos fricción.

Ejecútalo y lee el resultado.

**Ahora mira el último nodo, el validador.** Compara lo que escribió el modelo
contra los datos que entraron, y marca `RECHAZADO` si el modelo inventó algo.

Ejecútalo varias veces. **En nuestras pruebas, un modelo pequeño inventó una
fecha límite que no existía, dos veces seguidas, aunque el prompt le decía
explícitamente que no inventara fechas.**

**Qué deberías llevarte de este paso:** que el prompt reduce los errores pero no
los elimina, y que por eso la verificación es un paso aparte y no otra
instrucción amable al modelo.

---

## Paso 6 — Tu propia automatización (30 minutos)

Aquí construyes algo que no está en este repositorio.

Elige **una** decisión de tu trabajo que hoy se toma tarde o sin evidencia
suficiente. Una sola, pequeña y concreta.

**Especifica antes de construir.** Escríbelo en una frase, con este molde:

```text
Cada [CUÁNDO], quiero que [QUÉ INFORMACIÓN] llegue a [QUIÉN],
para que pueda decidir [QUÉ DECISIÓN].
La automatización NO debe [QUÉ NO DEBE HACER NUNCA].
```

Ese último renglón es el más importante y el que casi nadie escribe.

**Ahora pídeselo a tu copiloto:**

```text
Quiero construir esto en n8n:

[PEGA TU FRASE COMPLETA]

Antes de darme ningún paso, respóndeme:
1. ¿Qué fuentes de datos necesitaría y cuál es la más simple de conectar?
2. ¿Qué parte de esto NO debería hacer un modelo de lenguaje, y por qué?
3. ¿En qué punto exacto debería una persona aprobar antes de que algo salga?

Después de responder eso, dame el primer nodo. Uno solo.
```

Sigue el ciclo tantas veces como haga falta. Cuando te dé un nombre de nodo que
no encuentres en n8n, dile exactamente eso y continúa.

---

## Cuando te trabes: la lista corta

| Lo que ves | Qué hacer |
|---|---|
| El nodo que te dijo la IA no existe | Díselo con esas palabras y pregúntale qué nodo real hace eso |
| Un error largo y rojo en n8n | Cópialo completo y pégalo. No lo resumas |
| El flujo corre pero la salida está vacía | Haz clic en cada nodo, de izquierda a derecha, y encuentra el primero que ya viene vacío |
| No entiendes un término en pantalla | Pídele una analogía cotidiana y qué pasaría si lo configuras mal |
| La IA te da vueltas sin resolver | Empieza una conversación nueva con el mensaje del Paso 0. El contexto largo la confunde |

---

## Lo que te llevas de este recorrido

No es que aprendiste n8n. Es que practicaste un ciclo que sirve para cualquier
herramienta que no conozcas:

1. **Pedir poco** y verificar antes de seguir.
2. **Devolver la realidad** —el error literal— a quien te está ayudando.
3. **Distinguir** lo que la herramienta obliga de lo que alguien decidió.
4. **Separar** lo que una máquina puede resolver de lo que una persona debe
   aprobar.

El día que cambies n8n por otra cosa, el ciclo sigue sirviendo. La herramienta
caduca; el método no.
