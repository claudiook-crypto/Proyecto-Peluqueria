// ============================================================
// CONTROLADOR PRINCIPAL - PORTAL DE RESERVAS (Dueño: Maxi)
// Programación II · Cátedra Lic. Romina Laura Frandino
// Reglas estrictas:
// 1. Estado mínimo en memoria: solo guarda ids en un Set (cero duplicación).
// 2. Valores derivados con filter() y reduce() a demanda.
// 3. Comunicación exclusiva mediante api.js (guardarTurno, obtenerServicios, obtenerEmpleados).
// 4. Manejo de respuestas HTTP 201 Created y 400 Bad Request.
// ============================================================
import { obtenerServicios, obtenerEmpleados, guardarTurno } from "./api.js";
import { renderTarjetaServicio } from "./componentes/tarjetaServicio.js";
import { renderResumenTurno } from "./componentes/resumenTurno.js";
import { formatearMoneda } from "./utils/formato.js";

// Referencias a elementos del DOM
const contenedorServicios = document.getElementById("contenedorServicios");
const contenedorResumen = document.getElementById("contenedorResumen");
const formTurno = document.getElementById("formTurno");
const inputCliente = document.getElementById("cliente");
const inputTelefono = document.getElementById("telefono");
const inputFecha = document.getElementById("fecha");
const inputHora = document.getElementById("horaInicio");
const selectEmpleado = document.getElementById("selectEmpleado");
const inputObservaciones = document.getElementById("observaciones");
const btnConfirmar = document.getElementById("btnConfirmar");
const mensajeFeedback = document.getElementById("mensajeFeedback");

// Estado mínimo de la aplicación (Clase 15)
let catalogoServicios = [];
const serviciosSeleccionadosIds = new Set();

/**
 * Deriva los objetos completos de servicios a partir de los IDs seleccionados.
 * @returns {Array} Colección de servicios seleccionados.
 */
function obtenerServiciosSeleccionados() {
    return catalogoServicios.filter((s) => {
        const id = s.IdServicio || s.idServicio || s.id;
        return serviciosSeleccionadosIds.has(id);
    });
}

/**
 * Muestra un mensaje de alerta accesible (éxito o error).
 * @param {string} texto - Contenido del mensaje.
 * @param {'exito'|'error'} tipo - Variante visual.
 */
