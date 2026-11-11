-- ============================================================
-- SCRIPT DE BASE DE DATOS: PeluqueriaDB
-- Sistema Integral de Peluquería / Barbería
-- Programación II - Ciclo 2026 - Parcial 4
-- ============================================================

/* ================================================== */
/* 1. BASE, USUARIO sa Y PERMISOS  (no tocar)         */
/* ================================================== */
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'PeluqueriaDB')
BEGIN
    CREATE DATABASE PeluqueriaDB;
END
GO

USE PeluqueriaDB;
GO

-- Configuración de usuario 'sa' con contraseña 'esea' (definido en .env)
BEGIN TRY
    ALTER LOGIN [sa] ENABLE;
    ALTER LOGIN [sa] WITH PASSWORD = N'esea', CHECK_EXPIRATION = OFF, CHECK_POLICY = OFF;
END TRY
BEGIN CATCH
    -- Si el entorno restringe alterar sa, continúa con la sesión actual
END CATCH;
GO

/* ================================================== */
/* 2. TABLAS Y FOREIGN KEYS  (cambios: avisar al grupo)*/
/* ================================================== */
-- Eliminación en orden estricto de dependencias (hijos primero)
IF OBJECT_ID('dbo.DetalleTurno', 'U') IS NOT NULL DROP TABLE dbo.DetalleTurno;
IF OBJECT_ID('dbo.Turnos', 'U') IS NOT NULL DROP TABLE dbo.Turnos;
IF OBJECT_ID('dbo.EmpleadoServicio', 'U') IS NOT NULL DROP TABLE dbo.EmpleadoServicio;
IF OBJECT_ID('dbo.Servicios', 'U') IS NOT NULL DROP TABLE dbo.Servicios;
IF OBJECT_ID('dbo.Empleados', 'U') IS NOT NULL DROP TABLE dbo.Empleados;
IF OBJECT_ID('dbo.Clientes', 'U') IS NOT NULL DROP TABLE dbo.Clientes;
GO

-- 2.1 Tabla Clientes
CREATE TABLE dbo.Clientes (
    IdCliente INT IDENTITY(1,1) NOT NULL,
    Nombre NVARCHAR(50) NOT NULL,
    Apellido NVARCHAR(50) NOT NULL,
    Telefono NVARCHAR(20) NULL,
    Email NVARCHAR(100) NULL,
    Observaciones NVARCHAR(255) NULL,
    CONSTRAINT PK_Clientes PRIMARY KEY CLUSTERED (IdCliente ASC)
);
GO

-- 2.2 Tabla Empleados
CREATE TABLE dbo.Empleados (
    IdEmpleado INT IDENTITY(1,1) NOT NULL,
    Nombre NVARCHAR(50) NOT NULL,
    Apellido NVARCHAR(50) NOT NULL,
    Telefono NVARCHAR(20) NULL,
    Email NVARCHAR(100) NULL,
    Activo BIT NOT NULL CONSTRAINT DF_Empleados_Activo DEFAULT (1),
    CONSTRAINT PK_Empleados PRIMARY KEY CLUSTERED (IdEmpleado ASC)
);
GO

-- 2.3 Tabla Servicios
CREATE TABLE dbo.Servicios (
    IdServicio INT IDENTITY(1,1) NOT NULL,
    Nombre NVARCHAR(50) NOT NULL,
    Descripcion NVARCHAR(255) NULL,
    Precio DECIMAL(12, 2) NOT NULL,
    DuracionMin INT NOT NULL,
    CONSTRAINT PK_Servicios PRIMARY KEY CLUSTERED (IdServicio ASC),
    CONSTRAINT CK_Servicios_Precio CHECK (Precio > 0),
    CONSTRAINT CK_Servicios_Duracion CHECK (DuracionMin > 0)
);
GO

