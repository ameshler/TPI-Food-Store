import { useForm } from '@tanstack/react-form'

import type { Producto } from '../types/producto'

export interface StockProductoValues {
  stock: number
  disponible: boolean
}

interface StockProductoFormProps {
  producto: Producto
  submitting: boolean
  onSubmit: (values: StockProductoValues) => Promise<void>
  onCancel: () => void
}

export function StockProductoForm({
  producto,
  submitting,
  onSubmit,
  onCancel,
}: StockProductoFormProps) {
  const form = useForm({
    defaultValues: {
      stock: producto.stock,
      disponible: producto.disponible,
    },

    onSubmit: async ({ value }) => {
      await onSubmit(value)
    },
  })

  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <p className="text-sm text-slate-600">
        Producto: <strong>{producto.nombre}</strong>
      </p>

      <form.Field
        name="stock"
        validators={{
          onSubmit: ({ value }) =>
            Number.isInteger(value) && value >= 0
              ? undefined
              : 'El stock debe ser un entero mayor o igual a cero',
        }}
      >
        {(field) => (
          <div>
            <label
              htmlFor={field.name}
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Cantidad disponible
            </label>

            <input
              id={field.name}
              type="number"
              min="0"
              step="1"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) =>
                field.handleChange(
                  event.target.value === ''
                    ? 0
                    : Number(event.target.value),
                )
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />

            {field.state.meta.errors.map((message, index) => (
              <p key={index} className="mt-1 text-sm text-red-600">
                {String(message)}
              </p>
            ))}
          </div>
        )}
      </form.Field>

      <form.Field name="disponible">
        {(field) => (
          <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={field.state.value}
              onChange={(event) =>
                field.handleChange(event.target.checked)
              }
              className="h-4 w-4 accent-orange-600"
            />
            Producto disponible para la venta
          </label>
        )}
      </form.Field>

      <form.Subscribe selector={(state) => [state.isSubmitting]}>
        {([isSubmitting]) => (
          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              disabled={submitting || isSubmitting}
              onClick={onCancel}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={submitting || isSubmitting}
              className="rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
            >
              {submitting || isSubmitting
                ? 'Actualizando...'
                : 'Actualizar inventario'}
            </button>
          </div>
        )}
      </form.Subscribe>
    </form>
  )
}