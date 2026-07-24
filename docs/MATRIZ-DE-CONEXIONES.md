# Matriz de conexiones: cómo extender la torre

| Fuente | Qué aporta | Credencial en n8n | Adaptador al contrato | Prueba mínima | Riesgo a gestionar |
|---|---|---|---|---|---|
| Google Sheets | proyectos, responsables, fechas | OAuth2 de Google | cada fila → `kind: project` | leer 3 filas | compartir sólo la hoja necesaria |
| Google Calendar | hitos, reuniones, ventanas | OAuth2 de Google | evento → `kind: event`, `date: start` | listar próximos 7 días | zona horaria y eventos privados |
| GitHub | issues, PRs, releases | OAuth2 o token con mínimo alcance | issue → proyecto/riesgo | listar issues abiertos | token con repositorios mínimos |
| Linear | issues, ciclos, prioridades | API key/OAuth según conector | issue → `title`, `owner`, `priority`, `status` | traer un equipo/ciclo | no exponer identificadores internos |
| Notion | decisiones y documentación | OAuth de Notion | página DB → decisión/proyecto | consultar base | conceder acceso sólo a la base |
| Slack / correo | difusión aprobada | OAuth | no es fuente: es salida | enviar a canal de prueba | compuerta humana antes de publicar |

## Modelos de lenguaje (no son fuentes: son redactores)

Un modelo nunca aporta evidencia al contrato. Recibe el snapshot ya calculado y
lo convierte en lenguaje. Detalle completo, límites y el gotcha de Docker con
Ollama en [PROVEEDORES-LLM.md](PROVEEDORES-LLM.md).

| Proveedor | Nodo en n8n | Credencial | Free tier | Riesgo a gestionar |
|---|---|---|---|---|
| Ollama (local) | Ollama Chat Model | Ollama (URL base) | ilimitado, offline | Docker no alcanza `localhost` del anfitrión |
| Google Gemini | Google Gemini Chat Model | Google Gemini(PaLM) API | sin tarjeta | el límite diario varía por proyecto |
| Groq | Groq Chat Model | Groq | 14 400 req/día | el modelo por defecto está desactualizado |
| Cerebras | OpenAI Chat Model con URL base `https://api.cerebras.ai/v1` | OpenAI | 1 M tokens/día | contexto de 8192 tokens: el snapshot puede no caber |
| OpenAI API | OpenAI Chat Model | API key en credencial | de pago | costo por ejecución; ChatGPT ≠ API key |

En los cinco casos el riesgo transversal es el mismo: **alucinación y datos
sensibles**. Por eso el informe determinista se construye primero y el modelo
solo redacta sobre evidencia ya validada.

## Patrón de adaptador

No conecte la herramienta directamente al informe. Termine cada conector con un
nodo **Code** o **Edit Fields** que devuelva el contrato común, y luego haga un
`POST` al webhook del workflow 02.

```json
{
  "source": "google-calendar",
  "records": [
    {
      "id": "id-estable-del-proveedor",
      "kind": "event",
      "title": "Comité de lanzamiento",
      "owner": "Demo Uno",
      "status": "programado",
      "priority": "alta",
      "start": "2026-07-21T09:00:00-05:00",
      "url": "https://…"
    }
  ]
}
```

## Definición de terminado para un conector

1. Obtiene sólo los datos/alcances necesarios.
2. Pasa una ejecución manual con datos reales.
3. Su salida cumple el contrato sin campos inventados.
4. Un registro inválido deja evidencia de error y no publica nada.
5. Se sabe quién puede revocar la credencial.
