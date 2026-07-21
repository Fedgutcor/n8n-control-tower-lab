# El día después: de la clase a la organización

> Para quien terminó la clase, tiene n8n corriendo y se hace la pregunta que
> el material nunca contesta: ¿y ahora qué?
>
> Este documento no enseña una herramienta nueva. Enseña a leer lo que ya
> construiste con los ojos de alguien que dirige una organización, no con los
> de alguien que acaba de aprobar un ejercicio.

---

## La verdad sobre lo que acabas de construir

Lo que tienes corriendo al cerrar la clase es esto, sin adornos: un programa
que vive en tu computador, arrancado con tu usuario, con credenciales que —si
seguiste [CONECTAR-GOOGLE.md](CONECTAR-GOOGLE.md) tal como está pensado para
el aula— son las tuyas o las de una hoja de demostración. Si apagas el
equipo, se detiene. Si lo desinstalas o pierdes la carpeta de datos, se
pierde. Nadie más en tu organización sabe que existe, salvo que se lo hayas
contado.

Eso no es un defecto del ejercicio. Es exactamente lo que un prototipo debe
ser: la forma más barata posible de comprobar que una idea funciona, antes de
comprometer un solo peso o una sola hora de otra persona en sostenerla.
[DIRIGIR-AL-AGENTE.md](DIRIGIR-AL-AGENTE.md) ya te enseñó a construir esto en
una sesión, dirigiendo a un agente sin escribir código. Lo que ese documento
no cubre —porque no es su trabajo— es qué hacer con el resultado una vez que
funciona.

Y que funcione ya es mucho. La mayoría de las automatizaciones que se
intentan en una organización nunca llegan a un prototipo que corre de
verdad: se quedan en una idea en una reunión, o en una propuesta que nadie
prueba. Tener algo ejecutándose, con datos reales de tu operación pasando por
una regla que escribiste tú, es una posición mejor de la que parte casi
cualquier iniciativa nueva. El problema no es haber llegado hasta aquí. El
problema es quedarse aquí, creyendo que ya está resuelto.

---

## Las tres preguntas que deciden si esto sobrevive

No son preguntas técnicas. Son las mismas que le harías a cualquier proceso
nuevo antes de dejar que dependa de él un equipo, no solo tú.

### ¿Quién es el dueño?

No quién lo construyó. Quién responde el día que deje de funcionar y alguien
lo note — o peor, el día que deje de funcionar y nadie lo note.

"El que lo hizo, en sus ratos libres" no es una respuesta: es una fecha de
caducidad con forma de persona. Esa persona va a cambiar de proyecto, de
prioridades, de trabajo. Cuando eso pase, la automatización no muere con un
aviso: simplemente deja de correr, y todo lo que dependía de ella queda
descubierto sin que nadie lo haya decidido.

Si no puedes nombrar a alguien —con su rol, no con su buena voluntad— que sea
responsable de que esto siga funcionando, todavía no tienes una
automatización de la organización. Tienes el proyecto personal de una
persona, que por ahora coincide con lo que la organización necesita.

### ¿Qué pasa si se detiene tres días y nadie lo nota?

Esta pregunta hace un trabajo doble: si la respuesta es "nada", puede que el
proceso que automatizaste no fuera tan crítico como para justificar la
infraestructura de un piloto — y eso está bien, es información valiosa, no
un fracaso. Un prototipo que demuestra que algo *no* hace falta automatizar
con más cuidado también cumplió su función.

Si la respuesta es "un desastre" —alguien deja de recibir una alerta, un
informe no llega y se toma una decisión sin él, un cliente queda sin
respuesta— entonces el proceso ya es crítico, y un computador personal que se
apaga cuando su dueño se va de vacaciones no es la infraestructura que ese
nivel de dependencia exige.

