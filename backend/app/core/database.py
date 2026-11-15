
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel, Session, create_engine

from app.core.config import settings

from app.modules.usuarios.models import Usuario as _Usuario
from app.modules.categorias.models import Categoria as _Categoria
from app.modules.productos.models import Producto as _Producto
from app.modules.pedidos.models import (
    Pedido as _Pedido,
    DetallePedido as _DetallePedido,
)


# Configuración específica para SQLite.
connect_args = {}

if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}


# Motor de conexión con la base de datos.
engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    connect_args=connect_args,
)


# Fábrica de sesiones para toda la aplicación.
session_factory = sessionmaker(
    bind=engine,
    class_=Session,
    expire_on_commit=False,
)


def create_all_tables() -> None:
    """
    Crea las tablas correspondientes a los modelos
    registrados en SQLModel.metadata.
    """
    SQLModel.metadata.create_all(engine)
