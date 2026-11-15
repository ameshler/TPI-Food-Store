from datetime import datetime
from typing import Literal

from sqlmodel import Field, SQLModel


# Estados permitidos para un pedido.
EstadoPedido = Literal[
    "PENDIENTE",
    "EN_PREPARACION",
    "ENTREGADO",
    "CANCELADO",
]

# Formas de pago permitidas.
FormaPago = Literal[
    "EFECTIVO",
    "TRANSFERENCIA",
]


class ItemPedidoCreate(SQLModel):
    """
    Producto y cantidad solicitados en cada línea del pedido.
    """

    producto_id: int
    cantidad: int = Field(ge=1)


class PedidoCreate(SQLModel):
    """
    Datos enviados por el cliente para confirmar un pedido.
    """

    items: list[ItemPedidoCreate] = Field(min_length=1)
    forma_pago: FormaPago
    direccion_entrega: str = Field(min_length=5, max_length=200)
    notas: str | None = None


class DetallePedidoRead(SQLModel):
    """
    Información de cada línea del pedido.
    Conserva una copia del nombre y precio del producto.
    """

    producto_id: int
    nombre_producto: str
    precio_unitario: float
    cantidad: int
    subtotal: float


class PedidoRead(SQLModel):
    """
    Representación pública de un pedido con sus detalles.
    """

    id: int
    usuario_id: int
    estado: EstadoPedido
    forma_pago: FormaPago
    direccion_entrega: str
    notas: str | None
    total: float
    created_at: datetime
    updated_at: datetime
    items: list[DetallePedidoRead]

    model_config = {
        "from_attributes": True
    }


class PedidosPaginados(SQLModel):
    """
    Respuesta paginada de pedidos.
    """

    total: int
    items: list[PedidoRead]


class CambioEstado(SQLModel):
    """
    Estado solicitado para modificar un pedido.
    """

    estado: EstadoPedido


class ResumenPedidos(SQLModel):
    """
    Indicadores del panel administrativo.
    """

    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: float