from datetime import datetime
from typing import Literal

from sqlmodel import SQLModel


class UserPublic(SQLModel):
    """
    Datos de usuario que pueden exponerse en las respuestas de la API.

    No incluye hashed_password ni la contraseña original.
    """

    id: int
    username: str
    full_name: str
    email: str
    role: Literal["user", "admin"]
    disabled: bool
    created_at: datetime

    model_config = {
        "from_attributes": True
    }