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
dato, usa No disponible". Aun así, en nuestras pruebas contra un modelo local
(`qwen2.5-coder:7b`) el modelo **inventó una fecha límite** —`2026-07-18`,
cuando el dato real de la entrada era `2026-07-24`— y lo hizo en **dos corridas
independientes con el mismo prompt**. No fue casualidad ni mala suerte: fue
reproducible.

Con un modelo más grande (`qwen2.5:14b`) el mismo prompt pasó limpio, usando la
fecha correcta y "No disponible" donde correspondía.

**Lo que esto enseña, y es el centro de la clase:**

1. Un prompt bien escrito **reduce** las invenciones. No las elimina.
2. La diferencia entre un modelo y otro puede ser la diferencia entre un informe
   correcto y uno con una fecha falsa. Un cambio de modelo no es un detalle de
   configuración.
3. Por eso la validación es **código, no otra instrucción al modelo**. Pedirle
   más cuidado a un sistema que ya recibió la instrucción de tener cuidado no
   agrega ninguna garantía.
4. Y por eso el dato inventado fue una **fecha**: no un disparate evidente, sino
   un valor plausible que nadie detecta leyendo por encima. Así es como una
   invención llega a una reunión de dirección.

> **Para el docente:** esta es una demostración en vivo que funciona. Ejecute el
> workflow 04 con un modelo pequeño y muestre el `RECHAZADO` en pantalla. Vale
> más que cualquier advertencia sobre alucinaciones.
