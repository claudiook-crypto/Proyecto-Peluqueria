// ============================================================
// COMPONENTE PURO: Fila de Tabla de Ranking de Servicios
// Programación II · Cátedra Lic. Romina Laura Frandino
// Función pura: Recibe datos de un servicio -> Retorna <tr> HTML.
// ============================================================
import { formatearMoneda } from "../utils/formato.js";

/**
 * Retorna la etiqueta o badge de podio según la posición en el ranking.
 * @param {number} posicion - Posición 1-indexed.
 * @returns {string} HTML del badge de podio.
 */
function obtenerBadgePodio(posicion) {
    if (posicion === 1) return '<span class="badge-podio podio-1" title="Primer lugar">🥇 1</span>';
    if (posicion === 2) return '<span class="badge-podio podio-2" title="Segundo lugar">🥈 2</span>';
    if (posicion === 3) return '<span class="badge-podio podio-3" title="Tercer lugar">🥉 3</span>';
    return `<span class="badge-podio podio-resto">${posicion}</span>`;
}

/**
 * Renderiza una fila de la tabla de servicios más demandados.
 * @param {Object} servicio - Objeto de servicio proveniente de usp_ServiciosMasDemandados.
 * @param {number} index - Índice en el array (para calcular la posición).
 * @returns {string} Fila <tr> HTML.
 */
export function renderFilaServicio(servicio, index) {
    const posicion = index + 1;
    const nombre = servicio.Servicio || servicio.servicio || "Servicio sin nombre";
    const duracion = servicio.DuracionMin || servicio.duracionMin || 0;
    const cantidad = servicio.CantidadSolicitada || servicio.cantidadSolicitada || 0;
    const recaudacion = servicio.RecaudacionTotal !== undefined ? servicio.RecaudacionTotal : servicio.recaudacionTotal;

    return `
        <tr>
            <td style="text-align: center;">${obtenerBadgePodio(posicion)}</td>
            <td>
                <span class="nombre-item-tabla">${nombre}</span>
            </td>
            <td style="text-align: center;">
                <span class="duracion-badge-tabla">⏱ ${duracion} min</span>
            </td>
            <td style="text-align: right; font-weight: 700;">
                ${cantidad} ${cantidad === 1 ? "solicitud" : "solicitudes"}
            </td>
            <td style="text-align: right;" class="recaudacion-celda">
                ${formatearMoneda(recaudacion)}
            </td>
        </tr>
    `;
}
