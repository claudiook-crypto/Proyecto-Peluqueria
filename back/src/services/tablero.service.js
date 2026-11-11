// ============================================================
// CAPA DE SERVICIOS - Módulo de Tablero y Gestión (Dueño: Claudio)
// Comunicación con SQL Server mediante mssql tipado.
// Cero concatenación SQL (Regla estricta: parámetros .input tipados).
// ============================================================
const { sql, getConnection } = require("../config/db");

/**
 * Obtiene el listado completo de turnos para el tablero operativo.
 * Invoca el procedimiento almacenado usp_ListarTurnosTablero.
 * Realiza un JOIN de 5 tablas con concatenación de servicios (STRING_AGG).
 * @returns {Promise<Array>} Lista de turnos ordenados cronológicamente inverso.
 */
async function listarTurnosTablero() {
  const pool = await getConnection();
  const resultado = await pool.request().execute("usp_ListarTurnosTablero");
  return resultado.recordset;
}

/**
 * Busca y filtra turnos según criterios combinables opcionales en el WHERE.
 * Invoca el procedimiento almacenado usp_BuscarTurnos.
 * @param {Object} filtros - Parámetros de búsqueda opcionales.
 * @param {string|null} filtros.fecha - Fecha en formato 'YYYY-MM-DD'.
 * @param {number|null} filtros.idEmpleado - Identificador del profesional.
 * @param {string|null} filtros.estado - Estado del turno ('Pendiente', 'En Atención', 'Completado', 'Cancelado').
 * @returns {Promise<Array>} Lista de turnos coincidentes.
 */
async function buscarTurnos({ fecha, idEmpleado, estado }) {
  const pool = await getConnection();
  const request = pool.request();

  request.input("Fecha", sql.Date, fecha || null);
  request.input("IdEmpleado", sql.Int, idEmpleado ? Number(idEmpleado) : null);
  request.input("Estado", sql.NVarChar(30), estado ? String(estado).trim() : null);

  const resultado = await request.execute("usp_BuscarTurnos");
  return resultado.recordset;
}

/**
 * Actualiza el estado de un turno validando la máquina de estados en base de datos.
 * Invoca el procedimiento almacenado usp_CambiarEstadoTurno.
 * Lanza THROW 50025 si no existe, o THROW 50026 si la transición no está permitida.
 * @param {number} idTurno - ID del turno a actualizar.
 * @param {string} nuevoEstado - Nuevo estado a aplicar.
 * @returns {Promise<Object>} Resumen del turno actualizado.
 */
async function cambiarEstadoTurno(idTurno, nuevoEstado) {
  const pool = await getConnection();

  await pool.request()
    .input("IdTurno", sql.Int, Number(idTurno))
    .input("NuevoEstado", sql.NVarChar(30), String(nuevoEstado).trim())
    .execute("usp_CambiarEstadoTurno");

  return {
    idTurno: Number(idTurno),
    nuevoEstado: String(nuevoEstado).trim()
  };
}

module.exports = {
  listarTurnosTablero,
  buscarTurnos,
  cambiarEstadoTurno
};
