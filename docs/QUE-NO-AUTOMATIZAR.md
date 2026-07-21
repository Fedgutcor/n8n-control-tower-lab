# Qué NO automatizar

> Todo el material de esta clase empuja en una sola dirección: fuentes,
> contrato, reglas, informe, agenda. Falta el criterio inverso, que es el que
> distingue a quien dirige con juicio de quien solo aprendió a construir. Un
> curso que enseña únicamente a automatizar produce personas capaces de
> automatizar lo que no debía automatizarse — y lo hacen bien, con nodos
> prolijos y todo.

## La pregunta previa

Antes de "¿cómo lo automatizo?" va otra pregunta, y se salta casi siempre:
**¿este proceso merece existir?**

Automatizar un proceso inútil no lo elimina. Lo fija. Un proceso manual malo
se abandona el día que alguien se cansa de hacerlo o cambia de trabajo.
Automatizado, sobrevive: alguien lo mantiene, alguien depende de su salida
aunque nadie recuerde por qué se pidió, y quitarlo ahora exige explicar por
qué se está apagando algo que "funciona". Convertiste un mal hábito en
infraestructura.

Por eso el orden correcto es: primero preguntar si el proceso debería
existir tal como está, y solo si la respuesta es sí, preguntar cómo
automatizarlo.

## Las señales de que no conviene automatizar

### 1. El proceso cambia constantemente

Automatizar algo que cambia cada mes es construir para tirar. El flujo queda
listo, la regla de negocio cambia dos semanas después, y alguien tiene que
volver a abrir el editor de n8n para un ajuste que en papel se resolvía
cambiando una frase en un correo.

*Ejemplo reconocible:* una política de aprobación de gastos que se ajusta
cada trimestre según el presupuesto disponible. Si la regla de "quién aprueba
qué monto" lleva tres versiones en el último año, automatizarla hoy significa
mantenerla, no resolverla.

### 2. Ocurre muy pocas veces al año

El costo de construir y mantener algo casi siempre supera lo que ahorra
cuando el proceso es raro. Un criterio práctico para no adivinar: sumar horas
de construcción más horas de mantenimiento anual multiplicadas por los años
que va a estar en uso, y compararlo contra las horas manuales que de verdad
ahorra cada ejecución multiplicadas por cuántas veces ocurre al año.

*Ejemplo reconocible:* el cierre de fin de año fiscal, o la asignación anual
de bonos. Si tardan 20 horas de construcción y 2 horas de mantenimiento cada
año, y el proceso manual toma 2 horas, cuatro veces al año, hacen falta más
de tres años para que la automatización empate el tiempo que ahorra — y para
entonces la regla ya cambió (ver señal 1).

### 3. La decisión requiere contexto que no está en ningún dato

Si el juicio depende de saber que el cliente está molesto, que el equipo está
agotado o que hay una negociación en curso, ningún dato lo captura, porque
ese contexto no vive en ningún sistema: vive en la memoria de la persona que
atendió la última llamada.

*Ejemplo reconocible:* decidir si una queja se escala directo a gerencia. El
CRM tiene el monto del contrato y el historial de tickets. No tiene que ese
cliente ya amenazó con irse la semana pasada en una llamada que nadie
registró como "queja". Una regla que solo mira el CRM va a fallar
exactamente en el caso que más importaba.

### 4. El proceso está roto

Este es el punto más importante de todos. Automatizar un proceso roto no lo
arregla: lo rompe más rápido y con más volumen.

*Ejemplo reconocible:* aprobar solicitudes de compra que hoy tardan tres
semanas porque van y vuelven por correo con información incompleta.
Automatizar ese circuito tal como está no reduce las tres semanas: hace que
lleguen más solicitudes mal hechas, más rápido, a la misma persona que ya las
revisaba a mano — con menos tiempo entre cada una para pensar. Primero se
arregla qué información hace falta y quién aprueba qué. Recién después se
automatiza el proceso ya arreglado.

### 5. Nadie es dueño del resultado

