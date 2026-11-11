// ============================================================
// CONTROLADOR DEL TABLERO DE GESTIÓN (Dueño: Claudio)
// Programación II · Cátedra Lic. Romina Laura Frandino
// Orquesta la carga de datos, el filtrado y el renderizado
// reactivo de turnos mediante componentes funcionales puros.
// ============================================================
import { obtenerTurnosTablero, buscarTurnosTablero, obtenerEmpleados } from "./api.js";
import { renderTarjetaTurno } from "./componentes/tarjetaTurno.js";

// Referencias a elementos del DOM
const contenedorTurnos = document.getElementById("contenedorTurnosTablero");
const formFiltros = document.getElementById("formFiltros");
const filtroFecha = document.getElementById("filtroFecha");
const filtroEmpleado = document.getElementById("filtroEmpleado");
const filtroEstado = document.getElementById("filtroEstado");
const btnLimpiarFiltros = document.getElementById("btnLimpiarFiltros");
const btnRefrescar = document.getElementById("btnRefrescar");
const contadorResultados = document.getElementById("contadorResultados");

// Métricas del encabezado
const metricaTotal = document.getElementById("metricaTotal");
const metricaPendientes = document.getElementById("metricaPendientes");
const metricaAtencion = document.getElementById("metricaAtencion");
const metricaCompletados = document.getElementById("metricaCompletados");

// Estado local reactivo en memoria
let turnosActuales = [];

/**
 * Calcula y actualiza en tiempo real los contadores de métricas en pantalla.
 * Regla de cátedra: Valores derivados calculados con métodos puros de array.
 * @param {Array} turnos - Colección de turnos actualmente visibles.
 */
function actualizarMetricas(turnos) {
    const total = turnos.length;
    const pendientes = turnos.filter((t) => (t.Estado || t.estado) === "Pendiente").length;
    const enAtencion = turnos.filter((t) => (t.Estado || t.estado) === "En Atención").length;
    const completados = turnos.filter((t) => (t.Estado || t.estado) === "Completado").length;

    metricaTotal.textContent = total;
    metricaPendientes.textContent = pendientes;
    metricaAtencion.textContent = enAtencion;
    metricaCompletados.textContent = completados;
}

/**
 * Renderiza la colección de turnos en la grilla del DOM.
 * @param {Array} turnos - Colección de turnos a renderizar.
 */
function renderizarTurnos(turnos) {
    if (!turnos || turnos.length === 0) {
        contenedorTurnos.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--color-texto-secundario);">
                <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">No se encontraron turnos con los filtros seleccionados.</p>
                <small>Probá cambiando la fecha, seleccionando otro profesional o limpiando los filtros.</small>
            </div>
        `;
        contadorResultados.textContent = "0 turnos encontrados";
        return;
    }

    contenedorTurnos.innerHTML = turnos.map(renderTarjetaTurno).join("");
    contadorResultados.textContent = `Mostrando ${turnos.length} turno${turnos.length === 1 ? "" : "s"}`;
}

/**
 * Carga el selector de profesionales consumiendo el catálogo del backend.
 */
async function cargarSelectProfesionales() {
    try {
        const empleados = await obtenerEmpleados();
        filtroEmpleado.innerHTML = '<option value="">Todos los profesionales</option>';

        empleados.forEach((emp) => {
            const id = emp.IdEmpleado || emp.idEmpleado;
            const nombre = emp.Nombre || emp.nombre;
            const apellido = emp.Apellido || emp.apellido;
            const opt = document.createElement("option");
            opt.value = id;
            opt.textContent = `${nombre} ${apellido}`;
            filtroEmpleado.appendChild(opt);
        });
    } catch (error) {
        console.error("Error al cargar profesionales en los filtros:", error);
    }
}

/**
 * Consulta la API aplicando los filtros vigentes y refresca el tablero reactivamente.
 */
async function consultarTurnos() {
    contenedorTurnos.innerHTML = '<p class="estado-vacio">Actualizando tablero...</p>';

    const fecha = filtroFecha.value;
    const idEmpleado = filtroEmpleado.value;
    const estado = filtroEstado.value;

    const hayFiltros = Boolean(fecha || idEmpleado || estado);

    try {
        const turnos = hayFiltros
            ? await buscarTurnosTablero({ fecha, idEmpleado, estado })
            : await obtenerTurnosTablero();

        turnosActuales = turnos;
        actualizarMetricas(turnos);
        renderizarTurnos(turnos);
    } catch (error) {
        console.error("Error al consultar turnos del tablero:", error);
        contenedorTurnos.innerHTML = `
            <div style="grid-column: 1 / -1; padding: 2rem; background-color: var(--color-error-fondo); color: var(--color-error-texto); border: 1px solid var(--color-error-borde); border-radius: var(--radio-borde); text-align: center;">
                <p><strong>Error al cargar los turnos del servidor</strong></p>
                <small>${error.message}</small>
            </div>
        `;
        contadorResultados.textContent = "Error de sincronización";
    }
}

/**
 * Inicialización de eventos y datos al cargar la página
 */
document.addEventListener("DOMContentLoaded", async () => {
    // 1. Cargar combo de estilistas
    await cargarSelectProfesionales();

    // 2. Consulta inicial de turnos
    await consultarTurnos();

    // 3. Suscripción a eventos de filtros combinables en tiempo real
    filtroFecha.addEventListener("change", consultarTurnos);
    filtroEmpleado.addEventListener("change", consultarTurnos);
    filtroEstado.addEventListener("change", consultarTurnos);

    // 4. Botón de limpieza de filtros
    btnLimpiarFiltros.addEventListener("click", () => {
        formFiltros.reset();
        consultarTurnos();
    });

    // 5. Botón de refresco manual
    btnRefrescar.addEventListener("click", () => {
        btnRefrescar.style.transform = "rotate(360deg)";
        consultarTurnos();
        setTimeout(() => {
            btnRefrescar.style.transform = "";
        }, 400);
    });
});
