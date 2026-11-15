from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

# Registramos los cinco modelos para que SQLAlchemy
# pueda resolver todas las relaciones entre entidades.
from app.modules.usuarios.models import Usuario as _Usuario
from app.modules.categorias.models import Categoria as _Categoria
from app.modules.productos.models import Producto as _Producto
from app.modules.pedidos.models import Pedido as _Pedido
from app.modules.pedidos.models import DetallePedido as _DetallePedido

# Routers de la aplicación.
from app.modules.auth.router import router as auth_router
from app.modules.usuarios.router import router as usuarios_router
from app.modules.categorias.router import router as categorias_router
from app.modules.productos.router import router as productos_router

app = FastAPI(
    title="Food Store API",
    description="API REST para el sistema de pedidos Food Store.",
    version="1.0.0",
)


# Configuración CORS para permitir la comunicación
# entre el frontend y el backend con cookies.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Router principal con el prefijo solicitado por el TPI.
api_router = APIRouter(prefix="/api/v1")

# Incorporamos los módulos.
api_router.include_router(auth_router)
api_router.include_router(usuarios_router)
api_router.include_router(categorias_router)
api_router.include_router(productos_router)

# Registramos el router principal en FastAPI.
app.include_router(api_router)