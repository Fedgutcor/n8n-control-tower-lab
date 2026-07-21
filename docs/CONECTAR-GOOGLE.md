# Conectar Google sin pelear con las credenciales

> Este documento existe porque el camino "oficial" para conectar Google a n8n es
> el punto donde más clases se hunden. Aquí está el camino corto, el camino
> completo, y cuándo usar cada uno.

---

## El problema, dicho sin rodeos

n8n trae nodos nativos de Google Sheets y Google Calendar. Funcionan muy bien, y
para usarlos **cada persona** debe: crear un proyecto en Google Cloud, habilitar
la API correspondiente, configurar una pantalla de consentimiento, crear
credenciales de tipo OAuth, copiar la dirección de retorno que muestra n8n,
pegarla en Google, y autorizar la aplicación.

Son entre siete y diez pantallas de una consola pensada para programadores. Con
un grupo de veinte personas y tres horas de reloj, ese camino se come la clase
entera y deja a varios sin conectar.

**Por eso la clase usa el camino corto, y deja el completo documentado para
después.**

---

## Camino corto: leer una hoja de Google sin credenciales

Sirve para **leer** datos. Es lo que necesita esta clase: la hoja es la fuente de
verdad de los proyectos, y el flujo solo la consulta.

### Paso 1 — Abrir la hoja al enlace

En tu hoja de cálculo:

1. Botón **Compartir**, arriba a la derecha.
2. En **Acceso general**, cambia "Restringido" por **Cualquier persona con el
   enlace**.
3. Deja el rol en **Lector**.
4. **Listo**.

> **Qué estás haciendo realmente, y por qué conviene entenderlo:** cualquiera que
> tenga el enlace podrá leer esa hoja. No la estás publicando en un buscador,
> pero tampoco es privada. Para datos de demostración es perfecto. **Para datos
> reales de tu organización, no lo hagas**: ahí sí corresponde el camino
> completo con OAuth, que respeta los permisos de cada persona.

### Paso 2 — Construir la dirección de descarga

El enlace de tu hoja se ve así:

```text
https://docs.google.com/spreadsheets/d/1AbC...XyZ/edit#gid=0
```

Toma el código largo que está entre `/d/` y `/edit` y arma esta otra dirección:

```text
https://docs.google.com/spreadsheets/d/1AbC...XyZ/export?format=csv
```

Eso descarga la hoja como archivo CSV, sin pedir ninguna cuenta.

### Paso 3 — Pegarla en el flujo

Abre el workflow **`05 · Fuente real sin escribir código`**, haz clic en el nodo
**Traer la hoja de datos** y reemplaza la dirección por la tuya. Ejecuta.

**Si responde con error 401**, la hoja sigue siendo privada: repite el paso 1.
Ese número es la señal, y conviene reconocerlo — significa "no estás autorizado",
no "la dirección está mal".

---

## Qué hace el flujo 05, nodo por nodo

Ninguno de estos es un nodo de código. Esa es la idea.

| Nodo | Qué hace | Cómo se configura |
|---|---|---|
| **Traer la hoja de datos** | Descarga el archivo | Se pega una dirección |
| **Convertir filas en datos** | Convierte el CSV en registros | Se elige "CSV" en una lista |
| **Calcular semáforo** | Agrega los campos `semaforo`, `dias_restantes` y `necesita_decision` | Se escriben en un formulario |
| **Ordenar por fecha límite** | Ordena los proyectos | Se elige el campo en una lista |
| **Contar por semáforo** | Cuenta cuántos hay de cada color | Se elige el campo a agrupar |

La regla del semáforo queda a la vista y **cualquiera puede discutirla**:

```text
estado = bloqueado   → ROJO
estado = en_riesgo   → ÁMBAR
cualquier otro       → VERDE
```

Ese es el punto de la clase entera: la decisión de qué es un riesgo la toma una
persona y queda escrita donde se puede auditar. No la toma el modelo, ni queda
enterrada en código que solo entiende quien lo escribió.

---

## El calendario

Para **leer** eventos hay dos caminos, y aquí conviene la honestidad:

**Opción A — nodo nativo de Google Calendar (recomendada, con OAuth).** Es la que
funciona bien y de forma sostenible. Requiere el camino completo de credenciales
descrito abajo. Si vas a conectar el calendario de tu organización, es esta.

**Opción B — dirección privada en formato iCal.** Google Calendar ofrece una
dirección secreta que devuelve el calendario como archivo `.ics` sin pedir
credenciales. Es atractiva por lo simple, **pero ese formato no se procesa en
n8n sin escribir código**, así que contradice el objetivo de esta clase. Queda
mencionada para que sepas que existe, no como camino recomendado.

> **Nota de honestidad:** la opción B no la verificamos de punta a punta. Si
> alguien la prueba y encuentra una forma no-code de procesar el `.ics`, es una
> mejora bienvenida para el material.

---

## Camino completo: OAuth, para cuando los datos son reales

Hazlo **antes** de la clase si vas a demostrarlo, nunca en vivo.

1. Entra a `console.cloud.google.com` y crea un proyecto.
2. En "APIs y servicios", habilita **Google Sheets API** y **Google Calendar
   API**, según lo que vayas a usar.
3. Configura la **pantalla de consentimiento**. Si es una cuenta personal, elige
   tipo "Externo" y agrega tu propio correo como usuario de prueba: sin eso,
   Google bloquea la autorización.
4. Crea credenciales de tipo **ID de cliente de OAuth**, aplicación web.
5. En n8n, crea la credencial de Google correspondiente. n8n te mostrará una
   **dirección de redirección**: cópiala.
6. Pega esa dirección en el campo "URIs de redirección autorizados" de Google.
7. Copia de Google el **ID de cliente** y el **secreto** a n8n, y autoriza.

**El error más común** es el paso 6: si la dirección de redirección no coincide
carácter por carácter, Google responde `redirect_uri_mismatch`. Ese mensaje es
literal — compara las dos cadenas, no busques otra causa.

> Si n8n corre en tu máquina, esa dirección será de `localhost`. Google la acepta
> para desarrollo. Cuando el flujo pase a un servidor con dominio propio, hay que
> volver a este paso y agregar la nueva dirección.

---

## Qué llevarse de todo esto

Hay una decisión de arquitectura escondida en la elección del camino, y vale más
que el procedimiento:

- **Leer datos públicos o de demostración** → basta con una dirección. Sin
  cuentas, sin permisos, sin nada que revocar.
- **Leer o escribir datos de la organización** → OAuth, siempre. Porque ahí sí
  importa quién autorizó qué, con qué alcance, y cómo se revoca cuando esa
  persona cambia de rol.

La pregunta que conviene hacerse antes de conectar cualquier fuente no es "¿cómo
lo conecto?" sino **"¿qué pasa el día que haya que desconectarlo?"**.
