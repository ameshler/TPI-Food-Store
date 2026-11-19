
import { create } from 'zustand'

interface CartNotification {
  title: string
  message: string
}

interface FeedbackState {
  notification: CartNotification | null

  notifyProductAdded: (
    productName: string,
    alreadyInCart: boolean,
  ) => void

  dismissNotification: () => void
}

export const useFeedbackStore = create<FeedbackState>((set) => ({
  notification: null,

  notifyProductAdded: (productName, alreadyInCart) => {
    set({
      notification: {
        title: alreadyInCart
          ? 'Cantidad actualizada'
          : '¡Producto agregado al carrito!',

        message: alreadyInCart
          ? `Se agregó una unidad más de ${productName}.`
          : `${productName} se agregó correctamente.`,
      },
    })
  },

  dismissNotification: () => {
    set({ notification: null })
  },
}))
