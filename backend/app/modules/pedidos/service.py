from datetime import datetime, timezone, date

from app.modules.pedidos.models import Pedido, DetallePedido
from app.modules.pedidos.schemas import PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork


# Excepciones de dominio de la creación de pedidos.

class ProductoNoEncontrado(Exception):
    """El producto no existe o está dado de baja."""


class ProductoNoDisponible(Exception):
    """El producto no está disponible para la venta."""


class StockInsuficiente(Exception):
    """No hay stock suficiente para completar el pedido."""


class ProductoRepetido(Exception):
    """El pedido contiene un producto más de una vez."""

class PedidoNoEncontrado(Exception):
    """El pedido no existe."""


class TransicionInvalida(Exception):
    """La transición solicitada no está permitida."""


class PedidoAjeno(Exception):
    """El pedido pertenece a otro usuario."""


class PedidoService:
    """
    Contiene las reglas de negocio del módulo de pedidos.
    """

    TRANSICIONES_VALIDAS = {
        "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
        "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
        "ENTREGADO": set(),
        "CANCELADO": set(),
    }

    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    def _restituir_stock(self, pedido, uow) -> None:
        """
        Restituye el stock correspondiente a cada detalle del pedido.

        Primero verifica que existan todos los productos.
        Luego aplica las restituciones.
        """

        productos_a_restituir = []

        for detalle in pedido.items:
            producto = uow.productos.get_by_id(detalle.producto_id)

            if producto is None:
                raise ProductoNoEncontrado(
                    f"Producto {detalle.producto_id} no encontrado"
                )

            productos_a_restituir.append(
                (producto, detalle.cantidad)
            )

        for producto, cantidad in productos_a_restituir:
            producto.stock += cantidad

    def crear_pedido(
        self,
        datos: PedidoCreate,
        usuario_id: int,
    ) -> PedidoRead:
        """
        Crea un pedido completo dentro de una única transacción.

        Si alguna validación falla, el Unit of Work ejecuta
        rollback y revierte también los descuentos de stock.
        """

        with self.uow as uow:

            # 1. Comprobar que no haya productos repetidos.
            productos_ids = [
                item.producto_id
                for item in datos.items
            ]

            if len(productos_ids) != len(set(productos_ids)):
                raise ProductoRepetido(
                    "El pedido no puede contener productos repetidos"
                )

            ahora = datetime.now(timezone.utc)

            # 2. Crear el pedido inicialmente con total cero.
            pedido = Pedido(
                usuario_id=usuario_id,
                estado="PENDIENTE",
                forma_pago=datos.forma_pago,
                direccion_entrega=datos.direccion_entrega,
                notas=datos.notas,
                total=0.0,
                created_at=ahora,
                updated_at=ahora,
            )

            uow.pedidos.add(pedido)

            assert uow.session is not None

            # Necesitamos el ID del pedido antes de crear sus detalles.
            uow.session.flush()

            total = 0.0

            # 3. Validar productos, descontar stock y crear detalles.
            for item in datos.items:

                producto = uow.productos.get_by_id(
                    item.producto_id
                )

                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(
                        f"Producto {item.producto_id} no encontrado"
                    )

                if not producto.disponible:
                    raise ProductoNoDisponible(
                        f"Producto {producto.nombre} no disponible"
                    )

                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para {producto.nombre}"
                    )

                # Descuento de stock dentro de la misma sesión.
                producto.stock -= item.cantidad

                # Copia del precio y nombre actuales del producto.
                precio_unitario = producto.precio_base
                subtotal = precio_unitario * item.cantidad

                detalle = DetallePedido(
                    pedido=pedido,
                    producto_id=producto.id,
                    cantidad=item.cantidad,
                    nombre_producto=producto.nombre,
                    precio_unitario=precio_unitario,
                    subtotal=subtotal,
                )

                uow.session.add(detalle)

                total += subtotal

            # 4. Asignar el total definitivo.
            pedido.total = total
            pedido.updated_at = datetime.now(timezone.utc)

            # 5. Convertir a schema mientras la sesión está abierta.
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(
        self,
        pedido_id: int,
        nuevo_estado: str,
    ) -> PedidoRead:
        """
        Modifica el estado de un pedido según la máquina de estados.

        Operación reservada para administradores.
        """

        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)

            if pedido is None:
                raise PedidoNoEncontrado(
                    f"Pedido {pedido_id} no encontrado"
                )

            estados_permitidos = self.TRANSICIONES_VALIDAS.get(
                pedido.estado,
                set(),
            )

            if nuevo_estado not in estados_permitidos:
                raise TransicionInvalida(
                    f"No se puede cambiar de {pedido.estado} a {nuevo_estado}"
                )

            # Si se cancela, primero se restituye el stock.
            if nuevo_estado == "CANCELADO":
                self._restituir_stock(pedido, uow)

            pedido.estado = nuevo_estado
            pedido.updated_at = datetime.now(timezone.utc)

            return PedidoRead.model_validate(pedido)

    def cancelar_pedido(
        self,
        pedido_id: int,
        usuario_id: int,
    ) -> PedidoRead:
        """
        Permite al cliente cancelar su propio pedido,
        exclusivamente cuando está PENDIENTE.
        """

        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)

            if pedido is None:
                raise PedidoNoEncontrado(
                    f"Pedido {pedido_id} no encontrado"
                )

            if pedido.usuario_id != usuario_id:
                raise PedidoAjeno(
                    "No puede cancelar un pedido de otro usuario"
                )

            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida(
                    "Solo se pueden cancelar pedidos PENDIENTE"
                )

            self._restituir_stock(pedido, uow)

            pedido.estado = "CANCELADO"
            pedido.updated_at = datetime.now(timezone.utc)

            return PedidoRead.model_validate(pedido)

    def listar_pedidos(
        self,
        usuario_id: int,
        rol: str,
        skip: int = 0,
        limit: int = 20,
        estado: str | None = None,
    ) -> PedidosPaginados:
        """
        Admin: lista todos los pedidos.
        User: lista únicamente sus propios pedidos.
        """

        with self.uow as uow:

            if rol == "admin":
                total, pedidos = uow.pedidos.list_all(
                    skip=skip,
                    limit=limit,
                    estado=estado,
                )
            else:
                total, pedidos = uow.pedidos.list_by_usuario(
                    usuario_id=usuario_id,
                    skip=skip,
                    limit=limit,
                    estado=estado,
                )

            return PedidosPaginados(
                total=total,
                items=[
                    PedidoRead.model_validate(pedido)
                    for pedido in pedidos
                ],
            )

    def obtener_pedido(
        self,
        pedido_id: int,
        usuario_id: int,
        rol: str,
    ) -> PedidoRead:
        """
        Devuelve el detalle de un pedido.
        El cliente solo puede consultar pedidos propios.
        """

        with self.uow as uow:

            pedido = uow.pedidos.get_by_id(pedido_id)

            if pedido is None:
                raise PedidoNoEncontrado(
                    f"Pedido {pedido_id} no encontrado"
                )

            if rol != "admin" and pedido.usuario_id != usuario_id:
                raise PedidoAjeno(
                    "No puede consultar un pedido de otro usuario"
                )

            return PedidoRead.model_validate(pedido)

    def obtener_resumen(self) -> ResumenPedidos:
        """
        Calcula los indicadores del panel administrativo.
        """

        with self.uow as uow:

            pendientes = uow.pedidos.count_by_estado("PENDIENTE")

            en_preparacion = uow.pedidos.count_by_estado(
                "EN_PREPARACION"
            )

            entregados = uow.pedidos.count_by_estado("ENTREGADO")

            cancelados = uow.pedidos.count_by_estado("CANCELADO")

            pedidos_hoy = uow.pedidos.count_created_on(date.today())

            ingresos_entregados = (
                uow.pedidos.sum_total_by_estado("ENTREGADO")
            )

            return ResumenPedidos(
                pendientes=pendientes,
                en_preparacion=en_preparacion,
                entregados=entregados,
                cancelados=cancelados,
                pedidos_hoy=pedidos_hoy,
                ingresos_entregados=ingresos_entregados,
            )