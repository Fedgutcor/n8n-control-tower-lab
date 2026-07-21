# Montaje de n8n local, paso a paso

> Datos verificados en julio de 2026 contra el registro de npm y la
> documentación oficial. Versión de referencia de esta clase: **n8n 2.30.8**.
>
> Este documento se lee con el copiloto abierto al lado. Cuando algo falle —y
> algo va a fallar, es parte del ejercicio— usa el protocolo de
> [EL-LLM-COMO-COPILOTO.md](EL-LLM-COMO-COPILOTO.md) en vez de improvisar.

---

## Antes de elegir ruta: qué necesitas de verdad

| Requisito | Ruta Docker | Ruta npx |
|---|---|---|
| Node.js | No hace falta | **22.22 o superior** (obligatorio) |
| Docker Desktop | Sí | No |
| Espacio en disco | ~1,5 GB (imagen) | ~500 MB |
| RAM libre recomendada | 2 GB mínimo, 4 GB cómodo | 2 GB mínimo |
| Tiempo de arranque | 5–10 min la primera vez | 2–3 min |

**Cuál elegir:**

- **Docker** si quieres el entorno idéntico al del docente y que apagar el
  computador no te borre nada. Es la ruta principal de la clase.
- **npx** si tu máquina no aguanta Docker Desktop. Antes de elegirla, lee la
  comprobación de `ignore-scripts` del paso B2: es un minuto y evita el único
  fallo difícil de diagnosticar de esta ruta.

> Ambas rutas llegan al mismo lugar: n8n en `http://localhost:5678`. Nadie queda
> atrás por elegir una u otra.

---

## Paso 0 — Verificar la máquina (sin instalar nada)

Ejecuta esto **antes** de instalar y guarda las respuestas: son el contexto que
le vas a pegar a tu copiloto si algo falla.

Abre una terminal según tu sistema:

- **macOS**: pulsa `Cmd + Espacio`, escribe `Terminal` y presiona `Enter`.
- **Windows**: pulsa la tecla Windows, escribe `PowerShell` y presiona
  `Enter`.
- **Linux**: usa el atajo `Ctrl + Alt + T`, o busca "Terminal" en el menú de
  aplicaciones de tu distribución.

```bash
node --version
docker --version
```

Interpretación:

| Lo que ves | Qué significa |
|---|---|
| `v22.22.0` o mayor | Node sirve para la ruta npx |
| `v20.x`, `v18.x` | Node **no** sirve para n8n 2.x — o actualizas, o usas Docker |
| `command not found` / `no se reconoce` | Eso **no** está instalado. No es un error, es información |
| `Docker version 27.x` | Docker está instalado (falta confirmar que esté corriendo) |

**Nota sobre Node:** usa una versión **par** (22 o 24). Las versiones impares
(como la 25) son de desarrollo y rompen componentes internos de n8n.

Si Docker aparece instalado, confirma que además esté **corriendo**:

```bash
docker ps
```

Si responde con una tabla (aunque esté vacía), está corriendo. Si dice
`Cannot connect to the Docker daemon`, Docker está instalado pero apagado: abre
Docker Desktop y espera a que el ícono deje de moverse.

---

## Ruta A — Docker (principal)

### A1. Instalar Docker Desktop

Descárgalo de `docker.com` para tu sistema. Al terminar, ábrelo y espera a que
diga que está corriendo. Vuelve a ejecutar `docker ps` para confirmar.

### A2. Preparar la configuración

Desde la carpeta de este repositorio:

```bash
cp .env.example .env
```

En Windows con PowerShell:

```powershell
Copy-Item .env.example .env
```

> **`.env` es un archivo oculto — tu explorador de archivos puede no
> mostrarlo.** Como su nombre empieza con un punto, macOS y Windows lo ocultan
> por defecto.
>
> - **macOS (Finder)**: con la carpeta abierta, pulsa `Cmd + Shift + Punto`
>   para mostrar los archivos ocultos.
> - **Windows (Explorador de archivos)**: en la pestaña **Vista**, activa la
>   casilla **Elementos ocultos**.
> - **Camino más simple**: abre la carpeta completa del repositorio con un
>   editor como VS Code. Su panel de archivos muestra los que empiezan con
>   punto sin que tengas que cambiar ninguna configuración del sistema.

