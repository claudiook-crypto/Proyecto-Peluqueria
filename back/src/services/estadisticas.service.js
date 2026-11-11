// ============================================================
// CAPA DE SERVICIOS - Módulo de Estadísticas y KPIs (Dueño: Nahuel)
// Programación II · Cátedra Lic. Romina Laura Frandino
// Comunicación tipada con SQL Server mediante mssql.
// Cero concatenación de SQL (Regla estricta: parámetros .input tipados).
// ============================================================
const { sql, getConnection } = require("../config/db");

/**
 * Obtiene el resumen general de métricas ejecutivas del salón.
 * Invoca el procedimiento almacenado usp_ObtenerEstadisticasGenerales.
 * @returns {Promise<Object>} Fila con KPIs globales (facturación, clientes, ticket promedio, etc.).
 */
async function obtenerEstadisticasGenerales() {
  const pool = await getConnection();
  const resultado = await pool.request().execute("usp_ObtenerEstadisticasGenerales");
  return resultado.recordset[0] || {};
}

/**
 * Obtiene el ranking agregado de servicios por demanda y facturación.
 * Invoca el procedimiento almacenado usp_ServiciosMasDemandados.
 * @param {Object} filtros - Rango de fechas opcional.
 * @param {string|null} filtros.fechaDesde - Fecha inicial YYYY-MM-DD.
 * @param {string|null} filtros.fechaHasta - Fecha final YYYY-MM-DD.
 * @returns {Promise<Array>} Lista ordenada de servicios más demandados.
 */
async function obtenerServiciosMasDemandados({ fechaDesde, fechaHasta } = {}) {
  const pool = await getConnection();
  const request = pool.request();

  request.input("FechaDesde", sql.Date, fechaDesde || null);
  request.input("FechaHasta", sql.Date, fechaHasta || null);

  const resultado = await request.execute("usp_ServiciosMasDemandados");
  return resultado.recordset;
}

/**
 * Obtiene el reporte agregado de rendimiento y producción por estilista.
 * Invoca el procedimiento almacenado usp_RendimientoEmpleados.
 * @param {Object} filtros - Rango de fechas opcional.
 * @param {string|null} filtros.fechaDesde - Fecha inicial YYYY-MM-DD.
 * @param {string|null} filtros.fechaHasta - Fecha final YYYY-MM-DD.
 * @returns {Promise<Array>} Lista de profesionales con turnos, servicios y facturación.
 */
async function obtenerRendimientoEmpleados({ fechaDesde, fechaHasta } = {}) {
  const pool = await getConnection();
  const request = pool.request();

  request.input("FechaDesde", sql.Date, fechaDesde || null);
  request.input("FechaHasta", sql.Date, fechaHasta || null);

  const resultado = await request.execute("usp_RendimientoEmpleados");
  return resultado.recordset;
}

module.exports = {
  obtenerEstadisticasGenerales,
  obtenerServiciosMasDemandados,
  obtenerRendimientoEmpleados
};
