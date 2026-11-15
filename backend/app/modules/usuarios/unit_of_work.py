
from app.core.unit_of_work import UnitOfWork
from app.modules.usuarios.repository import UsuarioRepository


class UsuarioUnitOfWork(UnitOfWork):
    """
    Unit of Work del módulo de usuarios.

    Expone el repositorio de usuarios utilizando
    la sesión administrada por el UnitOfWork base.
    """

    usuarios: UsuarioRepository

    def __enter__(self) -> "UsuarioUnitOfWork":
        super().__enter__()

        assert self.session is not None

        self.usuarios = UsuarioRepository(self.session)

        return self
