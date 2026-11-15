
from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings


# Instancia principal de FastAPI.
app = FastAPI(
    title="Food Store API",
    description="API REST para el sistema de pedidos Food Store.",
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


# Router principal de la API.
# Todos los módulos se incorporarán bajo /api/v1.
api_router = APIRouter(prefix="/api/v1")


# Registro del router principal en la aplicación.
app.include_router(api_router)
