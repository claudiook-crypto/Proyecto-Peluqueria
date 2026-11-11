// ============================================================
// CAPA DE RUTAS - Endpoints del Tablero y Gestión de Turnos
// Dueño: Claudio
// ============================================================
const { Router } = require("express");
const asyncHandler = require("../middlewares/asyncHandler");
const tableroController = require("../controllers/tablero.controller");

const router = Router();

// Listado general del tablero
router.get("/", asyncHandler(tableroController.obtenerTurnosTablero));

// Búsqueda con filtros opcionales en el WHERE (fecha, empleado, estado)
router.get("/buscar", asyncHandler(tableroController.buscarTurnos));

// Cambio de estado con validación de máquina de estados (soporta PATCH y PUT)
router.patch("/:id/estado", asyncHandler(tableroController.cambiarEstadoTurno));
router.put("/:id/estado", asyncHandler(tableroController.cambiarEstadoTurno));

module.exports = router;
