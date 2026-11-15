from fastapi import HTTPException, status

from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioService:
    """
    Contiene la lógica de gestión de usuarios.
    """

    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def listar_usuarios(self) -> list[UserPublic]:
        """
        Devuelve todos los usuarios registrados.
        """

        with self.uow as uow:
            usuarios = uow.usuarios.get_all()

            return [
                UserPublic.model_validate(usuario)
                for usuario in usuarios
            ]

    def activar_usuario(self, usuario_id: int) -> UserPublic:
        """
        Activa un usuario.

        La operación es idempotente:
        si ya está activo, permanece activo.
        """

        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)

            if usuario is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Usuario no encontrado",
                )

            usuario.disabled = False

            return UserPublic.model_validate(usuario)

    def desactivar_usuario(
        self,
        usuario_id: int,
        usuario_actual: Usuario,
    ) -> UserPublic:
        """
        Desactiva un usuario.

        El administrador no puede desactivarse a sí mismo.
        La operación es idempotente para otros usuarios.
        """

        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)

            if usuario is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Usuario no encontrado",
                )

            if usuario.id == usuario_actual.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No puede desactivarse a sí mismo",
                )

            usuario.disabled = True

            return UserPublic.model_validate(usuario)