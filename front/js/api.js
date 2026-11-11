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
