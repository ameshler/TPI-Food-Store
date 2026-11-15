
from sqlmodel import Session, select
from sqlalchemy import func

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    """
    Repositorio especializado para operaciones
    de persistencia y búsqueda de productos.
    """

    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

    def search(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> tuple[int, list[Producto]]:
        """
        Busca productos activos con filtros opcionales
        y paginación.

        Retorna:
            Tupla con total de resultados y productos
            correspondientes a la página solicitada.
        """

        # Los listados públicos solo incluyen productos activos.
        filters = [Producto.activo.is_(True)]

        # Búsqueda parcial por nombre, sin distinguir mayúsculas.
        if search:
            filters.append(
                Producto.nombre.ilike(f"%{search}%")
            )

        # Filtro por categoría.
        if categoria_id is not None:
            filters.append(
                Producto.categoria_id == categoria_id
            )

        # Filtro por disponibilidad.
        if disponible is not None:
            filters.append(
                Producto.disponible == disponible
            )

        # Consulta para obtener el total sin aplicar paginación.
        count_statement = (
            select(func.count())
            .select_from(Producto)
            .where(*filters)
        )

        total = self.session.exec(count_statement).one()

        # Consulta para obtener solamente la página solicitada.
        statement = (
            select(Producto)
            .where(*filters)
            .offset(skip)
            .limit(limit)
        )

        items = list(self.session.exec(statement).all())

        return total, items
