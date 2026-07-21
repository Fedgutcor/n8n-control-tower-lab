# Proveedores de LLM: cuál usar, dónde y por qué

> Verificado en julio de 2026 contra el código fuente de `n8n-io/n8n`
> (`packages/@n8n/nodes-langchain`) y las páginas de límites de cada proveedor.
> Los nombres técnicos de esta página están tomados del código, no de memoria.
> Aun así, **revisa límites y modelos disponibles la semana de la clase**: los
> catálogos gratuitos cambian sin aviso.

Recuerda la distinción de [EL-LLM-COMO-COPILOTO.md](EL-LLM-COMO-COPILOTO.md):
hay un modelo que te ayuda a **montar** (un chat en tu navegador) y otro que vive
**dentro** del flujo (un nodo de n8n). Se eligen con criterios distintos.

---

## Parte 1 — El copiloto del montaje

Aquí el criterio no es la calidad del modelo: es **cuántas veces puedes preguntar
sin quedarte sin cuota**. En tres horas de montaje vas a pegar el mismo tipo de
error muchas veces, y la frustración real no es que el modelo se equivoque, es
quedarse sin mensajes a mitad de la clase.

| Chat | Mensajes al día (práctico) | ¿Aguanta pegar un log largo? | Para esta clase |
|---|---|---|---|
| **DeepSeek** (chat.deepseek.com) | Sin tope reportado | Sí, sin fricción | **Recomendado**: aguanta debugging repetido las 3 horas |
| **Claude** (claude.ai) free | ~15–40 por ventana de 5 h | Sí, contexto muy amplio | Mejor calidad de explicación; alcanza si preguntas menos de ~30 veces |
| **ChatGPT** free | ~10 cada 5 h, luego baja a un modelo menor | Sí (arriba de ~5000 caracteres lo adjunta como archivo) | Se agota rápido en una clase de debugging |
| **Gemini** (gemini.google.com) | ~30 al día | Sí, hasta ~30 000 caracteres | Suficiente si vas con calma |
| **Google AI Studio** (aistudio.google.com) | Sin tope tipo chat | Contexto enorme | Es un panel técnico, no un chat cómodo — pero es donde sacarás la API key |

**Recomendación para el aula:** abre **DeepSeek** como copiloto principal, porque
ningún estudiante se va a quedar sin cuota a mitad del ejercicio, y ten
**Claude free** como segunda opción cuando necesites una explicación conceptual
más cuidada.

> **Advertencia de datos, que también es contenido de la clase:** al copiloto solo
> se le pegan **mensajes de error y comandos**. Nunca datos de la organización,
> nombres de clientes, ni una API key. Esto vale para cualquier proveedor, y
> conviene ser explícito cuando el proveedor está fuera de tu jurisdicción. Si tu
> institución tiene una política de proveedores aprobados, esa política manda
> sobre esta tabla.

### Lo que NO vamos a prometer en clase

n8n tiene un **AI Assistant** y un **AI Workflow Builder** integrados en el
editor. En la versión self-hosted **existen, pero no funcionan al instalar**:
requieren activación de licencia de la instancia, configurar el endpoint del
servicio y traer tu propia API key (BYOK). No es "prender y listo".

**Decisión para esta clase:** no se muestra en vivo. Si quieres enseñarlo, ensáyalo
antes y ten un plan B — perder 20 minutos de una clase de 3 horas peleando con una
activación de licencia no le enseña nada a nadie.

También existe **`n8n-mcp`** (`czlonkowski/n8n-mcp`), un servidor MCP que le da a
un LLM conocimiento real de los nodos de n8n y reduce mucho la invención de node
types. Es excelente — **para el docente que prepara el material**. Su instalación
(clonar, compilar, configurar rutas absolutas en el cliente MCP) está fuera del
alcance de un estudiante no técnico en clase.

---

## Parte 2 — El modelo dentro del flujo

Aquí el criterio cambia por completo: el nodo se ejecuta **cada vez que corre el
workflow**, sin nadie mirando. Por eso el orden del ejercicio es primero el
informe determinista (workflow `03`), y solo después el modelo.

