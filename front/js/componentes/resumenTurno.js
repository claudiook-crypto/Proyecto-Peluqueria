// ============================================================
// COMPONENTE PURO: Resumen en Vivo del Turno en Armado
// Programación II · Cátedra Lic. Romina Laura Frandino
// Función pura: Recibe lista de servicios seleccionados -> Retorna HTML.
// ============================================================
import { formatearMoneda } from "../utils/formato.js";

/**
 * Renderiza el resumen interactivo del turno que se está reservando.
 * Aplica derivadas reactivas (reduce) para calcular total y duración acumulada.
 * @param {Array} serviciosSeleccionados - Colección de servicios agregados.
 * @returns {string} Markup HTML del bloque de resumen.
 */
export function renderResumenTurno(serviciosSeleccionados = []) {
    if (!serviciosSeleccionados || serviciosSeleccionados.length === 0) {
        return `
            <div class="resumen-vacio">
                <p>Todavía no has seleccionado servicios del catálogo.</p>
                <small>Hacé clic en cualquier tarjeta para agregarla a tu turno.</small>
            </div>
        `;
    }

    // Regla de cátedra: Valores derivados calculados con reduce()
    const totalEstimado = serviciosSeleccionados.reduce((acumulado, s) => {
        const precio = Number(s.Precio !== undefined ? s.Precio : s.precio) || 0;
        return acumulado + precio;
    }, 0);

    const duracionTotal = serviciosSeleccionados.reduce((acumulado, s) => {
        const duracion = Number(s.DuracionMin || s.duracionMin) || 0;
        return acumulado + duracion;
    }, 0);

    const itemsHtml = serviciosSeleccionados.map((s) => {
        const id = s.IdServicio || s.idServicio || s.id;
        const nombre = s.Nombre || s.nombre;
        const precio = s.Precio !== undefined ? s.Precio : s.precio;

        return `
            <li class="resumen-item">
                <span>${nombre}</span>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <strong>${formatearMoneda(precio)}</strong>
                    <button type="button" class="resumen-item-quitar" data-quitar-id="${id}" title="Quitar este servicio" aria-label="Quitar ${nombre}">
                        ✕
                    </button>
                </div>
            </li>
        `;
    }).join("");

    return `
        <div>
            <ul class="resumen-lista">
                ${itemsHtml}
            </ul>

            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--color-texto-secundario); margin-bottom: 0.5rem;">
                <span>Servicios: <strong>${serviciosSeleccionados.length}</strong></span>
                <span>Duración estimada: <strong>⏱ ${duracionTotal} min</strong></span>
            </div>

            <div class="resumen-total-bloque">
                <span class="resumen-total-etiqueta">Total Estimado</span>
                <span class="resumen-total-monto">${formatearMoneda(totalEstimado)}</span>
            </div>
        </div>
    `;
}
