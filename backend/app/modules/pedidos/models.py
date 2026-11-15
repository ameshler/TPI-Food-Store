
from datetime import datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.models import Producto
    from app.modules.usuarios.models import Usuario


class Pedido(SQLModel, table=True):
    """
    Modelo de persistencia de pedidos de Food Store.
    """

    __tablename__ = "pedido"

    id: int | None = Field(
        default=None,
        primary_key=True,
    )

    usuario_id: int = Field(
        foreign_key="usuario.id",
        nullable=False,
    )

    estado: str = Field(
        default="PENDIENTE",
        nullable=False,
    )

    forma_pago: str = Field(
        nullable=False,
    )

    direccion_entrega: str = Field(
        nullable=False,
    )

    notas: str | None = Field(
        default=None,
        nullable=True,
    )

    total: float = Field(
        nullable=False,
    )

    created_at: datetime = Field(
        nullable=False,
    )

    updated_at: datetime = Field(
        nullable=False,
    )

    # Relaciones ORM
    usuario: "Usuario" = Relationship(
        back_populates="pedidos",
    )

    items: list["DetallePedido"] = Relationship(
        back_populates="pedido",
    )


class DetallePedido(SQLModel, table=True):
    """
    Modelo de persistencia de las líneas de un pedido.
    """

    __tablename__ = "detalle_pedido"

    id: int | None = Field(
        default=None,
        primary_key=True,
    )

    pedido_id: int = Field(
        foreign_key="pedido.id",
        nullable=False,
    )

    producto_id: int = Field(
        foreign_key="producto.id",
        nullable=False,
    )

    cantidad: int = Field(
        nullable=False,
    )

    nombre_producto: str = Field(
        nullable=False,
    )

    precio_unitario: float = Field(
        nullable=False,
    )

    subtotal: float = Field(
        nullable=False,
    )

    # Relaciones ORM
    pedido: "Pedido" = Relationship(
        back_populates="items",
    )

    producto: "Producto" = Relationship(
        back_populates="detalles",
    )