| Proveedor | Papel en la clase | Nodo en n8n | Credencial | Free tier | ¿Tarjeta? | Modelo a elegir |
|---|---|---|---|---|---|---|
| **Google Gemini** | **Principal** | Google Gemini Chat Model | Google Gemini(PaLM) API | Sin tarjeta | No | `gemini-2.5-flash` |
| **Groq** | Plan B en vivo | Groq Chat Model | Groq | 30 req/min · 14 400 req/día | No | `llama-3.3-70b-versatile` (cambia el default, que es un modelo viejo) |
| **Ollama** (local) | Ruta avanzada | Ollama Chat Model | Ollama (URL base) | Ilimitado, offline | No aplica | `qwen2.5-coder:7b` (~4,7 GB) — ver nota abajo |
| **Cerebras** | Alternativa | OpenAI Chat Model con URL base cambiada a `https://api.cerebras.ai/v1` | OpenAI | 1 M tokens/día · 30 req/min | No | Llama 3.3 70B (catálogo inestable, verifica antes) |

> **Por qué el workflow 04 trae `qwen2.5-coder:7b` y no un modelo mejor.** Está
> elegido a propósito: es el modelo con el que **verificamos** que se produce la
> invención de datos que la clase quiere mostrar. Con `qwen2.5:14b` el mismo
> prompt pasó limpio. Si cambias el modelo por defecto, es probable que el
> `RECHAZADO` no aparezca y pierdas la demostración. Cuando quieras el mejor
> informe posible en vez de la demostración del fallo, sube de modelo — pero
> hazlo después de que el grupo haya visto fallar al pequeño.
>
> Si la máquina no puede con 4,7 GB, existe `llama3.2:3b` (~2 GB), pero **no
> hemos verificado** que reproduzca la invención: puede que la demo no salga.

Notas que importan:

- **Groq tiene nodo propio.** No hace falta el rodeo por el nodo de OpenAI. Solo
  Cerebras necesita ese truco de cambiar la URL base.
- **El límite gratuito de Gemini ya no es un número universal.** Google dejó de
  publicar una tabla única y varía por proyecto. No prometas "1500 al día":
  que cada estudiante mire su propia consola en AI Studio.
- **El default del nodo de Groq es un modelo viejo.** Hay que cambiarlo a mano o
  el informe saldrá pobre y nadie entenderá por qué.
- **Cerebras limita el contexto a 8192 tokens** en sus modelos gratuitos: un
  snapshot grande puede no caber.
- **Usa Basic LLM Chain, no AI Agent.** Convertir un JSON en un informe es una
  transformación fija: no hay decisiones que tomar ni herramientas que elegir. El
  Agent agrega un ciclo de razonamiento que aquí solo suma costo, lentitud y
  formas nuevas de fallar.

### Cómo elegir, en una decisión

**El camino por defecto de esta clase es Google Gemini.** No porque sea el mejor
modelo, sino porque es el que menos tiempo de clase consume: sin tarjeta, sin
descargas, sin configuración de red. En un taller de tres horas, la fricción
cuesta más que la calidad del modelo.

```
Empieza siempre por aquí:
   → Gemini. Sacas la clave en aistudio.google.com y el nodo funciona.

¿Gemini te dio error de cuota en plena clase?
   → Groq. Plan B inmediato: tiene nodo propio y 14 400 llamadas al día.

¿Quieres que nada salga de tu máquina, y tienes tiempo para configurarlo?
   → Ollama. Es la ruta avanzada: cero cuota y cero fuga de datos, pero
     puede pedirte resolver un problema de red (ver más abajo). Si vas por
     aquí, la ruta de montaje `npx` te lo pone mucho más fácil que Docker.
```

> **Por qué Ollama no es el camino por defecto, aunque sea el más atractivo
> sobre el papel:** verificamos su conexión en una máquina Linux real y
> descubrimos que, además de la configuración de Docker, el firewall del propio
> equipo puede bloquear el tráfico de forma silenciosa. Es un problema
> perfectamente resoluble, pero no en medio de una clase con veinte personas
> esperando. Para uso posterior en la organización sigue siendo la mejor opción
> en privacidad y costo.

---

## El gotcha que va a romper la clase: Docker no ve tu Ollama

Este es **el** punto donde se cae un aula entera, y merece anticiparse en la
diapositiva, no descubrirse en vivo.

Si corres n8n en Docker y Ollama en tu computador, `http://localhost:11434` **no
funciona** desde el nodo. La razón es conceptual y vale la pena explicarla: para
el contenedor, `localhost` es *el contenedor mismo*, no tu máquina. Está buscando
Ollama dentro de su propia caja, donde no existe.

