// ============================================================
// asyncHandler: envoltorio para controladores asíncronos.
// Atrapa cualquier rechazo de promesa y lo envía a next(error),
// canalizándolo directamente al manejadorErrores centralizado.
// Elimina la necesidad de bloques try/catch en controladores.
// ============================================================
function asyncHandler(controlador) {
  return (req, res, next) => {
    Promise.resolve(controlador(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
