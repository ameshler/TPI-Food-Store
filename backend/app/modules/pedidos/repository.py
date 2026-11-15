
from sqlalchemy import func
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    """
    Repositorio especializado para operaciones
    de persistencia y consulta de pedidos.
    """

    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def list_by_usuario(
        self,
        usuario_id: int,
        skip: int = 0,
        limit: int = 20,
        estado: str | None = None,
    ) -> tuple[int, list[Pedido]]:
        """
        Obtiene los pedidos de un usuario con paginación
        y filtro opcional por estado.
        """

        filters = [Pedido.usuario_id == usuario_id]

        if estado is not None:
            filters.append(Pedido.estado == estado)

        # Consulta para obtener el total de pedidos.
        count_statement = (
            select(func.count())
            .select_from(Pedido)
            .where(*filters)
        )

        total = self.session.exec(count_statement).one()

        # Consulta paginada.
        statement = (
            select(Pedido)
            .where(*filters)
            .offset(skip)
            .limit(limit)
        )

        items = list(self.session.exec(statement).all())

        return total, items

    def count_by_estado(self, estado: str) -> int:
        """
        Cuenta los pedidos correspondientes a un estado.
        """

        statement = (
            select(func.count())
            .select_from(Pedido)
            .where(Pedido.estado == estado)
        )

        return self.session.exec(statement).one()
