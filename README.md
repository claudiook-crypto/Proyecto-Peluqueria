# Sistema de Peluquería & Barbería · Trabajo Final Integrador

**Programación II · Ciclo 2026**  
Tecnicatura Superior en Desarrollo de Software · Instituto Superior Villa del Rosario  
Docente: Lic. Romina Laura Frandino  

---

## 👥 Integrantes del Equipo
* **Maximiliano Cuassolo** (`rama-maxi`): Módulo de Reservas y Catálogo del Cliente.
* **Claudio Crettini** (`rama-claudio`): Módulo de Tablero Operativo y Gestión de Turnos.
* **Nahuel Busto** (`rama-nahuel`): Módulo de Estadísticas y Analítica de Negocio.

---

## 🚀 Arquitectura del Proyecto

El sistema está desarrollado como un **servidor híbrido en Node.js con Express** que sirve tanto la **API REST** bajo `/api` como los **archivos estáticos del frontend** bajo el mismo puerto (`http://localhost:3000`).

* **Base de datos:** SQL Server Express (`localhost\SQLEXPRESS`), base `PeluqueriaDB`.
* **Backend:** Arquitectura en capas estricta (`Rutas` -> `Controladores` -> `Servicios` -> `Base de Datos`) con CERO concatenación SQL (parámetros tipados con `mssql`), CERO `try/catch` manuales en controladores (envueltos en `asyncHandler`) y middleware centralizado de errores con código HTTP derivado.
* **Frontend:** JavaScript Vanilla (ES6+), componentes funcionales puros, cliente HTTP centralizado en `api.js` y estilos CSS modulares sin frameworks externos.

---

## 💇 Módulo de Catálogo y Reservas (Maximiliano Cuassolo)

El módulo de Maxi resuelve el **portal de atención al cliente y alta de turnos**, aplicando la regla de oro de la cátedra: el total lo calcula siempre la base de datos con `SUM()`.

### 1. Procedimientos Almacenados (`script.sql` - Sección 4)
* `dbo.usp_ListarServicios`: Lista el catálogo completo de cortes, peinados y tratamientos capilares ordenados por nombre.
* `dbo.usp_ListarEmpleados`: Consulta estilistas y barberos activos para asignación.
* `dbo.usp_CrearTurno`: Transacción maestra con `BEGIN TRANSACTION`, apertura de carrito JSON con `OPENJSON`, validación de campos obligatorios (`THROW 50020`), carrito vacío o inexistente (`THROW 50022`), solapamiento de turno por profesional (`THROW 50024`), cálculo de total con `SUM(S.Precio)` y retorno mediante 2 parámetros `OUTPUT` (`@IdTurno` y `@Total`).

### 2. Endpoints de la API REST (`/api/turnos`)
| Método | Endpoint | Descripción | Códigos HTTP |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/turnos/servicios` | Catálogo de servicios disponibles con precio y duración | `200`, `500` |
| `GET` | `/api/turnos/empleados` | Profesionales activos para atención | `200`, `500` |
| `POST` | `/api/turnos` | Alta transaccional de turno con detalle JSON | `201`, `400`, `500` |

### 3. Frontend de Reservas (`front/index.html`)
* **Catálogo interactivo:** Componente funcional puro `tarjetaServicio.js` con selección/deselección de servicios.
* **Resumen en vivo:** Componente puro `resumenTurno.js` con cálculo reactivo de total estimado y duración con `reduce()`.
* **Estado mínimo en memoria:** Gestión limpia mediante `Set` de identificadores sin duplicar datos del catálogo.
* **Confirmación transaccional:** Conexión con `POST /api/turnos` y feedback inmediato del total liquidado por la base de datos.

---

## 📋 Módulo de Tablero y Gestión (Claudio Crettini)

El módulo de Claudio resuelve la **operación diaria del salón de peluquería/barbería** mediante un tablero en vivo con métricas, filtros y actualización de turnos:

### 1. Procedimientos Almacenados (`script.sql` - Sección 5)
* `dbo.usp_ListarTurnosTablero`: JOIN de 5 tablas (`Turnos`, `Clientes`, `DetalleTurno`, `Servicios`, `Empleados`), con concatenación de servicios (`STRING_AGG`), cálculo del profesional asignado y orden cronológico inverso.
* `dbo.usp_BuscarTurnos`: Búsqueda flexible con filtros opcionales en el `WHERE` (`@Fecha`, `@IdEmpleado`, `@Estado`) sin SQL dinámico.
* `dbo.usp_CambiarEstadoTurno`: Máquina de estados finitos que valida existencia (`THROW 50025` -> `404 Not Found`) y transiciones prohibidas (`THROW 50026` -> `400 Bad Request`).

### 2. Endpoints de la API REST (`/api/tablero`)
| Método | Endpoint | Descripción | Códigos HTTP |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/tablero` | Obtiene el listado completo de turnos para el tablero | `200`, `500` |
| `GET` | `/api/tablero/buscar` | Filtra turnos por `?fecha=...&idEmpleado=...&estado=...` | `200`, `400`, `500` |
| `PATCH` | `/api/tablero/:id/estado` | Aplica una transición en la máquina de estados | `200`, `400`, `404`, `500` |

