
from sqlmodel import Field, SQLModel, Relationship
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.modules.productos.models import Producto


class Categoria(SQLModel, table=True):
    """
    Modelo de persistencia de categorías de Food Store.
    """

    __tablename__ = "categoria"

    id: int | None = Field(
        default=None,
        primary_key=True,
    )

    nombre: str = Field(
        unique=True,
        nullable=False,
    )

    descripcion: str | None = Field(
        default=None,
    )

    activo: bool = Field(
        default=True,
        nullable=False,
    )

    productos: list["Producto"] = Relationship(
        back_populates="categoria",
    )