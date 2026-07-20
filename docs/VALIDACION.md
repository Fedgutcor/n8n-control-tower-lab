# Validación de entrega

## Ejecutado durante la preparación

- `node scripts/verify-artifacts.mjs` → correcto. Confirma que los archivos
  requeridos existen, los workflows son JSON válido y la guía no descarga
  recursos remotos.
- Revisión visual del HTML desde `file://` en Chrome headless, tanto en tema
  oscuro como claro → correcto. Se verificaron jerarquía, contraste, layout
  responsive de escritorio y la guía abre sin depender de red.
- Revisión de artefactos: el workflow 01 y 03 no necesitan credenciales; el 02
  exige el contrato de entrada y responde por webhook.

## Gate pendiente en esta máquina

Docker Desktop / CLI no está instalado y n8n no se encuentra ejecutándose en
`localhost:5678`. Por ello no se pudo ejecutar el import real de los JSON ni
`docker compose config` aquí. No es un error del repositorio: es una
precondición local explícita.

## Ensayo de 10 minutos antes de clase

1. Instale/abra Docker Desktop.
2. `cp .env.example .env`, complete la clave y ejecute `docker compose up -d`.
3. Abra `http://localhost:5678` y cree el usuario local.
4. Importe `01-semilla-demostracion.json`, ejecute y revise el nodo
   **Normalizar y priorizar**.
5. Importe `03-informe-ejecutivo.json`, ejecute y verifique que el campo
   `reportMarkdown` tiene las cinco secciones pedidas.
6. Importe `02-torre-de-control.json`; en modo test envíe
   `samples/control-tower-demo.json` al webhook y compruebe la respuesta.
7. Recién entonces cree una credencial de prueba para una fuente real.
