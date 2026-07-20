import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const required = [
  'README.md',
  '.env.example',
  'docker-compose.yml',
  'GUIA-INTERACTIVA.html',
  'docs/FUNDAMENTACION-DE-LA-CLASE.md',
  'samples/control-tower-demo.json',
  'samples/dashboard-template.csv',
  'workflows/01-semilla-demostracion.json',
  'workflows/02-torre-de-control.json',
  'workflows/03-informe-ejecutivo.json',
];

let failures = [];
for (const relative of required) {
  if (!existsSync(join(root, relative))) failures.push(`Falta ${relative}`);
}

const workflowDir = join(root, 'workflows');
if (existsSync(workflowDir)) {
  for (const filename of readdirSync(workflowDir).filter((name) => name.endsWith('.json'))) {
    try {
      const workflow = JSON.parse(readFileSync(join(workflowDir, filename), 'utf8'));
      if (!workflow.name || !Array.isArray(workflow.nodes) || !workflow.nodes.length) {
        failures.push(`${filename} no parece una exportación de workflow n8n`);
      }
    } catch (error) {
      failures.push(`${filename} contiene JSON inválido: ${error.message}`);
    }
  }
}

const guidePath = join(root, 'GUIA-INTERACTIVA.html');
if (existsSync(guidePath)) {
  const guide = readFileSync(guidePath, 'utf8');
  for (const requirement of [
    'data-theme',
    'window.LPR',
    'Actividad Reina',
    'localStorage',
    'Exportar mi plan',
    'n8n local',
  ]) {
    if (!guide.includes(requirement)) failures.push(`La guía no incluye «${requirement}»`);
  }
  if (/<(?:script|img|link)\b[^>]+(?:src|href)="https?:\/\//i.test(guide)) {
    failures.push('La guía carga un recurso remoto y no sería autónoma offline');
  }
}

if (failures.length) {
  console.error('Validación fallida:\n- ' + failures.join('\n- '));
  process.exit(1);
}
console.log('✓ Artefactos presentes, workflows JSON válidos y guía autocontenida.');