Abre `.env` con un editor de texto y reemplaza el valor de
`N8N_ENCRYPTION_KEY` por una cadena larga y aleatoria. Genera esa cadena así:

```bash
openssl rand -hex 32          # macOS y Linux
```

```powershell
# Windows (PowerShell) — 64 caracteres hexadecimales, dos GUID sin guiones
((New-Guid).ToString() + (New-Guid).ToString()) -replace '-',''
```

> **Ejercicio del método de la clase:** en vez de copiar ese comando de
> PowerShell a ciegas, pídeselo a tu copiloto y compara la respuesta — es el
> mismo caso que ejercita el **prompt B** de
> [EL-LLM-COMO-COPILOTO.md](EL-LLM-COMO-COPILOTO.md): *"dame un comando de
> PowerShell de solo lectura que genere una cadena hexadecimal aleatoria de 64
> caracteres"*. Verifica que la salida tenga realmente 64 caracteres antes de
> pegarla en `.env`.

**Por qué importa, y no es un trámite:** esa clave cifra las credenciales que
guardes dentro de n8n. Si la pierdes o la cambias después, n8n no podrá
descifrar las credenciales que ya creaste y tendrás que volver a cargarlas
todas. Guárdala donde guardas tus contraseñas. Y nunca la subas a Git — por eso
`.env` está en `.gitignore`.

### A3. Levantar n8n

```bash
docker compose up -d
```

La primera vez descarga ~1,5 GB. Es normal que tarde varios minutos.

Verifica que quedó arriba:

```bash
docker compose ps
docker compose logs --tail=30
```

Abre `http://localhost:5678`. Crea el usuario propietario: es **local, en tu
máquina**, no una cuenta de n8n.com.

### A4. Apagar sin perder nada

```bash
docker compose down
```

Los datos siguen en el volumen `n8n_data`. Para volver: `docker compose up -d`.

> **El comando peligroso:** `docker compose down -v`. Esa `-v` borra el volumen
> y con él tus workflows y credenciales. Úsalo solo cuando quieras empezar
> limpio a propósito.

---

## Ruta B — npx (sin Docker)

### B1. Confirmar Node 22.22+

Si `node --version` da menos que eso, instala Node 22 LTS desde `nodejs.org`,
cierra la terminal, ábrela de nuevo y vuelve a verificar. El paso de cerrar y
abrir no es superstición: la terminal solo lee la configuración al arrancar.

### B2. Arrancar

```bash
npx n8n
```

Descarga y arranca. **Deja esa ventana abierta**: si la cierras, n8n se apaga.
Abre `http://localhost:5678`.

Para apagarlo: `Ctrl + C` en esa ventana.

> ### ⚠️ Comprueba esto antes: una opción de npm puede impedir el arranque
>
> Si al arrancar ves `SQLite package has not been found installed`, **no es un
> problema de n8n ni de tu sistema operativo**. Casi siempre es una opción de
> configuración de npm en tu equipo.
>
> Compruébalo antes de instalar nada:
>
> ```bash
> npm config get ignore-scripts
> ```
>
> **Si responde `true`**, npm tiene desactivada la ejecución de los scripts de
> instalación de los paquetes. Algunos componentes de n8n necesitan ese paso
> para prepararse, y sin él quedan a medio instalar. Arráncalo así:
>
> ```bash
> npm_config_ignore_scripts=false npx n8n
> ```
>
> **Por qué esta trampa es tan difícil de diagnosticar**, y por qué vale la pena
> conocerla más allá de n8n:
>
> - El mensaje habla de SQLite, cuando la causa es una opción de npm. Apunta al
>   síntoma, no al origen.
> - El arreglo que parece obvio —`npm rebuild sqlite3 --build-from-source`—
>   **responde "rebuilt successfully" sin haber hecho nada**, porque `rebuild`
>   también respeta esa misma opción. Es la peor clase de error: el que te
>   confirma que lo arreglaste cuando no.
> - Esa opción suele activarse por una recomendación de seguridad y quedar
>   olvidada durante meses en `~/.npmrc`, afectando a cualquier programa que
>   instales después.
>
> **¿Conviene desactivar esa opción para siempre?** No, y la razón es una
> lección de la clase por derecho propio.
>
> `ignore-scripts=true` es una **protección real**: impide que un paquete
> ejecute código en tu computador durante la instalación. Varios ataques
> conocidos contra el ecosistema de npm usaron exactamente esa vía — te bastaba
> con instalar una dependencia para quedar comprometido, sin abrir ni ejecutar
> nada. Quien la activó en tu equipo hizo bien.
>
> Lo correcto no es apagar la protección, sino **abrirla a propósito y solo
> cuando toca**, como en el comando de arriba: decides por un paquete concreto,
> en un momento concreto, y vuelves a quedar protegido.
>
> Es el mismo criterio que atraviesa toda la clase, aplicado a la seguridad: el
> valor por defecto protege, y las excepciones son decisiones conscientes de
> alguien, no una puerta que se deja abierta por comodidad.
>
> **Si `ignore-scripts` está en `false` y aun así falla**, cámbiate a la ruta
> Docker y sigue con la clase. No inviertas más tiempo ahí.
>
> **Ten en cuenta el espacio**: `npx n8n` descarga un árbol de dependencias muy
> grande. Deja **al menos 4 GB libres** antes de empezar.
>
> Esta causa la encontró una prueba independiente sobre una máquina real,
> después de que la primera explicación —"npx no funciona en macOS"— resultara
> equivocada. Está contado en [CASO-DE-ESTUDIO.md](CASO-DE-ESTUDIO.md).

