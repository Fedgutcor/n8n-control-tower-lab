// Valida que el repositorio esté completo, consistente y sin credenciales
// reales antes de publicarlo o de llevarlo a clase. Esto es un repo PÚBLICO:
// las comprobaciones de secretos existen porque un export de n8n o una copia
// apurada de un .env pueden filtrar una clave real sin que nadie lo note.
//
// Salida: process.exit(1) si hay ERRORES. Las ADVERTENCIAS se imprimen pero
// no rompen la validación (son señales a revisar, no bloqueos).

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

// fileURLToPath (y no new URL('..', import.meta.url).pathname) porque en
// Windows el .pathname de una file URL devuelve "/C:/Users/..." con la barra
// inicial de más, y join() arma rutas rotas a partir de ahí.
const root = fileURLToPath(new URL('..', import.meta.url));

const errors = [];
const warnings = [];

const IGNORED_DIRS = new Set(['.git', 'node_modules']);
const IGNORED_FILES = new Set(['.DS_Store']);
// El propio script queda afuera del escaneo de secretos: contiene, a
// propósito, los patrones de detección como texto literal.
const SELF_PATH = 'scripts/verify-artifacts.mjs';

// ---------------------------------------------------------------------------
// 1. Artefactos requeridos
// ---------------------------------------------------------------------------

const required = [
  'README.md',
  '.env.example',
  'docker-compose.yml',
  'GUIA-INTERACTIVA.html',
  'docs/MONTAJE-PASO-A-PASO.md',
  'docs/EL-LLM-COMO-COPILOTO.md',
  'docs/PROVEEDORES-LLM.md',
  'docs/MATRIZ-DE-CONEXIONES.md',
  'samples/control-tower-demo.json',
  'samples/dashboard-template.csv',
  'workflows/01-semilla-demostracion.json',
  'workflows/02-torre-de-control.json',
  'workflows/03-informe-ejecutivo.json',
  'workflows/04-informe-con-modelo.json',
  'prompts/INFORME-EJECUTIVO.md',
];

for (const relativePath of required) {
  if (!existsSync(join(root, relativePath))) {
    errors.push(`Falta el archivo requerido «${relativePath}». Agrégalo antes de publicar.`);
  }
}

// ---------------------------------------------------------------------------
// 1b. Estado de git: un archivo que existe en disco pero no está trackeado
// NO se publica. Este check existe porque ya pasó: el único commit del repo
// era un borrador viejo y roto, y 5 archivos requeridos (documentos nuevos +
// un workflow) nunca llegaron a "git add" — el validador pasaba en verde
// porque solo miraba el disco, sin saber nada del estado real de git.
// ---------------------------------------------------------------------------

