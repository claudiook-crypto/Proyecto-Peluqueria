// ============================================================
// CONTROLADOR DE ESTADÍSTICAS & REPORTES (Dueño: Nahuel)
// Programación II · Cátedra Lic. Romina Laura Frandino
// Orquesta la consulta de analítica agregada y el renderizado
// reactivo de tablas y KPIs mediante componentes funcionales puros.
// ============================================================
import {
    obtenerEstadisticasGenerales,
    obtenerServiciosMasDemandados,
    obtenerRendimientoEmpleados
} from "./api.js";
import { renderTarjetaKpi } from "./componentes/tarjetaKpi.js";
import { renderFilaServicio } from "./componentes/filaServicio.js";
import { renderFilaEmpleado } from "./componentes/filaEmpleado.js";
import { formatearMoneda } from "./utils/formato.js";

// Referencias a contenedores del DOM
const contenedorKpis = document.getElementById("contenedorKpis");
const cuerpoTablaServicios = document.getElementById("cuerpoTablaServicios");
const cuerpoTablaEmpleados = document.getElementById("cuerpoTablaEmpleados");
const subtextoPeriodo = document.getElementById("subtextoPeriodo");

/**
 * Carga y renderiza las tarjetas de KPIs ejecutivos globales.
 */
export async function cargarKpis() {
    contenedorKpis.innerHTML = '<p class="estado-vacio">Calculando métricas ejecutivas...</p>';

    try {
        const data = await obtenerEstadisticasGenerales();

        const facturacion = Number(data.FacturacionTotal || 0);
        const ticket = Number(data.TicketPromedio || 0);
        const tasa = Number(data.TasaEfectividad || 0);
        const completados = Number(data.TurnosCompletados || 0);
        const historicos = Number(data.TotalTurnosHistoricos || 0);
        const clientes = Number(data.ClientesAtendidos || 0);
        const enProceso = (Number(data.TurnosPendientes || 0) + Number(data.TurnosEnAtencion || 0));

        const kpis = [
            {
                titulo: "Facturación Real",
                valor: formatearMoneda(facturacion),
                subtexto: `${completados} turnos cobrados`,
                variante: "kpi-facturacion"
            },
            {
                titulo: "Ticket Promedio",
                valor: formatearMoneda(ticket),
                subtexto: "Promedio por turno completado",
                variante: "kpi-ticket"
            },
            {
                titulo: "Tasa de Efectividad",
                valor: `${tasa.toFixed(1)}%`,
                subtexto: `${completados} de ${historicos} turnos`,
                variante: "kpi-efectividad"
            },
            {
                titulo: "Clientes Únicos",
                valor: `${clientes}`,
                subtexto: "Atendidos en el salón",
                variante: "kpi-clientes"
            },
            {
                titulo: "En Circulación",
                valor: `${enProceso}`,
                subtexto: `${data.TurnosPendientes || 0} pend. / ${data.TurnosEnAtencion || 0} en curso`,
                variante: "kpi-turnos"
            }
        ];

        contenedorKpis.innerHTML = kpis.map(renderTarjetaKpi).join("");
    } catch (error) {
        console.error("Error al cargar KPIs:", error);
        contenedorKpis.innerHTML = `
            <div style="grid-column: 1 / -1; padding: 1.5rem; background-color: var(--color-error-fondo); color: var(--color-error-texto); border: 1px solid var(--color-error-borde); border-radius: var(--radio-borde); text-align: center;">
                <p><strong>Error al calcular indicadores ejecutivos</strong></p>
                <small>${error.message}</small>
            </div>
        `;
    }
}

/**
 * Consulta y renderiza el ranking de servicios más demandados.
 * @param {Object} [filtros={}] - Filtros opcionales { fechaDesde, fechaHasta }.
 */
export async function cargarRankingServicios(filtros = {}) {
    cuerpoTablaServicios.innerHTML = '<tr><td colspan="5" class="estado-vacio">Generando ranking de servicios...</td></tr>';

    try {
        const servicios = await obtenerServiciosMasDemandados(filtros);

        if (!servicios || servicios.length === 0) {
            cuerpoTablaServicios.innerHTML = '<tr><td colspan="5" class="estado-vacio">No se registraron solicitudes de servicios en el período seleccionado.</td></tr>';
            return;
        }

        cuerpoTablaServicios.innerHTML = servicios.map(renderFilaServicio).join("");
    } catch (error) {
        console.error("Error al cargar ranking de servicios:", error);
        cuerpoTablaServicios.innerHTML = `
            <tr>
                <td colspan="5" style="color: var(--color-error-texto); text-align: center; padding: 1.5rem;">
                    Error al cargar servicios: ${error.message}
                </td>
            </tr>
        `;
    }
}

/**
 * Consulta y renderiza el reporte de rendimiento y producción por profesional.
 * @param {Object} [filtros={}] - Filtros opcionales { fechaDesde, fechaHasta }.
 */
export async function cargarRendimientoEmpleados(filtros = {}) {
    cuerpoTablaEmpleados.innerHTML = '<tr><td colspan="5" class="estado-vacio">Calculando producción por estilista...</td></tr>';

    try {
        const empleados = await obtenerRendimientoEmpleados(filtros);

        if (!empleados || empleados.length === 0) {
            cuerpoTablaEmpleados.innerHTML = '<tr><td colspan="5" class="estado-vacio">No hay registros de producción de profesionales en el período seleccionado.</td></tr>';
            return;
        }

        cuerpoTablaEmpleados.innerHTML = empleados.map(renderFilaEmpleado).join("");
    } catch (error) {
        console.error("Error al cargar rendimiento por profesional:", error);
        cuerpoTablaEmpleados.innerHTML = `
            <tr>
                <td colspan="5" style="color: var(--color-error-texto); text-align: center; padding: 1.5rem;">
                    Error al cargar profesionales: ${error.message}
                </td>
            </tr>
        `;
    }
}

/**
 * Inicialización al cargar la página: Ejecuta las 3 consultas agregadas en paralelo.
 */
document.addEventListener("DOMContentLoaded", async () => {
    try {
        await Promise.all([
            cargarKpis(),
            cargarRankingServicios(),
            cargarRendimientoEmpleados()
        ]);
    } catch (error) {
        console.error("Error en la carga inicial de estadísticas:", error);
    }
});