### B2b. Si necesitas dos instancias a la vez

Cambiar `N8N_PORT` **no basta**: n8n usa además un segundo puerto interno
(5679) que no se mueve con esa variable. Si arrancas una segunda instancia
verás `Task Broker's port 5679 is already in use`. Hay que cambiar los dos:

```bash
N8N_PORT=5690 N8N_RUNNERS_BROKER_PORT=5691 npx n8n
```

Es un caso poco frecuente en clase, pero imposible de adivinar: esa segunda
variable no aparece en la documentación habitual.

### B3. Dónde quedan tus datos

En la carpeta `.n8n` de tu usuario (`~/.n8n` en Mac/Linux,
`C:\Users\TuUsuario\.n8n` en Windows). Ahí vive la base de datos con tus
workflows.

---

## Paso final (ambas rutas) — Importar y ejecutar

> **Antes de empezar: te va a aparecer un formulario que no puedes cerrar.**
> n8n muestra una encuesta de personalización ("Customize n8n to you") con
> varias listas desplegables y **sin botón de cerrar**. No está roto y no es
> obligatorio responderlo: pulsa **Get started** sin llenar nada y sigue. Puede
> reaparecer en otras pantallas; se despacha igual.

1. En n8n, menú **⋯ → Import from file...**.
2. Elige `workflows/01-semilla-demostracion.json`.
3. Ejecuta con **Execute workflow**.
4. Haz clic en el nodo **Normalizar y priorizar** y mira la pestaña de salida:
   ahí está tu primer snapshot.
5. En el nodo **Semilla: tres fuentes**, busca el proyecto *Onboarding
   comercial* y cambia su `status: 'en_curso'` por `status: 'bloqueado'`.
   Ejecuta otra vez y compara la salida.

Ese último paso es el ejercicio real. No es "ver si funciona": es entender qué
regla produjo el cambio.

> **Lo que vas a ver, y es una trampa a propósito.** El conteo de bloqueados
> sube de 1 a 2, como esperabas. Pero *Onboarding comercial* **no aparece** en
> la lista de decisiones necesarias, aunque acabas de marcarlo como bloqueado.
>
> No está roto. La lista de decisiones no mira el estado: mira si hay **texto**
> en el campo `bloqueador`, y ese proyecto lo tiene vacío.
>
> Ahora la pregunta que importa, y que no tiene una respuesta técnica:
> **¿debería un proyecto bloqueado sin explicación aparecer entre las decisiones
> pendientes?** Se puede argumentar que sí —está detenido, alguien debe
> actuar— o que no —sin saber qué lo bloquea, no hay decisión que tomar—.
>
> Alguien eligió una de las dos al escribir esa regla. Esa elección es
> **exactamente** el tipo de cosa que no debes delegar en una herramienta ni en
> un modelo: es una decisión de gestión disfrazada de detalle técnico.

