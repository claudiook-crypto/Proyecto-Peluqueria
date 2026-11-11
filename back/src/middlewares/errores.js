// ============================================================
// Middleware centralizado de errores (Clase 12).
// Cuatro parámetros obligatorios: (err, req, res, next).
// Traduce códigos de SQL Server propios a códigos de estado HTTP
// y registra detalles en logs/errores.log sin exponer datos internos.
// ============================================================
const fs = require("fs");
const path = require("path");

// Códigos de negocio que indican recurso inexistente -> HTTP 404
const NO_EXISTE = [50017, 50018, 50022, 50025];

const CARPETA_LOGS = path.join(__dirname, "../../logs");
const ARCHIVO_ERRORES = path.join(CARPETA_LOGS, "errores.log");

function registrarError(error, req) {
  const linea = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
    + ` -> ${error.number || "sin código"} | ${error.message}\n`;

  try {
    if (!fs.existsSync(CARPETA_LOGS)) {
      fs.mkdirSync(CARPETA_LOGS);
    }
    fs.appendFileSync(ARCHIVO_ERRORES, linea);
  } catch (errorDeLog) {
    console.error("No se pudo escribir el log de errores:", errorDeLog.message);
  }
}

function manejadorErrores(err, req, res, next) {
  registrarError(err, req);

  // 1) Recurso no encontrado (404)
  if (NO_EXISTE.includes(err.number)) {
    return res.status(404).json({ mensaje: err.message });
  }

  // 2) Errores de validación o negocio propios de la cátedra (400)
  if (err.number >= 50000) {
    return res.status(400).json({ mensaje: err.message });
  }

  // 3) Error inesperado (500)
  console.error("Error inesperado:", err);
  return res.status(500).json({ mensaje: "Error interno del servidor." });
}

function rutaNoEncontrada(req, res) {
  res.status(404).json({ mensaje: `No existe la ruta ${req.method} ${req.originalUrl}.` });
}

module.exports = { manejadorErrores, rutaNoEncontrada };