-- 2.4 Tabla intermedia EmpleadoServicio
CREATE TABLE dbo.EmpleadoServicio (
    IdEmpleado INT NOT NULL,
    IdServicio INT NOT NULL,
    CONSTRAINT PK_EmpleadoServicio PRIMARY KEY CLUSTERED (IdEmpleado ASC, IdServicio ASC),
    CONSTRAINT FK_EmpleadoServicio_Empleados FOREIGN KEY (IdEmpleado) REFERENCES dbo.Empleados (IdEmpleado),
    CONSTRAINT FK_EmpleadoServicio_Servicios FOREIGN KEY (IdServicio) REFERENCES dbo.Servicios (IdServicio)
);
GO

-- 2.5 Tabla Turnos (Cabecera de operación)
CREATE TABLE dbo.Turnos (
    IdTurno INT IDENTITY(1,1) NOT NULL,
    IdCliente INT NOT NULL,
    Fecha DATE NOT NULL,
    HoraInicio TIME(7) NOT NULL,
    Estado NVARCHAR(30) NOT NULL CONSTRAINT DF_Turnos_Estado DEFAULT (N'Pendiente'),
    Total DECIMAL(12, 2) NOT NULL,
    Observaciones NVARCHAR(255) NULL,
    CONSTRAINT PK_Turnos PRIMARY KEY CLUSTERED (IdTurno ASC),
    CONSTRAINT FK_Turnos_Clientes FOREIGN KEY (IdCliente) REFERENCES dbo.Clientes (IdCliente),
    CONSTRAINT CK_Turnos_Total CHECK (Total >= 0)
);
GO

-- 2.6 Tabla DetalleTurno (Detalle con PrecioUnitario congelado)
CREATE TABLE dbo.DetalleTurno (
    IdDetalle INT IDENTITY(1,1) NOT NULL,
    IdTurno INT NOT NULL,
    IdServicio INT NOT NULL,
    IdEmpleado INT NOT NULL,
    PrecioUnitario DECIMAL(12, 2) NOT NULL,
    CONSTRAINT PK_DetalleTurno PRIMARY KEY CLUSTERED (IdDetalle ASC),
    CONSTRAINT FK_DetalleTurno_Turnos FOREIGN KEY (IdTurno) REFERENCES dbo.Turnos (IdTurno),
    CONSTRAINT FK_DetalleTurno_Servicios FOREIGN KEY (IdServicio) REFERENCES dbo.Servicios (IdServicio),
    CONSTRAINT FK_DetalleTurno_Empleados FOREIGN KEY (IdEmpleado) REFERENCES dbo.Empleados (IdEmpleado),
    CONSTRAINT CK_DetalleTurno_Precio CHECK (PrecioUnitario >= 0)
);
GO

/* ================================================== */
/* 3. DATOS DE EJEMPLO                                 */
/* ================================================== */
SET IDENTITY_INSERT dbo.Clientes ON;
INSERT INTO dbo.Clientes (IdCliente, Nombre, Apellido, Telefono, Email, Observaciones) VALUES 
(1, N'Juan', N'Pérez', N'3512345678', N'juan.perez@email.com', N'Prefiere corte con tijera'),
(2, N'María', N'Gómez', N'3519876543', N'maria.gomez@email.com', N'Alérgica a ciertos tintes'),
(3, N'Carlos', N'López', N'3514561230', N'carlos.lopez@email.com', N'Cliente frecuente');
SET IDENTITY_INSERT dbo.Clientes OFF;
GO

SET IDENTITY_INSERT dbo.Empleados ON;
INSERT INTO dbo.Empleados (IdEmpleado, Nombre, Apellido, Telefono, Email, Activo) VALUES 
(1, N'Lucas', N'Martínez', N'3511112223', N'lucas@peluqueria.com', 1),
(2, N'Sofía', N'Rodríguez', N'3514445556', N'sofia@peluqueria.com', 1),
(3, N'Martín', N'García', N'3517778889', N'martin@peluqueria.com', 1);
SET IDENTITY_INSERT dbo.Empleados OFF;
GO

