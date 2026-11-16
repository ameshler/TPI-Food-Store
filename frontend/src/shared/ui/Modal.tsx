import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

import type { ReactNode } from 'react'

type ModalSize = 'md' | 'lg' | 'xl'

interface ModalProps {
  title: string
  description?: string
  children: ReactNode
  onClose: () => void
  size?: ModalSize
}

const sizeClasses: Record<ModalSize, string> = {
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export function Modal({
  title,
  description,
  children,
  onClose,
  size = 'lg',
}: ModalProps) {
  const titleId = useId()
  const descriptionId = useId()

  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null

    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const getFocusableElements = () => {
      const selectors = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(',')

      return Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(selectors) ?? [],
      ).filter((element) => element.getAttribute('aria-hidden') !== 'true')
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const focusableElements = getFocusableElements()

      if (focusableElements.length === 0) {
        event.preventDefault()
        dialogRef.current?.focus()
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (
        !event.shiftKey &&
        document.activeElement === lastElement
      ) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)

      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [])

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCloseRef.current()
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={`flex max-h-[90vh] w-full ${sizeClasses[size]} flex-col overflow-hidden rounded-2xl bg-white shadow-2xl`}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <h2
              id={titleId}
              className="text-xl font-semibold text-slate-900"
            >
              {title}
            </h2>

            {description && (
              <p
                id={descriptionId}
                className="mt-1 text-sm text-slate-500"
              >
                {description}
              </p>
            )}
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            ×
          </button>
        </header>

        <div className="min-h-0 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}