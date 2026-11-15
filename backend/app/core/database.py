
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel, Session, create_engine

from app.core.config import settings


# Configuración específica para SQLite.
# La consigna permite utilizar SQLite durante el desarrollo
# cambiando DATABASE_URL.
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
