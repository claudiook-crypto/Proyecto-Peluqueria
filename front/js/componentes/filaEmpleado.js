// ============================================================
// COMPONENTE PURO: Fila de Tabla de Rendimiento por Profesional
// Programación II · Cátedra Lic. Romina Laura Frandino
// Función pura: Recibe datos de un profesional -> Retorna <tr> HTML.
// ============================================================
import { formatearMoneda } from "../utils/formato.js";

/**
 * Renderiza una fila de la tabla de rendimiento por profesional.
 * @param {Object} empleado - Objeto proveniente de usp_RendimientoEmpleados.
 * @returns {string} Fila <tr> HTML.
 */
export function renderFilaEmpleado(empleado) {
    const profesional = empleado.Profesional || empleado.profesional || "Profesional";
    const turnos = empleado.TurnosAtendidos !== undefined ? empleado.TurnosAtendidos : (empleado.turnosAtendidos || 0);
    const servicios = empleado.ServiciosRealizados !== undefined ? empleado.ServiciosRealizados : (empleado.serviciosRealizados || 0);
    const promedio = empleado.PromedioPorServicio !== undefined ? empleado.PromedioPorServicio : (empleado.promedioPorServicio || 0);
    const total = empleado.TotalFacturado !== undefined ? empleado.TotalFacturado : (empleado.totalFacturado || 0);

    return `
        <tr>
            <td>
                <span class="nombre-item-tabla">✂ ${profesional}</span>
            </td>
            <td style="text-align: right; font-weight: 600;">
                ${turnos} ${turnos === 1 ? "turno" : "turnos"}
            </td>
            <td style="text-align: right;">
                ${servicios} ${servicios === 1 ? "servicio" : "servicios"}
            </td>
            <td style="text-align: right; color: var(--color-texto-secundario);">
                ${formatearMoneda(promedio)}
            </td>
            <td style="text-align: right;" class="recaudacion-celda">
                ${formatearMoneda(total)}
            </td>
        </tr>
    `;
}