SET IDENTITY_INSERT dbo.Servicios ON;
INSERT INTO dbo.Servicios (IdServicio, Nombre, Descripcion, Precio, DuracionMin) VALUES 
(1, N'Corte Clásico', N'Corte de cabello masculino tradicional con tijera o máquina', 8000.00, 30),
(2, N'Corte y Barba', N'Corte de cabello completo y perfilado y arreglo de barba', 12000.00, 45),
(3, N'Tintura Completa', N'Coloración global y lavado nutritivo', 18500.00, 90),
(4, N'Brushing y Peinado', N'Lavado con shampoo neutro, secado y modelado con brushing', 7500.00, 40),
(5, N'Perfilado de Barba', N'Diseño y afeitado de contornos con navaja y bálsamo', 6000.00, 25),
(6, N'Tratamiento Capilar Keratina', N'Nutrición profunda antifrizz para cabello dañado', 16000.00, 60);
SET IDENTITY_INSERT dbo.Servicios OFF;
GO

INSERT INTO dbo.EmpleadoServicio (IdEmpleado, IdServicio) VALUES 
(1, 1), (1, 2), (1, 5),
(2, 1), (2, 3), (2, 4), (2, 6),
(3, 1), (3, 2), (3, 4), (3, 5);
GO

SET IDENTITY_INSERT dbo.Turnos ON;
INSERT INTO dbo.Turnos (IdTurno, IdCliente, Fecha, HoraInicio, Estado, Total, Observaciones) VALUES 
(1, 1, '2026-11-10', '10:00:00', N'Pendiente', 8000.00, N'Llega 5 minutos antes'),
(2, 2, '2026-11-10', '11:15:00', N'Completado', 26000.00, N'Atendido en tiempo y forma'),
(3, 3, '2026-11-10', '16:00:00', N'En Atención', 12000.00, N'Turno de la tarde');
SET IDENTITY_INSERT dbo.Turnos OFF;
GO

SET IDENTITY_INSERT dbo.DetalleTurno ON;
INSERT INTO dbo.DetalleTurno (IdDetalle, IdTurno, IdServicio, IdEmpleado, PrecioUnitario) VALUES 
(1, 1, 1, 1, 8000.00),
(2, 2, 3, 2, 18500.00),
(3, 2, 4, 2, 7500.00),
(4, 3, 2, 3, 12000.00);
SET IDENTITY_INSERT dbo.DetalleTurno OFF;
GO

/* ================================================== */
/* 4. SPs DE RESERVAS Y CATÁLOGO  (Dueño: Maxi)       */
/* ================================================== */

-- 4.1 Listar catálogo de servicios disponibles
CREATE OR ALTER PROCEDURE dbo.usp_ListarServicios
AS
BEGIN
    SET NOCOUNT ON;

    SELECT IdServicio, Nombre, Descripcion, Precio, DuracionMin
    FROM dbo.Servicios
    ORDER BY Nombre ASC;
END;
GO

-- 4.2 Listar empleados / estilistas activos
CREATE OR ALTER PROCEDURE dbo.usp_ListarEmpleados
AS
BEGIN
    SET NOCOUNT ON;

    SELECT IdEmpleado, Nombre, Apellido, Telefono, Email
    FROM dbo.Empleados
    WHERE Activo = 1
    ORDER BY Nombre ASC;
END;
GO

