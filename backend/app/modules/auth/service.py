from datetime import datetime, timezone

from fastapi import HTTPException, status

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.modules.auth.schemas import UserCreate
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class AuthService:
    """
    Contiene la lógica de registro y autenticación de usuarios.
    """

    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def registrar_usuario(self, user_data: UserCreate) -> UserPublic:
        """
        Registra un usuario con rol user.

        Verifica que username y email no estén registrados.
        La contraseña se almacena como hash bcrypt.
        """

        with self.uow as uow:

            usuario_existente = uow.usuarios.get_by_username(
                user_data.username
            )

            email_existente = uow.usuarios.get_by_email(
                user_data.email
            )

            if usuario_existente or email_existente:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="El username o email ya están registrados",
                )

            nuevo_usuario = Usuario(
                username=user_data.username,
                full_name=user_data.full_name,
                email=user_data.email,
                hashed_password=hash_password(user_data.password),
                role="user",
                disabled=False,
                created_at=datetime.now(timezone.utc),
            )

            uow.usuarios.add(nuevo_usuario)

            # Fuerza el INSERT para obtener el ID generado por PostgreSQL.
            assert uow.session is not None
            uow.session.flush()

            return UserPublic.model_validate(nuevo_usuario)

    def autenticar_usuario(
        self,
        username: str,
        password: str,
    ) -> str:
        """
        Verifica las credenciales y genera un JWT.

        Devuelve el token para que el Router lo establezca
        en la cookie HttpOnly.
        """

        with self.uow as uow:

            usuario = uow.usuarios.get_by_username(username)

            # No distinguimos entre usuario inexistente y contraseña
            # incorrecta para no revelar información de las cuentas.
            if usuario is None or not verify_password(
                password,
                usuario.hashed_password,
            ):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Credenciales incorrectas",
                )

            if usuario.disabled:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cuenta de usuario desactivada",
                )

            access_token = create_access_token(
                {"sub": str(usuario.id)}
            )

            return access_token