### 3. Máquina de Estados de los Turnos
```text
               ┌──────────────────────┐
               │      Pendiente       │
               └──────────┬───────────┘
                          │
          ┌───────────────┴───────────────┐
          ▼                               ▼
┌──────────────────┐            ┌──────────────────┐
│   En Atención    │            │    Cancelado     │ (Estado Terminal)
└─────────┬────────┘            └──────────────────┘
          │                               ▲
          ├───────────────────────────────┘
          ▼
┌──────────────────┐
│    Completado    │ (Estado Terminal)
└──────────────────┘
```

### 4. Frontend del Tablero (`front/tablero.html`)
* **Métricas en tiempo real:** Conteo derivado reactivo de turnos totales, pendientes, en atención y completados.
* **Barra de filtros combinables:** Filtrado simultáneo por fecha, profesional y estado del turno sin recargar la página.
* **Tarjetas operativas:** Componente funcional puro `tarjetaTurno.js` con semáforo de colores por estado (`borde-pendiente`, `borde-atencion`, etc.) y botones contextuales (`Iniciar Atención`, `Finalizar Turno`, `Cancelar`).
* **Feedback interactivo:** Notificaciones flotantes tipo Toast ante éxitos o advertencias de negocio.

---

## 📊 Módulo de Estadísticas y Analítica (Nahuel Busto)

El módulo de Nahuel resuelve los **reportes gerenciales e indicadores clave del negocio (KPIs)** exigidos por la cátedra mediante consultas agregadas:

### 1. Procedimientos Almacenados (`script.sql` - Sección 6)
* `dbo.usp_ObtenerEstadisticasGenerales`: Resumen global de KPIs (facturación real de completados, ticket promedio, turnos por estado, clientes únicos y tasa de efectividad).
* `dbo.usp_ServiciosMasDemandados`: Consulta agregada con `GROUP BY` sobre servicios, cantidad solicitada (`COUNT`), recaudación total (`SUM`) y soporte de rango de fechas (`@FechaDesde`, `@FechaHasta`).
* `dbo.usp_RendimientoEmpleados`: Consulta agregada con `GROUP BY` sobre estilistas, con turnos atendidos, servicios realizados y recaudación total generada por cada profesional.

### 2. Endpoints de la API REST (`/api/estadisticas`)
| Método | Endpoint | Descripción | Códigos HTTP |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/estadisticas/generales` | Retorna los KPIs históricos y globales del salón | `200`, `500` |
| `GET` | `/api/estadisticas/servicios` | Ranking de servicios más pedidos con filtro de fechas | `200`, `400`, `500` |
| `GET` | `/api/estadisticas/empleados` | Reporte de rendimiento y facturación por profesional | `200`, `400`, `500` |

### 3. Frontend de Estadísticas (`front/estadisticas.html`)
* **Tarjetas de KPIs ejecutivos:** Componente puro `tarjetaKpi.js` para visualización de Facturación Real, Ticket Promedio, Tasa de Cumplimiento y Clientes Atendidos.
* **Tablas de consultas agregadas:** Componentes puros `filaServicio.js` y `filaEmpleado.js` con filas cebra, ranking con medallas de podio (🥇, 🥈, 🥉) e importes formateados en pesos argentinos.
* **Filtrado por rango de fechas:** Permite auditar la producción por semana o mes con validación de coherencia cronológica y refresco dinámico sin recargar la página.

---

## 🛠️ Instrucciones de Puesta en Marcha

1. **Base de Datos:**
   * Abrir SSMS y ejecutar de punta a punta [script.sql](file:///c:/Users/maxim/Desktop/Parcial%204/Proyecto-Peluqueria/script.sql) en `localhost\SQLEXPRESS`.
   * El script creará la base `PeluqueriaDB`, configurará el acceso con usuario `sa` y contraseña `esea`, creará las 6 tablas con sus FKs y cargará los datos de prueba.

2. **Backend & Frontend:**
   ```bash
   cd back
   npm install
   npm start
   ```
   * Acceder a la interfaz de reservas: `http://localhost:3000/index.html`
   * Acceder al tablero de gestión: `http://localhost:3000/tablero.html`
   * Acceder al panel de estadísticas: `http://localhost:3000/estadisticas.html`