function runGit(args) {
  return execSync(`git ${args}`, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

let isGitRepo = false;
try {
  runGit('rev-parse --is-inside-work-tree');
  isGitRepo = true;
} catch {
  isGitRepo = false;
}

if (!isGitRepo) {
  console.log('Información: este directorio no es un repositorio git (o git no está disponible) — se omite la validación de estado de git.');
} else {
  let trackedFiles = null;
  try {
    trackedFiles = new Set(runGit('ls-files').split('\n').filter(Boolean));
  } catch (error) {
    warnings.push(`No se pudo ejecutar "git ls-files": ${error.message}. Se omite la validación de archivos trackeados.`);
  }

  if (trackedFiles) {
    for (const relativePath of required) {
      const posixPath = relativePath.split('\\').join('/');
      if (existsSync(join(root, relativePath)) && !trackedFiles.has(posixPath)) {
        errors.push(
          `${relativePath} existe en disco pero NO está en git: no se publicaría. Ejecuta "git add ${relativePath}" antes de publicar.`
        );
      }
    }
  }

  try {
    const statusLines = runGit('status --porcelain').split('\n').filter(Boolean);
    const modified = [];
    const untracked = [];
    for (const line of statusLines) {
      const code = line.slice(0, 2);
      const filePath = line.slice(3);
      if (code === '??') {
        untracked.push(filePath);
      } else if (code.includes('M')) {
        modified.push(filePath);
      }
    }

    for (const filePath of modified) {
      warnings.push(
        `${filePath} tiene cambios sin commitear (según "git status"): lo que revisaste en disco no es necesariamente ` +
          'lo que está guardado. Confirma que el commit incluya la versión final antes de publicar.'
      );
    }

    // Los archivos requeridos y sin trackear ya generaron su propio ERROR
    // arriba, con mensaje específico — no hace falta duplicarlos aquí.
    for (const filePath of untracked.filter((f) => !required.includes(f))) {
      warnings.push(
        `${filePath} no está trackeado por git (git status lo muestra como "??", y no está cubierto por .gitignore). ` +
          'Revisa si falta un "git add" o si debería estar ignorado.'
      );
    }
  } catch (error) {
    warnings.push(`No se pudo ejecutar "git status --porcelain": ${error.message}. Se omite esa parte de la validación.`);
  }
}

// ---------------------------------------------------------------------------
// 2. Workflows: JSON válido + revisiones de contenido
// ---------------------------------------------------------------------------

function isPlaceholderValue(value) {
  if (value === null || value === undefined) return true;
  const text = String(value).trim();
  if (text.length < 8) return true;
  return /^(reemplaza|your[_-]|tu[_-]|xxx|placeholder|example|changeme|dummy|<|\.\.\.|\$\{|pon[_-]tu)/i.test(text);
}

function findRealCredentialIds(node, path, hits) {
  if (!node || typeof node !== 'object') return;
  if (!Array.isArray(node) && node.credentials && typeof node.credentials === 'object') {
    for (const [credType, credValue] of Object.entries(node.credentials)) {
      if (credValue && typeof credValue === 'object' && 'id' in credValue) {
        const id = credValue.id;
        if (id !== null && id !== '' && !isPlaceholderValue(id)) {
          hits.push(`${path}.credentials.${credType}.id = "${id}"`);
        }
      }
    }
  }
  for (const [key, value] of Object.entries(node)) {
    if (value && typeof value === 'object') findRealCredentialIds(value, `${path}.${key}`, hits);
  }
}

const workflowDir = join(root, 'workflows');
if (existsSync(workflowDir)) {
  for (const filename of readdirSync(workflowDir).filter((name) => name.endsWith('.json'))) {
    const relPath = `workflows/${filename}`;
    const raw = readFileSync(join(workflowDir, filename), 'utf8');

    let workflow;
    try {
      workflow = JSON.parse(raw);
    } catch (error) {
      errors.push(`${relPath} contiene JSON inválido: ${error.message}`);
      continue;
    }

    if (!workflow.name || !Array.isArray(workflow.nodes) || !workflow.nodes.length) {
      errors.push(`${relPath} no parece una exportación de workflow n8n (falta "name" o "nodes").`);
    }

    if (raw.includes('N8N_RUNNERS_ENABLED')) {
      errors.push(
        `${relPath} menciona N8N_RUNNERS_ENABLED, una variable deprecada desde n8n 2.0. Quítala del workflow.`
      );
    }

    // Los sticky notes (n8n-nodes-base.stickyNote) son anotaciones puramente
    // documentales: nunca ejecutan ni configuran una conexión real. Es común
    // que un sticky note EXPLIQUE por qué no hay que usar "localhost:11434"
    // — si no se excluyen, el check se dispara sobre su propia explicación.
    // La exención es solo para este check: cualquier localhost:11434 real
    // (URL de un nodo HTTP, una credencial, etc.) vive fuera de un sticky
    // note y sigue detectándose igual.
    const nodesOutsideStickyNotes = Array.isArray(workflow.nodes)
      ? workflow.nodes.filter((node) => node && node.type !== 'n8n-nodes-base.stickyNote')
      : [];
    const usesLocalhostFueraDeStickyNote = nodesOutsideStickyNotes.some((node) =>
      JSON.stringify(node).includes('localhost:11434')
    );

    if (usesLocalhostFueraDeStickyNote) {
      warnings.push(
        `${relPath} usa "http://localhost:11434". Si el workflow corre dentro del contenedor Docker, esa URL no ` +
          'alcanza a Ollama en tu máquina: cambia "localhost" por "host.docker.internal" (ver docs/PROVEEDORES-LLM.md).'
      );
    }

    const credentialHits = [];
    findRealCredentialIds(workflow, relPath, credentialHits);
    for (const hit of credentialHits) {
      errors.push(
        `${hit} parece un id de credencial real arrastrado del export de n8n. Bórralo (deja "id": null) antes de subir el archivo — este repo es público.`
      );
    }
  }
}

// ---------------------------------------------------------------------------
// 3. docker-compose.yml: variables deprecadas, tag de imagen, host-gateway
// ---------------------------------------------------------------------------

const composePath = join(root, 'docker-compose.yml');
if (existsSync(composePath)) {
  const composeRaw = readFileSync(composePath, 'utf8');
  // Se descartan las líneas que son comentario completo antes de buscar
  // declaraciones reales: el propio compose documenta, a propósito, por qué
  // N8N_RUNNERS_ENABLED no está — esa mención en un comentario no cuenta
  // como una declaración de la variable.
  const codeOnly = composeRaw
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith('#'))
    .join('\n');

  if (codeOnly.includes('N8N_RUNNERS_ENABLED')) {
    errors.push(
      'docker-compose.yml declara N8N_RUNNERS_ENABLED, una variable deprecada desde n8n 2.0. Elimínala del servicio.'
    );
  }

  if (!composeRaw.includes('host-gateway')) {
    errors.push(
      'docker-compose.yml no define "host-gateway" (extra_hosts). Sin eso, Ollama corriendo en la máquina anfitriona ' +
        'no es alcanzable desde el contenedor en Linux.'
    );
  }

  const imageMatch = codeOnly.match(/image:\s*(\S+)/);
  if (!imageMatch) {
    errors.push('docker-compose.yml no tiene una línea "image:" para el servicio de n8n.');
  } else {
    const image = imageMatch[1];
    const lastSegment = image.split('/').pop();
    if (!lastSegment.includes(':')) {
      errors.push(
        `docker-compose.yml usa la imagen "${image}" sin tag de versión explícito. Fija un tag (ej. ":2.30.8") para ` +
          'que la clase no cambie de versión sola entre el ensayo y el día del taller.'
      );
    } else if (lastSegment.split(':').pop() === 'latest') {
      errors.push(
        `docker-compose.yml usa la imagen "${image}" con el tag ":latest". Fija un número de versión explícito, no "latest".`
      );
    }
  }
} else {
  errors.push('No se encontró docker-compose.yml en la raíz del repositorio.');
}

// ---------------------------------------------------------------------------
// 4. GUIA-INTERACTIVA.html: presencia de piezas clave y autonomía offline
// ---------------------------------------------------------------------------

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
    if (!guide.includes(requirement)) errors.push(`La guía no incluye «${requirement}».`);
  }
  if (/<(?:script|img|link)\b[^>]+(?:src|href)="https?:\/\//i.test(guide)) {
    errors.push('La guía carga un recurso remoto y no sería autónoma offline.');
  }

  // Un SyntaxError en un <script> inline no rompe la carga de la página: el
  // HTML y el CSS renderizan igual, así que el laboratorio se ve perfecto en
  // pantalla mientras el JS entero queda muerto (sin pestañas, sin progreso,
  // sin persistencia). Ya pasó en esta serie de clases. `new Function(codigo)`
  // compila el bloque sin ejecutarlo y lanza SyntaxError si está mal formado
  // — sin agregar ninguna dependencia nueva al repo.
  const JS_SCRIPT_TYPES = new Set([
    '', 'text/javascript', 'application/javascript', 'application/ecmascript', 'text/ecmascript',
  ]);
  const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let scriptMatch;
  let scriptIndex = 0;
  while ((scriptMatch = scriptRegex.exec(guide)) !== null) {
    scriptIndex += 1;
    const [, attrs, code] = scriptMatch;

    if (/\bsrc\s*=/i.test(attrs)) continue; // script externo: no hay contenido inline que compilar

    const typeMatch = attrs.match(/\btype\s*=\s*["']([^"']+)["']/i);
    const type = typeMatch ? typeMatch[1].trim().toLowerCase() : '';
    if (type === 'module') continue; // sintaxis de módulo (import/export): new Function no la valida
    if (!JS_SCRIPT_TYPES.has(type)) continue; // no es JS: application/json, ld+json, islas de datos, etc.
    if (!code.trim()) continue;

    const lineNo = guide.slice(0, scriptMatch.index).split('\n').length;

    try {
      // eslint-disable-next-line no-new-func
      new Function(code);
    } catch (error) {
      errors.push(
        `GUIA-INTERACTIVA.html tiene un SyntaxError en el <script> inline #${scriptIndex} (empieza en la línea ` +
          `${lineNo}): ${error.message}. Ese error deja muerto todo el JavaScript de la página aunque el HTML se ` +
          'vea bien — confírmalo abriendo la consola del navegador.'
      );
    }
  }
}

