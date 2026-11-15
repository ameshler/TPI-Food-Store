import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem {
  producto_id: number
  nombre: string
  precio_unitario: number
  cantidad: number
}

interface CartState {
  items: CartItem[]

  agregar: (producto: {
    id: number
    nombre: string
    precio_base: number
  }) => void

  quitar: (producto_id: number) => void

  cambiarCantidad: (
    producto_id: number,
    cantidad: number,
  ) => void

  vaciar: () => void

  total: () => number
}

type PersistedCartState = Pick<CartState, 'items'>

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (producto) => {
        set((state) => {
          const existente = state.items.find(
            (item) => item.producto_id === producto.id,
          )

          if (existente) {
            return {
              items: state.items.map((item) =>
                item.producto_id === producto.id
                  ? { ...item, cantidad: item.cantidad + 1 }
                  : item,
              ),
            }
          }

          return {
            items: [
              ...state.items,
              {
                producto_id: producto.id,
                nombre: producto.nombre,
                precio_unitario: producto.precio_base,
                cantidad: 1,
              },
            ],
          }
        })
      },

      quitar: (producto_id) => {
        set((state) => ({
          items: state.items.filter(
            (item) => item.producto_id !== producto_id,
          ),
        }))
      },

      cambiarCantidad: (producto_id, cantidad) => {
        if (cantidad < 1) {
          return
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.producto_id === producto_id
              ? { ...item, cantidad }
              : item,
          ),
        }))
      },

      vaciar: () => {
        set({ items: [] })
      },

      total: () => {
        return get().items.reduce(
          (acumulado, item) =>
            acumulado + item.precio_unitario * item.cantidad,
          0,
        )
      },
    }),
    {
      name: 'food-store-cart',
      partialize: (state): PersistedCartState => ({
        items: state.items,
      }),
    },
  ),
)