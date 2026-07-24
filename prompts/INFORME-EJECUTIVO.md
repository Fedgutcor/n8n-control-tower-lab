# Prompt — redactor del informe ejecutivo

Úsalo en un nodo **Basic LLM Chain** o en un nodo de OpenAI después de validar el
snapshot normalizado. El modelo no decide el estado del negocio: redacta sobre
evidencia ya calculada.

```text
Eres redactor ejecutivo para una oficina de proyectos. Recibirás un JSON de una
torre de control con proyectos, bloqueos, fechas y eventos. Redacta ÚNICAMENTE
con esa evidencia.

Devuelve JSON válido con esta forma exacta:
{
  "headline": "una oración, máximo 22 palabras",
  "estado_general": "verde|ámbar|rojo",
  "decisiones_solicitadas": [
    {"proyecto":"", "responsable":"", "decisión":"", "fecha_límite":""}
  ],
  "riesgos": [
    {"proyecto":"", "riesgo":"", "impacto":"", "siguiente_paso":""}
  ],
  "agenda": ["fecha y evento"],
  "narrativa": "máximo 120 palabras"
}

Reglas:
- Conserva literalmente nombres, responsables, fechas, porcentajes y estados
  presentes en la entrada.
- Si falta un dato, usa "No disponible". No lo infieras.
- No inventes métricas, decisiones, dueños, citas ni causas.
- Separa hecho, riesgo y recomendación.
- Evidencia obligatoria: cada riesgo debe referir un dato recibido.
```

## Prueba de calidad

1. Compare el JSON de salida con la entrada: cada fecha, nombre y porcentaje
   debe estar allí.
2. Si aparece un hecho no presente en la entrada, el resultado se rechaza.
3. La aprobación de un director sigue siendo una compuerta humana; el modelo
   nunca envía ni publica por sí mismo.

El workflow `04-informe-con-modelo.json` automatiza esa comparación en un nodo
Code, sin usar IA para revisar a la IA: compara campo a campo contra el snapshot
de entrada y marca `RECHAZADO` listando lo que se inventó.

## Este prompt no basta, y tenemos la prueba

Lea las reglas de arriba. Son explícitas: "no inventes fechas", "si falta un
dato, usa No disponible". Aun así, contra los tres proveedores gratuitos que
usa esta clase (Groq, Cerebras y Gemini) el mismo prompt, contra el mismo
snapshot, produjo salidas que el validador anti-invención **rechazó** —cada
proveedor con un fallo distinto, verificado con corridas reales:

| Proveedor / modelo | Corridas | Rechazadas | Qué inventó |
|---|---|---|---|
| **Google Gemini** (`gemini-2.5-flash`) | 6 | **5** (83%) + 1 más al ejecutar el workflow completo en n8n | `fecha_límite` con "martes" / "antes del martes" (paráfrasis de un texto real, puesta en un campo que exige el dato literal); en la corrida dentro de n8n, además inventó `responsable: "Legal"` y una fecha `2026-07-21` que no existe en la entrada |
| **Groq** (`llama-3.3-70b-versatile`) | 3 | 1 (33%) | `responsable: "Legal"` / `"Proveedor"` — nombres tomados del texto del bloqueo, no del campo `owner` real |
| **Cerebras** (`gpt-oss-120b`) | 3 | 0 | — |

Ninguno reprodujo *exactamente* el bug original (ese fue con un modelo local,
`qwen2.5-coder:7b`, que inventó la fecha `2026-07-18` cuando la real era
`2026-07-24`, en dos corridas seguidas — dato histórico, ya no es el que usa
este workflow). Pero el fallo más frecuente y reproducible hoy —Gemini
parafraseando una fecha en vez de copiarla literal— es la razón por la que el
workflow 04 quedó cableado con Gemini: la demo de `RECHAZADO` sigue siendo
real, solo que el dato concreto que se inventa cambió.

**Lo que esto enseña, y es el centro de la clase:**

1. Un prompt bien escrito **reduce** las invenciones. No las elimina, ni
   siquiera en modelos grandes de proveedores serios.
2. Cada modelo falla distinto. Gemini pone una fecha en lenguaje natural donde
   se pedía el dato literal; Groq atribuye una decisión a "Legal" en vez de a
   la persona responsable real. Un cambio de modelo no es un detalle de
   configuración: cambia incluso QUÉ se inventa.
3. Por eso la validación es **código, no otra instrucción al modelo**. Pedirle
   más cuidado a un sistema que ya recibió la instrucción de tener cuidado no
   agrega ninguna garantía — y el validador atrapa formas de fallar distintas
   sin necesitar saber de antemano cuál va a ocurrir.
4. Y por eso los datos inventados son **plausibles**: "antes del martes" suena
   razonable, "Legal" suena a un responsable válido. Nadie los detecta leyendo
   por encima. Así es como una invención llega a una reunión de dirección.

> **Para verlo con tus propios ojos:** esta demostración funciona con
> Gemini (~80% de probabilidad de `RECHAZADO` en la primera corrida, casi
> segura en dos). Si la primera corrida sale `APROBADO`, ejecuta una vez
> más — es alta probabilidad, no garantía, y eso también es parte de la
> lección: la validación por código no depende de que el modelo falle
> siempre, protege igual cuando falla a veces.