-- 4.3 Crear Turno (Transacción Maestra, OPENJSON, validaciones de negocio y 2 parámetros OUTPUT)
CREATE OR ALTER PROCEDURE dbo.usp_CrearTurno
    @Cliente       NVARCHAR(100),
    @Telefono      NVARCHAR(20) = NULL,
    @Fecha         DATE,
    @HoraInicio    TIME(7),
    @Detalle       NVARCHAR(MAX),
    @Observaciones NVARCHAR(255) = NULL,
    @IdTurno       INT OUTPUT,
    @Total         DECIMAL(12, 2) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. Validación de campos obligatorios (THROW 50020)
        IF @Cliente IS NULL OR LTRIM(RTRIM(@Cliente)) = N''
           OR @Fecha IS NULL
           OR @HoraInicio IS NULL
        BEGIN
            ;THROW 50020, N'El nombre del cliente, la fecha y la hora de inicio son obligatorios.', 1;
        END;

        -- 2. Validación y apertura de servicios recibidos en formato JSON
        IF @Detalle IS NULL OR ISJSON(@Detalle) <> 1
        BEGIN
            ;THROW 50020, N'El formato de los servicios seleccionados es inválido.', 1;
        END;

        DECLARE @Carrito TABLE (
            IdServicio INT,
            IdEmpleado INT
        );

        INSERT INTO @Carrito (IdServicio, IdEmpleado)
        SELECT 
            COALESCE(J.IdServicio, J.IdServicioAlt, J.IdServicioAlt2),
            COALESCE(J.IdEmpleado, J.IdEmpleadoAlt, J.IdEmpleadoAlt2)
        FROM OPENJSON(@Detalle)
            WITH (
                IdServicio INT '$.IdServicio',
                IdServicioAlt INT '$.idServicio',
                IdServicioAlt2 INT '$.id',
                IdEmpleado INT '$.IdEmpleado',
                IdEmpleadoAlt INT '$.idEmpleado',
                IdEmpleadoAlt2 INT '$.empleadoId'
            ) AS J;

        -- 3. Carrito vacío (THROW 50022)
        IF NOT EXISTS (SELECT 1 FROM @Carrito)
        BEGIN
            ;THROW 50022, N'Debe seleccionar al menos un servicio para reservar el turno.', 1;
        END;

        -- 4. Validar IDs de servicio positivos (THROW 50020)
        IF EXISTS (SELECT 1 FROM @Carrito WHERE IdServicio IS NULL OR IdServicio <= 0)
        BEGIN
            ;THROW 50020, N'Todos los servicios deben contar con un identificador válido.', 1;
        END;

        -- 5. Validar existencia de los servicios en el catálogo (THROW 50022)
        IF EXISTS (
            SELECT 1
            FROM @Carrito AS C
            LEFT JOIN dbo.Servicios AS S ON S.IdServicio = C.IdServicio
            WHERE S.IdServicio IS NULL
        )
        BEGIN
            ;THROW 50022, N'Uno o más servicios seleccionados no existen en el catálogo.', 1;
        END;

        -- 6. Validar existencia y disponibilidad de los profesionales asignados
        IF EXISTS (
            SELECT 1
            FROM @Carrito AS C
            LEFT JOIN dbo.Empleados AS E ON E.IdEmpleado = C.IdEmpleado
            WHERE C.IdEmpleado IS NOT NULL AND (E.IdEmpleado IS NULL OR E.Activo = 0)
        )
        BEGIN
            ;THROW 50020, N'El profesional seleccionado no existe o no se encuentra activo.', 1;
        END;

        -- 7. Validar solapamiento de turno: el barbero no debe tener otro turno en esa fecha y hora (THROW 50024)
        IF EXISTS (
            SELECT 1
            FROM dbo.Turnos AS T
            INNER JOIN dbo.DetalleTurno AS DT ON DT.IdTurno = T.IdTurno
            INNER JOIN @Carrito AS C ON C.IdEmpleado = DT.IdEmpleado
            WHERE T.Fecha = @Fecha
              AND T.HoraInicio = @HoraInicio
              AND T.Estado <> N'Cancelado'
        )
        BEGIN
            ;THROW 50024, N'El profesional seleccionado ya cuenta con un turno reservado en ese horario.', 1;
        END;

        -- 8. Inserción o división de Nombre y Apellido de Cliente
        DECLARE @Nombre NVARCHAR(50);
        DECLARE @Apellido NVARCHAR(50);
        DECLARE @ClienteLimpio NVARCHAR(100) = LTRIM(RTRIM(@Cliente));

        IF CHARINDEX(N' ', @ClienteLimpio) > 0
        BEGIN
            SET @Nombre = SUBSTRING(@ClienteLimpio, 1, CHARINDEX(N' ', @ClienteLimpio) - 1);
            SET @Apellido = LTRIM(SUBSTRING(@ClienteLimpio, CHARINDEX(N' ', @ClienteLimpio) + 1, LEN(@ClienteLimpio)));
        END
        ELSE
        BEGIN
            SET @Nombre = @ClienteLimpio;
            SET @Apellido = N'';
        END;

        INSERT INTO dbo.Clientes (Nombre, Apellido, Telefono, Observaciones)
        VALUES (@Nombre, @Apellido, @Telefono, @Observaciones);

        DECLARE @IdClienteGenerado INT = SCOPE_IDENTITY();

        -- 9. Regla de Oro de los Precios: El total lo calcula SIEMPRE la base de datos con SUM()
        SELECT @Total = SUM(S.Precio)
        FROM @Carrito AS C
        INNER JOIN dbo.Servicios AS S ON S.IdServicio = C.IdServicio;

        -- 10. Inserción de Cabecera en Turnos
        INSERT INTO dbo.Turnos (IdCliente, Fecha, HoraInicio, Estado, Total, Observaciones)
        VALUES (@IdClienteGenerado, @Fecha, @HoraInicio, N'Pendiente', @Total, @Observaciones);

        SET @IdTurno = SCOPE_IDENTITY();

        -- 11. Inserción de Detalle congelando PrecioUnitario vigente
        INSERT INTO dbo.DetalleTurno (IdTurno, IdServicio, IdEmpleado, PrecioUnitario)
        SELECT @IdTurno, C.IdServicio, C.IdEmpleado, S.Precio
        FROM @Carrito AS C
        INNER JOIN dbo.Servicios AS S ON S.IdServicio = C.IdServicio;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
        BEGIN
            ROLLBACK TRANSACTION;
        END;

        ;THROW;
    END CATCH;
