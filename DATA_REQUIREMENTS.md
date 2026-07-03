# Requisitos de datos reales

Objetivo: cada ficha de jugador debe poder defender sus datos con fuentes reales y fecha de revision.

## Jugadores

- Datos personales: nombre, fecha de nacimiento, nacionalidad, posicion, altura, pie dominante y club actual.
- Historico de fichajes: club origen, club destino, fecha, tipo de operacion, importe, cesion/opcion si aplica y fuente.
- Historico de valor de mercado: fecha, valor, fuente y moneda.
- Estadisticas por temporada: competicion, equipo, partidos, minutos, goles, asistencias, tarjetas y porterias a cero cuando aplique.

## Clubes y plantillas

- La plantilla actual debe derivarse del ultimo estado confirmado de cada jugador.
- Cada alta o baja debe estar enlazada a un movimiento en `transfers.json`.
- Los totales de plantilla, edad media y valor agregado deben recalcularse desde los jugadores, no escribirse a mano.

## Fuentes

- Cada noticia, rumor, traspaso o estadistica real debe incluir al menos una fuente en `sources.json`.
- Prioridad de fuentes: comunicado oficial, liga/federacion, proveedor estadistico reconocido, medio deportivo fiable.
- Si un dato es estimado, debe marcarse como estimacion y mostrar fecha de revision.

## Pendiente antes de produccion real

- Sustituir cualquier dato ilustrativo por datos verificados.
- Separar claramente confirmado, rumor y estimacion.
- Evitar copiar textos completos de medios: usar resumen propio y enlace.
- No subir claves API al repositorio.
