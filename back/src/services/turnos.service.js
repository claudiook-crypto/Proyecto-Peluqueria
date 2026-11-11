// ============================================================
// CAPA DE SERVICIOS - Sistema de Peluquería / Barbería
// Comunicación tipada con SQL Server mediante mssql.
// Cero concatenación de SQL (Regla estricta: .input tipados).
// ============================================================
const { sql, getConnection } = require("../config/db");

async function listarServicios() {
  const pool = await getConnection();
  const resultado = await pool.request().execute("usp_ListarServicios");
  return resultado.recordset;
}

async function listarEmpleados() {
  const pool = await getConnection();
  const resultado = await pool.request().execute("usp_ListarEmpleados");
  return resultado.recordset;
}

async function crearTurno({ cliente, telefono, fecha, horaInicio, detalle, observaciones }) {
  const pool = await getConnection();

  const resultado = await pool.request()
    .input("Cliente", sql.NVarChar(100), cliente)
    .input("Telefono", sql.NVarChar(20), telefono || null)
    .input("Fecha", sql.Date, fecha)
    .input("HoraInicio", sql.VarChar(10), horaInicio)
    .input("Detalle", sql.NVarChar(sql.MAX), JSON.stringify(detalle))
    .input("Observaciones", sql.NVarChar(255), observaciones || null)
    .output("IdTurno", sql.Int)
    .output("Total", sql.Decimal(12, 2))
    .execute("usp_CrearTurno");

  return {
    idTurno: resultado.output.IdTurno,
    total: resultado.output.Total
  };
}

module.exports = {
  listarServicios,
  listarEmpleados,
  crearTurno
};
