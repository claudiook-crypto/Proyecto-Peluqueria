// ============================================================
// COMPONENTE PURO: Tarjeta de Turno del Tablero Operativo
// Programación II · Cátedra Lic. Romina Laura Frandino
// Función pura: Recibe datos -> Retorna HTML string.
// Cero manipulación directa de DOM dentro del componente.
// ============================================================
import { formatearMoneda, formatearFecha, formatearHora } from "../utils/formato.js";

/**
 * Retorna la clase CSS de acento y badge según el estado del turno.
 * @param {string} estado - Estado actual del turno.
 * @returns {{ claseBorde: string, claseBadge: string, icono: string }}
 */
function obtenerEstilosPorEstado(estado) {
    switch (estado) {
        case "Pendiente":
            return { claseBorde: "borde-pendiente", claseBadge: "badge-pendiente", icono: "⏳" };
        case "En Atención":
            return { claseBorde: "borde-atencion", claseBadge: "badge-atencion", icono: "✂" };
        case "Completado":
            return { claseBorde: "borde-completado", claseBadge: "badge-completado", icono: "✓" };
        case "Cancelado":
            return { claseBorde: "borde-cancelado", claseBadge: "badge-cancelado", icono: "✕" };
        default:
            return { claseBorde: "", claseBadge: "", icono: "•" };
    }
}

/**
 * Genera los botones de acción contextuales permitidos según la máquina de estados.
 * Transiciones válidas:
 *   - Pendiente -> 'En Atención' o 'Cancelado'
 *   - En Atención -> 'Completado' o 'Cancelado'
 *   - Completado / Cancelado -> Estados terminales (sin acciones)
 * @param {number} idTurno - Identificador del turno.
 * @param {string} estado - Estado actual del turno.
 * @returns {string} HTML de los botones de acción.
 */
function renderizarAcciones(idTurno, estado) {
    if (estado === "Pendiente") {
        return `
            <button type="button" class="btn-accion-tablero btn-iniciar" data-id="${idTurno}" data-nuevo-estado="En Atención" title="Pasar turno a En Atención">
                ▶ Iniciar Atención
            </button>
            <button type="button" class="btn-accion-tablero btn-cancelar-turno" data-id="${idTurno}" data-nuevo-estado="Cancelado" title="Cancelar este turno">
                ✕ Cancelar
            </button>
        `;
    }

    if (estado === "En Atención") {
        return `
            <button type="button" class="btn-accion-tablero btn-completar" data-id="${idTurno}" data-nuevo-estado="Completado" title="Marcar turno como Completado">
                ✓ Finalizar Turno
            </button>
            <button type="button" class="btn-accion-tablero btn-cancelar-turno" data-id="${idTurno}" data-nuevo-estado="Cancelado" title="Cancelar este turno">
                ✕ Cancelar
            </button>
        `;
    }

    return `
        <span style="font-size: 0.8rem; color: var(--color-texto-secundario); font-style: italic;">
            ${estado === "Completado" ? "Atención completada" : "Turno cancelado"}
        </span>
    `;
}

/**
 * Renderiza la tarjeta visual completa de un turno para el tablero.
 * @param {Object} turno - Objeto de turno proveniente del SP usp_ListarTurnosTablero o usp_BuscarTurnos.
 * @returns {string} Markup HTML de la tarjeta.
 */
export function renderTarjetaTurno(turno) {
    const id = turno.IdTurno || turno.idTurno;
    const fecha = turno.Fecha || turno.fecha;
    const hora = turno.HoraInicio || turno.horaInicio;
    const cliente = turno.Cliente || turno.cliente || "Cliente sin nombre";
    const telefono = turno.TelefonoCliente || turno.telefonoCliente;
    const servicios = turno.Servicios || turno.servicios || "Sin servicios asignados";
    const profesional = turno.Profesional || turno.profesional || "Sin estilista asignado";
    const total = turno.Total !== undefined ? turno.Total : turno.total;
    const estado = turno.Estado || turno.estado || "Pendiente";
    const observaciones = turno.Observaciones || turno.observaciones;

    const { claseBorde, claseBadge, icono } = obtenerEstilosPorEstado(estado);
    const accionesHtml = renderizarAcciones(id, estado);

    const telefonoHtml = telefono
        ? `<a href="tel:${telefono}" class="turno-cliente-tel" title="Llamar al cliente">📞 ${telefono}</a>`
        : `<span style="font-size: 0.8rem; color: var(--color-texto-secundario);">Sin teléfono registrado</span>`;

    const observacionesHtml = observaciones
        ? `<div class="turno-obs">💬 ${observaciones}</div>`
        : "";

    return `
        <article class="tarjeta-turno-tablero ${claseBorde}" data-id="${id}">
            <header class="turno-cabecera">
                <span class="turno-id">Turno #${id}</span>
                <span class="badge-estado ${claseBadge}">
                    <span>${icono}</span>
                    <span>${estado}</span>
                </span>
            </header>

            <div class="turno-horario">
                <span class="turno-hora">${formatearHora(hora)}</span>
                <span class="turno-fecha">${formatearFecha(fecha)}</span>
            </div>

            <div class="turno-cliente-bloque">
                <span class="turno-cliente-nombre">${cliente}</span>
                ${telefonoHtml}
            </div>

            <div class="turno-detalles">
                <div class="turno-servicios">
                    <strong>Servicios:</strong> ${servicios}
                </div>
                <div class="turno-profesional">
                    <span>Estilista:</span> ${profesional}
                </div>
                ${observacionesHtml}
            </div>

            <footer class="turno-pie">
                <div>
                    <span style="font-size: 0.75rem; color: var(--color-texto-secundario); display: block; text-transform: uppercase;">Total Turno</span>
                    <span class="turno-precio-total">${formatearMoneda(total)}</span>
                </div>
            </footer>

            <div class="turno-acciones">
                ${accionesHtml}
            </div>
        </article>
    `;
}
