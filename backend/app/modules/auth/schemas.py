from sqlmodel import Field, SQLModel


class UserCreate(SQLModel):
    """
    Datos necesarios para registrar un usuario.

    El rol no se recibe desde el cliente:
    el registro público siempre crea usuarios con rol 'user'.
    """

    username: str
    full_name: str
    email: str
    password: str = Field(min_length=8)