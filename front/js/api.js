// ============================================================
// MÓDULO api.js: Cliente HTTP Centralizado del Frontend
// Programación II · Cátedra Lic. Romina Laura Frandino
// Regla estricta: Único archivo con fetch a /api.
// Prohibido tener URLs sueltas en las páginas.
// ============================================================
const API_URL = "/api";

async function pedirJson(url, opciones = {}) {
    const respuesta = await fetch(url, opciones);
    const datos = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
        throw new Error(datos.mensaje || `Error ${respuesta.status}: Falló la comunicación con el servidor.`);
    }

    return datos;
}

// ------------------------------------------------------------
// 1. Métodos de Catálogo y Reservas (Dueño: Maxi)
// ------------------------------------------------------------

// Catálogo de servicios disponibles
export function obtenerServicios() {
    return pedirJson(`${API_URL}/turnos/servicios`);
}

// Listado de empleados / profesionales activos
export function obtenerEmpleados() {
    return pedirJson(`${API_URL}/turnos/empleados`);
}

// Creación de turno con transacción maestra y OPENJSON
export function guardarTurno(datosTurno) {
    return pedirJson(`${API_URL}/turnos`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(datosTurno)
    });
}

// ------------------------------------------------------------
// 2. Métodos del Tablero y Gestión (Dueño: Claudio)
// ------------------------------------------------------------

// Listado completo de turnos para el tablero operativo
export function obtenerTurnosTablero() {
    return pedirJson(`${API_URL}/tablero`);
}

// Búsqueda con filtros opcionales en el WHERE (fecha, barbero, estado)
export function buscarTurnosTablero(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.fecha) params.append("fecha", filtros.fecha);
    if (filtros.idEmpleado) params.append("idEmpleado", filtros.idEmpleado);
    if (filtros.estado) params.append("estado", filtros.estado);

    const queryString = params.toString();
    const url = queryString ? `${API_URL}/tablero/buscar?${queryString}` : `${API_URL}/tablero`;
    return pedirJson(url);
}

// Actualización de estado en la máquina de estados (PATCH)
export function actualizarEstadoTurno(idTurno, nuevoEstado) {
    return pedirJson(`${API_URL}/tablero/${idTurno}/estado`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ nuevoEstado })
    });
}

// ------------------------------------------------------------
// 3. Métodos de Estadísticas y Reportes (Dueño: Nahuel)
// ------------------------------------------------------------

// Resumen general de KPIs ejecutivos del salón
export function obtenerEstadisticasGenerales() {
    return pedirJson(`${API_URL}/estadisticas/generales`);
}

// Ranking de servicios más solicitados y recaudación
export function obtenerServiciosMasDemandados(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.fechaDesde) params.append("fechaDesde", filtros.fechaDesde);
    if (filtros.fechaHasta) params.append("fechaHasta", filtros.fechaHasta);

    const queryString = params.toString();
    const url = queryString ? `${API_URL}/estadisticas/servicios?${queryString}` : `${API_URL}/estadisticas/servicios`;
    return pedirJson(url);
}

// Reporte de rendimiento y facturación por profesional
export function obtenerRendimientoEmpleados(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.fechaDesde) params.append("fechaDesde", filtros.fechaDesde);
    if (filtros.fechaHasta) params.append("fechaHasta", filtros.fechaHasta);

    const queryString = params.toString();
    const url = queryString ? `${API_URL}/estadisticas/empleados?${queryString}` : `${API_URL}/estadisticas/empleados`;
    return pedirJson(url);
}
