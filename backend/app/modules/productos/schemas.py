from pydantic import model_validator
from sqlmodel import Field, SQLModel

from app.modules.categorias.schemas import CategoriaRead


class ProductoCreate(SQLModel):
    """
    Datos necesarios para crear un producto.
    """

    nombre: str
    descripcion: str | None = None
    precio_base: float = Field(ge=0)
    imagen_url: str | None = None
    stock: int = Field(default=0, ge=0)
    disponible: bool = True
    categoria_id: int


class ProductoUpdate(SQLModel):
    """
    Datos para actualizar parcialmente un producto.

    Los campos omitidos conservan su valor actual.
    """

    nombre: str | None = None
    descripcion: str | None = None
    precio_base: float | None = Field(default=None, ge=0)
    imagen_url: str | None = None
    stock: int | None = Field(default=None, ge=0)
    disponible: bool | None = None
    categoria_id: int | None = None

    @model_validator(mode="after")
    def validar_campos_obligatorios(self):
        """
        Impide enviar null en campos que son obligatorios
        en el modelo Producto.
        """

        campos_no_nulos = (
            "nombre",
            "precio_base",
            "stock",
            "disponible",
            "categoria_id",
        )

        for campo in campos_no_nulos:
            if (
                campo in self.model_fields_set
                and getattr(self, campo) is None
            ):
                raise ValueError(
                    f"El campo '{campo}' no puede ser null"
                )

        return self


class ProductoStockUpdate(SQLModel):
    """
    Datos para actualizar el stock y disponibilidad.
    """

    stock: int = Field(ge=0)
    disponible: bool


class ProductoRead(SQLModel):
    """
    Datos de lectura de un producto.
    Incluye su categoría relacionada.
    """

    id: int
    nombre: str
    descripcion: str | None
    precio_base: float
    imagen_url: str | None
    stock: int
    disponible: bool
    activo: bool
    categoria_id: int
    categoria: CategoriaRead

    model_config = {
        "from_attributes": True
    }


class ProductosPaginados(SQLModel):
    """
    Respuesta de los listados paginados de productos.
    """

    total: int
    items: list[ProductoRead]