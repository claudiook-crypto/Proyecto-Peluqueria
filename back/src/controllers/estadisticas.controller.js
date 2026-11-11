// ============================================================
// CAPA DE CONTROLADORES - Módulo de Estadísticas y KPIs (Dueño: Nahuel)
// Programación II · Cátedra Lic. Romina Laura Frandino
// Funciones envueltas en asyncHandler: CERO try/catch repetidos.
// ============================================================
const estadisticasService = require("../services/estadisticas.service");

// Expresión regular para validar formato YYYY-MM-DD
const REGEX_FECHA = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Valida un parámetro de fecha opcional.
 * @param {string} fecha - Cadena de fecha.
 * @param {string} nombreCampo - Nombre descriptivo para el mensaje de error.
 * @returns {string|null} Fecha normalizada o null si no fue provista.
 */
function validarFechaOpcional(fecha, nombreCampo) {
  if (!fecha || String(fecha).trim() === "") return null;

  const fechaLimpia = String(fecha).trim();
  if (!REGEX_FECHA.test(fechaLimpia)) {
    const error = new Error(`El parámetro '${nombreCampo}' debe tener un formato de fecha válido (YYYY-MM-DD).`);
    error.number = 50020; // 400 Bad Request en el middleware de cátedra
    throw error;
  }

  const d = new Date(fechaLimpia);
  if (isNaN(d.getTime())) {
    const error = new Error(`El valor indicado en '${nombreCampo}' no es una fecha real.`);
    error.number = 50020;
    throw error;
  }

  return fechaLimpia;
}

/**
 * GET /api/estadisticas/generales
 * Retorna los KPIs ejecutivos históricos del salón de peluquería.
 */
async function obtenerGenerales(req, res) {
  const estadisticas = await estadisticasService.obtenerEstadisticasGenerales();
  res.json(estadisticas);
}

/**
 * GET /api/estadisticas/servicios
 * Retorna el ranking de servicios más pedidos y su facturación.
 * Query params opcionales: ?fechaDesde=YYYY-MM-DD&fechaHasta=YYYY-MM-DD
 */
async function obtenerServicios(req, res) {
  const { fechaDesde, fechaHasta } = req.query;

  const desde = validarFechaOpcional(fechaDesde, "fechaDesde");
  const hasta = validarFechaOpcional(fechaHasta, "fechaHasta");

  if (desde && hasta && desde > hasta) {
    return res.status(400).json({
      mensaje: "La 'fechaDesde' no puede ser posterior a la 'fechaHasta'."
    });
  }

  const servicios = await estadisticasService.obtenerServiciosMasDemandados({
    fechaDesde: desde,
    fechaHasta: hasta
  });

  res.json(servicios);
}

/**
 * GET /api/estadisticas/empleados
 * Retorna el rendimiento, turnos y recaudación de cada profesional.
 * Query params opcionales: ?fechaDesde=YYYY-MM-DD&fechaHasta=YYYY-MM-DD
 */
async function obtenerEmpleados(req, res) {
  const { fechaDesde, fechaHasta } = req.query;

  const desde = validarFechaOpcional(fechaDesde, "fechaDesde");
  const hasta = validarFechaOpcional(fechaHasta, "fechaHasta");

  if (desde && hasta && desde > hasta) {
    return res.status(400).json({
      mensaje: "La 'fechaDesde' no puede ser posterior a la 'fechaHasta'."
    });
  }

  const empleados = await estadisticasService.obtenerRendimientoEmpleados({
    fechaDesde: desde,
    fechaHasta: hasta
  });

  res.json(empleados);
}

module.exports = {
  obtenerGenerales,
  obtenerServicios,
  obtenerEmpleados
};
