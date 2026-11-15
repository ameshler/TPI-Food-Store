from collections.abc import Generator, Sequence

from fastapi import Cookie, Depends, HTTPException, status
from jose import JWTError
from sqlmodel import Session

from app.core.database import session_factory
from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario


def get_db_session() -> Generator[Session, None, None]:
    """
    Abre una sesión de base de datos para la petición
    y la cierra cuando termina.
    """
    session = session_factory()

    try:
        yield session
    finally:
        session.close()


def get_current_user(
    access_token: str | None = Cookie(default=None),
    session: Session = Depends(get_db_session),
) -> Usuario:
    """
    Obtiene el usuario autenticado a partir de la cookie JWT.

    Si la cookie falta, el token es inválido o el usuario
    no existe, responde HTTP 401.
    """

    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No autenticado",
        )

    try:
        payload = decode_access_token(access_token)

        # El campo sub contendrá el ID del usuario como texto.
        subject = payload.get("sub")

        if not isinstance(subject, str):
            raise ValueError("Identificador de usuario inválido")

        user_id = int(subject)

    except (JWTError, ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No se pudo validar el token",
        )

    user = session.get(Usuario, user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado",
        )

    return user


def get_current_active_user(
    current_user: Usuario = Depends(get_current_user),
) -> Usuario:
    """
    Verifica que el usuario autenticado no esté desactivado.
    """

    if current_user.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cuenta de usuario desactivada",
        )

    return current_user


def require_role(allowed_roles: Sequence[str]):
    """
    Genera una dependencia que permite el acceso
    únicamente a los roles indicados.
    """

    def role_checker(
        current_user: Usuario = Depends(get_current_active_user),
    ) -> Usuario:

        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos para realizar esta acción",
            )

        return current_user

    return role_checker