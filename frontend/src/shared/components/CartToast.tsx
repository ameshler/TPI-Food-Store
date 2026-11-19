
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { useFeedbackStore } from '../../store/feedbackStore'

export function CartToast() {
  const navigate = useNavigate()

  const notification = useFeedbackStore(
    (state) => state.notification,
  )

  const dismissNotification = useFeedbackStore(
    (state) => state.dismissNotification,
  )

  useEffect(() => {
    if (!notification) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      dismissNotification()
    }, 4000)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [notification, dismissNotification])

  if (!notification) {
    return null
  }

  const handleViewCart = () => {
    dismissNotification()
    navigate('/carrito')
  }

  return (
    <div
      className="fixed bottom-6 right-6 z-50 w-[calc(100%-3rem)] max-w-sm"
      role="status"
      aria-live="polite"
    >
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-lg font-bold text-green-700">
            ✓
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-900">
              {notification.title}
            </p>

            <p className="mt-1 text-sm text-slate-600">
              {notification.message}
            </p>

            <button
              type="button"
              onClick={handleViewCart}
              className="mt-3 text-sm font-semibold text-orange-600 transition hover:text-orange-700"
            >
              Ver carrito →
            </button>
          </div>

          <button
            type="button"
            onClick={dismissNotification}
            aria-label="Cerrar notificación"
            className="rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}
