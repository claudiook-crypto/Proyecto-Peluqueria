// ============================================================
// Servidor Principal - Sistema de Peluquería / Barbería
// Programación II - Ciclo 2026 - Parcial 4
//
// Servidor híbrido (Clase 14): sirve tanto la API REST en /api
// como los archivos estáticos del front en http://localhost:3000
// ============================================================
const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const logger = require("./middlewares/logger");
const { manejadorErrores, rutaNoEncontrada } = require("./middlewares/errores");

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

// Archivos estáticos del front (carpeta hermana)
app.use(express.static(path.join(__dirname, "../../front")));

// Rutas de la API (se incorporan en el próximo commit)
// const turnosRoutes = require("./routes/turnos.routes");
// app.use("/api/turnos", turnosRoutes);

app.use(rutaNoEncontrada);
app.use(manejadorErrores);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sistema de Peluquería activo en http://localhost:${PORT}`);
  console.log("(API y Frontend servidos bajo el mismo puerto)");
});
