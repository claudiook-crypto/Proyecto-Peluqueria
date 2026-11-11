// ============================================================
// COMPONENTE PURO: Tarjeta de Servicio del Catálogo
// Programación II · Cátedra Lic. Romina Laura Frandino
// Función pura: Recibe datos -> Retorna HTML string.
// Cero manipulación directa de DOM dentro del componente.
// ============================================================
import { formatearMoneda } from "../utils/formato.js";

/**
 * Renderiza la tarjeta de un servicio del catálogo.
 * @param {Object} servicio - Objeto de servicio del catálogo.
 * @param {boolean} [seleccionada=false] - Indica si el servicio está en el turno.
 * @returns {string} Markup HTML de la tarjeta de servicio.
 */
export function renderTarjetaServicio(servicio, seleccionada = false) {
    const id = servicio.IdServicio || servicio.idServicio || servicio.id;
    const nombre = servicio.Nombre || servicio.nombre || "Servicio sin nombre";
    const descripcion = servicio.Descripcion || servicio.descripcion || "";
    const precio = servicio.Precio !== undefined ? servicio.Precio : servicio.precio;
    const duracion = servicio.DuracionMin || servicio.duracionMin || 0;

    const claseSeleccionada = seleccionada ? "seleccionada" : "";
    const textoCheck = seleccionada ? "✓" : "";

    return `
        <article class="tarjeta-servicio ${claseSeleccionada}" data-id="${id}" role="button" tabindex="0" aria-pressed="${seleccionada}">
            <div>
                <header class="tarjeta-servicio-cabecera">
                    <h3 class="tarjeta-servicio-titulo">${nombre}</h3>
                    <div class="tarjeta-servicio-check" aria-hidden="true">${textoCheck}</div>
                </header>
                <p class="tarjeta-servicio-descripcion">${descripcion}</p>
            </div>
            <footer class="tarjeta-servicio-pie">
                <span class="tarjeta-servicio-precio">${formatearMoneda(precio)}</span>
                <span class="tarjeta-servicio-duracion">⏱ ${duracion} min</span>
            </footer>
        </article>
    `;
}
