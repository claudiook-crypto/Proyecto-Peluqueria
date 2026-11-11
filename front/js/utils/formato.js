// ============================================================
// MÓDULO FORMATO: Utilidades de formateo visual para la UI
// Programación II · Cátedra Lic. Romina Laura Frandino
// Funciones puras para fechas, horas y pesos argentinos.
// ============================================================

/**
 * Formatea un número como moneda en pesos argentinos (ARS).
 * Ejemplo: 12000 -> "$ 12.000,00"
 * @param {number|string} valor - Valor numérico a formatear.
 * @returns {string} Texto formateado en moneda local.
 */
export function formatearMoneda(valor) {
    const numero = Number(valor);
    if (isNaN(numero)) return "$ 0,00";

    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(numero);
}

/**
 * Formatea una fecha ISO o YYYY-MM-DD a formato legible en español.
 * Ejemplo: "2026-11-10" -> "10/11/2026"
 * @param {string|Date} fechaStr - Fecha recibida.
 * @returns {string} Fecha formateada en formato DD/MM/YYYY.
 */
export function formatearFecha(fechaStr) {
    if (!fechaStr) return "-";

    // Si viene en formato ISO o YYYY-MM-DD
    const fechaLimpia = String(fechaStr).substring(0, 10);
    const partes = fechaLimpia.split("-");
    if (partes.length === 3) {
        const [anio, mes, dia] = partes;
        return `${dia}/${mes}/${anio}`;
    }

    try {
        const d = new Date(fechaStr);
        return isNaN(d.getTime()) ? String(fechaStr) : d.toLocaleDateString("es-AR");
    } catch {
        return String(fechaStr);
    }
}

/**
 * Formatea una hora TIME de SQL Server (ej: "10:00:00" o "11:15:00.0000000") a "HH:mm hs".
 * Ejemplo: "10:00:00" -> "10:00 hs"
 * @param {string} horaStr - Cadena de hora.
 * @returns {string} Hora formateada en formato HH:mm hs.
 */
export function formatearHora(horaStr) {
    if (!horaStr) return "-";

    const partes = String(horaStr).split(":");
    if (partes.length >= 2) {
        return `${partes[0].padStart(2, "0")}:${partes[1].padStart(2, "0")} hs`;
    }

    return String(horaStr);
}