// ---------------------------------------------------------------------------
// 5. Escaneo de credenciales reales en todo el repo versionado
// ---------------------------------------------------------------------------

const SECRET_PATTERNS = [
  {
    regex: /sk-[A-Za-z0-9]{20,}/,
    describe: () => 'coincide con el patrón "sk-..." de una API key tipo OpenAI/Anthropic',
  },
  {
    regex: /AIza[A-Za-z0-9_-]{30,}/,
    describe: () => 'coincide con el patrón "AIza..." de una API key de Google',
  },
  {
    regex: /-----BEGIN\s+(?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/,
    describe: () => 'es un bloque de clave privada (PRIVATE KEY)',
  },
];

function scanTextFileForSecrets(relPath, content) {
  const lines = content.split(/\r?\n/);
  lines.forEach((line, index) => {
    const lineNo = index + 1;
    for (const { regex, describe } of SECRET_PATTERNS) {
      if (regex.test(line)) {
        errors.push(
          `Posible credencial real en ${relPath}:${lineNo} — ${describe()}. Revisa y quita cualquier valor real: este repo es público.`
        );
      }
    }
    const apiKeyMatch = line.match(/"api[_-]?key"\s*:\s*"([^"]*)"/i);
    if (apiKeyMatch && !isPlaceholderValue(apiKeyMatch[1])) {
      const preview = apiKeyMatch[1].slice(0, 6);
      errors.push(
        `El campo "apiKey" en ${relPath}:${lineNo} tiene un valor que no parece un placeholder ("${preview}…"). ` +
          'Reemplázalo por algo evidentemente de ejemplo (ej. "REEMPLAZA_POR_TU_CLAVE").'
      );
    }
  });
}

