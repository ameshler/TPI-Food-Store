
from types import TracebackType
from typing import Callable

from sqlmodel import Session

from app.core.database import session_factory as default_session_factory


class UnitOfWork:
    """
    Administra una sesión y una transacción de base de datos.

    Abre la sesión al ingresar al contexto y realiza
    commit o rollback al salir.
    """

    def __init__(
        self,
        session_factory: Callable[[], Session] = default_session_factory,
    ) -> None:
        self._session_factory = session_factory
        self.session: Session | None = None

    def __enter__(self) -> "UnitOfWork":
        """
        Abre una nueva sesión y devuelve la unidad de trabajo.
        """
        self.session = self._session_factory()
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc_value: BaseException | None,
        traceback: TracebackType | None,
    ) -> None:
        """
        Confirma la transacción si no hubo errores.
        Revierte los cambios si ocurrió una excepción.
        Siempre cierra la sesión.
        """
        if self.session is None:
            return

        try:
            if exc_type is None:
                try:
                    self.session.commit()
                except Exception:
                    self.session.rollback()
                    raise
            else:
                self.session.rollback()

        finally:
            self.session.close()
            self.session = None