Si nadie responde por el proceso hoy, automatizarlo no crea un responsable:
crea un sistema huérfano.

*Ejemplo reconocible:* el reporte semanal que "todos reciben" pero nadie usa
para decidir nada concreto. Automatizado, deja de ser una tarea molesta y se
convierte en un job programado que corre solo, sin que nadie lo mire, hasta
que un día falla y nadie se entera — porque en la mayoría de las
herramientas, incluida n8n, una ejecución fallida se detiene en silencio y
no avisa a nadie salvo que alguien haya configurado explícitamente ese
aviso. El detalle de por qué eso pasa está en
[LO-QUE-CUESTA-DE-VERDAD.md](LO-QUE-CUESTA-DE-VERDAD.md).

### 6. El costo del error es alto y no hay forma de revisar

Cuando equivocarse es caro y la revisión humana no es viable —por volumen, por
velocidad requerida, o porque nadie tiene ese tiempo asignado— la
automatización agrega riesgo, no eficiencia.

*Ejemplo reconocible:* enviar automáticamente una cotización o una
comunicación legal a un cliente sin que nadie la revise antes de salir. Si el
error cuesta un contrato y no hay quien la revise a tiempo, cada ejecución es
una apuesta, no una mejora.

## Lo que sí conviene automatizar

Como contraste, y para no dejar la sensación de que nada merece
automatizarse: tareas repetitivas, con reglas estables, sobre datos que ya
existen en algún sistema, donde el error es detectable y reversible, y donde
alguien sigue respondiendo por el resultado después de automatizarlo. Cuantas
más de esas condiciones cumple un proceso, mejor candidato es.

## El punto medio que casi nadie considera

Entre "automatizar todo el proceso, decisión incluida" y "no tocar nada" hay
una tercera opción que rara vez se plantea: **automatizar la preparación de
una decisión sin automatizar la decisión misma.**

Reunir la evidencia, ordenarla y presentarla a tiempo — sin decidir por
nadie. Es exactamente lo que hace la torre de control de esta clase: el
workflow `05` lee la hoja real y calcula un semáforo con una regla que
cualquiera puede leer y discutir; el workflow `03` arma el informe con esa
evidencia ya ordenada; y en ningún punto de la cadena algo sale al mundo sin
pasar por una compuerta humana. La automatización hace el trabajo pesado de
juntar y ordenar. La persona sigue decidiendo qué proyecto está realmente en
riesgo y qué se hace al respecto — ver la pieza 6, "la compuerta", en
[DIRIGIR-AL-AGENTE.md](DIRIGIR-AL-AGENTE.md).

Este punto medio resuelve buena parte de las señales de arriba sin
resignarse a no automatizar nada: si el contexto que falta en los datos es
demasiado importante para confiar la decisión a una regla, se automatiza
igual la parte que sí se puede — juntar y ordenar la evidencia — y se deja la
decisión donde siempre debió estar.

## Lista de verificación antes de encargar una automatización

1. ¿Este proceso debería existir tal como está hoy, o sobrevive porque nadie
   lo cuestionó?
2. ¿Cuántas veces ocurre al año, y las horas que ahorra cada ejecución
   compensan lo que cuesta construirlo y mantenerlo?
3. ¿La regla cambió en los últimos doce meses? ¿Es probable que cambie en los
   próximos doce?
4. ¿La decisión depende de algo que hoy no está escrito en ningún sistema?
5. ¿El proceso funciona bien tal como está, hecho a mano, o está roto?
6. ¿Quién responde por el resultado hoy, con nombre y apellido — y va a seguir
   respondiendo después de automatizarlo?
7. ¿Qué pasa si se equivoca? ¿Hay alguien con tiempo real de revisarlo antes
   de que la salida llegue a alguien más?
8. ¿Estoy a punto de automatizar la decisión, o puedo automatizar solo la
   preparación de la evidencia y dejar la decisión donde está?

Si la respuesta a la mayoría de estas preguntas es incómoda, la señal no es
"hay que automatizar mejor". Es que todavía no es el momento de automatizar
esto.
