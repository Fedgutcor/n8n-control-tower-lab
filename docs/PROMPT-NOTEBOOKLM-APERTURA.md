# Prompt para NotebookLM — apertura de la sesión (SDD y TDD)

> Sirve para generar la presentación corta con la que **se abre** la clase, antes
> de tocar n8n. Objetivo: que el grupo entienda por qué primero se especifica y
> se prueba, y por qué eso es exactamente lo que van a hacer con los flujos.
>
> Duración objetivo: **10 a 12 minutos** de exposición. No más: es la antesala,
> no la clase.

---

## Cómo usarlo

1. Abre NotebookLM y crea un cuaderno nuevo.
2. **Sube como fuentes** estos archivos del repositorio (son la materia prima; sin
   ellos la presentación saldrá genérica):
   - `docs/FUNDAMENTACION-DE-LA-CLASE.md`
   - `prompts/INFORME-EJECUTIVO.md` — contiene el experimento real de la
     alucinación, que es el mejor argumento de toda la sesión
   - `docs/EL-LLM-COMO-COPILOTO.md`
3. Pega el prompt de abajo.
4. Genera la presentación y **revísala antes de proyectarla**. NotebookLM
   resume bien pero a veces suaviza los ejemplos concretos, que es justo lo que
   no queremos perder.

---

## El prompt

```text
Eres un diseñador instruccional que prepara la apertura de un taller práctico
de tres horas. La audiencia son directivos y mandos medios sin formación en
programación. Van a construir una automatización real ese mismo día.

Crea una presentación de 10 a 12 minutos, de 8 a 10 diapositivas, que explique
dos formas de trabajar —desarrollo guiado por especificación (SDD) y desarrollo
guiado por pruebas (TDD)— y las conecte con lo que harán a continuación.

REGLAS DE CONTENIDO

1. No expliques SDD ni TDD como metodologías de software. Explícalas como dos
   hábitos de gestión que ellos ya reconocen:
   - Especificar primero = acordar qué significa "terminado" antes de empezar,
     igual que unos términos de referencia o un acta de comité.
   - Probar primero = definir cómo sabremos que algo falló, antes de construirlo,
     igual que un indicador o un criterio de auditoría.

2. Usa un ejemplo concreto que atraviese toda la presentación: un informe
   semanal de estado de proyectos que llega a dirección. Muestra la diferencia
   entre "lo armamos y vemos qué sale" y "primero definimos qué debe contener y
   qué lo invalida".

3. Incluye una diapositiva con este hecho verificado, que es el corazón del
   argumento: en una prueba real, a un modelo de lenguaje se le dio la
   instrucción explícita de no inventar fechas, y aun así inventó una fecha
   límite en dos ejecuciones seguidas. Un modelo más grande, con el mismo texto
   de instrucción, no la inventó. Conclusión que debe quedar en pantalla: una
   instrucción bien escrita reduce los errores, pero no los elimina; por eso la
   verificación tiene que ser un paso aparte y no otra instrucción más.

4. Cierra respondiendo esta pregunta: "¿por qué me hablan de esto antes de
   enseñarme la herramienta?". La respuesta que debe quedar: porque la
   herramienta amplifica lo que ya traías. Si el criterio de "terminado" es
   difuso, automatizarlo produce resultados difusos más rápido.

REGLAS DE FORMA

- Español neutral, sin regionalismos.
- Sin jerga técnica sin traducir. Si aparece un término en inglés, dalo con su
  equivalente en una frase corta.
- Una idea por diapositiva. Frases cortas. Nada de párrafos densos.
- Sin listas de "ventajas y beneficios". Prefiere contrastes concretos:
  antes / después, con criterio / sin criterio.
- Tono directo y respetuoso. Nunca condescendiente. Este público dirige
  equipos: no hay que convencerlo de que la calidad importa, hay que darle el
  mecanismo.
- No uses metáforas de deporte, guerra ni videojuegos.

ESTRUCTURA SUGERIDA

1. Una pregunta de apertura que los ubique en su propia realidad.
2. El problema: por qué los entregables se discuten al final y no al principio.
3. Especificar primero, con el ejemplo del informe semanal.
4. Probar primero: qué significa definir el fallo antes que la solución.
5. Qué cambia cuando hay una máquina ejecutando en el medio.
6. El caso de la fecha inventada.
7. La consecuencia de diseño: la verificación es un paso, no una instrucción.
8. Puente al taller: hoy construyen una cadena que va de las fuentes de datos a
   una decisión humana, y van a especificar y verificar antes de automatizar.

Al final, entrega también:
- Las notas del expositor para cada diapositiva, en dos o tres líneas.
- Tres preguntas para lanzar al grupo durante la presentación.
```

---

## Después de generarla: qué revisar

NotebookLM tiende a suavizar. Antes de dar la clase, comprueba que sobrevivieron
estas tres cosas, que son las que sostienen el argumento:

- [ ] El **caso de la fecha inventada** sigue con sus datos concretos (dos
      ejecuciones, instrucción explícita incumplida, modelo grande sin el fallo).
      Si quedó como "la IA a veces se equivoca", perdió toda su fuerza.
- [ ] La conclusión de que **la verificación es un paso aparte**, no una
      instrucción mejor escrita.
- [ ] El **puente al taller**. Si la presentación termina en abstracto, el grupo
      no entiende por qué la escuchó.

## El puente que hay que decir en voz alta

Cuando pases de la presentación a la parte práctica, esta es la frase que
conecta las dos mitades de la sesión:

> "Ahora van a construir exactamente eso. Primero un informe que sale de reglas
> que ustedes pueden leer. Después el mismo informe escrito por un modelo. Y al
> lado, una verificación que compara lo segundo contra lo primero y lo rechaza
> si inventó algo. No les estoy pidiendo que confíen en la herramienta: les voy
> a mostrar cómo se comprueba."

Corresponde al recorrido de los workflows `03` → `04` descrito en el
[README](../README.md).