END;
GO

/* ================================================== */
/* 5. SPs DE TABLERO Y GESTIÓN    (Dueño: Claudio)    */
/* ================================================== */

-- 5.1 Listado principal del tablero con JOIN de 5 tablas y STRING_AGG
CREATE OR ALTER PROCEDURE dbo.usp_ListarTurnosTablero
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        T.IdTurno,
        T.Fecha,
        T.HoraInicio,
        C.Nombre + N' ' + C.Apellido AS Cliente,
        C.Telefono AS TelefonoCliente,
        STRING_AGG(S.Nombre, N', ') AS Servicios,
        MAX(E.Nombre + N' ' + E.Apellido) AS Profesional,
        T.Total,
        T.Estado,
        T.Observaciones
    FROM dbo.Turnos AS T
    INNER JOIN dbo.Clientes AS C
        ON C.IdCliente = T.IdCliente
    INNER JOIN dbo.DetalleTurno AS DT
        ON DT.IdTurno = T.IdTurno
    INNER JOIN dbo.Servicios AS S
        ON S.IdServicio = DT.IdServicio
    INNER JOIN dbo.Empleados AS E
        ON E.IdEmpleado = DT.IdEmpleado
    GROUP BY
        T.IdTurno,
        T.Fecha,
        T.HoraInicio,
        C.Nombre,
        C.Apellido,
        C.Telefono,
        T.Total,
        T.Estado,
        T.Observaciones
    ORDER BY
        T.Fecha DESC,
        T.HoraInicio ASC;
END;
GO

