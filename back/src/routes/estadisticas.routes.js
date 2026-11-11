// ============================================================
// CAPA DE RUTAS - Endpoints de Estadísticas y KPIs
// Dueño: Nahuel
// ============================================================
const { Router } = require("express");
const asyncHandler = require("../middlewares/asyncHandler");
const estadisticasController = require("../controllers/estadisticas.controller");

const router = Router();

// KPIs generales y ejecutivos del salón
router.get("/generales", asyncHandler(estadisticasController.obtenerGenerales));

// Ranking agregado de servicios más demandados
router.get("/servicios", asyncHandler(estadisticasController.obtenerServicios));

// Rendimiento y facturación por profesional
router.get("/empleados", asyncHandler(estadisticasController.obtenerEmpleados));

module.exports = router;
