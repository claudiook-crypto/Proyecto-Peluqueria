// ============================================================
// CAPA DE CONTROLADORES - Sistema de Peluquería / Barbería
// Envuelta en asyncHandler: CERO try/catch repetidos.
// ============================================================
const turnosService = require("../services/turnos.service");

// GET /api/turnos/servicios
async function obtenerServicios(req, res) {
  const servicios = await turnosService.listarServicios();
  res.json(servicios);
}

// GET /api/turnos/empleados
async function obtenerEmpleados(req, res) {
  const empleados = await turnosService.listarEmpleados();
  res.json(empleados);
}

// POST /api/turnos
async function crearTurno(req, res) {
  const { cliente, telefono, fecha, horaInicio, servicios, detalle, idEmpleado, observaciones } = req.body;

  if (!cliente || typeof cliente !== "string" || cliente.trim() === "") {
    return res.status(400).json({ mensaje: "El nombre del cliente es obligatorio." });
  }

  if (!fecha) {
    return res.status(400).json({ mensaje: "Debe seleccionar una fecha para el turno." });
  }

  if (!horaInicio) {
    return res.status(400).json({ mensaje: "Debe seleccionar un horario de inicio." });
  }

  const items = detalle || servicios;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ mensaje: "Debe seleccionar al menos un servicio para reservar." });
  }

  // Normalizar items del detalle
  const detalleLimpio = items.map((item) => {
    const idServicio = typeof item === "number" ? item : (item.idServicio || item.IdServicio || item.id);
    const idEmp = item.idEmpleado || item.IdEmpleado || idEmpleado || null;
    return {
      idServicio: Number(idServicio),
      idEmpleado: idEmp ? Number(idEmp) : null
    };
  });

  const { idTurno, total } = await turnosService.crearTurno({
    cliente: cliente.trim(),
    telefono: telefono ? String(telefono).trim() : null,
    fecha,
    horaInicio,
    detalle: detalleLimpio,
    observaciones: observaciones ? String(observaciones).trim() : null
  });

  res.status(201).json({
    idTurno,
    total,
    mensaje: `Turno N° ${idTurno} reservado con éxito.`
  });
}

module.exports = {
  obtenerServicios,
  obtenerEmpleados,
  crearTurno
};