-- 5.2 Búsqueda con filtros opcionales en el WHERE (fecha, profesional, estado)
CREATE OR ALTER PROCEDURE dbo.usp_BuscarTurnos
    @Fecha      DATE = NULL,
    @IdEmpleado INT = NULL,
    @Estado     NVARCHAR(30) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        T.IdTurno,
        T.Fecha,
        T.HoraInicio,
        C.Nombre + N' ' + C.Apellido AS Cliente,
        C.Telefono AS TelefonoCliente,
        STRING_AGG(S.Nombre, N', ') AS Servicios,
        MAX(E.Nombre + N' ' + E.Apellido) AS Profesional,
        T.Total,
        T.Estado,
        T.Observaciones
    FROM dbo.Turnos AS T
    INNER JOIN dbo.Clientes AS C
        ON C.IdCliente = T.IdCliente
    INNER JOIN dbo.DetalleTurno AS DT
        ON DT.IdTurno = T.IdTurno
    INNER JOIN dbo.Servicios AS S
        ON S.IdServicio = DT.IdServicio
    INNER JOIN dbo.Empleados AS E
        ON E.IdEmpleado = DT.IdEmpleado
    WHERE (@Fecha IS NULL OR T.Fecha = @Fecha)
      AND (@IdEmpleado IS NULL OR DT.IdEmpleado = @IdEmpleado)
      AND (@Estado IS NULL OR T.Estado = @Estado)
    GROUP BY
        T.IdTurno,
        T.Fecha,
        T.HoraInicio,
        C.Nombre,
        C.Apellido,
        C.Telefono,
        T.Total,
        T.Estado,
        T.Observaciones
    ORDER BY
        T.Fecha DESC,
        T.HoraInicio ASC;
END;
GO

-- 5.3 Cambio de estado con validación estricta de transiciones (THROW)
CREATE OR ALTER PROCEDURE dbo.usp_CambiarEstadoTurno
    @IdTurno     INT,
    @NuevoEstado NVARCHAR(30)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- 1. Validar existencia del turno (THROW 50025 -> 404 Not Found)
        IF NOT EXISTS (SELECT 1 FROM dbo.Turnos WHERE IdTurno = @IdTurno)
        BEGIN
            ;THROW 50025, N'El turno solicitado no existe.', 1;
        END;

        DECLARE @EstadoActual NVARCHAR(30);
        SELECT @EstadoActual = Estado FROM dbo.Turnos WHERE IdTurno = @IdTurno;

        -- 2. Máquina de estados: no se puede modificar un turno ya finalizado o cancelado (THROW 50026 -> 400 Bad Request)
        IF @EstadoActual IN (N'Completado', N'Cancelado')
        BEGIN
            ;THROW 50026, N'No se puede modificar un turno que ya ha sido completado o cancelado.', 1;
        END;

        -- 3. Transiciones válidas:
        -- Pendiente -> En Atención o Cancelado
        -- En Atención -> Completado o Cancelado
        IF @EstadoActual = N'Pendiente' AND @NuevoEstado NOT IN (N'En Atención', N'Cancelado')
        BEGIN
            ;THROW 50026, N'Desde Pendiente solo se puede pasar a En Atención o Cancelado.', 1;
        END;

        IF @EstadoActual = N'En Atención' AND @NuevoEstado NOT IN (N'Completado', N'Cancelado')
        BEGIN
            ;THROW 50026, N'Desde En Atención solo se puede pasar a Completado o Cancelado.', 1;
        END;

        -- 4. Aplicar el cambio
        UPDATE dbo.Turnos
        SET Estado = @NuevoEstado
        WHERE IdTurno = @IdTurno;

    END TRY
    BEGIN CATCH
        ;THROW;
    END CATCH;
END;
GO

/* ================================================== */
/* 6. SPs DE ESTADÍSTICAS         (Dueño: Nahuel)     */
/* ================================================== */

