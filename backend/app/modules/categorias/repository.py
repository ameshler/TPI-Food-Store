from sqlmodel import select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):

    def __init__(self, session):
        super().__init__(session, Categoria)

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        """
        Busca una categoría por nombre.

        Incluye categorías inactivas porque el nombre
        único no se libera al dar de baja una categoría.
        """
        statement = select(Categoria).where(
            Categoria.nombre == nombre
        )
        return self.session.exec(statement).first()

    def get_all_active(self) -> list[Categoria]:
        """
        Devuelve únicamente las categorías activas.
        """
        statement = select(Categoria).where(
            Categoria.activo.is_(True)
        )
        return list(self.session.exec(statement).all())