
from sqlalchemy import func
from sqlmodel import Session, select
from datetime import date

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

    def list_all(
        self,
        skip: int = 0,
        limit: int = 20,
        estado: str | None = None,
    ) -> tuple[int, list[Pedido]]:
        """
        Lista todos los pedidos, con paginación y filtro opcional
        por estado. Está destinado a la consulta administrativa.
        """

        filtros = []

        if estado is not None:
            filtros.append(Pedido.estado == estado)

        total_statement = (
            select(func.count())
            .select_from(Pedido)
            .where(*filtros)
        )

        total = self.session.exec(total_statement).one()

        statement = (
            select(Pedido)
            .where(*filtros)
            .order_by(Pedido.created_at.desc())
            .offset(skip)
            .limit(limit)
        )

        pedidos = self.session.exec(statement).all()

        return total, list(pedidos)


    def count_created_on(self, fecha: date) -> int:
        """
        Cuenta los pedidos creados en una fecha determinada.
        """

        statement = (
            select(func.count())
            .select_from(Pedido)
            .where(func.date(Pedido.created_at) == fecha)
        )

        return self.session.exec(statement).one()


    def sum_total_by_estado(self, estado: str) -> float:
        """
        Calcula la suma de los totales de pedidos
        que tienen el estado indicado.
        """

        statement = (
            select(func.coalesce(func.sum(Pedido.total), 0.0))
            .where(Pedido.estado == estado)
        )

        return float(self.session.exec(statement).one())
