// ============================================================
// CAPA DE CONTROLADORES - Módulo de Tablero y Gestión (Dueño: Claudio)
// Funciones envueltas en asyncHandler: CERO try/catch repetidos.
// Las excepciones SQL Server son derivadas al middleware centralizado.
// ============================================================
const tableroService = require("../services/tablero.service");

const ESTADOS_VALIDOS = ["Pendiente", "En Atención", "Completado", "Cancelado"];

/**
 * GET /api/tablero
 * Retorna todos los turnos para el tablero principal del negocio.
 */
async function obtenerTurnosTablero(req, res) {
  const turnos = await tableroService.listarTurnosTablero();
  res.json(turnos);
}

/**
 * GET /api/tablero/buscar
 * Filtra turnos por fecha, barbero/estilista y/o estado de manera combinable.
 * Query params opcionales: ?fecha=YYYY-MM-DD&idEmpleado=1&estado=Pendiente
 */
async function buscarTurnos(req, res) {
  const { fecha, idEmpleado, estado } = req.query;

  // Validación de idEmpleado si fue provisto
  if (idEmpleado !== undefined && idEmpleado !== "" && isNaN(Number(idEmpleado))) {
    return res.status(400).json({ mensaje: "El parámetro 'idEmpleado' debe ser numérico." });
  }

  // Validación de estado si fue provisto
  if (estado && !ESTADOS_VALIDOS.includes(estado.trim())) {
    return res.status(400).json({
      mensaje: `El estado '${estado}' es inválido. Valores permitidos: ${ESTADOS_VALIDOS.join(", ")}.`
    });
  }

  const turnos = await tableroService.buscarTurnos({
    fecha: fecha ? String(fecha).trim() : null,
    idEmpleado: idEmpleado ? Number(idEmpleado) : null,
    estado: estado ? String(estado).trim() : null
  });

  res.json(turnos);
}

/**
 * PATCH /api/tablero/:id/estado  (o PUT)
 * Aplica una transición en la máquina de estados del turno.
 * Body esperado: { "nuevoEstado": "En Atención" }
 */
async function cambiarEstadoTurno(req, res) {
  const { id } = req.params;
  const { nuevoEstado, estado } = req.body;

  const idTurno = Number(id);
  if (isNaN(idTurno) || idTurno <= 0) {
    return res.status(400).json({ mensaje: "El identificador del turno debe ser un número entero positivo." });
  }

  const proximoEstado = (nuevoEstado || estado || "").trim();
  if (!proximoEstado) {
    return res.status(400).json({ mensaje: "Debe indicar el nuevo estado del turno." });
  }

  if (!ESTADOS_VALIDOS.includes(proximoEstado)) {
    return res.status(400).json({
      mensaje: `Estado no permitido. Debe ser uno de: ${ESTADOS_VALIDOS.join(", ")}.`
    });
  }

  const resultado = await tableroService.cambiarEstadoTurno(idTurno, proximoEstado);

  res.json({
    mensaje: `Turno N° ${idTurno} actualizado con éxito a '${proximoEstado}'.`,
    idTurno: resultado.idTurno,
    nuevoEstado: resultado.nuevoEstado
  });
}

module.exports = {
  obtenerTurnosTablero,
  buscarTurnos,
  cambiarEstadoTurno
};