---

## Lo que parece un error y no lo es

Al arrancar por Docker verás en los logs dos bloques alarmantes. **Los dos son
ruido esperado.** Conviene mirarlos una vez, entender por qué no importan, y
seguir — es un buen ejercicio de lectura de logs.

**1. "Failed to start Python task runner … Python 3 is missing from this system"**

n8n permite escribir nodos de código en JavaScript o en Python. La imagen no
trae Python. Los workflows de esta clase usan **solo JavaScript**, y justo
después de ese mensaje el log registra `Registered runner "JS Task Runner"`, que
es el que sí necesitamos. Verificado: los tres workflows se ejecutan sin
problema.

**2. Un bloque de "deprecations related to your n8n setup"**

n8n avisa que algunos valores por defecto cambiarán en versiones futuras. No
afecta a esta clase. Este repositorio ya eliminó la única variable que estaba
realmente deprecada (`N8N_RUNNERS_ENABLED`); el resto son avisos anticipados.

> **La lección, que es de la clase y no de n8n:** un log que grita no siempre
> señala un problema. Distinguir advertencia de error es parte del oficio, y es
> justamente lo que le vas a pedir a tu copiloto cuando le pegues un log:
> "dime qué de esto es un error real y qué es ruido".

## `localhost` no significa lo mismo para todos los dispositivos

Este concepto va a aparecer dos veces más en la clase — en el formulario del
workflow `08` y en la compuerta de aprobación del workflow `10` — así que
conviene entenderlo aquí una sola vez, en general, y no como un caso especial
de Telegram.

Cuando abres `http://localhost:5678` en el navegador de tu propia laptop,
`localhost` significa "este mismo computador donde estoy escribiendo esto
ahora". Funciona porque el navegador y n8n corren en la misma máquina.

El problema aparece en el momento en que **otro dispositivo** intenta abrir
esa misma dirección. Tu teléfono, la laptop de un compañero, un bot de
Telegram que corre en los servidores de Telegram: para cualquiera de ellos,
`localhost` no apunta a tu laptop. Apunta **a sí mismos**. Un teléfono que
abre `http://localhost:5678` intenta conectarse consigo mismo, no contigo —
y por supuesto, no encuentra nada ahí.

No es un error de configuración que se arregla cambiando un parámetro al
azar. Es exactamente lo que la palabra significa: "esta misma máquina, la que
sea que estés usando para leer esto".

**Dónde te vas a topar con esto en la clase:**

- El formulario del workflow `08`: la URL que genera el Form Trigger solo
  responde a dispositivos en tu misma red — nunca a "localhost" desde otro
  dispositivo.
- La compuerta del workflow `10`: la operación nativa de Telegram para
  aprobar con un botón (`Send and Wait for Response`) arma su enlace con la
  dirección de tu propia instancia. Si esa dirección quedó en `localhost`, el
  botón en tu teléfono jamás va a poder tocarla — por la misma razón exacta.

**La solución, cuando hace falta,** no es "arreglar localhost": es decirle a
n8n una dirección que el otro dispositivo sí pueda alcanzar — la IP de tu
laptop en la red local (si están en la misma red y esa red no separa los
dispositivos entre sí) o un dominio público (si necesitas alcance desde
cualquier lugar). Es exactamente el primer paso hacia lo que
[EL-DIA-DESPUES.md](EL-DIA-DESPUES.md) llama "producción".

## Cuando algo falla: los cuatro errores del día

Estos son los que aparecen de verdad. Para cualquier otro, usa el **prompt B**
de la guía del copiloto.

### 1. `port is already allocated` / `address already in use`

Algo más ocupa el puerto 5678 — casi siempre otra instancia de n8n que quedó
corriendo.

Abre `.env` y cambia el puerto:

```text
N8N_PORT=8080
```

Vuelve a levantar y entra por `http://localhost:8080`.

### 2. `EACCES: permission denied, open '/home/node/.n8n/config'`

Solo en Docker. El usuario interno del contenedor no puede escribir en el
volumen porque el dueño de la carpeta es otro.

El diagnóstico rápido es poner `N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=false` en
`.env`. Funciona, pero conviene saber que eso **desactiva una comprobación**, no
arregla la causa: el dueño del volumen sigue estando mal. En clase es aceptable;
en un servidor real, corrige el propietario de la carpeta.

