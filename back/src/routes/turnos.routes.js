// ============================================================
// CAPA DE RUTAS - Endpoints de Turnos, Servicios y Empleados
// ============================================================
const { Router } = require("express");
const asyncHandler = require("../middlewares/asyncHandler");
const turnosController = require("../controllers/turnos.controller");

const router = Router();

router.get("/servicios", asyncHandler(turnosController.obtenerServicios));
router.get("/empleados", asyncHandler(turnosController.obtenerEmpleados));
router.post("/", asyncHandler(turnosController.crearTurno));

module.exports = router;
