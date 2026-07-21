# Lo que cuesta de verdad

> El resto de este repositorio repite "gratis" y "sin tarjeta" muchas veces,
> y es cierto para esta clase. Pero un directivo que quiera proponer esto en
> su organización necesita el orden de magnitud real antes de decirle a
> alguien "esto no cuesta nada". Este documento verifica precios y términos en
> vez de repetir la frase. Cada cifra va fechada y con su fuente; lo que no se
> pudo verificar contra una fuente primaria queda dicho como tal.

## 1. Qué es gratis de verdad, y hasta dónde

**n8n self-hosted es gratuito bajo la Sustainable Use License**, verificado
contra el texto oficial de la licencia. Permite usar, modificar y redistribuir
el software para "fines de negocio internos" o uso personal/no comercial; lo
que prohíbe es venderlo como servicio a terceros aprovechando que su valor
viene sustancialmente de n8n (por ejemplo, alojarlo y cobrar acceso, o hacer
white-label). Uso interno de un equipo, autoalojarlo en tu propio servidor y
uso educativo caen dentro de lo permitido. [Texto oficial de la
licencia](https://docs.n8n.io/privacy-and-security/sustainable-use-license) —
verificado julio 2026. Si tu organización va a usar esto más allá de un taller,
que alguien de legal lea el texto completo antes de escalarlo; este resumen no
reemplaza esa lectura.

**Las cuotas gratuitas de los proveedores de modelo existen y tienen límite.**
Groq: 30 solicitudes por minuto y 14.400 por día en el nivel gratuito.
Cerebras: 1.000.000 de tokens por día, 30 solicitudes por minuto, con el
contexto limitado a 8.192 tokens en los modelos gratuitos. Ambas cifras están
verificadas y fechadas en
[PROVEEDORES-LLM.md](PROVEEDORES-LLM.md#parte-2--el-modelo-dentro-del-flujo).
Gemini es distinto: Google dejó de publicar una tabla única de límites por
modelo — varía por proyecto — así que no hay una cifra universal que citar
aquí; revisa tu propia consola en Google AI Studio antes de planificar sobre
un número.

**Qué pasa cuando la cuota se agota, en los tres casos, es lo mismo en la
forma:** la API devuelve un error HTTP 429. En Gemini el código específico es
`RESOURCE_EXHAUSTED`, documentado por Google como la respuesta cuando el
número de solicitudes supera la capacidad asignada. [Documentación de errores
de Google Cloud](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/provisioned-throughput/error-code-429)
— verificado julio 2026.

**Y qué hace n8n con ese error es la parte que de verdad importa, y casi nadie
la revisa antes de confiar en un flujo automático.** Por diseño, cuando un
nodo falla —incluido un nodo de modelo que recibe un 429— n8n **detiene la
ejecución en ese nodo y la marca como fallida**. Eso es todo lo que pasa por
defecto: **nadie se entera**, salvo que alguien haya configurado
explícitamente un workflow de error (un `Error Trigger` conectado a un envío
de correo o Slack) en la configuración de ese flujo. [Documentación oficial de
n8n sobre manejo de errores](https://docs.n8n.io/build/flow-logic/handle-errors-gracefully)
— verificado julio 2026: el aviso automático es una opción que se activa a
mano por workflow, no el comportamiento de fábrica. Un flujo que se agotó su
cuota un martes puede quedar
sin correr, en silencio, hasta que alguien note que el informe dejó de llegar
— y para entonces ya no se sabe desde cuándo.

## 2. Lo que se paga aunque el software sea gratis

Esta es la parte central del documento, porque es el costo que casi nadie
presupuesta cuando alguien dice "esto es gratis, lo armamos en un taller".

- **El tiempo de quien lo mantiene.** Cada cambio de regla, cada credencial
  que vence, cada proveedor que cambia su API consume horas de una persona
  con nombre. No es una tarea de una vez: se repite mientras el flujo esté
  vivo.
- **La máquina que tiene que estar encendida.** Un flujo que corre "cada
  lunes a las 7:00" —como el workflow `07` de este repositorio— necesita n8n
  corriendo en ese momento. Eso significa algo prendido las 24 horas, todos
  los días, no solo durante el horario de oficina.
- **El tiempo de quien lo arregla cuando se rompe**, que suele ser la misma
  persona que lo construyó, y que para entonces ya tiene asignado otro
  trabajo. Ese es un costo real de oportunidad, aunque no aparezca en ninguna
  factura.
- **El costo de que falle sin que nadie lo note.** Ya se vio en la sección 1:
  el comportamiento por defecto de n8n ante un error es silencioso. Ese
  silencio tiene un precio — una decisión que se tomó con datos de hace tres
  semanas porque el informe dejó de actualizarse y nadie lo revisó — y casi
  nunca se contabiliza porque no llega en una factura, llega como una mala
  decisión de la que nadie conoce la causa.

## 3. Órdenes de magnitud, no cotizaciones

Cifras fechadas, con fuente, para dar una escala — no para copiar en una
propuesta sin volver a verificarlas.

**Una máquina pequeña siempre encendida.** Un servidor en la nube modesto
(2 vCPU, 4 GB de RAM, suficiente para n8n con carga de un equipo chico)
ronda **4 a 5 dólares al mes** en proveedores económicos como Hetzner (plan
CX22). Esta cifra viene de agregadores de precios de terceros, no de la
página oficial de Hetzner directamente — no logramos verificarla contra el
número exacto publicado en hetzner.com/cloud, que carga los precios por
JavaScript. Tómala como orden de magnitud, no como cotización cerrada, y
confírmala en la página del proveedor antes de presupuestar. [Referencia
verificada julio 2026](https://vpsfor.dev/posts/hetzner-cx22-pricing-2026/).
La alternativa de usar una computadora que ya existe en la oficina cambia el
costo de "alquiler mensual" por "consumo eléctrico de un equipo prendido todo
el día" — un número que depende demasiado del equipo y de la tarifa local
como para dar una cifra única aquí; mídelo con lo que ya tengas antes de
decidir.

**El paso a una versión gestionada de n8n en la nube (n8n Cloud).** El plan
Starter cuesta **20 € al mes con facturación anual, con 2.500 ejecuciones de
workflow incluidas**; el plan Pro cuesta **50 € al mes con facturación anual,
con 10.000 ejecuciones**. Ambos incluyen usuarios y workflows ilimitados; lo
que se paga es volumen de ejecuciones. [Página oficial de precios de
n8n](https://n8n.io/pricing/) — verificado julio 2026. La ventaja frente a
la máquina propia no es el precio: es que alguien más responde por que la
máquina esté encendida y actualizada. Eso es exactamente el ítem "tiempo de
quien lo mantiene" de la sección 2, comprado en vez de asumido.

**El consumo de un modelo de lenguaje si se pasa de la cuota gratuita.**
Gemini 2.5 Flash en tarifa de pago: **0,30 USD por millón de tokens de
entrada, 2,50 USD por millón de tokens de salida**. [Página oficial de
precios de Gemini](https://ai.google.dev/gemini-api/docs/pricing) —
verificado julio 2026; Google ya anunció el retiro de este modelo específico
para octubre de 2026, así que confirma el modelo vigente antes de
presupuestar sobre este número. Groq con Llama 3.3 70B en tarifa de pago:
**0,59 USD por millón de tokens de entrada, 0,79 USD por millón de salida**.
[Página oficial de precios de Groq](https://groq.com/pricing) — verificado
julio 2026.

Para dar escala real y no solo el precio por millón: el informe ejecutivo del
workflow `04` produce del orden de 1.000 a 2.000 tokens de salida por
ejecución. Corriendo una vez por semana —como el workflow `07`— eso son
unos 100.000 tokens de salida al año. Con Gemini, a 2,50 USD el millón, el
costo anual de ese informe es del orden de **25 centavos de dólar al año**.
La cuota gratuita, en este uso, ni siquiera se roza. El consumo de un modelo
solo se vuelve un costo que hay que vigilar cuando el volumen de ejecuciones
sube en órdenes de magnitud — no en un informe semanal, sino en un flujo que
corre por cada evento, cada minuto, o sobre miles de registros por corrida.

## 4. Cuándo el modelo de lenguaje se vuelve el costo principal

La respuesta corta: cuando se usa el modelo para trabajo que no necesitaba
un modelo.

La parte determinista de un flujo —contar bloqueos, ordenar por fecha,
decidir un semáforo con una regla de umbrales— no cuesta nada por ejecución,
corra una vez o diez mil veces: es aritmética, no una llamada a una API de
pago. Es exactamente lo que hace el workflow `03` de este repositorio: arma
el informe completo, con semáforo y agenda, sin tocar un modelo de lenguaje.
Solo cuesta la redacción final, y solo si se decide agregarla — eso es lo que
hace el workflow `04`, que extiende al `03` con un nodo de modelo únicamente
para convertir el snapshot ya calculado en lenguaje ejecutivo.

Un flujo que usa el modelo para todo —para decidir el semáforo, para
priorizar, para redactar, para clasificar cada registro que entra— multiplica
por cada una de esas llamadas el costo, la latencia y una fuente nueva de
fallo (una alucinación, una cuota agotada, una respuesta con formato
inesperado) en cada ejecución. Un flujo que reserva el modelo solo para la
redacción final paga una fracción de ese costo y falla en muchos menos
puntos. La comparación entre `03` y `04` es, en plata, la misma lección que
el resto de la clase enseña como arquitectura: primero determinismo, después
IA, y solo donde de verdad hace falta lenguaje.

## 5. La pregunta de decisión final

Comparar el costo contra lo que ahorra sin caer en un cálculo de servilleta
que nadie se cree exige contar las dos partes completas, no solo la mitad
fácil de medir:

**Costo anual real** = horas de mantenimiento al año × costo por hora de esa
persona, más la máquina o el servicio gestionado, más el consumo de modelo si
aplica (con la sección 3 como orden de magnitud), más una estimación —aunque
sea aproximada— del costo de que falle sin que nadie lo note, multiplicado
por qué tan probable es que eso pase con el nivel de vigilancia que hoy tiene
el flujo.

**Ahorro anual real** = horas manuales que ya no se hacen a mano, por
ejecución, multiplicadas por cuántas veces ocurre al año, multiplicadas por el
costo por hora de quien las hacía antes.

Los números "duros" —la máquina, el modelo, la suscripción— casi siempre son
los más chicos de las dos columnas. Los que de verdad deciden si valió la
pena son los blandos: cuánto tiempo real le va a robar el mantenimiento a
alguien que ya tiene otro trabajo, y cuánto cuesta que falle sin aviso. Un
directivo que solo pide la cotización del servidor está viendo la parte más
barata del costo total. La pregunta que hay que poder responder antes de
aprobar esto no es "¿cuánto cuesta construirlo?". Es **"¿quién paga cuando se
rompe, y con qué?"** — y si esa respuesta no existe todavía, tampoco existe
el caso de negocio, por más gratis que sea el software.