function mostrarMensaje(texto, tipo = "exito") {
    mensajeFeedback.textContent = texto;
    mensajeFeedback.className = `mensaje-alerta ${tipo}`;
    mensajeFeedback.classList.remove("oculto");

    mensajeFeedback.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/**
 * Oculta el mensaje de alerta.
 */
function ocultarMensaje() {
    mensajeFeedback.className = "mensaje-alerta oculto";
    mensajeFeedback.textContent = "";
}

/**
 * Actualiza reactivamente la vista completa (catálogo y resumen lateral).
 */
function actualizarVista() {
    // 1. Renderizar tarjetas de servicios
    if (catalogoServicios.length === 0) {
        contenedorServicios.innerHTML = '<p class="estado-vacio">No hay servicios disponibles en el catálogo.</p>';
    } else {
        contenedorServicios.innerHTML = catalogoServicios
            .map((s) => {
                const id = s.IdServicio || s.idServicio || s.id;
                const estaSeleccionada = serviciosSeleccionadosIds.has(id);
                return renderTarjetaServicio(s, estaSeleccionada);
            })
            .join("");
    }

    // 2. Renderizar resumen en vivo
    const seleccionados = obtenerServiciosSeleccionados();
    contenedorResumen.innerHTML = renderResumenTurno(seleccionados);

    // 3. Habilitar o deshabilitar botón de confirmar según si hay servicios seleccionados
    const haySeleccionados = serviciosSeleccionadosIds.size > 0;
    btnConfirmar.disabled = !haySeleccionados;
    if (!haySeleccionados) {
        btnConfirmar.title = "Seleccioná al menos un servicio del catálogo para reservar";
    } else {
        btnConfirmar.title = "Confirmar reserva del turno";
    }
}

/**
 * Alterna la selección de un servicio al hacer clic sobre su tarjeta.
 * @param {number} idServicio - ID del servicio presionado.
 */
function alternarSeleccionServicio(idServicio) {
    ocultarMensaje();

    if (serviciosSeleccionadosIds.has(idServicio)) {
        serviciosSeleccionadosIds.delete(idServicio);
    } else {
        serviciosSeleccionadosIds.add(idServicio);
    }

    actualizarVista();
}

/**
 * Carga inicial del catálogo de servicios y del selector de empleados.
 */
async function inicializarPortal() {
    // Establecer fecha mínima en el selector: hoy
    const hoy = new Date().toISOString().split("T")[0];
    inputFecha.min = hoy;
    inputFecha.value = hoy;

    try {
        // Cargar servicios y empleados en paralelo
        const [servicios, empleados] = await Promise.all([
            obtenerServicios(),
            obtenerEmpleados()
        ]);

        catalogoServicios = servicios;

        // Poblar combo de estilistas
        selectEmpleado.innerHTML = '<option value="">-- Seleccionar profesional --</option>';
        empleados.forEach((emp) => {
            const id = emp.IdEmpleado || emp.idEmpleado;
            const nombre = emp.Nombre || emp.nombre;
            const apellido = emp.Apellido || emp.apellido;
            const opt = document.createElement("option");
            opt.value = id;
            opt.textContent = `${nombre} ${apellido}`;
            selectEmpleado.appendChild(opt);
        });

        actualizarVista();
    } catch (error) {
        console.error("Error al inicializar el portal de reservas:", error);
        contenedorServicios.innerHTML = `
            <div style="grid-column: 1 / -1; padding: 2rem; background-color: var(--color-error-fondo); color: var(--color-error-texto); border: 1px solid var(--color-error-borde); border-radius: var(--radio-borde); text-align: center;">
                <p><strong>Error al conectar con el servidor</strong></p>
                <small>${error.message}</small>
            </div>
        `;
    }
}

/**
 * Maneja el envío del formulario de reserva hacia la API.
 * @param {Event} e - Evento de submit.
 */
async function manejarConfirmarTurno(e) {
    e.preventDefault();
    ocultarMensaje();

    if (serviciosSeleccionadosIds.size === 0) {
        mostrarMensaje("Debe seleccionar al menos un servicio del catálogo para reservar.", "error");
        return;
    }

    const cliente = inputCliente.value.trim();
    const telefono = inputTelefono.value.trim();
    const fecha = inputFecha.value;
    const horaInicio = inputHora.value;
    const idEmpleado = selectEmpleado.value ? Number(selectEmpleado.value) : null;
    const observaciones = inputObservaciones.value.trim();

    if (!cliente) {
        mostrarMensaje("El nombre completo del cliente es obligatorio.", "error");
        inputCliente.focus();
        return;
    }

    if (!idEmpleado) {
        mostrarMensaje("Debe seleccionar un profesional preferido para su atención.", "error");
        selectEmpleado.focus();
        return;
    }

    // Armar detalle de servicios para OPENJSON
    const detalle = Array.from(serviciosSeleccionadosIds).map((idServicio) => ({
        idServicio,
        idEmpleado
    }));

    const payload = {
        cliente,
        telefono: telefono || null,
        fecha,
        horaInicio,
        idEmpleado,
        detalle,
        observaciones: observaciones || null
    };

    // Bloqueo de UI mientras viaja la transacción a SQL Server
    btnConfirmar.disabled = true;
    const textoOriginal = btnConfirmar.textContent;
    btnConfirmar.textContent = "Procesando reserva...";

    try {
        const respuesta = await guardarTurno(payload);

        // Feedback exitoso (HTTP 201)
        const totalCalculado = formatearMoneda(respuesta.total);
        mostrarMensaje(
            `🎉 ¡Turno N° ${respuesta.idTurno} confirmado exitosamente! Total calculado por el sistema: ${totalCalculado}. Te esperamos el ${fecha} a las ${horaInicio} hs.`,
            "exito"
        );

        // Limpiar formulario y estado de selección
        formTurno.reset();
        inputFecha.value = new Date().toISOString().split("T")[0];
        serviciosSeleccionadosIds.clear();
        actualizarVista();
    } catch (error) {
        console.error("Error al confirmar el turno:", error);
        mostrarMensaje(`⚠️ No se pudo registrar la reserva: ${error.message}`, "error");
    } finally {
        btnConfirmar.disabled = serviciosSeleccionadosIds.size === 0;
        btnConfirmar.textContent = textoOriginal;
    }
}

// ================= Suscripción de Eventos =================
document.addEventListener("DOMContentLoaded", () => {
    // 1. Carga inicial
    inicializarPortal();

    // 2. Delegación de eventos para selección en catálogo
    contenedorServicios.addEventListener("click", (e) => {
        const tarjeta = e.target.closest(".tarjeta-servicio");
        if (!tarjeta) return;
        const idServicio = Number(tarjeta.dataset.id);
        if (idServicio) {
            alternarSeleccionServicio(idServicio);
        }
    });

    // Accesibilidad teclado: Enter o Space en tarjeta
    contenedorServicios.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            const tarjeta = e.target.closest(".tarjeta-servicio");
            if (tarjeta) {
                e.preventDefault();
                const idServicio = Number(tarjeta.dataset.id);
                if (idServicio) alternarSeleccionServicio(idServicio);
            }
        }
    });

    // 3. Delegación de eventos para botón de quitar en resumen
    contenedorResumen.addEventListener("click", (e) => {
        const btnQuitar = e.target.closest(".resumen-item-quitar");
        if (!btnQuitar) return;
        const idQuitar = Number(btnQuitar.dataset.quitarId);
        if (idQuitar) {
            serviciosSeleccionadosIds.delete(idQuitar);
            actualizarVista();
        }
    });

    // 4. Envío del formulario
    formTurno.addEventListener("submit", manejarConfirmarTurno);
});
