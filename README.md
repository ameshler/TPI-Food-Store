# Food Store

Sistema web de gestión de pedidos de comida desarrollado como Trabajo Práctico Integrador de Programación IV.

> **Repositorio:** (https://github.com/ameshler/TPI-Food-Store)

## Descripción

Food Store permite consultar un catálogo de productos, gestionar un carrito de compras, confirmar pedidos y consultar su estado. Incluye un panel de administración para gestionar categorías, productos, inventario, pedidos y usuarios.

La aplicación está dividida en dos proyectos:

- **Backend:** API REST desarrollada con FastAPI, SQLModel y PostgreSQL.
- **Frontend:** aplicación web desarrollada con React y TypeScript.

## Funcionalidades

### Clientes

- Registro e inicio/cierre de sesión.
- Consulta del catálogo con búsqueda, filtro por categoría y paginación.
- Visualización de disponibilidad y stock de productos.
- Carrito persistente, con modificación de cantidades y eliminación de productos.
- Confirmación de pedidos indicando dirección de entrega, forma de pago y notas.
- Consulta del historial y detalle de pedidos.
- Cancelación de pedidos pendientes.

### Administración

- Panel de resumen con indicadores de pedidos y ventas.
- Alta, modificación y baja lógica de categorías.
- Alta y modificación de productos, gestión de stock y disponibilidad, y baja lógica.
- Consulta y actualización del estado de los pedidos.
- Consulta de usuarios y activación/desactivación de cuentas.

## Tecnologías

### Backend

- Python 3.12
- FastAPI
- SQLModel / SQLAlchemy
- PostgreSQL
- Pydantic Settings
- JWT para autenticación
- Cookies HttpOnly para la sesión

### Frontend

- Node.js 22
- pnpm
- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- TanStack Query 5
- TanStack Form 1
- TanStack Table 8
- React Router 7
- Zustand 5
- Axios

## Requisitos previos

Instalar las siguientes herramientas antes de iniciar:

- Python 3.12 o compatible.
- Node.js 22 o compatible.
- pnpm 10 o compatible.
- PostgreSQL en ejecución.
- Git.

Las versiones utilizadas durante el desarrollo fueron Python 3.12.10, Node.js 22.14.0, pnpm 10.33.0 y PostgreSQL 18.6.

## Configuración y ejecución

Los comandos siguientes están escritos para PowerShell en Windows. Ejecutar los comandos desde la raíz del repositorio, salvo que se indique lo contrario.

### 1. Obtener el proyecto

```powershell
git clone https://github.com/ameshler/TPI-Food-Store.git
cd TPI-Food-Store
```

Reemplazar `<URL_PUBLICA_DEL_REPOSITORIO>` por la URL del repositorio publicado en GitHub. Si ya se tiene el proyecto descargado, ingresar directamente a su carpeta raíz.

### 2. Crear la base de datos PostgreSQL

Iniciar el servicio de PostgreSQL y abrir una consola `psql` con un usuario administrador, por ejemplo `postgres`.

Crear el usuario y la base de datos:

```sql
CREATE USER foodstore_user WITH PASSWORD 'CAMBIAR_PASSWORD';
CREATE DATABASE foodstore_tpi_db OWNER foodstore_user;
```

Usar una contraseña propia y conservarla para configurar la conexión del backend. Si el usuario o la base de datos ya existen, no ejecutar nuevamente las sentencias correspondientes.

### 3. Configurar e instalar el backend

Desde la raíz del repositorio:

```powershell
cd backend

py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1

python -m pip install --upgrade pip
pip install -r requirements.txt

Copy-Item .env.example .env
```

Editar `backend/.env` y configurar los valores:

```dotenv
DATABASE_URL=postgresql://foodstore_user:CAMBIAR_PASSWORD@localhost:5432/foodstore_tpi_db
SECRET_KEY=REEMPLAZAR_POR_UNA_CLAVE_ALEATORIA_DE_AL_MENOS_32_CARACTERES
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_ORIGIN=http://localhost:5173
```

La contraseña de `DATABASE_URL` debe coincidir con la utilizada al crear el usuario de PostgreSQL. Si contiene caracteres especiales, deben codificarse para su uso en una URL.

Para generar una clave secreta aleatoria desde la terminal, con el entorno virtual activado, se puede ejecutar:

```powershell
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Copiar el resultado en `SECRET_KEY`. La aplicación requiere una clave de al menos 32 caracteres.

### 4. Crear las tablas y cargar los datos iniciales

Asegurarse de que PostgreSQL esté iniciado y que `backend/.env` tenga una conexión válida. Desde la carpeta `backend`, con el entorno virtual activado, ejecutar:

```powershell
python -m app.db.seed
```

El proceso crea las tablas a partir de los modelos y carga los datos iniciales de forma idempotente: un administrador, tres categorías y ocho productos. Si se ejecuta nuevamente, verifica los registros existentes y evita duplicarlos.

**Credenciales iniciales del administrador:**

| Campo | Valor |
|---|---|
| Usuario | `admin` |
| Contraseña | `Admin1234!` |

Estas credenciales son para la configuración inicial y el entorno de desarrollo. Cambiar la contraseña antes de utilizar el sistema en un entorno real. El seed no restablece la contraseña si el usuario administrador ya existe.

### 5. Iniciar el backend

Desde la carpeta `backend`, con el entorno virtual activado:

```powershell
uvicorn app.main:app --reload
```

La API quedará disponible en:

- API: `http://localhost:8000`
- Documentación Swagger: `http://localhost:8000/docs`
- Documentación ReDoc: `http://localhost:8000/redoc`
- Prefijo de endpoints: `/api/v1`

Mantener esta terminal abierta mientras se utiliza la aplicación.

### 6. Configurar e iniciar el frontend

Abrir una segunda terminal y, desde la raíz del repositorio, ejecutar:

```powershell
cd frontend
pnpm install
Copy-Item .env.example .env
```

El archivo `frontend/.env` debe contener la URL base de la API:

```dotenv
VITE_API_URL=http://localhost:8000/api/v1
```

Iniciar el servidor de desarrollo:

```powershell
pnpm dev
```

La aplicación web estará disponible en `http://localhost:5173`.

## Comandos útiles del frontend

Ejecutar desde `frontend`:

```powershell
# Iniciar el servidor de desarrollo
pnpm dev

# Verificar tipos y generar la versión de producción
pnpm build

# Ejecutar el linter
pnpm lint

# Previsualizar la compilación de producción
pnpm preview
```

## Rutas principales

| Ruta | Acceso | Descripción |
|---|---|---|
| `/` | Público | Catálogo de productos |
| `/login` | Público | Inicio de sesión |
| `/register` | Público | Registro de usuarios |
| `/carrito` | Público | Carrito de compras |
| `/checkout` | Cliente autenticado | Confirmación del pedido |
| `/mis-pedidos` | Cliente autenticado | Historial y detalle de pedidos |
| `/admin/resumen` | Administrador | Resumen general |
| `/admin/categorias` | Administrador | Gestión de categorías |
| `/admin/productos` | Administrador | Gestión de productos e inventario |
| `/admin/pedidos` | Administrador | Gestión de pedidos |
| `/admin/usuarios` | Administrador | Gestión de usuarios |

Las rutas administrativas están protegidas por rol. La API también valida la autenticación y los permisos de las operaciones.

## Estructura general

```text
TPI-P4/
├── backend/
│   ├── app/
│   │   ├── core/          # Configuración, seguridad, DB y Unit of Work
│   │   ├── db/            # Carga de datos iniciales (seed)
│   │   └── modules/       # Auth, usuarios, categorías, productos y pedidos
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── features/      # Funcionalidades organizadas por módulo
│   │   ├── routes/        # Configuración de rutas
│   │   ├── shared/        # API, componentes y layout compartidos
│   │   └── store/         # Estado global con Zustand
│   └── .env.example
├── .gitignore
└── README.md
```

## Consideraciones importantes

- Mantener el backend y PostgreSQL en ejecución mientras se utiliza el frontend.
- Los archivos `.env` contienen configuración local y no deben publicarse ni compartirse. Utilizar los archivos `.env.example` como referencia.
- No versionar carpetas de dependencias o entornos virtuales como `node_modules` y `.venv`, ni archivos generados como `dist`.
- La autenticación utiliza cookies HttpOnly. El frontend realiza las solicitudes incluyendo credenciales y el backend permite el origen indicado en `FRONTEND_ORIGIN`.
- Para acceder al panel administrativo, iniciar sesión con una cuenta cuyo rol sea `admin`.
