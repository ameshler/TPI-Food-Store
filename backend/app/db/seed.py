from datetime import datetime, timezone

from sqlmodel import select

from app.core.database import create_all_tables, session_factory
from app.core.security import hash_password
from app.modules.usuarios.models import Usuario
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.pedidos.models import Pedido, DetallePedido


ADMIN_USERNAME = "admin"
ADMIN_EMAIL = "admin@foodstore.local"
ADMIN_PASSWORD = "Admin1234!"


def obtener_o_crear_admin(session) -> Usuario:
    """Obtiene el administrador inicial o lo crea si no existe."""

    admin = session.exec(
        select(Usuario).where(Usuario.username == ADMIN_USERNAME)
    ).first()

    if admin is not None:
        if admin.role != "admin":
            raise RuntimeError(
                "El usuario 'admin' ya existe, pero no tiene rol admin."
            )
        return admin

    email_existente = session.exec(
        select(Usuario).where(Usuario.email == ADMIN_EMAIL)
    ).first()

    if email_existente is not None:
        raise RuntimeError(
            f"El email {ADMIN_EMAIL} ya pertenece a otro usuario."
        )

    admin = Usuario(
        username=ADMIN_USERNAME,
        full_name="Administrador",
        email=ADMIN_EMAIL,
        hashed_password=hash_password(ADMIN_PASSWORD),
        role="admin",
        disabled=False,
        created_at=datetime.now(timezone.utc),
    )

    session.add(admin)
    session.flush()

    return admin


def obtener_o_crear_categoria(
    session,
    nombre: str,
    descripcion: str,
) -> Categoria:
    """Obtiene una categoría por nombre o la crea."""

    categoria = session.exec(
        select(Categoria).where(Categoria.nombre == nombre)
    ).first()

    if categoria is None:
        categoria = Categoria(
            nombre=nombre,
            descripcion=descripcion,
            activo=True,
        )

        session.add(categoria)
        session.flush()

    return categoria


def obtener_o_crear_producto(
    session,
    categoria: Categoria,
    nombre: str,
    descripcion: str,
    precio_base: float,
    stock: int,
) -> Producto:
    """
    Busca un producto por nombre y categoría.
    Si no existe, lo crea con stock inicial.
    """

    producto = session.exec(
        select(Producto).where(
            Producto.nombre == nombre,
            Producto.categoria_id == categoria.id,
        )
    ).first()

    if producto is None:
        producto = Producto(
            categoria_id=categoria.id,
            nombre=nombre,
            descripcion=descripcion,
            precio_base=precio_base,
            imagen_url=None,
            stock=stock,
            disponible=True,
            activo=True,
        )

        session.add(producto)
        session.flush()

    return producto


def seed() -> None:
    """Carga los datos iniciales de forma idempotente."""

    # Garantiza que existan las tablas antes de insertar información.
    create_all_tables()

    with session_factory() as session:
        # Todas las operaciones del seed pertenecen a una transacción.
        with session.begin():

            # 1. Administrador inicial.
            admin = obtener_o_crear_admin(session)

            # 2. Categorías.
            bebidas = obtener_o_crear_categoria(
                session,
                "Bebidas",
                "Bebidas frías y refrescos.",
            )

            principales = obtener_o_crear_categoria(
                session,
                "Platos principales",
                "Comidas principales.",
            )

            postres = obtener_o_crear_categoria(
                session,
                "Postres",
                "Postres y opciones dulces.",
            )

            # 3. Productos.
            productos = [
                (
                    bebidas,
                    "Agua mineral 500 ml",
                    "Agua mineral sin gas.",
                    1200,
                    30,
                ),
                (
                    bebidas,
                    "Gaseosa cola 500 ml",
                    "Gaseosa sabor cola.",
                    1800,
                    25,
                ),
                (
                    bebidas,
                    "Jugo de naranja 1 L",
                    "Jugo de naranja.",
                    2300,
                    15,
                ),
                (
                    principales,
                    "Hamburguesa completa",
                    "Hamburguesa con carne, queso y vegetales.",
                    7500,
                    12,
                ),
                (
                    principales,
                    "Pizza muzzarella",
                    "Pizza de muzzarella.",
                    8500,
                    10,
                ),
                (
                    principales,
                    "Empanadas por docena",
                    "Docena de empanadas surtidas.",
                    9500,
                    8,
                ),
                (
                    postres,
                    "Flan casero",
                    "Flan casero con caramelo.",
                    2800,
                    14,
                ),
                (
                    postres,
                    "Brownie de chocolate",
                    "Brownie de chocolate.",
                    3200,
                    10,
                ),
            ]

            for (
                categoria,
                nombre,
                descripcion,
                precio,
                stock,
            ) in productos:
                obtener_o_crear_producto(
                    session=session,
                    categoria=categoria,
                    nombre=nombre,
                    descripcion=descripcion,
                    precio_base=precio,
                    stock=stock,
                )

    print("Seed ejecutado correctamente.")
    print(f"Administrador disponible: {admin.username}")
    print("Categorías verificadas: 3")
    print("Productos verificados: 8")


if __name__ == "__main__":
    seed()