### 3. `npm ERR! code EPIPE` tras varios minutos, o una instalación eterna

**Este es el peor error del día y merece leerse antes de que ocurra.**

Si intentas la ruta `npx` con una versión de Node anterior a la 22.22, **n8n no
te dice que tu Node es viejo**. Lo medimos: la instalación corre durante unos
**nueve minutos**, escupe dos docenas de advertencias que parecen catástrofes
(`npm WARN ERESOLVE overriding peer dependency`) y termina con un error de red:

```text
npm ERR! code EPIPE
npm ERR! request to https://registry.npmjs.org/mustache failed, reason: write EPIPE
```

Ese mensaje habla de red y no menciona Node por ningún lado. Es engañoso: la
causa raíz es la versión de Node, no tu conexión.

**Por qué pasa:** npm no bloquea la instalación cuando tu versión de Node no
cumple el requisito del paquete — solo advierte, y sigue. La misma instalación
en Node 22 tardó **menos de dos minutos** y funcionó.

**Qué hacer:** verifica `node --version` **antes** de correr `npx`. Si no es
22.22 o superior, no insistas: instala Node 22 LTS o usa la ruta Docker.

> Vale la pena señalarle esto al grupo cuando ocurra. Es un ejemplo perfecto de
> por qué el protocolo del copiloto pide *verificar antes de actuar*: el mensaje
> de error apunta a la red, y una hora de depurar la red no habría encontrado
> nunca la causa.

### 3b. `npx n8n --version` te responde, pero mintió

Si ya tenías n8n instalado globalmente de antes, `npx` **reutiliza esa versión
vieja en silencio**, sin descargar nada. Verás un número de versión y creerás
que todo está bien.

Compruébalo antes de confiar en el resultado:

```bash
which n8n
```

Si responde con una ruta, tienes una instalación global previa y `npx` te está
mostrando *esa*, no la actual.

### 4. `SQLite package has not been found installed`

Solo en la ruta `npx`/npm. El mensaje completo es:

```text
Initial database connection attempt 2 failed: SQLite package has not been
found installed. Try to install it: npm install sqlite3 --save
```

**El mensaje miente, y por eso está aquí.** Te dice que instales `sqlite3`,
pero `sqlite3` **ya está instalado**. Lo que falta es que esté **compilado**:
ese paquete incluye código en C que tiene que convertirse en un programa para
tu procesador durante la instalación, y a veces ese paso se salta en silencio.
Quedan las fuentes sin el resultado.

Cómo confirmarlo antes de tocar nada: busca la carpeta `build` dentro del
paquete. Si `sqlite3` existe pero no tiene `build/`, ese es exactamente el caso.

La solución es pedirle a npm que lo compile:

```bash
npm rebuild sqlite3 --build-from-source
```

Necesita herramientas de compilación instaladas (en macOS, las Xcode Command
Line Tools; en Windows, las build tools de Visual Studio). Si no las tienes, la
salida rápida es cambiarse a la ruta Docker.

> **Por qué esto es un argumento a favor de Docker, y no un detalle menor:** la
> imagen de Docker viene con ese componente ya compilado por quienes publican
> n8n. Toda esta categoría de problema —código nativo que debe compilarse en la
> máquina de cada persona, con las herramientas de cada persona— desaparece.
> Es la razón de fondo por la que la ruta Docker es la principal de esta clase,
> más allá de la comodidad.

### 5. `Cannot connect to the Docker daemon`

Docker está instalado pero no corriendo. Abre Docker Desktop y espera a que
termine de arrancar.

---

## Ejercicio de cierre del montaje

Antes de pasar a conectar fuentes, responde estas tres preguntas por escrito. Si
no puedes, vuelve sobre el paso correspondiente — no sigas adelante.

1. ¿Dónde quedan guardados tus workflows si apagas el computador?
2. ¿Qué pasa si pierdes `N8N_ENCRYPTION_KEY`?
3. ¿Qué comando apaga n8n **sin** borrar tus datos, y cuál sí los borra?

Si alguna te cuesta, pásasela a tu copiloto con el **prompt C**: "explícamelo con
una analogía cotidiana y dime qué síntoma vería si lo configuro mal".
