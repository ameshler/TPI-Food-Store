
from typing import Generic, TypeVar

from sqlmodel import SQLModel, Session, select


# T representa cualquier modelo SQLModel.
ModelType = TypeVar("ModelType", bound=SQLModel)


class BaseRepository(Generic[ModelType]):
    """
    Repositorio genérico para operaciones básicas
    de persistencia.
    """

    def __init__(
        self,
        session: Session,
        model: type[ModelType],
    ) -> None:
        self.session = session
        self.model = model

    def get_by_id(self, entity_id: int) -> ModelType | None:
        """
        Obtiene una entidad por su clave primaria.
        """
        return self.session.get(self.model, entity_id)

    def get_all(self) -> list[ModelType]:
        """
        Obtiene todas las entidades del modelo.
        """
        statement = select(self.model)
        return list(self.session.exec(statement).all())

    def add(self, entity: ModelType) -> ModelType:
        """
        Agrega una entidad a la sesión actual.
        No realiza commit.
        """
        self.session.add(entity)
        return entity

    def delete(self, entity: ModelType) -> None:
        """
        Marca una entidad para su eliminación.
        No realiza commit.
        """
        self.session.delete(entity)