**La URL correcta en los tres sistemas es:**

```text
http://host.docker.internal:11434
```

> **Cuidado con el valor que ya viene puesto.** Al crear la credencial de
> Ollama, n8n precarga el campo "Base URL" con `http://localhost:11434`. Como
> aparece relleno, es natural asumir que está bien y no tocarlo. Si vas por la
> ruta Docker, **tienes que sobrescribirlo**. Un campo precargado con el valor
> equivocado engaña más que un campo vacío.

**En macOS y Windows** funciona tal cual, sin configuración extra.

**En Linux** ese nombre no se resuelve por defecto. Hay que añadir esto al
servicio `n8n` en `docker-compose.yml` (ya viene incluido en este repositorio):

```yaml
extra_hosts:
  - "host.docker.internal:host-gateway"
```

**Si Ollama corre en otra máquina de la red** (por ejemplo un equipo del aula que
sirve a todos): en esa máquina hay que arrancar Ollama con `OLLAMA_HOST=0.0.0.0`
para que acepte conexiones que no sean locales, y en n8n la URL apunta a la IP de
esa máquina: `http://192.168.x.x:11434`.

> Si usas la ruta `npx` en vez de Docker, este problema no existe: n8n corre
> directamente en tu máquina y `http://localhost:11434` funciona. Es una razón
> legítima para preferir `npx` si el objetivo del día es trabajar con Ollama.

### En Linux, `extra_hosts` es necesario pero puede no ser suficiente

Lo comprobamos en una máquina Linux real, y el resultado corrige la versión
simplificada que circula en foros y respuestas de modelos.

Con `extra_hosts` puesto, el nombre **sí** resuelve. Pero si el host tiene un
firewall (`ufw`, `firewalld`, reglas de `iptables`) que permite el puerto 11434
solo por una interfaz concreta —por ejemplo `docker0`— el tráfico de n8n queda
bloqueado igual, porque `docker compose` crea su **propia** red bridge, distinta
de `docker0`.

**Cómo distinguir los dos fallos, que es lo que de verdad hay que saber leer:**

| Lo que ves al probar la conexión | Qué significa |
|---|---|
| `bad address 'host.docker.internal'` | El nombre no resuelve → falta `extra_hosts` |
| `connection refused` | Llegó al destino y nadie respondió → Ollama no está corriendo |
| **`timed out`** (se queda colgado) | Resuelve y sale, pero algo lo descarta en el camino → **firewall** |

Un `timeout` casi nunca es "está lento". Un paquete rechazado responde rápido;
un paquete **descartado en silencio** por un firewall produce exactamente esa
espera muerta. Esa distinción vale para cualquier problema de red, no solo aquí.

Para comprobarlo en Linux:

```bash
sudo ufw status verbose      # ¿hay una regla para 11434 atada a una interfaz?
docker network inspect <red-del-proyecto> | grep -i gateway
```

**Para la clase:** si algún estudiante en Linux ve un *timeout* con el nodo de
Ollama, no pierdas tiempo con la URL: la URL está bien. Es el firewall de su
máquina. La salida más rápida en ese momento es cambiar ese estudiante a la ruta
`npx`, donde el problema desaparece por completo. Deja el ajuste del firewall
para después de la clase — no es una configuración que convenga tocar con prisa
y con público.

---

## Prompt para diagnosticar el error de conexión con Ollama

Cuando el nodo falle, no adivines. Pásale esto a tu copiloto:

```text
Tengo n8n corriendo en Docker y Ollama corriendo en mi máquina
([Windows / macOS / Linux]).

El nodo Ollama Chat Model de n8n me da este error:
[PEGA EL ERROR COMPLETO]

La URL que puse en la credencial es: [PEGA LA URL]

Antes de darme la solución:
1. Explícame por qué un contenedor Docker no alcanza un servicio que corre en
   la máquina anfitriona cuando uso "localhost".
2. Dame un comando de SOLO LECTURA para confirmar que Ollama está corriendo y
   respondiendo en mi máquina.
3. Dime qué debería responderme ese comando si todo está bien.
```

Fíjate en lo que hace ese prompt: pide primero **el modelo mental**, después la
**verificación**, y solo al final la corrección. Es el protocolo de 4 pasos
aplicado al error más probable del día.