-- 6.1 Resumen general de KPIs ejecutivos del salón
CREATE OR ALTER PROCEDURE dbo.usp_ObtenerEstadisticasGenerales
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        COUNT(T.IdTurno) AS TotalTurnosHistoricos,
        SUM(CASE WHEN T.Estado = N'Completado' THEN 1 ELSE 0 END) AS TurnosCompletados,
        SUM(CASE WHEN T.Estado = N'Pendiente' THEN 1 ELSE 0 END) AS TurnosPendientes,
        SUM(CASE WHEN T.Estado = N'En Atención' THEN 1 ELSE 0 END) AS TurnosEnAtencion,
        SUM(CASE WHEN T.Estado = N'Cancelado' THEN 1 ELSE 0 END) AS TurnosCancelados,
        ISNULL(SUM(CASE WHEN T.Estado = N'Completado' THEN T.Total ELSE 0 END), 0.00) AS FacturacionTotal,
        COUNT(DISTINCT T.IdCliente) AS ClientesAtendidos,
        ISNULL(AVG(CASE WHEN T.Estado = N'Completado' THEN T.Total ELSE NULL END), 0.00) AS TicketPromedio,
        CASE 
            WHEN COUNT(T.IdTurno) > 0 
            THEN ROUND((CAST(SUM(CASE WHEN T.Estado = N'Completado' THEN 1 ELSE 0 END) AS DECIMAL(5,2)) * 100.0) / COUNT(T.IdTurno), 2)
            ELSE 0.00 
        END AS TasaEfectividad
    FROM dbo.Turnos AS T;
END;
GO

-- 6.2 Consulta agregada de servicios más demandados con ranking y recaudación
CREATE OR ALTER PROCEDURE dbo.usp_ServiciosMasDemandados
    @FechaDesde DATE = NULL,
    @FechaHasta DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        S.IdServicio,
        S.Nombre AS Servicio,
        S.Precio AS PrecioActual,
        COUNT(DT.IdDetalle) AS CantidadSolicitada,
        ISNULL(SUM(DT.PrecioUnitario), 0.00) AS RecaudacionTotal,
        S.DuracionMin
    FROM dbo.Servicios AS S
    INNER JOIN dbo.DetalleTurno AS DT 
        ON DT.IdServicio = S.IdServicio
    INNER JOIN dbo.Turnos AS T 
        ON T.IdTurno = DT.IdTurno
    WHERE (@FechaDesde IS NULL OR T.Fecha >= @FechaDesde)
      AND (@FechaHasta IS NULL OR T.Fecha <= @FechaHasta)
      AND T.Estado <> N'Cancelado'
    GROUP BY
        S.IdServicio,
        S.Nombre,
        S.Precio,
        S.DuracionMin
    ORDER BY
        CantidadSolicitada DESC,
        RecaudacionTotal DESC;
END;
GO

-- 6.3 Consulta agregada de rendimiento y facturación por profesional
CREATE OR ALTER PROCEDURE dbo.usp_RendimientoEmpleados
    @FechaDesde DATE = NULL,
    @FechaHasta DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        E.IdEmpleado,
        E.Nombre + N' ' + E.Apellido AS Profesional,
        COUNT(DISTINCT T.IdTurno) AS TurnosAtendidos,
        COUNT(DT.IdDetalle) AS ServiciosRealizados,
        ISNULL(SUM(DT.PrecioUnitario), 0.00) AS TotalFacturado,
        ISNULL(ROUND(AVG(DT.PrecioUnitario), 2), 0.00) AS PromedioPorServicio,
        E.Activo
    FROM dbo.Empleados AS E
    INNER JOIN dbo.DetalleTurno AS DT 
        ON DT.IdEmpleado = E.IdEmpleado
    INNER JOIN dbo.Turnos AS T 
        ON T.IdTurno = DT.IdTurno
    WHERE (@FechaDesde IS NULL OR T.Fecha >= @FechaDesde)
      AND (@FechaHasta IS NULL OR T.Fecha <= @FechaHasta)
      AND T.Estado = N'Completado'
    GROUP BY
        E.IdEmpleado,
        E.Nombre,
        E.Apellido,
        E.Activo
    ORDER BY
        TotalFacturado DESC,
        TurnosAtendidos DESC;
END;
GO