Hay una respuesta operativa parcial a esta pregunta, y vale la pena
conocerla antes de decidir que hace falta infraestructura nueva:
[`workflows/09-avisame-cuando-se-rompa.json`](../workflows/09-avisame-cuando-se-rompa.json)
conecta un `Error Trigger` a un aviso por Telegram, así que cuando un flujo
se ejecuta y falla, alguien se entera en minutos y no en semanas — el
hallazgo detrás, verificado contra el código de n8n, está en
[LO-QUE-CUESTA-DE-VERDAD.md](LO-QUE-CUESTA-DE-VERDAD.md#1-qué-es-gratis-de-verdad-y-hasta-dónde).
Es parcial a propósito: solo avisa cuando el flujo llega a ejecutarse y
falla. Si n8n estaba apagado y el flujo nunca corrió, no hay error que
disparar ni aviso que enviar — ese caso sigue siendo el que empuja hacia el
piloto o la producción de la siguiente sección.

### ¿Qué se rompe cuando la persona que lo montó no está?

Esta es la más incómoda de las tres, porque casi nunca se responde hasta que
ya es tarde. Revisa, con nombre y apellido, cada una de estas cosas:

- **Credenciales a su nombre.** Si la conexión a Google Sheets o Calendar
  quedó autorizada con la cuenta personal de quien construyó el flujo (el
  camino corto de [CONECTAR-GOOGLE.md](CONECTAR-GOOGLE.md), pensado para
  aprender en tres horas, no para sostener una operación), el día que esa
  persona cambie su contraseña, desactive su cuenta o se vaya, la
  automatización deja de tener acceso sin ningún aviso previo.
- **Cuentas personales usadas como si fueran de servicio.** Un correo
  personal conectado a un bot de Telegram, una API key generada con una
  cuenta gratuita a título individual: todo eso vive y muere con la persona
  que lo creó, no con la organización.
- **Conocimiento que no quedó escrito.** Por qué el semáforo usa esos
  umbrales y no otros, qué hace el flujo cuando llega un dato vacío, dónde
  vive la clave que cifra las credenciales — [DIRIGIR-AL-AGENTE.md](DIRIGIR-AL-AGENTE.md#parte-1--la-arquitectura-que-necesitas-entender)
  te enseñó a hacer estas preguntas cuando dirigías al agente; la misma
  disciplina aplica hacia adentro, con las personas de tu equipo. Si esas
  respuestas viven solo en la memoria de quien lo construyó, no existen para
  la organización.

---

## Los tres niveles de madurez

No hay un salto único de "clase" a "producción". Hay tres niveles, y cada uno
cuesta algo distinto. Saltarse uno no ahorra trabajo: lo pospone, con
intereses.

| Nivel | Dónde vive | Credenciales | Responsable | Costo | Riesgo si falla |
|---|---|---|---|---|---|
| **Prototipo** | Tu computador, se apaga con él | Personales o de demostración | Quien lo construyó, informalmente | Cero | Se pierde y no pasa nada grave — es donde termina la clase |
| **Piloto** | Una máquina que no se apaga (un servidor pequeño, un equipo dedicado en la oficina) | De servicio, no personales | Una persona designada, explícitamente | El de esa máquina, más el tiempo de configurarla una vez | Alguien lo nota y hay que reiniciarlo, pero no se pierde el historial |
| **Producción** | Infraestructura con respaldo y monitoreo | Administradas, con rotación y acceso auditado | Un equipo o área, con un proceso de guardia | El de sostener infraestructura real: respaldo, monitoreo, control de acceso | Requiere un plan de contingencia escrito, no improvisado |

**Prototipo** es donde termina la clase. Corre en tu máquina, con datos
propios o de ejemplo, y ya demostró lo que tenía que demostrar: que la idea
funciona y que vale la pena seguir con ella. No le pidas más de lo que es.

**Piloto** es el salto que da más valor por el esfuerzo que cuesta, y es el
que casi nadie da. No exige un equipo de sistemas ni un presupuesto de
infraestructura: exige una máquina que no dependa de que alguien se acuerde
de no apagarla —un servidor pequeño, o simplemente un equipo de la oficina
que quede encendido a propósito—, credenciales creadas para el servicio y no
para la persona, y alguien nombrado como responsable, aunque sea a tiempo
parcial. Ese último punto es management, no tecnología: es decidir, en voz
alta, que esto ya no es el experimento de una persona.

**Producción** es donde el sistema empieza a depender de terceros que no son
quien lo construyó: hace falta que alguien respalde los datos con
regularidad, que algo avise si el proceso se detiene sin que nadie tenga que
notarlo por accidente, que el acceso esté controlado y quede registrado quién
tocó qué, y que exista un plan escrito para cuando falle —porque va a
fallar—. Aquí es donde corresponde hablar con el área de sistemas, y donde
el esfuerzo deja de medirse en horas de una persona y empieza a medirse en
capacidad de una organización.

No hay una regla que diga cuánto tiempo dedicarle a cada salto: depende de lo
que la segunda pregunta de la sección anterior haya respondido. Lo que sí es
cierto es que el salto de prototipo a piloto es, casi siempre, más barato de
lo que parece, y el que produce el mayor cambio de riesgo.

---

## Los errores que se cometen la semana siguiente

Son concretos, y se repiten con el mismo patrón en cualquier grupo que sale
de una clase como esta con entusiasmo real.

**Conectar datos reales de clientes a un prototipo que sigue en un
portátil.** El camino corto de [CONECTAR-GOOGLE.md](CONECTAR-GOOGLE.md) —una
hoja con el enlace abierto a cualquiera que lo tenga— está pensado para datos
de demostración en un aula de tres horas, y lo dice explícitamente. Usarlo
con información real de clientes o de la operación, solo porque ya está
armado y funciona, cambia el problema por completo: ya no es un ejercicio de
aprendizaje, es un riesgo de seguridad de la información con la conveniencia
de un ejercicio de aprendizaje.

**Dejar credenciales personales en una automatización que ya usa el
equipo.** Es el error más silencioso de los cuatro, porque no rompe nada el
día que se comete. Rompe semanas o meses después, cuando la persona cambia su
contraseña por rutina, activa verificación en dos pasos, o simplemente deja
la organización — y el flujo que dependía de esas credenciales se detiene sin
ningún mensaje que apunte a la causa real.

**Automatizar un proceso que ya estaba roto.** Una automatización no arregla
un proceso deficiente: lo ejecuta más rápido y con más volumen. Si el criterio
para decidir que un proyecto está en riesgo ya era ambiguo entre las personas
antes de escribirlo como regla —tal como se discute en la Parte 1 de
[DIRIGIR-AL-AGENTE.md](DIRIGIR-AL-AGENTE.md#5-las-reglas--qué-convierte-datos-en-información)—,
automatizarlo no resuelve la ambigüedad: la reparte a más gente, más seguido,
con la apariencia de objetividad que le da venir de un sistema.

**Que nadie se entere de que se detuvo.** El éxito de una automatización es
silencioso: el informe llega, la alerta se dispara, nadie tiene que
preocuparse. Pero por esa misma razón, su fallo también es silencioso. Nadie
recibe una notificación de que dejó de recibir notificaciones. Si no existe
una forma explícita de detectar que el proceso se detuvo —alguien que lo
revise, o un sistema que avise— la ausencia de quejas no significa que
funcione. Puede significar, con la misma probabilidad, que lleva dos semanas
apagado.

---

## Cómo saber si valió la pena

No hace falta un tablero de métricas para responder esto. Bastan tres
preguntas simples, aplicadas con honestidad:

- **¿Cuántas veces se usó de verdad?** No cuántas veces corrió el flujo, sino
  cuántas veces alguien miró el resultado y lo usó para algo.
- **¿Cuánto tiempo devolvió?** Compáralo contra cómo se hacía antes: ¿cuánto
  tardaba juntar esos mismos datos a mano, y cuánto tarda ahora?
- **¿Qué decisión se tomó antes, o mejor, gracias a esto?** No una decisión
  hipotética — una real, que puedas nombrar con fecha.

La advertencia importa más que las preguntas: si no puedes nombrar una
decisión concreta que ocurrió antes o mejor por tener este sistema corriendo,
es probable que hayas construido algo entretenido y no algo útil. Un
prototipo que enseña y que demuestra una idea ya cumplió su función aunque
esa decisión todavía no exista — pero si después de semanas de uso sigue sin
existir, esa es la señal de que no vale la pena moverlo al siguiente nivel de
madurez, y está bien decirlo así de directo.

---

## La conversación con el área de sistemas

Muchos directivos montan esto por fuera de TI —es, de hecho, exactamente lo
que hace esta clase— y luego chocan con el área cuando quieren llevarlo más
lejos. El choque casi nunca es por la herramienta: es por el orden en que se
tuvo la conversación.

Llegar a esa reunión con un prototipo que ya funciona y una necesidad
demostrada con datos es una posición mucho más fuerte que llegar con una
idea en una diapositiva. Sistemas no tiene que imaginar el valor: puede
verlo correr. Eso cambia la conversación de "¿deberíamos construir esto?" a
"¿cómo lo sostenemos bien?", que es una conversación mucho más fácil de
ganar.

Pero llegar con algo que ya está conectado a datos reales de clientes o de la
operación, sin haber avisado antes, es la forma más rápida de que se prohíba
todo el enfoque —no solo ese flujo— antes de que nadie evalúe si la idea
tenía mérito. Desde el punto de vista de quien administra la seguridad de la
información, un sistema no autorizado ya tocando datos reales no es una
propuesta que evaluar: es un incidente que contener.

**Qué llevar a esa reunión:**

- El prototipo funcionando, con datos de demostración — no datos reales
  todavía.
- La respuesta a las tres preguntas de este documento: quién sería el dueño,
  qué pasa si se detiene, qué se rompe si esa persona no está.
- Una estimación honesta, sin inflar, de qué decisión mejoró o qué tiempo se
  ahorró en el ejercicio piloto.
- La pregunta explícita: "¿qué necesita este flujo, desde su punto de vista,
  para pasar a usar datos reales de forma segura?" — en vez de pedir permiso
  para lo que ya se hizo, se pide guía para lo que falta hacer.

Esa última diferencia es la que separa a alguien que colabora con sistemas de
alguien que sistemas tiene que frenar.

---

## El cierre honesto

Nada de este documento le quita valor a lo que construiste en clase. Al
contrario: la razón por la que estas preguntas importan es que el prototipo
funcionó. Si no hubiera funcionado, no habría nada que decidir sobre su
futuro.

Lo que separa a un ejercicio que se queda en tres días de entusiasmo de uno
que cambia cómo trabaja una organización no es la calidad del flujo que
construiste. Es si alguien —tú, probablemente— hace después la parte que no
es técnica: nombrar un dueño, mover la conexión a una máquina que no se
apaga, y tener la conversación con las personas correctas antes de que datos
reales entren en juego.

Esa parte tampoco se delega en un agente.
