# TEKA Manager API — Módulo Inventario

API REST en .NET 8 para el sistema de gestión de Mueblería TEKA.  
Usa **stored procedures** existentes en SQL Server. Sin LINQ para datos, sin Repository Pattern.

---

## Estructura de la solución

```
TEKAManager.sln
├── TEKAManager.API/            ← Web API (controllers)
│   ├── Controllers/
│   │   ├── ProductosController.cs
│   │   ├── InsumosController.cs
│   │   ├── StockController.cs
│   │   ├── MovimientosStockController.cs
│   │   └── AuxiliaresController.cs
│   ├── Program.cs
│   └── appsettings.json
│
└── TEKAManager.Core/           ← Class Library (lógica + servicios)
    ├── Data/
    │   └── TekaDbContext.cs
    ├── Entities/               ← Clases que mapean resultados de SPs
    ├── DTOs/                   ← Lo que devuelve la API al cliente
    ├── Requests/               ← Lo que recibe la API del cliente
    └── Services/               ← Lógica de negocio + llamadas a SPs
```

---

## Configuración

### 1. Connection string

Editar `TEKAManager.API/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=TU_SERVIDOR;Database=TEKA_Manager;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

**Autenticación SQL** (si no usás Windows Auth):
```
Server=TU_SERVIDOR;Database=TEKA_Manager;User Id=sa;Password=TU_PASSWORD;TrustServerCertificate=True;
```

### 2. Correr la API

```bash
cd TEKAManager.API
dotnet run
```

Swagger disponible en: `http://localhost:5000` (o el puerto asignado)

---

## Endpoints disponibles

### Productos — `/api/productos`
| Método | Ruta | Acción |
|--------|------|--------|
| GET | `/api/productos` | Listar todos |
| GET | `/api/productos/{id}` | Obtener por ID |
| POST | `/api/productos` | Crear |
| PUT | `/api/productos/{id}` | Actualizar |
| DELETE | `/api/productos/{id}` | Baja lógica (requiere body) |

### Insumos — `/api/insumos`
| Método | Ruta | Acción |
|--------|------|--------|
| GET | `/api/insumos` | Listar todos |
| GET | `/api/insumos/{id}` | Obtener por ID |
| POST | `/api/insumos` | Crear |
| PUT | `/api/insumos/{id}` | Actualizar |
| DELETE | `/api/insumos/{id}` | Baja lógica (requiere body) |

### Stock — `/api/stock`
| Método | Ruta | Acción |
|--------|------|--------|
| GET | `/api/stock/productos` | Stock de todos los productos |
| GET | `/api/stock/productos/por-producto/{id}` | Stock de un producto por depósito |
| GET | `/api/stock/productos/por-deposito/{id}` | Stock de un depósito (productos) |
| GET | `/api/stock/insumos` | Stock de todos los insumos |
| GET | `/api/stock/insumos/por-insumo/{id}` | Stock de un insumo por depósito |
| GET | `/api/stock/insumos/por-deposito/{id}` | Stock de un depósito (insumos) |

### Movimientos de Stock — `/api/movimientosstock`
| Método | Ruta | Acción |
|--------|------|--------|
| GET | `/api/movimientosstock` | Listar todos |
| GET | `/api/movimientosstock/{id}` | Obtener por ID |
| GET | `/api/movimientosstock/por-producto/{id}` | Movimientos de un producto |
| GET | `/api/movimientosstock/por-insumo/{id}` | Movimientos de un insumo |
| POST | `/api/movimientosstock/producto` | Registrar movimiento de producto |
| POST | `/api/movimientosstock/insumo` | Registrar movimiento de insumo |
| POST | `/api/movimientosstock/producto/manual` | Ajuste manual de producto (motivo obligatorio) |
| POST | `/api/movimientosstock/insumo/manual` | Ajuste manual de insumo (motivo obligatorio) |
| POST | `/api/movimientosstock/{id}/anular/producto` | Anular movimiento de producto |
| POST | `/api/movimientosstock/{id}/anular/insumo` | Anular movimiento de insumo |

### Auxiliares — `/api/auxiliares`
| Método | Ruta | Acción |
|--------|------|--------|
| GET | `/api/auxiliares/unidades-medida` | Lookup unidades de medida |
| GET | `/api/auxiliares/colores` | Lookup colores |
| GET | `/api/auxiliares/tipos-producto` | Lookup tipos de producto |
| GET | `/api/auxiliares/tipos-insumo` | Lookup tipos de insumo |
| GET | `/api/auxiliares/depositos` | Lookup depósitos |
| GET | `/api/auxiliares/motivos-inactivacion` | Lookup motivos de inactivación |
| GET | `/api/auxiliares/tipos-movimiento-stock` | Lookup tipos de movimiento |

---

## Reglas de negocio implementadas

- **Stock negativo bloqueado**: El SP `sp_MovimientoStock_RegistrarProducto/Insumo` devuelve error SQL si la salida supera el stock actual. El service captura la excepción y devuelve `400`.
- **Motivo obligatorio en ajustes manuales**: Validado tanto en el `Request` (DataAnnotations) como en el `Service` antes de llamar al SP.
- **Baja lógica**: DELETE nunca elimina físicamente; llama al SP de inactivación con motivo.
- **Stock mínimo ≥ 0**: Validado en `Service` con `InvalidOperationException`.
- **Anulación con reversa**: El SP genera un movimiento opuesto automáticamente. Si ya está anulado, el SP devuelve error.

---

## Errores comunes

| Código | Causa probable |
|--------|---------------|
| 400 | Validación de request fallida o regla de negocio violada |
| 404 | Entidad no encontrada |
| 500 | Error de SQL Server (ej: stock insuficiente desde el SP) |

---

## Notas técnicas

- EF Core se usa **solo** para obtener la conexión y ejecutar `FromSqlRaw` / `ExecuteSqlRaw`.
- No hay Migrations, no hay DbSet, no hay LINQ sobre datos.
- Cada service mapea manualmente de Entity → DTO.
- Los `SqlParameter` con `DBNull.Value` manejan correctamente los nulos de SQL Server.
