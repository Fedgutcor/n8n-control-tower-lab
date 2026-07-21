# El LLM como copiloto del montaje

> Para el estudiante. No necesita saber programar. Necesita saber **preguntar,
> verificar y registrar**.

En esta clase el modelo de lenguaje aparece en dos lugares distintos. Confundirlos
es el error número uno, y produce dos frustraciones opuestas: pedirle a un chat que
"ejecute" algo que no puede ejecutar, o meter un modelo dentro del flujo para que
haga un trabajo que una regla resolvía mejor.

| | **Copiloto del montaje** | **Nodo dentro del flujo** |
|---|---|---|
| Dónde vive | En tu navegador: ChatGPT, Claude, Gemini | Dentro de n8n, como un nodo más |
| Cuándo actúa | Mientras instalas y depuras | Cada vez que corre el workflow |
| Qué le pides | "Explícame este error", "¿qué hace este comando?" | "Redacta este informe con estos datos" |
| Quién ejecuta | **Tú**, en tu terminal | n8n, automáticamente |
| Si se equivoca | Pierdes 10 minutos | Publicas un informe con datos inventados |
| Costo | Free tier de chat | Consume cuota de API en cada ejecución |

Este documento trata del primero. El segundo está en
[PROVEEDORES-LLM.md](PROVEEDORES-LLM.md).

---

## Por qué sirve, y exactamente dónde falla

Un LLM es excelente traduciendo entre "lo que dice el error" y "lo que significa
para mí". Ese es el cuello de botella real de un no-programador montando n8n: no
es la falta de conocimiento, es que el mensaje de error está escrito para alguien
que ya sabe.

Pero tiene tres modos de fallo predecibles, y conocerlos es parte de la clase:

**1. Inventa nombres que suenan correctos.**
Te dirá que uses el nodo "n8n Gemini Node" o la variable `N8N_AI_ENABLED`. Suena
plausible. No existe. El modelo completa un patrón, no consulta tu instalación.

**2. Te responde con la versión de hace dos años.**
n8n cambia rápido. Un comando que era correcto en la versión que el modelo vio
más veces durante su entrenamiento puede estar deprecado hoy. El modelo no sabe
qué versión tienes tú.

**3. Es servicial cuando debería decir "no sé".**
Si le pides una solución, te dará una solución. Aunque el problema real sea que
tu Docker no está corriendo y ninguna configuración lo arregle.

> **La consecuencia práctica:** el LLM es tu traductor y tu tutor, no tu fuente de
> verdad. La fuente de verdad es la documentación oficial y **lo que responde tu
> propia máquina**.

---

## El protocolo de 4 pasos

Úsalo cada vez que algo falle. Los cuatro pasos importan; saltarse el 3 es lo que
convierte una sesión de 20 minutos en una tarde perdida.

### Paso 1 — Da contexto antes de dar el problema

El modelo no ve tu pantalla. Un error sin contexto produce una respuesta genérica.

Abre cada conversación de montaje pegando esto una sola vez:

```text
Contexto de mi máquina:
- Sistema operativo: [Windows 11 / macOS 15 / Ubuntu 24.04]
- Estoy montando n8n en local con: [Docker Desktop / npx]
- Versión que reporta mi máquina: [pega la salida del comando de versión]
- Soy usuario no técnico. Explícame en pasos concretos y dime qué debería ver
  en pantalla después de cada paso.
```

### Paso 2 — Pega el error **literal**, completo

No resumas. No escribas "me da un error de puerto". Copia y pega el texto
completo, tal cual aparece, incluidos los números y las rutas.

La razón es concreta: el modelo reconoce mensajes de error casi textualmente. Un
resumen destruye la señal que le permite identificar la causa.

### Paso 3 — Exige separación entre hecho y suposición

Este es el paso que casi nadie hace, y el que más tiempo ahorra:

```text
Antes de darme la solución, respóndeme en tres bloques separados:

1. QUÉ DICE EL ERROR — traducción literal a español, sin interpretar.
2. QUÉ NO PUEDES SABER desde aquí — qué información te falta de mi máquina.
3. CÓMO VERIFICO la causa — un comando de solo lectura que me lo confirme,
   y qué salida esperada significa cada causa posible.

No me des la corrección todavía.
```

Cuando el modelo enumera lo que no sabe, deja de inventar. Y el comando de
verificación convierte una suposición en un hecho antes de que toques nada.

### Paso 4 — Registra la causa, no solo la solución

Cuando funcione, cierra así:

```text
Funcionó. Ahora, en 3 líneas: ¿cuál era la causa raíz, por qué el síntoma se
veía así, y qué señal debería reconocer si vuelve a pasar?
```

Ese párrafo es tu aprendizaje real. Guárdalo. "Ya no falla" no es conocimiento;
"fallaba porque el puerto 5678 ya estaba ocupado por otra instancia" sí lo es.

---

## Regla de oro: el LLM no toca tu terminal

Todo lo que el modelo propone lo ejecutas **tú**, después de entenderlo. No es una
formalidad de seguridad: es la diferencia entre aprender y ejecutar rituales.

