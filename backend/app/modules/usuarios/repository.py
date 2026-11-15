
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.usuarios.models import Usuario


class UsuarioRepository(BaseRepository[Usuario]):
    """
    Repositorio especializado para operaciones
    de persistencia y consulta de usuarios.
    """

    def __init__(self, session: Session) -> None:
        super().__init__(session, Usuario)

    def get_by_username(self, username: str) -> Usuario | None:
        """
        Busca un usuario por su nombre de usuario.
        """
        statement = select(Usuario).where(
            Usuario.username == username
        )

        return self.session.exec(statement).first()

    def get_by_email(self, email: str) -> Usuario | None:
        """
        Busca un usuario por su correo electrónico.
        """
        statement = select(Usuario).where(
            Usuario.email == email
        )

        return self.session.exec(statement).first()