const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.pdf', '.zip', '.gz',
  '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.mp3', '.mov',
]);

function collectFiles(dir, out) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (IGNORED_DIRS.has(entry.name) || IGNORED_FILES.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(full, out);
    } else if (entry.isFile()) {
      const ext = entry.name.includes('.') ? entry.name.slice(entry.name.lastIndexOf('.')) : '';
      if (!BINARY_EXTENSIONS.has(ext.toLowerCase())) out.push(full);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// 6. Voseo: el material de esta serie de clases es español neutral, sin
// voseo rioplatense. Ya se coló una vez en material publicado ("una clave
// generada por vos" en un .env.example), así que esto queda como red
// automática y no depende de que alguien lo note a mano.
// ---------------------------------------------------------------------------

// Imperativos voseantes tónicos de uso frecuente en instrucciones de clase.
const IMPERATIVOS_VOSEANTES = [
  'arrastrá', 'tocá', 'elegí', 'hacé', 'mirá', 'poné', 'revisá', 'andá', 'fijate',
  'tené', 'vení', 'corré', 'abrí', 'escribí', 'probá', 'guardá', 'dejá', 'buscá',
  'cambiá', 'ejecutá', 'instalá', 'verificá', 'copiá', 'pegá', 'usá', 'mandá',
  'contá', 'pensá', 'acordate', 'quedate', 'seguí', 'leé',
];

// Subconjunto de lo anterior que en español neutral también es un pretérito
// de primera persona legítimo ("yo elegí", "yo abrí"). Sin el contexto de la
// oración no se puede distinguir de forma confiable, así que se marcan como
// advertencia para revisión humana en vez de error.
const IMPERATIVOS_AMBIGUOS = new Set([
  'elegí', 'seguí', 'abrí', 'escribí', 'leí', 'definí', 'corrí', 'salí', 'viví', 'partí',
]);

// Palabras reales del español neutral que terminan en -ás/-és/-ís y NO son
// voseo (para que la regla de conjugaciones no genere ruido sobre ellas).
const CONJUGACION_EXCLUSIONES = new Set([
  'más', 'además', 'demás', 'después', 'través', 'interés', 'inglés', 'país',
  'análisis', 'síntesis', 'crisis', 'quizás', 'jamás', 'atrás', 'detrás', 'estás',
  // "estés" es subjuntivo de tú ("cuando estés listo"), no voseo. Es el único
  // subjuntivo frecuente de tuteo que termina en -és, por eso va aquí.
  'estés',
  // Sustantivos y adjetivos terminados en -és que no son verbos. Un checker
  // que marca palabras normales pierde credibilidad, y entonces nadie mira sus
  // advertencias el día que señala un voseo de verdad.
  'revés', 'estrés', 'francés', 'portugués', 'cortés', 'marqués', 'burgués',
  'envés', 'ciprés', 'arnés', 'traspiés',
  'verás', 'podrás', 'tendrás', 'harás',
]);

// Límite de palabra Unicode-aware: el \b nativo de JS solo reconoce
// [A-Za-z0-9_] como caracteres de palabra, así que trata una vocal acentuada
// (á, é, í...) como si fuera puntuación. Eso hace que "\bejecutá\b" matchee
// por error dentro de "ejecutándose" (el límite queda entre la "t" y la "á").
// Con lookaround sobre \p{L}/\p{N} el acento cuenta como letra y el bug
// desaparece.
const WORD_BEFORE = '(?<![\\p{L}\\p{N}_])';
const WORD_AFTER = '(?![\\p{L}\\p{N}_])';

function scanTextFileForVoseo(relPath, content) {
  const lines = content.split(/\r?\n/);
  lines.forEach((line, index) => {
    const lineNo = index + 1;

    const vosMatch = line.match(new RegExp(`${WORD_BEFORE}vos${WORD_AFTER}`, 'iu'));
    if (vosMatch) {
      errors.push(
        `Voseo en ${relPath}:${lineNo} — pronombre "${vosMatch[0]}". Reescribe en español neutral (sin "vos").`
      );
    }

    for (const word of new Set([...IMPERATIVOS_VOSEANTES, ...IMPERATIVOS_AMBIGUOS])) {
      const match = line.match(new RegExp(`${WORD_BEFORE}${word}${WORD_AFTER}`, 'iu'));
      if (!match) continue;
      if (IMPERATIVOS_AMBIGUOS.has(word)) {
        warnings.push(
          `Posible voseo en ${relPath}:${lineNo} — "${match[0]}" puede ser imperativo voseante o un pretérito ` +
            `válido ("yo ${word}..."). Revisa el contexto antes de decidir.`
        );
      } else {
        errors.push(
          `Voseo en ${relPath}:${lineNo} — imperativo voseante "${match[0]}". Reescribe en español neutral ` +
            '(infinitivo o forma impersonal, ej. "arrastra"/"debes arrastrar" en vez de "arrastrá").'
        );
      }
    }

    const conjugacionRegex = new RegExp(`${WORD_BEFORE}\\p{L}+(?:ás|és|ís)${WORD_AFTER}`, 'gu');
    let conjugacionMatch;
    while ((conjugacionMatch = conjugacionRegex.exec(line)) !== null) {
      const word = conjugacionMatch[0];
      const lower = word.toLowerCase();
      if (CONJUGACION_EXCLUSIONES.has(lower)) continue;
      if (/rás$/i.test(word)) continue; // futuro de tuteo (tendrás, harás...), no es voseo
      errors.push(
        `Voseo en ${relPath}:${lineNo} — conjugación voseante "${word}". Reescribe en español neutral ` +
          '(ej. "tienes"/"puedes"/"quieres" en vez de "tenés"/"podés"/"querés").'
      );
    }
  });
}

const allFiles = collectFiles(root, []);
for (const filePath of allFiles) {
  const relPath = relative(root, filePath).split('\\').join('/');
  if (relPath === SELF_PATH) continue;
  let content;
  try {
    content = readFileSync(filePath, 'utf8');
  } catch {
    continue; // no legible como texto: se ignora en el escaneo de secretos y voseo
  }
  scanTextFileForSecrets(relPath, content);

  const ext = relPath.includes('.') ? relPath.slice(relPath.lastIndexOf('.')) : '';
  const isWorkflowJson = relPath.startsWith('workflows/') && ext === '.json';
  const isVoseoTarget = ['.md', '.html', '.yml', '.yaml'].includes(ext) || relPath === '.env.example' || isWorkflowJson;
  if (isVoseoTarget) scanTextFileForVoseo(relPath, content);
}

// ---------------------------------------------------------------------------
// Resultado
// ---------------------------------------------------------------------------

if (warnings.length) {
  console.warn('Advertencias (no bloquean, pero conviene revisarlas):\n- ' + warnings.join('\n- '));
}

if (errors.length) {
  console.error('\nValidación fallida:\n- ' + errors.join('\n- '));
  process.exit(1);
}

console.log('✓ Artefactos presentes, workflows JSON válidos, docker-compose.yml consistente y sin credenciales detectadas.');
