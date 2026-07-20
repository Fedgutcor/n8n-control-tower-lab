# Matriz de conexiones: cómo extender la torre

| Fuente | Qué aporta | Credencial en n8n | Adaptador al contrato | Prueba mínima | Riesgo a gestionar |
|---|---|---|---|---|---|
| Google Sheets | proyectos, responsables, fechas | OAuth2 de Google | cada fila → `kind: project` | leer 3 filas | compartir sólo la hoja necesaria |
| Google Calendar | hitos, reuniones, ventanas | OAuth2 de Google | evento → `kind: event`, `date: start` | listar próximos 7 días | zona horaria y eventos privados |
| GitHub | issues, PRs, releases | OAuth2 o token con mínimo alcance | issue → proyecto/riesgo | listar issues abiertos | token con repositorios mínimos |
| Linear | issues, ciclos, prioridades | API key/OAuth según conector | issue → `title`, `owner`, `priority`, `status` | traer un equipo/ciclo | no exponer identificadores internos |
| Notion | decisiones y documentación | OAuth de Notion | página DB → decisión/proyecto | consultar base | conceder acceso sólo a la base |
| Slack / correo | difusión aprobada | OAuth | no es fuente: es salida | enviar a canal de prueba | compuerta humana antes de publicar |
| OpenAI API | redacción/explicación | API key en credencial | recibe snapshot, devuelve JSON | un informe con datos fijos | costo, alucinación y datos sensibles |

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
      "owner": "Lucía",
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