Antes de correr cualquier comando que no entiendas, pídelo así:

```text
Antes de que lo ejecute, desármame este comando pieza por pieza:

[PEGA EL COMANDO]

Para cada parte dime: qué hace, y qué pasaría si la omito.
Al final responde tres cosas:
- ¿Este comando MODIFICA algo o solo LEE?
- ¿Es reversible? ¿Cómo lo deshago?
- ¿Qué debería ver en pantalla si sale bien?
```

Señales para detenerse y preguntar a la persona docente antes de ejecutar:

- El comando borra algo (`rm`, `delete`, `prune`, `-v` en un `down`).
- Te pide pegar una contraseña o una API key en la terminal.
- Te pide desactivar una protección ("desactiva el firewall", "usa `--no-verify`").
- No entiendes qué hace y el modelo no supo explicártelo en el desglose anterior.

---

## Prompts listos para el montaje

Cópialos tal cual. Están escritos para que el modelo se comporte como tutor y no
como oráculo.

### A. Antes de instalar — verificar requisitos

```text
Soy usuario no técnico y voy a instalar n8n en local en [Windows 11 / macOS /
Linux].

Dame la lista de comandos de SOLO LECTURA que debo ejecutar para saber si mi
máquina ya cumple los requisitos (sin instalar nada todavía).

Para cada comando indícame en una tabla: qué verifica, cómo se ve una salida
correcta, y cómo se ve una salida que indica que falta algo.
```

### B. Cuando algo falla — diagnóstico guiado

```text
[Contexto del Paso 1]

Ejecuté este comando:
[COMANDO]

Y obtuve esta salida completa:
[PEGA LA SALIDA LITERAL]

Responde en los tres bloques: QUÉ DICE / QUÉ NO PUEDES SABER / CÓMO VERIFICO.
No me des la corrección todavía.
```

### C. Traducir un concepto que apareció en pantalla

```text
En n8n me apareció el término "[TÉRMINO]" y no lo entiendo.

Explícamelo así:
1. Una analogía de la vida cotidiana, sin metáforas técnicas.
2. Qué pasa si lo configuro mal — el síntoma concreto que voy a ver.
3. En esta clase montamos una torre de control que junta proyectos y calendario
   bajo un contrato de datos común: ¿dónde encaja este término en ese flujo?
```

### D. Entender un workflow antes de importarlo

Este es importante: los estudiantes van a importar JSON que no escribieron.

```text
Te voy a pegar el JSON de un workflow de n8n. No lo modifiques.

Explícame, en lenguaje de negocio y en orden de ejecución:
1. Qué dispara el flujo.
2. Qué hace cada nodo y qué dato entrega al siguiente.
3. Dónde una persona debe revisar o aprobar algo.
4. Qué credenciales necesitaría para funcionar con datos reales.
5. Qué haría este flujo si le llega un dato vacío o mal formado.

Si algo del JSON no lo puedes determinar con certeza, dilo explícitamente en vez
de suponerlo.

[PEGA EL JSON]
```

### E. Antes de conectar una fuente real

```text
Quiero conectar [Google Sheets / Calendar / GitHub / Linear / Notion] a n8n.

Antes de los pasos, respóndeme:
1. ¿Qué tipo de credencial usa este conector y quién emite ese permiso?
2. ¿Cuál es el permiso MÍNIMO que necesito para solo leer? No quiero conceder
   escritura.
3. ¿Cómo reviso después qué permisos concedí, y cómo los revoco?
4. ¿Qué dato sensible podría salir de mi organización con esta conexión?

Después de eso, dame los pasos.
```

---

## Qué NO preguntarle

- **"¿Está corriendo mi n8n?"** — No puede saberlo. Eso lo responde tu máquina.
- **"Ejecuta esto por mí"** — Un chat no tiene acceso a tu computador.
- **"¿Cuál es mi API key?"** — Y nunca se la pegues. Las claves van dentro de una
  credencial de n8n, jamás en un chat, en una captura o en Git.
- **"Dame el JSON completo de un workflow que haga X"** — Producirá nodos con
  nombres inventados que n8n rechazará al importar. Para construir workflows,
  úsalo para entender y ajustar los que ya existen, no para generarlos de cero.

---

## Ejercicio de clase: la trampa del nodo inventado

Diez minutos, en parejas. Objetivo: que el fallo lo vivan, no se los cuenten.

1. Pídele a tu modelo: *"Dame el JSON de un workflow de n8n que lea mi Google
   Calendar y me mande un resumen por Slack."*
2. Intenta importarlo en tu n8n local.
3. Registra qué pasó: ¿importó? ¿algún nodo salió como desconocido o con
   parámetros vacíos? ¿los nombres de los nodos coinciden con los que ves en el
   panel de n8n?
4. Ahora prueba el camino correcto: importa `workflows/01-semilla-demostracion.json`
   y usa el **prompt D** para que el modelo te lo explique.

**La conclusión que buscamos:** el modelo es fuerte explicando algo que existe y
débil fabricando algo que debe existir en un sistema concreto. Ese es el criterio
que te vas a llevar de esta clase, y aplica mucho más allá de n8n.
