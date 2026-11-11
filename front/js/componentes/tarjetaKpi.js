// ============================================================
// COMPONENTE PURO: Tarjeta de KPI Ejecutivo
// Programación II · Cátedra Lic. Romina Laura Frandino
// Función pura: Recibe datos -> Retorna HTML string.
// Cero acoplamiento al DOM.
// ============================================================

/**
 * Renderiza una tarjeta de indicador clave de rendimiento (KPI).
 * @param {Object} props - Propiedades del KPI.
 * @param {string} props.titulo - Nombre del indicador (ej: 'Facturación Real').
 * @param {string} props.valor - Valor principal formateado (ej: '$ 124.000,00').
 * @param {string} [props.subtexto] - Aclaración secundaria (ej: 'Turnos completados').
 * @param {string} [props.variante] - Clase CSS de acento ('kpi-facturacion', 'kpi-ticket', etc.).
 * @returns {string} Markup HTML de la tarjeta de KPI.
 */
export function renderTarjetaKpi({ titulo, valor, subtexto = "", variante = "kpi-facturacion" }) {
    return `
        <article class="tarjeta-kpi-estadistica ${variante}">
            <span class="kpi-titulo">${titulo}</span>
            <span class="kpi-valor-grande">${valor}</span>
            ${subtexto ? `<span class="kpi-subtexto">${subtexto}</span>` : ""}
        </article>
    `;
}
